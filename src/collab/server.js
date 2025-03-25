const WebSocket = require("ws");
const { Kafka } = require("kafkajs");
const { createClient } = require("redis");
const mariadb = require("mariadb");
const jwt = require("jsonwebtoken");
const Operation = require("./operation");
require("dotenv").config();

const { JWT_SECRET, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mariadb.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	connectionLimit: 10,
});

const kafka = new Kafka({ clientId: "code-editor", brokers: ["kafka:9092"] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "editor-group" });

const redisClient = createClient({ url: "redis://redis:6379" });
redisClient.on("error", (err) => console.error("Redis Error:", err));

const connections = new Map();
let docId = null;

(async () => {
	console.log("Initializing WebSockets...");

	await redisClient.connect();
	await producer.connect();
	await consumer.connect();
	await consumer.subscribe({ topic: "code-updates", fromBeginning: false });

	const wss = new WebSocket.Server({ port: 8080 });

	consumer.run({
		eachMessage: async ({ message }) => {
			const data = JSON.parse(message.value.toString());
			const senderId = data.id;
			wss.clients.forEach((client) => {
				if (
					client.readyState === WebSocket.OPEN &&
					client !== connections.get(senderId)
				) {
					client.send(JSON.stringify(data));
				}
			});
		},
	});

	wss.on("connection", (socket) => {
		let clientId = null;

		socket.on("message", async (message) => {
			const parsedMessage = JSON.parse(message);
			if (parsedMessage.type === "register") {
				const token = parsedMessage.token;
				try {
					const { userId } = jwt.verify(token, JWT_SECRET);
					console.log(`Client connected: ${userId}`);
					clientId = userId;
					connections.set(clientId, socket);
					console.log(`Client registered: ${clientId}`);
				} catch (error) {
					console.error("Error verifying JWT:", error);
					socket.close();
				}
			} else if (parsedMessage.type === "code-update") {
				console.log(`Update from ${clientId}:`, parsedMessage.changes);

				const { documentId, changes } = parsedMessage;

				for (const change of changes) {
					const { line, position, text, type } = change;
					const operation = new Operation(type, line, position, text);

					const existingOps = await redisClient.lRange(
						`document:${documentId}:ops`,
						0,
						-1
					);
					let transformedOp = operation;

					for (const existingOpStr of existingOps) {
						const existingOp = JSON.parse(existingOpStr);
						[transformedOp] = Operation.transform(
							transformedOp,
							existingOp
						);
					}

					if (transformedOp.type === "delete") {
						await redisClient.hDel(
							`document:${documentId}`,
							`line:${transformedOp.line}`
						);
					} else {
						await redisClient.hSet(
							`document:${documentId}`,
							`line:${transformedOp.line}`,
							JSON.stringify({
								clientId,
								text: transformedOp.text,
							})
						);
					}

					await redisClient.rPush(
						`document:${documentId}:ops`,
						JSON.stringify(transformedOp)
					);
				}

				if (!docId) docId = documentId;

				await producer.send({
					topic: "code-updates",
					messages: [
						{
							value: JSON.stringify({
								id: clientId,
								change: parsedMessage.changes,
							}),
						},
					],
				});
			} else if (parsedMessage.type === "commit-document") {
				await commitDocument(parsedMessage);
			}
		});

		socket.on("close", async () => {
			if (clientId) connections.delete(clientId);
			if (connections.size === 0) {
				await redisClient.del(`document:${docId}`);
				docId = null;
			}
			console.log(`Client disconnected: ${clientId}`);
		});
	});

	setInterval(async () => {
		await commitDocument({ documentId: docId });
	}, 60000);
	return wss;
})();

async function commitDocument(parsedMessage) {
	const { documentId } = parsedMessage;

	const lines = await redisClient.hGetAll(`document:${documentId}`);
	const content = [];

	for (const key in lines) {
		const lineData = JSON.parse(lines[key]);
		const lineNumber = parseInt(key.split(":")[1]);
		content[lineNumber] = lineData.text;
	}

	await pool.query("UPDATE documents SET content = ? WHERE id = ?", [
		content.join("\n"),
		documentId,
	]);
	console.log(`Document ${documentId} committed successfully`);

	connections.forEach((socket) => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(
				JSON.stringify({ type: "commit-notification", documentId })
			);
		}
	});
}
