import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import StaffLogin from './pages/StaffLogin'
import PatientLanding from './pages/patient/Landing'
import PatientAbout from './pages/patient/About'
import PatientLogin from './pages/patient/Login'
import PatientRegister from './pages/patient/Register'
import PatientDashboard from './pages/patient/Dashboard'
import PatientResetPassword from './pages/patient/ResetPassword'
import PatientProfile from './pages/patient/Profile'
import BookAppointment from './pages/patient/BookAppointment'
import MyAppointments from './pages/patient/MyAppointments'
import LabReports from './pages/patient/LabReports'
import PatientPrescriptions from './pages/patient/Prescriptions'
import ReceptionistDashboard from './pages/receptionist/Dashboard'
import ReceptionistPatients from './pages/receptionist/Patients'
import ReceptionistBookAppointment from './pages/receptionist/BookAppointment'
import ReceptionistDoctors from './pages/receptionist/Doctors'
import QueueBoard from './pages/receptionist/QueueBoard'
import ReceptionistAppointments from './pages/receptionist/Appointments'
import ReceptionistCalendar from './pages/receptionist/Calendar'
import ReceptionistPharmacy from './pages/receptionist/Pharmacy'
import PharmacyDashboard from './pages/pharmacy/Dashboard'
import PharmacyMedicines from './pages/pharmacy/Medicines'
import PharmacySales from './pages/pharmacy/Sales'
import LabDashboard from './pages/lab/Dashboard'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorCalendar from './pages/doctor/Calendar'
import DoctorQueue from './pages/doctor/Queue'
import DoctorWorksheet from './pages/doctor/Worksheet'
import DoctorPatient from './pages/doctor/Patient'
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
          <Route path="/patient" element={<PatientLanding />} />
          <Route path="/patient/about" element={<PatientAbout />} />
          <Route path="/patient/contact" element={<Navigate to={{ pathname: '/patient', hash: 'contact' }} replace />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/receptionist/login" element={<StaffLogin role="receptionist" redirect="/receptionist/dashboard" title="Reception sign in" />} />
          <Route path="/doctor/login" element={<StaffLogin role="doctor" redirect="/doctor/dashboard" title="Doctor sign in" />} />
          <Route path="/pharmacy/login" element={<StaffLogin role="pharmacy" redirect="/pharmacy/dashboard" title="Pharmacy sign in" />} />
          <Route path="/lab/login" element={<StaffLogin role="lab" redirect="/lab/dashboard" title="Lab sign in" />} />
          <Route path="/admin/login" element={<StaffLogin role="admin" redirect="/admin/dashboard" title="Admin sign in" />} />

          <Route element={<ProtectedRoute roles={['patient']} />}>
            <Route path="/patient/reset-password" element={<PatientResetPassword />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/lab-reports" element={<LabReports />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
          </Route>

          <Route element={<ProtectedRoute roles={['receptionist', 'admin']} />}>
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patients" element={<ReceptionistPatients />} />
            <Route path="/receptionist/book" element={<ReceptionistBookAppointment />} />
            <Route path="/receptionist/doctors" element={<ReceptionistDoctors />} />
            <Route path="/receptionist/queue" element={<QueueBoard />} />
            <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
            <Route path="/receptionist/calendar" element={<ReceptionistCalendar />} />
            <Route path="/receptionist/pharmacy" element={<ReceptionistPharmacy />} />
          </Route>

          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/calendar" element={<DoctorCalendar />} />
            <Route path="/doctor/queue" element={<DoctorQueue />} />
            <Route path="/doctor/patients" element={<DoctorPatient />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatient />} />
            <Route path="/doctor/worksheet/:id" element={<DoctorWorksheet />} />
          </Route>

          <Route element={<ProtectedRoute roles={['pharmacy', 'admin']} />}>
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/sales" element={<PharmacySales />} />
            <Route path="/pharmacy/medicines" element={<PharmacyMedicines />} />
          </Route>

          <Route element={<ProtectedRoute roles={['lab', 'admin']} />}>
            <Route path="/lab/dashboard" element={<LabDashboard />} />
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
