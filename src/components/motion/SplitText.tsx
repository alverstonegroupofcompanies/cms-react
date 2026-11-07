import React, { useRef, useId } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ANIMATION_CONFIG } from '../../config/animations'

export interface SplitTextProps {
  children: React.ReactNode
  /** HTML tag for the headline wrapper. Defaults to 'h2'. */
  as?: React.ElementType
  /** Custom CSS classes */
  className?: string
  /**
   * Split mode:
   * - 'words': Reveals word-by-word with a soft, confident slide-and-fade (default)
   * - 'chars': Reveals letter-by-letter with a crisp, fluid staggered glide
   * - 'typewriter': Reveals letter-by-letter mimicking a mechanical/digital typing pace
   */
  by?: 'words' | 'chars' | 'typewriter'
  /** Delay in seconds before reveal starts once in view. Defaults to 0.05. */
  delay?: number
  /** Duration of each unit's reveal in seconds. */
  duration?: number
  /** Stagger interval in seconds between words or characters. */
  stagger?: number
  /** Distance in pixels words or letters slide up from. */
  distance?: number
  /** ScrollTrigger trigger offset. Defaults to config start ('top 85%'). */
  start?: string
  /** Whether the animation runs only once. Defaults to true. */
  once?: boolean
  /** Whether to render a sleek blinking typing caret/cursor at the end of the text. */
  cursor?: boolean
  /** Optional element ID */
  id?: string
  /** Optional inline styles */
  style?: React.CSSProperties
}

/**
 * Extracts plain text from React nodes for screen reader accessibility (aria-label).
 */
function extractPlainText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractPlainText).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return el.props.children ? extractPlainText(el.props.children) : ''
  }
  return ''
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
    const isSpecialSpan =
      typeof element.props.className === 'string' &&
      (element.props.className.includes('gradient') ||
        element.props.className.includes('accent') ||
        element.props.className.includes('badge') ||
        element.props.className.includes('pill'))

    if (isSpecialSpan) {
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

    if (!element.props.children) {
      return element
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
 * Splits text into word containers with individual character spans for letter-by-letter / typing animations.
 * Preserves word bounds with whiteSpace: nowrap so line breaks never snap in the middle of a word.
 */
function splitIntoChars(node: React.ReactNode, keyPrefix = 'c'): React.ReactNode {
  if (typeof node === 'string') {
    const words = node.split(/(\s+)/)
    return words.map((chunk, i) => {
      if (/^\s+$/.test(chunk)) {
        return chunk // natural space between words
      }
      const chars = Array.from(chunk)
      return (
        <span
          key={`${keyPrefix}-${i}`}
          className="motion-word-wrap"
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {chars.map((char, j) => (
            <span
              key={`${keyPrefix}-${i}-c${j}`}
              className="motion-char"
              style={{
                display: 'inline-block',
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </span>
          ))}
        </span>
      )
    })
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode; className?: string }>
    if (!element.props.children) {
      return element
    }
    return React.cloneElement(
      element,
      { key: element.key || keyPrefix },
      splitIntoChars(element.props.children, `${keyPrefix}-nested`)
    )
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => splitIntoChars(child, `${keyPrefix}-${i}`))
  }

  return node
}

/**
 * Premium headline reveal component powered by GSAP + ScrollTrigger.
 * Supports:
 * - Word-by-word reveal (default)
 * - Letter-by-letter fluid staggered reveal ('chars')
 * - Typewriter staggered cadence ('typewriter')
 * - Optional blinking caret cursor
 * - Fully accessible with aria-label & respects `prefers-reduced-motion`
 */
export default function SplitText({
  children,
  as: Component = 'h2',
  className = '',
  by = 'words',
  delay = 0.05,
  duration,
  stagger,
  distance,
  start,
  once = true,
  cursor = false,
  id,
  style,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const autoKey = useId()
  const plainText = extractPlainText(children)

  const isCharMode = by === 'chars' || by === 'typewriter'
  const effDuration = duration ?? (isCharMode ? (by === 'typewriter' ? 0.05 : 0.45) : ANIMATION_CONFIG.duration.normal)
  const effStagger = stagger ?? (isCharMode ? (by === 'typewriter' ? 0.045 : 0.026) : 0.04)
  const effDistance = distance ?? (isCharMode ? (by === 'typewriter' ? 0 : 12) : 22)
  const effStart = start ?? ANIMATION_CONFIG.start

  useGSAP(
    () => {
      const el = containerRef.current
      if (!el || !ANIMATION_CONFIG.enabled) return

      const targets = isCharMode
        ? el.querySelectorAll<HTMLElement>('.motion-char')
        : el.querySelectorAll<HTMLElement>('.motion-word')

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
            targets.forEach((t) => {
              t.style.opacity = '1'
              t.style.transform = 'none'
            })
            return
          }

          if (by === 'typewriter') {
            gsap.fromTo(
              targets,
              { opacity: 0, y: 3 },
              {
                opacity: 1,
                y: 0,
                duration: effDuration,
                delay,
                stagger: effStagger,
                ease: 'none',
                clearProps: 'transform',
                scrollTrigger: {
                  trigger: el,
                  start: effStart,
                  toggleActions: ANIMATION_CONFIG.toggleActions,
                  once,
                },
              }
            )
          } else if (by === 'chars') {
            gsap.from(targets, {
              opacity: 0,
              y: effDistance,
              rotateX: -30,
              transformOrigin: '50% 100%',
              duration: effDuration,
              delay,
              stagger: effStagger,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: effStart,
                toggleActions: ANIMATION_CONFIG.toggleActions,
                once,
              },
            })
          } else {
            // Words mode
            gsap.from(targets, {
              opacity: 0,
              y: effDistance,
              duration: effDuration,
              delay,
              stagger: effStagger,
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
        }
      )
    },
    {
      scope: containerRef,
      dependencies: [by, isCharMode, delay, effDuration, effStagger, effDistance, effStart, once],
    }
  )

  return (
    <Component
      ref={containerRef}
      id={id}
      aria-label={plainText || undefined}
      className={`motion-split-text ${className}`.trim()}
      style={style}
    >
      {isCharMode ? splitIntoChars(children, autoKey) : splitIntoWords(children, autoKey)}
      {cursor && (
        <span className="motion-typewriter-cursor" aria-hidden="true">
          |
        </span>
      )}
    </Component>
  )
}
