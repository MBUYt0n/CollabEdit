const express = require("express");
const http = require("http");
const path = require("path");
const mysql = require("mysql2/promise");
const { setupWebSockets } = require("./websockets"); // Import WebSockets module

const app = express();
app.use(express.json());

const server = http.createServer(app);

const pool = mysql.createPool({
	host: "mariadb",
	user: "collabuser",
	password: "collabpassword",
	database: "collabedit",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

const WebSocket = require("ws");
const { Kafka } = require("kafkajs");
const { createClient } = require("redis");

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

	const wss = new WebSocket.Server({ server });

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
				clientId = parsedMessage.id;
				connections.set(clientId, socket);
				console.log(`Client registered: ${clientId}`);
			} else if (parsedMessage.type === "code-update") {
				console.log(`Update from ${clientId}:`, parsedMessage.changes);

				await redisClient.set(
					`code:${clientId}`,
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
})();

app.get("/api/documents", async (req, res) => {
	try {
		const [rows] = await pool.query("SELECT * FROM documents");
		res.json(rows);
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).json({ error: "Database error" });
	}
});

app.post("/api/documents", async (req, res) => {
	const { title, content } = req.body;
	try {
		await pool.query(
			"INSERT INTO documents (title, content) VALUES (?, ?)",
			[title, content]
		);
		res.status(201).json({ message: "Document created" });
	} catch (error) {
		console.error("Error creating document:", error);
		res.status(500).json({ error: "Database error" });
	}
});

const PORT = 8080;
server.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
