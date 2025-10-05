"use client"

import { useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Download, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const ResultView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const resultRef = useRef()

  const { result, notification } = location.state || {}

  if (!result) {
    navigate("/student/result")
    return null
  }

  const downloadPDF = async () => {
    const element = resultRef.current
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${result.prn}_Result_Sem${result.semester}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/student/result")}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Examination Result</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Result Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        <div ref={resultRef} className="bg-white shadow-lg print:shadow-none">
          {/* College Header */}
          <div className="border-b-2 border-gray-300 p-6 text-center">
            <img src="https://www.snjb.org/engineering-old/assets-main/img/snjb1.jpg" alt="SNJBCOE Logo" className="mx-auto h-16 w-16 mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              SNJB's Late Sau. Kantabai Bhavarlaji Jain College Of Engineering
            </h1>
            <p className="text-sm text-gray-600 mb-2">Examination Result Sheet</p>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Program:</span> {result.program} |
              <span className="font-medium ml-2">Year:</span> {result.year} |
              <span className="font-medium ml-2">Semester:</span> {result.semester} |
              <span className="font-medium ml-2">Exam Date:</span> {result.examDate}
            </div>
          </div>

          {/* Student Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">PRN:</span>
                <span className="ml-2 text-gray-900">{result.prn}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Student Name:</span>
                <span className="ml-2 text-gray-900">{result.studentName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Mother's Name:</span>
                <span className="ml-2 text-gray-900">{result.motherName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Result:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                    result.result === "PASS"
                      ? "bg-green-100 text-green-800"
                      : result.result === "FAIL"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {result.result}
                </span>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Subject-wise Result</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Subject</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Credits</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">CIE</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">MSE</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">SEE</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Total</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Grade</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Grade Points</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Credit Points</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects &&
                    result.subjects.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium">
                          <div>{subject.subjectCode}</div>
                          <div className="text-xs text-gray-600">{subject.subjectName}</div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.credits}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.cie}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.mse}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.see}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center font-medium">{subject.total}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              ["A+", "A", "B+", "B"].includes(subject.grade)
                                ? "bg-green-100 text-green-800"
                                : ["C", "D"].includes(subject.grade)
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.gradePoints}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">{subject.creditPoints}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.sgpa}</div>
                <div className="text-sm text-gray-600">SGPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.cgpa}</div>
                <div className="text-sm text-gray-600">CGPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.totalCreditsAcquired}</div>
                <div className="text-sm text-gray-600">Credits Acquired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{result.totalCreditsRegistered}</div>
                <div className="text-sm text-gray-600">Credits Registered</div>
              </div>
            </div>

            {result.remarks && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <span className="font-medium text-gray-700">Remarks:</span>
                <span className="ml-2 text-gray-900">{result.remarks}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 text-center text-sm text-gray-500 border-t">
            <p>This is a computer-generated result. No signature is required.</p>
            <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultView
