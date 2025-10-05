const mongoose = require("mongoose")
const Admin = require("./models/Admin")
const dotenv = require("dotenv")

dotenv.config()

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/snjbcoe_results", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      process.exit(0)
    }

    // Create default admin user
    const admin = new Admin({
      username: "admin",
      email: "admin@snjbcoe.edu.in",
      password: "admin123", // This will be hashed automatically
    })

    await admin.save()
    console.log("Default admin user created successfully")
    console.log("Username: admin")
    console.log("Password: admin123")
    console.log("Please change the password after first login")

    process.exit(0)
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()