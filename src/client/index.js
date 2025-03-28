import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("login-form");
	const registerForm = document.getElementById("register-form");
	const loginError = document.getElementById("login-error");
	const registerError = document.getElementById("register-error");
	const authContainer = document.getElementById("auth-container");
	const registerContainer = document.getElementById("register-container");
	const showRegisterLink = document.getElementById("show-register");
	const showLoginLink = document.getElementById("show-login");

	const firebaseConfig = {
		apiKey: "AIzaSyBbsY-XMKMgdf9lW-OT0pO7fWicm1PJW8E",
		authDomain: "collabedit-ff22e.firebaseapp.com",
		projectId: "collabedit-ff22e",
		storageBucket: "collabedit-ff22e.firebasestorage.app",
		messagingSenderId: "319166822692",
		appId: "1:319166822692:web:acfcfb6ee5deddaaa0dbb1",
		measurementId: "G-NZ7DM3DXPV",
	};

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

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

		const email = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const idToken = await userCredential.user.getIdToken();

			sessionStorage.setItem("token", idToken);
			sessionStorage.setItem("username", userCredential.user.email);

			window.location.href = "/documents.html";
		} catch (error) {
			console.error("Error logging in:", error);
			loginError.style.display = "block";
		}
	});

	registerForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const email = document.getElementById("register-username").value;
		const password = document.getElementById("register-password").value;

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const idToken = await userCredential.user.getIdToken();

			sessionStorage.setItem("token", idToken);
			sessionStorage.setItem("username", userCredential.user.email);

			window.location.href = "/documents.html";
		} catch (error) {
			console.error("Error registering:", error);
			registerError.style.display = "block";
		}
	});

	const token = sessionStorage.getItem("token");
	if (token) {
		window.location.href = "/documents.html";
	} else {
		authContainer.style.display = "block";
	}
});
