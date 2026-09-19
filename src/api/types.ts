export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: 'admin' | 'doctor' | 'receptionist' | 'pharmacy' | 'lab' | 'patient'
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
  visit_count?: number
  last_visit_at?: string | null
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
  phone_secondary?: string | null
  email: string
  status: string
  photo_path?: string | null
  photo_url?: string | null
  clinic_id?: number
  department_id?: number
  consultation_fee?: number
  lunch_start?: string
  lunch_end?: string
  clinic?: Clinic
  department?: Department
  availability?: DoctorAvailability[]
  user?: { id: number; email: string; must_reset_password?: boolean }
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
  queue_token?: QueueToken | null
}

export interface BookingConfirmation {
  appointment: Appointment
  queue_token?: QueueToken | null
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
  duration_minutes?: number | null
  status?: string
}

export interface DayScheduleSlot {
  time: string
  slot_time: string
  duration_minutes?: number | null
  status: 'available' | 'booked' | 'lunch' | 'past' | string
  appointment_id?: number | null
  appointment_status?: string | null
  appointment_type?: string | null
  source?: string | null
  token_id?: number | null
  token_number?: number | null
  display_code?: string | null
  queue_status?: string | null
  checked_in_at?: string | null
  checked_out_at?: string | null
  entered_at?: string | null
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
  clinic_product_id?: number | null
  clinic_external_id?: string | null
  name: string
  generic_name?: string | null
  sku?: string | null
  strength?: string | null
  manufacturer?: string | null
  unit: string
  stock_quantity: number
  unit_price: number
  is_active?: boolean
}

export interface MedicineListResponse {
  data: Medicine[]
  meta?: {
    current_page?: number
    per_page?: number
    total?: number
    last_page?: number
  }
  links?: Record<string, unknown>
  source?: 'clinic' | string
  message?: string
}

export interface Prescription {
  id: number
  patient_id: number
  doctor_id: number
  queue_token_id?: number | null
  worksheet_id?: number | null
  status: string
  notes?: string
  created_at?: string
  patient?: Patient
  doctor?: Doctor
  items?: PrescriptionItem[]
  queue_token?: { id: number; display_code: string; token_number?: number } | null
  worksheet?: { id: number; worksheet_code: string; opened_at?: string | null } | null
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
  queue_token_id?: number | null
  worksheet_id?: number | null
  status: string
  notes?: string
  created_at?: string
  patient?: Patient
  doctor?: Doctor
  items?: {
    id: number
    lab_test: LabTest
    results?: Record<string, string> | null
  }[]
  report?: { file_path: string; file_name: string; result_summary?: string }
  queue_token?: { id: number; display_code: string; token_number?: number } | null
  worksheet?: { id: number; worksheet_code: string; opened_at?: string | null } | null
}

export interface DashboardStats {
  total_patients: number
  total_doctors: number
  today_appointments: number
  today_queue_length: number
}

export interface CalendarDaySummary {
  date: string
  total: number
  booked: number
  checked_in: number
  completed: number
  no_show: number
  walk_in: number
}

export interface AppointmentCalendarResponse {
  year: number
  month: number
  doctor_id: number | null
  days: CalendarDaySummary[]
}

export interface PeakBookingHour {
  hour: number
  label: string
  count: number
}

export interface PeakBookingHoursResponse {
  range: 'today' | '7d' | '30d' | '90d' | 'month' | 'all'
  range_label: string
  from: string | null
  to: string | null
  days: number | null
  total_appointments: number
  peak_hour: number | null
  peak_label: string | null
  peak_count: number
  hours: PeakBookingHour[]
  updated_at?: string
}

export interface Worksheet {
  id: number
  worksheet_code: string
  patient_id: number
  doctor_id: number
  queue_token_id: number
  appointment_id?: number | null
  status: 'open' | 'closed' | string
  chief_complaint?: string | null
  clinical_notes?: string | null
  clinical_data?: Record<string, unknown> | null
  diagnosis?: string | null
  advice?: string | null
  follow_up?: string | null
  opened_at?: string | null
  closed_at?: string | null
  patient?: Patient | null
  doctor?: Doctor | null
  queue_token?: {
    id: number
    display_code: string
    status: string
    called_at?: string | null
  } | null
  prescriptions?: Array<{
    id: number
    status: string
    notes?: string | null
    created_at?: string
    items?: Array<{
      id: number
      medicine_id?: number
      dosage: string
      frequency: string
      duration_days: number
      quantity: number
      medicine?: { id: number; name: string; unit_price?: number }
    }>
  }>
  lab_orders?: Array<{
    id: number
    status: string
    notes?: string | null
    created_at?: string
    items?: Array<{
      id: number
      lab_test_id?: number
      lab_test?: { id: number; name: string; code: string; price?: number }
    }>
  }>
}

export interface VisitBillItem {
  id: number
  section: 'consultation' | 'pharmacy' | 'lab' | string
  name: string
  detail?: string | null
  qty: number
  unit_price: number
  amount: number
  status: string
  included?: boolean
  purchased?: boolean
  prescription_id?: number | null
  lab_order_id?: number | null
  lab_order_item_id?: number | null
}

export interface VisitBill {
  id: number
  bill_code: string
  worksheet_id: number
  patient_id: number
  doctor_id: number
  queue_token_id?: number | null
  consultation_fee: number
  pharmacy_subtotal: number
  lab_subtotal: number
  grand_total: number
  status: string
  pharmacy_status: string
  lab_status: string
  created_at?: string
  patient?: Patient | null
  doctor?: Doctor | null
  worksheet?: { id: number; worksheet_code: string } | null
  queue_token?: { id: number; display_code: string } | null
  items?: VisitBillItem[]
}

export interface PharmacySalesMedicineRow {
  name: string
  qty: number
  amount: number
  bills_count: number
  days_sold?: number
}

export interface PharmacySalesDay {
  date: string
  total_qty: number
  total_amount: number
  bills_count: number
  medicines: PharmacySalesMedicineRow[]
}

export interface PharmacySalesReport {
  from: string
  to: string
  summary: {
    total_qty: number
    total_amount: number
    bills_count: number
    medicines_count: number
    days_count: number
  }
  by_date: PharmacySalesDay[]
  by_medicine: PharmacySalesMedicineRow[]
}
