const express = require("express");
const cors = require("cors");
const {
	registerUser,
	authenticateUser,
	createToken,
	verifyToken,
} = require("./auth");
const router = express.Router();

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const userID = await registerUser(username, password);
		const token = createToken(userID);
		res.status(201).send({ token });
	} catch (error) {
		console.error("Error registering user:", error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await authenticateUser(username, password);
		if (!user) {
			throw new Error("Invalid username or password");
		}
		const token = createToken(user);
		res.status(200).send({ token });
	} catch (error) {
		console.error("Error logging in:", error);
		res.status(401).send({ error: "Unauthorized" });
	}
});

app.listen(PORT, () => {
	console.log(`Auth service running on http://localhost:${PORT}`);
});
