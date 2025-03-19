document.addEventListener("DOMContentLoaded", () => {
	const createDocumentButton = document.getElementById("create-document");
	const fileListContainer = document.getElementById("file-list-container");
	const notification = document.getElementById("notification");
	const token = sessionStorage.getItem("token");
	if (!token) {
		console.error("No token found, redirecting to login page");
		window.location.href = "/";
	}

	const showNotification = (message) => {
		notification.textContent = message;
		notification.style.display = "block";
		setTimeout(() => {
			notification.style.display = "none";
		}, 3000);
	};

	createDocumentButton.addEventListener("click", async () => {
		const title = prompt("Enter document title:");
		if (title) {
			try {
				const response = await fetch(
					"http://localhost:3000/documents/new",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem(
								"token"
							)}`,
						},
						body: JSON.stringify({ title }),
					}
				);
				if (response.ok) {
					showNotification("Document created successfully");
					const res = await response.json();
					const { documentId } = res;
					shareDocument(documentId);
					fetchDocuments();
				} else {
					showNotification("Failed to create document");
				}
			} catch (error) {
				console.error("Error creating document:", error);
				showNotification("Failed to create document");
			}
		}
	});

	const fetchDocuments = async () => {
		try {
			const response = await fetch(
				"http://localhost:3000/documents/fetch",
				{
					headers: {
						Authorization: `Bearer ${sessionStorage.getItem(
							"token"
						)}`,
					},
				}
			);
			if (response.status === 200) {
				let documents = await response.json();
				fileListContainer.innerHTML = "";
				if (!Array.isArray(documents)) {
					documents = [documents];
				}
				console.log(documents);
				documents.forEach((doc) => {
					const dropdown = document.createElement("div");
					dropdown.className = "dropdown";

					const docButton = document.createElement("button");
					docButton.textContent = doc.title;
					dropdown.appendChild(docButton);

					const dropdownContent = document.createElement("div");
					dropdownContent.className = "dropdown-content";

					const openButton = document.createElement("button");
					openButton.textContent = "Open";
					openButton.addEventListener("click", () => {
						showNotification(`Document Content: ${doc.content}`);
					});
					dropdownContent.appendChild(openButton);

					const shareButton = document.createElement("button");
					shareButton.textContent = "Share";
					shareButton.addEventListener("click", () => {
						const sharedUserId = prompt(
							"Enter user ID to share with:"
						);
						if (sharedUserId) {
							shareDocument(doc.id, sharedUserId);
						}
					});
					dropdownContent.appendChild(shareButton);

					dropdown.appendChild(dropdownContent);
					fileListContainer.appendChild(dropdown);
				});
			} else if (response.status === 404) {
				fileListContainer.innerHTML = "<p>No documents found</p>";
			} else {
				showNotification("Failed to fetch documents");
			}
		} catch (error) {
			console.error("Error fetching documents:", error);
			showNotification("Failed to fetch documents");
		}
	};

	const shareDocument = async (documentId, sharedUserId = null) => {
		try {
			const response = await fetch(
				"http://localhost:3000/documents/share",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify({ documentId, sharedUserId }),
				}
			);
			if (response.ok) {
				showNotification("Document shared successfully");
			} else {
				showNotification("Failed to share document");
			}
		} catch (error) {
			console.error("Error sharing document:", error);
			showNotification("Failed to share document");
		}
	};

	fetchDocuments();
});
