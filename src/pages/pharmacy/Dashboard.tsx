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

export default function PharmacyDashboard() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [bills, setBills] = useState<VisitBill[]>([])
  const [rxById, setRxById] = useState<Record<number, Prescription>>({})
  const [selected, setSelected] = useState<VisitBill | null>(null)
  const [lines, setLines] = useState<EditLine[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
            <h3>
              {selected.bill_code} · {selected.patient?.name || 'Patient'}
            </h3>
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
          <div className="pbh-ranges" role="group" aria-label="Bill filter" style={{ marginBottom: '1rem' }}>
            {([
              ['pending', 'Pending'],
              ['done', 'Done'],
              ['all', 'All bills'],
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
          {bills.length === 0 ? (
            <p className="empty-state">No bills in this filter.</p>
          ) : (
            <div className="staff-doctor-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {bills.map((b) => {
                const pharmItems = (b.items || []).filter((i) => i.section === 'pharmacy')
                const bought = pharmItems.filter((i) => i.purchased || i.status === 'done').length
                const total = pharmItems.length
                return (
                  <article
                    key={b.id}
                    className="staff-doctor-card is-clickable"
                    onClick={() => openBill(b)}
                  >
                    <div className="staff-doctor-card-body" style={{ paddingTop: '1rem' }}>
                      <h4 className="staff-doctor-card-name">{b.patient?.name || 'Patient'}</h4>
                      <p className="staff-doctor-card-spec">{b.bill_code}</p>
                      <p className="staff-doctor-card-meta">
                        {b.doctor?.name ? displayDoctorName(b.doctor.name) : 'Doctor'}
                      </p>
                      <p className="staff-doctor-card-meta">
                        Purchased {bought}/{total} · {formatInr(b.pharmacy_subtotal)}
                      </p>
                      <div className="staff-doctor-card-actions">
                        <button type="button" className="btn btn-sm btn-primary">
                          {b.pharmacy_status === 'pending' ? 'Edit / preview bill' : 'Preview bill'}
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
