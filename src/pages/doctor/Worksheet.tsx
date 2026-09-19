import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  getLabTests,
  getVisitBills,
  getWorksheet,
  getWorksheetByToken,
  getWorksheets,
  updatePatient,
  updateWorksheet,
  checkOutQueueToken,
  callNext,
  createLabOrder,
  createPrescription,
} from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { doctorNav } from '../../config/navigation'
import DoseSchedulePicker from '../../components/DoseSchedulePicker'
import MedicineSearchSelect from '../../components/MedicineSearchSelect'
import ClinicalRecordPanel from '../../components/ClinicalRecordPanel'
import ClinicalRecordSummary from '../../components/ClinicalRecordSummary'
import VisitBillPreview, { billLinesFromVisitBill, buildVisitBillLines, formatInr } from '../../components/VisitBillPreview'
import HintTip from '../../components/HintTip'
import {
  IconAlert,
  IconArrowLeft,
  IconCheck,
  IconDroplet,
  IconFlask,
  IconPhone,
  IconPill,
  IconReceipt,
  IconStethoscope,
  IconTrash,
  IconUser,
} from '../../components/Icons'
import {
  doseFrequencyShort,
  formatDoseSchedule,
  defaultDoseSlots,
  isEmptyDoseSchedule,
  suggestedQuantity,
} from '../../utils/doseSchedule'
import {
  normalizeClinicalData,
  suggestLocalTemplate,
  suggestSpecialtyKey,
  visitHistoryFromPrior,
  type ClinicalData,
} from '../../utils/clinicalData'
import type { LabTest, Medicine, Patient, VisitBill, Worksheet } from '../../api/types'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
const RX_DURATION_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

type RxItem = {
  medicine_id: number
  dosage: string
  frequency: string
  duration_days: number
  quantity: number
}

function clampRxDays(value: number) {
  const n = Math.floor(Number(value) || 1)
  return Math.min(10, Math.max(1, n))
}

function emptyRxItem(): RxItem {
  const frequency = formatDoseSchedule(defaultDoseSlots())
  const duration_days = 5
  return {
    medicine_id: 0,
    dosage: '1 tablet',
    frequency,
    duration_days,
    quantity: suggestedQuantity(frequency, duration_days),
  }
}

function emergencyPhone(p?: Patient | null) {
  if (!p) return '—'
  return p.emergency_contact_phone || p.emergency_contact || '—'
}

