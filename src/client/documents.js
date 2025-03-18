document.addEventListener("DOMContentLoaded", () => {
	const createDocumentButton = document.getElementById("create-document");
	const fileListContainer = document.getElementById("file-list-container");
	const token = sessionStorage.getItem("token");
	if (!token) {
		console.error("No token found, redirecting to login page");
		window.location.href = "/";
	}
	createDocumentButton.addEventListener("click", async () => {
		const title = prompt("Enter document title:");
		const content = prompt("Enter document content:");
		if (title && content) {
			try {
				const response = await fetch(
					"http://localhost:3000/documents",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ title, content }),
					}
				);
				if (response.ok) {
					alert("Document created successfully");
					fetchDocuments();
				} else {
					alert("Failed to create document");
				}
			} catch (error) {
				console.error("Error creating document:", error);
				alert("Failed to create document");
			}
		}
	});

	const fetchDocuments = async () => {
		try {
			const response = await fetch("http://localhost:3000/documents", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (response.ok) {
				const documents = await response.json();
				fileListContainer.innerHTML = "";
				documents.forEach((doc) => {
					const docButton = document.createElement("button");
					docButton.textContent = doc.title;
					docButton.addEventListener("click", () => {
						alert(`Document Content: ${doc.content}`);
					});
					fileListContainer.appendChild(docButton);
				});
			} else {
				alert("Failed to fetch documents");
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
			alert("Failed to fetch documents");
		}
	};

	fetchDocuments();
});
