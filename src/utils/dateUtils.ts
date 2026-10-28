/**
 * Robust date utilities for handling backend dates, local formats, and preventing UTC timezone offset bugs.
 */

/**
 * Safely parse a date string or timestamp into a local Date object.
 * Handles both "YYYY-MM-DD" and ISO timestamps ("2026-10-14T18:30:00.000000Z").
 */
export function parseLocalDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null
  const str = String(dateStr).trim()
  if (!str) return null

  // If it's a full ISO timestamp with 'T' and ends with 'Z' or offset
  if (str.includes('T')) {
    const d = new Date(str)
    if (!Number.isNaN(d.getTime())) {
      return d
    }
  }

  // Pure date string "YYYY-MM-DD"
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    // Noon avoids any daylight saving or timezone boundary edge cases
    return new Date(year, month, day, 12, 0, 0)
  }

  const fallback = new Date(str)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

/**
 * Format date for user display: e.g. "Thursday, 15 October 2026"
 */
export function formatAppointmentDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = parseLocalDate(dateStr)
  if (!d) return String(dateStr).slice(0, 10)
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format date short: e.g. "Thu, 15 Oct 2026"
 */
export function formatAppointmentDateShort(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = parseLocalDate(dateStr)
  if (!d) return String(dateStr).slice(0, 10)
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date parts: day, month, year, full
 */
export function formatVisitDateParts(dateStr: string): { day: string; month: string; year: string; full: string } {
  const d = parseLocalDate(dateStr) ?? new Date()
  return {
    day: d.toLocaleDateString('en-IN', { day: 'numeric' }),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    year: d.toLocaleDateString('en-IN', { year: 'numeric' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
  }
}

/**
 * Get YYYY-MM-DD in local time
 */
export function toDateOnlyString(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = parseLocalDate(dateStr)
  if (!d) return String(dateStr).slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
