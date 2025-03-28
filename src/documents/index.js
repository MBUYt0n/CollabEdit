const express = require("express");
const cors = require("cors");
const {
	fetchDocument,
	showDocuments,
	createDocument,
	updateDocument,
	deleteDocument,
	shareDocument,
	getDocumentVersions,
	pinVersion,
	getUserId,
	changeLanguage,
} = require("./docs");
const { authenticateToken } = require("./middleware");

const app = express();
const PORT = 3002;
app.use(express.json());
app.use(cors());

app.get("/show", authenticateToken, async (req, res) => {
	const userId = req.userId;
	try {
		const documents = await showDocuments(userId);
		if (!documents) {
			return res.status(404).send({ error: "No documents found" });
		}
		res.status(200).json(documents);
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.post("/new", authenticateToken, async (req, res) => {
	const userId = req.userId;
	const { title } = req.body;
	try {
		const documentId = await createDocument(userId, title);
		res.status(201).send({ documentId });
	} catch (error) {
		console.error("Error creating document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.post("/share", authenticateToken, async (req, res) => {
	const { documentId, sharedUserName } = req.body;
	const sharedUserId = await getUserId(sharedUserName);
	if (!sharedUserId) {
		return res.status(400).send({ error: "No user ID provided" });
	}
	try {
		const affectedRows = await shareDocument(
			documentId,
			sharedUserId,
			"editor"
		);
		if (affectedRows > 0) {
			res.status(200).send({ message: "Document shared successfully" });
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error sharing document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.get("/docs/:id", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	try {
		const document = await fetchDocument(documentId);
		if (document) {
			res.status(200).json(document);
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error fetching document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.put("/docs/:id", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	const { content } = req.body;
	try {
		const affectedRows = await updateDocument(documentId, content);
		if (affectedRows > 0) {
			res.status(200).send({ message: "Document updated successfully" });
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error updating document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.delete("/docs/:id", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	try {
		const affectedRows = await deleteDocument(documentId);
		if (affectedRows > 0) {
			res.status(200).send({ message: "Document deleted successfully" });
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error deleting document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.get("/docs/:id/versions", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	try {
		const versions = await getDocumentVersions(documentId);
		if (versions) {
			res.status(200).json(versions);
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error fetching document versions:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.put("/docs/:id/pin", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	const { versionNo } = req.body;
	try {
		const affectedRows = await pinVersion(documentId, versionNo);
		if (affectedRows > 0) {
			res.status(200).send({ message: "Version pinned successfully" });
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error pinning document version:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.put("/docs/:id/language", authenticateToken, async (req, res) => {
	const documentId = req.params.id;
	const { language } = req.body;
	try {
		const affectedRows = await changeLanguage(documentId, language);
		if (affectedRows > 0) {
			res.status(200).send({ message: "Document language updated" });
		} else {
			res.status(404).send({ error: "Document not found" });
		}
	} catch (error) {
		console.error("Error updating document language:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.listen(PORT, () => {
	console.log(`Documents service running on http://localhost:${PORT}`);
});
