"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Search, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"

const StudentResult = () => {
  const [notifications, setNotifications] = useState([])
  const [showResultForm, setShowResultForm] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Result form state
  const [resultForm, setResultForm] = useState({
    prn: "",
    motherName: "",
    year: "",
    semester: "",
    captcha: "",
    captchaAnswer: "",
  })

  // Simple captcha
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: "", answer: "" })

  useEffect(() => {
    fetchNotifications()
    generateCaptcha()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/student/notifications")
      setNotifications(response.data)
    } catch (error) {
      toast.error("Failed to fetch notifications")
    }
  }

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const operators = ["+", "-", "*"]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    let answer
    switch (operator) {
      case "+":
        answer = num1 + num2
        break
      case "-":
        answer = num1 - num2
        break
      case "*":
        answer = num1 * num2
        break
      default:
        answer = num1 + num2
    }

    setCaptchaQuestion({
      question: `${num1} ${operator} ${num2} = ?`,
      answer: answer.toString(),
    })
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
    setResultForm({
      ...resultForm,
      year: notification.year.toString(),
      semester: notification.semester.toString(),
    })
    setShowResultForm(true)
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()

    // Validate captcha
    if (resultForm.captcha !== captchaQuestion.answer) {
      toast.error("Incorrect captcha answer")
      generateCaptcha()
      setResultForm({ ...resultForm, captcha: "" })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("/api/student/verify-and-get-result", {
        prn: resultForm.prn,
        motherName: resultForm.motherName,
        year: resultForm.year,
        semester: resultForm.semester,
      })

      // Navigate to result view with data
      navigate("/result/view", {
        state: {
          result: response.data.result,
          notification: selectedNotification,
        },
      })
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch result")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate("/")} className="mr-4 p-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Student Result Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResultForm ? (
          // Notifications View
          <div>
            <div className="text-center mb-8">
              <Bell className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Notifications</h2>
              <p className="text-gray-600">Click on any notification to view your result</p>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500">No result notifications available at the moment.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                            Year {notification.year}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full mr-2">
                            Semester {notification.semester}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {notification.program}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Published: {new Date(notification.publishedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          // Result Form View
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enter Your Details</h2>
              <button onClick={() => setShowResultForm(false)} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            {selectedNotification && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900">{selectedNotification.title}</h3>
                <p className="text-blue-700 text-sm mt-1">{selectedNotification.message}</p>
              </div>
            )}

            <form onSubmit={handleResultSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PRN Number *</label>
                  <input
                    type="text"
                    value={resultForm.prn}
                    onChange={(e) => setResultForm({ ...resultForm, prn: e.target.value.toUpperCase() })}
                    placeholder="Enter your PRN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name *</label>
                  <input
                    type="text"
                    value={resultForm.motherName}
                    onChange={(e) => setResultForm({ ...resultForm, motherName: e.target.value })}
                    placeholder="Enter mother's name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <select
                    value={resultForm.year}
                    onChange={(e) => setResultForm({ ...resultForm, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select
                    value={resultForm.semester}
                    onChange={(e) => setResultForm({ ...resultForm, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester I</option>
                    <option value="2">Semester II</option>
                  </select>
                </div>
              </div>

              {/* Captcha */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Verification *</label>
                <div className="flex items-center space-x-4">
                  <div className="bg-white border-2 border-gray-300 px-4 py-2 rounded-md font-mono text-lg">
                    {captchaQuestion.question}
                  </div>
                  <input
                    type="text"
                    value={resultForm.captcha}
                    onChange={(e) => setResultForm({ ...resultForm, captcha: e.target.value })}
                    placeholder="Answer"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <button type="button" onClick={generateCaptcha} className="text-sm text-blue-600 hover:text-blue-700">
                    Refresh
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Fetching Result..." : "View Result"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentResult
