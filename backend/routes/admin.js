const express = require("express")
const multer = require("multer")
const xlsx = require("xlsx")
const path = require("path")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const Result = require("../models/Result")
const Notification = require("../models/Notification")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only Excel files are allowed!"), false)
    }
  },
})

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const admin = await Admin.findOne({ username })
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper to check if a value is a valid grade string
const isValidGradeString = (value) => typeof value === "string" && /^[A-F][+]?$|^O$/.test(value.trim())

// Upload Excel file and process results
router.post("/upload-results", authMiddleware, upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const { year, semester, program, examDate } = req.body

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

    console.log("=== ENHANCED EXCEL ANALYSIS ===")

    // Find the exact structure based on your Excel format
    let subjectHeaderRowIndex = -1
    let subHeaderRowIndex = -1
    let dataStartRowIndex = -1

    // Look for the row containing subject codes with ":"
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const row = data[i]
      if (row && row.some((cell) => cell && typeof cell === "string" && cell.includes(":") && cell.includes("24-"))) {
        subjectHeaderRowIndex = i
        // Sub-headers are typically 2 rows below subject headers in your format
        subHeaderRowIndex = i + 2
        dataStartRowIndex = i + 3
        break
      }
    }

    if (subjectHeaderRowIndex === -1) {
      throw new Error("Could not find subject headers row in Excel file")
    }

    console.log(`Subject headers found at row ${subjectHeaderRowIndex + 1}`)
    console.log(`Sub-headers at row ${subHeaderRowIndex + 1}`)
    console.log(`Data starts at row ${dataStartRowIndex + 1}`)

    const subjectHeadersRow = data[subjectHeaderRowIndex]
    const subHeadersRow = data[subHeaderRowIndex]
    const sampleDataRow = data[dataStartRowIndex]

    console.log("Subject Headers Row:", subjectHeadersRow)
    console.log("Sub Headers Row:", subHeadersRow)
    console.log("Sample Data Row:", sampleDataRow)

    // Fixed student info columns (Sr.No, PRN, Name, Mother Name, Gender)
    const fixedStudentInfoCols = 5

    // Enhanced subject detection
    const subjects = []
    const subjectStarts = []

    // Find all subject start positions
    for (let i = fixedStudentInfoCols; i < subjectHeadersRow.length; i++) {
      const header = subjectHeadersRow[i]
      if (header && typeof header === "string" && header.includes(":") && header.includes("24-")) {
        const [code, name] = header.split(":").map((s) => s.trim())
        subjectStarts.push({
          startCol: i,
          code: code,
          name: name,
          fullHeader: header,
        })
      }
    }

    console.log("Subject starts detected:", subjectStarts)

    // Process each subject with precise column mapping
    for (let i = 0; i < subjectStarts.length; i++) {
      const currentSubject = subjectStarts[i]
      const nextSubject = subjectStarts[i + 1]

      // Determine end column for this subject
      let endCol
      if (nextSubject) {
        endCol = nextSubject.startCol - 1
      } else {
        // Last subject - find where summary starts
        for (let j = currentSubject.startCol + 1; j < subHeadersRow.length; j++) {
          const subHeader = subHeadersRow[j]
          if (subHeader && typeof subHeader === "string") {
            const summaryKeywords = ["CRDT REGD", "CRDT ACQ", "SGPA", "TGP", "CUML"]
            if (summaryKeywords.some((keyword) => subHeader.toUpperCase().includes(keyword))) {
              endCol = j - 1
              break
            }
          }
        }
        if (!endCol) endCol = Math.min(currentSubject.startCol + 10, subHeadersRow.length - 1)
      }

      const columnCount = endCol - currentSubject.startCol + 1

      // Dynamically determine column indices for this subject based on headers and sample data
      const subjectColumnIndices = {
        credits: null,
        cie: null,
        mse: null,
        see: null,
        total: null,
        grade: null,
        gradePoints: null,
        creditPoints: null,
      }

      // First pass: Identify columns based on header and expected data type
      for (let colIdx = currentSubject.startCol; colIdx <= endCol; colIdx++) {
        const subHeader = subHeadersRow[colIdx] ? subHeadersRow[colIdx].toString().trim().toUpperCase() : ""
        const sampleValue = sampleDataRow[colIdx]

        if (subHeader === "CR" && subjectColumnIndices.credits === null) {
          subjectColumnIndices.credits = colIdx
        } else if (subHeader === "CIE" && subjectColumnIndices.cie === null) {
          subjectColumnIndices.cie = colIdx
        } else if (subHeader === "MSE" && subjectColumnIndices.mse === null) {
          subjectColumnIndices.mse = colIdx
        } else if (subHeader === "SEE" && subjectColumnIndices.see === null) {
          subjectColumnIndices.see = colIdx
        } else if ((subHeader === "OB" || subHeader === "TOTAL") && subjectColumnIndices.total === null) {
          subjectColumnIndices.total = colIdx
        } else if (subHeader === "GP" && typeof sampleValue === "number" && subjectColumnIndices.gradePoints === null) {
          subjectColumnIndices.gradePoints = colIdx
        } else if (
          subHeader === "CP" &&
          typeof sampleValue === "number" &&
          subjectColumnIndices.creditPoints === null
        ) {
          subjectColumnIndices.creditPoints = colIdx
        } else if (subHeader === "GR" && isValidGradeString(sampleValue) && subjectColumnIndices.grade === null) {
          subjectColumnIndices.grade = colIdx
        }
      }

      // Second pass: Refine Grade, Grade Points, Credit Points, handling ambiguities and shifts
      // This pass prioritizes data type over header if a primary mapping hasn't been made,
      // and also handles cases where 'GR' might contain a number (grade points).
      for (let colIdx = currentSubject.startCol; colIdx <= endCol; colIdx++) {
        const subHeader = subHeadersRow[colIdx] ? subHeadersRow[colIdx].toString().trim().toUpperCase() : ""
        const sampleValue = sampleDataRow[colIdx]

        // If a column contains a valid grade string and grade is not yet assigned
        if (isValidGradeString(sampleValue) && subjectColumnIndices.grade === null) {
          subjectColumnIndices.grade = colIdx
          console.log(`  Grade column identified by content at index ${colIdx} (header: ${subHeader})`)
        }
        // If a column contains a number and gradePoints is not yet assigned, and it's not the grade column
        else if (
          typeof sampleValue === "number" &&
          subjectColumnIndices.gradePoints === null &&
          colIdx !== subjectColumnIndices.grade
        ) {
          // If this column is 'GR' and contains a number, it's likely the grade points
          if (subHeader === "GR") {
            subjectColumnIndices.gradePoints = colIdx
            console.log(`  Grade Points column identified by 'GR' header with number content at index ${colIdx}`)
          } else {
            // Fallback for other numerical columns that might be grade points
            subjectColumnIndices.gradePoints = colIdx
            console.log(`  Grade Points column identified by number content (fallback) at index ${colIdx}`)
          }
        }
        // If a column contains a number and creditPoints is not yet assigned, and it's not the grade or gradePoints column
        else if (
          typeof sampleValue === "number" &&
          subjectColumnIndices.creditPoints === null &&
          colIdx !== subjectColumnIndices.grade &&
          colIdx !== subjectColumnIndices.gradePoints
        ) {
          subjectColumnIndices.creditPoints = colIdx
          console.log(
            `  Credit Points column identified by number content (fallback) at index ${colIdx} (header: ${subHeader})`,
          )
        }
      }

      console.log("  Identified column indices:", subjectColumnIndices)

      const subjectMapping = {
        code: currentSubject.code,
        name: currentSubject.name,
        startCol: currentSubject.startCol,
        endCol: endCol,
        columnCount: columnCount,
        columnIndices: subjectColumnIndices, // Store the dynamic indices
      }

      subjects.push(subjectMapping)
    }

    // Process student data with enhanced validation
    const results = []

    for (let i = dataStartRowIndex; i < data.length; i++) {
      const row = data[i]
      if (!row || !row[1]) continue // Skip empty rows

      const result = {
        prn: row[1],
        studentName: row[2],
        motherName: row[3],
        program: program,
        year: Number.parseInt(year),
        semester: Number.parseInt(semester),
        examDate: examDate,
        subjects: [],
        sgpa: 0,
        cgpa: 0,
        totalCreditsRegistered: 0,
        totalCreditsAcquired: 0,
        cumulativeGradePoints: 0,
        result: "FAIL",
        remarks: "",
      }

      // Process each subject with dynamic column mapping
      for (const subject of subjects) {
        const subjectData = {
          subjectCode: subject.code,
          subjectName: subject.name,
          credits: null,
          cie: null,
          mse: null,
          see: null,
          total: null,
          grade: "F",
          gradePoints: null,
          creditPoints: null,
        }

        // Helper to get cell value safely
        const getCellValue = (colIndex) => {
          return colIndex !== null && row[colIndex] !== undefined ? row[colIndex] : null
        }

        // Extract data using the dynamically determined column indices
        subjectData.credits = Number.parseFloat(getCellValue(subject.columnIndices.credits)) || null
        subjectData.cie = Number.parseFloat(getCellValue(subject.columnIndices.cie)) || null
        subjectData.mse = Number.parseFloat(getCellValue(subject.columnIndices.mse)) || null
        subjectData.see = Number.parseFloat(getCellValue(subject.columnIndices.see)) || null
        subjectData.total = Number.parseFloat(getCellValue(subject.columnIndices.total)) || null
        subjectData.gradePoints = Number.parseFloat(getCellValue(subject.columnIndices.gradePoints)) || null
        subjectData.creditPoints = Number.parseFloat(getCellValue(subject.columnIndices.creditPoints)) || null

        // Extract grade with robust validation
        const rawGrade = getCellValue(subject.columnIndices.grade)
        if (rawGrade !== null && typeof rawGrade === "string" && isValidGradeString(rawGrade)) {
          subjectData.grade = rawGrade.trim()
        } else {
          console.warn(
            `Row ${i + 1}, Subject ${subject.code}: Invalid or missing grade "${rawGrade}". Defaulting to "F".`,
          )
          subjectData.grade = "F"
        }

        result.subjects.push(subjectData)
      }

      // Extract summary data from the end columns (existing logic remains the same)
      const summaryStartIndex = subjects[subjects.length - 1].endCol + 1

      // Find SGPA, CGPA, etc. from summary section
      for (let j = summaryStartIndex; j < row.length; j++) {
        const header = subHeadersRow[j]
        if (header) {
          const headerUpper = header.toString().toUpperCase()
          if (headerUpper.includes("SGPA")) {
            result.sgpa = Number.parseFloat(row[j]) || 0
          } else if (headerUpper.includes("CGPA")) {
            result.cgpa = Number.parseFloat(row[j]) || 0
          } else if (headerUpper.includes("CLASS")) {
            result.result = (row[j] || "FAIL").toString().trim()
          } else if (headerUpper.includes("REMARKS")) {
            result.remarks = (row[j] || "").toString().trim()
          }
        }
      }

      // Fallback for summary data if not found by headers
      if (result.sgpa === 0 && row.length > 10) {
        result.sgpa = Number.parseFloat(row[row.length - 9]) || 0
      }
      if (result.cgpa === 0 && row.length > 5) {
        result.cgpa = Number.parseFloat(row[row.length - 3]) || 0
      }
      if (result.result === "FAIL" && row.length > 3) {
        result.result = (row[row.length - 2] || "FAIL").toString().trim()
      }

      results.push(result)
    }

    // Save to database
    await Result.insertMany(results)

    res.json({
      message: "Results uploaded successfully",
      count: results.length,
      subjectsDetected: subjects.length,
      subjects: subjects.map(
        (s) =>
          `${s.code} (Cols: Grade=${s.columnIndices.grade}, GP=${s.columnIndices.gradePoints}, CP=${s.columnIndices.creditPoints})`,
      ),
      sampleResults: results.slice(0, 2),
    })
  } catch (error) {
    console.error("Error during file upload and processing:", error)
    res.status(500).json({ message: "Error processing file", error: error.message })
  }
})

