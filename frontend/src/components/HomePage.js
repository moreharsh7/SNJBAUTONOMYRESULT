"use client"
import { useNavigate } from "react-router-dom"
import { GraduationCap, Shield, FileText, Bell } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEeK4AP2U1XFuCKIbmZCBl1ussSaVJpfMdLA&s" alt="SNJBCOE Logo" className="mx-auto h-20 w-20 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">
              SNJB's Late Sau. Kantabai Bhavarlaji Jain College Of Engineering
            </h1>
            <p className="text-lg text-gray-600 mt-2">Result Management System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Result Portal</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access your examination results and manage academic records with ease
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Student Portal Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Portal</h3>
              <p className="text-gray-600 mb-6">
                View your examination results, check notifications, and download result PDFs
              </p>
              <button
                onClick={() => navigate("/student/result")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Results
              </button>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Portal</h3>
              <p className="text-gray-600 mb-6">Upload results, manage notifications, and oversee student records</p>
              <button
                onClick={() => navigate("/admin/login")}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Digital Results</h4>
              <p className="text-gray-600">Access your results online in a clean, PDF-like format</p>
            </div>
            <div className="text-center">
              <Bell className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Notifications</h4>
              <p className="text-gray-600">Get notified immediately when new results are published</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure Access</h4>
              <p className="text-gray-600">Your data is protected with secure verification processes</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 SNJB's Late Sau. Kantabai Bhavarlaji Jain College Of Engineering. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage