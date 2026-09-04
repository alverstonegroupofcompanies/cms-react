import axios from 'axios'
import type { Patient, RegisterPatientPayload } from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const sendOtp = (email: string) => api.post('/auth/send-otp', { email })
export const verifyOtp = (email: string, code: string) =>
  api.post('/auth/verify-otp', { email, code })
export const registerPatient = (data: RegisterPatientPayload | FormData) =>
  data instanceof FormData
    ? api.post('/auth/register-patient', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/auth/register-patient', data)
export const patientLogin = (login: string, password: string) =>
  api.post('/auth/patient-login', { login, password })
export const resetPassword = (
  password: string,
  password_confirmation: string,
  current_password?: string
) =>
  api.post('/auth/reset-password', {
    password,
    password_confirmation,
    ...(current_password ? { current_password } : {}),
  })
export const staffLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password })
export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
export const devLogin = (role: 'admin' | 'doctor' | 'receptionist' | 'patient') =>
  api.post(`/auth/dev-login/${role}`)

// Patients
export const getPatients = (search?: string) =>
  api.get('/patients', { params: { search } })
export const searchPatients = (phone = '') =>
  api.get('/patients/search', { params: { phone } })
export const createPatient = (data: FormData | Partial<Patient>) =>
  data instanceof FormData
    ? api.post('/patients', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/patients', data)
export const issuePatientLogin = (id: number) => api.post(`/patients/${id}/issue-login`)
export const getPatient = (id: number) => api.get(`/patients/${id}`)
export const getMyProfile = () => api.get('/patients/me')
export const updateMyProfile = (data: object) => api.patch('/patients/me', data)

// Clinics & Departments
export const getClinics = () => api.get('/clinics')
export const getDepartments = (clinicId: number) =>
  api.get('/departments', { params: { clinic_id: clinicId } })

// Doctors
export const getDoctors = (params?: { clinic_id?: number; department_id?: number }) =>
  api.get('/doctors', { params })
export const createDoctor = (data: object) => api.post('/doctors', data)
export const approveDoctor = (id: number) => api.patch(`/doctors/${id}/approve`)
export const deactivateDoctor = (id: number) => api.patch(`/doctors/${id}/deactivate`)
export const setDoctorAvailability = (id: number, availability: object[]) =>
  api.post(`/doctors/${id}/availability`, { availability })
export const getDoctorAvailability = (id: number) => api.get(`/doctors/${id}/availability`)
export const getDoctorAvailableDates = (id: number, days = 28) =>
  api.get(`/doctors/${id}/available-dates`, { params: { days } })

// Appointments
export const getSlots = (doctorId: number, date: string, excludeAppointmentId?: number) =>
  api.get('/appointments/slots', {
    params: {
      doctor_id: doctorId,
      date,
      ...(excludeAppointmentId ? { exclude_appointment_id: excludeAppointmentId } : {}),
    },
  })
export const getDaySchedule = (doctorId: number, date: string) =>
  api.get('/appointments/day-schedule', { params: { doctor_id: doctorId, date } })
export const getAppointments = (params?: object) => api.get('/appointments', { params })
export const bookAppointment = (data: object) => api.post('/appointments', data)
export const checkInAppointment = (id: number) => api.patch(`/appointments/${id}/check-in`)
export const cancelAppointment = (id: number) => api.patch(`/appointments/${id}/cancel`)
export const rescheduleAppointment = (id: number, data: { appointment_date: string; slot_time: string }) =>
  api.patch(`/appointments/${id}/reschedule`, data)

// Queue
export const joinQueue = (patientId: number, doctorId: number, date?: string) =>
  api.post('/queue/join', { patient_id: patientId, doctor_id: doctorId, date })
export const getQueueDayBoard = (date?: string) =>
  api.get('/queue/day-board', { params: { date } })
export const getQueueStatus = (doctorId: number, date?: string) =>
  api.get('/queue/status', { params: { doctor_id: doctorId, date } })
export const getMyPosition = (doctorId: number, date?: string) =>
  api.get('/queue/my-position', { params: { doctor_id: doctorId, date } })
export const callNext = (doctorId: number, date?: string) =>
  api.post('/queue/call-next', { doctor_id: doctorId, date })
export const completeToken = (id: number) => api.patch(`/queue/${id}/complete`)
export const cancelToken = (id: number) => api.patch(`/queue/${id}/cancel`)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

// Pharmacy
export const getMedicines = () => api.get('/medicines')
export const createMedicine = (data: object) => api.post('/medicines', data)
export const getPrescriptions = (params?: object) => api.get('/prescriptions', { params })
export const createPrescription = (data: object) => api.post('/prescriptions', data)
export const dispensePrescription = (id: number, notes?: string) =>
  api.post(`/prescriptions/${id}/dispense`, { notes })

// Lab
export const getLabTests = () => api.get('/lab-tests')
export const getLabOrders = (params?: object) => api.get('/lab-orders', { params })
export const createLabOrder = (data: object) => api.post('/lab-orders', data)
export const uploadLabReport = (id: number, formData: FormData) =>
  api.post(`/lab-orders/${id}/report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Staff
export const getStaff = () => api.get('/staff')
export const createReceptionist = (data: object) => api.post('/staff/receptionist', data)
