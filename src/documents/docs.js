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
		`SELECT documents.title, document_versions.content, document_versions.version_no
		FROM documents
		JOIN document_versions ON documents.id = document_versions.document_id
		WHERE documents.id = (?) AND document_versions.pinned = true`,
		[documentId]
	);
	return result;
}

async function showDocuments(userId) {
	const result = await pool.query(
		`SELECT documents.id, documents.title, true as isOwner
        FROM documents
        WHERE documents.user_id = (?)
        UNION
        SELECT documents.id, documents.title, false as isOwner
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
		[userId, title, 1]
	);

	const result1 = await pool.query(
		"INSERT INTO document_versions (document_id, content, version_no, pinned) VALUES (?, ?, ?, ?)",
		[result.insertId, "", 1, true]
	);
	return Number(result.insertId);
}

async function updateDocument(documentId, content) {
	const version_no = await pool.query(
		"SELECT MAX(version_no) FROM document_versions WHERE document_id = ?",
		[documentId]
	);

	const result = await pool.query(
		"UPDATE document_versions SET pinned = false WHERE document_id = ? AND pinned = true",
		[documentId]
	);

	const result1 = await pool.query(
		"INSERT INTO document_versions (document_id, content, version_no, pinned) VALUES (?, ?, ?, ?)",
		[documentId, content, version_no.version_no + 1, true]
	);
}

async function deleteDocument(documentId) {
	const r = await pool.query(
		"DELETE FROM document_shares WHERE document_id = ?",
		[documentId]
	);

	const result1 = await pool.query(
		"DELETE FROM document_versions WHERE document_id = ?",
		[documentId]
	);

	const result = await pool.query("DELETE FROM documents WHERE id = ?", [
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
	deleteDocument,
	shareDocument,
	updateDocument,
	getUserId,
};
