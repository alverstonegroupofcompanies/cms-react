import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export interface FloatingMotifsProps {
  /** Optional container class */
  className?: string
  /** Density of motifs: 'minimal' (3-4) | 'standard' (6-8) */
  density?: 'minimal' | 'standard'
}

/**
 * FloatingMotifs
 * Subtle, drifting clinical decorative motifs (soft medical crosses and rings)
 * with gentle floating physics and desktop-only cursor parallax.
 * Strictly non-interactive (pointer-events: none) and aria-hidden for accessibility.
 */
export default function FloatingMotifs({
  className = '',
  density = 'minimal',
}: FloatingMotifsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const elements = container.querySelectorAll<HTMLElement>('.ps-floating-item')

    const ctx = gsap.context(() => {
      // Gentle vertical and rotational drift
      elements.forEach((el, i) => {
        const floatDuration = 4.5 + (i % 3) * 1.2
        const floatDistance = 12 + (i % 4) * 4
        const rotateAngle = (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 4)

        gsap.to(el, {
          y: `-=${floatDistance}`,
          rotation: `+=${rotateAngle}`,
          duration: floatDuration,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.4,
        })
      })

      // Light cursor parallax on desktop only
      if (isDesktopPointer) {
        let mouseX = 0
        let mouseY = 0
        let currentX = 0
        let currentY = 0
        let rafId: number | null = null

        const onMouseMove = (e: MouseEvent) => {
          const { innerWidth, innerHeight } = window
          mouseX = (e.clientX / innerWidth - 0.5) * 2 // -1 to 1
          mouseY = (e.clientY / innerHeight - 0.5) * 2 // -1 to 1
        }

        const tick = () => {
          currentX += (mouseX - currentX) * 0.05
          currentY += (mouseY - currentY) * 0.05

          elements.forEach((el, i) => {
            const depth = 8 + (i % 3) * 10
            gsap.set(el, {
              x: currentX * depth,
              overwrite: 'auto',
            })
          })

          rafId = requestAnimationFrame(tick)
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true })
        rafId = requestAnimationFrame(tick)

        return () => {
          window.removeEventListener('mousemove', onMouseMove)
          if (rafId) cancelAnimationFrame(rafId)
        }
      }
    }, container)

    return () => ctx.revert()
  }, [density])

  const count = density === 'minimal' ? 4 : 7

  return (
    <div
      ref={containerRef}
      className={`ps-floating-motifs-container ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isCross = i % 2 === 0
        return (
          <span
            key={i}
            className={`ps-floating-item ps-floating-item-${i} ${isCross ? 'is-cross' : 'is-ring'}`}
          >
            {isCross ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}

