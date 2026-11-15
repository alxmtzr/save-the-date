import { describe, expect, it } from 'vitest'
import { countdownParts, msUntilNextSecond, remainingSeconds } from './countdown.ts'

describe('countdownParts', () => {
  const target = Date.parse('2027-09-25T00:00:00+02:00')

  it('splits the remaining time into units', () => {
    const now = target - (2 * 86_400 + 3 * 3_600 + 4 * 60 + 5) * 1000
    expect(countdownParts(target, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false })
  })

  it('is done at and after the target', () => {
    expect(countdownParts(target, target).done).toBe(true)
    expect(countdownParts(target, target + 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
  })

  it('schedules each tick just past the next second boundary without skipping or stalling', () => {
    let now = target - 5432
    const seen: number[] = []
    for (let i = 0; i < 5; i++) {
      seen.push(remainingSeconds(target, now))
      // Even if the browser timer fires 10ms early, it still lands in the new second
      now += msUntilNextSecond(target, now) - 10
    }
    expect(seen).toEqual([5, 4, 3, 2, 1])
  })
})
