import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { smoothScrollToElement, scrollToTopInstant } from '../utils/scrollHelper'

/**
 * ScrollToTop ensures that whenever the user clicks any link,
 * redirects, or swaps between pages, the viewport immediately starts
 * at the very top of the new page.
 *
 * If a hash anchor is provided (e.g. #doctors, #specialties, #contact),
 * it smoothly scrolls to that specific section with Lenis support without snapping back to (0, 0).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Disable browser automatic scroll restoration so it doesn't fight the router
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // If navigation contains a hash target, scroll smoothly to that element
    if (hash) {
      const id = hash.replace(/^#/, '')
      const scrolled = smoothScrollToElement(id, 85)
      if (!scrolled) {
        // Retry after DOM settles for dynamically mounted elements
        const timer = window.setTimeout(() => {
          smoothScrollToElement(id, 85)
        }, 140)
        return () => window.clearTimeout(timer)
      }
      return
    }

    // Default behavior on page change: reset scroll to the very top (0, 0)
    scrollToTopInstant()

    // Also reset common scrollable layout containers if present
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '.ps-site, .ph-app, .ps-patient-page, .portal-main, main, #root'
    )
    scrollContainers.forEach((container) => {
      if (container && container.scrollTop > 0) {
        container.scrollTop = 0
      }
    })
  }, [pathname, search, hash])

  return null
}
