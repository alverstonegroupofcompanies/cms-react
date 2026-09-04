import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { cancelToken, checkInAppointment, getQueueDayBoard } from '../../api/client'
import { receptionistNav } from '../../config/navigation'

type BoardRow = {
  kind: 'token' | 'appointment' | string
  id: number | string
  token_id?: number | null
  display_code: string
  status: string
  board_status?: string
  is_late?: boolean
  end_of_line?: boolean
  can_check_in?: boolean
  queue_date: string
  slot_time?: string | null
  checked_out_at?: string | null
  completed_at?: string | null
  source?: string
  patient?: {
    id: number
    name: string
    patient_code: string
    phone: string
  } | null
  doctor?: {
    id: number
    name: string
    specialization?: string
  } | null
  appointment?: {
    id: number
    slot_time?: string | null
    status?: string
  } | null
}

function statusLabel(row: BoardRow) {
  const key = row.board_status || row.status
  if (key === 'late') return { text: 'Late', cls: 'rdm-pill rdm-pill-late' }
  if (key === 'pending_arrival') return { text: 'Pending', cls: 'rdm-pill rdm-pill-muted' }
  if (key === 'in_consultation') return { text: 'In consult', cls: 'rdm-pill rdm-pill-consult' }
  if (key === 'checked_out' || key === 'completed') return { text: 'Done', cls: 'rdm-pill rdm-pill-done' }
  if (key === 'checked_in' || key === 'waiting') return { text: 'Waiting', cls: 'rdm-pill rdm-pill-wait' }
  return { text: key.replace(/_/g, ' '), cls: 'rdm-pill rdm-pill-muted' }
}

function slotLabel(row: BoardRow) {
  return row.slot_time?.slice(0, 5) || 'Walk-in'
}

