type SourceLike = string | null | undefined

function normalizeSource(source: SourceLike): 'walk_in' | 'booked' | null {
  if (!source) return null
  const key = source.toLowerCase()
  if (key === 'walk_in' || key === 'walk-in') return 'walk_in'
  if (key === 'online' || key === 'scheduled' || key === 'booked') return 'booked'
  return null
}

/** Small visit-origin chip: Walk-in vs Booked appointment. */
export default function VisitSourceBadge({
  source,
  className = '',
}: {
  source?: SourceLike
  className?: string
}) {
  const kind = normalizeSource(source)
  if (!kind) return null

  if (kind === 'walk_in') {
    return (
      <span className={`visit-source visit-source-walkin ${className}`.trim()} title="Walk-in">
        Walk-in
      </span>
    )
  }

  return (
    <span className={`visit-source visit-source-booked ${className}`.trim()} title="Booked appointment">
      Booked
    </span>
  )
}
