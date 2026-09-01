import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import { callNext, completeToken } from '../../api/client'
import { useQueuePolling } from '../../hooks/useQueuePolling'
import { doctorNav } from '../../config/navigation'
import { useState } from 'react'

export default function DoctorQueue() {
  const { user } = useAuth()
  const doctorId = user?.doctor?.id ?? null
  const { queue, refresh } = useQueuePolling(doctorId, 3000)
  const [message, setMessage] = useState('')

  const handleCallNext = async () => {
    if (!doctorId) return
    try {
      const { data } = await callNext(doctorId)
      setMessage(`Now serving: ${data.display_code} — ${data.patient.name}`)
      refresh()
    } catch {
      setMessage('No patients waiting in queue')
    }
  }

  const handleComplete = async (id: number) => {
    await completeToken(id)
    setMessage('Consultation completed')
    refresh()
  }

  const inConsultation = (queue as { id: number; status: string; display_code: string; patient: { name: string } }[])
    .find((t) => t.status === 'in_consultation')

  return (
    <Layout title="Patient Queue" subtitle="Call and complete consultations" nav={doctorNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="doctor-queue-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={handleCallNext}>Call Next Patient</button>
        {inConsultation && (
          <button type="button" className="btn btn-success btn-lg" onClick={() => handleComplete(inConsultation.id)}>
            Complete — {inConsultation.display_code}
          </button>
        )}
      </div>
      {inConsultation && (
        <div className="current-patient-card">
          <p className="queue-hero-label">Now Serving</p>
          <div className="token-display">{inConsultation.display_code}</div>
          <p>{inConsultation.patient.name}</p>
        </div>
      )}
      <div className="card">
        <div className="card-header"><h3>Today's Queue</h3></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Token</th><th>Patient</th><th>Status</th></tr></thead>
            <tbody>
              {(queue as { display_code: string; patient: { name: string }; status: string }[]).map((t) => (
                <tr key={t.display_code} className={t.status === 'in_consultation' ? 'row-active' : ''}>
                  <td><strong>{t.display_code}</strong></td>
                  <td>{t.patient.name}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