function checkoutLabel(row: BoardRow) {
  const raw = row.checked_out_at || row.completed_at
  if (!raw) return null
  return new Date(raw).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function ReceptionistDashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [rows, setRows] = useState<BoardRow[]>([])
  const [late, setLate] = useState<BoardRow[]>([])
  const [nextToken, setNextToken] = useState('AMC01')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [checkingIn, setCheckingIn] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getQueueDayBoard(date)
      .then(({ data }) => {
        setRows(data.rows || data.tokens || [])
        setLate(data.late || [])
        setNextToken(data.next_token || 'AMC01')
      })
      .catch(() => setError('Could not load day board'))
      .finally(() => setLoading(false))
  }, [date])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 5000)
    return () => window.clearInterval(timer)
  }, [load])

  const handleCheckIn = async (row: BoardRow) => {
    const appointmentId = row.appointment?.id
    if (!appointmentId) return
    setCheckingIn(appointmentId)
    setError('')
    try {
      const { data } = await checkInAppointment(appointmentId)
      const code = data.queue_token?.display_code || data.display_code || ''
      setMessage(
        data.queue_token?.end_of_line
          ? `Late check-in · new token ${code} (end of line)`
          : `Checked in · ${code}`
      )
      load()
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Check-in failed')
    }
    setCheckingIn(null)
  }

  const handleCancel = async (tokenId: number) => {
    if (!window.confirm('Cancel this token?')) return
    try {
      await cancelToken(tokenId)
      setMessage('Token cancelled')
      load()
    } catch {
      setError('Cancel failed')
    }
  }

  const waiting = rows.filter((t) =>
    ['waiting', 'checked_in', 'pending_arrival', 'late'].includes(t.board_status || t.status)
  ).length
  const inConsult = rows.filter((t) => (t.board_status || t.status) === 'in_consultation').length
  const completed = rows.filter((t) => ['completed', 'checked_out'].includes(t.board_status || t.status)).length

  return (
    <Layout title="Reception Desk" subtitle="Day board" nav={receptionistNav}>
      <div className="rdm">
        <div className="rdm-bar">
          <div className="rdm-bar-left">
            <input
              type="date"
              className="rdm-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Board date"
            />
            <button type="button" className="rdm-linkbtn" onClick={load}>
              Refresh
            </button>
            <span className="rdm-live">Live</span>
          </div>
          <div className="rdm-bar-right">
            <Link to="/receptionist/patients" className="rdm-btn rdm-btn-ghost">
              Walk-in
            </Link>
            <Link to="/receptionist/book" className="rdm-btn rdm-btn-solid">
              Book / token
            </Link>
          </div>
        </div>

        <div className="rdm-stats" aria-label="Summary">
          <span><b>{rows.length}</b> on board</span>
          <span className="rdm-dot" />
          <span><b>{waiting}</b> waiting</span>
          <span className="rdm-dot" />
          <span><b>{inConsult}</b> in consult</span>
          <span className="rdm-dot" />
          <span><b>{completed}</b> done</span>
          <span className="rdm-dot" />
          <span>Next <b>{nextToken}</b></span>
        </div>

        {late.length > 0 && (
          <div className="rdm-late" role="alert">
            <span className="rdm-late-label">Late</span>
            <div className="rdm-late-list">
              {late.map((l) => (
                <div key={String(l.id)} className="rdm-late-item">
                  <span>
                    {l.patient?.name} · {l.slot_time?.slice(0, 5) || '—'} · {l.doctor?.name || 'Doctor'}
                  </span>
                  {l.can_check_in && l.appointment?.id && (
                    <button
                      type="button"
                      className="rdm-btn rdm-btn-solid rdm-btn-sm"
                      disabled={checkingIn === l.appointment.id}
                      onClick={() => handleCheckIn(l)}
                    >
                      {checkingIn === l.appointment.id ? '…' : 'Check in'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {message && <div className="rdm-flash rdm-flash-ok">{message}</div>}
        {error && <div className="rdm-flash rdm-flash-err">{error}</div>}

        <div className="rdm-board">
          <table className="rdm-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th className="rdm-col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rdm-empty">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rdm-empty">No bookings for this date.</td>
                </tr>
              ) : (
                rows.map((t) => {
                  const status = statusLabel(t)
                  const out = checkoutLabel(t)
                  const tokenText =
                    t.display_code && t.display_code !== '—'
                      ? t.display_code
                      : '—'

                  return (
                    <tr key={String(t.id)} className={t.is_late ? 'rdm-row-late' : undefined}>
                      <td>
                        <span className="rdm-token">{tokenText}</span>
                        {t.end_of_line && <span className="rdm-meta">EOL</span>}
                      </td>
                      <td>
                        <span className="rdm-time">{slotLabel(t)}</span>
                      </td>
                      <td>
                        <div className="rdm-patient">
                          <span className="rdm-name">{t.patient?.name || '—'}</span>
                          <span className="rdm-meta">
                            {t.patient?.patient_code}
                            {t.patient?.phone ? ` · ${t.patient.phone}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="rdm-patient">
                          <span className="rdm-name">{t.doctor?.name || '—'}</span>
                          {t.doctor?.specialization && (
                            <span className="rdm-meta">{t.doctor.specialization}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={status.cls}>{status.text}</span>
                        {out && <span className="rdm-meta">Out {out}</span>}
                      </td>
                      <td className="rdm-col-action">
                        <div className="rdm-actions">
                          {t.can_check_in && t.appointment?.id && (
                            <button
                              type="button"
                              className="rdm-btn rdm-btn-solid rdm-btn-sm"
                              disabled={checkingIn === t.appointment.id}
                              onClick={() => handleCheckIn(t)}
                            >
                              {checkingIn === t.appointment.id ? '…' : 'Check in'}
                            </button>
                          )}
                          {t.token_id && t.status === 'waiting' && (
                            <button
                              type="button"
                              className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                              onClick={() => handleCancel(t.token_id!)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
