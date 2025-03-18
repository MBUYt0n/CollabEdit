const express = require("express");
const cors = require("cors");
const {
	fetchDocument,
	showDocuments,
	createDocument,
	updateDocument,
	deleteDocument,
} = require("./docs");

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cors());

app.get("/documents", async (req, res) => {
	const userId = req.user.id; 
	try {
		const documents = await showDocuments(userId);
		res.status(200).json(documents);
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.post("/documents", async (req, res) => {
	const userId = req.user.id;
	const { title, content } = req.body;
	try {
		const documentId = await createDocument(userId, title, content);
		res.status(201).send({ documentId });
	} catch (error) {
		console.error("Error creating document:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.get("/documents/:id", async (req, res) => {
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

app.put("/documents/:id", async (req, res) => {
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

app.delete("/documents/:id", async (req, res) => {
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

app.listen(PORT, () => {
	console.log(`Documents service running on http://localhost:${PORT}`);
});
