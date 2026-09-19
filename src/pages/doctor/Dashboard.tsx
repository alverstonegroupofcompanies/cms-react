import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  callNext,
  checkInAppointment,
  checkInQueueToken,
  checkOutAppointment,
  checkOutQueueToken,
  getQueueDayBoard,
} from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { doctorNav } from '../../config/navigation'
import VisitSourceBadge from '../../components/VisitSourceBadge'

type BoardRow = {
  kind: 'token' | 'appointment' | string
  id: number | string
  token_id?: number | null
  display_code: string
  worksheet_id?: number | null
  worksheet_code?: string | null
  status: string
  board_status?: string
  is_late?: boolean
  end_of_line?: boolean
  can_check_in?: boolean
  can_checkout?: boolean
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
  if (
    (key === 'in_consultation' || row.status === 'in_consultation') &&
    row.can_checkout
  ) {
    return { text: 'Ready for checkout', cls: 'rdm-pill rdm-pill-checkout' }
  }
  if (key === 'in_consultation') return { text: 'In consult', cls: 'rdm-pill rdm-pill-consult' }
  if (key === 'checked_out' || key === 'completed') return { text: 'Done', cls: 'rdm-pill rdm-pill-done' }
  if (key === 'checked_in' || key === 'waiting') return { text: 'Waiting', cls: 'rdm-pill rdm-pill-wait' }
  return { text: key.replace(/_/g, ' '), cls: 'rdm-pill rdm-pill-muted' }
}

/** Waiting in queue → Start consult; pending arrival → Add to queue. */
function boardRowActions(row: BoardRow) {
  const hasToken = Boolean(row.token_id)
  const hasAppt = Boolean(row.appointment?.id)
  const withDoctor = row.status === 'in_consultation' || row.board_status === 'in_consultation'
  const inQueue = hasToken && row.status === 'waiting'
  const pendingArrival =
    !hasToken &&
    hasAppt &&
    (row.can_check_in ||
      ['pending_arrival', 'late', 'booked', 'no_show'].includes(row.board_status || row.status))

  return {
    showCheckIn: inQueue || pendingArrival,
    showCheckOut: withDoctor,
    checkInLabel: inQueue
      ? 'Start consult'
      : row.is_late || row.board_status === 'late'
        ? 'New token'
        : 'Add to queue',
    checkInTitle: inQueue
      ? 'Open this patient in your worksheet'
      : row.is_late
        ? 'Issue new token at end of line'
        : 'Mark arrived and put them in the waiting queue',
    actionKey: (row.token_id || row.appointment?.id) as number | undefined,
  }
}

function slotLabel(row: BoardRow) {
  return row.slot_time?.slice(0, 5) || 'Walk-in'
}

function formatBoardDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function rowKey(row: BoardRow) {
  return String(row.appointment?.id ?? row.token_id ?? row.id)
}

function isWaitingStatus(row: BoardRow) {
  const key = row.board_status || row.status
  return key === 'waiting' || key === 'checked_in'
}

