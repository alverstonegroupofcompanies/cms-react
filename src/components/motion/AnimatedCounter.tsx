import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface AnimatedCounterProps {
  /** Target numeric value to count up to */
  value: number
  /** Initial numeric value. Defaults to 0. */
  from?: number
  /** Duration in seconds. Defaults to 1.6 (smooth, calm pacing). */
  duration?: number
  /** Number of decimal places. Defaults to 0. */
  decimals?: number
  /** Text prefix (e.g. '$' or '') */
  prefix?: string
  /** Text suffix (e.g. '+', 'k', '%', ' Yrs') */
  suffix?: string
  /** Formatter for thousands separator (e.g. 45,000). Defaults to true. */
  formatThousands?: boolean
  /** Custom CSS classes */
  className?: string
}

/**
 * Reusable animated numeric counter for clinical statistics.
 * Uses GSAP ScrollTrigger to count up smoothly when scrolled into view.
 * Respects `prefers-reduced-motion` by displaying final values immediately.
 */
export default function AnimatedCounter({
  value,
  from = 0,
  duration = 1.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatThousands = true,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(from)
  const elementRef = useRef<HTMLSpanElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el || typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const obj = { val: from }

    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(obj, {
        val: value,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 72%',
          once: true,
        },
        onUpdate: () => {
          setDisplayValue(obj.val)
        },
      })
    }, elementRef)

    return () => {
      ctx.revert()
    }
  }, [value, from, duration])

  const formattedNum = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString()

  const finalString = formatThousands
    ? formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : formattedNum

  return (
    <span
      ref={elementRef}
      className={`motion-counter ${className}`.trim()}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}{finalString}{suffix}
    </span>
  )
}

