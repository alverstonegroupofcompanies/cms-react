export function storageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const root = base.replace(/\/api\/?$/, '')
  return `${root}/storage/${path.replace(/^\//, '')}`
}

