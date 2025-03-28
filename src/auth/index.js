const express = require("express");
const cors = require("cors");
const { verifyUser } = require("./auth");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

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
