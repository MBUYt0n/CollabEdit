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
		`SELECT documents.id, documents.title, document_roles.role
		FROM documents
		JOIN document_roles ON documents.id = document_roles.document_id
		WHERE document_roles.user_id = ?`,
		[userId]
	);
	return result;
}

async function createDocument(userId, title) {
	const result = await pool.query(
		"INSERT INTO documents (user_id, title) VALUES (?, ?)",
		[userId, title]
	);

	const result1 = await pool.query(
		"INSERT INTO document_versions (document_id, content, version_no, pinned) VALUES (?, ?, ?, ?)",
		[result.insertId, "", 1, true]
	);

	const result2 = await pool.query(
		"INSERT INTO document_roles (document_id, user_id, role) VALUES (?, ?, ?)",
		[result.insertId, userId, "owner"]
	);
	return Number(result.insertId);
}

async function updateDocument(documentId, content) {
	const version_no = await pool.query(
		"SELECT MAX(version_no) as version_no FROM document_versions WHERE document_id = ?",
		[documentId]
	);
	const result = await pool.query(
		"UPDATE document_versions SET pinned = false WHERE document_id = ? AND pinned = true",
		[documentId]
	);
	const result1 = await pool.query(
		"INSERT INTO document_versions (document_id, content, version_no, pinned) VALUES (?, ?, ?, ?)",
		[documentId, content, version_no[0].version_no + 1, true]
	);
	return result1.affectedRows;
}

async function deleteDocument(documentId) {
	const r = await pool.query(
		"DELETE FROM document_roles WHERE document_id = ?",
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

async function shareDocument(documentId, userId, role) {
	try {
		const result = await pool.query(
			"INSERT INTO document_roles (document_id, user_id, role) VALUES (?, ?, ?)",
			[documentId, userId, role]
		);
		return result.affectedRows;
	} catch (error) {
		console.error("Error sharing document:", error);
		throw error;
	}
}

async function getUserId(username) {
	try {
		const result = await pool.query(
			"SELECT id FROM users WHERE username = (?)",
			[username]
		);
		return result[0].id; 
	} catch (error) {
		console.error("Error fetching user ID:", error);
		throw error;
	}
}

async function getDocumentVersions(documentId) {
	const result = await pool.query(
		"SELECT version_no, content, created_at FROM document_versions WHERE document_id = (?)",
		[documentId]
	);
	return result;
}

async function pinVersion(documentId, versionNo) {
	const result = await pool.query(
		"UPDATE document_versions SET pinned = false WHERE document_id = (?) AND pinned = true",
		[documentId]
	);
	const result1 = await pool.query(
		"UPDATE document_versions SET pinned = true WHERE document_id = (?) AND version_no = (?)",
		[documentId, versionNo]
	);
	return result1.affectedRows;
}

module.exports = {
	fetchDocument,
	showDocuments,
	createDocument,
	deleteDocument,
	shareDocument,
	updateDocument,
	getDocumentVersions,
	pinVersion,
	getUserId,
};
