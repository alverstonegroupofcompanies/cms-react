import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop ensures that whenever the user clicks any link,
 * redirects, or swaps between pages, the viewport immediately starts
 * at the very top of the new page.
 *
 * If a hash anchor is provided (e.g. #contact), it smoothly scrolls to
 * that specific section instead.
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
    // If navigation contains a hash target, scroll to that element
    if (hash) {
      const id = hash.replace(/^#/, '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      // Retry after DOM settles for dynamically mounted elements
      const timer = window.setTimeout(() => {
        const delayedEl = document.getElementById(id)
        if (delayedEl) {
          delayedEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 120)
      return () => window.clearTimeout(timer)
    }

    // Default behavior on page change: reset scroll to the very top (0, 0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })

    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }

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
