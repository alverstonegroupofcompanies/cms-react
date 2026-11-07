import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ANIMATION_CONFIG } from '../config/animations'

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface ScrollRevealOptions {
  direction?: RevealDirection
  distance?: number
  duration?: number
  delay?: number
  start?: string
  once?: boolean
  ease?: string
  selector?: string
}

/**
 * useScrollReveal
 * Scoped GSAP ScrollTrigger hook for smooth fade/slide reveals.
 * Automatically cleans up on unmount or route change via useGSAP.
 * Respects prefers-reduced-motion via gsap.matchMedia.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: ScrollRevealOptions = {}) {
  const containerRef = useRef<T>(null)

  useGSAP(
    () => {
      const root = containerRef.current
      if (!root || !ANIMATION_CONFIG.enabled) return

      const targets = options.selector ? root.querySelectorAll(options.selector) : root
      if (!targets) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isNormal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { isReduced } = context.conditions as { isReduced: boolean }

          if (isReduced) {
            gsap.from(targets, {
              opacity: 0,
              duration: options.duration ?? ANIMATION_CONFIG.duration.fast,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: options.start ?? ANIMATION_CONFIG.start,
                toggleActions: ANIMATION_CONFIG.toggleActions,
                once: options.once ?? true,
              },
            })
            return
          }

          const direction = options.direction ?? 'up'
          const dist = options.distance ?? ANIMATION_CONFIG.distance.md

          let x = 0
          let y = 0
          if (direction === 'up') y = dist
          else if (direction === 'down') y = -dist
          else if (direction === 'left') x = -dist
          else if (direction === 'right') x = dist

          gsap.from(targets, {
            opacity: 0,
            x,
            y,
            duration: options.duration ?? ANIMATION_CONFIG.duration.normal,
            delay: options.delay ?? 0,
            ease: options.ease ?? ANIMATION_CONFIG.ease,
            scrollTrigger: {
              trigger: root,
              start: options.start ?? ANIMATION_CONFIG.start,
              toggleActions: ANIMATION_CONFIG.toggleActions,
              once: options.once ?? true,
            },
          })
        }
      )
    },
    { scope: containerRef, dependencies: [options.direction, options.distance, options.delay, options.selector] }
  )

  return containerRef
}

export default useScrollReveal
