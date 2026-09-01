import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import StaffLogin from './pages/StaffLogin'
import PatientLogin from './pages/patient/Login'
import PatientDashboard from './pages/patient/Dashboard'
import BookAppointment from './pages/patient/BookAppointment'
import JoinQueue from './pages/patient/JoinQueue'
import MyAppointments from './pages/patient/MyAppointments'
import LabReports from './pages/patient/LabReports'
import ReceptionistDashboard from './pages/receptionist/Dashboard'
import ReceptionistPatients from './pages/receptionist/Patients'
import QueueBoard from './pages/receptionist/QueueBoard'
import ReceptionistAppointments from './pages/receptionist/Appointments'
import ReceptionistPharmacy from './pages/receptionist/Pharmacy'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorQueue from './pages/doctor/Queue'
import DoctorPrescriptions from './pages/doctor/Prescriptions'
import DoctorLabOrders from './pages/doctor/LabOrders'
import AdminDashboard from './pages/admin/Dashboard'
import AdminDoctors from './pages/admin/Doctors'
import AdminPatients from './pages/admin/Patients'
import AdminStaff from './pages/admin/Staff'
import AdminMedicines from './pages/admin/Medicines'
import AdminLab from './pages/admin/Lab'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/receptionist/login" element={<StaffLogin role="receptionist" redirect="/receptionist/dashboard" title="Receptionist Login" />} />
          <Route path="/doctor/login" element={<StaffLogin role="doctor" redirect="/doctor/dashboard" title="Doctor Login" />} />
          <Route path="/admin/login" element={<StaffLogin role="admin" redirect="/admin/dashboard" title="Admin Login" />} />

          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/queue" element={<JoinQueue />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/lab-reports" element={<LabReports />} />
          </Route>

          <Route element={<ProtectedRoute roles={['receptionist', 'admin']} />}>
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patients" element={<ReceptionistPatients />} />
            <Route path="/receptionist/queue" element={<QueueBoard />} />
            <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
            <Route path="/receptionist/pharmacy" element={<ReceptionistPharmacy />} />
          </Route>

          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/queue" element={<DoctorQueue />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/doctor/lab-orders" element={<DoctorLabOrders />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/medicines" element={<AdminMedicines />} />
            <Route path="/admin/lab" element={<AdminLab />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
