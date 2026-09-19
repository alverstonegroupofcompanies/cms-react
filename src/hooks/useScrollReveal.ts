import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll-only reveals for `[data-reveal]`.
 * Animations start only when the element is in view — not while it is still below the fold.
 * Use `data-reveal="hero"` (or `"immediate"`) for first-screen content that may animate on load.
 */
export function useScrollReveal(rootSelector = '.ps-site') {
  const { pathname } = useLocation()

  useEffect(() => {
    const root = document.querySelector(rootSelector)
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!nodes.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((el) => el.classList.add('is-visible'))
      return
    }

    nodes.forEach((el) => el.classList.remove('is-visible'))

    let userScrolled = window.scrollY > 12
    const pending = new Set<Element>()

    const reveal = (el: Element, observer: IntersectionObserver) => {
      el.classList.add('is-visible')
      pending.delete(el)
      observer.unobserve(el)
    }

    const isHero = (el: Element) => {
      const mode = (el as HTMLElement).dataset.reveal
      return mode === 'hero' || mode === 'immediate'
    }

    const inViewEnough = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting && entry.intersectionRatio >= 0.18

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!inViewEnough(entry)) return

          const el = entry.target
          // Hold below-the-fold / mid-viewport items until the user actually scrolls
          if (!isHero(el) && !userScrolled) {
            pending.add(el)
            return
          }
          reveal(el, observer)
        })
      },
      {
        threshold: [0, 0.18, 0.35, 0.5],
        rootMargin: '0px 0px -14% 0px',
      },
    )

    const flushPending = () => {
      if (!userScrolled) return
      pending.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const vh = window.innerHeight
        const visible =
          rect.top < vh * 0.86 &&
          rect.bottom > vh * 0.12 &&
          rect.height > 0
        if (visible) reveal(el, observer)
      })
    }

    const onScroll = () => {
      if (window.scrollY <= 12) return
      userScrolled = true
      flushPending()
      window.removeEventListener('scroll', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    const frame = requestAnimationFrame(() => {
      nodes.forEach((el) => observer.observe(el))
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      pending.clear()
    }
  }, [pathname, rootSelector])
}
