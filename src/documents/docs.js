const mariadb = require("mariadb");
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mariadb.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	connectionLimit: 10,
});

async function fetchDocument(documentId) {
	const [result] = await pool.query("SELECT * FROM documents WHERE id = ?", [
		documentId,
	]);

	return result[0];
}

async function showDocuments(userId) {
	const [result] = await pool.query(
		"SELECT * FROM documents where user_id = ?",
		[userId]
	);

	return result;
}

async function createDocument(userId, title) {
	const result = await pool.query(
		"INSERT INTO documents (user_id, title) VALUES (?, ?)",
		[userId, title]
	);
	return Number(result.insertId);
}

async function updateDocument(documentId, content) {
	const [result] = await pool.query(
		"UPDATE documents SET content = ? WHERE id = ?",
		[content, documentId]
	);

	return result.affectedRows;
}

async function deleteDocument(documentId) {
	const [result] = await pool.query("DELETE FROM documents WHERE id = ?", [
		documentId,
	]);

	return result.affectedRows;
}

module.exports = {
	fetchDocument,
	showDocuments,
	createDocument,
	updateDocument,
	deleteDocument,
};
