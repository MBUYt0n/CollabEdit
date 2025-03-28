document.addEventListener("DOMContentLoaded", () => {
	const createDocumentButton = document.getElementById("create-document");
	const fileListContainer = document.getElementById("file-list-container");
	const notification = document.getElementById("notification");
	const token = sessionStorage.getItem("token");
	if (!token) {
		console.error("No token found, redirecting to login page");
		window.location.href = "/";
	}
	const base_url = `${window.location.protocol}//${window.location.hostname}:3000`;

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
				const response = await fetch(`${base_url}/documents/new`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem(
							"token"
						)}`,
					},
					body: JSON.stringify({ title }),
				});
				if (response.ok) {
					showNotification("Document created successfully");
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
			const response = await fetch(`${base_url}/documents/show`, {
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			if (response.status === 200) {
				let documents = await response.json();
				fileListContainer.innerHTML = "";
				if (!Array.isArray(documents)) {
					documents = [documents];
				}
				documents.forEach((doc) => {
					const dropdown = document.createElement("div");
					dropdown.className = "dropdown";

					const docButton = document.createElement("button");
					docButton.textContent = doc.title;
					dropdown.appendChild(docButton);

					const dropdownContent = document.createElement("div");
					dropdownContent.className = "dropdown-content";

					if (doc.role === "owner") {
						const openButton = document.createElement("button");
						openButton.textContent = "Open";
						openButton.addEventListener("click", () => {
							openDocument(doc.id);
						});
						dropdownContent.appendChild(openButton);

						const deleteButton = document.createElement("button");
						deleteButton.textContent = "Delete";
						deleteButton.addEventListener("click", async () => {
							const confirmDelete = confirm(
								"Are you sure you want to delete this document?"
							);
							if (confirmDelete) {
								deleteDocument(doc.id);
							}
						});
						dropdownContent.appendChild(deleteButton);

						const shareButton = document.createElement("button");
						shareButton.textContent = "Share";
						shareButton.addEventListener("click", () => {
							const sharedUserId = prompt(
								"Enter user ID to share with:"
							);
							console.log(sharedUserId);
							if (sharedUserId) {
								shareDocument(doc.id, sharedUserId);
							}
						});
						dropdownContent.appendChild(shareButton);
					} else if (doc.role === "editor") {
						const openButton = document.createElement("button");
						openButton.textContent = "Open";
						openButton.addEventListener("click", () => {
							openDocument(doc.id);
						});
						dropdownContent.appendChild(openButton);
					}
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

	const deleteDocument = async (documentId) => {
		try {
			const response = await fetch(
				`${base_url}/documents/docs/${documentId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${sessionStorage.getItem(
							"token"
						)}`,
					},
				}
			);
			console.log(response);
			if (response.ok) {
				showNotification("Document deleted successfully");
				fetchDocuments();
			} else {
				showNotification("Failed to delete document");
			}
		} catch (error) {
			console.error("Error deleting document:", error);
			showNotification("Failed to delete document");
		}
	};

	const shareDocument = async (documentId, sharedUserName) => {
		try {
			const response = await fetch(`${base_url}/documents/share`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify({ documentId, sharedUserName }),
			});
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

	const openDocument = async (documentId) => {
		try {
			const response = await fetch(`${base_url}/auth/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token }),
			});
			if (response.ok) {
				window.location.href = `./editor.html?docId=${documentId}`;
			} else {
				showNotification("Failed to open document");
			}
		} catch (error) {
			console.error("Error opening document:", error);
			showNotification("Failed to open document");
		}
	};

	fetchDocuments();
});
