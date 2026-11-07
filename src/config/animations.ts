import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger once centrally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Global Animation Configuration for Alverstone Medcity.
 * Tweak duration, distance, and ease centrally here.
 * Set enabled to false to instantly disable all scroll animations site-wide.
 */
export const ANIMATION_CONFIG = {
  // Master toggle: set to false to completely disable animations
  enabled: true,

  // Speed & durations in seconds
  duration: {
    fast: 0.6,
    normal: 0.85,
    slow: 1.0,
  },

  // Travel distances in pixels (subtle, non-jarring movements)
  distance: {
    sm: 20,
    md: 35,
    lg: 50,
  },

  // Smooth medical-grade easing curve (no bouncy or flashy overshoot)
  ease: 'power2.out',

  // Viewport trigger threshold: triggers as element reaches 85% into viewport
  start: 'top 85%',

  // Play once when scrolled into view without repeating
  toggleActions: 'play none none none',

  // Stagger delays for card grids
  stagger: {
    fast: 0.06,
    normal: 0.09,
    slow: 0.14,
  },
} as const

export { gsap, ScrollTrigger }
export default ANIMATION_CONFIG

