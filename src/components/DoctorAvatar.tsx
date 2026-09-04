import { doctorInitial } from '../utils/doctorName'
import { getDoctorPhotoUrl } from '../utils/doctorPhoto'

interface Props {
  doctorId?: number
  name?: string
  photoUrl?: string | null
  className?: string
}

export default function DoctorAvatar({ doctorId, name, photoUrl, className = '' }: Props) {
  const src = photoUrl || getDoctorPhotoUrl(doctorId, name)
  const alt = name ? `${name} photo` : 'Doctor photo'

  return (
    <img
      className={`doctor-avatar-img ${className}`.trim()}
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorInitial(name))}&background=1c1917&color=fff&size=128&bold=true`
      }}
    />
  )
}
