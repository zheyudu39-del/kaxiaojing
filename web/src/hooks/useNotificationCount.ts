import { useEffect, useState } from 'react'
import { notificationApi } from '@/api/me'
import { useAuthStore } from '@/stores/auth'

/** 未读通知数，登录后每 60 秒轮询一次 */
export function useNotificationCount(): number {
  const token = useAuthStore((s) => s.token)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!token) {
      setCount(0)
      return
    }
    let alive = true
    const load = async () => {
      try {
        const res = await notificationApi.unreadCount()
        if (alive) setCount(res?.count ?? 0)
      } catch {
        /* 静默失败 */
      }
    }
    load()
    const timer = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [token])

  return count
}
