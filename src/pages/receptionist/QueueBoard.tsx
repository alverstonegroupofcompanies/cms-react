import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import {
  QueueRowActions,
  QueueWaitCell,
  formatQueueSlot,
  queueStatusLabel,
  type QueueRow,
} from '../../components/QueueRowActions'
import { IconQueue, IconStethoscope } from '../../components/Icons'
import { cancelToken, checkInQueueToken, checkOutQueueToken, getDoctors } from '../../api/client'
import { useQueuePolling } from '../../hooks/useQueuePolling'
import { receptionistNav } from '../../config/navigation'
import type { Doctor } from '../../api/types'

export default function QueueBoard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [flash, setFlash] = useState('')
  const { queue, refresh } = useQueuePolling(doctorId, 2500)

  useEffect(() => {
    getDoctors().then(({ data }) => {
      setDoctors(data)
      if (data.length) setDoctorId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(''), 3500)
    return () => window.clearTimeout(t)
  }, [flash])

  const handleCheckIn = async (row: QueueRow) => {
    setBusyId(row.id)
    try {
      await checkInQueueToken(row.id)
      setFlash(`Checked in · ${row.display_code} — ${row.patient.name}`)
      await refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setFlash(msg || 'Check-in failed')
    }
    setBusyId(null)
  }

  const handleCheckOut = async (row: QueueRow) => {
    setBusyId(row.id)
    try {
      await checkOutQueueToken(row.id)
      setFlash(`Checked out · ${row.display_code} — ${row.patient.name}`)
      await refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setFlash(msg || 'Check-out failed')
    }
    setBusyId(null)
  }

  const handleCancel = async (row: QueueRow) => {
    if (!window.confirm(`Cancel token ${row.display_code}?`)) return
    setBusyId(row.id)
    try {
      await cancelToken(row.id)
      setFlash(`Cancelled · ${row.display_code}`)
      await refresh()
    } catch {
      setFlash('Cancel failed')
    }
    setBusyId(null)
  }

  const rows = queue as QueueRow[]
  const waiting = rows.filter((r) => r.status === 'waiting' || r.status === 'checked_in').length
  const inConsult = rows.filter((r) => r.status === 'in_consultation').length

  return (
    <Layout title="Queue Board" subtitle="Live patient queue — auto refreshes" nav={receptionistNav}>
      <div className="rdm">
        {flash && <div className="rdm-flash rdm-flash-ok">{flash}</div>}

        <div className="rdm-controls">
          <div className="rdm-bar">
            <div className="rdm-bar-left">
              <label className="rdm-date-wrap">
                <span className="rdm-date-label">Doctor</span>
                <select
                  className="rdm-date"
                  value={doctorId ?? ''}
                  onChange={(e) => setDoctorId(Number(e.target.value))}
                  aria-label="Select doctor"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <span className="rdm-live">
                <span className="rdm-live-dot" aria-hidden /> Live
              </span>
            </div>
          </div>
        </div>

        <div className="rdm-kpi" aria-label="Queue summary">
          <div className="rdm-kpi-item">
            <span className="rdm-kpi-label">In queue</span>
            <b>{rows.length}</b>
          </div>
          <div className={`rdm-kpi-item${waiting > 0 ? ' is-emphasis' : ''}`}>
            <span className="rdm-kpi-label">Waiting</span>
            <b>{waiting}</b>
          </div>
          <div className={`rdm-kpi-item${inConsult > 0 ? ' is-consult' : ''}`}>
            <span className="rdm-kpi-label">With doctor</span>
            <b>{inConsult}</b>
          </div>
        </div>

        <section className="rdm-section rdm-section-queue">
          <div className="rdm-panel">
            <div className="rdm-section-head">
              <div className="rdm-section-title">
                <span className="rdm-section-ico" aria-hidden>
                  {inConsult > 0 ? <IconStethoscope size={16} /> : <IconQueue size={16} />}
                </span>
                <div>
                  <h3>Live queue</h3>
                  <p>Waiting and in consultation</p>
                </div>
              </div>
              <span className="rdm-section-count">{rows.length}</span>
            </div>
            <div className="rdm-table-wrap">
              <table className="rdm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Slot</th>
                    <th>Waiting</th>
                    <th>Status</th>
                    <th className="rdm-col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="rdm-empty">
                        No patients in queue today.
                      </td>
                    </tr>
                  ) : (
                    rows.map((t) => {
                      const status = queueStatusLabel(t.status)
                      const pill =
                        t.status === 'in_consultation'
                          ? 'rdm-pill rdm-pill-consult'
                          : t.status === 'waiting' || t.status === 'checked_in'
                            ? 'rdm-pill rdm-pill-wait'
                            : 'rdm-pill rdm-pill-muted'
                      return (
                        <tr
                          key={t.id}
                          className={t.status === 'in_consultation' ? 'rdm-row-consult' : undefined}
                        >
                          <td>{t.position}</td>
                          <td>
                            <span className="rdm-token">{t.display_code}</span>
                          </td>
                          <td>
                            <div className="rdm-patient">
                              <span className="rdm-name">{t.patient.name}</span>
                              <span className="rdm-meta">{t.patient.patient_code}</span>
                            </div>
                          </td>
                          <td>
                            <span className="rdm-time">{formatQueueSlot(t.slot_time)}</span>
                          </td>
                          <td>
                            <QueueWaitCell row={t} />
                          </td>
                          <td>
                            <span className={pill}>{status}</span>
                          </td>
                          <td className="rdm-col-action">
                            <QueueRowActions
                              row={t}
                              busyId={busyId}
                              onCheckIn={handleCheckIn}
                              onCheckOut={handleCheckOut}
                              onCancel={handleCancel}
                              showCancel
                              allowCheckOut={false}
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
