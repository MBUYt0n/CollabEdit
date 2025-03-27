const mariadb = require("mariadb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { JWT_SECRET, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = mariadb.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	connectionLimit: 10,
});

async function registerUser(username, password) {
	const hashedPassword = await bcrypt.hash(password, 10);
	const result = await pool.query(
		"INSERT INTO users (username, password) VALUES (?, ?)",
		[username, hashedPassword]
	);
	const id = await pool.query("SELECT id FROM users WHERE username = (?)", [
		username,
	]);
	return id[0].id;
}

async function authenticateUser(username, password) {
	const [user] = await pool.query("SELECT * FROM users WHERE username = ?", [
		username,
	]);

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

module.exports = {
	registerUser,
	authenticateUser,
	createToken,
};
