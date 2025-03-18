const express = require("express");
const http = require("http");
const path = require("path");
const mysql = require("mysql2/promise");
const { setupWebSockets } = require("./websockets"); // Import WebSockets module

const app = express();
app.use(express.json());

const server = http.createServer(app);
let wssInitialized = false;

const pool = mysql.createPool({
	host: "mariadb",
	user: "collabuser",
	password: "collabpassword",
	database: "collabedit",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

app.get("/api/documents", async (req, res) => {
	try {
		const [rows] = await pool.query("SELECT * FROM documents");
		res.json(rows);
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).json({ error: "Database error" });
	}
});

app.post("/api/documents", async (req, res) => {
	const { title, content } = req.body;
	try {
		await pool.query(
			"INSERT INTO documents (title, content) VALUES (?, ?)",
			[title, content]
		);
		res.status(201).json({ message: "Document created" });
	} catch (error) {
		console.error("Error creating document:", error);
		res.status(500).json({ error: "Database error" });
	}
});

app.use(express.static("src/client"));

app.get("/api/editor", (req, res) => {
	if (!wssInitialized) {
		setupWebSockets(server);
		wssInitialized = true;
	}
	res.redirect("/editor.html"); 
});


const PORT = 8080;
server.listen(PORT, () =>
	console.log(`Server running on http://localhost:${PORT}`)
);
