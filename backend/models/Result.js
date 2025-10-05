const mongoose = require("mongoose")

const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  credits: Number,
  cie: Number,
  mse: Number,
  see: Number,
  total: Number,
  grade: String,
  gradePoints: Number,
  creditPoints: Number,
})

const resultSchema = new mongoose.Schema(
  {
    prn: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    examDate: {
      type: String,
      required: true,
    },
    subjects: [subjectSchema],
    sgpa: {
      type: Number,
      required: true,
    },
    cgpa: {
      type: Number,
      default: 0,
    },
    totalCreditsRegistered: {
      type: Number,
      required: true,
    },
    totalCreditsAcquired: {
      type: Number,
      required: true,
    },
    cumulativeGradePoints: {
      type: Number,
      required: true,
    },
    result: {
      type: String,
      enum: ["PASS", "FAIL", "A.T.K.T."],
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient queries
resultSchema.index({ prn: 1, year: 1, semester: 1 })

module.exports = mongoose.model("Result", resultSchema)
