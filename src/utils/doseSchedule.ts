/** Day / Noon / Evening / Night dose schedule stored as "1 - 0 - 0 - 1".
 * Legacy 3-part values ("1 - 0 - 1") are still parsed as Day / Noon / Night (evening = off).
 */

export type DoseSlots = { day: boolean; noon: boolean; evening: boolean; night: boolean }

export const EMPTY_DOSE: DoseSlots = { day: false, noon: false, evening: false, night: false }

export function formatDoseSchedule(slots: DoseSlots): string {
  return `${slots.day ? 1 : 0} - ${slots.noon ? 1 : 0} - ${slots.evening ? 1 : 0} - ${slots.night ? 1 : 0}`
}

export function parseDoseSchedule(frequency?: string | null): DoseSlots | null {
  if (!frequency) return null
  const trimmed = frequency.trim()

  const four = trimmed.match(/^([01])\s*[-–]\s*([01])\s*[-–]\s*([01])\s*[-–]\s*([01])$/)
  if (four) {
    return {
      day: four[1] === '1',
      noon: four[2] === '1',
      evening: four[3] === '1',
      night: four[4] === '1',
    }
  }

  // Legacy Day · Noon · Night
  const three = trimmed.match(/^([01])\s*[-–]\s*([01])\s*[-–]\s*([01])$/)
  if (three) {
    return {
      day: three[1] === '1',
      noon: three[2] === '1',
      evening: false,
      night: three[3] === '1',
    }
  }

  return null
}

export function doseScheduleLabel(frequency?: string | null): string {
  const slots = parseDoseSchedule(frequency)
  if (!slots) return frequency || '—'
  const parts: string[] = []
  if (slots.day) parts.push('Day')
  if (slots.noon) parts.push('Noon')
  if (slots.evening) parts.push('Evening')
  if (slots.night) parts.push('Night')
  if (parts.length === 0) return `${frequency} (none)`
  return `${frequency} · ${parts.join(' / ')}`
}

/** Short clinical shorthand: OD / BD / TDS / QID from active dose slots. */
export function doseFrequencyShort(frequency?: string | null): string {
  const slots = parseDoseSchedule(frequency)
  if (!slots) return frequency?.trim() || '—'
  const n = dosesPerDay(frequency)
  if (n === 1) return 'OD'
  if (n === 2) return 'BD'
  if (n === 3) return 'TDS'
  if (n === 4) return 'QID'
  if (n === 0) return '—'
  return formatDoseSchedule(slots)
}

export function defaultDoseSlots(): DoseSlots {
  return { day: true, noon: false, evening: false, night: true }
}

export function isEmptyDoseSchedule(frequency?: string | null): boolean {
  const slots = parseDoseSchedule(frequency)
  if (!slots) return !frequency?.trim()
  return !slots.day && !slots.noon && !slots.evening && !slots.night
}

/** Count of selected dose times in a day (e.g. 1-0-0-1 → 2). */
export function dosesPerDay(frequency?: string | null): number {
  const slots = parseDoseSchedule(frequency)
  if (!slots) return 0
  return (slots.day ? 1 : 0) + (slots.noon ? 1 : 0) + (slots.evening ? 1 : 0) + (slots.night ? 1 : 0)
}

/** Suggested pack qty = doses/day × duration days (min 1 when both set). */
export function suggestedQuantity(frequency?: string | null, durationDays?: number): number {
  const perDay = dosesPerDay(frequency)
  const days = Math.max(0, Math.floor(Number(durationDays) || 0))
  if (perDay <= 0 || days <= 0) return 0
  return perDay * days
}
