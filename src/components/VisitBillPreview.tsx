import { useState } from 'react'
import type { LabTest, Medicine, Worksheet } from '../api/types'

export type BillLine = {
  key: string
  section: 'pharmacy' | 'lab'
  name: string
  detail: string
  qty: number
  unitPrice: number
  amount: number
  pending?: boolean
}

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatInr(n: number) {
  return inr(n)
}

type DraftRx = {
  medicine_id: number
  dosage: string
  frequency: string
  duration_days: number
  quantity: number
}

export function billLinesFromVisitBill(bill: {
  items?: Array<{
    id: number
    section: string
    name: string
    detail?: string | null
    qty: number
    unit_price: number
    amount: number
    status?: string
    included?: boolean
    purchased?: boolean
  }>
}): BillLine[] {
  return (bill.items || [])
    .filter((i) => i.section === 'pharmacy' || i.section === 'lab')
    .map((i) => ({
      key: `vb-${i.id}`,
      section: i.section as 'pharmacy' | 'lab',
      name: i.name,
      detail: [
        i.detail || '',
        i.included === false ? 'Skipped' : '',
        i.purchased || i.status === 'done' ? 'Purchased' : '',
      ]
        .filter(Boolean)
        .join(' · '),
      qty: i.qty,
      unitPrice: Number(i.unit_price) || 0,
      amount: i.included === false ? 0 : Number(i.amount) || 0,
      pending: i.included === false,
    }))
}

export function buildVisitBillLines(opts: {
  worksheet: Worksheet
  medicines: Medicine[]
  labTests: LabTest[]
  draftRx?: DraftRx[]
  draftTestIds?: number[]
}): BillLine[] {
  const medById = new Map(opts.medicines.map((m) => [m.id, m]))
  const testById = new Map(opts.labTests.map((t) => [t.id, t]))
  const lines: BillLine[] = []

  opts.worksheet.prescriptions?.forEach((rx) => {
    rx.items?.forEach((item) => {
      const medId = item.medicine_id ?? item.medicine?.id
      const med = (item.medicine as Medicine | undefined) || (medId != null ? medById.get(medId) : undefined)
      const qty = Number(item.quantity) || 0
      const unitPrice = Number(med?.unit_price) || 0
      lines.push({
        key: `rx-${rx.id}-${item.id}`,
        section: 'pharmacy',
        name: med?.name || (medId != null ? `Medicine #${medId}` : 'Medicine'),
        detail: [item.dosage, item.frequency, item.duration_days ? `${item.duration_days}d` : '']
          .filter(Boolean)
          .join(' · '),
        qty,
        unitPrice,
        amount: qty * unitPrice,
      })
    })
  })

  opts.worksheet.lab_orders?.forEach((order) => {
    order.items?.forEach((item) => {
      const testId = item.lab_test_id ?? item.lab_test?.id
      const test =
        (item.lab_test as LabTest | undefined) || (testId != null ? testById.get(testId) : undefined)
      const unitPrice = Number(test?.price) || 0
      lines.push({
        key: `lab-${order.id}-${item.id}`,
        section: 'lab',
        name: test?.name || 'Lab test',
        detail: test?.code || '',
        qty: 1,
        unitPrice,
        amount: unitPrice,
      })
    })
  })

  opts.draftRx?.forEach((item, idx) => {
    if (!item.medicine_id) return
    const med = medById.get(item.medicine_id)
    const qty = Number(item.quantity) || 0
    const unitPrice = Number(med?.unit_price) || 0
    lines.push({
      key: `draft-rx-${idx}-${item.medicine_id}`,
      section: 'pharmacy',
      name: med?.name || `Medicine #${item.medicine_id}`,
      detail: [item.dosage, item.frequency, item.duration_days ? `${item.duration_days}d` : '', 'Not saved']
        .filter(Boolean)
        .join(' · '),
      qty,
      unitPrice,
      amount: qty * unitPrice,
      pending: true,
    })
  })

  const orderedIds = new Set<number>()
  opts.worksheet.lab_orders?.forEach((order) => {
    order.items?.forEach((item) => {
      if (item.lab_test?.id) orderedIds.add(item.lab_test.id)
    })
  })
  opts.draftTestIds?.forEach((id) => {
    if (orderedIds.has(id)) return
    const test = testById.get(id)
    if (!test) return
    const unitPrice = Number(test.price) || 0
    lines.push({
      key: `draft-lab-${id}`,
      section: 'lab',
      name: test.name,
      detail: `${test.code} · Not saved`,
      qty: 1,
      unitPrice,
      amount: unitPrice,
      pending: true,
    })
  })

  return lines
}

