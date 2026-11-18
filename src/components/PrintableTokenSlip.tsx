import { CLINIC } from '../config/clinic'
import { displayDoctorName } from '../utils/doctorName'
import '../token-slip.css'

export type TokenData = {
  type: 'consultation' | 'prescription'
  tokenCode: string
  tokenNumber?: number | string | null
  issuedAt?: string
  // Patient details
  patientName?: string | null
  patientCode?: string | null
  patientPhone?: string | null
  patientGender?: string | null
  patientAge?: string | number | null
  // Doctor & Department
  doctorName?: string | null
  specialization?: string | null
  departmentName?: string | null
  clinicName?: string | null
  roomOrCounter?: string | null
  // Appointment specific
  appointmentDate?: string | null
  slotTime?: string | null
  status?: string | null
  // Prescription specific
  prescriptionId?: number | null
  notes?: string | null
  items?: Array<{
    name: string
    dosage?: string
    frequency?: string
    duration_days?: number
    quantity?: number
  }>
}

interface Props {
  token: TokenData
  /** If true, renders without outer box for direct printing */
  printMode?: boolean
}

export default function PrintableTokenSlip({ token, printMode = false }: Props) {
  const nowTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const nowDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  let tokenCode = token.tokenCode || `#${token.tokenNumber || '01'}`
  if (tokenCode.startsWith('RX-')) {
    tokenCode = '01'
  }
  const department = token.departmentName || token.specialization || 'General Consultation'
  const doctorName = token.doctorName ? displayDoctorName(token.doctorName) : 'Attending Consultant'

  return (
    <div className={`token-slip-container${printMode ? ' is-print-mode' : ''}`} id="token-slip-print">
      {/* Hospital Name */}
      <header className="token-slip-header" style={{ marginBottom: '0.65rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 850, margin: 0, letterSpacing: '0.04em', color: '#0f172a' }}>
          {CLINIC.name.toUpperCase()}
        </h2>
      </header>

      <div className="token-slip-divider-dashed" />

      {/* Token No */}
      <div className="token-slip-hero-box" style={{ padding: '0.85rem 0.5rem', margin: '0.75rem 0' }}>
        <div className="token-slip-eyebrow" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
          TOKEN NO
        </div>
        <div className="token-slip-big-number" style={{ fontSize: '2.75rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
          {tokenCode}
        </div>
        {token.roomOrCounter && (
          <div className="token-slip-location" style={{ marginTop: '0.25rem', fontSize: '0.82rem' }}>
            {token.roomOrCounter}
          </div>
        )}
      </div>

      {/* Department & Doctor Name */}
      <div className="token-slip-meta-grid" style={{ gap: '0.55rem', marginBottom: '0.75rem' }}>
        <div className="token-slip-meta-row">
          <span className="meta-lbl">Department:</span>
          <span className="meta-val meta-val-highlight" style={{ fontWeight: 700 }}>
            {department}
          </span>
        </div>

        <div className="token-slip-meta-row">
          <span className="meta-lbl">Doctor Name:</span>
          <span className="meta-val" style={{ fontWeight: 700 }}>
            {doctorName}
          </span>
        </div>
      </div>

      <div className="token-slip-divider-dashed" />

      {/* Date & Time printed at bottom */}
      <footer style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.74rem', color: '#64748b' }}>
        Printed: {nowDate} &bull; {nowTime}
      </footer>
    </div>
  )
}
