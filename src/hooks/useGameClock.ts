import { useState, useEffect, useRef } from 'react'

interface GameClockResult {
  timeRemainingMs: number
  progress: number // 0 = full, 1 = expired
  expired: boolean
}

export function useGameClock(
  startedAt: number,
  timeLimitMs: number,
  onExpire?: () => void,
): GameClockResult {
  const [now, setNow] = useState(Date.now)
  const hasExpiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  // Always keep the ref current without adding onExpire to effect deps
  useEffect(() => {
    onExpireRef.current = onExpire
  })

  // Reset when a new question starts
  useEffect(() => {
    hasExpiredRef.current = false
    setNow(Date.now())
  }, [startedAt])

  // Tick every 100ms
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  const elapsed = Math.max(0, now - startedAt)
  const timeRemainingMs = Math.max(0, timeLimitMs - elapsed)
  const progress = Math.min(elapsed / timeLimitMs, 1)
  const expired = timeRemainingMs === 0

  // Fire onExpire exactly once per question, with a 500ms grace period for
  // any answers still in-flight before the host scores them
  useEffect(() => {
    if (!expired || hasExpiredRef.current) return
    hasExpiredRef.current = true
    const timeout = setTimeout(() => onExpireRef.current?.(), 500)
    return () => clearTimeout(timeout)
  }, [expired])

  return { timeRemainingMs, progress, expired }
}
