const mongoose = require("mongoose")
const Notification = require("./models/Notification")
const Result = require("./models/Result")
const dotenv = require("dotenv")

dotenv.config()

async function createSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/snjbcoe_results")

    // Create sample notification
    const notification = new Notification({
      title: "Semester II Results Published - Jul 2025",
      message: "Results for Semester II examination conducted in Jul 2025 are now available. Students can view their results by entering their PRN and mother's name.",
      year: 2,
      semester: 2,
      program: "B.Tech Computer Engineering",
    })
    await notification.save()

    // Create sample result
    const result = new Result({
      prn: "21CO001",
      studentName: "JOHN DOE",
      motherName: "JANE DOE",
      program: "B.Tech Computer Engineering",
      year: 2,
      semester: 2,
      examDate: "Jul 2025",
      subjects: [
        {
          subjectCode: "21CS201",
          subjectName: "Data Structures and Algorithms",
          credits: 4,
          cie: 18,
          mse: 22,
          see: 35,
          total: 75,
          grade: "A",
          gradePoints: 9,
          creditPoints: 36,
        },
        {
          subjectCode: "21CS202",
          subjectName: "Database Management Systems",
          credits: 4,
          cie: 16,
          mse: 20,
          see: 32,
          total: 68,
          grade: "B+",
          gradePoints: 8,
          creditPoints: 32,
        },
      ],
      sgpa: 8.5,
      cgpa: 8.2,
      totalCreditsRegistered: 20,
      totalCreditsAcquired: 20,
      cumulativeGradePoints: 170,
      result: "PASS",
      remarks: "",
    })
    await result.save()

    console.log("Sample data created successfully!")
    console.log("Test with PRN: 21CO001, Mother's Name: JANE DOE")
    process.exit(0)
  } catch (error) {
    console.error("Error creating sample data:", error)
    process.exit(1)
  }
}

createSampleData()