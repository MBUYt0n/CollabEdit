const button = document.getElementById("create-new-file");

button.addEventListener("click", async () => {
	fetch("/api/editor", { method: "GET" });
});
