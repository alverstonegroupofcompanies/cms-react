import { useEffect, useState } from 'react'
import DoctorAvatar from './DoctorAvatar'
import {
  getDoctorAvailableDates,
  getSlots,
  rescheduleAppointment,
} from '../api/client'
import type { AvailableDate, Slot } from '../api/types'
import { filterPastSlotsForToday } from '../utils/slotUtils'
import { displayDoctorName } from '../utils/doctorName'

export type RescheduleTarget = {
  appointmentId: number
  doctorId: number
  doctorName: string
  appointmentDate: string
  slotTime: string
}

interface Props {
  target: RescheduleTarget | null
  onClose: () => void
  onSuccess: () => void
}

function normalizeSlotTime(slotTime: string): string {
  if (slotTime.length === 5) return `${slotTime}:00`
  return slotTime
}

function formatCurrentSlot(dateStr: string, slotTime: string): string {
  const iso = dateStr.slice(0, 10)
  const date = new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${date} · ${slotTime.slice(0, 5)}`
}

export default function RescheduleModal({ target, onClose, onSuccess }: Props) {
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!target) return

    const currentDate = target.appointmentDate.slice(0, 10)
    const currentSlot = normalizeSlotTime(target.slotTime)

    setDate(currentDate)
    setSelectedSlot(currentSlot)
    setError('')
    setLoadingDates(true)

    getDoctorAvailableDates(target.doctorId)
      .then(({ data }) => setAvailableDates(data.dates))
      .finally(() => setLoadingDates(false))
  }, [target])

  useEffect(() => {
    if (!target || !date) {
      setSlots([])
      return
    }

    setLoadingSlots(true)
    getSlots(target.doctorId, date, target.appointmentId)
      .then(({ data }) => {
        const filtered = filterPastSlotsForToday(data.slots, date)
        setSlots(filtered)
        setSelectedSlot((prev) => (filtered.some((s) => s.slot_time === prev) ? prev : ''))
      })
      .finally(() => setLoadingSlots(false))
  }, [target, date])

  if (!target) return null

  const currentDate = target.appointmentDate.slice(0, 10)
  const currentSlot = normalizeSlotTime(target.slotTime)
  const unchanged = date === currentDate && selectedSlot === currentSlot

  const handleSave = async () => {
    if (!selectedSlot) return
    setError('')
    setSaving(true)
    try {
      await rescheduleAppointment(target.appointmentId, {
        appointment_date: date,
        slot_time: selectedSlot,
      })
      onSuccess()
      onClose()
    } catch {
      setError('Could not reschedule. The slot may have been taken.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ph-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ph-modal ph-reschedule-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="reschedule-title"
      >
        <div className="ph-modal-head">
          <div>
            <h2 id="reschedule-title" className="ph-modal-title">Reschedule appointment</h2>
            <p className="ph-modal-sub">Pick a new date and time with the same doctor</p>
          </div>
          <button type="button" className="ph-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="ph-reschedule-doctor">
          <DoctorAvatar doctorId={target.doctorId} name={target.doctorName} className="ph-reschedule-photo" />
          <div>
            <strong>{displayDoctorName(target.doctorName)}</strong>
            <span className="ph-muted">Current: {formatCurrentSlot(target.appointmentDate, target.slotTime)}</span>
          </div>
        </div>

        <div className="ph-form-group">
          <label className="ph-label-form">Select new date</label>
          {loadingDates ? (
            <p className="ph-muted">Loading available dates…</p>
          ) : availableDates.length === 0 ? (
            <p className="ph-muted">No upcoming dates available for this doctor.</p>
          ) : (
            <div className="ph-dates-grid">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  className={`ph-date-btn ${date === d.date ? 'active' : ''}`}
                  onClick={() => {
                    setDate(d.date)
                    setSelectedSlot('')
                  }}
                >
                  <span className="ph-date-day">{d.day}</span>
                  <span className="ph-date-label">{d.label.split(', ')[1]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {date && (
          <div className="ph-form-group">
            <label className="ph-label-form">Select new time slot</label>
            {loadingSlots ? (
              <p className="ph-muted">Loading slots…</p>
            ) : slots.length === 0 ? (
              <p className="ph-muted">No slots available on this date.</p>
            ) : (
              <div className="ph-slots-grid">
                {slots.map((s) => (
                  <button
                    key={s.slot_time}
                    type="button"
                    className={`ph-slot-btn ${selectedSlot === s.slot_time ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(s.slot_time)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="ph-alert ph-alert-error">{error}</div>}

        <div className="ph-modal-actions">
          <button type="button" className="ph-btn ph-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ph-btn ph-btn-primary"
            onClick={handleSave}
            disabled={!selectedSlot || saving || unchanged}
          >
            {saving ? 'Saving…' : 'Confirm reschedule'}
          </button>
        </div>
      </div>
    </div>
  )
}
