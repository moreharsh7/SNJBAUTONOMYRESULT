import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, FileText, Bell, Users, LogOut, Plus, Edit, Trash2, Filter } from 'lucide-react'
import toast from "react-hot-toast"
import axios from "axios"

const AdminPanel = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [results, setResults] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    year: "",
    semester: "",
    program: "",
    examDate: "",
    file: null,
  })

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    year: "",
    semester: "",
    program: "",
  })

  // Filters
  const [filters, setFilters] = useState({
    year: "",
    semester: "",
    program: "",
  })

  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem("adminToken")
    if (!token) {
      navigate("/admin/login")
      return
    }

    // Set default axios header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    if (activeTab === "results") {
      fetchResults()
    } else if (activeTab === "notifications") {
      fetchNotifications()
    }
  }, [activeTab, filters, navigate])

  const fetchResults = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
        ...filters,
      }

      const response = await axios.get("/api/admin/results", { params })
      setResults(response.data.results)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to fetch results")
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/admin/notifications")
      setNotifications(response.data)
    } catch (error) {
      toast.error("Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()

    if (!uploadForm.file) {
      toast.error("Please select a file")
      return
    }

    const formData = new FormData()
    formData.append("excelFile", uploadForm.file)
    formData.append("year", uploadForm.year)
    formData.append("semester", uploadForm.semester)
    formData.append("program", uploadForm.program)
    formData.append("examDate", uploadForm.examDate)

    setLoading(true)
    try {
      const response = await axios.post("/api/admin/upload-results", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      toast.success(`Successfully uploaded ${response.data.count} results`)
      setUploadForm({
        year: "",
        semester: "",
        program: "",
        examDate: "",
        file: null,
      })
      setUploadProgress(0)

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      // Refresh results if on results tab
      if (activeTab === "results") {
        fetchResults()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotification = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      await axios.post("/api/admin/notifications", notificationForm)
      toast.success("Notification created successfully")
      setNotificationForm({
        title: "",
        message: "",
        year: "",
        semester: "",
        program: "",
      })

      // Refresh notifications
      fetchNotifications()
    } catch (error) {
      toast.error("Failed to create notification")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminData")
    delete axios.defaults.headers.common["Authorization"]
    toast.success("Logged out successfully")
    navigate("/")
  }

  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}")

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {adminData.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "dashboard", name: "Dashboard", icon: FileText },
                { id: "upload", name: "Upload Results", icon: Upload },
                { id: "results", name: "Manage Results", icon: Users },
                { id: "notifications", name: "Notifications", icon: Bell },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm text-blue-600 font-medium">Total Results</p>
                        <p className="text-2xl font-bold text-blue-900">{results.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm text-green-600 font-medium">Active Students</p>
                        <p className="text-2xl font-bold text-green-900">{results.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Bell className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm text-purple-600 font-medium">Notifications</p>
                        <p className="text-2xl font-bold text-purple-900">{notifications.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Results</h2>
                <form onSubmit={handleFileUpload} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                      <select
                        value={uploadForm.year}
                        onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        value={uploadForm.semester}
                        onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Semester</option>
                        <option value="1">Semester I</option>
                        <option value="2">Semester II</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                      <input
                        type="text"
                        value={uploadForm.program}
                        onChange={(e) => setUploadForm({ ...uploadForm, program: e.target.value })}
                        placeholder="e.g., B.Tech Computer Engineering"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date *</label>
                      <input
                        type="text"
                        value={uploadForm.examDate}
                        onChange={(e) => setUploadForm({ ...uploadForm, examDate: e.target.value })}
                        placeholder="e.g., Jul 2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excel File *</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload Excel file with student results (Max size: 10MB)
                    </p>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Uploading..." : "Upload Results"}
                  </button>
                </form>
              </div>
            )}

            {/* Results Management Tab */}
            {activeTab === "results" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Results</h2>
                  <div className="flex items-center space-x-4">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Years</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>
                    <select
                      value={filters.semester}
                      onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Semesters</option>
                      <option value="1">Semester I</option>
                      <option value="2">Semester II</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading results...</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {results.map((result) => (
                          <li key={result._id}>
                            <div className="px-4 py-4 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {result.prn} - {result.studentName}
                                  </p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        result.result === "PASS"
                                          ? "bg-green-100 text-green-800"
                                          : result.result === "FAIL"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {result.result}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Year {result.year} - Semester {result.semester} | SGPA: {result.sgpa}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>{result.program}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-md">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <button
                            onClick={() => fetchResults(pagination.current - 1)}
                            disabled={pagination.current === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => fetchResults(pagination.current + 1)}
                            disabled={pagination.current === pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing page <span className="font-medium">{pagination.current}</span> of{" "}
                              <span className="font-medium">{pagination.pages}</span> ({pagination.total} total results)
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => fetchResults(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.current
                                      ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  } ${page === 1 ? "rounded-l-md" : ""} ${page === pagination.pages ? "rounded-r-md" : ""}`}
                                >
                                  {page}
                                </button>
                              ))}
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Notifications</h2>

                {/* Create Notification Form */}
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
                  <form onSubmit={handleCreateNotification} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                        <select
                          value={notificationForm.year}
                          onChange={(e) => setNotificationForm({ ...notificationForm, year: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                        <select
                          value={notificationForm.semester}
                          onChange={(e) => setNotificationForm({ ...notificationForm, semester: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Semester</option>
                          <option value="1">Semester I</option>
                          <option value="2">Semester II</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                        <input
                          type="text"
                          value={notificationForm.program}
                          onChange={(e) => setNotificationForm({ ...notificationForm, program: e.target.value })}
                          placeholder="e.g., B.Tech Computer Engineering"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        placeholder="e.g., Semester II Results Published"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        placeholder="Enter notification message..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? "Creating..." : "Create Notification"}
                    </button>
                  </form>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new notification.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification._id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center mt-3 text-sm text-gray-500">
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
                          <div className="ml-4 flex items-center space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel