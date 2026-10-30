import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface RevealProps {
  children: React.ReactNode
  /** Direction of entry motion. Defaults to 'up'. */
  direction?: RevealDirection
  /** Distance in pixels for transform travel. Defaults to 32. */
  distance?: number
  /** Duration in seconds. Defaults to 0.9 (calm, reassuring ease). */
  duration?: number
  /** Delay in seconds before animating once triggered. Defaults to 0. */
  delay?: number
  /** Soft stagger interval between children in seconds (e.g. 0.08). Defaults to 0. */
  stagger?: number
  /** Custom CSS classes */
  className?: string
  /** HTML element type to render. Defaults to 'div'. */
  as?: React.ElementType
  /** ScrollTrigger start offset. Defaults to 'top 70%' (triggers as element approaches halfway into view). */
  start?: string
  /** Whether to trigger only once. Defaults to true. */
  once?: boolean
  /** Inline style overrides */
  style?: React.CSSProperties
  /** Optional id attribute */
  id?: string
}

/**
 * Premium, medical-grade scroll reveal component.
 * Uses GSAP ScrollTrigger to fade and glide elements gently into view.
 * Calibrated to trigger midway into the viewport ('top 70%') so patients cleanly perceive the motion.
 * Strictly operates on `opacity` and `transform` for 60fps performance.
 * Respects `prefers-reduced-motion` and ensures zero layout shifts or blocked interactions.
 */
export default function Reveal({
  children,
  direction = 'up',
  distance = 32,
  duration = 0.9,
  delay = 0,
  stagger = 0,
  className = '',
  as: Component = 'div',
  start = 'top 70%',
  once = true,
  style,
  id,
}: RevealProps) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined') return

    // Immediately show without motion if reduced-motion is requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    // Determine coordinate delta
    let xOffset = 0
    let yOffset = 0

    if (direction === 'up') yOffset = distance
    else if (direction === 'down') yOffset = -distance
    else if (direction === 'left') xOffset = distance
    else if (direction === 'right') xOffset = -distance

    const targets = stagger > 0 && el.children.length > 0 ? Array.from(el.children) : el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          x: xOffset,
          y: yOffset,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          stagger: stagger > 0 ? stagger : 0,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: el,
            start,
            once,
          },
        },
      )
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [direction, distance, duration, delay, stagger, start, once])

  return (
    <Component
      ref={containerRef}
      id={id}
      className={`motion-reveal ${className}`.trim()}
      style={style}
    >
      {children}
    </Component>
  )
}

