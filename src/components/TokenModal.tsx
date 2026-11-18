import { useEffect } from 'react'
import PrintableTokenSlip, { type TokenData } from './PrintableTokenSlip'
import { IconPrinter } from './Icons'

interface Props {
  isOpen: boolean
  token: TokenData | null
  onClose: () => void
}

export default function TokenModal({ isOpen, token, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !token) return null

  const handlePrint = () => {
    // Add print class to body temporarily for targeted print rules
    document.body.classList.add('printing-token-slip')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing-token-slip')
    }, 1000)
  }

  return (
    <>
      {/* On-screen Modal Preview */}
      <div className="token-modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
        <div className="token-modal-dialog" onClick={(e) => e.stopPropagation()}>
          <header className="token-modal-head">
            <div className="token-modal-actions">
              <button
                type="button"
                className="token-modal-print-btn"
                onClick={handlePrint}
                title="Print token"
                aria-label="Print token"
              >
                <IconPrinter size={18} />
              </button>
              <button
                type="button"
                className="token-modal-close-btn"
                onClick={onClose}
                title="Close"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          </header>

          <div className="token-modal-body">
            <div className="token-modal-slip-wrapper">
              <PrintableTokenSlip token={token} />
            </div>
          </div>

          <footer className="token-modal-foot">
            <p className="token-modal-hint">
              Tip: You can print on standard 80mm thermal receipt printers or regular A4/A5 printers.
            </p>
            <button type="button" className="ps-btn-ghost" onClick={onClose}>
              Dismiss
            </button>
          </footer>
        </div>
      </div>

      {/* Print-Only Pure Slip for window.print() */}
      <div className="token-print-only" aria-hidden="true">
        <PrintableTokenSlip token={token} printMode />
      </div>
    </>
  )
}

