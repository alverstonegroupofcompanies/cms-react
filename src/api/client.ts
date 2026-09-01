import axios from 'axios'

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
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const sendOtp = (phone: string) => api.post('/auth/send-otp', { phone })
export const verifyOtp = (phone: string, code: string, name?: string) =>
  api.post('/auth/verify-otp', { phone, code, name })
export const staffLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password })
export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
export const devLogin = (role: 'admin' | 'doctor' | 'receptionist' | 'patient') =>
  api.post(`/auth/dev-login/${role}`)

// Patients
export const getPatients = (search?: string) =>
  api.get('/patients', { params: { search } })
export const searchPatients = (phone: string) =>
  api.get('/patients/search', { params: { phone } })
export const createPatient = (data: Partial<Patient>) => api.post('/patients', data)
export const getPatient = (id: number) => api.get(`/patients/${id}`)

// Doctors
export const getDoctors = () => api.get('/doctors')
export const createDoctor = (data: object) => api.post('/doctors', data)
export const approveDoctor = (id: number) => api.patch(`/doctors/${id}/approve`)
export const deactivateDoctor = (id: number) => api.patch(`/doctors/${id}/deactivate`)
export const setDoctorAvailability = (id: number, availability: object[]) =>
  api.post(`/doctors/${id}/availability`, { availability })
export const getDoctorAvailability = (id: number) => api.get(`/doctors/${id}/availability`)

// Appointments
export const getSlots = (doctorId: number, date: string) =>
  api.get('/appointments/slots', { params: { doctor_id: doctorId, date } })
export const getAppointments = (params?: object) => api.get('/appointments', { params })
export const bookAppointment = (data: object) => api.post('/appointments', data)
export const checkInAppointment = (id: number) => api.patch(`/appointments/${id}/check-in`)
export const cancelAppointment = (id: number) => api.patch(`/appointments/${id}/cancel`)

// Queue
export const joinQueue = (patientId: number, doctorId: number, date?: string) =>
  api.post('/queue/join', { patient_id: patientId, doctor_id: doctorId, date })
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

import type { Patient } from './types'
