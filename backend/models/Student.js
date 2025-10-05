const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema(
  {
    prn: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
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
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Student", studentSchema)
