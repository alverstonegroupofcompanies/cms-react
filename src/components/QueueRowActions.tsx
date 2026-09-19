import LiveWaitTimer from './LiveWaitTimer'

export type QueueRow = {
  id: number
  position?: number
  display_code: string
  status: string
  slot_time?: string | null
  joined_at?: string | null
  called_at?: string | null
  can_check_in?: boolean
  can_checkout?: boolean
  worksheet_id?: number | null
  worksheet_code?: string | null
  patient: { id?: number; name: string; patient_code?: string }
}

export function formatQueueSlot(slot?: string | null) {
  if (!slot) return 'Walk-in'
  const [h, m] = slot.slice(0, 5).split(':').map(Number)
  if (Number.isNaN(h)) return slot.slice(0, 5)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatQueueClock(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function queueStatusLabel(status: string) {
  if (status === 'waiting') return 'In queue'
  if (status === 'in_consultation') return 'With doctor'
  if (status === 'completed') return 'Checked out'
  return status.replace(/_/g, ' ')
}

export function QueueWaitCell({ row }: { row: QueueRow }) {
  const isWaiting = row.status === 'waiting'
  const joined = formatQueueClock(row.joined_at)

  return (
    <div className="queue-time-cell">
      <LiveWaitTimer
        startedAt={row.joined_at}
        endedAt={row.called_at}
        running={isWaiting}
        className={isWaiting ? 'live-wait-timer-hot' : ''}
      />
      {joined && (
        <span className="text-muted">
          {isWaiting ? `from ${joined}` : `joined ${joined}`}
        </span>
      )}
      {row.status === 'in_consultation' && row.called_at && (
        <span className="text-muted">in since {formatQueueClock(row.called_at)}</span>
      )}
    </div>
  )
}

type ActionsProps = {
  row: QueueRow
  busyId: number | null
  onCheckIn: (row: QueueRow) => void
  onCheckOut: (row: QueueRow) => void
  onCancel?: (row: QueueRow) => void
  showCancel?: boolean
  /** When false, hide consult checkout (receptionist). Default true for doctors. */
  allowCheckOut?: boolean
  checkInLabel?: string
  checkOutLabel?: string
  buttonClassName?: string
  primaryClassName?: string
  secondaryClassName?: string
}

export function QueueRowActions({
  row,
  busyId,
  onCheckIn,
  onCheckOut,
  onCancel,
  showCancel = false,
  allowCheckOut = true,
  checkInLabel = 'Check in',
  checkOutLabel = 'Check out',
  buttonClassName = 'btn btn-sm',
  primaryClassName = 'btn-primary',
  secondaryClassName = 'btn-success',
}: ActionsProps) {
  const busy = busyId === row.id
  const canIn = row.can_check_in ?? row.status === 'waiting'
  const canOut = allowCheckOut && (row.can_checkout ?? row.status === 'in_consultation')

  return (
    <div className="queue-row-actions">
      {canIn && (
        <button
          type="button"
          className={`${buttonClassName} ${primaryClassName}`.trim()}
          disabled={busy}
          onClick={() => onCheckIn(row)}
          title="Send patient in to the doctor"
        >
          {busy ? '…' : checkInLabel}
        </button>
      )}
      {canOut && (
        <button
          type="button"
          className={`${buttonClassName} ${secondaryClassName}`.trim()}
          disabled={busy}
          onClick={() => onCheckOut(row)}
          title="Patient finished with the doctor"
        >
          {busy ? '…' : checkOutLabel}
        </button>
      )}
      {row.status === 'in_consultation' && !allowCheckOut && (
        <span className="text-muted" title="Only the doctor ends the consult">
          With doctor
        </span>
      )}
      {showCancel && row.status === 'waiting' && onCancel && (
        <button
          type="button"
          className="btn btn-sm btn-danger"
          disabled={busy}
          onClick={() => onCancel(row)}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