function isPendingStatus(row: BoardRow) {
  const key = row.board_status || row.status
  return key === 'pending_arrival' || key === 'late' || key === 'booked' || key === 'no_show'
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const doctorId = user?.doctor?.id ?? null
  const today = new Date().toISOString().split('T')[0]
  const dateFromUrl = searchParams.get('date') || undefined
  const [date, setDate] = useState(dateFromUrl || today)
  const [rows, setRows] = useState<BoardRow[]>([])
  const [late, setLate] = useState<BoardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [checkingIn, setCheckingIn] = useState<number | null>(null)
  const [checkingOut, setCheckingOut] = useState<string | number | null>(null)
  const [callingNext, setCallingNext] = useState(false)
  const prevStatusRef = useRef<Map<string, string>>(new Map())
  const selfCheckInRef = useRef<Set<number>>(new Set())
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (dateFromUrl) setDate(dateFromUrl)
  }, [dateFromUrl])

  const load = useCallback(() => {
    if (!doctorId) {
      setLoading(false)
      setError('Doctor profile not found')
      return Promise.resolve()
    }
    setLoading(true)
    setError('')
    return getQueueDayBoard(date, doctorId)
      .then(({ data }) => {
        const nextRows: BoardRow[] = data.rows || data.tokens || []
        const nextLate: BoardRow[] = data.late || []

        if (hydratedRef.current) {
          const prev = prevStatusRef.current
          const staffCheckIns: string[] = []
          for (const row of nextRows) {
            if (!isWaitingStatus(row)) continue
            const key = rowKey(row)
            const prevStatus = prev.get(key)
            const apptId = row.appointment?.id
            const selfChecked = apptId != null && selfCheckInRef.current.has(apptId)
            if (selfChecked) {
              if (apptId != null) selfCheckInRef.current.delete(apptId)
              continue
            }
            if (prevStatus && isPendingStatus({ ...row, board_status: prevStatus, status: prevStatus })) {
              const code = row.display_code && row.display_code !== '—' ? ` · ${row.display_code}` : ''
              staffCheckIns.push(`${row.patient?.name || 'Patient'}${code}`)
            }
          }
          if (staffCheckIns.length > 0) {
            setMessage(
              staffCheckIns.length === 1
                ? `Staff checked in · ${staffCheckIns[0]}`
                : `Staff checked in · ${staffCheckIns.join(', ')}`
            )
          }
        }

        const statusMap = new Map<string, string>()
        for (const row of nextRows) {
          statusMap.set(rowKey(row), row.board_status || row.status)
        }
        prevStatusRef.current = statusMap
        hydratedRef.current = true

        setRows(nextRows)
        setLate(nextLate)
      })
      .catch(() => setError('Could not load today\'s worksheet'))
      .finally(() => setLoading(false))
  }, [date, doctorId])

  useEffect(() => {
    hydratedRef.current = false
    prevStatusRef.current = new Map()
    load()
    const timer = window.setInterval(load, 4000)
    return () => window.clearInterval(timer)
  }, [load])

  const handleCheckIn = async (row: BoardRow) => {
    const tokenId = row.token_id
    const appointmentId = row.appointment?.id
    const busyKey = tokenId || appointmentId
    if (!busyKey) return
    setCheckingIn(busyKey)
    setError('')
    if (appointmentId) selfCheckInRef.current.add(appointmentId)
    try {
      // Already in queue → send to doctor; pending arrival → join queue.
      if (tokenId && row.status === 'waiting') {
        const { data } = await checkInQueueToken(tokenId)
        setMessage(`With you now · ${data.display_code || row.display_code} — ${row.patient?.name || 'patient'}`)
        const wsId = data.worksheet?.id
        if (wsId) {
          navigate(`/doctor/worksheet/${wsId}`)
          return
        }
        if (tokenId) {
          navigate(`/doctor/worksheet/new?token=${tokenId}`)
          return
        }
      } else if (appointmentId) {
        const { data } = await checkInAppointment(appointmentId)
        const code = data.queue_token?.display_code || data.display_code || ''
        setMessage(
          data.queue_token?.end_of_line || row.is_late
            ? `Arrived · new token ${code} at end of line`
            : `In queue · ${code || row.patient?.name || 'patient'}`
        )
      } else {
        setError('Nothing to check in')
        setCheckingIn(null)
        return
      }
      await load()
    } catch (err: unknown) {
      if (appointmentId) selfCheckInRef.current.delete(appointmentId)
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Check-in failed')
    }
    setCheckingIn(null)
  }

  const handleCheckout = async (row: BoardRow) => {
    const key = row.token_id || row.appointment?.id
    if (!key) return
    if (!window.confirm(`Check out ${row.patient?.name || 'this patient'}?`)) return
    setCheckingOut(key)
    setError('')
    try {
      if (row.token_id) {
        await checkOutQueueToken(row.token_id)
      } else if (row.appointment?.id) {
        await checkOutAppointment(row.appointment.id)
      }
      setMessage(`Checked out · ${row.patient?.name || row.display_code}`)
      await load()
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Checkout failed')
    }
    setCheckingOut(null)
  }

  const handleCallNext = async () => {
    if (!doctorId) return
    setCallingNext(true)
    setError('')
    try {
      const { data } = await callNext(doctorId, date)
      setMessage(`Now serving · ${data.display_code} — ${data.patient?.name || 'patient'}`)
      const wsId = data.worksheet?.id
      if (wsId) {
        navigate(`/doctor/worksheet/${wsId}`)
        return
      }
      if (data.id) {
        navigate(`/doctor/worksheet/new?token=${data.id}`)
        return
      }
      await load()
    } catch {
      setError('No patients waiting in queue')
    }
    setCallingNext(false)
  }

  const stats = useMemo(() => {
    const pending = rows.filter((r) => isPendingStatus(r)).length
    const waiting = rows.filter((r) => isWaitingStatus(r)).length
    const inConsult = rows.filter(
      (r) => (r.board_status || r.status) === 'in_consultation' && !r.can_checkout
    ).length
    const readyCheckout = rows.filter(
      (r) => (r.board_status || r.status) === 'in_consultation' && Boolean(r.can_checkout)
    ).length
    const done = rows.filter((r) =>
      ['completed', 'checked_out'].includes(r.board_status || r.status)
    ).length
    return {
      total: rows.length,
      pending,
      waiting,
      inConsult,
      readyCheckout,
      done,
      late: late.length,
    }
  }, [rows, late])

  const inConsultation = rows.find((r) => (r.board_status || r.status) === 'in_consultation')
  const boardDateLabel = formatBoardDate(date)
  const isToday = date === today

  return (
    <Layout
      title="Today's patients"
      subtitle={boardDateLabel}
      nav={doctorNav}
    >
      <div className="rdm">
        <ol className="doc-flow" aria-label="How your visit day works">
          <li className={stats.waiting > 0 && !inConsultation ? 'is-active' : ''}>
            <span className="doc-flow-num">1</span>
            <span>
              <strong>Queue</strong>
              <em>Patients waiting</em>
            </span>
          </li>
          <li className={inConsultation ? 'is-active' : ''}>
            <span className="doc-flow-num">2</span>
            <span>
              <strong>Consult</strong>
              <em>Worksheet · Rx · labs</em>
            </span>
          </li>
          <li>
            <span className="doc-flow-num">3</span>
            <span>
              <strong>Final submit</strong>
              <em>Bill preview · check out</em>
            </span>
          </li>
        </ol>

        <div className="rdm-bar">
          <div className="rdm-bar-left">
            <label className="rdm-date-wrap">
              <span className="rdm-date-label">Date</span>
              <input
                type="date"
                className="rdm-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Worksheet date"
              />
            </label>
            <span className="rdm-date-display">{boardDateLabel}</span>
            <button type="button" className="rdm-linkbtn" onClick={() => load()}>
              Refresh
            </button>
            <span className="rdm-live">
              <i className="rdm-live-dot" aria-hidden />
              Live
            </span>
          </div>
          <div className="rdm-bar-right">
            {isToday && (
              <button
                type="button"
                className="rdm-btn rdm-btn-solid"
                disabled={callingNext || stats.waiting === 0 || Boolean(inConsultation)}
                onClick={handleCallNext}
                title={
                  inConsultation
                    ? 'Finish the current consult first'
                    : stats.waiting === 0
                      ? 'No one waiting in queue'
                      : 'Start consult with the next waiting patient'
                }
              >
                {callingNext ? 'Opening…' : 'See next patient'}
              </button>
            )}
            <Link to={`/doctor/queue${date !== today ? `?date=${date}` : ''}`} className="rdm-btn rdm-btn-ghost">
              Live queue
            </Link>
            <Link to="/doctor/calendar" className="rdm-btn rdm-btn-ghost">
              Calendar
            </Link>
          </div>
        </div>

        <div className="rdm-stats" aria-label="Today summary">
          <div className="rdm-stat">
            <span>Today</span>
            <b>{stats.total}</b>
          </div>
          <div className={`rdm-stat rdm-stat-wait${stats.waiting > 0 ? ' rdm-stat-hot' : ''}`}>
            <span>In queue</span>
            <b>{stats.waiting}</b>
          </div>
          <div className="rdm-stat rdm-stat-consult">
            <span>With you</span>
            <b>{stats.inConsult}</b>
          </div>
          <div className="rdm-stat">
            <span>Ready for checkout</span>
            <b>{stats.readyCheckout}</b>
          </div>
          <div className="rdm-stat rdm-stat-done">
            <span>Done</span>
            <b>{stats.done}</b>
          </div>
        </div>

        {inConsultation && (
          <div className="doc-serving">
            <div className="doc-serving-copy">
              <p className="doc-serving-kicker">With you now</p>
              <h3>
                {inConsultation.display_code !== '—' ? inConsultation.display_code : '—'}
                <span>· {inConsultation.patient?.name || 'Patient'}</span>
              </h3>
              <p className="muted">
                Continue on the worksheet — add notes, medicines, labs, then Final submit.
              </p>
            </div>
            <div className="doc-serving-actions">
              <Link
                to={
                  inConsultation.worksheet_id
                    ? `/doctor/worksheet/${inConsultation.worksheet_id}`
                    : `/doctor/worksheet/new?token=${inConsultation.token_id}`
                }
                className="rdm-btn rdm-btn-solid"
              >
                Continue consult
                {inConsultation.worksheet_code ? ` · ${inConsultation.worksheet_code}` : ''}
              </Link>
              {inConsultation.can_checkout && (
                <button
                  type="button"
                  className="rdm-btn rdm-btn-ghost"
                  disabled={checkingOut === (inConsultation.token_id || inConsultation.appointment?.id)}
                  onClick={() => handleCheckout(inConsultation)}
                  title="Skips bill preview — prefer Final submit on the worksheet"
                >
                  Quick check out
                </button>
              )}
            </div>
          </div>
        )}

        {message && <div className="rdm-flash rdm-flash-ok">{message}</div>}
        {error && <div className="rdm-flash rdm-flash-err">{error}</div>}

        {late.length > 0 && (
          <div className="doc-late">
            <div className="doc-late-head">
              <h3>Late arrivals</h3>
              <span className="muted">Missed slot — issue a new end-of-line token when they arrive</span>
            </div>
            <ul className="doc-late-list">
              {late.map((row) => (
                <li key={`late-${row.id}`}>
                  <div>
                    <strong>{row.patient?.name || 'Patient'}</strong>
                    <span className="muted">
                      {slotLabel(row)}
                      {row.patient?.patient_code ? ` · ${row.patient.patient_code}` : ''}
                    </span>
                  </div>
                  {row.appointment?.id && (
                    <button
                      type="button"
                      className="rdm-btn rdm-btn-solid rdm-btn-sm"
                      disabled={checkingIn === row.appointment.id}
                      onClick={() => handleCheckIn(row)}
                    >
                      {checkingIn === row.appointment.id ? '…' : 'New token'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rdm-board">
          <div className="rdm-board-head">
            <h3>Day board</h3>
            <p className="muted">
              <strong>Add to queue</strong> when they arrive · <strong>Start consult</strong> to open the worksheet · finish with{' '}
              <strong>Final submit</strong> there
            </p>
          </div>
          <table className="rdm-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Status</th>
                <th className="rdm-col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="rdm-empty">Loading worksheet…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="rdm-empty">No patients scheduled for this day.</td>
                </tr>
              ) : (
                rows.map((row) => {
                  const status = statusLabel(row)
                  const isLate = Boolean(row.is_late || row.board_status === 'late')
                  const tokenText =
                    row.display_code && row.display_code !== '—' ? row.display_code : '—'
                  const withDoctor =
                    row.status === 'in_consultation' || row.board_status === 'in_consultation'

                  return (
                    <tr key={String(row.id)} className={isLate ? 'rdm-row-late' : undefined}>
                      <td>
                        <span className="rdm-token">{tokenText}</span>
                        {row.end_of_line && <span className="rdm-meta">EOL</span>}
                      </td>
                      <td>
                        <span className="rdm-time">{slotLabel(row)}</span>
                      </td>
                      <td>
                        <div className="rdm-patient">
                          <div className="rdm-name-row">
                            <span className="rdm-name">{row.patient?.name || '—'}</span>
                            <VisitSourceBadge source={row.source} />
                          </div>
                          <span className="rdm-meta">
                            {row.patient?.patient_code}
                            {row.patient?.phone ? ` · ${row.patient.phone}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={status.cls}>{status.text}</span>
                      </td>
                      <td className="rdm-col-action">
                        <div className="rdm-actions">
                          {(() => {
                            const actions = boardRowActions(row)
                            const isDone = ['completed', 'checked_out'].includes(
                              row.board_status || row.status
                            )
                            return (
                              <>
                                {actions.showCheckIn && actions.actionKey && (
                                  <button
                                    type="button"
                                    className={`rdm-btn rdm-btn-sm ${
                                      actions.checkInLabel === 'Start consult'
                                        ? 'rdm-btn-outline'
                                        : 'rdm-btn-solid'
                                    }`}
                                    disabled={checkingIn === actions.actionKey}
                                    onClick={() => handleCheckIn(row)}
                                    title={actions.checkInTitle}
                                  >
                                    {checkingIn === actions.actionKey ? '…' : actions.checkInLabel}
                                  </button>
                                )}
                                {withDoctor && (row.worksheet_id || row.token_id) && (
                                  <Link
                                    to={
                                      row.worksheet_id
                                        ? `/doctor/worksheet/${row.worksheet_id}`
                                        : `/doctor/worksheet/new?token=${row.token_id}`
                                    }
                                    className="rdm-btn rdm-btn-solid rdm-btn-sm"
                                  >
                                    {row.can_checkout ? 'Final submit' : 'Open worksheet'}
                                  </Link>
                                )}
                                {actions.showCheckOut && actions.actionKey && !row.worksheet_id && (
                                  <button
                                    type="button"
                                    className="rdm-btn rdm-btn-solid rdm-btn-sm"
                                    disabled={checkingOut === actions.actionKey}
                                    onClick={() => handleCheckout(row)}
                                    title="Complete checkout"
                                  >
                                    {checkingOut === actions.actionKey ? '…' : 'Final submit'}
                                  </button>
                                )}
                                {!withDoctor &&
                                  !isDone &&
                                  (row.worksheet_id ||
                                    (row.token_id &&
                                      ['in_consultation', 'completed'].includes(row.status))) && (
                                  <Link
                                    to={
                                      row.worksheet_id
                                        ? `/doctor/worksheet/${row.worksheet_id}`
                                        : `/doctor/worksheet/new?token=${row.token_id}`
                                    }
                                    className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                                  >
                                    Open worksheet
                                  </Link>
                                )}
                                {isDone && row.patient?.id && (
                                  <Link
                                    to={`/doctor/patients/${row.patient.id}`}
                                    className="rdm-btn rdm-btn-view rdm-btn-sm"
                                  >
                                    View
                                  </Link>
                                )}
                                {!isDone &&
                                  !actions.showCheckIn &&
                                  !withDoctor &&
                                  row.patient?.id && (
                                  <Link
                                    to={`/doctor/patients/${row.patient.id}`}
                                    className="rdm-btn rdm-btn-view rdm-btn-sm"
                                  >
                                    View
                                  </Link>
                                )}
                                {!actions.showCheckIn &&
                                  !actions.showCheckOut &&
                                  !row.worksheet_id &&
                                  !row.patient?.id && (
                                  <span className="rdm-meta">—</span>
                                )}
                              </>
                            )
                          })()}
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
