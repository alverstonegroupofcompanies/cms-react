import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { dispensePrescription, getPrescriptions } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Prescription } from '../../api/types'

export default function ReceptionistPharmacy() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [message, setMessage] = useState('')

  const load = () => {
    getPrescriptions({ status: 'pending' }).then(({ data }) => setPrescriptions(data.data || data))
  }

  useEffect(() => { load() }, [])

  const handleDispense = async (id: number) => {
    try {
      await dispensePrescription(id)
      setMessage('Prescription dispensed successfully')
      load()
    } catch {
      setMessage('Failed to dispense — check stock')
    }
  }

  return (
    <Layout title="Pharmacy Dispense" subtitle="Pending prescriptions" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        {prescriptions.length === 0 ? (
          <p className="empty-state">No pending prescriptions.</p>
        ) : (
          prescriptions.map((p) => (
            <div key={p.id} className="prescription-card">
              <div className="prescription-header">
                <div>
                  <strong>{p.patient?.name}</strong>
                  <span className="text-muted"> — Dr. {p.doctor?.name}</span>
                </div>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleDispense(p.id)}>Dispense</button>
              </div>
              <ul>
                {p.items?.map((item) => (
                  <li key={item.id}>{item.medicine?.name} — {item.dosage}, {item.frequency} × {item.quantity}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
