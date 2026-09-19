import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clampFrame,
  coverScale,
  DEFAULT_PHOTO_FRAME,
  loadImage,
  type PhotoFrame,
} from '../utils/cropDoctorPhoto'

const VIEW = 200

type Props = {
  src: string
  frame: PhotoFrame
  onChange: (frame: PhotoFrame) => void
}

export default function DoctorPhotoAdjuster({ src, frame, onChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: PhotoFrame } | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    loadImage(src)
      .then((img) => {
        if (!cancelled) setNatural({ w: img.naturalWidth, h: img.naturalHeight })
      })
      .catch(() => {
        if (!cancelled) setNatural(null)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  const apply = useCallback(
    (next: PhotoFrame) => {
      if (!natural) {
        onChange(next)
        return
      }
      onChange(clampFrame(natural.w, natural.h, VIEW, next))
    },
    [natural, onChange]
  )

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: frame,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    apply({
      ...drag.origin,
      offsetX: drag.origin.offsetX + (e.clientX - drag.startX),
      offsetY: drag.origin.offsetY + (e.clientY - drag.startY),
    })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
  }

  const scale = natural ? coverScale(natural.w, natural.h, VIEW, frame.zoom) : 1
  const imgW = natural ? natural.w * scale : VIEW
  const imgH = natural ? natural.h * scale : VIEW
  const left = (VIEW - imgW) / 2 + frame.offsetX
  const top = (VIEW - imgH) / 2 + frame.offsetY

  return (
    <div className="doctor-photo-adjuster">
      <div
        ref={stageRef}
        className="doctor-photo-stage"
        style={{ width: VIEW, height: VIEW }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="presentation"
        title="Drag to reposition"
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="doctor-photo-stage-img"
          style={{
            width: imgW,
            height: imgH,
            left,
            top,
          }}
        />
      </div>

      <div className="doctor-photo-adjust-controls">
        <label className="doctor-photo-zoom-label" htmlFor="doctor-photo-zoom">
          Zoom
        </label>
        <input
          id="doctor-photo-zoom"
          className="doctor-photo-zoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={frame.zoom}
          onChange={(e) => apply({ ...frame, zoom: Number(e.target.value) })}
        />
        <button
          type="button"
          className="btn btn-sm btn-secondary"
          onClick={() => onChange({ ...DEFAULT_PHOTO_FRAME })}
        >
          Reset
        </button>
      </div>
      <p className="muted doctor-photo-adjust-hint">Drag the photo to center the face, then use zoom.</p>
    </div>
  )
}

export { VIEW as DOCTOR_PHOTO_VIEW_SIZE }
