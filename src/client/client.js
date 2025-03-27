document.addEventListener("DOMContentLoaded", () => {
	const commitButton = document.getElementById("commit");
	const base_url = `${window.location.protocol}//${window.location.hostname}:3000`;
	const socket = new WebSocket(`ws://${window.location.hostname}:8080`);
	const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		mode: "javascript",
		lineNumbers: true,
		matchBrackets: true,
		autoCloseBrackets: true,
	});
	let prevCode = editor.getValue().split("\n");
	const token = sessionStorage.getItem("token");

	const cursors = {};
	const colors = {};
	const colorPalette = ["red", "blue", "green", "purple", "orange", "pink"];

	const urlParams = new URLSearchParams(window.location.search);
	const documentId = urlParams.get("docId");

	if (!documentId) {
		console.error("No documentId found in URL parameters");
		return;
	}
	console.log("Document ID:", documentId);

	const fetchDocuments = async (documentId) => {
		try {
			const response = await fetch(
				`${base_url}/documents/docs/${documentId}`,
				{
					headers: {
						Authorization: `Bearer ${sessionStorage.getItem(
							"token"
						)}`,
					},
				}
			);
			if (response.ok) {
				const content = await response.json();
				const documentContent = content.content || "";
				editor.setValue(documentContent);
				prevCode = editor.getValue().split("\n");
			} else {
				console.error("Failed to fetch document:", response.statusText);
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
		}
	};

	const showNotification = (message) => {
		const notification = document.getElementById("notification");
		notification.textContent = "Document saved";
		notification.style.display = "block";
		setTimeout(() => {
			notification.style.display = "none";
		}, 3000);
	};

	socket.onopen = () => {
		socket.send(JSON.stringify({ type: "register", token }));
		console.log("Connected to WebSocket server");
	};

	socket.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (message.change) {
			applyChanges(message.change);
		} else if (message.cursor) {
			showCursor(message);
		} else if (message.type === "commit-notification") {
			showNotification(message.message);
		}
	};

	socket.onclose = () => {
		console.log("Connection closed");
	};

	function sendCode() {
		const currentCode = editor.getValue().split("\n");
		const changes = [];
		len = Math.max(prevCode.length, currentCode.length);
		for (let i = 0; i < len; i++) {
			if (currentCode[i] !== prevCode[i]) {
				changes.push({ line: i, text: currentCode[i], type: "insert" });
			} else if (prevCode[i] === undefined) {
				changes.push({ line: i, text: "", type: "insert" });
			} else if (currentCode[i] === undefined) {
				changes.push({ line: i, text: "", type: "delete" });
			}
		}

		console.log(changes);
		if (changes.length > 0) {
			socket.send(
				JSON.stringify({ type: "code-update", documentId, changes })
			);
			prevCode = currentCode;
		}
	}

	function applyChanges(changes) {
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
	}

	function changeLanguage() {
		const language = document.getElementById("language").value;
		editor.setOption("mode", language);
	}

	function commitDocument() {
		const content = editor.getValue();
		socket.send(
			JSON.stringify({
				type: "commit-document",
				documentId,
				content,
			})
		);
	}

	commitButton.addEventListener("click", commitDocument);

	// function sendCursor() {
	// 	const cursor = editor.getCursor();
	// 	const id = localStorage.getItem("client_id");
	// 	socket.send(JSON.stringify({ type: "cursor-update", id, cursor }));
	// }

	// function showCursor(cursorData) {
	// 	const id = cursorData.id;
	// 	const cursor = cursorData.cursor;

	// 	if (id === localStorage.getItem("client_id")) return;

	// 	if (!cursors[id]) {
	// 		if (!colors[id]) {
	// 			colors[id] =
	// 				colorPalette[
	// 					Object.keys(colors).length % colorPalette.length
	// 				];
	// 		}

	// 		const cursorElement = document.createElement("div");
	// 		cursorElement.classList.add("remote-cursor");
	// 		cursorElement.style.width = "2px";
	// 		cursorElement.style.height = "1em";
	// 		cursorElement.style.backgroundColor = colors[id];
	// 		cursorElement.style.position = "absolute";
	// 		cursorElement.style.zIndex = "10";
	// 		cursorElement.style.pointerEvents = "none";

	// 		cursors[id] = cursorElement;
	// 		editor.getWrapperElement().appendChild(cursorElement);
	// 	}

	// 	const cursorElement = cursors[id];
	// 	const cursorPos = editor.charCoords(
	// 		{ line: cursor.line, ch: cursor.ch },
	// 		"local"
	// 	);
	// 	const gutterWidth = editor.getGutterElement().offsetWidth;

	// 	cursorElement.style.left = `${cursorPos.left + gutterWidth}px`;
	// 	cursorElement.style.top = `${cursorPos.top}px`;
	// }

	setInterval(sendCode, 100);
	// setInterval(sendCursor, 1000);

	fetchDocuments(documentId);
});
