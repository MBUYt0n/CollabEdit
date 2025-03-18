const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET } = process.env;

const pool = mysql.createPool({
	host: "mariadb",
	user: "collabuser",
	password: "collabpassword",
	database: "collabedit",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

async function registerUser(username, password) {
	const hashedPassword = await bcrypt.hash(password, 10);

	const [result] = await pool.query(
		"INSERT INTO users (username, password) VALUES (?, ?)",
		[username, hashedPassword]
	);

	return result.insertId;
}

async function authenticateUser(username, password) {
	const [[user]] = await pool.query(
		"SELECT * FROM users WHERE username = ?",
		[username]
	);

	if (!user) {
		return null;
	}

	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch) {
		return null;
	}

	return user.id;
}

function createToken(userId) {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
}

function verifyToken(token) {
	return jwt.verify(token, JWT_SECRET);
}

module.exports = {
	registerUser,
	authenticateUser,
	createToken,
	verifyToken,
};
