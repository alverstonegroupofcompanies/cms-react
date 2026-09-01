import { useEffect, useState } from 'react'
import { getQueueStatus } from '../api/client'

export function useQueuePolling(doctorId: number | null, intervalMs = 5000) {
  const [queue, setQueue] = useState<object[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    if (!doctorId) return
    setLoading(true)
    try {
      const { data } = await getQueueStatus(doctorId)
      setQueue(data.queue)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    if (!doctorId) return
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [doctorId, intervalMs])

  return { queue, loading, refresh }
}
