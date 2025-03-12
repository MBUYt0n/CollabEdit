const WebSocket = require("ws");
const readline = require("readline");

let rl; 

function createReadlineInterface() {
	if (!rl || rl.closed) {
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}
}

function connectWebSocket() {
	const socket = new WebSocket("ws://server:8080");

	socket.onopen = () => {
		console.log("Connected to server");
		createReadlineInterface();
		askForInput(socket);
	};

	socket.onmessage = (event) => {
		console.log(" Message received:", event.data);
	};

	socket.onclose = () => {
		console.log("Connection closed, reconnecting...");
		setTimeout(connectWebSocket, 3000);
	};

	socket.onerror = (error) => {
		console.error("WebSocket error:", error);
	};
}

function askForInput(socket) {
	createReadlineInterface(); 

	rl.question("✏️  Enter message: ", (message) => {
		if (message.toLowerCase() === "exit") {
			console.log("👋 Closing connection...");
			socket.close();
			rl.close();
			return;
		}

		socket.send(message);
		
		askForInput(socket);
	});
}

connectWebSocket();
