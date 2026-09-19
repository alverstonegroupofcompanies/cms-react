import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import RescheduleModal, { type RescheduleTarget } from '../../components/RescheduleModal'
import {
  IconCalendar,
  IconCheck,
  IconPlus,
  IconQueue,
  IconRefresh,
  IconStethoscope,
  IconUsers,
} from '../../components/Icons'
import {
  cancelAppointment,
  cancelToken,
  checkInAppointment,
  checkInQueueToken,
  checkOutAppointment,
  checkOutQueueToken,
  getAppointments,
  getDoctors,
  getQueueDayBoard,
} from '../../api/client'
import PeakBookingChart from '../../components/PeakBookingChart'
import VisitSourceBadge from '../../components/VisitSourceBadge'
import { receptionistNav } from '../../config/navigation'
import type { Appointment, Doctor } from '../../api/types'
import { localDateString } from '../../utils/slotUtils'

/** Fallback when a doctor has no completed-visit history yet. */
const DEFAULT_CONSULT_MINUTES = 30

type BoardRow = {
  kind: 'token' | 'appointment' | string
  id: number | string
  token_id?: number | null
  token_number?: number | null
  display_code: string
  status: string
  board_status?: string
  is_late?: boolean
  end_of_line?: boolean
  can_check_in?: boolean
  can_checkout?: boolean
  queue_date: string
  slot_time?: string | null
  sort_time?: string | null
  created_at?: string | null
  called_at?: string | null
  checked_out_at?: string | null
  completed_at?: string | null
  avg_consult_minutes?: number
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

function statusLabel(row: BoardRow, queueHint?: { ready?: boolean }) {
  const key = row.board_status || row.status
  if (key === 'late') return { text: 'Late', cls: 'rdm-pill rdm-pill-late' }
  if (key === 'pending_arrival') return { text: 'Pending', cls: 'rdm-pill rdm-pill-muted' }
  if (key === 'booked') return { text: 'Booked', cls: 'rdm-pill rdm-pill-muted' }
  if (key === 'in_consultation') return { text: 'With doctor', cls: 'rdm-pill rdm-pill-consult' }
  if (key === 'checked_out' || key === 'completed') return { text: 'Done', cls: 'rdm-pill rdm-pill-done' }
  // Doctor free + this patient is next → ready to go in (after previous checkout).
  if (queueHint?.ready && (key === 'checked_in' || key === 'waiting')) {
    return { text: 'Ready to enter', cls: 'rdm-pill rdm-pill-ready' }
  }
  if (key === 'checked_in' || key === 'waiting') return { text: 'Waiting', cls: 'rdm-pill rdm-pill-wait' }
  return { text: key.replace(/_/g, ' '), cls: 'rdm-pill rdm-pill-muted' }
}

/** Waiting in queue → Check in to doctor. Consult checkout is doctor-only. */
function boardRowActions(row: BoardRow, doctorBusy?: boolean) {
  const hasToken = Boolean(row.token_id)
  const hasAppt = Boolean(row.appointment?.id)
  const reservedOnly =
    hasToken &&
    (row.board_status === 'booked' || row.appointment?.status === 'booked') &&
    row.status === 'waiting'
  const inQueue = hasToken && row.status === 'waiting' && !reservedOnly
  const pendingArrival =
    reservedOnly ||
    (!hasToken &&
      hasAppt &&
      (row.can_check_in ||
        ['pending_arrival', 'late', 'booked', 'no_show'].includes(row.board_status || row.status)))

  return {
    showCheckIn: inQueue || pendingArrival,
    // Reception desk never ends a consult — only the treating doctor checks out.
    showCheckOut: false,
    checkInLabel: inQueue ? 'Check in' : row.is_late || row.board_status === 'late' ? 'New token' : 'Check in',
    checkInTitle: inQueue
      ? doctorBusy
        ? 'Doctor is busy with another patient — wait for estimated time'
        : 'Send patient in to the doctor'
      : reservedOnly
        ? 'Mark patient arrived (token already issued)'
        : 'Check patient into queue',
    actionKey: (row.token_id || row.appointment?.id) as number | undefined,
    doctorBusy: Boolean(doctorBusy && inQueue),
  }
}

function isDoctorInConsult(rows: BoardRow[], doctorId?: number | null, excludeTokenId?: number | null) {
  if (!doctorId) return false
  return rows.some(
    (r) =>
      r.doctor?.id === doctorId &&
      r.status === 'in_consultation' &&
      (excludeTokenId == null || r.token_id !== excludeTokenId)
  )
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

function checkoutLabel(row: BoardRow) {
  const raw = row.checked_out_at || row.completed_at
  if (!raw) return null
  return new Date(raw).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function doctorConsultMinutes(row: BoardRow, averages: Record<string, number>): number {
  const fromRow = Number(row.avg_consult_minutes)
  if (fromRow > 0) return fromRow
  const fromMap = row.doctor?.id != null ? Number(averages[String(row.doctor.id)]) : 0
  if (fromMap > 0) return fromMap
  return DEFAULT_CONSULT_MINUTES
}

function consultRemainingMinutes(
  calledAt: string | null | undefined,
  nowMs: number,
  consultMinutes: number
): number {
  if (!calledAt) return consultMinutes
  const start = new Date(calledAt).getTime()
  if (Number.isNaN(start)) return consultMinutes
  const elapsed = Math.floor((nowMs - start) / 60000)
  return Math.max(0, consultMinutes - elapsed)
}

function queueSortKey(row: BoardRow) {
  return `${row.sort_time || '99:99:99'}-${String(row.token_number ?? row.token_id ?? 9999).padStart(6, '0')}`
}

function isActiveQueueStatus(row: BoardRow) {
  const key = row.board_status || row.status
  return ['waiting', 'checked_in', 'pending_arrival', 'late', 'booked', 'no_show'].includes(key)
}

function isDoneStatus(row: BoardRow) {
  const key = row.board_status || row.status
  return key === 'completed' || key === 'checked_out'
}

type QueueWaitInfo = {
  /** Estimated minutes; null when ready to enter (doctor free). */
  minutes: number | null
  /** First waiting patient and no one currently with this doctor. */
  ready: boolean
  /** Someone is still in consultation ahead of this patient. */
  behindConsult: boolean
  /** Typical visit length for this doctor (from history). */
  typicalMinutes: number
  /** This row is the active consult. */
  inConsult?: boolean
}

type BoardRowHandlers = {
  rows: BoardRow[]
  date: string
  estimatedWaitById: Map<string, QueueWaitInfo>
  checkingIn: number | null
  checkingOut: string | number | null
  busyHintId: string | null
  consultAverages: Record<string, number>
  onCheckIn: (row: BoardRow) => void
  onCheckout: (row: BoardRow) => void
  onReschedule: (row: BoardRow) => void
  onCancel: (row: BoardRow) => void
  hideDoctor?: boolean
}

function busyDoctorHint(
  rows: BoardRow[],
  row: BoardRow,
  averages: Record<string, number>,
  waitInfo?: QueueWaitInfo
): string | null {
  if (!row.doctor?.id || row.status !== 'waiting') return null
  const busy = rows.find(
    (r) =>
      r.doctor?.id === row.doctor?.id &&
      r.status === 'in_consultation' &&
      r.token_id !== row.token_id
  )
  if (!busy) return null
  const typical = doctorConsultMinutes(busy, averages)
  const remaining = Math.max(
    1,
    waitInfo?.minutes ?? consultRemainingMinutes(busy.called_at, Date.now(), typical)
  )
  const doctorName = row.doctor.name || 'Doctor'
  const withName = busy.patient?.name || 'a patient'
  return `${doctorName} is with ${withName} · wait ~${formatEstMinutes(remaining)}`
}

function BoardPatientRow({
  row: t,
  rows,
  date,
  estimatedWaitById,
  checkingIn,
  checkingOut,
  busyHintId,
  consultAverages,
  onCheckIn,
  onCheckout,
  onReschedule,
  onCancel,
  hideDoctor,
}: BoardRowHandlers & { row: BoardRow }) {
  const waitInfo = estimatedWaitById.get(String(t.id))
  const status = statusLabel(t, { ready: waitInfo?.ready })
  const out = checkoutLabel(t)
  const tokenText = t.display_code && t.display_code !== '—' ? t.display_code : '—'
  const isLate = Boolean(t.is_late || t.board_status === 'late')
  const rowDate = t.queue_date || date
  const doctorBusy = isDoctorInConsult(rows, t.doctor?.id, t.token_id)
  const actions = boardRowActions(t, doctorBusy)
  const hint = busyDoctorHint(rows, t, consultAverages, waitInfo)
  const showHint = Boolean(hint && busyHintId === String(t.id))

  return (
    <tr
      className={
        isLate ? 'rdm-row-late' : waitInfo?.ready ? 'rdm-row-ready' : undefined
      }
    >
      <td>
        <span className="rdm-token">{tokenText}</span>
        {t.end_of_line && <span className="rdm-meta">EOL</span>}
      </td>
      <td>
        <span className="rdm-day">{formatBoardDate(rowDate)}</span>
      </td>
      <td>
        <span className="rdm-time">{slotLabel(t)}</span>
      </td>
      <td>
        <div className="rdm-patient">
          <div className="rdm-name-row">
            <span className="rdm-name">{t.patient?.name || '—'}</span>
            <VisitSourceBadge source={t.source} />
          </div>
          <span className="rdm-meta">
            {t.patient?.patient_code}
            {t.patient?.phone ? ` · ${t.patient.phone}` : ''}
          </span>
        </div>
      </td>
      {!hideDoctor && (
        <td>
          <div className="rdm-patient">
            <span className="rdm-name">{t.doctor?.name || '—'}</span>
            {t.doctor?.specialization && (
              <span className="rdm-meta">{t.doctor.specialization}</span>
            )}
          </div>
        </td>
      )}
      <td>
        <BoardEstWaitCell info={waitInfo} status={t.status} />
      </td>
      <td>
        <span className={status.cls}>{status.text}</span>
        {out && <span className="rdm-meta">Out {out}</span>}
      </td>
      <td className="rdm-col-action">
        {isLate ? (
          <LateActions
            row={t}
            checkingIn={checkingIn}
            checkingOut={checkingOut}
            onCheckIn={onCheckIn}
            onCheckout={onCheckout}
            onReschedule={onReschedule}
            onCancel={onCancel}
          />
        ) : (
          <div className="rdm-action-wrap">
            <div className="rdm-actions">
              {actions.showCheckIn && actions.actionKey && (
                <button
                  type="button"
                  className="rdm-btn rdm-btn-solid rdm-btn-sm"
                  disabled={checkingIn === actions.actionKey}
                  onClick={() => onCheckIn(t)}
                  title={actions.checkInTitle}
                >
                  {checkingIn === actions.actionKey ? '…' : actions.checkInLabel}
                </button>
              )}
              {actions.showCheckOut && actions.actionKey && (
                <button
                  type="button"
                  className="rdm-btn rdm-btn-solid rdm-btn-sm rdm-btn-checkout"
                  disabled={checkingOut === actions.actionKey}
                  onClick={() => onCheckout(t)}
                >
                  {checkingOut === actions.actionKey ? '…' : 'Check out'}
                </button>
              )}
              {(t.appointment?.id || (t.token_id && t.status === 'waiting')) && (
                <button
                  type="button"
                  className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                  onClick={() => onCancel(t)}
                >
                  Cancel
                </button>
              )}
              {t.appointment?.id &&
                ['booked', 'no_show', 'checked_in', 'late', 'pending_arrival', 'waiting'].includes(
                  t.board_status || t.status
                ) && (
                  <button
                    type="button"
                    className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                    onClick={() => onReschedule(t)}
                  >
                    Reschedule
                  </button>
                )}
            </div>
            {showHint && hint && (
              <p className="rdm-busy-hint" role="status">
                {hint}
              </p>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

function BoardSectionTable({
  rows,
  emptyText,
  hideDoctor,
  handlers,
}: {
  rows: BoardRow[]
  emptyText: string
  hideDoctor?: boolean
  handlers: BoardRowHandlers
}) {
  const colSpan = hideDoctor ? 7 : 8
  return (
    <div className="rdm-table-wrap">
      <table className={`rdm-table${hideDoctor ? ' rdm-table-no-doc' : ''}`}>
        <thead>
          <tr>
            <th>Token</th>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            {!hideDoctor && <th>Doctor</th>}
            <th>Est. wait</th>
            <th>Status</th>
            <th className="rdm-col-action">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="rdm-empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <BoardPatientRow key={String(row.id)} row={row} hideDoctor={hideDoctor} {...handlers} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Per-doctor estimated wait using that doctor's average consult length
 * from recent completed visits (fallback 30 min).
 */
function buildEstimatedWaitMap(
  rows: BoardRow[],
  nowMs: number,
  averages: Record<string, number>
): Map<string, QueueWaitInfo> {
  const map = new Map<string, QueueWaitInfo>()
  const byDoctor = new Map<number, BoardRow[]>()

  for (const row of rows) {
    const doctorId = row.doctor?.id
    if (!doctorId || !row.token_id) continue
    if (row.status !== 'waiting' && row.status !== 'in_consultation') continue
    const list = byDoctor.get(doctorId)
    if (list) list.push(row)
    else byDoctor.set(doctorId, [row])
  }

  for (const list of byDoctor.values()) {
    const consult = list.find((r) => r.status === 'in_consultation')
    const typical = doctorConsultMinutes(consult || list[0], averages)
    const remaining = consult
      ? consultRemainingMinutes(consult.called_at, nowMs, typical)
      : 0

    if (consult) {
      map.set(String(consult.id), {
        minutes: remaining,
        ready: false,
        behindConsult: false,
        typicalMinutes: typical,
        inConsult: true,
      })
    }

    const waiting = list
      .filter((r) => r.status === 'waiting')
      .sort((a, b) => queueSortKey(a).localeCompare(queueSortKey(b)))

    waiting.forEach((row, index) => {
      const rowTypical = doctorConsultMinutes(row, averages)
      if (consult) {
        const consultSlice = Math.max(1, remaining)
        map.set(String(row.id), {
          minutes: consultSlice + index * rowTypical,
          ready: false,
          behindConsult: true,
          typicalMinutes: rowTypical,
        })
        return
      }

      if (index === 0) {
        map.set(String(row.id), {
          minutes: rowTypical,
          ready: true,
          behindConsult: false,
          typicalMinutes: rowTypical,
        })
        return
      }

      map.set(String(row.id), {
        minutes: index * rowTypical,
        ready: false,
        behindConsult: false,
        typicalMinutes: rowTypical,
      })
    })
  }

  return map
}

function formatEstMinutes(mins: number) {
  if (mins <= 1) return '1 min'
  return `${mins} min`
}

function BoardEstWaitCell({
  info,
  status,
}: {
  info: QueueWaitInfo | undefined
  status: string
}) {
  if (!info) {
    return <span className="rdm-meta">—</span>
  }

  if (info.inConsult || status === 'in_consultation') {
    return (
      <div
        className="rdm-est-wait"
        title={`Typical visit with this doctor ~${info.typicalMinutes} min (from recent visits)`}
      >
        <span className="rdm-est-mins">{formatEstMinutes(info.minutes ?? 0)}</span>
        <span className="rdm-meta">left in session</span>
      </div>
    )
  }

  if (info.ready) {
    return (
      <div
        className="rdm-est-wait"
        title={`Doctor is free — typical visit ~${info.typicalMinutes} min`}
      >
        <span className="rdm-est-mins rdm-est-mins-ready">Ready</span>
        <span className="rdm-meta">~{info.typicalMinutes} min visit</span>
      </div>
    )
  }

  if (info.minutes == null) {
    return <span className="rdm-meta">—</span>
  }

  const hot = status === 'waiting' && info.behindConsult
  return (
    <div
      className="rdm-est-wait"
      title={`Based on this doctor's recent visits (~${info.typicalMinutes} min each)`}
    >
      <span className={`rdm-est-mins${hot ? ' rdm-est-mins-hot' : ''}`}>
        {formatEstMinutes(info.minutes)}
      </span>
      <span className="rdm-meta">est. wait</span>
    </div>
  )
}

function LateActions({
  row,
  checkingIn,
  checkingOut,
  onCheckIn,
  onCheckout,
  onReschedule,
  onCancel,
}: {
  row: BoardRow
  checkingIn: number | null
  checkingOut: string | number | null
  onCheckIn: (row: BoardRow) => void
  onCheckout: (row: BoardRow) => void
  onReschedule: (row: BoardRow) => void
  onCancel: (row: BoardRow) => void
}) {
  const actions = boardRowActions(row)
  const busy = actions.actionKey != null && checkingIn === actions.actionKey
  const outBusy = actions.actionKey != null && checkingOut === actions.actionKey
  const apptId = row.appointment?.id

  return (
    <div className="rdm-actions">
      {actions.showCheckIn && actions.actionKey && (
        <button
          type="button"
          className="rdm-btn rdm-btn-solid rdm-btn-sm"
          disabled={busy}
          onClick={() => onCheckIn(row)}
          title={actions.checkInTitle}
        >
          {busy ? '…' : actions.checkInLabel}
        </button>
      )}
      {actions.showCheckOut && actions.actionKey && (
        <button
          type="button"
          className="rdm-btn rdm-btn-solid rdm-btn-sm rdm-btn-checkout"
          disabled={outBusy}
          onClick={() => onCheckout(row)}
        >
          {outBusy ? '…' : 'Check out'}
        </button>
      )}
      {apptId && (
        <>
          <button type="button" className="rdm-btn rdm-btn-ghost rdm-btn-sm" onClick={() => onReschedule(row)}>
            Reschedule
          </button>
          <button type="button" className="rdm-btn rdm-btn-ghost rdm-btn-sm" onClick={() => onCancel(row)}>
            Cancel
          </button>
        </>
      )}
    </div>
  )
}

export default function ReceptionistDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [date, setDate] = useState(localDateString)
  const [rows, setRows] = useState<BoardRow[]>([])
  const [consultAverages, setConsultAverages] = useState<Record<string, number>>({})
  const [late, setLate] = useState<BoardRow[]>([])
  const [upcoming, setUpcoming] = useState<Appointment[]>([])
  const [nextToken, setNextToken] = useState('AMC01')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [checkingIn, setCheckingIn] = useState<number | null>(null)
  const [checkingOut, setCheckingOut] = useState<string | number | null>(null)
  const [busyHintId, setBusyHintId] = useState<string | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorFilter, setDoctorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [peakRefreshKey, setPeakRefreshKey] = useState(0)

  useEffect(() => {
    getDoctors().then(({ data }) => setDoctors(data)).catch(() => setDoctors([]))
  }, [])

  useEffect(() => {
    const flash = (location.state as { flash?: string } | null)?.flash
    if (flash) {
      setMessage(flash)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  const loadUpcoming = useCallback(() => {
    getAppointments()
      .then(({ data }) => {
        const list = (data.data || data) as Appointment[]
        setUpcoming(Array.isArray(list) ? list : [])
      })
      .catch(() => setUpcoming([]))
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getQueueDayBoard(date)
      .then(({ data }) => {
        setRows(data.rows || data.tokens || [])
        setLate(data.late || [])
        setNextToken(data.next_token || 'AMC01')
        const averages = data.consult_averages || {}
        const normalized: Record<string, number> = {}
        Object.entries(averages).forEach(([id, mins]) => {
          normalized[String(id)] = Number(mins) || DEFAULT_CONSULT_MINUTES
        })
        setConsultAverages(normalized)
        setPeakRefreshKey((n) => n + 1)
      })
      .catch(() => setError('Could not load day board'))
      .finally(() => setLoading(false))
    loadUpcoming()
  }, [date, loadUpcoming])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 5000)
    return () => window.clearInterval(timer)
  }, [load])

  const handleCheckIn = async (row: BoardRow) => {
    const tokenId = row.token_id
    const appointmentId = row.appointment?.id
    const busyKey = tokenId || appointmentId
    if (!busyKey) return

    // Sending a waiting patient in while this doctor is already consulting —
    // stop and show a friendly wait message (do not interrupt the current visit).
    const reservedOnly =
      Boolean(tokenId) &&
      (row.board_status === 'booked' || row.appointment?.status === 'booked') &&
      row.status === 'waiting'
    if (tokenId && row.status === 'waiting' && !reservedOnly && row.doctor?.id) {
      const busy = rows.find(
        (r) =>
          r.doctor?.id === row.doctor?.id &&
          r.status === 'in_consultation' &&
          r.token_id !== tokenId
      )
      if (busy) {
        setError('')
        setMessage('')
        setBusyHintId(String(row.id))
        window.setTimeout(() => {
          setBusyHintId((cur) => (cur === String(row.id) ? null : cur))
        }, 8000)
        return
      }
    }

    setCheckingIn(busyKey)
    setError('')
    try {
      if (tokenId && row.status === 'waiting' && !reservedOnly) {
        const { data } = await checkInQueueToken(tokenId)
        setMessage(`With doctor · ${data.display_code || row.display_code} — ${row.patient?.name || 'patient'}`)
      } else if (appointmentId) {
        const { data } = await checkInAppointment(appointmentId)
        const code = data.queue_token?.display_code || data.display_code || row.display_code || ''
        setMessage(
          data.queue_token?.end_of_line || row.is_late
            ? `Late · new token ${code} at end of line`
            : reservedOnly
              ? `Arrived · ${code} now waiting`
              : `In queue · ${code}`
        )
      } else {
        setError('Nothing to check in')
        setCheckingIn(null)
        return
      }
      load()
    } catch (err: unknown) {
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
      load()
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Checkout failed')
    }
    setCheckingOut(null)
  }

  const handleAbort = async (row: BoardRow) => {
    const label = row.is_late ? 'Abort / cancel this late appointment?' : 'Cancel this appointment?'
    if (!window.confirm(label)) return
    try {
      if (row.appointment?.id) {
        await cancelAppointment(row.appointment.id)
        setMessage('Appointment cancelled')
      } else if (row.token_id) {
        await cancelToken(row.token_id)
        setMessage('Token cancelled')
      }
      load()
    } catch {
      setError('Cancel failed')
    }
  }

  const openReschedule = (row: BoardRow) => {
    if (!row.appointment?.id || !row.doctor?.id) {
      setError('Cannot reschedule — missing appointment or doctor')
      return
    }
    setRescheduleTarget({
      appointmentId: row.appointment.id,
      doctorId: row.doctor.id,
      doctorName: row.doctor.name,
      appointmentDate: row.queue_date,
      slotTime: row.slot_time || row.appointment.slot_time || '09:00:00',
      patientName: row.patient?.name,
    })
  }

  const filteredRows = useMemo(() => {
    const q = patientFilter.trim().toLowerCase()
    return rows.filter((r) => {
      if (doctorFilter && String(r.doctor?.id) !== doctorFilter) return false
      const key = r.board_status || r.status
      if (statusFilter === 'late' && !(r.is_late || key === 'late')) return false
      if (statusFilter === 'waiting' && !['waiting', 'checked_in', 'pending_arrival', 'booked'].includes(key)) return false
      if (statusFilter === 'in_consultation' && key !== 'in_consultation') return false
      if (statusFilter === 'done' && !['completed', 'checked_out'].includes(key)) return false
      if (q) {
        const hay = `${r.patient?.name || ''} ${r.patient?.patient_code || ''} ${r.patient?.phone || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, doctorFilter, statusFilter, patientFilter])

  const filteredLate = useMemo(() => {
    return late.filter((r) => {
      if (doctorFilter && String(r.doctor?.id) !== doctorFilter) return false
      const q = patientFilter.trim().toLowerCase()
      if (q) {
        const hay = `${r.patient?.name || ''} ${r.patient?.patient_code || ''} ${r.patient?.phone || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [late, doctorFilter, patientFilter])

  const waiting = filteredRows.filter((t) =>
    ['waiting', 'checked_in', 'pending_arrival', 'late'].includes(t.board_status || t.status)
  ).length
  const inConsult = filteredRows.filter((t) => (t.board_status || t.status) === 'in_consultation').length
  const completed = filteredRows.filter((t) => ['completed', 'checked_out'].includes(t.board_status || t.status)).length

  const needsEstTick = useMemo(
    () =>
      rows.some(
        (r) => r.status === 'waiting' || r.status === 'in_consultation'
      ),
    [rows]
  )

  const [waitNow, setWaitNow] = useState(() => Date.now())
  useEffect(() => {
    if (!needsEstTick) return
    setWaitNow(Date.now())
    const id = window.setInterval(() => setWaitNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [needsEstTick])

  // Use full board (not filters) so per-doctor queue position stays correct.
  const estimatedWaitById = useMemo(
    () => buildEstimatedWaitMap(rows, waitNow, consultAverages),
    [rows, waitNow, consultAverages]
  )

  const waitingEstimates = useMemo(() => {
    return filteredRows
      .filter((r) => r.status === 'waiting')
      .map((r) => estimatedWaitById.get(String(r.id)))
      .filter((info): info is QueueWaitInfo => {
        if (!info) return false
        return info.minutes != null && !info.ready
      })
      .map((info) => info.minutes as number)
  }, [filteredRows, estimatedWaitById])

  const avgEstMinutes =
    waitingEstimates.length > 0
      ? Math.round(
          waitingEstimates.reduce((sum, n) => sum + n, 0) / waitingEstimates.length
        )
      : null

  const withDoctorRows = useMemo(
    () =>
      filteredRows
        .filter((r) => (r.board_status || r.status) === 'in_consultation')
        .sort((a, b) => (a.doctor?.name || '').localeCompare(b.doctor?.name || '')),
    [filteredRows]
  )

  const inQueueRows = useMemo(
    () =>
      filteredRows
        .filter((r) => isActiveQueueStatus(r))
        .sort((a, b) => {
          const aReady = estimatedWaitById.get(String(a.id))?.ready ? 0 : 1
          const bReady = estimatedWaitById.get(String(b.id))?.ready ? 0 : 1
          if (aReady !== bReady) return aReady - bReady
          const aWait = estimatedWaitById.get(String(a.id))?.minutes ?? 9999
          const bWait = estimatedWaitById.get(String(b.id))?.minutes ?? 9999
          if (aWait !== bWait) return aWait - bWait
          return queueSortKey(a).localeCompare(queueSortKey(b))
        }),
    [filteredRows, estimatedWaitById]
  )

  const doneRows = useMemo(
    () =>
      filteredRows
        .filter((r) => isDoneStatus(r))
        .sort((a, b) => {
          const ao = a.checked_out_at || a.completed_at || ''
          const bo = b.checked_out_at || b.completed_at || ''
          return bo.localeCompare(ao)
        }),
    [filteredRows]
  )

  // Bookings after the selected board date (day board is single-day only).
  const upcomingBeyondBoard = useMemo(() => {
    const q = patientFilter.trim().toLowerCase()
    return upcoming
      .filter((a) => {
        const apptDate = String(a.appointment_date).slice(0, 10)
        if (apptDate <= date) return false
        if (!['booked', 'checked_in', 'no_show'].includes(a.status)) return false
        if (doctorFilter && String(a.doctor_id) !== doctorFilter) return false
        if (q) {
          const hay = `${a.patient?.name || ''} ${a.patient?.patient_code || ''} ${a.patient?.phone || ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const da = `${String(a.appointment_date).slice(0, 10)} ${a.slot_time || ''}`
        const db = `${String(b.appointment_date).slice(0, 10)} ${b.slot_time || ''}`
        return da.localeCompare(db)
      })
      .slice(0, 12)
  }, [upcoming, date, doctorFilter, patientFilter])

  const boardHandlers: BoardRowHandlers = {
    rows,
    date,
    estimatedWaitById,
    checkingIn,
    checkingOut,
    busyHintId,
    consultAverages,
    onCheckIn: handleCheckIn,
    onCheckout: handleCheckout,
    onReschedule: openReschedule,
    onCancel: handleAbort,
  }

  const filtersActive = Boolean(doctorFilter || statusFilter || patientFilter.trim())
  const boardDateLabel = formatBoardDate(date)

  return (
    <Layout
      title="Reception Desk"
      subtitle={`Day board · ${boardDateLabel}`}
      hidePageHeader
      nav={receptionistNav}
    >
      <div className="rdm">
        <div className="rdm-hero-strip">
          <div>
            <p className="rdm-hero-kicker">Reception desk</p>
            <h2 className="rdm-hero-title">Today&apos;s board</h2>
            <p className="rdm-hero-copy">
              Day board · {boardDateLabel}. Manage arrivals, queue, and consults in one place.
            </p>
          </div>
          <div className="rdm-hero-actions">
            <Link to="/receptionist/calendar" className="rdm-btn rdm-btn-ghost">
              <IconCalendar size={15} /> Calendar
            </Link>
            <Link to="/receptionist/book?walkin=1" className="rdm-btn rdm-btn-walkin">
              <IconUsers size={15} /> Walk-in
            </Link>
            <Link to="/receptionist/book" className="rdm-btn rdm-btn-solid">
              <IconPlus size={15} /> Book / token
            </Link>
          </div>
        </div>

        <div className="rdm-controls">
          <div className="rdm-bar">
            <div className="rdm-bar-left">
              <label className="rdm-date-wrap">
                <span className="rdm-date-label">Board date</span>
                <div className="rdm-date-row">
                  <input
                    type="date"
                    className="rdm-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-label="Board date"
                  />
                  <span className="rdm-day-chip">{boardDateLabel}</span>
                </div>
              </label>
              <button type="button" className="rdm-btn rdm-btn-ghost rdm-btn-sm" onClick={load}>
                <IconRefresh size={14} /> Refresh
              </button>
              <span className="rdm-live">
                <span className="rdm-live-dot" aria-hidden /> Live
              </span>
            </div>
          </div>

          <div className="rdm-filters">
            <label className="rdm-filter">
              <span>Doctor</span>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                aria-label="Filter by doctor"
              >
                <option value="">All doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.specialization ? ` — ${d.specialization}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="rdm-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="late">Late</option>
                <option value="waiting">Waiting / pending / booked</option>
                <option value="in_consultation">With doctor</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="rdm-filter rdm-filter-grow">
              <span>Patient</span>
              <input
                type="search"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                placeholder="Name, ID or phone"
                aria-label="Filter by patient"
              />
            </label>
            {filtersActive && (
              <button
                type="button"
                className="rdm-btn rdm-btn-ghost rdm-btn-sm rdm-filter-clear"
                onClick={() => {
                  setDoctorFilter('')
                  setStatusFilter('')
                  setPatientFilter('')
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="rdm-kpi" aria-label="Summary">
          <div className="rdm-kpi-item">
            <span className="rdm-kpi-label">{filtersActive ? `Of ${rows.length}` : 'On board'}</span>
            <b>{filteredRows.length}</b>
          </div>
          <div className={`rdm-kpi-item${waiting > 0 ? ' is-emphasis' : ''}`}>
            <span className="rdm-kpi-label">Waiting</span>
            <b>{waiting}</b>
          </div>
          <div
            className="rdm-kpi-item"
            title="Average estimated wait for queued patients (uses each doctor's recent visit length)"
          >
            <span className="rdm-kpi-label">Avg wait</span>
            <b className="rdm-stat-timer">
              {avgEstMinutes != null ? formatEstMinutes(avgEstMinutes) : '—'}
            </b>
          </div>
          <div className={`rdm-kpi-item${inConsult > 0 ? ' is-consult' : ''}`}>
            <span className="rdm-kpi-label">With doctor</span>
            <b>{inConsult}</b>
          </div>
          <div className="rdm-kpi-item">
            <span className="rdm-kpi-label">Done</span>
            <b>{completed}</b>
          </div>
          <div className="rdm-kpi-item rdm-kpi-token">
            <span className="rdm-kpi-label">Next token</span>
            <b>{nextToken}</b>
          </div>
          {upcomingBeyondBoard.length > 0 && (
            <div className="rdm-kpi-item">
              <span className="rdm-kpi-label">Upcoming</span>
              <b>{upcomingBeyondBoard.length}{upcomingBeyondBoard.length >= 12 ? '+' : ''}</b>
            </div>
          )}
          {filteredLate.length > 0 && (
            <div className="rdm-kpi-item is-late">
              <span className="rdm-kpi-label">Late</span>
              <b>{filteredLate.length}</b>
            </div>
          )}
        </div>

        {filteredLate.length > 0 && (
          <div className="rdm-late" role="alert">
            <span className="rdm-late-label">Late arrivals</span>
            <div className="rdm-late-list">
              {filteredLate.map((l) => (
                <div key={String(l.id)} className="rdm-late-item">
                  <span>
                    {l.patient?.name}{' '}
                    <VisitSourceBadge source={l.source} />
                    {' · '}
                    {l.slot_time?.slice(0, 5) || '—'} · {l.doctor?.name || 'Doctor'}
                  </span>
                  <LateActions
                    row={l}
                    checkingIn={checkingIn}
                    checkingOut={checkingOut}
                    onCheckIn={handleCheckIn}
                    onCheckout={handleCheckout}
                    onReschedule={openReschedule}
                    onCancel={handleAbort}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {message && <div className="rdm-flash rdm-flash-ok">{message}</div>}
        {error && <div className="rdm-flash rdm-flash-err">{error}</div>}

        {loading && rows.length === 0 ? (
          <div className="rdm-panel">
            <p className="rdm-empty" style={{ margin: 0 }}>Loading…</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rdm-panel">
            <p className="rdm-empty" style={{ margin: 0 }}>
              {rows.length === 0
                ? 'No bookings for this date.'
                : 'No rows match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="rdm-sections">
            <section className="rdm-section rdm-section-consult">
              <div className="rdm-panel">
                <div className="rdm-section-head">
                  <div className="rdm-section-title">
                    <span className="rdm-section-ico" aria-hidden><IconStethoscope size={16} /></span>
                    <div>
                      <h3>With doctor</h3>
                      <p>In consultation now</p>
                    </div>
                  </div>
                  <span className="rdm-section-count">{withDoctorRows.length}</span>
                </div>
                <BoardSectionTable
                  rows={withDoctorRows}
                  emptyText="No one with a doctor right now."
                  handlers={boardHandlers}
                />
              </div>
            </section>

            <section className="rdm-section rdm-section-queue">
              <div className="rdm-panel">
                <div className="rdm-section-head">
                  <div className="rdm-section-title">
                    <span className="rdm-section-ico" aria-hidden><IconQueue size={16} /></span>
                    <div>
                      <h3>In queue</h3>
                      <p>Waiting or ready to enter</p>
                    </div>
                  </div>
                  <span className="rdm-section-count">{inQueueRows.length}</span>
                </div>
                <BoardSectionTable
                  rows={inQueueRows}
                  emptyText="Nobody waiting in queue."
                  handlers={boardHandlers}
                />
              </div>
            </section>

            {doneRows.length > 0 && (
              <section className="rdm-section rdm-section-done">
                <div className="rdm-panel">
                  <div className="rdm-section-head">
                    <div className="rdm-section-title">
                      <span className="rdm-section-ico" aria-hidden><IconCheck size={16} /></span>
                      <div>
                        <h3>Completed</h3>
                        <p>Checked out today</p>
                      </div>
                    </div>
                    <span className="rdm-section-count">{doneRows.length}</span>
                  </div>
                  <BoardSectionTable
                    rows={doneRows}
                    emptyText="No completed visits."
                    handlers={boardHandlers}
                  />
                </div>
              </section>
            )}
          </div>
        )}

        <section className="rdm-section rdm-section-upcoming">
          <div className="rdm-panel">
            <div className="rdm-section-head">
              <div className="rdm-section-title">
                <span className="rdm-section-ico" aria-hidden><IconCalendar size={16} /></span>
                <div>
                  <h3>Upcoming appointments</h3>
                  <p>Booked after {boardDateLabel}</p>
                </div>
              </div>
              <div className="rdm-upcoming-head-actions">
                <span className="rdm-section-count">{upcomingBeyondBoard.length}{upcomingBeyondBoard.length >= 12 ? '+' : ''}</span>
                <Link to="/receptionist/appointments" className="rdm-linkbtn">
                  View all
                </Link>
              </div>
            </div>
            {upcomingBeyondBoard.length === 0 ? (
              <p className="rdm-empty" style={{ margin: 0 }}>
                No later bookings scheduled.
              </p>
            ) : (
              <div className="rdm-table-wrap">
                <table className="rdm-table rdm-upcoming-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Status</th>
                      <th className="rdm-col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBeyondBoard.map((a) => {
                      const apptDate = String(a.appointment_date).slice(0, 10)
                      return (
                        <tr key={a.id}>
                          <td>
                            <span className="rdm-day">{formatBoardDate(apptDate)}</span>
                          </td>
                          <td>
                            <span className="rdm-time">{a.slot_time?.slice(0, 5) || '—'}</span>
                          </td>
                          <td>
                            <div className="rdm-patient">
                              <div className="rdm-name-row">
                                <span className="rdm-name">{a.patient?.name || '—'}</span>
                                <VisitSourceBadge source={a.type === 'walk_in' ? 'walk_in' : 'booked'} />
                              </div>
                              <span className="rdm-meta">
                                {a.patient?.patient_code || ''}
                                {a.patient?.phone ? ` · ${a.patient.phone}` : ''}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="rdm-patient">
                              <span className="rdm-name">{a.doctor?.name || '—'}</span>
                              {a.doctor?.specialization && (
                                <span className="rdm-meta">{a.doctor.specialization}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="rdm-pill rdm-pill-muted">{a.status.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="rdm-col-action">
                            <div className="rdm-actions">
                              <button
                                type="button"
                                className="rdm-btn rdm-btn-solid rdm-btn-sm"
                                onClick={() => setDate(apptDate)}
                              >
                                Open day
                              </button>
                              {['booked', 'no_show', 'checked_in'].includes(a.status) && (
                                <>
                                  <button
                                    type="button"
                                    className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                                    onClick={() =>
                                      setRescheduleTarget({
                                        appointmentId: a.id,
                                        doctorId: a.doctor_id,
                                        doctorName: a.doctor?.name || 'Doctor',
                                        appointmentDate: apptDate,
                                        slotTime: a.slot_time || '09:00:00',
                                        patientName: a.patient?.name,
                                      })
                                    }
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    type="button"
                                    className="rdm-btn rdm-btn-ghost rdm-btn-sm"
                                    onClick={async () => {
                                      if (!window.confirm('Cancel this appointment?')) return
                                      try {
                                        await cancelAppointment(a.id)
                                        setMessage('Appointment cancelled')
                                        load()
                                      } catch {
                                        setError('Cancel failed')
                                      }
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <PeakBookingChart refreshKey={peakRefreshKey} />
      </div>

      <RescheduleModal
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={(result) => {
          setRescheduleTarget(null)
          setMessage(
            result
              ? `Rescheduled to ${result.date} at ${result.slot.slice(0, 5)} — patient view updated`
              : 'Appointment rescheduled — patient view updated'
          )
          load()
        }}
      />
    </Layout>
  )
}
