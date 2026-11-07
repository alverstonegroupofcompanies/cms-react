import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ANIMATION_CONFIG } from '../../config/animations'

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface RevealProps {
  children: React.ReactNode
  /** Direction of entry motion. Defaults to 'up'. */
  direction?: RevealDirection
  /** Distance in pixels for transform travel. Defaults to config distance. */
  distance?: number
  /** Duration in seconds. Defaults to config duration. */
  duration?: number
  /** Delay in seconds before animating once triggered. Defaults to 0. */
  delay?: number
  /** Soft stagger interval between children in seconds (e.g. 0.08). Defaults to 0. */
  stagger?: number
  /** Custom CSS classes */
  className?: string
  /** HTML element type to render. Defaults to 'div'. */
  as?: React.ElementType
  /** ScrollTrigger start offset. Defaults to 'top 85%'. */
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
 * Uses @gsap/react useGSAP with automatic scoped cleanup.
 * Strictly operates on transform and opacity for smooth 60fps performance without layout shifts.
 * Fully respects prefers-reduced-motion and server-side visibility.
 */
export default function Reveal({
  children,
  direction = 'up',
  distance,
  duration,
  delay = 0,
  stagger = 0,
  className = '',
  as: Component = 'div',
  start,
  once = true,
  style,
  id,
}: RevealProps) {
  const containerRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const el = containerRef.current
      if (!el || !ANIMATION_CONFIG.enabled) return

      const targets = stagger > 0 && el.children.length > 0 ? Array.from(el.children) : el
      const effDist = distance ?? ANIMATION_CONFIG.distance.md
      const effDuration = duration ?? ANIMATION_CONFIG.duration.normal
      const effStart = start ?? ANIMATION_CONFIG.start

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
              duration: effDuration,
              delay,
              stagger: stagger > 0 ? stagger : 0,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: effStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
                once,
              },
            })
            return
          }

          let xOffset = 0
          let yOffset = 0

          if (direction === 'up') yOffset = effDist
          else if (direction === 'down') yOffset = -effDist
          else if (direction === 'left') xOffset = -effDist
          else if (direction === 'right') xOffset = effDist

          gsap.from(targets, {
            opacity: 0,
            x: xOffset,
            y: yOffset,
            duration: effDuration,
            delay,
            stagger: stagger > 0 ? stagger : 0,
            ease: ANIMATION_CONFIG.ease,
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: el,
              start: effStart,
              toggleActions: ANIMATION_CONFIG.toggleActions,
              once,
            },
          })
        }
      )
    },
    { scope: containerRef, dependencies: [direction, distance, duration, delay, stagger, start, once] }
  )

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
