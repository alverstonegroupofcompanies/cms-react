import { useState, useEffect } from 'react'
import type { Doctor, Patient } from '../api/types'
import { getPatients, createPatient, joinQueue } from '../api/client'
import type { TokenData } from './PrintableTokenSlip'
import { IconPrinter, IconPlus, IconCheck } from './Icons'

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultDate?: string
  doctors: Doctor[]
  onTokenIssued: (tokenData: TokenData, message: string) => void
}

export default function IssueTokenModal({
  isOpen,
  onClose,
  defaultDate,
  doctors,
  onTokenIssued,
}: Props) {
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // New patient fields
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('male')

  // Consultation fields
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(doctors[0]?.id || 0)
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10))

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Sync default date and doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate || new Date().toISOString().slice(0, 10))
      if (doctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(doctors[0].id)
      }
      setError('')
      // Initial search load
      loadPatients('')
    }
  }, [isOpen, defaultDate, doctors])

  // Search existing patients
  const loadPatients = async (query: string) => {
    try {
      setSearching(true)
      const res = await getPatients(query)
      setPatients(res.data || [])
    } catch {
      setPatients([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (!isOpen || tab !== 'existing') return
    const timer = setTimeout(() => {
      loadPatients(search)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, isOpen, tab])

  if (!isOpen) return null

  const handleIssue = async () => {
    setError('')
    let patientToUse = selectedPatient

    // If new patient tab, create patient first
    if (tab === 'new') {
      if (!newName.trim()) {
        setError('Please enter patient name')
        return
      }
      if (!newPhone.trim() || newPhone.trim().length < 8) {
        setError('Please enter a valid phone number (at least 8 digits)')
        return
      }

      try {
        setSubmitting(true)
        const nameParts = newName.trim().split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || undefined

        const res = await createPatient({
          first_name: firstName,
          last_name: lastName,
          name: newName.trim(),
          phone: newPhone.trim(),
          gender: newGender,
        })
        patientToUse = res.data
        setSelectedPatient(patientToUse)
      } catch (err: unknown) {
        setSubmitting(false)
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg || 'Failed to register walk-in patient')
        return
      }
    }

    if (!patientToUse) {
      setError('Please select or register a patient')
      return
    }

    if (!selectedDoctorId) {
      setError('Please select a doctor')
      return
    }

    const doctor = doctors.find((d) => d.id === selectedDoctorId)
    if (!doctor) {
      setError('Selected doctor not found')
      return
    }

    try {
      setSubmitting(true)
      const queueRes = await joinQueue(patientToUse.id, selectedDoctorId, date)
      const token = queueRes.data?.queue_token

      const code =
        token?.display_code && token.display_code !== '—'
          ? token.display_code
          : token?.token_number
            ? `AMC${String(token.token_number).padStart(2, '0')}`
            : 'AMC01'

      const tokenData: TokenData = {
        type: 'consultation',
        tokenCode: code,
        tokenNumber: token?.token_number,
        patientName: patientToUse.name,
        patientCode: patientToUse.patient_code,
        patientPhone: patientToUse.phone,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        roomOrCounter: doctor.room_number ? `Room ${doctor.room_number}` : 'OPD Consultation Suite',
        appointmentDate: date,
        slotTime: token?.slot_time || 'Walk-in Queue',
        status: token?.status || 'waiting',
      }

      onTokenIssued(tokenData, `Token ${code} successfully issued for ${patientToUse.name}`)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to issue token. The doctor might not be on duty today.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="token-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="token-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, background: '#ffffff', color: '#0f172a' }}
      >
        <header
          className="token-modal-head"
          style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
        >
          <div className="token-modal-title">
            <span
              className="token-modal-badge"
              style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
              }}
            >
              Reception Desk
            </span>
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem' }}>Issue Consultation Token</h3>
          </div>
          <button
            type="button"
            className="token-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ color: '#64748b', borderColor: '#e2e8f0' }}
          >
            &times;
          </button>
        </header>

        <div className="token-modal-body" style={{ background: '#ffffff', padding: '1.5rem', display: 'block', maxHeight: '78vh' }}>
          {/* Patient Tabs: Existing vs New Walk-in */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setTab('existing')
                setError('')
              }}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                border: tab === 'existing' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                background: tab === 'existing' ? '#ecfdf5' : '#f8fafc',
                color: tab === 'existing' ? '#047857' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Select Existing Patient
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('new')
                setError('')
              }}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                border: tab === 'new' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                background: tab === 'new' ? '#ecfdf5' : '#f8fafc',
                color: tab === 'new' ? '#047857' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <IconPlus size={14} />
              <span>New Walk-in Patient</span>
            </button>
          </div>

          {/* TAB 1: Existing Patient Search */}
          {tab === 'existing' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Search Patient (Name, Mobile, or Patient Code)
              </label>
              <input
                type="text"
                placeholder="Type name, 10-digit mobile, or AMC code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />

              {/* Selected Patient Banner */}
              {selectedPatient && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#15803d', display: 'flex' }}><IconCheck size={16} /></span>
                    <div>
                      <strong style={{ color: '#15803d', fontSize: '0.92rem' }}>{selectedPatient.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#4b5563' }}>
                        {selectedPatient.patient_code} · {selectedPatient.phone}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#dc2626',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Search Results List */}
              {!selectedPatient && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc',
                  }}
                >
                  {searching ? (
                    <p style={{ padding: '0.75rem', margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Searching patients…</p>
                  ) : patients.length === 0 ? (
                    <p style={{ padding: '0.75rem', margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                      No patients found. Switch to "New Walk-in Patient" to register.
                    </p>
                  ) : (
                    patients.slice(0, 10).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderBottom: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          background: '#ffffff',
                        }}
                      >
                        <div>
                          <strong>{p.name}</strong>
                          <span style={{ color: '#64748b', marginLeft: '0.4rem', fontSize: '0.78rem' }}>
                            {p.patient_code}
                          </span>
                        </div>
                        <span style={{ color: '#059669', fontWeight: 600 }}>{p.phone}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Quick Register New Walk-in Patient */}
          {tab === 'new' && (
            <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'male' | 'female' | 'other')}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Assign Specialist Doctor *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
                background: '#ffffff',
              }}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} {d.room_number ? `(Room ${d.room_number})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Consultation Queue Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <footer
          className="token-modal-foot"
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 650,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleIssue}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.35rem',
              borderRadius: '8px',
              border: 'none',
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
            }}
          >
            <IconPrinter size={15} />
            <span>{submitting ? 'Issuing Token…' : 'Issue & Print Token'}</span>
          </button>
        </footer>
      </div>
    </div>
  )
}
