const jwt = require("jsonwebtoken");
require("dotenv").config();
const { JWT_SECRET } = process.env;

function authenticateToken(req, res, next) {
	const token = req.headers.authorization?.split(" ")[1]; // Extract JWT token from header

	if (!token) {
		return res
			.status(401)
			.json({ error: "Access denied. No token provided." });
	}

	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ error: "Invalid or expired token." });
		}

		req.user = decoded; // Attach user data to request
		next();
	});
}

module.exports = authenticateToken;
