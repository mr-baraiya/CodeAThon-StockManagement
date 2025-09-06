const User = require("./models/user.model");
const Category = require("./models/category.model");
const Supplier = require("./models/supplier.model");
const Product = require("./models/product.model");

// Test script to create sample data for the stock management system
async function createSampleData() {
    try {
        console.log("Creating sample data for Stock Management System...");

        // 1. Create sample categories
        const electronics = await Category.create({
            name: "Electronics",
            description: "Electronic devices and accessories"
        });

        const laptops = await Category.create({
            name: "Laptops",
            description: "Laptop computers",
            parentCategory: electronics._id
        });

        const mobile = await Category.create({
            name: "Mobile Phones",
            description: "Smartphones and accessories",
            parentCategory: electronics._id
        });

        const stationery = await Category.create({
            name: "Stationery",
            description: "Office and school supplies"
        });

        console.log("✅ Categories created");

        // 2. Create sample suppliers
        const techSupplier = await Supplier.create({
            name: "Tech Solutions Pvt Ltd",
            contactPerson: "Rajesh Kumar",
            email: "rajesh@techsolutions.com",
            phone: "9876543210",
            address: {
                street: "123 Tech Park",
                city: "Bangalore",
                state: "Karnataka",
                zipCode: "560001",
                country: "India"
            },
            gstNumber: "29ABCDE1234F1Z5",
            paymentTerms: "credit_30"
        });

        const officeSupplier = await Supplier.create({
            name: "Office Mart",
            contactPerson: "Priya Sharma",
            email: "priya@officemart.com",
            phone: "9876543211",
            address: {
                street: "456 Business District",
                city: "Mumbai",
                state: "Maharashtra",
                zipCode: "400001",
                country: "India"
            },
            paymentTerms: "cash"
        });

        console.log("✅ Suppliers created");

        // 3. Create sample products
        const products = [
            {
                name: "Dell XPS 13 Laptop",
                sku: "DELL-XPS13-001",
                barcode: "1234567890123",
                description: "High-performance ultrabook with Intel i7 processor",
                category: laptops._id,
                supplier: techSupplier._id,
                unit: "piece",
                costPrice: 75000,
                sellingPrice: 85000,
                currentStock: 15,
                minStockLevel: 3,
                maxStockLevel: 50,
                reorderPoint: 5,
                taxRate: 18,
                tags: ["laptop", "intel", "ultrabook"]
            },
            {
                name: "iPhone 13",
                sku: "APPLE-IP13-128",
                barcode: "1234567890124",
                description: "Apple iPhone 13 with 128GB storage",
                category: mobile._id,
                supplier: techSupplier._id,
                unit: "piece",
                costPrice: 65000,
                sellingPrice: 75000,
                currentStock: 8,
                minStockLevel: 2,
                maxStockLevel: 30,
                reorderPoint: 3,
                taxRate: 18,
                tags: ["smartphone", "apple", "ios"]
            },
            {
                name: "Samsung Galaxy S21",
                sku: "SAM-GS21-256",
                barcode: "1234567890125",
                description: "Samsung Galaxy S21 with 256GB storage",
                category: mobile._id,
                supplier: techSupplier._id,
                unit: "piece",
                costPrice: 55000,
                sellingPrice: 62000,
                currentStock: 12,
                minStockLevel: 3,
                maxStockLevel: 40,
                reorderPoint: 5,
                taxRate: 18,
                tags: ["smartphone", "samsung", "android"]
            },
            {
                name: "A4 Copy Paper (500 sheets)",
                sku: "PAPER-A4-500",
                barcode: "1234567890126",
                description: "High quality A4 size copy paper - 500 sheets pack",
                category: stationery._id,
                supplier: officeSupplier._id,
                unit: "pack",
                costPrice: 300,
                sellingPrice: 350,
                currentStock: 50,
                minStockLevel: 10,
                maxStockLevel: 200,
                reorderPoint: 15,
                taxRate: 12,
                tags: ["paper", "stationery", "office"]
            },
            {
                name: "Blue Gel Pen",
                sku: "PEN-GEL-BLUE",
                barcode: "1234567890127",
                description: "Smooth writing gel pen in blue color",
                category: stationery._id,
                supplier: officeSupplier._id,
                unit: "piece",
                costPrice: 15,
                sellingPrice: 25,
                currentStock: 100,
                minStockLevel: 20,
                maxStockLevel: 500,
                reorderPoint: 30,
                taxRate: 12,
                tags: ["pen", "stationery", "writing"]
            }
        ];

        for (const productData of products) {
            await Product.create(productData);
        }

        console.log("✅ Products created");

        // 4. Create sample admin user if not exists
        const existingAdmin = await User.findOne({ email: "admin@stockms.com" });
        if (!existingAdmin) {
            await User.create({
                name: "System Administrator",
                email: "admin@stockms.com",
                password: "admin123",
                role: "admin",
                phone: "9999999999",
                location: "Head Office"
            });
            console.log("✅ Admin user created (email: admin@stockms.com, password: admin123)");
        }

        // 5. Create sample manager user if not exists
        const existingManager = await User.findOne({ email: "manager@stockms.com" });
        if (!existingManager) {
            await User.create({
                name: "Store Manager",
                email: "manager@stockms.com",
                password: "manager123",
                role: "manager",
                phone: "9999999998",
                location: "Main Store"
            });
            console.log("✅ Manager user created (email: manager@stockms.com, password: manager123)");
        }

        // 6. Create sample staff user if not exists
        const existingStaff = await User.findOne({ email: "staff@stockms.com" });
        if (!existingStaff) {
            await User.create({
                name: "Store Staff",
                email: "staff@stockms.com",
                password: "staff123",
                role: "staff",
                phone: "9999999997",
                location: "Main Store"
            });
            console.log("✅ Staff user created (email: staff@stockms.com, password: staff123)");
        }

        console.log("\n🎉 Sample data creation completed successfully!");
        console.log("\nTest Users Created:");
        console.log("1. Admin: admin@stockms.com / admin123");
        console.log("2. Manager: manager@stockms.com / manager123");
        console.log("3. Staff: staff@stockms.com / staff123");
        
        console.log("\nSample Data Summary:");
        console.log(`- Categories: ${await Category.countDocuments()}`);
        console.log(`- Suppliers: ${await Supplier.countDocuments()}`);
        console.log(`- Products: ${await Product.countDocuments()}`);
        console.log(`- Users: ${await User.countDocuments()}`);

    } catch (error) {
        console.error("❌ Error creating sample data:", error.message);
    }
}

module.exports = { createSampleData };
