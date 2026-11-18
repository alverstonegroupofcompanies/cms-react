import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { formatInr } from '../../components/VisitBillPreview'
import PharmacyBillPrint from '../../components/PharmacyBillPrint'
import {
  dispensePrescription,
  getPrescriptions,
  getVisitBills,
  markVisitBillPharmacyDone,
  updateVisitBillPharmacyItems,
} from '../../api/client'
import { pharmacyNav } from '../../config/navigation'
import type { Prescription, VisitBill, VisitBillItem } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'

type Filter = 'pending' | 'done' | 'all'

type EditLine = {
  id: number
  name: string
  detail: string
  unit_price: number
  included: boolean
  purchased: boolean
  qty: number
  status: string
  prescription_id?: number | null
}

function toEditLines(bill: VisitBill): EditLine[] {
  return (bill.items || [])
    .filter((i) => i.section === 'pharmacy')
    .map((i: VisitBillItem) => ({
      id: i.id,
      name: i.name,
      detail: i.detail || '',
      unit_price: Number(i.unit_price) || 0,
      included: i.included !== false,
      purchased: Boolean(i.purchased),
      qty: Number(i.qty) || 0,
      status: i.status,
      prescription_id: i.prescription_id,
    }))
}

export function getBillTokenDisplay(b: VisitBill, rxById?: Record<number, Prescription>): string {
  let code = b.queue_token?.display_code || b.worksheet?.queue_token?.display_code
  if (!code && rxById && b.items) {
    for (const item of b.items) {
      if (item.prescription_id && rxById[item.prescription_id]?.queue_token?.display_code) {
        code = rxById[item.prescription_id].queue_token!.display_code
        break
      }
    }
  }
  if (code) return code

  const num = b.queue_token?.token_number ?? b.worksheet?.queue_token?.token_number
  if (num != null) {
    return String(num).padStart(2, '0')
  }

  return ''
}

export function parseTokenNum(b: VisitBill, rxById?: Record<number, Prescription>): number {
  const token = getBillTokenDisplay(b, rxById)
  if (!token) return 999999
  const match = token.match(/\d+/)
  return match ? parseInt(match[0], 10) : 999999
}

