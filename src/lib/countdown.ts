import { useEffect, useState } from 'react'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function remainingSeconds(target: number, now: number): number {
  return Math.max(0, Math.floor((target - now) / 1000))
}

export function msUntilNextSecond(target: number, now: number): number {
  const diff = target - now
  if (diff <= 0) return 1000
  // Align to the next second boundary + 16ms safety margin against early timer firing
  return (diff % 1000) + 16
}

export function secondsToParts(totalSeconds: number): CountdownParts {
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    done: totalSeconds === 0,
  }
}

export function countdownParts(target: number, now: number): CountdownParts {
  return secondsToParts(remainingSeconds(target, now))
}

export function useCountdown(targetIso: string): CountdownParts {
  const target = Date.parse(targetIso)
  const [totalSeconds, setTotalSeconds] = useState(() => remainingSeconds(target, Date.now()))

  useEffect(() => {
    let timeoutId: number
    const tick = () => {
      const now = Date.now()
      const next = remainingSeconds(target, now)
      setTotalSeconds(next)
      if (next > 0) {
        timeoutId = window.setTimeout(tick, msUntilNextSecond(target, now))
      }
    }
    timeoutId = window.setTimeout(tick, msUntilNextSecond(target, Date.now()))
    return () => window.clearTimeout(timeoutId)
  }, [target])

  return secondsToParts(totalSeconds)
}
