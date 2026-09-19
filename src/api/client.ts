import axios from 'axios'
import type { Patient, RegisterPatientPayload } from './types'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

/** Public auth routes — a 401 here is a bad password/OTP, not an expired session. */
const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/patient-login',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/register-patient',
  '/auth/reset-password-with-otp',
  '/auth/dev-login',
]

function clearStoredAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth:session-cleared'))
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = String(err.config?.url ?? '')
    const hadBearer = Boolean(
      err.config?.headers?.Authorization || localStorage.getItem('token')
    )
    const isPublicAuth = AUTH_PUBLIC_PATHS.some((p) => url.includes(p))
    const isLogout = url.includes('/auth/logout')

    // Only end the session when an authenticated API call is rejected as
    // unauthenticated. Never clear on public login failures, network blips,
    // or explicit logout (logout clears itself).
    if (status === 401 && hadBearer && !isPublicAuth && !isLogout) {
      clearStoredAuth()
      const path = window.location.pathname
      if (
        !path.includes('/login') &&
        !path.includes('/register') &&
        path !== '/'
      ) {
        window.location.href = '/'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const sendOtp = (email: string, purpose?: 'register' | 'login' | 'reset_password') =>
  api.post('/auth/send-otp', { email, purpose })
export const verifyOtp = (email: string, code: string) =>
  api.post('/auth/verify-otp', { email, code })
export const registerPatient = (data: RegisterPatientPayload | FormData) =>
  data instanceof FormData
    ? api.post('/auth/register-patient', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/auth/register-patient', data)
export const patientLogin = (login: string, password: string) =>
  api.post('/auth/patient-login', { login, password })
export const resetPassword = (password: string, current_password?: string) =>
  api.post('/auth/reset-password', {
    password,
    ...(current_password ? { current_password } : {}),
  })
export const resetPasswordWithOtp = (
  email: string,
  code: string,
  password: string,
  password_confirmation: string
) =>
  api.post('/auth/reset-password-with-otp', {
    email,
    code,
    password,
    password_confirmation,
  })
export const staffLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password })
export const getMe = () => api.get('/auth/me')
export const logout = () => api.post('/auth/logout')
export const devLogin = (role: 'admin' | 'doctor' | 'receptionist' | 'pharmacy' | 'lab' | 'patient') =>
  api.post(`/auth/dev-login/${role}`)

// Patients
export const getPatients = (search?: string) =>
  api.get('/patients', { params: { search } })
export const searchPatients = (phone = '') =>
  api.get('/patients/search', { params: { phone } })
/** Doctor: patients previously seen, newest visit first. */
export const getDoctorPatients = (search = '') =>
  api.get('/patients/my-patients', { params: search ? { search } : {} })
export const createPatient = (data: FormData | Partial<Patient>) =>
  data instanceof FormData
    ? api.post('/patients', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/patients', data)
export const updatePatient = (id: number, data: FormData | object) =>
  data instanceof FormData
    ? api.post(`/patients/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.patch(`/patients/${id}`, data)
export const deletePatient = (id: number) =>
  api.post(`/patients/${id}/delete`)
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
export const createDoctor = (data: object | FormData) =>
  data instanceof FormData
    ? api.post('/doctors', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/doctors', data)
export const updateDoctor = (id: number, data: object | FormData) =>
  data instanceof FormData
    ? api.post(`/doctors/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post(`/doctors/${id}`, data)
export const resetDoctorPassword = (id: number, password: string, must_reset_password = true) =>
  api.post(`/doctors/${id}/reset-password`, { password, must_reset_password })
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
export const getAppointmentCalendar = (params: { year: number; month: number; doctor_id?: number }) =>
  api.get('/appointments/calendar', { params })
export const getAppointments = (params?: object) => api.get('/appointments', { params })
export const bookAppointment = (data: object) => api.post('/appointments', data)
export const checkInAppointment = (id: number) => api.patch(`/appointments/${id}/check-in`)
export const checkOutAppointment = (id: number) => api.patch(`/appointments/${id}/check-out`)
export const cancelAppointment = (id: number) => api.patch(`/appointments/${id}/cancel`)
export const rescheduleAppointment = (id: number, data: { appointment_date: string; slot_time: string }) =>
  api.patch(`/appointments/${id}/reschedule`, data)

// Queue
export const joinQueue = (patientId: number, doctorId: number, date?: string) =>
  api.post('/queue/join', { patient_id: patientId, doctor_id: doctorId, date })
export const getQueueDayBoard = (date?: string, doctorId?: number) =>
  api.get('/queue/day-board', { params: { date, doctor_id: doctorId } })
export const getQueueStatus = (doctorId: number, date?: string) =>
  api.get('/queue/status', { params: { doctor_id: doctorId, date } })
export const getMyPosition = (doctorId: number, date?: string) =>
  api.get('/queue/my-position', { params: { doctor_id: doctorId, date } })
export const getMyActiveQueue = (date?: string) =>
  api.get('/queue/my-active', { params: { date } })
export const callNext = (doctorId: number, date?: string) =>
  api.post('/queue/call-next', { doctor_id: doctorId, date })
export const checkInQueueToken = (id: number) => api.patch(`/queue/${id}/check-in`)
export const checkOutQueueToken = (id: number) => api.patch(`/queue/${id}/check-out`)
export const completeToken = (id: number) => api.patch(`/queue/${id}/complete`)
export const cancelToken = (id: number) => api.patch(`/queue/${id}/cancel`)

// Clinical worksheets (doctor consult visit)
export const getWorksheets = (params?: object) => api.get('/worksheets', { params })
export const getWorksheet = (id: number | string) => api.get(`/worksheets/${id}`)
export const getWorksheetByToken = (tokenId: number) => api.get(`/worksheets/by-token/${tokenId}`)
export const updateWorksheet = (id: number | string, data: object) =>
  api.patch(`/worksheets/${id}`, data)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getPeakBookingHours = (params?: {
  range?: 'today' | '7d' | '30d' | '90d' | 'month' | 'all'
  days?: number
  doctor_id?: number
}) => api.get('/dashboard/peak-booking-hours', { params })

// Pharmacy
export const getMedicines = (params?: {
  q?: string
  page?: number
  per_page?: number
  in_stock?: boolean | number
}) => api.get('/medicines', { params })
export const resolveMedicine = (data: {
  clinic_product_id: number
  name: string
  generic_name?: string | null
  sku?: string | null
  strength?: string | null
  manufacturer?: string | null
  unit?: string
  stock_quantity?: number
  unit_price?: number
  clinic_external_id?: string | null
  is_active?: boolean
}) => api.post('/medicines/resolve', data)
export const createMedicine = (data: object) => api.post('/medicines', data)
export const getPrescriptions = (params?: object) => api.get('/prescriptions', { params })
export const createPrescription = (data: object) => api.post('/prescriptions', data)
export const dispensePrescription = (id: number, notes?: string) =>
  api.post(`/prescriptions/${id}/dispense`, { notes })

// Lab
export const getLabTests = () => api.get('/lab-tests')
export const getLabOrders = (params?: object) => api.get('/lab-orders', { params })
export const getLabOrder = (id: number) => api.get(`/lab-orders/${id}`)
export const createLabOrder = (data: object) => api.post('/lab-orders', data)
export const uploadLabReport = (id: number, formData: FormData) =>
  api.post(`/lab-orders/${id}/report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const saveLabOrderResults = (
  id: number,
  items: Array<{ id: number; results?: Record<string, string> | null }>
) => api.patch(`/lab-orders/${id}/results`, { items })

// Visit bills (final submit snapshot for doctor / pharmacy / lab)
export const getVisitBills = (params?: object) => api.get('/visit-bills', { params })
export const getVisitBill = (id: number) => api.get(`/visit-bills/${id}`)
export const updateVisitBillPharmacyItems = (
  id: number,
  items: Array<{ id: number; included?: boolean; qty?: number; purchased?: boolean }>
) => api.patch(`/visit-bills/${id}/pharmacy-items`, { items })
export const updateVisitBillLabItems = (
  id: number,
  items: Array<{ id: number; included?: boolean }>
) => api.patch(`/visit-bills/${id}/lab-items`, { items })
export const markVisitBillPharmacyDone = (id: number) => api.post(`/visit-bills/${id}/pharmacy-done`)
export const markVisitBillLabDone = (id: number) => api.post(`/visit-bills/${id}/lab-done`)
export const getPharmacySales = (params?: { from?: string; to?: string }) =>
  api.get('/pharmacy/sales', { params })

// Staff
export const getStaff = () => api.get('/staff')
export const createReceptionist = (data: object) => api.post('/staff/receptionist', data)
