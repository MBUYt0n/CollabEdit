const admin = require("firebase-admin");
require("dotenv").config();
const path = require("path");
const serviceAccountPath = path.join(__dirname, "./firebase-adminsdk.json");
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

async function verifyUser(token) {
	try {
		const decodedToken = await auth.verifyIdToken(token);
		return decodedToken;
	} catch (error) {
		console.error("Error verifying user:", error);
		throw error;
	}
}

module.exports = {
	verifyUser,
};
