import React, { useEffect, useRef, useId } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface SplitTextProps {
  children: React.ReactNode
  /** HTML tag for the headline wrapper. Defaults to 'h2'. */
  as?: React.ElementType
  /** Custom CSS classes */
  className?: string
  /** Delay in seconds before word reveal starts once in view. Defaults to 0.05. */
  delay?: number
  /** Duration of each word glide in seconds. Defaults to 0.82 (calm and reassuring). */
  duration?: number
  /** Stagger interval in seconds between words. Defaults to 0.04. */
  stagger?: number
  /** Distance in pixels words slide up from. Defaults to 22. */
  distance?: number
  /** ScrollTrigger trigger offset. Defaults to 'top 70%' (triggers midway into view). */
  start?: string
  /** Whether the animation runs only once. Defaults to true. */
  once?: boolean
  /** Optional element ID */
  id?: string
  /** Optional inline styles */
  style?: React.CSSProperties
}

/**
 * Splits text into words while preserving React children (including nested spans/gradient pills).
 */
function splitIntoWords(node: React.ReactNode, keyPrefix = 'w'): React.ReactNode {
  if (typeof node === 'string') {
    const words = node.split(/(\s+)/)
    return words.map((chunk, i) => {
      if (/^\s+$/.test(chunk)) {
        return chunk // preserve spaces
      }
      return (
        <span
          key={`${keyPrefix}-${i}`}
          className="motion-word-wrap"
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
        >
          <span
            className="motion-word"
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {chunk}
          </span>
        </span>
      )
    })
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode; className?: string }>
    // If element is a gradient span or badge, preserve it as a unified reveal unit so background-clip: text is never broken
    if (element.props?.className && typeof element.props.className === 'string' && element.props.className.includes('gradient')) {
      return (
        <span
          key={element.key || keyPrefix}
          className="motion-word-wrap"
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
        >
          <span
            className="motion-word"
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {element}
          </span>
        </span>
      )
    }
    if (!element.props || !element.props.children) {
      return node
    }
    return React.cloneElement(
      element,
      { key: element.key || keyPrefix },
      splitIntoWords(element.props.children, `${keyPrefix}-nested`)
    )
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => splitIntoWords(child, `${keyPrefix}-${i}`))
  }

  return node
}

/**
 * Premium, medical-grade headline reveal component.
 * Reveals headlines word-by-word with a soft, confident slide-and-fade.
 * Calibrated specifically for healthcare (never gimmicky character-by-character).
 * Fully accessible to screen readers and respects `prefers-reduced-motion`.
 */
export default function SplitText({
  children,
  as: Component = 'h2',
  className = '',
  delay = 0.05,
  duration = 0.82,
  stagger = 0.04,
  distance = 22,
  start = 'top 70%',
  once = true,
  id,
  style,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const autoKey = useId()

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof window === 'undefined') return

    // Accessibility check: immediately show if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const words = el.querySelectorAll<HTMLElement>('.motion-word')
      words.forEach((w) => {
        w.style.opacity = '1'
        w.style.transform = 'none'
      })
      return
    }

    const words = el.querySelectorAll<HTMLElement>('.motion-word')
    if (!words.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          opacity: 0,
          y: distance,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: el,
            start,
            once,
          },
        }
      )
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [delay, duration, stagger, distance, start, once])

  const parsedChildren = splitIntoWords(children, autoKey)

  return (
    <Component
      ref={containerRef}
      id={id}
      className={`motion-split-text ${className}`.trim()}
      style={style}
    >
      {parsedChildren}
    </Component>
  )
}
