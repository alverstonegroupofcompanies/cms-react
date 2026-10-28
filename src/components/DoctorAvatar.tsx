import { useEffect, useState } from 'react'
import { doctorInitial } from '../utils/doctorName'
import { getDoctorPhotoUrl } from '../utils/doctorPhoto'

interface Props {
  doctorId?: number
  name?: string
  photoUrl?: string | null
  className?: string
}

export default function DoctorAvatar({ name, photoUrl, className = '' }: Props) {
  const validSrc = getDoctorPhotoUrl(photoUrl)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [validSrc])

  const initial = doctorInitial(name)
  const alt = name ? `${name} photo` : 'Doctor photo'

  if (validSrc && !imgFailed) {
    return (
      <img
        className={`doctor-avatar-img ${className}`.trim()}
        src={validSrc}
        alt={alt}
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <span
      className={`doctor-avatar-initial ${className}`.trim()}
      role="img"
      aria-label={alt}
    >
      {initial}
    </span>
  )
}
