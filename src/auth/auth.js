const admin = require("firebase-admin");
require("dotenv").config();
const path = require("path");
const serviceAccountPath = path.join(__dirname, "./firebase-adminsdk.json");
const serviceAccount = require(serviceAccountPath);
const mariadb = require("mariadb");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mariadb.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	connectionLimit: 10,
});

const auth = admin.auth();

async function registerUser(userId, username) {
	try {
		const result = await pool.query(
			"INSERT INTO users (id, username) VALUES (?, ?)",
			[userId, username]
		);
		return result.affectedRows > 0;
	} catch (error) {
		console.error("Error registering user:", error);
		throw error;
	}
}

async function verifyUser(token) {
	try {
		const decodedToken = await auth.verifyIdToken(token);
		return decodedToken;
	} catch (error) {
		console.error("Error verifying user:", error);
		throw error;
	}
}

module.exports = {
	verifyUser,
	registerUser
};
