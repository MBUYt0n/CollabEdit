const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
	console.log(`HTTP server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ host : "0.0.0.0", port: 8080 });

wss.on("connection", (socket) => {
	console.log("Client connected");

	socket.on("message", (message) => {
		console.log("Received:", message);

		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(`${message}`);
			}
		});
	});
	socket.on("close", () => console.log("Client disconnected"));
});

console.log("WebSocket running on ws://localhost:8080");
