import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ANIMATION_CONFIG } from '../../config/animations'

export interface CountUpProps {
  value?: number
  to?: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * CountUp Component
 * Animates numbers smoothly when entering the viewport using GSAP ScrollTrigger.
 * Safe fallback for prefers-reduced-motion and server/static rendering.
 */
export default function CountUp({
  value,
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
  className = '',
  style,
}: CountUpProps) {
  const targetValue = to ?? value ?? 0
  const spanRef = useRef<HTMLSpanElement>(null)
  const obj = useRef({ val: 0 })

  useGSAP(
    () => {
      const el = spanRef.current
      if (!el) return

      if (!ANIMATION_CONFIG.enabled) {
        el.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`
        return
      }

      const mm = gsap.matchMedia()
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isNormal: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { isReduced } = context.conditions as { isReduced: boolean }
          if (isReduced) {
            el.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`
            return
          }

          obj.current.val = 0
          gsap.to(obj.current, {
            val: targetValue,
            duration,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              once: true,
            },
            onUpdate: () => {
              if (el) {
                const formatted =
                  decimals > 0
                    ? obj.current.val.toFixed(decimals)
                    : Math.round(obj.current.val).toLocaleString()
                el.textContent = `${prefix}${formatted}${suffix}`
              }
            },
          })
        }
      )
    },
    { scope: spanRef, dependencies: [targetValue, duration] }
  )

  return (
    <span ref={spanRef} className={className} style={style}>
      {prefix}{targetValue.toLocaleString()}{suffix}
    </span>
  )
}
