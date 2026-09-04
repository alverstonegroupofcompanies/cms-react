/** Stable placeholder doctor portrait until real photos are uploaded. */
export function getDoctorPhotoUrl(doctorId?: number, name?: string): string {
  const seed = doctorId ?? encodeURIComponent((name ?? 'doctor').toLowerCase().replace(/\s+/g, '-'))
  return `https://api.dicebear.com/7.x/personas/png?seed=doctor-${seed}&size=128&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`
}
