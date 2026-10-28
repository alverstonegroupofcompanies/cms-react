/** Ensure doctor name has exactly one "Dr." prefix. */
export function displayDoctorName(name?: string | null): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 'Doctor'
  if (/^dr\.?\s+/i.test(trimmed)) return trimmed
  return `Dr. ${trimmed}`
}

/** Strip "Dr." prefix and return the first letter of the doctor's first name. */
export function doctorInitial(name?: string | null): string {
  const cleaned = (name ?? '').replace(/^dr\.?\s*/i, '').trim()
  const firstName = cleaned.split(/\s+/)[0] || ''
  return firstName.charAt(0).toUpperCase() || 'D'
}
