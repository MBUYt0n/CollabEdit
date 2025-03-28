const axios = require("axios");

async function authenticateToken(req, res, next) {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res
			.status(401)
			.json({ error: "Access denied. No token provided." });
	}
	try {
		const response = await axios.post(
			"http://auth:3001/verify",
			{ token },
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		req.userId = response.data.decodedToken.uid;
		next();
	} catch (error) {
		console.error("Error verifying token:", error.response?.data || error);
		return res.status(403).json({ error: "Invalid or expired token." });
	}
}

module.exports = { authenticateToken };
