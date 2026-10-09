import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import VisitBillPreview, { billLinesFromVisitBill, formatInr } from '../../components/VisitBillPreview'
import { getPrescriptions, getVisitBills } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Prescription, VisitBill } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'
import { doseScheduleLabel, parseDoseSchedule } from '../../utils/doseSchedule'

function DoseBadges({ frequency }: { frequency?: string | null }) {
  const slots = parseDoseSchedule(frequency)
  if (!slots) {
    return <span className="rx-freq-plain">{frequency || '—'}</span>
  }
  return (
    <span className="rx-dose-badges" title={doseScheduleLabel(frequency)}>
      <span className={`rx-dose-badge${slots.day ? ' is-on' : ''}`}>Day {slots.day ? '1' : '0'}</span>
      <span className={`rx-dose-badge${slots.noon ? ' is-on' : ''}`}>Noon {slots.noon ? '1' : '0'}</span>
      <span className={`rx-dose-badge${slots.evening ? ' is-on' : ''}`}>Evening {slots.evening ? '1' : '0'}</span>
      <span className={`rx-dose-badge${slots.night ? ' is-on' : ''}`}>Night {slots.night ? '1' : '0'}</span>
      <strong className="rx-dose-code">{frequency}</strong>
    </span>
  )
}

function billIdentity(p: Prescription) {
  return [
    p.patient?.patient_code,
    p.queue_token?.display_code,
    p.worksheet?.worksheet_code,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Reception / desk staff: view-only pharmacy bills (edits happen in Pharmacy portal). */
export default function ReceptionistPharmacy() {
  const [tab, setTab] = useState<'bills' | 'rx'>('bills')
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [bills, setBills] = useState<VisitBill[]>([])
  const [selected, setSelected] = useState<VisitBill | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [error, setError] = useState('')

  const loadBills = async () => {
    const { data } = await getVisitBills(filter === 'pending' ? { pharmacy_status: 'pending' } : {})
    const all = Array.isArray(data) ? data : []
    setBills(
      filter === 'all'
        ? all.filter((b) => b.pharmacy_status !== 'none')
        : all.filter((b) => b.pharmacy_status === 'pending')
    )
  }

  const loadRx = () => {
    getPrescriptions({ status: 'pending' }).then(({ data }) => setPrescriptions(data.data || data))
  }

  useEffect(() => {
    if (tab === 'bills') {
      loadBills().catch(() => setError('Could not load bills'))
    } else {
      loadRx()
    }
  }, [tab, filter])

  return (
    <Layout
      title="Pharmacy (view only)"
      subtitle="Reception can preview prescriptions and dispense status — pharmacy portal handles billing, purchase, and handover"
      nav={receptionistNav}
    >
      {error && <div className="alert alert-error">{error}</div>}

      <div className="pbh-ranges" role="group" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`pbh-range${tab === 'bills' ? ' pbh-range-on' : ''}`}
          onClick={() => { setSelected(null); setTab('bills') }}
        >
          Prescription orders
        </button>
        <button
          type="button"
          className={`pbh-range${tab === 'rx' ? ' pbh-range-on' : ''}`}
          onClick={() => { setSelected(null); setTab('rx') }}
        >
          Pending Rx list
        </button>
      </div>

      {tab === 'bills' && selected && (
        <div className="card">
          <div className="card-header">
            <h3>Prescription details · {selected.bill_code}</h3>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelected(null)}>
              Back
            </button>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            Read-only for reception. Pharmacy portal handles purchase / qty / handover.
          </p>
          <VisitBillPreview
            readOnly
            hidePrices
            billCode={selected.bill_code}
            patientName={selected.patient?.name || 'Patient'}
            worksheetCode={selected.worksheet?.worksheet_code || `WS #${selected.worksheet_id}`}
            lines={billLinesFromVisitBill(selected)}
            consultFee={selected.consultation_fee}
          />
        </div>
      )}

      {tab === 'bills' && !selected && (
        <div className="card">
          <div className="pbh-ranges" style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`pbh-range${filter === 'pending' ? ' pbh-range-on' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`pbh-range${filter === 'all' ? ' pbh-range-on' : ''}`}
              onClick={() => setFilter('all')}
            >
              All orders
            </button>
          </div>
          {bills.length === 0 ? (
            <p className="empty-state">No prescription orders here yet.</p>
          ) : (
            <div className="staff-doctor-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {bills.map((b) => {
                const pharm = (b.items || []).filter((i) => i.section === 'pharmacy')
                const bought = pharm.filter((i) => i.purchased || i.status === 'done').length
                return (
                  <article key={b.id} className="staff-doctor-card is-clickable" onClick={() => setSelected(b)}>
                    <div className="staff-doctor-card-body" style={{ paddingTop: '1rem' }}>
                      <h4 className="staff-doctor-card-name">{b.patient?.name || 'Patient'}</h4>
                      <p className="staff-doctor-card-spec">{b.bill_code}</p>
                      <p className="staff-doctor-card-meta">
                        Pharmacy: <strong style={{ textTransform: 'capitalize' }}>{b.pharmacy_status}</strong>
                      </p>
                      <p className="staff-doctor-card-meta">
                        Dispensed {bought}/{pharm.length} items
                      </p>
                      <div className="staff-doctor-card-actions">
                        <button type="button" className="btn btn-sm btn-secondary">View details</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'rx' && (
        <div className="card">
          <p className="muted" style={{ marginTop: 0 }}>
            View only — pharmacy staff hand over medicines from the Pharmacy login.
          </p>
          {prescriptions.length === 0 ? (
            <p className="empty-state">No pending prescriptions.</p>
          ) : (
            prescriptions.map((p) => (
              <div key={p.id} className="prescription-card">
                <div className="prescription-header">
                  <div className="rx-bill-identity">
                    <strong>{p.patient?.name || 'Patient'}</strong>
                    <span className="text-muted">
                      {billIdentity(p) || '—'}
                      {p.doctor?.name ? ` · ${displayDoctorName(p.doctor.name)}` : ''}
                    </span>
                    <span className="rx-bill-id">Rx #{p.id} · {p.status}</span>
                  </div>
                </div>
                <ul className="rx-item-list">
                  {p.items?.map((item) => (
                    <li key={item.id}>
                      <div className="rx-item-main">
                        <strong>{item.medicine?.name}</strong>
                        <span>
                          {item.dosage} · Qty {item.quantity}
                          {item.duration_days ? ` · ${item.duration_days}d` : ''}
                        </span>
                      </div>
                      <DoseBadges frequency={item.frequency} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  )
}
