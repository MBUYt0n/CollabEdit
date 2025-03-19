const WebSocket = require("ws");
const { Kafka } = require("kafkajs");
const { createClient } = require("redis");
const mariadb = require("mariadb");
const jwt = require("jsonwebtoken");
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
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
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
				token = parsedMessage.token;
				try {
					const { userId } = jwt.verify(token, JWT_SECRET);
					console.log(`Client connected: ${userId}`);
					clientId = userId;
					connections.set(clientId, socket);
					console.log(`Client registered: ${clientId}`);
				}
				catch (error) {
					console.error("Error verifying JWT:", error);
					socket.close();
				}
			} else if (parsedMessage.type === "code-update") {
				console.log(`Update from ${clientId}:`, parsedMessage.changes);

				await redisClient.hSet(
					`document:${parsedMessage.documentId}`,
					`code:${clientId}T${Date.now()}`,
					JSON.stringify(parsedMessage.changes)
				);

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
			}
		});

		socket.on("close", () => {
			if (clientId) connections.delete(clientId);
			console.log(`Client disconnected: ${clientId}`);
		});
	});

	return wss;
})();

async function commitDocument(documentId) {
	const documentKey = `document:${documentId}`;
	const documentContent = await redisClient.hGetAll(documentKey);
	const [result] = await pool.query(
		"UPDATE documents SET content = ? WHERE id = ?",
		[content, documentId]
	);

	return result.affectedRows;
}
