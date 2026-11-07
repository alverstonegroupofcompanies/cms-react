import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, ANIMATION_CONFIG } from '../config/animations'

export interface StaggerRevealOptions {
  selector?: string
  distance?: number
  duration?: number
  stagger?: number
  start?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

/**
 * useStaggerReveal
 * Scoped GSAP ScrollTrigger hook for card grids, services, and multi-element lists.
 * Utilizes ScrollTrigger.batch() with stagger for GPU-accelerated reveals.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(options: StaggerRevealOptions = {}) {
  const containerRef = useRef<T>(null)

  useGSAP(
    () => {
      const container = containerRef.current
      if (!container || !ANIMATION_CONFIG.enabled) return

      const targets = options.selector
        ? Array.from(container.querySelectorAll(options.selector))
        : Array.from(container.children)

      if (!targets.length) return

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
              stagger: options.stagger ?? ANIMATION_CONFIG.stagger.fast,
              scrollTrigger: {
                trigger: container,
                start: options.start ?? ANIMATION_CONFIG.start,
                toggleActions: ANIMATION_CONFIG.toggleActions,
                once: true,
              },
            })
            return
          }

          const dist = options.distance ?? ANIMATION_CONFIG.distance.md
          const dir = options.direction ?? 'up'
          let x = 0
          let y = 0
          if (dir === 'up') y = dist
          else if (dir === 'down') y = -dist
          else if (dir === 'left') x = dist
          else if (dir === 'right') x = -dist

          ScrollTrigger.batch(targets, {
            start: options.start ?? ANIMATION_CONFIG.start,
            once: true,
            onEnter: (batch) => {
              gsap.from(batch, {
                opacity: 0,
                x,
                y,
                duration: options.duration ?? ANIMATION_CONFIG.duration.normal,
                stagger: options.stagger ?? ANIMATION_CONFIG.stagger.normal,
                ease: ANIMATION_CONFIG.ease,
                overwrite: 'auto',
              })
            },
          })
        }
      )
    },
    { scope: containerRef, dependencies: [options.selector, options.distance, options.stagger, options.direction] }
  )

  return containerRef
}

export default useStaggerReveal

