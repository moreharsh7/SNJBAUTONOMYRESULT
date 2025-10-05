const express = require("express")
const Result = require("../models/Result")

const router = express.Router()

// Get all results (public endpoint with basic filtering)
router.get("/", async (req, res) => {
  try {
    const { year, semester, program } = req.query
    const filter = {}

    if (year) filter.year = Number.parseInt(year)
    if (semester) filter.semester = Number.parseInt(semester)
    if (program) filter.program = program

    const results = await Result.find(filter).select("-__v").sort({ createdAt: -1 })

    res.json({
      message: "Results fetched successfully",
      count: results.length,
      results,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error: error.message })
  }
})

module.exports = router