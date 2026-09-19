import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PatientLayout from '../../components/PatientLayout'
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
import { usePageTitle } from '../../hooks/usePageTitle'
import type { AvailableDate, BookingConfirmation, Clinic, Department, Doctor, Slot } from '../../api/types'
import { filterPastSlotsForToday } from '../../utils/slotUtils'
import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconFlask,
  IconHeart,
  IconPill,
  IconShield,
  IconStethoscope,
  IconUsers,
} from '../../components/Icons'

const STEPS = ['Department', 'Doctor', 'Date', 'Slot', 'Confirm'] as const

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatWorkingDays(availability?: Doctor['availability']): string {
  if (!availability?.length) return 'Schedule not set'
  const days = [...new Set(availability.map((a) => a.day_of_week))].sort((a, b) => a - b)
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

function formatSlotTime(slotTime?: string | null): string {
  if (!slotTime) return '—'
  return String(slotTime).slice(0, 5)
}

function formatAppointmentDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const isoDate = String(dateStr).slice(0, 10)
  const parsed = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatFee(n?: number | null) {
  if (n == null) return null
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function IconDropletSafe({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.7c.3 0 6.5 6.2 6.5 10.8a6.5 6.5 0 1 1-13 0C5.5 8.9 11.7 2.7 12 2.7z" />
    </svg>
  )
}

function departmentIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('cardio') || n.includes('heart')) return IconHeart
  if (n.includes('dental') || n.includes('tooth')) return IconShield
  if (n.includes('ortho') || n.includes('bone')) return IconUsers
  if (n.includes('pedia') || n.includes('child')) return IconUsers
  if (n.includes('derma') || n.includes('skin')) return IconDropletSafe
  if (n.includes('lab') || n.includes('path')) return IconFlask
  if (n.includes('pharm')) return IconPill
  if (n.includes('general') || n.includes('medicine')) return IconStethoscope
  return IconBuilding
}