function formatDob(dob?: string | null) {
  if (!dob) return '—'
  return new Date(dob.includes('T') ? dob : dob + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function DoctorWorksheet() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const tokenParam = searchParams.get('token')
  const navigate = useNavigate()
  const { user } = useAuth()

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingPatient, setEditingPatient] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [callingNext, setCallingNext] = useState(false)
  const [showStructuredExam, setShowStructuredExam] = useState(false)

  const [patientForm, setPatientForm] = useState({
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

  const [chiefComplaint, setChiefComplaint] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [clinical, setClinical] = useState<ClinicalData>(() => normalizeClinicalData())

  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMeds, setSelectedMeds] = useState<Record<number, Medicine>>({})
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [rxNotes, setRxNotes] = useState('')
  const [rxItems, setRxItems] = useState<RxItem[]>([])
  const [editingRxIdx, setEditingRxIdx] = useState<number | null>(null)
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [labNotes, setLabNotes] = useState('')
  const [savingRx, setSavingRx] = useState(false)
  const [savingLab, setSavingLab] = useState(false)
  const [visitPhase, setVisitPhase] = useState<'work' | 'preview' | 'done'>('work')
  const [lastBillTotal, setLastBillTotal] = useState(0)
  const [savedBill, setSavedBill] = useState<VisitBill | null>(null)
  const [showSavedBill, setShowSavedBill] = useState(false)

  const hydratePatientForm = (p: Patient) => {
    const [first, ...rest] = (p.name || '').trim().split(/\s+/)
    setPatientForm({
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

  const load = useCallback(async (opts?: { quiet?: boolean }): Promise<Worksheet | null> => {
    if (!opts?.quiet) setLoading(true)
    setError('')
    try {
      let data: Worksheet
      if (tokenParam) {
        const res = await getWorksheetByToken(Number(tokenParam))
        data = res.data
        if (id === 'new' || String(data.id) !== id) {
          navigate(`/doctor/worksheet/${data.id}`, { replace: true })
        }
      } else if (id && id !== 'new') {
        const res = await getWorksheet(id)
        data = res.data
      } else {
        setError('Worksheet not found')
        if (!opts?.quiet) setLoading(false)
        return null
      }
      setWorksheet(data)
      if (data.patient) hydratePatientForm(data.patient)
      setChiefComplaint(data.chief_complaint || '')
      setClinicalNotes(data.clinical_notes || '')
      setDiagnosis(data.diagnosis || '')

      let next = normalizeClinicalData(data.clinical_data)
      const hasSaved = Boolean(data.clinical_data && Object.keys(data.clinical_data).length)
      const isClosed = data.status !== 'open'
      if (!hasSaved && !isClosed) {
        // Carry allergies / past history from the patient's last worksheet with this doctor.
        try {
          const { data: wsPage } = await getWorksheets({ patient_id: data.patient_id })
          const list: Worksheet[] = Array.isArray(wsPage?.data)
            ? wsPage.data
            : Array.isArray(wsPage)
              ? wsPage
              : []
          const prior = list.find((w) => w.id !== data.id)
          if (prior) {
            next = {
              ...next,
              visit: visitHistoryFromPrior(prior.clinical_data, prior.diagnosis),
            }
          }
        } catch {
          /* ignore — worksheet still opens without prior history */
        }

        const spec = data.doctor?.specialization
        const local = suggestLocalTemplate(spec)
        const specialty = suggestSpecialtyKey(spec)
        if (local !== 'none' && next.local_exam.template === 'none') {
          next = {
            ...next,
            local_exam: { ...next.local_exam, template: local, fields: {} },
          }
        }
        if (specialty !== 'none' && next.specialty.key === 'none') {
          next = { ...next, specialty: { key: specialty, fields: {} } }
        }
        if (data.advice) next = { ...next, plan: { ...next.plan, advice: data.advice } }
        if (data.follow_up) next = { ...next, plan: { ...next.plan, follow_up: data.follow_up } }
      } else {
        if (!next.plan.advice && data.advice) next.plan.advice = data.advice
        if (!next.plan.follow_up && data.follow_up) next.plan.follow_up = data.follow_up
      }
      setClinical(next)
      try {
        const { data: bills } = await getVisitBills({ worksheet_id: data.id })
        const list = Array.isArray(bills) ? bills : []
        setSavedBill(list[0] || null)
      } catch {
        setSavedBill(null)
      }
      return data
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not load worksheet')
      return null
    } finally {
      if (!opts?.quiet) setLoading(false)
    }
  }, [id, tokenParam, navigate])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    getLabTests().then(({ data }) => setLabTests(data)).catch(() => {})
  }, [])

  useEffect(() => {
    setMedicines(Object.values(selectedMeds))
  }, [selectedMeds])

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(''), 3500)
    return () => window.clearTimeout(t)
  }, [message])

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!worksheet?.patient_id) return false
    setSavingPatient(true)
    setError('')
    try {
      const { data } = await updatePatient(worksheet.patient_id, {
        first_name: patientForm.first_name,
        last_name: patientForm.last_name || undefined,
        phone: patientForm.phone,
        email: patientForm.email || undefined,
        gender: patientForm.gender || undefined,
        dob: patientForm.dob || undefined,
        blood_group: patientForm.blood_group || undefined,
        emergency_contact: patientForm.emergency_contact || undefined,
        emergency_contact_phone: patientForm.emergency_contact_phone || undefined,
        address: patientForm.address || undefined,
      })
      setWorksheet((prev) => (prev ? { ...prev, patient: data } : prev))
      hydratePatientForm(data)
      setMessage('Patient details updated')
      setSavingPatient(false)
      return true
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not update patient')
      setSavingPatient(false)
      return false
    }
  }

  const persistClinical = async (opts?: { quiet?: boolean }) => {
    if (!worksheet) return false
    setSavingNotes(true)
    setError('')
    try {
      const { data } = await updateWorksheet(worksheet.id, {
        chief_complaint: chiefComplaint,
        clinical_notes: clinicalNotes,
        clinical_data: clinical,
        diagnosis: diagnosis || null,
        advice: clinical.plan.advice || null,
        follow_up: clinical.plan.follow_up || null,
      })
      setWorksheet(data)
      setClinical(normalizeClinicalData(data.clinical_data))
      setChiefComplaint(data.chief_complaint || '')
      setClinicalNotes(data.clinical_notes || '')
      setDiagnosis(data.diagnosis || '')
      if (!opts?.quiet) setMessage('Clinical record saved')
      setSavingNotes(false)
      return true
    } catch {
      setError('Could not save clinical record')
      setSavingNotes(false)
      return false
    }
  }

  const saveNotes = async () => {
    await persistClinical()
  }

  const saveDraftPrescription = async (opts?: { quiet?: boolean }): Promise<boolean> => {
    if (!worksheet || !user?.doctor) return false
    const items = rxItems
      .filter((i) => i.medicine_id)
      .map((i) => ({ ...i, duration_days: clampRxDays(i.duration_days) }))
    if (!items.length) {
      if (!opts?.quiet) setError('Add at least one medicine')
      return false
    }
    if (items.some((i) => isEmptyDoseSchedule(i.frequency))) {
      setError('Select at least one dose time (Day / Noon / Evening / Night) for each medicine')
      return false
    }
    setSavingRx(true)
    if (!opts?.quiet) setError('')
    try {
      await createPrescription({
        patient_id: worksheet.patient_id,
        doctor_id: user.doctor.id,
        queue_token_id: worksheet.queue_token_id,
        worksheet_id: worksheet.id,
        notes: rxNotes || undefined,
        items,
      })
      if (!opts?.quiet) setMessage('Prescription saved and sent to pharmacy')
      setRxNotes('')
      setRxItems([])
      setEditingRxIdx(null)
      await load({ quiet: true })
      setSavingRx(false)
      return true
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not create prescription')
      setSavingRx(false)
      return false
    }
  }

  const submitPrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveDraftPrescription()
  }

  const orderedTestIdsFromWorksheet = (ws: Worksheet | null | undefined) => {
    const ids = new Set<number>()
    ws?.lab_orders?.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.lab_test?.id) ids.add(item.lab_test.id)
      })
    })
    return ids
  }

  const saveDraftLabOrder = async (opts?: { quiet?: boolean }): Promise<boolean> => {
    if (!worksheet || !user?.doctor) return false
    const ordered = orderedTestIdsFromWorksheet(worksheet)
    const newIds = selectedTests.filter((tid) => !ordered.has(tid))
    if (!newIds.length) {
      if (!opts?.quiet) setError('Select a new lab test to order')
      return false
    }
    setSavingLab(true)
    if (!opts?.quiet) setError('')
    try {
      await createLabOrder({
        patient_id: worksheet.patient_id,
        doctor_id: user.doctor.id,
        queue_token_id: worksheet.queue_token_id,
        worksheet_id: worksheet.id,
        test_ids: newIds,
        notes: labNotes || undefined,
      })
      if (!opts?.quiet) setMessage('Lab order added to worksheet')
      setSelectedTests([])
      setLabNotes('')
      await load({ quiet: true })
      setSavingLab(false)
      return true
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not create lab order')
      setSavingLab(false)
      return false
    }
  }

  /** Persist notes + any unsaved Rx / lab drafts before bill preview or checkout. */
  const flushVisitDrafts = async (): Promise<Worksheet | null> => {
    const notesOk = await persistClinical({ quiet: true })
    if (!notesOk) return null

    const hasRxDraft = rxItems.some((i) => i.medicine_id > 0)
    if (hasRxDraft) {
      const rxOk = await saveDraftPrescription({ quiet: true })
      if (!rxOk) return null
    }

    const ordered = orderedTestIdsFromWorksheet(worksheet)
    const hasLabDraft = selectedTests.some((tid) => !ordered.has(tid))
    if (hasLabDraft) {
      const labOk = await saveDraftLabOrder({ quiet: true })
      if (!labOk) return null
    }

    return (await load({ quiet: true })) || worksheet
  }

  const billLines = useMemo(() => {
    if (!worksheet) return []
    return buildVisitBillLines({
      worksheet,
      medicines,
      labTests,
      draftRx: rxItems.filter((i) => i.medicine_id > 0),
      draftTestIds: selectedTests,
    })
  }, [worksheet, medicines, labTests, rxItems, selectedTests])

  const openFinalSubmit = async () => {
    if (!worksheet?.queue_token_id) return
    setError('')
    setMessage('')
    setCheckingOut(true)
    try {
      const saved = await flushVisitDrafts()
      if (!saved) return
      setMessage('Changes saved — review bill then confirm checkout')
      setVisitPhase('preview')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setCheckingOut(false)
    }
  }

  const handleConfirmFinalSubmit = async () => {
    if (!worksheet?.queue_token_id) return

    setCheckingOut(true)
    setError('')
    try {
      const fresh = await flushVisitDrafts()
      if (!fresh) {
        setCheckingOut(false)
        return
      }

      const fee = Number(user?.doctor?.consultation_fee) || 0
      const lines = buildVisitBillLines({
        worksheet: fresh,
        medicines,
        labTests,
      })
      const total = fee + lines.reduce((s, l) => s + l.amount, 0)
      setLastBillTotal(total)

      await checkOutQueueToken(worksheet.queue_token_id)
      setMessage('Visit submitted — patient checked out')
      await load({ quiet: true })
      setVisitPhase('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Final submit failed')
    }
    setCheckingOut(false)
  }

  const goDashboard = () => {
    navigate('/doctor/dashboard')
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const seeNextPatient = async () => {
    if (!user?.doctor?.id) {
      goDashboard()
      return
    }
    setCallingNext(true)
    setError('')
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await callNext(user.doctor.id, today)
      const wsId = data.worksheet?.id
      if (wsId) {
        navigate(`/doctor/worksheet/${wsId}`)
        return
      }
      if (data.id) {
        navigate(`/doctor/worksheet/new?token=${data.id}`)
        return
      }
      goDashboard()
    } catch {
      setMessage('No more patients waiting — back to day board')
      goDashboard()
    } finally {
      setCallingNext(false)
    }
  }

  const viewDetails = () => {
    setVisitPhase('work')
    setShowSavedBill(Boolean(savedBill))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const patient = worksheet?.patient
  const isOpen = worksheet?.status === 'open'

  const orderedTestIds = useMemo(
    () => orderedTestIdsFromWorksheet(worksheet),
    [worksheet?.lab_orders],
  )

  const submitLab = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveDraftLabOrder()
  }

  return (
    <Layout
      title="Consult worksheet"
      hidePageHeader
      nav={doctorNav}
    >
      <div className="ws">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading && !worksheet ? (
          <div className="ws-loading">Loading worksheet…</div>
        ) : !worksheet ? (
          <div className="ws-loading">Worksheet not found.</div>
        ) : visitPhase === 'done' ? (
          <div className="ws-done">
            <div className="ws-done-card">
              <div className="ws-done-icon" aria-hidden>
                <IconCheck size={28} />
              </div>
              <p className="ws-bill-kicker">Visit complete</p>
              <h2>{patient?.name || 'Patient'} checked out</h2>
              <p className="ws-done-sub">
                Worksheet {worksheet.worksheet_code} is closed
                {lastBillTotal > 0 ? ` · bill ${formatInr(lastBillTotal)}` : ''}.
              </p>
              <div className="ws-done-actions">
                <button
                  type="button"
                  className="ws-btn ws-btn-checkout"
                  disabled={callingNext}
                  onClick={() => void seeNextPatient()}
                >
                  {callingNext ? 'Opening…' : 'See next patient'}
                </button>
                <button type="button" className="ws-btn ws-btn-ghost" onClick={goDashboard}>
                  Day board
                </button>
                <button type="button" className="ws-btn ws-btn-ghost" onClick={viewDetails}>
                  View this visit
                </button>
              </div>
            </div>
          </div>
        ) : visitPhase === 'preview' ? (
          <VisitBillPreview
            patientName={patient?.name || 'Patient'}
            worksheetCode={worksheet.worksheet_code}
            lines={billLines}
            consultFee={user?.doctor?.consultation_fee}
            confirming={checkingOut}
            onBack={() => setVisitPhase('work')}
            onConfirm={handleConfirmFinalSubmit}
          />
        ) : (
          <>
            <header className="ws-hero">
              <div className="ws-hero-main">
                <span className="ws-avatar" aria-hidden>
                  {initials(patient?.name)}
                </span>
                <div className="ws-hero-copy">
                  <Link to="/doctor/dashboard" className="ws-back">
                    <IconArrowLeft size={14} /> Day board
                  </Link>
                  <p className="ws-kicker">Consult worksheet</p>
                  <h2 className="ws-patient-name">{patient?.name || 'Patient'}</h2>
                  <p className="ws-patient-sub">
                    {patient?.patient_code || '—'}
                    {patient?.phone ? ` · ${patient.phone}` : ''}
                  </p>
                  <div className="ws-chips">
                    <span className="ws-chip">
                      <em>Worksheet</em>
                      {worksheet.worksheet_code}
                    </span>
                    {worksheet.queue_token?.display_code && (
                      <span className="ws-chip">
                        <em>Token</em>
                        {worksheet.queue_token.display_code}
                      </span>
                    )}
                    <span className={`ws-chip ws-chip-status${isOpen ? ' is-open' : ' is-closed'}`}>
                      {isOpen ? 'Open consult' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ws-hero-actions">
                <Link to={`/doctor/patients/${worksheet.patient_id}`} className="ws-btn ws-btn-ghost">
                  <IconUser size={15} /> Full profile
                </Link>
                {savedBill && (
                  <button
                    type="button"
                    className="ws-btn ws-btn-ghost"
                    onClick={() => {
                      setShowSavedBill(true)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <IconReceipt size={15} /> View bill
                  </button>
                )}
              </div>
            </header>

            {showSavedBill && savedBill && (
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header">
                  <h3>Visit bill</h3>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowSavedBill(false)}>
                    Close
                  </button>
                </div>
                <VisitBillPreview
                  readOnly
                  billCode={savedBill.bill_code}
                  patientName={patient?.name || 'Patient'}
                  worksheetCode={worksheet.worksheet_code}
                  lines={billLinesFromVisitBill(savedBill)}
                  consultFee={savedBill.consultation_fee}
                />
              </div>
            )}

            <div className="ws-layout">
              <aside className="ws-aside">
                <section className="ws-panel">
                  <div className="ws-panel-head">
                    <h3 className="ws-panel-title">
                      <IconUser size={16} />
                      Patient
                    </h3>
                    {isOpen && (
                      <button
                        type="button"
                        className="ws-text-btn"
                        onClick={() => setEditingPatient((v) => !v)}
                      >
                        {editingPatient ? 'Cancel' : 'Edit'}
                      </button>
                    )}
                  </div>

                  {!editingPatient ? (
                    <>
                      {(clinical.visit.drug_allergies || clinical.visit.known_allergies) && (
                        <p className="ws-allergy-flag">
                          <IconAlert size={14} />
                          <span>
                            Allergies:{' '}
                            {[clinical.visit.drug_allergies && `Drug — ${clinical.visit.drug_allergies}`, clinical.visit.known_allergies]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </p>
                      )}
                      <dl className="ws-facts">
                      <div>
                        <dt><IconDroplet size={12} /> Blood group</dt>
                        <dd>{patient?.blood_group || '—'}</dd>
                      </div>
                      <div>
                        <dt>Date of birth</dt>
                        <dd>{formatDob(patient?.dob)}</dd>
                      </div>
                      <div>
                        <dt>Gender</dt>
                        <dd>{patient?.gender || '—'}</dd>
                      </div>
                      <div>
                        <dt><IconPhone size={12} /> Contact</dt>
                        <dd>{patient?.phone || '—'}</dd>
                      </div>
                      <div>
                        <dt>Emergency</dt>
                        <dd>{emergencyPhone(patient)}</dd>
                      </div>
                      {patient?.address && (
                        <div className="ws-facts-wide">
                          <dt>Address</dt>
                          <dd>{patient.address}</dd>
                        </div>
                      )}
                    </dl>
                    </>
                  ) : (
                    <form onSubmit={async (e) => {
                      const ok = await savePatient(e)
                      if (ok) setEditingPatient(false)
                    }} className="ws-form">
                      <div className="ws-fields-2">
                        <label>
                          First name
                          <input
                            required
                            value={patientForm.first_name}
                            onChange={(e) => setPatientForm({ ...patientForm, first_name: e.target.value })}
                          />
                        </label>
                        <label>
                          Last name
                          <input
                            value={patientForm.last_name}
                            onChange={(e) => setPatientForm({ ...patientForm, last_name: e.target.value })}
                          />
                        </label>
                        <label>
                          Contact
                          <input
                            required
                            value={patientForm.phone}
                            onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                          />
                        </label>
                        <label>
                          Emergency phone
                          <input
                            value={patientForm.emergency_contact_phone}
                            onChange={(e) =>
                              setPatientForm({ ...patientForm, emergency_contact_phone: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Gender
                          <select
                            value={patientForm.gender}
                            onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                          >
                            <option value="">—</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                        <label>
                          DOB
                          <input
                            type="date"
                            value={patientForm.dob}
                            onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                          />
                        </label>
                        <label>
                          Blood group
                          <select
                            value={patientForm.blood_group}
                            onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                          >
                            <option value="">—</option>
                            {BLOOD_GROUPS.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Emergency note
                          <input
                            value={patientForm.emergency_contact}
                            onChange={(e) =>
                              setPatientForm({ ...patientForm, emergency_contact: e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <label className="ws-field-full">
                        Address
                        <textarea
                          rows={2}
                          value={patientForm.address}
                          onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                        />
                      </label>
                      <button type="submit" className="ws-btn ws-btn-primary" disabled={savingPatient}>
                        {savingPatient ? 'Saving…' : 'Save details'}
                      </button>
                    </form>
                  )}
                </section>
              </aside>

              <div className="ws-main">
                <section className="ws-panel">
                  <div className="ws-panel-head">
                    <h3 className="ws-panel-title">
                      <IconStethoscope size={16} />
                      Clinical notes
                      <HintTip text="Complaint + diagnosis is enough for most visits. Open structured exam only when needed." />
                    </h3>
                    {isOpen ? null : <span className="ws-optional-tag">Read-only</span>}
                  </div>
                  {!isOpen ? (
                    <div className="ws-form">
                      <p className="ws-closed-banner">
                        This visit is closed. Showing the saved clinical record.
                      </p>
                      <ClinicalRecordSummary
                        data={clinical}
                        chiefComplaint={chiefComplaint}
                        clinicalNotes={clinicalNotes}
                        diagnosis={diagnosis}
                        visitDateLabel={
                          worksheet.opened_at
                            ? new Date(worksheet.opened_at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="ws-form">
                      <label className="ws-field-full">
                        Chief complaint
                        <textarea
                          rows={2}
                          value={chiefComplaint}
                          onChange={(e) => setChiefComplaint(e.target.value)}
                          placeholder="Reason for visit (e.g. Fever for 2 days)"
                        />
                      </label>
                      <label className="ws-field-full">
                        Free-text notes
                        <textarea
                          rows={3}
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          placeholder="Quick notes if you skip structured sections…"
                        />
                      </label>
                      <label className="ws-field-full">
                        Diagnosis
                        <input
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          placeholder="Primary diagnosis for this visit"
                        />
                      </label>

                      <button
                        type="button"
                        className="ws-text-btn"
                        onClick={() => setShowStructuredExam((v) => !v)}
                      >
                        {showStructuredExam ? 'Hide structured exam' : '+ Structured exam (vitals, systems…)'}
                      </button>

                      {showStructuredExam && (
                        <ClinicalRecordPanel
                          data={clinical}
                          onChange={setClinical}
                          specialization={worksheet.doctor?.specialization}
                          visitDateLabel={
                            worksheet.opened_at
                              ? new Date(worksheet.opened_at).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : undefined
                          }
                        />
                      )}

                      <button
                        type="button"
                        className="ws-btn ws-btn-primary"
                        disabled={savingNotes}
                        onClick={saveNotes}
                      >
                        {savingNotes ? 'Saving…' : 'Save clinical notes'}
                      </button>
                    </div>
                  )}
                </section>

                <div className="ws-stack">
                  <section className="ws-panel rx-builder">
                    <div className="ws-panel-head rx-builder-head">
                      <h3 className="ws-panel-title">
                        <IconPill size={16} />
                        Prescriptions
                        <HintTip text="Type a medicine name, arrow keys to move, Enter to add. Final submit also saves drafts." />
                      </h3>
                      {isOpen && (
                        <span className="rx-added-badge">
                          {rxItems.filter((i) => i.medicine_id).length} added
                        </span>
                      )}
                    </div>

                    {(worksheet.prescriptions || []).length > 0 && (
                      <ul className="rx-saved-list">
                        {worksheet.prescriptions?.map((rx) => (
                          <li key={rx.id} className="rx-saved-block">
                            <div className="rx-saved-meta">
                              <strong>Rx #{rx.id}</strong>
                              <span className="rx-status-pill">{rx.status}</span>
                            </div>
                            <ul className="rx-added-list">
                              {rx.items?.map((item, i) => (
                                <li key={item.id} className="rx-added-card">
                                  <span className="rx-idx">{i + 1}</span>
                                  <div className="rx-added-body">
                                    <strong>{item.medicine?.name}</strong>
                                    <div className="rx-tags">
                                      {item.dosage && <span>{item.dosage}</span>}
                                      <span>{doseFrequencyShort(item.frequency)}</span>
                                      {item.duration_days ? <span>{item.duration_days} days</span> : null}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}

                    {(worksheet.prescriptions || []).length === 0 && !isOpen && (
                      <p className="ws-empty">No prescriptions on this visit.</p>
                    )}

                    {isOpen && (
                      <form onSubmit={submitPrescription} className="rx-form">
                        {rxItems.length > 0 && (
                          <ul className="rx-added-list">
                            {rxItems.map((item, idx) => {
                              const med = selectedMeds[item.medicine_id]
                              const editing = editingRxIdx === idx
                              return (
                                <li key={`${item.medicine_id}-${idx}`} className="rx-added-card">
                                  <span className="rx-idx">{idx + 1}</span>
                                  <div className="rx-added-body">
                                    <button
                                      type="button"
                                      className="rx-added-name"
                                      onClick={() => setEditingRxIdx(editing ? null : idx)}
                                    >
                                      {med?.name || `Medicine #${item.medicine_id}`}
                                    </button>
                                    <div className="rx-tags">
                                      {item.dosage && <span>{item.dosage}</span>}
                                      <span>{doseFrequencyShort(item.frequency)}</span>
                                      <span>{item.duration_days} days</span>
                                      <span>Qty {item.quantity}</span>
                                    </div>
                                    {editing && (
                                      <div className="rx-edit-panel">
                                        <div className="ws-rx-meta-row">
                                          <label className="ws-rx-field">
                                            Dosage
                                            <input
                                              placeholder="e.g. 5 ml"
                                              value={item.dosage}
                                              onChange={(e) => {
                                                const copy = [...rxItems]
                                                copy[idx] = { ...copy[idx], dosage: e.target.value }
                                                setRxItems(copy)
                                              }}
                                            />
                                          </label>
                                          <label className="ws-rx-field">
                                            Days
                                            <select
                                              value={clampRxDays(item.duration_days)}
                                              onChange={(e) => {
                                                const days = clampRxDays(Number(e.target.value))
                                                const copy = [...rxItems]
                                                copy[idx] = {
                                                  ...copy[idx],
                                                  duration_days: days,
                                                  quantity: Math.max(
                                                    1,
                                                    suggestedQuantity(copy[idx].frequency, days),
                                                  ),
                                                }
                                                setRxItems(copy)
                                              }}
                                            >
                                              {RX_DURATION_DAYS.map((d) => (
                                                <option key={d} value={d}>
                                                  {d} {d === 1 ? 'day' : 'days'}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <label className="ws-rx-field">
                                            Qty
                                            <input
                                              type="number"
                                              min={1}
                                              value={item.quantity}
                                              onChange={(e) => {
                                                const copy = [...rxItems]
                                                copy[idx] = {
                                                  ...copy[idx],
                                                  quantity: Math.max(1, Number(e.target.value) || 1),
                                                }
                                                setRxItems(copy)
                                              }}
                                            />
                                          </label>
                                        </div>
                                        <DoseSchedulePicker
                                          value={item.frequency}
                                          onChange={(frequency) => {
                                            const copy = [...rxItems]
                                            copy[idx] = {
                                              ...copy[idx],
                                              frequency,
                                              quantity: Math.max(
                                                1,
                                                suggestedQuantity(frequency, copy[idx].duration_days),
                                              ),
                                            }
                                            setRxItems(copy)
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    className="rx-trash"
                                    aria-label="Remove medicine"
                                    onClick={() => {
                                      setRxItems(rxItems.filter((_, i) => i !== idx))
                                      setEditingRxIdx(null)
                                      if (item.medicine_id) {
                                        setSelectedMeds((prev) => {
                                          const next = { ...prev }
                                          delete next[item.medicine_id]
                                          return next
                                        })
                                      }
                                    }}
                                  >
                                    <IconTrash size={16} />
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        )}

                        <div className="rx-add-block">
                          <p className="rx-add-label">
                            Add medicine <span className="rx-enter-hint">· Enter to add</span>
                          </p>
                          <MedicineSearchSelect
                            clearOnSelect
                            placeholder="Search medicine… then press Enter"
                            onChange={(med) => {
                              if (!med) return
                              setSelectedMeds((prev) => ({ ...prev, [med.id]: med }))
                              const next: RxItem = { ...emptyRxItem(), medicine_id: med.id }
                              setRxItems((prev) => {
                                setEditingRxIdx(prev.length)
                                return [...prev, next]
                              })
                            }}
                          />
                        </div>

                        <label className="ws-field-full">
                          Notes
                          <textarea rows={2} value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} />
                        </label>
                        <button type="submit" className="ws-btn ws-btn-primary" disabled={savingRx}>
                          {savingRx ? 'Saving…' : 'Save prescription'}
                        </button>
                      </form>
                    )}
                  </section>

                  <section className="ws-panel">
                    <div className="ws-panel-head">
                      <h3 className="ws-panel-title">
                        <IconFlask size={16} />
                        Investigations / labs
                        <HintTip text="Select tests for this visit. Final submit will order any unsaved selections." />
                      </h3>
                    </div>

                    {(worksheet.lab_orders || []).length === 0 ? (
                      <p className="ws-empty">
                        {isOpen ? 'None on this visit yet.' : 'No lab orders on this visit.'}
                      </p>
                    ) : (
                      <ul className="ws-rx-list">
                        {worksheet.lab_orders?.map((order) => (
                          <li key={order.id}>
                            <div className="ws-rx-meta">
                              <strong>Order #{order.id}</strong>
                              <span>{order.status}</span>
                            </div>
                            <p className="ws-lab-names">
                              {order.items?.map((i) => i.lab_test?.name).filter(Boolean).join(', ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {isOpen && (
                      <form onSubmit={submitLab} className="ws-form ws-form-divider">
                        <div className="ws-lab-picker">
                          <div className="ws-lab-picker-head">
                            <span>Select tests</span>
                            <em>
                              {orderedTestIds.size
                                ? `${orderedTestIds.size} ordered`
                                : selectedTests.length
                                  ? `${selectedTests.length} selected`
                                  : 'Tap to select'}
                            </em>
                          </div>
                          <div className="ws-test-list" role="group" aria-label="Lab tests">
                            {labTests.map((t) => {
                              const ordered = orderedTestIds.has(t.id)
                              const on = ordered || selectedTests.includes(t.id)
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  className={`ws-test${on ? ' is-on' : ''}${ordered ? ' is-ordered' : ''}`}
                                  aria-pressed={on}
                                  disabled={ordered}
                                  title={ordered ? 'Already ordered on this visit' : undefined}
                                  onClick={() => {
                                    if (ordered) return
                                    setSelectedTests((prev) =>
                                      prev.includes(t.id)
                                        ? prev.filter((x) => x !== t.id)
                                        : [...prev, t.id]
                                    )
                                  }}
                                >
                                  <span className={`ws-test-check${on ? ' is-on' : ''}`} aria-hidden>
                                    {on ? <IconCheck size={12} /> : ''}
                                  </span>
                                  <span className="ws-test-copy">
                                    <strong>{t.name}</strong>
                                    <em>{ordered ? `${t.code} · Ordered` : t.code}</em>
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <label className="ws-field-full">
                          Notes
                          <textarea rows={2} value={labNotes} onChange={(e) => setLabNotes(e.target.value)} />
                        </label>
                        <button
                          type="submit"
                          className="ws-btn ws-btn-primary"
                          disabled={savingLab || selectedTests.length === 0}
                        >
                          {savingLab
                            ? 'Saving…'
                            : selectedTests.length
                              ? `Order ${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''}`
                              : 'Order tests'}
                        </button>
                      </form>
                    )}
                  </section>
                </div>

                {isOpen && worksheet.queue_token_id && (
                  <div className="ws-final-bar">
                    <div className="ws-final-bar-title">
                      <IconReceipt size={16} />
                      <strong>Finish visit</strong>
                      <HintTip text="Saves notes, prescription, and labs, then previews the pharmacy & lab bill before checkout." />
                    </div>
                    <button
                      type="button"
                      className="ws-btn ws-btn-checkout"
                      disabled={checkingOut || savingNotes || savingRx || savingLab}
                      onClick={() => void openFinalSubmit()}
                    >
                      {checkingOut || savingNotes || savingRx || savingLab
                        ? 'Saving…'
                        : 'Final submit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
