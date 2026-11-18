import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import VisitBillPreview, { billLinesFromVisitBill } from '../../components/VisitBillPreview'
import { getPrescriptions, getVisitBills } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Prescription, VisitBill } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'
import { doseScheduleLabel, parseDoseSchedule } from '../../utils/doseSchedule'
import { getBillTokenDisplay } from '../pharmacy/Dashboard'

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Prescription details · {selected.bill_code}</h3>
              {getBillTokenDisplay(selected) ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.22rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    background: '#0f766e',
                    color: '#ffffff',
                  }}
                >
                  Token {getBillTokenDisplay(selected)}
                </span>
              ) : null}
            </div>
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
            tokenCode={getBillTokenDisplay(selected)}
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
                const token = getBillTokenDisplay(b)
                return (
                  <article key={b.id} className="staff-doctor-card is-clickable" onClick={() => setSelected(b)}>
                    <div className="staff-doctor-card-body" style={{ paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <h4 className="staff-doctor-card-name" style={{ margin: 0, fontSize: '1.05rem' }}>
                          {b.patient?.name || 'Patient'}
                        </h4>
                        {token ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              background: '#0f766e',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 1px 3px rgba(15, 118, 110, 0.25)',
                            }}
                          >
                            Token {token}
                          </span>
                        ) : null}
                      </div>
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
            prescriptions.map((p) => {
              const rxToken = p.queue_token?.display_code || (p.queue_token?.token_number ? String(p.queue_token.token_number).padStart(2, '0') : null)
              return (
                <div key={p.id} className="prescription-card">
                  <div className="prescription-header">
                    <div className="rx-bill-identity">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <strong>{p.patient?.name || 'Patient'}</strong>
                        {rxToken ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              background: '#0f766e',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Token {rxToken}
                          </span>
                        ) : null}
                      </div>
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
              )
            })
          )}
        </div>
      )}
    </Layout>
  )
}
