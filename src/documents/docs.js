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
	const [result] = await pool.query(
		"SELECT id, title, content FROM documents WHERE id = ?",
		[documentId]
	);
	return result;
}

async function showDocuments(userId) {
	const result = await pool.query(
		`SELECT documents.id, documents.title, documents.content, true as isOwner
        FROM documents
        WHERE documents.user_id = (?)
        UNION
        SELECT documents.id, documents.title, documents.content, false as isOwner
        FROM documents
        JOIN document_shares ON documents.id = document_shares.document_id
        WHERE document_shares.user_id = (?)`,
		[userId, userId]
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

async function shareDocument(documentId, userId) {
	const result = await pool.query(
		"INSERT INTO document_shares (document_id, user_id) VALUES (?, ?)",
		[documentId, userId]
	);

	return result.affectedRows;
}

async function getUserId(username) {
	const result = await pool.query("SELECT id FROM users WHERE username = ?", [
		username,
	]);
	return result[0].id;
}

module.exports = {
	fetchDocument,
	showDocuments,
	createDocument,
	updateDocument,
	deleteDocument,
	shareDocument,
	getUserId,
};