type Props = {
  patientName: string
  worksheetCode: string
  lines: BillLine[]
  consultFee?: number | null
  confirming?: boolean
  readOnly?: boolean
  billCode?: string | null
  hidePrices?: boolean
  patientRoyalPoints?: number
  initialPointsRedeemed?: number
  onRedeemPoints?: (points: number) => Promise<void> | void
  onBack?: () => void
  onConfirm?: () => void
}

export default function VisitBillPreview({
  patientName,
  worksheetCode,
  lines,
  consultFee = 0,
  confirming,
  readOnly,
  billCode,
  hidePrices = false,
  patientRoyalPoints = 0,
  initialPointsRedeemed = 0,
  onRedeemPoints,
  onBack,
  onConfirm,
}: Props) {
  const pharmacy = lines.filter((l) => l.section === 'pharmacy')
  const labs = lines.filter((l) => l.section === 'lab')
  const fee = Number(consultFee) || 0
  const labTotal = labs.reduce((s, l) => s + l.amount, 0)
  const grand = fee + labTotal
  const hasPending = lines.some((l) => l.pending)

  const [pointsToRedeem, setPointsToRedeem] = useState<number>(initialPointsRedeemed || 0)

  const availablePoints = Math.max(0, Number(patientRoyalPoints) || 0)
  const maxPointsPossible = Math.min(availablePoints, Math.floor(grand * 4))
  const pointsDiscount = Math.round((pointsToRedeem / 4) * 100) / 100
  const netPayable = Math.max(0, grand - pointsDiscount)
  const estimatedEarnedPoints = Math.floor(netPayable / 100) * 4

  return (
    <div className="ws-bill" role="dialog" aria-labelledby="ws-bill-title">
      <div className="ws-bill-card">
        <header className="ws-bill-head">
          <div>
            <p className="ws-bill-kicker">
              {hidePrices
                ? 'Prescription & visit details'
                : readOnly
                  ? 'Visit bill'
                  : 'Visit summary · bill preview'}
              {billCode ? ` · ${billCode}` : ''}
            </p>
            <h2 id="ws-bill-title">{patientName}</h2>
            <p className="ws-bill-sub">{worksheetCode}</p>
          </div>
        </header>

        {!readOnly && hasPending && (
          <p className="ws-bill-warn">
            Draft lines below are included in this preview and will be saved on confirm.
          </p>
        )}

        <section className="ws-bill-section">
          <h3>Pharmacy</h3>
          {pharmacy.length === 0 ? (
            <p className="ws-bill-empty">No medicines on this visit.</p>
          ) : (
            <div className="ws-bill-table-wrap">
              <table className="ws-bill-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Detail</th>
                    <th className="num">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacy.map((l) => (
                    <tr key={l.key} className={l.pending ? 'is-pending' : undefined}>
                      <td>
                        <strong>{l.name}</strong>
                        {l.pending ? <span className="ws-bill-pending">Unsaved</span> : null}
                      </td>
                      <td>{l.detail || '—'}</td>
                      <td className="num">{l.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="ws-bill-note" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                * Pharmacy medicines are dispensed and billed separately at the pharmacy counter.
              </p>
            </div>
          )}
        </section>

        <section className="ws-bill-section">
          <h3>Lab tests</h3>
          {labs.length === 0 ? (
            <p className="ws-bill-empty">No lab tests on this visit.</p>
          ) : (
            <div className="ws-bill-table-wrap">
              <table className="ws-bill-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Code</th>
                    <th className="num">Qty</th>
                    {!hidePrices && <th className="num">Rate</th>}
                    {!hidePrices && <th className="num">Amount</th>}
                  </tr>
                </thead>
                <tbody>
                  {labs.map((l) => (
                    <tr key={l.key} className={l.pending ? 'is-pending' : undefined}>
                      <td>
                        <strong>{l.name}</strong>
                        {l.pending ? <span className="ws-bill-pending">Unsaved</span> : null}
                      </td>
                      <td>{l.detail || '—'}</td>
                      <td className="num">{l.qty}</td>
                      {!hidePrices && <td className="num">{inr(l.unitPrice)}</td>}
                      {!hidePrices && <td className="num">{inr(l.amount)}</td>}
                    </tr>
                  ))}
                </tbody>
                {!hidePrices && (
                  <tfoot>
                    <tr>
                      <td colSpan={4}>Lab subtotal</td>
                      <td className="num">{inr(labTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>

        {!hidePrices && (
          <section className="ws-bill-section ws-royal-points-section">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(253, 230, 138, 0.25) 100%)',
                border: '1px solid #fcd34d',
                borderRadius: '12px',
                padding: '1rem',
                margin: '0.75rem 0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                  <span>👑</span> Royal Points Rewards
                </div>
                <div style={{ fontSize: '0.78rem', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#78350f', fontWeight: 600 }}>
                  Earn 4 pts / ₹100 · Redeem 4 pts = ₹1
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#78350f', display: 'block' }}>Patient Available Balance</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e' }}>
                    {availablePoints} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>points</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', marginLeft: '0.6rem' }}>
                      (Worth {inr(Math.round(availablePoints / 4))})
                    </span>
                  </div>
                </div>

                {!readOnly && availablePoints > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#78350f', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      Redeem:
                      <input
                        type="number"
                        min={0}
                        max={maxPointsPossible}
                        step={4}
                        value={pointsToRedeem || ''}
                        placeholder="Points"
                        style={{
                          width: '90px',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #d97706',
                          background: '#fff',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value) || 0, maxPointsPossible))
                          setPointsToRedeem(val)
                          if (onRedeemPoints) void onRedeemPoints(val)
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                        (-{inr(pointsDiscount)})
                      </span>
                    </label>
                    <button
                      type="button"
                      className="ws-btn ws-btn-sm ws-btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                      onClick={() => {
                        setPointsToRedeem(maxPointsPossible)
                        if (onRedeemPoints) void onRedeemPoints(maxPointsPossible)
                      }}
                    >
                      Use Max ({maxPointsPossible} pts)
                    </button>
                    {pointsToRedeem > 0 && (
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-ghost"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                        onClick={() => {
                          setPointsToRedeem(0)
                          if (onRedeemPoints) void onRedeemPoints(0)
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                ) : pointsDiscount > 0 ? (
                  <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 700 }}>
                    Redeemed: {pointsToRedeem} pts (-{inr(pointsDiscount)})
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#92400e', fontStyle: 'italic' }}>
                    Will earn <strong>+{estimatedEarnedPoints} Royal Points</strong> on payment
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!hidePrices && (
          <div className="ws-bill-totals">
            {fee > 0 && (
              <div className="ws-bill-total-row">
                <span>Consultation</span>
                <strong>{inr(fee)}</strong>
              </div>
            )}
            <div className="ws-bill-total-row">
              <span>Lab</span>
              <strong>{inr(labTotal)}</strong>
            </div>
            <div className="ws-bill-total-row">
              <span>Subtotal</span>
              <strong>{inr(grand)}</strong>
            </div>
            {pointsDiscount > 0 && (
              <div className="ws-bill-total-row" style={{ color: '#059669', fontWeight: 700 }}>
                <span>👑 Royal Points Discount ({pointsToRedeem} pts)</span>
                <strong>-{inr(pointsDiscount)}</strong>
              </div>
            )}
            <div className="ws-bill-total-row is-grand">
              <span>Net Payable</span>
              <strong>{inr(netPayable)}</strong>
            </div>
            <div style={{ marginTop: '0.45rem', fontSize: '0.82rem', color: '#b45309', textAlign: 'right', fontWeight: 600 }}>
              ⭐ Patient earns <strong>+{estimatedEarnedPoints} Royal Points</strong> on payment (4 pts per ₹100 spent)
            </div>
          </div>
        )}

        {!readOnly && (
          <div className="ws-bill-actions">
            <button type="button" className="ws-btn ws-btn-ghost" onClick={onBack} disabled={confirming}>
              Back to worksheet
            </button>
            <button
              type="button"
              className="ws-btn ws-btn-checkout"
              onClick={onConfirm}
              disabled={confirming}
            >
              {confirming ? 'Submitting…' : 'Confirm final submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
