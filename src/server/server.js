const WebSocket = require("ws");
const { Kafka } = require("kafkajs");
const { createClient } = require("redis");

const kafka = new Kafka({
	clientId: "code-editor",
	brokers: ["kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "editor-group" });
const redisClient = createClient({
	url: "redis://redis:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
	await redisClient.connect();
	await producer.connect();
	await consumer.connect();
	await consumer.subscribe({ topic: "code-updates", fromBeginning: true });

	connections = [];
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
		connections.push(socket);
		console.log("Client connected");

		socket.on("message", async (message) => {
			const parsedMessage = JSON.parse(message);

			if (parsedMessage.type === "register") {
				socket.clientId = parsedMessage.id;
				console.log(`Client registered with ID: ${socket.clientId}`);
			} else if (parsedMessage.type === "code-update") {
				console.log(
					"Received changes from",
					socket.clientId,
					":",
					parsedMessage
				);

				await redisClient.set(
					`code:${socket.clientId}T${Date.now()}`,
					JSON.stringify({
						change: parsedMessage.changes,
					})
				);

				await producer.send({
					topic: "code-updates",
					messages: [
						{
							value: JSON.stringify({
								id: socket.clientId,
								change: parsedMessage,
							}),
						},
					],
				});
			} else if (parsedMessage.type === "cursor-update") {
				await producer.send({
					topic: "code-updates",
					messages: [
						{
							value: JSON.stringify({
								id: socket.clientId,
								cursor: parsedMessage,
							}),
						},
					],
				});
			}
		});

		socket.on("close", () => console.log("Client disconnected"));
	});

	console.log("WebSocket Server running on ws://localhost:8080");
})();
