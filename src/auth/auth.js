const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
});

const auth = admin.auth();

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
