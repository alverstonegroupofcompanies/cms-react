import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { bookAppointment, getDoctors, getSlots } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { patientNav } from '../../config/navigation'
import type { Doctor, Slot } from '../../api/types'

export default function BookAppointment() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { getDoctors().then(({ data }) => setDoctors(data)) }, [])

  useEffect(() => {
    if (doctorId && date) {
      getSlots(Number(doctorId), date).then(({ data }) => setSlots(data.slots))
    }
  }, [doctorId, date])

  const handleBook = async () => {
    if (!user?.patient || !selectedSlot) return
    setError('')
    try {
      await bookAppointment({
        patient_id: user.patient.id,
        doctor_id: Number(doctorId),
        appointment_date: date,
        slot_time: selectedSlot,
      })
      setMessage('Appointment booked successfully!')
      setSelectedSlot('')
    } catch {
      setError('Failed to book. Slot may be taken.')
    }
  }

  const step = !doctorId ? 1 : !date ? 2 : !selectedSlot ? 3 : 4

  return (
    <Layout title="Book Appointment" subtitle="Select doctor, date and time slot" nav={patientNav}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="steps">
        <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>1. Doctor</div>
        <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>2. Date</div>
        <div className={`step ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}>3. Time</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Confirm</div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Select Doctor</h3></div>
        {doctors.map((d) => (
          <div
            key={d.id}
            className={`doctor-card ${doctorId === String(d.id) ? 'selected' : ''}`}
            onClick={() => setDoctorId(String(d.id))}
          >
            <div className="doctor-avatar">{d.name.split(' ').slice(-1)[0][0]}</div>
            <div>
              <strong>{d.name}</strong>
              <p className="text-muted">{d.specialization}</p>
            </div>
          </div>
        ))}
      </div>

      {doctorId && (
        <div className="card">
          <div className="form-group">
            <label>Select Date</label>
            <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
          </div>
          {slots.length > 0 && (
            <div className="slots-grid">
              <h3>Available Time Slots</h3>
              <div className="slots-list">
                {slots.map((s) => (
                  <button
                    key={s.slot_time}
                    type="button"
                    className={`slot-btn ${selectedSlot === s.slot_time ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(s.slot_time)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>
          )}
          {doctorId && slots.length === 0 && <p className="text-muted empty-state">No slots available for this date.</p>}
          {selectedSlot && (
            <button type="button" className="btn btn-primary btn-lg" onClick={handleBook} style={{ marginTop: '1rem' }}>
              Confirm Booking
            </button>
          )}
        </div>
      )}
    </Layout>
  )
}
