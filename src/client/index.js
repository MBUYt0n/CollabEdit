document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("login-form");
	const loginError = document.getElementById("login-error");
	const authContainer = document.getElementById("auth-container");
	const mainContainer = document.getElementById("main-container");

	loginForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		try {
			const response = await fetch("http://localhost:3000/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				const data = await response.json();
				localStorage.setItem("token", data.token);
				authContainer.style.display = "none";
				mainContainer.style.display = "block";
			} else {
				loginError.style.display = "block";
			}
		} catch (error) {
			console.error("Error logging in:", error);
			loginError.style.display = "block";
		}
	});

	const token = localStorage.getItem("token");
	if (token) {
		authContainer.style.display = "none";
		mainContainer.style.display = "block";
	} else {
		authContainer.style.display = "block";
		mainContainer.style.display = "none";
	}
});
