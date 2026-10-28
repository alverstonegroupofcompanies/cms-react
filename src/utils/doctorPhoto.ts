/** Return a valid uploaded doctor photo URL, or undefined when no real image exists. */
export function getDoctorPhotoUrl(photoUrl?: string | null): string | undefined {
  const trimmed = (photoUrl ?? '').trim()
  if (!trimmed) return undefined
  if (trimmed.includes('dicebear.com') || trimmed.includes('ui-avatars.com')) {
    return undefined
  }
  return trimmed
}