export default function BookAppointment() {
  usePageTitle('Book a visit', 'Patient')
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

  const selectedDepartment = departments.find((d) => String(d.id) === departmentId)
  const selectedDoctor = doctors.find((d) => String(d.id) === doctorId)
  const selectedDateMeta = availableDates.find((d) => d.date === date)
  const step = !departmentId ? 1 : !doctorId ? 2 : !date ? 3 : !selectedSlot ? 4 : 5

  const clearFromDepartment = () => {
    setDepartmentId('')
    setDoctorId('')
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    setSlots([])
  }

  const clearFromDoctor = () => {
    setDoctorId('')
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    setSlots([])
  }

  const clearFromDate = () => {
    setDate('')
    setSelectedSlot('')
    setSlots([])
  }

  const clearFromSlot = () => {
    setSelectedSlot('')
  }

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
    const tokenCode =
      queue_token?.display_code ||
      appointment.queue_token?.display_code ||
      null
    const tokenNumber = queue_token?.token_number ?? appointment.queue_token?.token_number
    const isTodayBooking = (() => {
      const d = String(appointment.appointment_date || '').slice(0, 10)
      if (!d) return Boolean(queue_token && appointment.status === 'checked_in')
      const today = new Date()
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      return d === iso
    })()

    return (
      <PatientLayout>
        <div className="pb-page">
          <section className="pb-hero pb-hero--success pb-hero--compact">
            <div className="pb-hero-inner">
              <div className="pb-hero-copy">
                <p className="ps-kicker">Booking confirmed</p>
                <h1>You&apos;re all set</h1>
                <p className="pb-hero-lead">
                  Your clinic visit is scheduled
                  {tokenCode ? ` · token ${tokenCode}` : ''}.
                </p>
              </div>
            </div>
          </section>

          <section className="ps-section pb-section">
            <div className="pb-confirm-grid">
              <article className="pb-token-panel">
                {tokenCode ? (
                  <>
                    <em>{isTodayBooking ? 'Your token for today' : 'Your visit token'}</em>
                    <strong>{tokenCode}</strong>
                    {tokenNumber != null && (
                      <span>#{tokenNumber} · {formatAppointmentDate(appointment.appointment_date)}</span>
                    )}
                  </>
                ) : (
                  <>
                    <em>Booking saved</em>
                    <strong>Scheduled</strong>
                    <span>Token will appear on Visits after processing.</span>
                  </>
                )}
                <span className="pb-success-chip">
                  <IconCheck size={14} /> Confirmed
                </span>
              </article>

              <article className="pb-shell">
                <div className="pb-shell-head">
                  <p className="ps-kicker ps-kicker-dark">Visit details</p>
                  <h2>Appointment summary</h2>
                </div>
                <dl className="pb-summary-list">
                  <div><dt>Doctor</dt><dd>{doctor?.name ?? '—'}</dd></div>
                  <div><dt>Specialty</dt><dd>{doctor?.specialization ?? '—'}</dd></div>
                  <div><dt>Department</dt><dd>{department?.name ?? '—'}</dd></div>
                  <div><dt>Clinic</dt><dd>{appointment.clinic?.name ?? clinic?.name ?? '—'}</dd></div>
                  <div><dt>Date</dt><dd>{formatAppointmentDate(appointment.appointment_date)}</dd></div>
                  <div><dt>Time</dt><dd>{formatSlotTime(appointment.slot_time)}</dd></div>
                  {doctor?.consultation_fee != null && (
                    <div><dt>Fee</dt><dd className="pb-fee">{formatFee(doctor.consultation_fee)}</dd></div>
                  )}
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className="pb-status">{isTodayBooking ? 'In queue' : 'Booked'}</span>
                    </dd>
                  </div>
                </dl>
                <p className="pb-note">
                  Please arrive 10 minutes early and show this token at reception
                  {isTodayBooking ? '.' : ' on the visit day.'}
                </p>
                <div className="pb-confirm-actions">
                  <button type="button" className="ps-btn" onClick={handleBookAnother}>
                    Book another visit
                  </button>
                  <Link to="/patient/appointments" className="ps-btn-outline">
                    View my visits <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </div>
          </section>
        </div>
      </PatientLayout>
    )
  }

  const stepTitle =
    step === 1
      ? 'Choose a department'
      : step === 2
        ? 'Choose your doctor'
        : step === 3
          ? 'Pick a date'
          : step === 4
            ? 'Select a time slot'
            : 'Confirm your booking'

  const stepSub =
    step === 1
      ? 'Start with the specialty that fits your need.'
      : step === 2
        ? 'Doctors available in this department.'
        : step === 3
          ? selectedDoctor
            ? `Dates when ${selectedDoctor.name} is available.`
            : 'Available consultation days.'
          : step === 4
            ? '30-minute consultation slots.'
            : 'Review details before you confirm.'

  return (
    <PatientLayout>
      <div className="pb-page">
        <section className="pb-hero pb-hero--compact">
          <div className="pb-hero-inner">
            <div className="pb-hero-copy">
              <p className="ps-kicker">Book a visit</p>
              <h1>Schedule with confidence</h1>
              <p className="pb-hero-lead">
                Department → doctor → date → slot — a guided booking for Alverstone Medcity.
              </p>
            </div>
            {clinic && <span className="pb-clinic-chip">{clinic.name}</span>}
          </div>
        </section>

        <section className="ps-section pb-section">
          {error && <div className="ph-alert ph-alert-error pb-alert">{error}</div>}

          <nav className="pb-steps" aria-label="Booking steps">
            {STEPS.map((label, i) => {
              const n = i + 1
              const state = step > n ? 'done' : step === n ? 'active' : ''
              return (
                <div key={label} className={`pb-step ${state}`}>
                  {i > 0 && <span className="pb-step-line" aria-hidden />}
                  <span className="pb-step-num">
                    {step > n ? <IconCheck size={14} /> : n}
                  </span>
                  <span className="pb-step-label">{label}</span>
                </div>
              )
            })}
          </nav>

          <div className="pb-layout">
            <div className="pb-shell">
              <div className="pb-shell-head">
                <div className="pb-shell-head-top">
                  <p className="ps-kicker ps-kicker-dark">Step {step} of 5</p>
                  <span className="pb-shell-progress" aria-hidden>
                    <i style={{ width: `${(step / 5) * 100}%` }} />
                  </span>
                </div>
                <h2>{stepTitle}</h2>
                <p>{stepSub}</p>
              </div>

              {step > 1 && (
                <div className="pb-picked-row">
                  {selectedDepartment && (
                    <button type="button" className="pb-picked" onClick={clearFromDepartment}>
                      <em>Department</em>
                      <strong>{selectedDepartment.name}</strong>
                      <span>Change</span>
                    </button>
                  )}
                  {step > 2 && selectedDoctor && (
                    <button type="button" className="pb-picked" onClick={clearFromDoctor}>
                      <em>Doctor</em>
                      <strong>{selectedDoctor.name}</strong>
                      <span>Change</span>
                    </button>
                  )}
                  {step > 3 && date && (
                    <button type="button" className="pb-picked" onClick={clearFromDate}>
                      <em>Date</em>
                      <strong>{selectedDateMeta?.label || formatAppointmentDate(date)}</strong>
                      <span>Change</span>
                    </button>
                  )}
                  {step > 4 && selectedSlot && (
                    <button type="button" className="pb-picked" onClick={clearFromSlot}>
                      <em>Slot</em>
                      <strong>{formatSlotTime(selectedSlot)}</strong>
                      <span>Change</span>
                    </button>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="pb-dept-grid">
                  {departments.length === 0 ? (
                    <p className="pb-muted">Loading departments…</p>
                  ) : (
                    departments.map((d) => {
                      const Icon = departmentIcon(d.name)
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={`pb-dept-card${departmentId === String(d.id) ? ' is-on' : ''}`}
                          onClick={() => setDepartmentId(String(d.id))}
                        >
                          <span className="pb-dept-ico" aria-hidden>
                            <Icon size={22} />
                          </span>
                          <strong>{d.name}</strong>
                          <span>Select specialty</span>
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="pb-doctor-grid">
                  {doctors.length === 0 ? (
                    <p className="pb-muted">No doctors available in this department.</p>
                  ) : (
                    doctors.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`pb-doctor-card${doctorId === String(d.id) ? ' is-on' : ''}`}
                        onClick={() => setDoctorId(String(d.id))}
                      >
                        <DoctorAvatar doctorId={d.id} name={d.name} className="pb-doctor-photo" />
                        <div className="pb-doctor-copy">
                          <strong>{d.name}</strong>
                          <span>{d.specialization}</span>
                          <span className="pb-doctor-meta">
                            <IconCalendar size={13} /> {formatWorkingDays(d.availability)}
                          </span>
                        </div>
                        {d.consultation_fee != null && (
                          <em className="pb-doctor-fee">{formatFee(d.consultation_fee)}</em>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {step === 3 && (
                <>
                  {loadingDates ? (
                    <p className="pb-muted">Loading available dates…</p>
                  ) : availableDates.length === 0 ? (
                    <p className="pb-muted">No upcoming dates available for this doctor.</p>
                  ) : (
                    <div className="pb-date-grid">
                      {availableDates.map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          className={`pb-date-card${date === d.date ? ' is-on' : ''}`}
                          onClick={() => setDate(d.date)}
                        >
                          <span className="pb-date-dow">{d.day}</span>
                          <strong>{(d.label?.split(', ')[1]) || d.label || d.date}</strong>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  {slots.length === 0 ? (
                    <p className="pb-muted">
                      No slots available on this date (may be fully booked or outside working hours).
                    </p>
                  ) : (
                    <div className="pb-slot-grid">
                      {slots.map((s) => (
                        <button
                          key={s.slot_time}
                          type="button"
                          className={`pb-slot-card${selectedSlot === s.slot_time ? ' is-on' : ''}`}
                          onClick={() => setSelectedSlot(s.slot_time)}
                        >
                          <IconClock size={14} />
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 5 && (
                <div className="pb-ready">
                  <div className="pb-ready-card">
                    <div className="pb-ready-row">
                      <em>Department</em>
                      <strong>{selectedDepartment?.name}</strong>
                    </div>
                    <div className="pb-ready-row">
                      <em>Doctor</em>
                      <strong>{selectedDoctor?.name}</strong>
                    </div>
                    <div className="pb-ready-row">
                      <em>When</em>
                      <strong>
                        {selectedDateMeta?.label || formatAppointmentDate(date)} · {formatSlotTime(selectedSlot)}
                      </strong>
                    </div>
                    {selectedDoctor?.consultation_fee != null && (
                      <div className="pb-ready-row">
                        <em>Fee</em>
                        <strong className="pb-fee">{formatFee(selectedDoctor.consultation_fee)}</strong>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ps-btn ps-btn-lg pb-confirm-btn"
                    onClick={handleBook}
                    disabled={booking}
                  >
                    {booking ? 'Confirming…' : 'Confirm booking'}
                  </button>
                </div>
              )}
            </div>

            <aside className="pb-aside">
              <div className="pb-aside-card">
                <p className="ps-kicker">Your selection</p>
                <h3>Booking progress</h3>
                <ul className="pb-aside-list">
                  <li className={departmentId ? 'is-set' : ''}>
                    <span className="pb-aside-dot" aria-hidden />
                    <div>
                      <span>Department</span>
                      <strong>{selectedDepartment?.name || 'Not selected'}</strong>
                    </div>
                  </li>
                  <li className={doctorId ? 'is-set' : ''}>
                    <span className="pb-aside-dot" aria-hidden />
                    <div>
                      <span>Doctor</span>
                      <strong>{selectedDoctor?.name || 'Not selected'}</strong>
                    </div>
                  </li>
                  <li className={date ? 'is-set' : ''}>
                    <span className="pb-aside-dot" aria-hidden />
                    <div>
                      <span>Date</span>
                      <strong>{date ? (selectedDateMeta?.label || formatAppointmentDate(date)) : 'Not selected'}</strong>
                    </div>
                  </li>
                  <li className={selectedSlot ? 'is-set' : ''}>
                    <span className="pb-aside-dot" aria-hidden />
                    <div>
                      <span>Slot</span>
                      <strong>{selectedSlot ? formatSlotTime(selectedSlot) : 'Not selected'}</strong>
                    </div>
                  </li>
                </ul>
                {selectedDoctor?.consultation_fee != null && (
                  <p className="pb-aside-fee">
                    Consultation fee <strong>{formatFee(selectedDoctor.consultation_fee)}</strong>
                  </p>
                )}
              </div>
              <div className="pb-aside-tip">
                <span className="pb-aside-tip-ico" aria-hidden>
                  <IconCheck size={16} />
                </span>
                <p>You can change any earlier step without restarting the whole booking.</p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </PatientLayout>
  )
}
