const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
	const mongoURI = process.env.MONGODB_URI;

	try {
		await mongoose.connect(mongoURI);
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error.message);
		process.exit(1);
	}

	mongoose.connection.on("disconnected", () => {
		console.warn("MongoDB disconnected");
	});

	mongoose.connection.on("error", (err) => {
		console.error("MongoDB error:", err.message || err);
	});

	process.on("SIGINT", async () => {
		await mongoose.connection.close();
		console.log("MongoDB connection closed due to application termination");
		process.exit(0);
	});
};

module.exports = connectDB;
