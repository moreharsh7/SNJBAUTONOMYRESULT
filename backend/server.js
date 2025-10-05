const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Import routes
const adminRoutes = require("./routes/admin")
const studentRoutes = require("./routes/student")
const resultRoutes = require("./routes/result")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploaded Excel sheets
app.use("/uploads", express.static("uploads"))

// Routes
app.use("/api/admin", adminRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/result", resultRoutes)

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/snjbcoe_results", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "SNJBCOE Result Management System API" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
