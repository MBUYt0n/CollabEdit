const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

const proxyRequest = (serviceUrl) => (req, res) => {
	const url = `${serviceUrl}${req.url}`;
	axios({
		method: req.method,
		url,
		data: req.body,
		headers: req.headers,
	})
		.then((response) => res.status(response.status).send(response.data))
		.catch((error) =>
			res
				.status(error.response?.status || 500)
				.send(
					error.response?.data || { error: "Internal Server Error" }
				)
		);
};

app.use("/auth", proxyRequest("http://auth:3001"));
app.use("/documents", proxyRequest("http://documents:3002"));
app.use("/collab", proxyRequest("http://collab:8080"));

app.listen(PORT, "0.0.0.0", () => {
	console.log(`API Gateway running on http://localhost:${PORT}`);
});
