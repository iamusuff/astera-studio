import { useEffect, useState } from 'react'

// Re-renders every 30 seconds so "just now" becomes "1 min ago" on its own.
export function useNow(intervalMs = 30000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
