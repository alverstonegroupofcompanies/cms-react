import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export interface ExpandableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Unique layout ID for Framer Motion shared layout transition. If omitted, uses src. */
  layoutId?: string
  /** Caption displayed under the expanded image */
  caption?: string
  /** Wrapper CSS class */
  wrapperClassName?: string
}

/**
 * ExpandableImage
 * Wraps an image so clicking it expands into an accessible, full-screen lightbox
 * with Framer Motion `layoutId` spring morphing, ESC dismissal, backdrop blur,
 * and focus trapping.
 */
export default function ExpandableImage({
  src,
  alt = '',
  layoutId,
  caption,
  className = '',
  wrapperClassName = '',
  ...rest
}: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const id = layoutId || `exp-img-${src || 'image'}`

  // ESC key handler and focus management
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Focus close button on open
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 50)

    // Lock body scroll gently while modal is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
      clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={`ps-expandable-img-trigger ${wrapperClassName}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Enlarge photo: ${alt || 'Medical facility image'}`}
      >
        <motion.img
          layoutId={id}
          src={src}
          alt={alt}
          className={className}
          {...(rest as any)}
        />
        <span className="ps-expandable-badge" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </span>
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                className="ps-lightbox-overlay"
                role="dialog"
                aria-modal="true"
                aria-label={alt || 'Enlarged photo view'}
                onClick={() => {
                  setIsOpen(false)
                  triggerRef.current?.focus()
                }}
              >
                <motion.div
                  className="ps-lightbox-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                />

                <div
                  className="ps-lightbox-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.img
                    layoutId={id}
                    src={src}
                    alt={alt}
                    className="ps-lightbox-img"
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />

                  {caption && (
                    <motion.p
                      className="ps-lightbox-caption"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                    >
                      {caption}
                    </motion.p>
                  )}

                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }}
                    className="ps-lightbox-close-btn"
                    aria-label="Close enlarged photo"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

