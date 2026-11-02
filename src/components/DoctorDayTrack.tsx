import type { DoctorAvailability } from '../api/types'
import {
  formatWorkingDaysSummary,
  getDoctorDayPills,
  getDoctorDayTrack,
} from '../utils/doctorAvailability'

interface Props {
  availability?: DoctorAvailability[] | null
  size?: 'sm' | 'md' | 'lg'
  showSummary?: boolean
  className?: string
}

export default function DoctorDayTrack({
  availability,
  size = 'md',
  showSummary = false,
  className = '',
}: Props) {
  const pills = getDoctorDayPills(availability)
  const track = getDoctorDayTrack(availability)
  const summary = formatWorkingDaysSummary(availability)

  return (
    <div
      className={`doc-day-track doc-day-track--${size} ${className}`.trim()}
      aria-label={`Working days: ${summary} (${track})`}
      title={`Weekly schedule: ${summary} [${track}]`}
    >
      <div className="doc-day-track-pills" role="list" aria-label="Available days">
        {pills.map((p, idx) => (
          <span
            key={`${p.day}-${idx}`}
            role="listitem"
            className={`doc-day-pill${p.available ? ' is-active' : ' is-off'}`}
            title={`${p.full} (${p.label}): ${p.available ? 'Available' : 'Unavailable'}`}
            aria-label={`${p.full}: ${p.available ? 'Available' : 'Unavailable'}`}
          >
            {p.available ? p.letter : '·'}
          </span>
        ))}
      </div>
      {showSummary && <span className="doc-day-track-summary">{summary}</span>}
    </div>
  )
}

