document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("login-form");
	const registerForm = document.getElementById("register-form");
	const loginError = document.getElementById("login-error");
	const registerError = document.getElementById("register-error");
	const authContainer = document.getElementById("auth-container");
	const registerContainer = document.getElementById("register-container");
	const mainContainer = document.getElementById("main-container");
	const showRegisterLink = document.getElementById("show-register");
	const showLoginLink = document.getElementById("show-login");

	showRegisterLink.addEventListener("click", (event) => {
		event.preventDefault();
		authContainer.style.display = "none";
		registerContainer.style.display = "block";
	});

	showLoginLink.addEventListener("click", (event) => {
		event.preventDefault();
		registerContainer.style.display = "none";
		authContainer.style.display = "block";
	});

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

	registerForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const username = document.getElementById("register-username").value;
		const password = document.getElementById("register-password").value;

		try {
			const response = await fetch(
				"http://localhost:3000/auth/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, password }),
				}
			);
			console.log(response);
			if (response.ok) {
				registerContainer.style.display = "none";
				authContainer.style.display = "block";
			} else {
				registerError.style.display = "block";
			}
		} catch (error) {
			console.error("Error registering:", error);
			registerError.style.display = "block";
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
