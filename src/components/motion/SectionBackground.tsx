import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface SectionBackgroundProps {
  children: React.ReactNode
  /**
   * The calm, reassuring tint to apply when this section is in view.
   * E.g. '#ffffff', '#fafbfc', '#f8fafc'.
   */
  color: string
  /**
   * CSS selector for the element whose background should shift.
   * If omitted, transitions the section element itself.
   */
  targetSelector?: string
  /** Duration of the background transition in seconds. Defaults to 0.7. */
  duration?: number
  /** HTML tag for the wrapper. Defaults to 'section'. */
  as?: React.ElementType
  /** Custom CSS classes */
  className?: string
  /** Optional id attribute */
  id?: string
  /** Optional inline styles */
  style?: React.CSSProperties
}

/**
 * Reusable motion wrapper that softly shifts background tints between sections
 * as the user scrolls, creating a calm, high-end private hospital feel.
 */
export default function SectionBackground({
  children,
  color,
  targetSelector,
  duration = 0.7,
  as: Component = 'section',
  className = '',
  id,
  style,
}: SectionBackgroundProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetEl = targetSelector ? (document.querySelector(targetSelector) as HTMLElement | null) : el
    if (!targetEl) return

    if (prefersReducedMotion) {
      targetEl.style.backgroundColor = color
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          gsap.to(targetEl, {
            backgroundColor: color,
            duration,
            ease: 'power1.out',
            overwrite: 'auto',
          })
        },
        onEnterBack: () => {
          gsap.to(targetEl, {
            backgroundColor: color,
            duration,
            ease: 'power1.out',
            overwrite: 'auto',
          })
        },
      })
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [color, targetSelector, duration])

  return (
    <Component
      ref={sectionRef}
      id={id}
      className={`motion-section-bg ${className}`.trim()}
      style={{
        ...style,
        transition: 'background-color 600ms ease',
      }}
    >
      {children}
    </Component>
  )
}

