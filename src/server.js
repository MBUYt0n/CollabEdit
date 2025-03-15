const WebSocket = require("ws");
const { Kafka } = require("kafkajs");


const kafka = new Kafka({
	clientId: "code-editor",
	brokers: ["kafka:9092"], 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "editor-group" });

(async () => {
	await producer.connect();
	await consumer.connect();
	await consumer.subscribe({ topic: "code-updates", fromBeginning: true });

	const wss = new WebSocket.Server({ port: 8080 });

	wss.on("connection", (socket) => {
		console.log("Client connected");

		socket.on("message", async (message) => {
			const changes = JSON.parse(message);
			console.log("Received changes:", changes);

			await producer.send({
				topic: "code-updates",
				messages: [{ value: JSON.stringify(changes) }],
			});
		});

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

		socket.on("close", () => console.log("Client disconnected"));
	});

	console.log("WebSocket Server running on ws://localhost:8080");
})();
