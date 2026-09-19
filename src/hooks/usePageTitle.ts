import { useEffect } from 'react'

const SUITE_BRAND = 'Lam H Suite'
const CLINIC_BRAND = 'Alverstone Medcity'

/**
 * Sets the browser tab title for the current page.
 * Patient section uses Alverstone Medcity; staff portals use Lam H Suite.
 * Example: "Doctor Dashboard · Doctor | Lam H Suite"
 */
export function usePageTitle(pageTitle: string, section?: string) {
  useEffect(() => {
    const previous = document.title
    const brand = section === 'Patient' ? CLINIC_BRAND : SUITE_BRAND
    const parts = [pageTitle.trim(), section?.trim()].filter(Boolean)
    document.title = parts.length ? `${parts.join(' · ')} | ${brand}` : brand
    return () => {
      document.title = previous
    }
  }, [pageTitle, section])
}

export function portalLabel(role?: string | null): string {
  switch (role) {
    case 'patient':
      return 'Patient'
    case 'doctor':
      return 'Doctor'
    case 'receptionist':
      return 'Reception'
    case 'admin':
      return 'Admin'
    case 'pharmacy':
      return 'Pharmacy'
    case 'lab':
      return 'Lab'
    default:
      return 'Portal'
  }
}
