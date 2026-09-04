/** Ensure doctor name has exactly one "Dr." prefix. */
export function displayDoctorName(name?: string | null): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return 'Doctor'
  if (/^dr\.?\s+/i.test(trimmed)) return trimmed
  return `Dr. ${trimmed}`
}

/** Strip "Dr." prefix for initials / avatars. */
export function doctorInitial(name?: string | null): string {
  const trimmed = displayDoctorName(name).replace(/^dr\.?\s+/i, '').trim()
  return trimmed.charAt(0).toUpperCase() || 'D'
}
