import { describe, expect, it } from 'vitest'
import { countdownParts } from './countdown.ts'

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
})
