import { useEffect, useState } from 'react'

/** Format elapsed wait as mm:ss, or h:mm:ss after one hour. */
export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${mm}:${ss}`
  return `${mm}:${ss}`
}

/**
 * Live wait clock from when the patient joined the queue.
 * Runs every second while waiting; freezes at `endedAt` (e.g. called_at) afterward.
 */
export default function LiveWaitTimer({
  startedAt,
  endedAt,
  running = true,
  className = '',
}: {
  startedAt?: string | null
  /** When set (and not running), show wait until this time instead of now. */
  endedAt?: string | null
  running?: boolean
  className?: string
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running || !startedAt) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running, startedAt])

  if (!startedAt) return <span className={className || undefined}>—</span>

  const start = new Date(startedAt).getTime()
  if (Number.isNaN(start)) return <span className={className || undefined}>—</span>

  let end = now
  if (!running) {
    const stop = endedAt ? new Date(endedAt).getTime() : now
    end = Number.isNaN(stop) ? now : stop
  }

  return (
    <span className={`live-wait-timer ${className}`.trim()} title="Time waiting in queue">
      {formatElapsed(end - start)}
    </span>
  )
}
