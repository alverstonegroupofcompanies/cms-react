import type { Doctor, DoctorAvailability } from '../api/types'

/** JS / Carbon: 0 = Sunday … 6 = Saturday */
export function dayOfWeekForDate(date?: string | Date): number {
  if (!date) return new Date().getDay()
  if (date instanceof Date) return date.getDay()
  // YYYY-MM-DD → local noon avoids UTC day shift
  return new Date(`${date}T12:00:00`).getDay()
}

export function isDoctorAvailableOnDate(
  doctor: Pick<Doctor, 'availability' | 'status'>,
  date?: string | Date
): boolean {
  if (doctor.status && doctor.status !== 'active') return false
  const availability = doctor.availability
  if (!availability?.length) return false
  const dow = dayOfWeekForDate(date)
  return availability.some((a: DoctorAvailability) => Number(a.day_of_week) === dow)
}

export function filterDoctorsAvailableOnDate(
  doctors: Doctor[],
  date?: string | Date
): Doctor[] {
  return doctors.filter((d) => isDoctorAvailableOnDate(d, date))
}

/**
 * Standard clinical week sequence starting Monday:
 * Mon (1), Tue (2), Wed (3), Thu (4), Fri (5), Sat (6), Sun (0).
 */
export const WEEK_DAYS_ORDER = [
  { day: 1, letter: 'M', label: 'Mon', full: 'Monday' },
  { day: 2, letter: 'T', label: 'Tue', full: 'Tuesday' },
  { day: 3, letter: 'W', label: 'Wed', full: 'Wednesday' },
  { day: 4, letter: 'T', label: 'Thu', full: 'Thursday' },
  { day: 5, letter: 'F', label: 'Fri', full: 'Friday' },
  { day: 6, letter: 'S', label: 'Sat', full: 'Saturday' },
  { day: 0, letter: 'S', label: 'Sun', full: 'Sunday' },
] as const

export interface DayPillItem {
  day: number
  letter: string
  label: string
  full: string
  available: boolean
}

/**
 * Returns a compact 7-day letter track for dropdowns and compact displays:
 * e.g. "M T W T F · ·", "M · W · F · ·", "· T · T · S ·"
 */
export function getDoctorDayTrack(
  availability?: DoctorAvailability[] | null,
  dot = '·'
): string {
  if (!availability?.length) return '· · · · · · ·'
  const activeDays = new Set(availability.map((a) => Number(a.day_of_week)))
  return WEEK_DAYS_ORDER.map(({ day, letter }) => (activeDays.has(day) ? letter : dot)).join(' ')
}

/**
 * Returns day pill data for interactive badges (M T W T F S S).
 */
export function getDoctorDayPills(
  availability?: DoctorAvailability[] | null
): DayPillItem[] {
  const activeDays = new Set((availability || []).map((a) => Number(a.day_of_week)))
  return WEEK_DAYS_ORDER.map((item) => ({
    ...item,
    available: activeDays.has(item.day),
  }))
}

const SHORT_DAY_NAMES: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

/**
 * Returns human-readable summary of working days:
 * e.g. "Mon–Fri", "Mon, Wed, Fri", "All days", "Schedule not set"
 */
export function formatWorkingDaysSummary(
  availability?: DoctorAvailability[] | null
): string {
  if (!availability?.length) return 'Schedule not set'
  const days = [...new Set(availability.map((a) => Number(a.day_of_week)))].sort(
    (a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)
  )

  if (days.length === 7) return 'All days (Mon–Sun)'
  const daysStr = days.join(',')
  if (daysStr === '1,2,3,4,5') return 'Mon–Fri'
  if (daysStr === '1,2,3,4,5,6') return 'Mon–Sat'
  if (daysStr === '1,2,3,4') return 'Mon–Thu'

  return days.map((d) => SHORT_DAY_NAMES[d] || String(d)).join(', ')
}

/**
 * Formats doctor option label with compact day availability:
 * e.g. "Dr. Lisa Thomas — Dental Surgeon · [M T W · F · ·]"
 */
export function formatDoctorOptionLabel(doctor: {
  name: string
  specialization?: string | null
  availability?: DoctorAvailability[] | null
}): string {
  const spec = doctor.specialization ? ` — ${doctor.specialization}` : ''
  const track = getDoctorDayTrack(doctor.availability)
  return `${doctor.name}${spec} · [${track}]`
}
