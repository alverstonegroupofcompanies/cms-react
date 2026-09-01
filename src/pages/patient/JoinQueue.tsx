import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { getDoctors, getMyPosition, joinQueue } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useQueuePolling } from '../../hooks/useQueuePolling'
import { patientNav } from '../../config/navigation'
import type { Doctor } from '../../api/types'

export default function JoinQueue() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [position, setPosition] = useState<{
    token: { display_code: string; status: string }
    position: number
    estimated_wait_minutes: number
    queue_length: number
  } | null>(null)
  const [message, setMessage] = useState('')
  const { queue } = useQueuePolling(doctorId)

  useEffect(() => { getDoctors().then(({ data }) => setDoctors(data)) }, [])

  useEffect(() => {
    if (doctorId && user?.patient) {
      getMyPosition(doctorId).then(({ data }) => setPosition(data)).catch(() => setPosition(null))
    }
  }, [doctorId, user, queue])

  const handleJoin = async () => {
    if (!user?.patient || !doctorId) return
    try {
      const { data } = await joinQueue(user.patient.id, doctorId)
      setPosition(data.position)
      setMessage(`Token ${data.queue_token.display_code} issued!`)
    } catch {
      setMessage('Failed to join queue')
    }
  }

  return (
    <Layout title="Live Queue" subtitle="Join today's walk-in queue" nav={patientNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="form-group">
          <label>Select Doctor</label>
          <select value={doctorId ?? ''} onChange={(e) => setDoctorId(Number(e.target.value) || null)}>
            <option value="">Choose doctor...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
            ))}
          </select>
        </div>
        {doctorId && !position && (
          <button type="button" className="btn btn-primary btn-lg" onClick={handleJoin}>Join Queue Today</button>
        )}
      </div>

      {position && (
        <div className="queue-hero">
          <p className="queue-hero-label">Your Token</p>
          <div className="token-display">{position.token.display_code}</div>
          <div className="queue-stats">
            <div className="stat"><span>Position</span><strong>#{position.position}</strong></div>
            <div className="stat"><span>Est. Wait</span><strong>{position.estimated_wait_minutes} min</strong></div>
            <div className="stat"><span>In Queue</span><strong>{position.queue_length}</strong></div>
          </div>
          <span className={`badge badge-${position.token.status}`}>{position.token.status.replace('_', ' ')}</span>
        </div>
      )}

      {doctorId && queue.length > 0 && (
        <div className="card">
          <div className="card-header"><h3>Live Queue Board</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Token</th><th>Patient</th><th>Status</th></tr></thead>
              <tbody>
                {(queue as { display_code: string; patient: { name: string }; status: string }[]).map((t) => (
                  <tr key={t.display_code}>
                    <td><strong>{t.display_code}</strong></td>
                    <td>{t.patient.name}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}
