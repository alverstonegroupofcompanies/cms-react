import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  getDoctorPatients,
  getLabOrders,
  getPatient,
  getPrescriptions,
  getVisitBills,
  getWorksheets,
  updatePatient,
} from '../../api/client'
import { doctorNav } from '../../config/navigation'
import VisitBillPreview, { billLinesFromVisitBill, formatInr } from '../../components/VisitBillPreview'
import { IconFlask, IconPill, IconStethoscope, IconUser } from '../../components/Icons'
import {
  visitHistoryFromPrior,
  visitHistoryHasContent,
} from '../../utils/clinicalData'
import { doseFrequencyShort } from '../../utils/doseSchedule'
import type { LabOrder, Patient, Prescription, VisitBill, Worksheet } from '../../api/types'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']

function initials(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const raw = String(value).trim()
  const normalized = raw.includes('T')
    ? raw
    : raw.includes(' ')
      ? raw.replace(' ', 'T')
      : `${raw.slice(0, 10)}T12:00:00`
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function ageFromDob(dob?: string | null) {
  if (!dob) return null
  const born = new Date(`${String(dob).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(born.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1
  return age >= 0 ? age : null
}

function statusClass(status?: string) {
  const s = (status || '').toLowerCase()
  if (['open', 'pending', 'ordered', 'booked'].includes(s)) return 'dph-pill is-warn'
  if (['closed', 'completed', 'dispensed', 'done', 'active'].includes(s)) return 'dph-pill is-ok'
  if (['cancelled', 'canceled'].includes(s)) return 'dph-pill is-bad'
  return 'dph-pill'
}

export default function DoctorPatient() {
  const { id } = useParams()
  const [search, setSearch] = useState('')
  const [roster, setRoster] = useState<Patient[]>([])
  const [rosterLoading, setRosterLoading] = useState(!id)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [bills, setBills] = useState<VisitBill[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [viewBill, setViewBill] = useState<VisitBill | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    gender: '',
    dob: '',
    blood_group: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    address: '',
  })

  const hydrate = (p: Patient) => {
    const [first, ...rest] = (p.name || '').trim().split(/\s+/)
    setForm({
      first_name: p.first_name || first || '',
      last_name: p.last_name || rest.join(' ') || '',
      phone: p.phone || '',
      email: p.email || '',
      gender: p.gender || '',
      dob: p.dob ? String(p.dob).slice(0, 10) : '',
      blood_group: p.blood_group || '',
      emergency_contact: p.emergency_contact || '',
      emergency_contact_phone: p.emergency_contact_phone || '',
      address: p.address || '',
    })
  }

  const loadPatient = useCallback(async (patientId: number) => {
    setLoading(true)
    setError('')
    setViewBill(null)
    setEditOpen(false)
    try {
      const [
        { data: p },
        { data: wsPage },
        { data: billData },
        { data: rxData },
        { data: labData },
      ] = await Promise.all([
        getPatient(patientId),
        getWorksheets({ patient_id: patientId }),
        getVisitBills({ patient_id: patientId }),
        getPrescriptions({ patient_id: patientId }),
        getLabOrders({ patient_id: patientId }),
      ])
      setPatient(p)
      hydrate(p)
      setWorksheets(Array.isArray(wsPage?.data) ? wsPage.data : Array.isArray(wsPage) ? wsPage : [])
      setBills(Array.isArray(billData) ? billData : [])
      setPrescriptions(Array.isArray(rxData?.data) ? rxData.data : Array.isArray(rxData) ? rxData : [])
      setLabOrders(Array.isArray(labData?.data) ? labData.data : Array.isArray(labData) ? labData : [])
    } catch {
      setError('Could not load patient')
      setPatient(null)
      setWorksheets([])
      setBills([])
      setPrescriptions([])
      setLabOrders([])
    }
    setLoading(false)
  }, [])

  const priorHistory = useMemo(() => {
    const source = worksheets.find(
      (w) => (w.clinical_data && Object.keys(w.clinical_data as object).length > 0) || w.diagnosis
    )
    if (!source) return null
    const visit = visitHistoryFromPrior(source.clinical_data, source.diagnosis)
    if (!visitHistoryHasContent(visit)) return null
    return { worksheet: source, visit }
  }, [worksheets])

  const age = ageFromDob(patient?.dob)
  const historyFields = useMemo(() => {
    if (!priorHistory) return []
    const v = priorHistory.visit
    const allergies = [v.drug_allergies && `Drug — ${v.drug_allergies}`, v.known_allergies]
      .filter(Boolean)
      .join(' · ')
    return [
      { key: 'diagnosis', label: 'Previous diagnosis', value: v.previous_diagnosis, tone: 'accent' as const },
      { key: 'past', label: 'Past history', value: v.past_history },
      { key: 'allergies', label: 'Allergies', value: allergies || null, tone: 'warn' as const },
      { key: 'meds', label: 'Current medications', value: v.current_medications },
      { key: 'surgery', label: 'Surgeries', value: v.previous_surgeries },
      { key: 'family', label: 'Family history', value: v.family_history },
    ].filter((f) => f.value)
  }, [priorHistory])

  useEffect(() => {
    if (id) void loadPatient(Number(id))
    else {
      setPatient(null)
      setWorksheets([])
      setBills([])
      setPrescriptions([])
      setLabOrders([])
      setLoading(false)
    }
  }, [id, loadPatient])

  const loadRoster = useCallback(async (q = '') => {
    setRosterLoading(true)
    try {
      const { data } = await getDoctorPatients(q)
      setRoster(Array.isArray(data) ? data : [])
    } catch {
      setRoster([])
      setError('Could not load your patient list')
    }
    setRosterLoading(false)
  }, [])

  useEffect(() => {
    void loadRoster()
  }, [loadRoster])

  const filteredRoster = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return roster
    return roster.filter((p) => {
      const hay = `${p.name} ${p.patient_code} ${p.phone || ''} ${p.email || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [roster, search])

  const handleSearch = () => {
    void loadRoster(search.trim())
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setSaving(true)
    setError('')
    try {
      const { data } = await updatePatient(patient.id, {
        first_name: form.first_name,
        last_name: form.last_name || undefined,
        phone: form.phone,
        email: form.email || undefined,
        gender: form.gender || undefined,
        dob: form.dob || undefined,
        blood_group: form.blood_group || undefined,
        emergency_contact: form.emergency_contact || undefined,
        emergency_contact_phone: form.emergency_contact_phone || undefined,
        address: form.address || undefined,
      })
      setPatient(data)
      hydrate(data)
      setMessage('Patient details saved')
      setEditOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Update failed')
    }
    setSaving(false)
  }

  return (
    <Layout title="Patients" subtitle="Your visit history · clinical chart, Rx, labs & bills" nav={doctorNav}>
      <div className="dph">
        <section className="dph-search">
          <div className="dph-search-bar">
            <IconUser size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter your patients by name, phone or ID"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Filter patients"
            />
            <button type="button" className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </section>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!id && (
          <section className="dph-roster" aria-label="Patients you have seen">
            <div className="dph-roster-head">
              <div>
                <h3>Your patients</h3>
                <p>Prior visits with you · newest first</p>
              </div>
              <span className="dph-roster-count">{filteredRoster.length}</span>
            </div>
            {rosterLoading ? (
              <div className="dph-empty dph-empty-compact">Loading patients…</div>
            ) : filteredRoster.length === 0 ? (
              <div className="dph-empty dph-empty-compact">
                <IconStethoscope size={24} />
                <h3>{search.trim() ? 'No matches' : 'No prior visits yet'}</h3>
                <p>
                  {search.trim()
                    ? 'Try another name, phone, or patient ID.'
                    : 'Patients appear here after you complete a consult with them.'}
                </p>
              </div>
            ) : (
              <ul className="dph-roster-list">
                {filteredRoster.map((p) => (
                  <li key={p.id}>
                    <Link to={`/doctor/patients/${p.id}`} className="dph-roster-row">
                      <span className="dph-avatar" aria-hidden>
                        {initials(p.name)}
                      </span>
                      <span className="dph-roster-body">
                        <strong>{p.name}</strong>
                        <span>
                          {p.patient_code}
                          {p.phone ? ` · ${p.phone}` : ''}
                          {p.visit_count ? ` · ${p.visit_count} visit${p.visit_count === 1 ? '' : 's'}` : ''}
                        </span>
                      </span>
                      <span className="dph-roster-meta">
                        <em>Last visit</em>
                        <strong>
                          {formatDate(p.last_visit_at || p.last_appointment?.appointment_date)}
                        </strong>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {id && loading ? (
          <div className="dph-empty">Loading patient chart…</div>
        ) : id && !patient ? (
          <div className="dph-empty">
            <IconStethoscope size={28} />
            <h3>Patient not found</h3>
            <p>
              <Link to="/doctor/patients">Back to your patient list</Link>
            </p>
          </div>
        ) : patient ? (
          <>
            <p className="dph-back">
              <Link to="/doctor/patients">← All your patients</Link>
            </p>
            <header className="dph-hero">
              <div className="dph-hero-main">
                {patient.photo_url ? (
                  <img className="dph-avatar dph-avatar-lg" src={patient.photo_url} alt="" />
                ) : (
                  <span className="dph-avatar dph-avatar-lg" aria-hidden>
                    {initials(patient.name)}
                  </span>
                )}
                <div className="dph-hero-copy">
                  <p className="dph-kicker">Patient chart</p>
                  <h2>{patient.name}</h2>
                  <p className="dph-hero-meta">
                    <span>{patient.patient_code}</span>
                    {age != null && <span>{age} yrs</span>}
                    {patient.gender && <span className="dph-cap">{patient.gender}</span>}
                    {patient.blood_group && patient.blood_group !== 'unknown' && (
                      <span className="dph-blood">{patient.blood_group}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="dph-hero-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen((v) => !v)}>
                  {editOpen ? 'Close edit' : 'Edit details'}
                </button>
              </div>
              <dl className="dph-stats">
                <div>
                  <dt>Visits</dt>
                  <dd>{worksheets.length}</dd>
                </div>
                <div>
                  <dt>Rx</dt>
                  <dd>{prescriptions.length}</dd>
                </div>
                <div>
                  <dt>Labs</dt>
                  <dd>{labOrders.length}</dd>
                </div>
                <div>
                  <dt>Bills</dt>
                  <dd>{bills.length}</dd>
                </div>
              </dl>
              <div className="dph-contact-strip">
                <div>
                  <span className="dph-label">Phone</span>
                  <strong>{patient.phone || '—'}</strong>
                </div>
                <div>
                  <span className="dph-label">Emergency</span>
                  <strong>
                    {patient.emergency_contact_phone || patient.emergency_contact || '—'}
                  </strong>
                </div>
                <div>
                  <span className="dph-label">DOB</span>
                  <strong>{formatDate(patient.dob)}</strong>
                </div>
                <div>
                  <span className="dph-label">Address</span>
                  <strong>{patient.address || '—'}</strong>
                </div>
              </div>
            </header>

            {editOpen && (
              <section className="dph-panel dph-edit">
                <div className="dph-panel-head">
                  <h3>Update details</h3>
                  <p>Demographics and contact for this chart</p>
                </div>
                <form onSubmit={save} className="dph-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First name</label>
                      <input
                        required
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last name</label>
                      <input
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact number</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Emergency contact number</label>
                      <input
                        value={form.emergency_contact_phone}
                        onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      >
                        <option value="">—</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>DOB</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Blood group</label>
                      <select
                        value={form.blood_group}
                        onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                      >
                        <option value="">—</option>
                        {BLOOD_GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Emergency contact note</label>
                    <input
                      value={form.emergency_contact}
                      onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save patient'}
                  </button>
                </form>
              </section>
            )}

            <div className="dph-layout">
              <section className="dph-panel dph-clinical">
                <div className="dph-panel-head">
                  <div>
                    <h3>Clinical history</h3>
                    <p>Carry-forward context from prior visits</p>
                  </div>
                  {priorHistory && (
                    <Link
                      to={`/doctor/worksheet/${priorHistory.worksheet.id}`}
                      className="dph-link"
                    >
                      {priorHistory.worksheet.worksheet_code}
                    </Link>
                  )}
                </div>
                {!priorHistory ? (
                  <div className="dph-panel-empty">No prior clinical history recorded yet.</div>
                ) : (
                  <div className="dph-clinical-grid">
                    <p className="dph-clinical-from">
                      From {formatDate(priorHistory.worksheet.opened_at)}
                    </p>
                    {historyFields.map((f) => (
                      <article key={f.key} className={`dph-clinical-item ${f.tone ? `is-${f.tone}` : ''}`}>
                        <span className="dph-label">{f.label}</span>
                        <p>{f.value}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="dph-panel">
                <div className="dph-panel-head">
                  <div>
                    <h3>Visit timeline</h3>
                    <p>Worksheets for this patient</p>
                  </div>
                </div>
                {worksheets.length === 0 ? (
                  <div className="dph-panel-empty">No worksheets yet.</div>
                ) : (
                  <ol className="dph-timeline">
                    {worksheets.map((w) => (
                      <li key={w.id}>
                        <span className="dph-timeline-dot" aria-hidden />
                        <Link to={`/doctor/worksheet/${w.id}`} className="dph-timeline-card">
                          <div className="dph-timeline-top">
                            <strong>{w.worksheet_code}</strong>
                            <span className={statusClass(w.status)}>{w.status}</span>
                          </div>
                          <p className="dph-timeline-date">{formatDate(w.opened_at)}</p>
                          {w.diagnosis ? (
                            <p className="dph-timeline-dx">{w.diagnosis}</p>
                          ) : (
                            <p className="dph-timeline-dx is-muted">No diagnosis recorded</p>
                          )}
                          {w.chief_complaint && (
                            <p className="dph-timeline-cc">{w.chief_complaint}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="dph-panel">
                <div className="dph-panel-head">
                  <div>
                    <h3>
                      <IconPill size={16} /> Prescriptions
                    </h3>
                    <p>Medicines prescribed across visits</p>
                  </div>
                </div>
                {prescriptions.length === 0 ? (
                  <div className="dph-panel-empty">No prescriptions on record.</div>
                ) : (
                  <ul className="dph-rx-list">
                    {prescriptions.map((rx) => (
                      <li key={rx.id} className="dph-rx-block">
                        <div className="dph-rx-meta">
                          <strong>Rx #{rx.id}</strong>
                          <span className={statusClass(rx.status)}>{rx.status}</span>
                          <span className="dph-muted">{formatDate(rx.created_at)}</span>
                          {rx.worksheet?.worksheet_code && (
                            <Link to={`/doctor/worksheet/${rx.worksheet.id}`} className="dph-link">
                              {rx.worksheet.worksheet_code}
                            </Link>
                          )}
                        </div>
                        <ol className="dph-med-list">
                          {(rx.items || []).length === 0 ? (
                            <li className="dph-muted">No line items</li>
                          ) : (
                            (rx.items || []).map((item, idx) => (
                              <li key={item.id}>
                                <span className="dph-med-num">{idx + 1}</span>
                                <div>
                                  <strong>{item.medicine?.name || 'Medicine'}</strong>
                                  <div className="dph-med-tags">
                                    <span>{item.dosage}</span>
                                    <span>{doseFrequencyShort(item.frequency)}</span>
                                    <span>{item.duration_days}d</span>
                                    <span>×{item.quantity}</span>
                                  </div>
                                </div>
                              </li>
                            ))
                          )}
                        </ol>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dph-panel">
                <div className="dph-panel-head">
                  <div>
                    <h3>
                      <IconFlask size={16} /> Lab orders
                    </h3>
                    <p>Diagnostics ordered for this patient</p>
                  </div>
                </div>
                {labOrders.length === 0 ? (
                  <div className="dph-panel-empty">No lab orders on record.</div>
                ) : (
                  <ul className="dph-lab-list">
                    {labOrders.map((o) => (
                      <li key={o.id}>
                        <div className="dph-lab-top">
                          <strong>Order #{o.id}</strong>
                          <span className={statusClass(o.status)}>{o.status}</span>
                        </div>
                        <p className="dph-muted">
                          {formatDate(o.created_at)}
                          {o.worksheet?.worksheet_code ? ` · ${o.worksheet.worksheet_code}` : ''}
                        </p>
                        <div className="dph-chip-row">
                          {(o.items || []).length === 0 ? (
                            <span className="dph-chip">No tests</span>
                          ) : (
                            (o.items || []).map((i) => (
                              <span key={i.id} className="dph-chip">
                                {i.lab_test?.name || 'Test'}
                              </span>
                            ))
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="dph-panel dph-bills">
                <div className="dph-panel-head">
                  <div>
                    <h3>Visit bills</h3>
                    <p>Final checkout snapshots</p>
                  </div>
                </div>
                {viewBill ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ marginBottom: '0.85rem' }}
                      onClick={() => setViewBill(null)}
                    >
                      Back to bill list
                    </button>
                    <VisitBillPreview
                      readOnly
                      billCode={viewBill.bill_code}
                      patientName={patient.name}
                      worksheetCode={viewBill.worksheet?.worksheet_code || `WS #${viewBill.worksheet_id}`}
                      lines={billLinesFromVisitBill(viewBill)}
                      consultFee={viewBill.consultation_fee}
                    />
                  </>
                ) : bills.length === 0 ? (
                  <div className="dph-panel-empty">
                    No final bills yet. They appear after Final submit / checkout.
                  </div>
                ) : (
                  <ul className="dph-bill-list">
                    {bills.map((b) => (
                      <li key={b.id}>
                        <button type="button" className="dph-bill-row" onClick={() => setViewBill(b)}>
                          <span className="dph-bill-code">{b.bill_code}</span>
                          <span className="dph-bill-amt">{formatInr(b.grand_total)}</span>
                          <span className="dph-chip-row">
                            <span className={statusClass(b.pharmacy_status)}>Rx {b.pharmacy_status}</span>
                            <span className={statusClass(b.lab_status)}>Lab {b.lab_status}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  )
}
