/**
 * High-performance, Lenis-compatible smooth scroll utility.
 * Guarantees that scrolling to any section (e.g. #doctors, #specialties, #services, #contact)
 * updates Lenis virtual scroll state properly and never snaps or rebounds to the top of the page.
 */

declare global {
  interface Window {
    __lenis?: {
      scrollTo: (target: HTMLElement | string | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void
      scroll?: number
      targetScroll?: number
    }
  }
}

/**
 * Smoothly scrolls to an element by id or reference, accounting for the fixed navbar height (85px).
 * Uses active Lenis smooth scroll engine when available to avoid ScrollTrigger conflict.
 */
export function smoothScrollToElement(
  target: HTMLElement | string,
  offset = 85
): boolean {
  if (typeof window === 'undefined') return false

  const el = typeof target === 'string' ? document.getElementById(target.replace(/^#/, '')) : target
  if (!el) return false

  const lenis = window.__lenis
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(el, { offset: -offset, duration: 1.15 })
    return true
  }

  const top = el.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  return true
}

/**
 * Resets the scroll position immediately to the top of the page.
 */
export function scrollToTopInstant(): void {
  if (typeof window === 'undefined') return

  const lenis = window.__lenis
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(0, { immediate: true })
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  if (document.documentElement) document.documentElement.scrollTop = 0
  if (document.body) document.body.scrollTop = 0
}
