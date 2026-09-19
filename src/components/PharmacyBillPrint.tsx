import { formatInr } from './VisitBillPreview'
import { CLINIC_BILL_LETTERHEAD } from '../utils/clinicLetterhead'
import type { VisitBill } from '../api/types'
import { displayDoctorName } from '../utils/doctorName'

/** Dummy clinic letterhead for pharmacy print bills (replace with real GST later). */
export { CLINIC_BILL_LETTERHEAD } from '../utils/clinicLetterhead'

type PrintLine = {
  id: number
  name: string
  detail?: string
  hsn?: string
  qty: number
  unitPrice: number
  amount: number
  included: boolean
  purchased: boolean
}

type Props = {
  bill: VisitBill
  lines: PrintLine[]
  /** When true, only included lines with qty > 0 are printed */
  onlyIncluded?: boolean
}

function formatDate(iso?: string | null) {
  if (!iso) return new Date().toLocaleDateString('en-IN')
  return new Date(iso.includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function PharmacyBillPrint({ bill, lines, onlyIncluded = true }: Props) {
  const c = CLINIC_BILL_LETTERHEAD
  const rows = lines.filter((l) => (onlyIncluded ? l.included && l.qty > 0 : true))
  const taxable = rows.reduce((s, l) => s + l.amount, 0)
  const cgst = Math.round(taxable * 0.06 * 100) / 100
  const sgst = Math.round(taxable * 0.06 * 100) / 100
  const grand = Math.round((taxable + cgst + sgst) * 100) / 100
  const patient = bill.patient
  const doctor = bill.doctor

  return (
    <div className="pharm-print" id="pharmacy-bill-print">
      <header className="pharm-print-head">
        <div className="pharm-print-logo" aria-hidden>
          <span className="pharm-print-logo-mark">+</span>
          <div>
            <strong>{c.name}</strong>
            <em>{c.tagline}</em>
          </div>
        </div>
        <div className="pharm-print-clinic">
          {c.addressLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>Tel: {c.phone} · {c.email}</div>
          <div>GSTIN: {c.gstin} · DL: {c.drugLicence}</div>
        </div>
      </header>

      <div className="pharm-print-title-row">
        <h1>Tax Invoice / Pharmacy Bill</h1>
        <div className="pharm-print-meta">
          <div><span>Bill No.</span><strong>{bill.bill_code}</strong></div>
          <div><span>Date</span><strong>{formatDate(bill.created_at)}</strong></div>
        </div>
      </div>

      <div className="pharm-print-parties">
        <div>
          <h2>Bill to</h2>
          <strong>{patient?.name || 'Patient'}</strong>
          <div>{patient?.patient_code || '—'}</div>
          {patient?.phone ? <div>Ph: {patient.phone}</div> : null}
          {patient?.address ? <div>{patient.address}</div> : null}
        </div>
        <div>
          <h2>Prescribed by</h2>
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
            <th>Particulars</th>
            <th>HSN</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="pharm-print-empty">No pharmacy items on this bill.</td>
            </tr>
          ) : (
            rows.map((l, idx) => (
              <tr key={l.id}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{l.name}</strong>
                  {l.detail ? <div className="pharm-print-detail">{l.detail}</div> : null}
                </td>
                <td>{l.hsn || '3004'}</td>
                <td className="num">{l.qty}</td>
                <td className="num">{formatInr(l.unitPrice)}</td>
                <td className="num">{formatInr(l.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pharm-print-totals">
        <div className="pharm-print-notes">
          <p>Dummy GST demo invoice — for clinic software preview only.</p>
          <p>CIN: {c.cin}</p>
          <p>Thank you for choosing {c.name}.</p>
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

      <footer className="pharm-print-foot">
        <div>Authorized signatory</div>
        <div>Computer generated bill</div>
      </footer>
    </div>
  )
}
