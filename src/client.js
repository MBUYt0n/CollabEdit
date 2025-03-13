const socket = new WebSocket("ws://localhost:8080");
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
	mode: "javascript",
	lineNumbers: true,
	matchBrackets: true,
	autoCloseBrackets: true,
});
var prevCode = editor.getValue().split("\n");

function changeLanguage() {
	const language = document.getElementById("language").value;
	editor.setOption("mode", language);
}

socket.onopen = () => {
	console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
	const changes = JSON.parse(event.data);
	const doc = editor.getDoc();

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

	prevCode = editor.getValue().split("\n");
};

socket.onclose = () => {
	console.log("Connection closed");
};

function sendCode() {
	const currentCode = editor.getValue().split("\n");
	const changes = [];

	for (let i = 0; i < currentCode.length; i++) {
		if (currentCode[i] !== prevCode[i]) {
			changes.push({ line: i, text: currentCode[i] });
		}
	}

	if (changes.length > 0) {
		socket.send(JSON.stringify(changes));
		prevCode = currentCode;
	}
}
