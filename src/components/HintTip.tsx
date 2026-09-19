/** Small “?” that reveals helper text on hover / focus. */
export default function HintTip({ text, className = '' }: { text: string; className?: string }) {
  if (!text.trim()) return null
  return (
    <span
      className={`ws-hint-tip ${className}`.trim()}
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span className="ws-hint-tip-mark" aria-hidden>
        ?
      </span>
      <span className="ws-hint-tip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  )
}
