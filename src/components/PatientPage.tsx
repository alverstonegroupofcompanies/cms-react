import type { ReactNode } from 'react'
import PatientLayout from './PatientLayout'
import { usePageTitle } from '../hooks/usePageTitle'

interface Props {
  title: string
  /** Small line above the title (homepage-style kicker). */
  kicker?: string
  subtitle?: string
  /** Right-side action(s), e.g. primary CTA — same slot as homepage “Book a visit”. */
  actions?: ReactNode
  /** @deprecated Photo banners removed to match the light home design. Kept for call-site compatibility. */
  banner?: 'book' | 'labs' | 'care'
  children: ReactNode
}

function TitleWithAccent({ title }: { title: string }) {
  const parts = title.trim().split(/\s+/)
  if (parts.length < 2) return <>{title}</>
  const last = parts.pop()!
  return (
    <>
      {parts.join(' ')} <span className="ph-title-accent">{last}</span>
    </>
  )
}

export default function PatientPage({ title, kicker, subtitle, actions, children }: Props) {
  usePageTitle(title, 'Patient')

  return (
    <PatientLayout>
      <div className="ph-page ph-page-home">
        <header className="ph-home-welcome ph-page-welcome">
          <div>
            {kicker && <p className="ph-home-kicker">{kicker}</p>}
            <h1 className="ph-home-title">
              <TitleWithAccent title={title} />
            </h1>
            {subtitle && <p className="ph-page-lead">{subtitle}</p>}
          </div>
          {actions && <div className="ph-page-actions">{actions}</div>}
        </header>
        <div className="ph-page-body">{children}</div>
      </div>
    </PatientLayout>
  )
}
