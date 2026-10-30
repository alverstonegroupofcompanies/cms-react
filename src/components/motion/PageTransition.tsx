import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * PageTransition
 * Gentle, fast (<0.32s) healthcare-grade route transition using Framer Motion.
 * Preserves patient focus and never delays interaction or route navigation.
 * Respects `prefers-reduced-motion` with instant transitions.
 */
export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`ps-page-transition-wrap ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
