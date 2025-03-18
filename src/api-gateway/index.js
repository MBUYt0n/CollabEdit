const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/auth", (req, res) => {
	const url = `http://auth:3001${req.url}`;
	axios({
		method: req.method,
		url,
		data: req.body,
		headers: req.headers,
	})
		.then((response) => res.status(response.status).send(response.data))
		.catch((error) =>
			res.status(error.response.status).send(error.response.data)
		);
});

app.use("/documents", (req, res) => {
	const url = `http://documents:3002${req.url}`;
	axios({
		method: req.method,
		url,
		data: req.body,
		headers: req.headers,
	})
		.then((response) => res.status(response.status).send(response.data))
		.catch((error) =>
			res.status(error.response.status).send(error.response.data)
		);
});

app.use("/collab", (req, res) => {
	const url = `http://collab:8080${req.url}`;
	axios({
		method: req.method,
		url,
		data: req.body,
		headers: req.headers,
	})
		.then((response) => res.status(response.status).send(response.data))
		.catch((error) =>
			res.status(error.response.status).send(error.response.data)
		);
});

app.listen(PORT, () => {
	console.log(`API Gateway running on http://localhost:${PORT}`);
});
