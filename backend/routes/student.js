const express = require("express")
const Result = require("../models/Result")
const Notification = require("../models/Notification")

const router = express.Router()

// Get notifications for students
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true }).sort({ publishedDate: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message })
  }
})

// Verify student credentials and get result
router.post("/verify-and-get-result", async (req, res) => {
  try {
    const { prn, motherName, year, semester } = req.body

    // Find result with matching credentials
    const result = await Result.findOne({
      prn: prn.toUpperCase(),
      motherName: { $regex: new RegExp(motherName, "i") },
      year: Number.parseInt(year),
      semester: Number.parseInt(semester),
    })

    if (!result) {
      return res.status(404).json({
        message: "Result not found. Please check your PRN, Mother's name, year, and semester.",
      })
    }

    res.json({
      message: "Result found successfully",
      result,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching result", error: error.message })
  }
})

// Get result by PRN (for direct access)
router.get("/result/:prn/:year/:semester", async (req, res) => {
  try {
    const { prn, year, semester } = req.params

    const result = await Result.findOne({
      prn: prn.toUpperCase(),
      year: Number.parseInt(year),
      semester: Number.parseInt(semester),
    })

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Error fetching result", error: error.message })
  }
})

module.exports = router
