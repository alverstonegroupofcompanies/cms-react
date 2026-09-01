import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { getLabOrders } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { patientNav } from '../../config/navigation'
import type { LabOrder } from '../../api/types'

export default function LabReports() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<LabOrder[]>([])

  useEffect(() => {
    if (user?.patient) {
      getLabOrders({ patient_id: user.patient.id }).then(({ data }) => setOrders(data.data || data))
    }
  }, [user])

  return (
    <Layout title="Lab Reports" subtitle="View your test results" nav={patientNav}>
      <div className="card">
        <div className="card-header"><h3>Your Lab Reports</h3></div>
        {orders.length === 0 ? (
          <p className="empty-state">No lab orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Doctor</th><th>Tests</th><th>Status</th><th>Report</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.doctor?.name}</td>
                    <td>{o.items?.map((i) => i.lab_test.name).join(', ')}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>
                      {o.report ? (
                        <a href={`http://127.0.0.1:8000/storage/${o.report.file_path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                          View PDF
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
