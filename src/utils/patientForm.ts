export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'] as const

export const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export type AgeBreakdown = { years: number; months: number; days: number }

export function calcAge(dob: string): AgeBreakdown | null {
  if (!dob) return null
  const birth = new Date(dob + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (birth > today) return null

  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  return years >= 0 ? { years, months, days } : null
}

export function formatAge(age: AgeBreakdown): string {
  const parts: string[] = []
  if (age.years > 0) parts.push(`${age.years} year${age.years !== 1 ? 's' : ''}`)
  if (age.months > 0) parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`)
  if (age.days > 0 || parts.length === 0) parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`)
  return parts.join(' ')
}

export function formatDob(dob?: string): string {
  if (!dob) return '—'
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function genderLabel(gender?: string): string {
  if (!gender) return '—'
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}
