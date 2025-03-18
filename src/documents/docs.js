const mysql = require("mysql2/promise");

const pool = mysql.createPool({
	host: "mariadb",
	user: "collabuser",
	password: "collabpassword",
	database: "collabedit",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
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

async function createDocument(userId, title, content) {
    const [result] = await pool.query(
        "INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)",
        [userId, title, content]
    );

    return result.insertId;
}

async function updateDocument(documentId, content) {
    const [result] = await pool.query(
        "UPDATE documents SET content = ? WHERE id = ?",
        [content, documentId]
    );

    return result.affectedRows;
}

async function deleteDocument(documentId) {
    const [result] = await pool.query(
        "DELETE FROM documents WHERE id = ?",
        [documentId]
    );

    return result.affectedRows;
}

module.exports = {
    fetchDocument,
    showDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
};