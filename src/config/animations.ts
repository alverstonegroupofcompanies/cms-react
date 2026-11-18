import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger once centrally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)

  // Recalibrate trigger positions once images, fonts, and stylesheets settle
  window.addEventListener('load', () => {
    ScrollTrigger.refresh()
  })

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }

  // Periodic recalculation as asynchronous images, cards, and components finish rendering
  ;[300, 800, 1600, 3000].forEach((delay) => {
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, delay)
  })
}

/**
 * Global Animation Configuration for Alverstone Medcity.
 * Tweak duration, distance, and ease centrally here.
 * Set enabled to false to instantly disable all scroll animations site-wide.
 */
export const ANIMATION_CONFIG = {
  // Master toggle: set to false to completely disable animations
  enabled: true,

  // Snappy, modern durations in seconds (no sluggish or delayed feel)
  duration: {
    fast: 0.38,
    normal: 0.52,
    slow: 0.72,
  },

  // Travel distances in pixels (subtle, non-jarring movements)
  distance: {
    sm: 14,
    md: 24,
    lg: 38,
  },

  // Fluid high-friction easing curve: fast responsive start, soft landing
  ease: 'power3.out',

  // Viewport trigger threshold: triggers right as the element enters comfortable view
  start: 'top 78%',

  // Play once when scrolled into view without repeating
  toggleActions: 'play none none none',

  // Stagger delays for card grids
  stagger: {
    fast: 0.04,
    normal: 0.06,
    slow: 0.1,
  },
} as const

export { gsap, ScrollTrigger }
export default ANIMATION_CONFIG

