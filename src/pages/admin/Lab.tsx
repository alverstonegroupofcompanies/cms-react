import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { getLabOrders, getLabTests, uploadLabReport } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { LabOrder, LabTest } from '../../api/types'

export default function AdminLab() {
  const [tests, setTests] = useState<LabTest[]>([])
  const [orders, setOrders] = useState<LabOrder[]>([])

  useEffect(() => {
    getLabTests().then(({ data }) => setTests(data))
    getLabOrders({ status: 'ordered' }).then(({ data }) => setOrders(data.data || data))
  }, [])

  const handleUpload = async (orderId: number, file: File) => {
    const fd = new FormData()
    fd.append('report', file)
    fd.append('result_summary', 'Report uploaded')
    await uploadLabReport(orderId, fd)
    getLabOrders({ status: 'ordered' }).then(({ data }) => setOrders(data.data || data))
  }

  return (
    <Layout title="Lab Management" subtitle="Test catalog and report uploads" nav={adminNav}>
      <div className="card">
        <div className="card-header"><h3>Lab Test Catalog</h3></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Code</th><th>Name</th><th>Price</th></tr></thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}><td><strong>{t.code}</strong></td><td>{t.name}</td><td>₹{t.price}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Pending Orders — Upload Reports</h3></div>
        {orders.length === 0 ? (
          <p className="empty-state">No pending orders.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="prescription-card">
              <div className="rx-bill-identity">
                <strong>{o.patient?.name}</strong>
                <span className="text-muted">
                  {[o.patient?.patient_code, o.queue_token?.display_code, o.worksheet?.worksheet_code]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </span>
                <span className="rx-bill-id">Order #{o.id}</span>
              </div>
              <span className="text-muted"> — {o.items?.map((i) => i.lab_test.name).join(', ')}</span>
              <div style={{ marginTop: '0.75rem' }}>
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => e.target.files?.[0] && handleUpload(o.id, e.target.files[0])} />
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
