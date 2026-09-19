import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PatientPage from '../../components/PatientPage'
import { getPrescriptions } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Prescription } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'
import { doseFrequencyShort } from '../../utils/doseSchedule'

function parseList(data: unknown): Prescription[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: Prescription[] }).data)) {
    return (data as { data: Prescription[] }).data
  }
  return []
}

function visitMeta(p: Prescription) {
  const bits = [
    p.patient?.patient_code,
    p.queue_token?.display_code,
    p.worksheet?.worksheet_code,
  ].filter(Boolean)
  return bits.join(' · ')
}

export default function PatientPrescriptions() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.patient) {
      setLoading(false)
      return
    }
    getPrescriptions({ patient_id: user.patient.id })
      .then(({ data }) => setRows(parseList(data)))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <PatientPage
      kicker="Care record"
      title="Prescriptions"
      subtitle="Medicines from your clinic visits, ready to review anytime."
      actions={
        <Link to="/patient/book" className="ph-btn ph-btn-primary">
          Book a visit
        </Link>
      }
    >
      {loading ? (
        <div className="ph-page-panel">
          <p className="ph-home-empty" style={{ margin: 0 }}>Loading prescriptions…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="ph-empty">
          <p className="ph-empty-title">No prescriptions yet</p>
          <p className="ph-empty-sub">After a visit, medicines your doctor prescribes will show up here.</p>
        </div>
      ) : (
        <div className="ph-lab-list">
          {rows.map((p) => (
            <article key={p.id} className="ph-page-panel">
              <div className="ph-page-panel-head">
                <h3>Rx #{p.id}</h3>
                <span className={`ph-home-pill`}>{p.status}</span>
              </div>
              <p className="ph-lab-doctor">{displayDoctorName(p.doctor?.name)}</p>
              {visitMeta(p) && <p className="ph-muted ph-visit-meta">{visitMeta(p)}</p>}
              <ul className="rx-added-list ph-rx-listing">
                {p.items?.map((item, i) => (
                  <li key={item.id} className="rx-added-card">
                    <span className="rx-idx">{i + 1}</span>
                    <div className="rx-added-body">
                      <strong>{item.medicine?.name}</strong>
                      <div className="rx-tags">
                        {item.dosage && <span>{item.dosage}</span>}
                        <span>{doseFrequencyShort(item.frequency)}</span>
                        {item.duration_days ? <span>{item.duration_days} days</span> : null}
                        {item.quantity ? <span>Qty {item.quantity}</span> : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {p.notes && <p className="ph-muted" style={{ marginTop: '0.75rem' }}>Note: {p.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </PatientPage>
  )
}