export default function PharmacyDashboard() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [bills, setBills] = useState<VisitBill[]>([])
  const [rxById, setRxById] = useState<Record<number, Prescription>>({})
  const [selected, setSelected] = useState<VisitBill | null>(null)
  const [lines, setLines] = useState<EditLine[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Sort patients strictly token-wise in ascending order (01, 02, 03...)
  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => {
      const numA = parseTokenNum(a, rxById)
      const numB = parseTokenNum(b, rxById)
      if (numA !== numB) return numA - numB
      return (a.id || 0) - (b.id || 0)
    })
  }, [bills, rxById])

  const displayedBills = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sortedBills
    return sortedBills.filter((b) => {
      const token = getBillTokenDisplay(b, rxById).toLowerCase()
      const name = (b.patient?.name || '').toLowerCase()
      const bill = (b.bill_code || '').toLowerCase()
      const ws = (b.worksheet?.worksheet_code || '').toLowerCase()
      const doc = (b.doctor?.name || '').toLowerCase()
      return (
        token.includes(q) ||
        name.includes(q) ||
        bill.includes(q) ||
        ws.includes(q) ||
        doc.includes(q)
      )
    })
  }, [sortedBills, search, rxById])

  const pendingCount = useMemo(() => bills.filter((b) => b.pharmacy_status === 'pending').length, [bills])
  const doneCount = useMemo(() => bills.filter((b) => b.pharmacy_status === 'done').length, [bills])
  const nextToken = useMemo(() => {
    const nextItem = sortedBills.find((b) => b.pharmacy_status === 'pending' && getBillTokenDisplay(b, rxById))
    return nextItem ? getBillTokenDisplay(nextItem, rxById) : '—'
  }, [sortedBills, rxById])

  const load = async (f: Filter = filter) => {
    const params =
      f === 'all'
        ? {}
        : f === 'done'
          ? { pharmacy_status: 'done' }
          : { pharmacy_status: 'pending' }
    const [{ data: billData }, { data: rxData }] = await Promise.all([
      getVisitBills(params),
      getPrescriptions({ status: 'pending' }),
    ])
    const all = Array.isArray(billData) ? billData : []
    const filtered =
      f === 'all'
        ? all.filter((b) => b.pharmacy_status !== 'none')
        : all.filter((b) => b.pharmacy_status === f)
    setBills(filtered)
    const rxList: Prescription[] = rxData?.data || rxData || []
    const map: Record<number, Prescription> = {}
    rxList.forEach((p) => {
      map[p.id] = p
    })
    setRxById(map)
  }

  useEffect(() => {
    load(filter).catch(() => setError('Could not load pharmacy bills'))
  }, [filter])

  const openBill = (bill: VisitBill) => {
    setSelected(bill)
    setLines(toEditLines(bill))
    setMessage('')
    setError('')
  }

  const pharmacyTotal = useMemo(
    () => lines.filter((l) => l.included).reduce((s, l) => s + l.qty * l.unit_price, 0),
    [lines]
  )

  const consultFee = Number(selected?.consultation_fee) || 0
  const labSub = Number(selected?.lab_subtotal) || 0
  const grand = consultFee + pharmacyTotal + labSub
  const canEdit = selected?.pharmacy_status === 'pending'

  const updateLine = (id: number, patch: Partial<EditLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const saveEdits = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const { data } = await updateVisitBillPharmacyItems(
        selected.id,
        lines.map((l) => ({
          id: l.id,
          included: l.included,
          qty: l.qty,
          purchased: l.purchased,
        }))
      )
      setSelected(data)
      setLines(toEditLines(data))
      setMessage('Bill updated')
      await load(filter)
    } catch {
      setError('Could not save bill changes')
    }
    setSaving(false)
  }

  const handOverMedicines = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const { data: saved } = await updateVisitBillPharmacyItems(
        selected.id,
        lines.map((l) => ({
          id: l.id,
          included: l.included,
          qty: l.qty,
          purchased: l.included ? true : false,
        }))
      )

      const ids: number[] = [
        ...new Set(
          ((saved.items || []) as VisitBillItem[])
            .filter((i) => i.section === 'pharmacy' && i.included !== false && i.prescription_id)
            .map((i) => Number(i.prescription_id))
            .filter((id) => Number.isFinite(id) && id > 0)
        ),
      ]
      for (const id of ids) {
        if (rxById[id]?.status === 'pending' || !rxById[id]) {
          try {
            await dispensePrescription(id)
          } catch {
            /* may already be handed over */
          }
        }
      }
      const { data: done } = await markVisitBillPharmacyDone(selected.id)
      setMessage(`Medicines handed over · ${done.bill_code}`)
      setSelected(null)
      setLines([])
      await load(filter)
    } catch {
      setError('Could not complete pharmacy work for this bill')
    }
    setSaving(false)
  }

  const printLines = useMemo(
    () =>
      lines.map((l) => ({
        id: l.id,
        name: l.name,
        detail: l.detail,
        qty: l.qty,
        unitPrice: l.unit_price,
        amount: l.included ? l.qty * l.unit_price : 0,
        included: l.included,
        purchased: l.purchased || l.status === 'done',
      })),
    [lines]
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <Layout
      title="Pharmacy"
      subtitle="Edit qty, uncheck unwanted items, mark purchased · print tax invoice"
      nav={pharmacyNav}
    >
      <div className="pharmacy-screen no-print">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {selected ? (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>
                {selected.bill_code} · {selected.patient?.name || 'Patient'}
              </h3>
              {getBillTokenDisplay(selected, rxById) ? (
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
                    boxShadow: '0 2px 6px rgba(15, 118, 110, 0.3)',
                  }}
                >
                  Token {getBillTokenDisplay(selected, rxById)}
                </span>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm btn-primary" onClick={handlePrint}>
                Print bill
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => { setSelected(null); setLines([]) }}
              >
                Back to list
              </button>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            {getBillTokenDisplay(selected, rxById) ? (
              <span style={{ color: '#0f766e', fontWeight: 700 }}>
                Token: {getBillTokenDisplay(selected, rxById)} ·{' '}
              </span>
            ) : null}
            Pharmacy <strong>{selected.pharmacy_status}</strong>
            {' · '}
            Lab <strong>{selected.lab_status}</strong>
            {selected.worksheet?.worksheet_code ? ` · ${selected.worksheet.worksheet_code}` : ''}
          </p>

          <div className="ws-bill-table-wrap">
            <table className="ws-bill-table pharm-edit-table">
              <thead>
                <tr>
                  <th>Buy</th>
                  <th>Medicine</th>
                  <th className="num">Qty</th>
                  <th className="num">Rate</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const amount = l.included ? l.qty * l.unit_price : 0
                  return (
                    <tr key={l.id} className={!l.included ? 'is-pending' : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={l.included}
                          disabled={!canEdit || saving}
                          onChange={(e) =>
                            updateLine(l.id, {
                              included: e.target.checked,
                              purchased: e.target.checked ? l.purchased : false,
                            })
                          }
                          title="Uncheck if patient does not want this medicine"
                        />
                      </td>
                      <td>
                        <strong>{l.name}</strong>
                        {l.detail ? <div className="muted">{l.detail}</div> : null}
                      </td>
                      <td className="num">
                        <input
                          type="number"
                          min={0}
                          max={9999}
                          className="pharm-qty-input"
                          value={l.qty}
                          disabled={!canEdit || !l.included || saving}
                          onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="num">{formatInr(l.unit_price)}</td>
                      <td className="num">{formatInr(amount)}</td>
                      <td>
                        {l.purchased || l.status === 'done' ? (
                          <span className="staff-doctor-today-badge is-on" style={{ position: 'static' }}>
                            Purchased
                          </span>
                        ) : !l.included ? (
                          <span className="staff-doctor-today-badge is-off" style={{ position: 'static' }}>
                            Skipped
                          </span>
                        ) : (
                          <span className="badge badge-pending">Not purchased</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ws-bill-totals">
            {consultFee > 0 && (
              <div className="ws-bill-total-row">
                <span>Consultation</span>
                <strong>{formatInr(consultFee)}</strong>
              </div>
            )}
            <div className="ws-bill-total-row">
              <span>Pharmacy (selected)</span>
              <strong>{formatInr(pharmacyTotal)}</strong>
            </div>
            {labSub > 0 && (
              <div className="ws-bill-total-row">
                <span>Lab</span>
                <strong>{formatInr(labSub)}</strong>
              </div>
            )}
            <div className="ws-bill-total-row is-grand">
              <span>Total</span>
              <strong>{formatInr(grand)}</strong>
            </div>
          </div>

          {canEdit ? (
            <div className="ws-bill-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={saveEdits}>
                {saving ? 'Saving…' : 'Save bill changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                Print bill
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handOverMedicines}>
                Hand over selected medicines
              </button>
            </div>
          ) : (
            <div className="ws-bill-actions" style={{ marginTop: '1rem' }}>
              <p className="muted" style={{ margin: 0, flex: 1, textAlign: 'left' }}>
                This pharmacy bill is already completed. You can still print the invoice.
              </p>
              <button type="button" className="btn btn-primary" onClick={handlePrint}>
                Print bill
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Waiting in Queue
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#92400e', marginTop: '0.15rem' }}>
                  {pendingCount}
                </div>
              </div>
              <span style={{ fontSize: '1.75rem' }}>⏳</span>
            </div>

            <div
              style={{
                background: '#f0fdfa',
                border: '1.5px solid #99f6e4',
                borderRadius: '12px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next Token
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#115e59', marginTop: '0.15rem' }}>
                  {nextToken}
                </div>
              </div>
              <span
                style={{
                  background: '#0f766e',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                }}
              >
                CALL NEXT
              </span>
            </div>

            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dispensed Today
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#166534', marginTop: '0.15rem' }}>
                  {doneCount}
                </div>
              </div>
              <span style={{ fontSize: '1.75rem' }}>✓</span>
            </div>
          </div>

          {/* Controls Bar: Filters, Search, View Switcher */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="pbh-ranges" role="group" aria-label="Bill filter" style={{ margin: 0 }}>
                {([
                  ['pending', `Queue (${pendingCount})`],
                  ['done', `Dispensed (${doneCount})`],
                  ['all', 'All'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pbh-range${filter === key ? ' pbh-range-on' : ''}`}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="pbh-ranges" role="group" aria-label="View mode" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`pbh-range${viewMode === 'list' ? ' pbh-range-on' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Token Wise Patient List"
                >
                  ☰ Token List
                </button>
                <button
                  type="button"
                  className={`pbh-range${viewMode === 'cards' ? ' pbh-range-on' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  ☵ Cards
                </button>
              </div>
            </div>

            <div style={{ minWidth: 260, flex: '1 1 260px', maxWidth: 360 }}>
              <input
                type="search"
                className="form-control"
                placeholder="Search token (e.g. 01), patient, bill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>

          {displayedBills.length === 0 ? (
            <p className="empty-state">
              {search ? `No patients matching "${search}".` : 'No patients in this queue filter.'}
            </p>
          ) : viewMode === 'list' ? (
            /* ================= TOKEN WISE PATIENT LIST (TABLE) ================= */
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 1rem', width: 110 }}>Token</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Patient</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Doctor & Specialty</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Prescribed Medicines</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: 130 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBills.map((b) => {
                    const pharmItems = (b.items || []).filter((i) => i.section === 'pharmacy')
                    const bought = pharmItems.filter((i) => i.purchased || i.status === 'done').length
                    const total = pharmItems.length
                    const token = getBillTokenDisplay(b, rxById)
                    const isDone = b.pharmacy_status === 'done' || (total > 0 && bought === total)
                    return (
                      <tr
                        key={b.id}
                        onClick={() => openBill(b)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          {token ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 48,
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                background: '#0f766e',
                                color: '#ffffff',
                                boxShadow: '0 2px 4px rgba(15, 118, 110, 0.25)',
                              }}
                            >
                              {token}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                background: '#f1f5f9',
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>
                              {b.patient?.name || 'Patient'}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {[b.patient?.patient_code, b.patient?.phone].filter(Boolean).join(' · ') || b.bill_code}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {b.doctor?.name ? displayDoctorName(b.doctor.name) : 'Doctor'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {b.doctor?.specialization || b.worksheet?.worksheet_code || 'General'}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                              {total === 0 ? '0 items' : `${total} medicine${total === 1 ? '' : 's'}`}
                            </span>
                            {total > 0 && (
                              <span
                                style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  color: bought === total ? '#059669' : '#d97706',
                                }}
                              >
                                {bought}/{total} dispensed
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          <strong style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a' }}>
                            {formatInr(b.pharmacy_subtotal)}
                          </strong>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                          {isDone ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              ● Dispensed
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                background: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                              }}
                            >
                              ● In Queue
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              openBill(b)
                            }}
                            style={{
                              padding: '0.4rem 0.85rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              borderRadius: '7px',
                            }}
                          >
                            {b.pharmacy_status === 'pending' ? 'Dispense' : 'View'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ================= TOKEN WISE CARDS VIEW ================= */
            <div className="staff-doctor-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {displayedBills.map((b) => {
                const pharmItems = (b.items || []).filter((i) => i.section === 'pharmacy')
                const bought = pharmItems.filter((i) => i.purchased || i.status === 'done').length
                const total = pharmItems.length
                const token = getBillTokenDisplay(b, rxById)
                return (
                  <article
                    key={b.id}
                    className="staff-doctor-card is-clickable"
                    onClick={() => openBill(b)}
                  >
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
                      <p className="staff-doctor-card-spec">{b.worksheet?.worksheet_code || b.bill_code}</p>
                      <p className="staff-doctor-card-meta">
                        {b.doctor?.name ? displayDoctorName(b.doctor.name) : 'Doctor'}
                      </p>
                      <p className="staff-doctor-card-meta">
                        Purchased {bought}/{total} · {formatInr(b.pharmacy_subtotal)}
                      </p>
                      <div className="staff-doctor-card-actions">
                        <button type="button" className="btn btn-sm btn-primary">
                          {b.pharmacy_status === 'pending' ? 'Dispense medicines' : 'Preview bill'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {selected && (
        <div className="pharmacy-print-only">
          <PharmacyBillPrint bill={selected} lines={printLines} />
        </div>
      )}
    </Layout>
  )
}