// Get all results with pagination
router.get("/results", authMiddleware, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { year, semester, program } = req.query
    const filter = {}

    if (year) filter.year = Number.parseInt(year)
    if (semester) filter.semester = Number.parseInt(semester)
    if (program) filter.program = program

    const results = await Result.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

    const total = await Result.countDocuments(filter)

    res.json({
      results,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error: error.message })
  }
})

// Update result
router.put("/results/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    res.json({ message: "Result updated successfully", result })
  } catch (error) {
    res.status(500).json({ message: "Error updating result", error: error.message })
  }
})

// Delete result
router.delete("/results/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`Attempting to delete result with ID: ${req.params.id}`)
    const result = await Result.findByIdAndDelete(req.params.id)

    if (!result) {
      console.log(`Result with ID ${req.params.id} not found for deletion.`)
      return res.status(404).json({ message: "Result not found" })
    }

    console.log(`Result with ID ${req.params.id} deleted successfully.`)
    res.json({ message: "Result deleted successfully" })
  } catch (error) {
    console.error(`Error deleting result with ID ${req.params.id}:`, error)
    res.status(500).json({ message: "Error deleting result", error: error.message })
  }
})

// Bulk delete results
router.delete("/results/bulk", authMiddleware, async (req, res) => {
  try {
    const { resultIds } = req.body

    if (!resultIds || !Array.isArray(resultIds) || resultIds.length === 0) {
      console.warn("Bulk delete request received with no result IDs provided.")
      return res.status(400).json({ message: "No result IDs provided" })
    }

    console.log(`Attempting to bulk delete results with IDs: ${resultIds.join(", ")}`)
    const deleteResult = await Result.deleteMany({ _id: { $in: resultIds } })

    console.log(`Successfully deleted ${deleteResult.deletedCount} results.`)
    res.json({
      message: `Successfully deleted ${deleteResult.deletedCount} results`,
      deletedCount: deleteResult.deletedCount,
    })
  } catch (error) {
    console.error("Error during bulk deletion:", error)
    // Provide a more specific error message if possible, or a generic one
    res
      .status(500)
      .json({ message: "Error deleting results. Please check server logs for details.", error: error.message })
  }
})

