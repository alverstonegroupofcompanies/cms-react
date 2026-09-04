export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: 'admin' | 'doctor' | 'receptionist' | 'patient'
  status: string
  must_reset_password?: boolean
  has_password?: boolean
  patient?: Patient
  doctor?: Doctor
}

export interface Clinic {
  id: number
  name: string
  code: string
  address?: string
}

export interface Department {
  id: number
  clinic_id: number
  name: string
  code?: string
}

export interface Patient {
  id: number
  patient_code: string
  name: string
  user_id?: number
  registration_source?: string
  first_name?: string
  last_name?: string
  phone: string
  email?: string
  dob?: string
  gender?: string
  blood_group?: string
  marital_status?: string
  symptoms?: string
  current_medications?: string
  taking_medications?: boolean
  address?: string
  address_street?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  emergency_contact?: string
  emergency_contact_first_name?: string
  emergency_contact_last_name?: string
  emergency_contact_relationship?: string
  emergency_contact_phone?: string
  photo_path?: string | null
  photo_url?: string | null
  upcoming_appointment?: PatientVisitSummary | null
  last_appointment?: PatientVisitSummary | null
}

export interface PatientVisitSummary {
  id: number
  appointment_date: string
  slot_time?: string | null
  status: string
  doctor?: { id: number; name: string; specialization?: string } | null
}

export interface RegisterPatientPayload {
  first_name: string
  last_name?: string
  phone: string
  email?: string
  password: string
  password_confirmation: string
  gender?: 'male' | 'female' | 'other'
  dob?: string
  address?: string
  blood_group?: string
  emergency_contact?: string
  code?: string
}

export interface Doctor {
  id: number
  name: string
  specialization: string
  phone: string
  email: string
  status: string
  clinic_id?: number
  department_id?: number
  consultation_fee?: number
  lunch_start?: string
  lunch_end?: string
  clinic?: Clinic
  department?: Department
  availability?: DoctorAvailability[]
}

export interface DoctorAvailability {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  clinic_id?: number
  department_id?: number
  appointment_date: string
  slot_time: string
  status: string
  type?: string
  patient?: Patient
  doctor?: Doctor
  clinic?: Clinic
  department?: Department
}

export interface BookingConfirmation {
  appointment: Appointment
  queue_token: QueueToken
}

export interface QueueToken {
  id: number
  token_number: number
  display_code: string
  status: string
  patient?: Patient
  doctor?: Doctor
  appointment_id?: number
}

export interface Slot {
  time: string
  slot_time: string
  duration_minutes?: number
  status?: string
}

export interface DayScheduleSlot {
  time: string
  slot_time: string
  duration_minutes: number
  status: 'available' | 'booked' | 'lunch' | 'past' | string
  appointment_id?: number
  appointment_status?: string
  appointment_type?: string
  patient?: {
    id: number
    name: string
    patient_code: string
    phone: string
    email?: string | null
  } | null
}

export interface AvailableDate {
  date: string
  day: string
  label: string
}

export interface Medicine {
  id: number
  name: string
  generic_name?: string
  unit: string
  stock_quantity: number
  unit_price: number
}

export interface Prescription {
  id: number
  patient_id: number
  doctor_id: number
  status: string
  notes?: string
  patient?: Patient
  doctor?: Doctor
  items?: PrescriptionItem[]
}

export interface PrescriptionItem {
  id: number
  medicine_id: number
  dosage: string
  frequency: string
  duration_days: number
  quantity: number
  medicine?: Medicine
}

export interface LabTest {
  id: number
  name: string
  code: string
  description?: string
  price: number
}

export interface LabOrder {
  id: number
  patient_id: number
  doctor_id: number
  status: string
  notes?: string
  patient?: Patient
  doctor?: Doctor
  items?: { id: number; lab_test: LabTest }[]
  report?: { file_path: string; file_name: string; result_summary?: string }
}

export interface DashboardStats {
  total_patients: number
  total_doctors: number
  today_appointments: number
  today_queue_length: number
}
