const express = require("express");
const cors = require("cors");
const { registerUser, verifyUser } = require("./auth");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).send({ error: "No token provided" });
	}
	const { uid, username } = req.body;
	try {
		const decodedToken = await verifyUser(token);
		if (!decodedToken) {
			throw new Error("Invalid token");
		}
		const affectedRows = await registerUser(uid, username);
		if (affectedRows === 0) {
			return res.status(400).send({ error: "User already exists" });
		} else
			res.status(200).send({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error registering user:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.post("/verify", async (req, res) => {
	const { token } = req.body;
	try {
		const decodedToken = await verifyUser(token);
		if (!decodedToken) {
			throw new Error("Invalid token");
		}
		res.status(200).send({ decodedToken });
	} catch (error) {
		console.error("Error verifying user:", error);
		res.status(401).send({ error: "Unauthorized" });
	}
});

app.listen(PORT, () => {
	console.log(`Auth service running on http://localhost:${PORT}`);
});
