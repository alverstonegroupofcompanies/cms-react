import type { Slot } from '../api/types'

function localDateString(): string {
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
    const [h, m] = slot.slot_time.split(':').map(Number)
    return h * 60 + m > nowMinutes
  })
}
