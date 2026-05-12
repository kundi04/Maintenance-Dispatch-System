import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ResidentDashboard from './pages/ResidentDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resident" element={<ResidentDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
