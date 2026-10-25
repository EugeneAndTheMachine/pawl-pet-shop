import { useEffect, useState } from 'react'

/** Milliseconds left until the deadline, updated every second */
export function useCountdown(deadline: string | undefined): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return deadline ? Math.max(0, new Date(deadline).getTime() - now) : 0
}
