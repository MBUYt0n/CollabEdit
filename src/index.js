const fileListContainer = document.getElementById("file-list-container");

const files = ["file1.js", "file2.py", "file3.html"];

function populateFileList() {
	fileListContainer.innerHTML = "";
	files.forEach((file) => {
		const button = document.createElement("button");
		button.textContent = file;
		button.onclick = () => openFile(file);
		fileListContainer.appendChild(button);
	});
}

// Open an existing file
function openFile(fileName) {
	window.location.href = `editor.html?file=${encodeURIComponent(fileName)}`;
}

function createNewFile() {
	const fileName = prompt("Enter the name of the new file:");
	if (fileName) {
		files.push(fileName);
		populateFileList();
		openFile(fileName);
	}
}

populateFileList();
