// Test the Stock Management System API
require("dotenv").config();
require("./lib/connection")(); // Connect to MongoDB

const { createSampleData } = require("./testSampleData");

// Run the sample data creation
createSampleData()
    .then(() => {
        console.log("\n✅ Sample data creation completed!");
        console.log("\nYou can now test the API endpoints:");
        console.log("1. POST http://localhost:5050/user/login");
        console.log("   Body: { \"email\": \"admin@stockms.com\", \"password\": \"admin123\" }");
        console.log("\n2. GET http://localhost:5050/category (public)");
        console.log("3. GET http://localhost:5050/product (requires auth)");
        console.log("4. GET http://localhost:5050/dashboard/overview (requires auth)");
        
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error creating sample data:", error.message);
        process.exit(1);
    });
