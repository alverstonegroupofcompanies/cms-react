import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IconCalendar } from '../Icons'

export interface StickyCTAProps {
  /** Target route when clicked. Defaults to '/patient/book' */
  to?: string
  /** Button label. Defaults to 'Book Appointment' */
  label?: string
  /** Scroll position (in px) before CTA reveals. Defaults to 500px. */
  threshold?: number
}

/**
 * StickyCTA
 * Reassuring floating action pill that smoothly slides up after the user scrolls
 * past the hero section. Kept unobtrusive, high z-index, and never obstructs critical info.
 */
export default function StickyCTA({
  to = '/patient/book',
  label = 'Book Appointment',
  threshold = 500,
}: StickyCTAProps) {
  const [visible, setVisible] = useState(false)
  const location = useLocation()

  // Do not show on booking or registration pages to avoid redundant clutter
  const isExcludedPage =
    location.pathname.includes('/book') ||
    location.pathname.includes('/login') ||
    location.pathname.includes('/register')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onScroll = () => {
      const heroEl = document.querySelector('.btr-section') || document.querySelector('.ps-page-hero')
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect()
        // Appears smoothly right as the hero completes scrolling out of view
        setVisible(rect.bottom <= 120)
      } else {
        const scrollY = window.scrollY || document.documentElement.scrollTop
        setVisible(scrollY > threshold)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Initial check

    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, location.pathname])

  if (isExcludedPage) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="ps-sticky-cta-container"
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={to}
            className="ps-sticky-cta-btn"
            aria-label={`${label} - Fast online registration and time-slot selection`}
          >
            <span className="ps-sticky-cta-icon" aria-hidden="true">
              <IconCalendar size={18} />
            </span>
            <span className="ps-sticky-cta-label">{label}</span>
            <span className="ps-sticky-cta-arrow" aria-hidden="true">→</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

