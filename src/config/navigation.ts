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
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: 'pill' },
  { to: '/patient/lab-reports', label: 'Lab Reports', icon: 'flask' },
]

export const receptionistNav: NavItem[] = [
  { to: '/receptionist/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/receptionist/patients', label: 'Patients', icon: 'users' },
  { to: '/receptionist/book', label: 'Book', icon: 'calendar' },
  { to: '/receptionist/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/receptionist/appointments', label: 'Appointments', icon: 'calendar' },
  { to: '/receptionist/doctors', label: 'Doctors', icon: 'stethoscope' },
  { to: '/receptionist/queue', label: 'Queue', icon: 'queue' },
  { to: '/receptionist/pharmacy', label: 'Pharmacy', icon: 'pill' },
]

export const doctorNav: NavItem[] = [
  { to: '/doctor/dashboard', label: 'Today', icon: 'dashboard' },
  { to: '/doctor/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/doctor/queue', label: 'Queue', icon: 'queue' },
  { to: '/doctor/patients', label: 'Patients', icon: 'users' },
]

export const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/doctors', label: 'Doctors', icon: 'stethoscope' },
  { to: '/admin/patients', label: 'Patients', icon: 'users' },
  { to: '/admin/staff', label: 'Staff', icon: 'shield' },
  { to: '/admin/medicines', label: 'Medicines', icon: 'pill' },
  { to: '/admin/lab', label: 'Lab Tests', icon: 'flask' },
]

export const pharmacyNav: NavItem[] = [
  { to: '/pharmacy/dashboard', label: 'Bills', icon: 'pill' },
  { to: '/pharmacy/sales', label: 'Sales', icon: 'calendar' },
  { to: '/pharmacy/medicines', label: 'Catalog', icon: 'pill' },
]

export const labNav: NavItem[] = [
  { to: '/lab/dashboard', label: 'Bills', icon: 'flask' },
]
