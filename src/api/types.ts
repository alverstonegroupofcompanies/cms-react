export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: 'admin' | 'doctor' | 'receptionist' | 'patient'
  status: string
  patient?: Patient
  doctor?: Doctor
}

export interface Patient {
  id: number
  patient_code: string
  name: string
  phone: string
  email?: string
  dob?: string
  gender?: string
  address?: string
}

export interface Doctor {
  id: number
  name: string
  specialization: string
  phone: string
  email: string
  status: string
  consultation_fee?: number
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
  appointment_date: string
  slot_time: string
  status: string
  patient?: Patient
  doctor?: Doctor
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
