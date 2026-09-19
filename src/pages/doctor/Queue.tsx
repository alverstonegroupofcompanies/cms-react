import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  QueueRowActions,
  QueueWaitCell,
  formatQueueSlot,
  queueStatusLabel,
  type QueueRow,
} from '../../components/QueueRowActions'
import { callNext, checkInQueueToken, checkOutQueueToken } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useQueuePolling } from '../../hooks/useQueuePolling'
import { doctorNav } from '../../config/navigation'

export default function DoctorQueue() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date') || undefined
  const doctorId = user?.doctor?.id ?? null
  const { queue, refresh } = useQueuePolling(doctorId, 2500, dateParam)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [calling, setCalling] = useState(false)

  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(t)
  }, [message])

  const openWorksheet = (data: { id?: number; worksheet?: { id?: number } }) => {
    if (data.worksheet?.id) {
      navigate(`/doctor/worksheet/${data.worksheet.id}`)
      return true
    }
    if (data.id) {
      navigate(`/doctor/worksheet/new?token=${data.id}`)
      return true
    }
    return false
  }

  const handleCallNext = async () => {
    if (!doctorId) return
    setCalling(true)
    setError('')
    try {
      const { data } = await callNext(doctorId, dateParam)
      setMessage(`With you now · ${data.display_code} — ${data.patient.name}`)
      if (!openWorksheet(data)) await refresh()
    } catch {
      setError('No patients waiting in queue')
    }
    setCalling(false)
  }

  const handleCheckIn = async (row: QueueRow) => {
    setBusyId(row.id)
    setError('')
    try {
      const { data } = await checkInQueueToken(row.id)
      setMessage(`Consult started · ${row.display_code} — ${row.patient.name}`)
      if (!openWorksheet(data)) await refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not start consult')
    }
    setBusyId(null)
  }

  const handleCheckOut = async (row: QueueRow) => {
    if (!window.confirm(`Quick check out ${row.patient.name}? Prefer Final submit on the worksheet when possible.`)) {
      return
    }
    setBusyId(row.id)
    setError('')
    try {
      await checkOutQueueToken(row.id)
      setMessage(`Checked out · ${row.display_code} — ${row.patient.name}`)
      await refresh()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Check-out failed')
    }
    setBusyId(null)
  }

  const rows = queue as QueueRow[]
  const inConsultation = rows.find((t) => t.status === 'in_consultation')
  const waitingCount = rows.filter((t) => t.status === 'waiting').length

  const dayLabel = dateParam
    ? new Date(dateParam + 'T12:00:00').toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Today'

  return (
    <Layout
      title="Live queue"
      subtitle={`${dayLabel} · same flow as the day board — start consult opens the worksheet`}
      nav={doctorNav}
    >
      <div className="rdm doc-queue">
        <ol className="doc-flow" aria-label="Visit flow">
          <li className={waitingCount > 0 && !inConsultation ? 'is-active' : ''}>
            <span className="doc-flow-num">1</span>
            <span>
              <strong>Queue</strong>
              <em>{waitingCount} waiting</em>
            </span>
          </li>
          <li className={inConsultation ? 'is-active' : ''}>
            <span className="doc-flow-num">2</span>
            <span>
              <strong>Consult</strong>
              <em>Worksheet</em>
            </span>
          </li>
          <li>
            <span className="doc-flow-num">3</span>
            <span>
              <strong>Final submit</strong>
              <em>On worksheet</em>
            </span>
          </li>
        </ol>

        <div className="rdm-bar">
          <div className="rdm-bar-left">
            <span className="rdm-date-display">{dayLabel}</span>
            <span className="rdm-live">Live</span>
            <Link to="/doctor/dashboard" className="rdm-linkbtn">
              ← Day board
            </Link>
          </div>
          <div className="rdm-bar-right">
            <button
              type="button"
              className="rdm-btn rdm-btn-solid"
              disabled={calling || !doctorId || waitingCount === 0 || Boolean(inConsultation)}
              onClick={handleCallNext}
              title={inConsultation ? 'Finish current consult first' : 'Start next waiting patient'}
            >
              {calling ? 'Opening…' : 'See next patient'}
            </button>
          </div>
        </div>

        {message && <div className="rdm-flash rdm-flash-ok">{message}</div>}
        {error && <div className="rdm-flash rdm-flash-err">{error}</div>}

        {inConsultation && (
          <div className="doc-serving">
            <div className="doc-serving-copy">
              <p className="doc-serving-kicker">With you now</p>
              <h3>
                {inConsultation.display_code}
                <span>· {inConsultation.patient.name}</span>
              </h3>
              <p className="muted">Slot {formatQueueSlot(inConsultation.slot_time)}</p>
            </div>
            <div className="doc-serving-actions">
              <Link
                to={
                  inConsultation.worksheet_id
                    ? `/doctor/worksheet/${inConsultation.worksheet_id}`
                    : `/doctor/worksheet/new?token=${inConsultation.id}`
                }
                className="rdm-btn rdm-btn-solid"
              >
                Continue consult
                {inConsultation.worksheet_code ? ` · ${inConsultation.worksheet_code}` : ''}
              </Link>
              <button
                type="button"
                className="rdm-btn rdm-btn-ghost"
                disabled={busyId === inConsultation.id}
                onClick={() => handleCheckOut(inConsultation)}
              >
                Quick check out
              </button>
              {inConsultation.patient?.id && (
                <Link to={`/doctor/patients/${inConsultation.patient.id}`} className="rdm-btn rdm-btn-ghost">
                  History
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="rdm-board">
          <div className="rdm-board-head">
            <h3>Waiting list</h3>
            <p className="muted">
              <strong>Start consult</strong> opens the worksheet. Finish with <strong>Final submit</strong> there.
            </p>
          </div>
          <table className="rdm-table">
            <thead>
              <tr>
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
                  <td colSpan={6} className="rdm-empty">
                    No patients in queue.
                  </td>
                </tr>
              ) : (
                rows.map((t) => (
                  <tr key={t.id} className={t.status === 'in_consultation' ? 'rdm-row-consult' : undefined}>
                    <td>
                      <span className="rdm-token">{t.display_code}</span>
                    </td>
                    <td>
                      <span className="rdm-name">{t.patient.name}</span>
                    </td>
                    <td>
                      <span className="rdm-time">{formatQueueSlot(t.slot_time)}</span>
                    </td>
                    <td>
                      <QueueWaitCell row={t} />
                    </td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{queueStatusLabel(t.status)}</span>
                    </td>
                    <td className="rdm-col-action">
                      <div className="rdm-actions">
                        <QueueRowActions
                          row={t}
                          busyId={busyId}
                          onCheckIn={handleCheckIn}
                          onCheckOut={handleCheckOut}
                          checkInLabel="Start consult"
                          checkOutLabel="Quick out"
                          buttonClassName="rdm-btn rdm-btn-sm"
                          primaryClassName="rdm-btn-solid"
                          secondaryClassName="rdm-btn-ghost"
                        />
                        {(t.worksheet_id || ['in_consultation', 'completed'].includes(t.status)) && (
                          <Link
                            to={
                              t.worksheet_id
                                ? `/doctor/worksheet/${t.worksheet_id}`
                                : `/doctor/worksheet/new?token=${t.id}`
                            }
                            className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                          >
                            {t.status === 'in_consultation' ? 'Continue' : 'Worksheet'}
                          </Link>
                        )}
                        {t.patient?.id && (
                          <Link to={`/doctor/patients/${t.patient.id}`} className="rdm-btn rdm-btn-ghost rdm-btn-sm">
                            History
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
