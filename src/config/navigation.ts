import type { IconName } from '../components/Icons'

export interface NavItem {
  to: string
  label: string
  icon: IconName
}

export const patientNav: NavItem[] = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/patient/profile', label: 'My Profile', icon: 'users' },
  { to: '/patient/book', label: 'Book Appointment', icon: 'calendar' },
  { to: '/patient/appointments', label: 'My Appointments', icon: 'calendar' },
  { to: '/patient/lab-reports', label: 'Lab Reports', icon: 'flask' },
]

export const receptionistNav: NavItem[] = [
  { to: '/receptionist/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/receptionist/patients', label: 'Patients', icon: 'users' },
  { to: '/receptionist/book', label: 'Book', icon: 'calendar' },
  { to: '/receptionist/appointments', label: 'Appointments', icon: 'calendar' },
  { to: '/receptionist/doctors', label: 'Doctors', icon: 'stethoscope' },
  { to: '/receptionist/queue', label: 'Queue', icon: 'queue' },
  { to: '/receptionist/pharmacy', label: 'Pharmacy', icon: 'pill' },
]

export const doctorNav: NavItem[] = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/doctor/queue', label: 'Queue', icon: 'queue' },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: 'pill' },
  { to: '/doctor/lab-orders', label: 'Lab Orders', icon: 'flask' },
]

export const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'stethoscope' },
  { to: '/admin/patients', label: 'Patients', icon: 'users' },
  { to: '/admin/staff', label: 'Staff', icon: 'shield' },
  { to: '/admin/medicines', label: 'Medicines', icon: 'pill' },
  { to: '/admin/lab', label: 'Lab Tests', icon: 'flask' },
]
