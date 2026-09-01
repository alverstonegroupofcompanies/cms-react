import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { cancelToken, getDoctors } from '../../api/client'
import { useQueuePolling } from '../../hooks/useQueuePolling'
import { receptionistNav } from '../../config/navigation'
import type { Doctor } from '../../api/types'

export default function QueueBoard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const { queue, refresh } = useQueuePolling(doctorId, 3000)

  useEffect(() => {
    getDoctors().then(({ data }) => {
      setDoctors(data)
      if (data.length) setDoctorId(data[0].id)
    })
  }, [])

  const handleCancel = async (id: number) => {
    await cancelToken(id)
    refresh()
  }

  return (
    <Layout title="Queue Board" subtitle="Live patient queue — auto refreshes" nav={receptionistNav}>
      <div className="card">
        <div className="form-group">
          <label>Doctor</label>
          <select value={doctorId ?? ''} onChange={(e) => setDoctorId(Number(e.target.value))}>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Token</th><th>Patient</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {(queue as { id: number; position: number; display_code: string; patient: { name: string; patient_code: string }; status: string }[]).map((t) => (
                <tr key={t.id} className={t.status === 'in_consultation' ? 'row-active' : ''}>
                  <td>{t.position}</td>
                  <td><strong>{t.display_code}</strong></td>
                  <td>{t.patient.name} <span className="text-muted">({t.patient.patient_code})</span></td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>
                    {t.status === 'waiting' && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleCancel(t.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {queue.length === 0 && <p className="empty-state">No patients in queue today.</p>}
      </div>
    </Layout>
  )
}
