import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import HomePage from "./components/HomePage"
import AdminLogin from "./components/admin/AdminLogin"
import AdminPanel from "./components/admin/AdminPanel"
import StudentResult from "./components/student/StudentResult"
import ResultView from "./components/student/ResultView"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/student/result" element={<StudentResult />} />
          <Route path="/result/view" element={<ResultView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App