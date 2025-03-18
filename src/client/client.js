const socket = new WebSocket("ws://localhost:8080");
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
	mode: "javascript",
	lineNumbers: true,
	matchBrackets: true,
	autoCloseBrackets: true,
});
var prevCode = editor.getValue().split("\n");
const cursors = {};
const colors = {};
const colorPalette = ["red", "blue", "green", "purple", "orange", "pink"];

socket.onopen = () => {
	let id = localStorage.getItem("client_id");

	if (!id) {
		id = Math.random().toString(36).substr(2, 9);
		localStorage.setItem("client_id", id);
	}

	socket.send(JSON.stringify({ type: "register", id }));
	console.log("Connected to WebSocket server with ID:", id);
};

socket.onmessage = (event) => {
	const message = JSON.parse(event.data);
	const id = localStorage.getItem("client_id");
	if (message.change) {
		applyChanges(message.change);
	} else if (message.cursor) {
		showCursor(message);
	}
};

socket.onclose = () => {
	console.log("Connection closed");
};

function sendCode() {
	const currentCode = editor.getValue().split("\n");
	const changes = [];
	const id = localStorage.getItem("client_id");
	for (let i = 0; i < currentCode.length; i++) {
		if (currentCode[i] !== prevCode[i]) {
			changes.push({ line: i, text: currentCode[i] });
		}
	}

	if (changes.length > 0) {
		socket.send(JSON.stringify({ type: "code-update", id, changes }));
		prevCode = currentCode;
	}
}

function applyChanges(changes) {
	const doc = editor.getDoc();
	const id = localStorage.getItem("client_id");
	if (changes.id !== id) {
		changes.forEach((change) => {
			let lineCount = doc.lineCount();

			while (lineCount <= change.line) {
				doc.replaceRange("\n", { line: lineCount, ch: 0 });
				lineCount++;
			}

			doc.replaceRange(
				change.text,
				{ line: change.line, ch: 0 },
				{ line: change.line, ch: doc.getLine(change.line).length }
			);
		});
	}

	prevCode = editor.getValue().split("\n");
}

function changeLanguage() {
	const language = document.getElementById("language").value;
	editor.setOption("mode", language);
}

function sendCursor() {
	const cursor = editor.getCursor();
	const id = localStorage.getItem("client_id");
	socket.send(JSON.stringify({ type: "cursor-update", id, cursor }));
}

function showCursor(cursorData) {
	const id = cursorData.id;
	const cursor = cursorData.cursor;
	if (id === localStorage.getItem("client_id")) return;
	console.log("Showing cursor", cursorData);

	if (!cursors[id]) {
		if (!colors[id]) {
			colors[id] =
				colorPalette[Object.keys(colors).length % colorPalette.length];
		}

		const cursorElement = document.createElement("div");
		cursorElement.classList.add("remote-cursor");
		cursorElement.style.width = "2px";
		cursorElement.style.height = "1em";
		cursorElement.style.backgroundColor = colors[id];
		cursorElement.style.position = "absolute";
		cursorElement.style.zIndex = "10";
		cursorElement.style.pointerEvents = "none";

		cursors[id] = cursorElement;
		editor.getWrapperElement().appendChild(cursorElement);
	}

	const cursorElement = cursors[id];

	const cursorPos = editor.charCoords(
		{ line: cursor.line, ch: cursor.ch },
		"local"
	);

	const gutterWidth = editor.getGutterElement().offsetWidth;

	cursorElement.style.left = `${cursorPos.left + gutterWidth}px`;
	cursorElement.style.top = `${cursorPos.top}px`;
}

editor.on("change", sendCode);
setInterval(sendCursor, 1000);
