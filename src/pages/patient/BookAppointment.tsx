import { useEffect, useState } from 'react'
import PatientPage from '../../components/PatientPage'
import DoctorAvatar from '../../components/DoctorAvatar'
import {
  bookAppointment,
  getClinics,
  getDepartments,
  getDoctorAvailableDates,
  getDoctors,
  getSlots,
} from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { AvailableDate, BookingConfirmation, Clinic, Department, Doctor, Slot } from '../../api/types'
import { filterPastSlotsForToday } from '../../utils/slotUtils'

const STEPS = ['Department', 'Doctor', 'Date', 'Slot', 'Confirm']

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatWorkingDays(availability?: Doctor['availability']): string {
  if (!availability?.length) return 'Schedule not set'
  const days = [...new Set(availability.map((a) => a.day_of_week))].sort((a, b) => a - b)
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

function formatSlotTime(slotTime: string): string {
  return slotTime.slice(0, 5)
}

function formatAppointmentDate(dateStr: string): string {
  const isoDate = dateStr.slice(0, 10)
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BookAppointment() {
  const { user } = useAuth()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [departmentId, setDepartmentId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(false)
  const [loadingDates, setLoadingDates] = useState(false)

  useEffect(() => {
    getClinics().then(({ data }) => {
      const first = data[0] ?? null
      setClinic(first)
      if (first) getDepartments(first.id).then(({ data: depts }) => setDepartments(depts))
    })
  }, [])

  useEffect(() => {
    setDoctorId('')
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    if (clinic && departmentId) {
      getDoctors({
        clinic_id: clinic.id,
        department_id: Number(departmentId),
      }).then(({ data }) => setDoctors(data))
    } else {
      setDoctors([])
    }
  }, [clinic, departmentId])

  useEffect(() => {
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    if (!doctorId) return

    setLoadingDates(true)
    getDoctorAvailableDates(Number(doctorId))
      .then(({ data }) => setAvailableDates(data.dates))
      .finally(() => setLoadingDates(false))
  }, [doctorId])

  useEffect(() => {
    setSelectedSlot('')
    if (doctorId && date) {
      getSlots(Number(doctorId), date).then(({ data }) => {
        const filtered = filterPastSlotsForToday(data.slots, date)
        setSlots(filtered)
        setSelectedSlot((prev) => (filtered.some((s) => s.slot_time === prev) ? prev : ''))
      })
    } else {
      setSlots([])
    }
  }, [doctorId, date])

  const selectedDoctor = doctors.find((d) => String(d.id) === doctorId)
  const step = !departmentId ? 1 : !doctorId ? 2 : !date ? 3 : !selectedSlot ? 4 : 5

  const handleBook = async () => {
    if (!user?.patient || !selectedSlot || !doctorId || !clinic) return
    setError('')
    setBooking(true)
    try {
      const { data } = await bookAppointment({
        patient_id: user.patient.id,
        doctor_id: Number(doctorId),
        clinic_id: clinic.id,
        department_id: Number(departmentId),
        appointment_date: date,
        slot_time: selectedSlot,
      })
      setConfirmation(data)
    } catch {
      setError('Failed to book. Slot may already be taken.')
    } finally {
      setBooking(false)
    }
  }

  const handleBookAnother = () => {
    setConfirmation(null)
    setDepartmentId('')
    setDoctorId('')
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    setSlots([])
    setError('')
  }

  if (confirmation) {
    const { appointment, queue_token } = confirmation
    const doctor = appointment.doctor ?? selectedDoctor
    const department = appointment.department ?? departments.find((d) => String(d.id) === departmentId)

    return (
      <PatientPage title="Appointment confirmed" subtitle="Your clinic visit has been scheduled">
        <div className="ph-booking-confirmed">
          <div className="ph-queue-hero ph-booking-hero">
            <p className="ph-queue-label">Your Token Number</p>
            <div className="ph-queue-token">{queue_token.display_code}</div>
            <span className="ph-booking-success-badge">Appointment Confirmed</span>
          </div>

          <div className="ph-card ph-booking-details">
            <h3 className="ph-booking-details-title">Appointment Details</h3>
            <dl className="ph-booking-details-list">
              <div className="ph-booking-detail">
                <dt>Doctor</dt>
                <dd>{doctor?.name ?? '—'}</dd>
              </div>
              <div className="ph-booking-detail">
                <dt>Specialization</dt>
                <dd>{doctor?.specialization ?? '—'}</dd>
              </div>
              <div className="ph-booking-detail">
                <dt>Department</dt>
                <dd>{department?.name ?? '—'}</dd>
              </div>
              <div className="ph-booking-detail">
                <dt>Clinic</dt>
                <dd>{appointment.clinic?.name ?? clinic?.name ?? '—'}</dd>
              </div>
              <div className="ph-booking-detail">
                <dt>Date</dt>
                <dd>{formatAppointmentDate(appointment.appointment_date)}</dd>
              </div>
              <div className="ph-booking-detail">
                <dt>Time</dt>
                <dd>{formatSlotTime(appointment.slot_time)}</dd>
              </div>
              {doctor?.consultation_fee != null && (
                <div className="ph-booking-detail">
                  <dt>Consultation Fee</dt>
                  <dd className="ph-booking-fee">₹{doctor.consultation_fee}</dd>
                </div>
              )}
              <div className="ph-booking-detail">
                <dt>Status</dt>
                <dd><span className="ph-badge ph-badge-booked">Booked</span></dd>
              </div>
            </dl>

            <p className="ph-booking-note">
              Please arrive 10 minutes before your slot and show this token at reception.
            </p>

            <button
              type="button"
              className="ph-btn ph-btn-primary ph-btn-lg"
              onClick={handleBookAnother}
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </PatientPage>
    )
  }

  return (
    <PatientPage
      title="Book a clinic visit"
      subtitle="Choose department, doctor, date, and consultation slot"
    >
      {error && <div className="ph-alert ph-alert-error">{error}</div>}

      <div className="ph-steps">
        {STEPS.map((label, i) => {
          const n = i + 1
          return (
            <div
              key={label}
              className={`ph-step ${step >= n ? (step > n ? 'done' : 'active') : ''}`}
            >
              <span className="ph-step-num">{n}</span>
              <span className="ph-step-label">{label}</span>
            </div>
          )
        })}
      </div>

      <div className="ph-card">
        {clinic && (
          <p className="ph-clinic-badge">{clinic.name}</p>
        )}

        <div className="ph-form-group">
          <label className="ph-label-form">1. Select Consulting Department</label>
          <select
            className="ph-input"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">Choose department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {departmentId && (
          <div className="ph-form-group">
            <label className="ph-label-form">2. Select Doctor</label>
            {doctors.length === 0 ? (
              <p className="ph-muted">No doctors available in this department.</p>
            ) : (
              <div className="ph-doctor-list">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`ph-doctor-card ${doctorId === String(d.id) ? 'selected' : ''}`}
                    onClick={() => setDoctorId(String(d.id))}
                  >
                    <DoctorAvatar doctorId={d.id} name={d.name} className="ph-doctor-photo" />
                    <div className="ph-doctor-info">
                      <strong>{d.name}</strong>
                      <span>{d.specialization}</span>
                      <span className="ph-doctor-days">
                        Available: {formatWorkingDays(d.availability)}
                      </span>
                      {d.consultation_fee != null && (
                        <span className="ph-doctor-fee">₹{d.consultation_fee}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {doctorId && (
          <div className="ph-form-group">
            <label className="ph-label-form">3. Select Date</label>
            {selectedDoctor && (
              <p className="ph-muted ph-date-hint">
                Showing dates when {selectedDoctor.name.split(' ').slice(1).join(' ')} is available
              </p>
            )}
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
                    onClick={() => setDate(d.date)}
                  >
                    <span className="ph-date-day">{d.day}</span>
                    <span className="ph-date-label">{d.label.split(', ')[1]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {date && (
          <>
            {slots.length > 0 ? (
              <div className="ph-slots">
                <label className="ph-label-form">4. Available 30-minute slots</label>
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
              </div>
            ) : (
              <p className="ph-muted ph-empty-inline">
                No slots available on this date (may be fully booked or outside working hours).
              </p>
            )}
            {selectedSlot && (
              <button
                type="button"
                className="ph-btn ph-btn-primary ph-btn-lg ph-mt"
                onClick={handleBook}
                disabled={booking}
              >
                {booking ? 'Confirming…' : 'Confirm Booking'}
              </button>
            )}
          </>
        )}
      </div>
    </PatientPage>
  )
}
