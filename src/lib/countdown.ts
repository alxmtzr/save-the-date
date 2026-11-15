import { useEffect, useState } from 'react'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function countdownParts(target: number, now: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000))
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    done: totalSeconds === 0,
  }
}

export function useCountdown(targetIso: string): CountdownParts {
  const target = Date.parse(targetIso)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let timer: number
    const tick = () => {
      const current = Date.now()
      setNow(current)
      // auf die nächste volle Sekunde ausrichten, damit die Anzeige nicht driftet
      timer = window.setTimeout(tick, 1000 - (current % 1000))
    }
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    return () => window.clearTimeout(timer)
  }, [])

  return countdownParts(target, now)
}
