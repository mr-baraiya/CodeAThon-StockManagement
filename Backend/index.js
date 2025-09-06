require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

require("./lib/connection")(); // Optional: MongoDB connection

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Auto-load all *.router.js files inside /routes
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".router.js")) {
    const route = require(path.join(routesPath, file));
    const routePath = "/" + file.replace(".router.js", "");
    app.use(routePath, route); // e.g. /razorpay
  }
});

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to Stock Management System API - Code A Thon");
});

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: true, message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 9705;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
});