// Get single result for editing
router.get("/results/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Error fetching result", error: error.message })
  }
})

// Update specific subject in result
router.put("/results/:id/subjects/:subjectIndex", authMiddleware, async (req, res) => {
  try {
    const { id, subjectIndex } = req.params
    const subjectData = req.body

    const result = await Result.findById(id)
    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    if (subjectIndex >= result.subjects.length) {
      return res.status(400).json({ message: "Invalid subject index" })
    }

    // Update the specific subject
    result.subjects[subjectIndex] = { ...result.subjects[subjectIndex], ...subjectData }

    // Recalculate SGPA if needed (simplified for demonstration)
    const totalCredits = result.subjects.reduce((sum, sub) => sum + (sub.credits || 0), 0)
    const totalCreditPoints = result.subjects.reduce((sum, sub) => sum + (sub.creditPoints || 0), 0) // Use creditPoints directly
    result.sgpa = totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : 0

    await result.save()

    res.json({ message: "Subject updated successfully", result })
  } catch (error) {
    res.status(500).json({ message: "Error updating subject", error: error.message })
  }
})

// Create notification
router.post("/notifications", authMiddleware, async (req, res) => {
  try {
    const notification = new Notification(req.body)
    await notification.save()

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    })
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message })
  }
})

// Get all notifications
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message })
  }
})

module.exports = router

