/** Export a square JPEG from an image using cover-fit zoom + pan (viewport pixels). */

export type PhotoFrame = {
  zoom: number
  offsetX: number
  offsetY: number
}

export const DEFAULT_PHOTO_FRAME: PhotoFrame = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

/** Cover scale so the image fills a square of `viewSize` at zoom 1. */
export function coverScale(naturalW: number, naturalH: number, viewSize: number, zoom: number) {
  return (viewSize / Math.min(naturalW, naturalH)) * zoom
}

export function clampFrame(
  naturalW: number,
  naturalH: number,
  viewSize: number,
  frame: PhotoFrame
): PhotoFrame {
  const zoom = Math.min(3, Math.max(1, frame.zoom))
  const scale = coverScale(naturalW, naturalH, viewSize, zoom)
  const drawnW = naturalW * scale
  const drawnH = naturalH * scale
  const maxX = Math.max(0, (drawnW - viewSize) / 2)
  const maxY = Math.max(0, (drawnH - viewSize) / 2)
  return {
    zoom,
    offsetX: Math.min(maxX, Math.max(-maxX, frame.offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, frame.offsetY)),
  }
}

export async function exportFramedPhoto(
  src: string,
  frame: PhotoFrame,
  viewSize: number,
  outputSize = 512,
  fileName = 'doctor-photo.jpg'
): Promise<File> {
  const img = await loadImage(src)
  const clamped = clampFrame(img.naturalWidth, img.naturalHeight, viewSize, frame)
  const scale = coverScale(img.naturalWidth, img.naturalHeight, viewSize, clamped.zoom)
  const ratio = outputSize / viewSize
  const drawnW = img.naturalWidth * scale * ratio
  const drawnH = img.naturalHeight * scale * ratio
  const dx = ((viewSize - img.naturalWidth * scale) / 2 + clamped.offsetX) * ratio
  const dy = ((viewSize - img.naturalHeight * scale) / 2 + clamped.offsetY) * ratio

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(0, 0, outputSize, outputSize)
  ctx.drawImage(img, dx, dy, drawnW, drawnH)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not export photo'))),
      'image/jpeg',
      0.92
    )
  })

  return new File([blob], fileName.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}
