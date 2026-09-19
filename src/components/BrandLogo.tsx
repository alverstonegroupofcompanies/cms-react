import { Link } from 'react-router-dom'

type Props = {
  to?: string
  height?: number
  variant?: 'full' | 'compact'
  className?: string
  /** Dark surfaces (black header, heroes, sidebar, footer) */
  onDark?: boolean
  /**
   * `suite` — Lam H Suite mark for staff portals (default).
   * `clinic` — Alverstone Medcity logo for patient website & portal.
   */
  brand?: 'suite' | 'clinic'
  /** Optional line under the wordmark (e.g. "Clinic operations") */
  caption?: string
}

const SUITE_NAME = 'Lam H Suite'
const CLINIC_NAME = 'Alverstone Medcity'

export default function BrandLogo({
  to,
  height = 40,
  variant = 'full',
  className = '',
  onDark = false,
  brand = 'suite',
  caption,
}: Props) {
  if (brand === 'clinic') {
    const src = onDark
      ? '/brand/alverstone-medcity-logo-white.png?v=2'
      : '/brand/alverstone-medcity-logo.png?v=2'

    const img = (
      <img
        src={src}
        alt={CLINIC_NAME}
        className={`brand-logo-img${onDark ? ' brand-logo-on-dark' : ' brand-logo-on-light'}${variant === 'compact' ? ' brand-logo-compact' : ''}`}
        style={{ height, width: 'auto' }}
        decoding="async"
      />
    )

    if (to) {
      return (
        <Link to={to} className={`brand-logo-link ${className}`.trim()} aria-label={CLINIC_NAME}>
          {img}
        </Link>
      )
    }

    return <span className={`brand-logo ${className}`.trim()}>{img}</span>
  }

  const compact = variant === 'compact'
  const markH = compact ? Math.max(28, height * 0.85) : Math.max(34, height * 0.92)
  const mono = Math.round(markH * 0.42)

  const mark = (
    <span
      className={`brand-mark${onDark ? ' brand-mark-on-dark' : ' brand-mark-on-light'}${compact ? ' brand-mark-compact' : ''}`}
      style={{ ['--brand-h' as string]: `${markH}px`, ['--brand-mono' as string]: `${mono}px` }}
    >
      <span className="brand-mark-badge" aria-hidden>
        <span className="brand-mark-badge-l">L</span>
        <span className="brand-mark-badge-h">H</span>
      </span>
      <span className="brand-mark-text">
        <span className="brand-mark-title">
          Lam H <em>Suite</em>
        </span>
        {caption && <span className="brand-mark-caption">{caption}</span>}
      </span>
    </span>
  )

  if (to) {
    return (
      <Link to={to} className={`brand-logo-link ${className}`.trim()} aria-label={SUITE_NAME}>
        {mark}
      </Link>
    )
  }

  return <span className={`brand-logo ${className}`.trim()}>{mark}</span>
}
