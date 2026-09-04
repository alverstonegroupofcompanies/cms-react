import { useEffect, useState } from 'react'
import PatientPage from '../../components/PatientPage'
import { getLabOrders } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { LabOrder } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'

function parseOrders(data: unknown): LabOrder[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: LabOrder[] }).data)) {
    return (data as { data: LabOrder[] }).data
  }
  return []
}

export default function LabReports() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.patient) {
      getLabOrders({ patient_id: user.patient.id })
        .then(({ data }) => setOrders(parseOrders(data)))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <PatientPage title="Lab reports" subtitle="Test orders and results from your clinic visits">
      {loading ? (
        <div className="ph-card"><p className="ph-muted">Loading reports...</p></div>
      ) : orders.length === 0 ? (
        <div className="ph-empty">
          <p className="ph-empty-title">No lab orders yet</p>
          <p className="ph-empty-sub">Lab results will appear here once ordered by your doctor.</p>
        </div>
      ) : (
        <div className="ph-lab-list">
          {orders.map((o) => (
            <article key={o.id} className="ph-lab-card">
              <div className="ph-lab-card-top">
                <span className={`ph-badge ph-badge-${o.status}`}>{o.status}</span>
                <span className="ph-lab-id">Order #{o.id}</span>
              </div>
              <p className="ph-lab-doctor">{displayDoctorName(o.doctor?.name)}</p>
              <p className="ph-lab-tests">
                {o.items?.map((i) => i.lab_test?.name).filter(Boolean).join(', ') || 'Lab tests'}
              </p>
              {o.report ? (
                <a
                  href={`http://127.0.0.1:8000/storage/${o.report.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ph-btn ph-btn-primary ph-btn-sm"
                >
                  View PDF Report
                </a>
              ) : (
                <span className="ph-muted ph-lab-pending">Report not uploaded yet</span>
              )}
            </article>
          ))}
        </div>
      )}
    </PatientPage>
  )
}
