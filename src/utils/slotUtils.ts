import type { Slot } from '../api/types'

/** Local calendar date as YYYY-MM-DD (not UTC). */
export function localDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Remove time slots that have already passed when the selected date is today. */
export function filterPastSlotsForToday(slots: Slot[], date: string): Slot[] {
  const isoDate = date.slice(0, 10)
  if (isoDate !== localDateString()) return slots

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return slots.filter((slot) => {
    if (!slot?.slot_time) return false
    const [h, m] = String(slot.slot_time).split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return false
    return h * 60 + m > nowMinutes
  })
}
