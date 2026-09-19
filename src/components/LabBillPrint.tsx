import { formatInr } from './VisitBillPreview'
import { CLINIC_BILL_LETTERHEAD } from '../utils/clinicLetterhead'
import { labResultFieldsForCode } from '../utils/labResultFields'
import type { VisitBill } from '../api/types'
import { displayDoctorName } from '../utils/doctorName'

type LabPrintLine = {
  id: number
  name: string
  code?: string
  detail?: string
  qty: number
  unitPrice: number
  amount: number
  included: boolean
  results?: Record<string, string>
}

type Props = {
  bill: VisitBill
  lines: LabPrintLine[]
  mode?: 'invoice' | 'report'
}

function formatDate(iso?: string | null) {
  if (!iso) return new Date().toLocaleDateString('en-IN')
  return new Date(iso.includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ageFromDob(dob?: string | null) {
  if (!dob) return null
  const d = new Date(dob.includes('T') ? dob : dob + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}

export default function LabBillPrint({ bill, lines, mode = 'invoice' }: Props) {
  const c = CLINIC_BILL_LETTERHEAD
  const rows = lines.filter((l) => l.included && l.qty > 0)
  const taxable = rows.reduce((s, l) => s + l.amount, 0)
  const cgst = Math.round(taxable * 0.06 * 100) / 100
  const sgst = Math.round(taxable * 0.06 * 100) / 100
  const grand = Math.round((taxable + cgst + sgst) * 100) / 100
  const patient = bill.patient
  const doctor = bill.doctor
  const age = ageFromDob(patient?.dob)

  return (
    <div className="pharm-print lab-print" id="lab-bill-print">
      <header className="pharm-print-head">
        <div className="pharm-print-logo" aria-hidden>
          <span className="pharm-print-logo-mark">+</span>
          <div>
            <strong>{c.name}</strong>
            <em>Diagnostic Laboratory</em>
          </div>
        </div>
        <div className="pharm-print-clinic">
          {c.addressLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>Tel: {c.phone}</div>
          <div>GSTIN: {c.gstin} · Lab Lic: {c.labLicence}</div>
        </div>
      </header>

      <div className="pharm-print-title-row">
        <h1>{mode === 'report' ? 'Laboratory Report' : 'Lab Tax Invoice / Bill'}</h1>
        <div className="pharm-print-meta">
          <div><span>Bill No.</span><strong>{bill.bill_code}</strong></div>
          <div><span>Date</span><strong>{formatDate(bill.created_at)}</strong></div>
        </div>
      </div>

      <div className="pharm-print-parties">
        <div>
          <h2>Patient</h2>
          <strong>{patient?.name || 'Patient'}</strong>
          <div>{patient?.patient_code || '—'}</div>
          <div>
            {[patient?.gender, age != null ? `${age} yrs` : null, patient?.blood_group]
              .filter(Boolean)
              .join(' · ') || '—'}
          </div>
          {patient?.phone ? <div>Ph: {patient.phone}</div> : null}
        </div>
        <div>
          <h2>Referred by / Doctor</h2>
          <strong>{doctor?.name ? displayDoctorName(doctor.name) : 'Doctor'}</strong>
          {doctor?.specialization ? <div>{doctor.specialization}</div> : null}
          {bill.worksheet?.worksheet_code ? <div>WS: {bill.worksheet.worksheet_code}</div> : null}
          {bill.queue_token?.display_code ? <div>Token: {bill.queue_token.display_code}</div> : null}
        </div>
      </div>

      <table className="pharm-print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Investigation</th>
            <th>Code</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="pharm-print-empty">No lab tests on this bill.</td>
            </tr>
          ) : (
            rows.map((l, idx) => (
              <tr key={l.id}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{l.name}</strong>
                  {l.detail ? <div className="pharm-print-detail">{l.detail}</div> : null}
                </td>
                <td>{l.code || '—'}</td>
                <td className="num">{l.qty}</td>
                <td className="num">{formatInr(l.unitPrice)}</td>
                <td className="num">{formatInr(l.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {mode === 'report' && (
        <section className="lab-print-results">
          <h2>Result entry</h2>
          {rows.map((l) => {
            const fields = labResultFieldsForCode(l.code)
            const vals = l.results || {}
            return (
              <div key={`res-${l.id}`} className="lab-print-result-block">
                <h3>{l.name} {l.code ? `(${l.code})` : ''}</h3>
                <table className="pharm-print-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Result</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f) => (
                      <tr key={f.key}>
                        <td>{f.label}</td>
                        <td>{vals[f.key] || '—'}</td>
                        <td>{f.unit || vals.unit || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </section>
      )}

      {mode === 'invoice' && (
        <div className="pharm-print-totals">
          <div className="pharm-print-notes">
            <p>Dummy GST lab invoice — clinic software preview.</p>
            <p>CIN: {c.cin}</p>
            <p>Thank you for choosing {c.name} Laboratory.</p>
          </div>
          <table className="pharm-print-sum">
            <tbody>
              <tr>
                <td>Taxable value</td>
                <td className="num">{formatInr(taxable)}</td>
              </tr>
              <tr>
                <td>CGST @ 6%</td>
                <td className="num">{formatInr(cgst)}</td>
              </tr>
              <tr>
                <td>SGST @ 6%</td>
                <td className="num">{formatInr(sgst)}</td>
              </tr>
              <tr className="pharm-print-grand">
                <td>Grand total</td>
                <td className="num">{formatInr(grand)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <footer className="pharm-print-foot">
        <div>Lab technician / Pathologist</div>
        <div>Computer generated document</div>
      </footer>
    </div>
  )
}
