export function storageUrl(path?: string | null): string {
  if (!path) return ''
  const trimmed = path.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }
  const cleanPath = trimmed.replace(/^\/?(storage\/)?/, '')
  const base = import.meta.env.VITE_API_URL || ''
  const root = base ? base.replace(/\/api\/?$/, '') : ''
  return root ? `${root}/storage/${cleanPath}` : `/storage/${cleanPath}`
}

