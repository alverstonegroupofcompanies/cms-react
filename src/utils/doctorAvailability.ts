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
