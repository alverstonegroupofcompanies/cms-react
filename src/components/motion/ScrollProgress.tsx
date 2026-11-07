import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ANIMATION_CONFIG } from '../../config/animations'

/**
 * ScrollProgress Component
 * Renders an ultra-subtle, GPU-accelerated progress line at the very top of the window
 * indicating scroll depth across the page without causing layout shifts.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const bar = barRef.current
      if (!bar || !ANIMATION_CONFIG.enabled) return

      const mm = gsap.matchMedia()
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isNormal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { isReduced } = context.conditions as { isReduced: boolean }
          if (isReduced) return

          gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.15,
            },
          })
        }
      )
    },
    { scope: barRef }
  )

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        ref={barRef}
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          background: 'linear-gradient(90deg, #8b1e2b 0%, #dc2626 60%, #fed7aa 100%)',
          boxShadow: '0 0 10px rgba(220, 38, 38, 0.45)',
        }}
      />
    </div>
  )
}

