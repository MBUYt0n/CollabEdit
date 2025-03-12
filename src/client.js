const WebSocket = require("ws"); 

function connectWebSocket() {
	const socket = new WebSocket("ws://server:8080");

	socket.onopen = () => console.log("Connected to server");
	socket.onmessage = (event) => console.log("Message received:", event.data);
	socket.onclose = () => {
		console.log("Connection closed, reconnecting...");
		setTimeout(connectWebSocket, 3000);
	};
	socket.onerror = (error) => console.error("WebSocket error:", error);
}

connectWebSocket();
