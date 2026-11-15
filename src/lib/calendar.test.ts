import { describe, expect, it } from 'vitest'
import exampleWedding from '../../wedding.config.example.ts'
import { defineWedding, wedding } from '../config.ts'
import { buildIcs, googleCalendarUrl, nextDay, outlookCalendarUrl } from './calendar.ts'

const sampleWedding = defineWedding({
  names: ['Emma', 'Noah'],
  date: '2028-06-17',
  countdownTarget: '2028-06-17T00:00:00+02:00',
  image: 'src/assets/sample-couple.jpg',
})

describe('defineWedding', () => {
  it('derives generic filenames, UIDs, and formatted dates from couple config', () => {
    expect(sampleWedding.icsFileName).toBe('save-the-date.ics')
    expect(sampleWedding.uid).toBe('emma-noah-20280617@save-the-date')
    expect(sampleWedding.coupleLabel).toBe('Emma & Noah')
    expect(sampleWedding.shortDate).toBe('17 · 06 · 28')
    expect(sampleWedding.longDate).toBe('17. Juni 2028')
    expect(exampleWedding.coupleLabel).toBe('Emma & Noah')
  })

  it('validates active wedding configuration in wedding.config.ts', () => {
    expect(wedding.names).toHaveLength(2)
    expect(wedding.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(wedding.image.length).toBeGreaterThan(0)
    expect(Number.isNaN(Date.parse(wedding.countdownTarget))).toBe(false)
  })
})

describe('nextDay', () => {
  it('handles month and year boundaries', () => {
    expect(nextDay('2028-06-17')).toBe('2028-06-18')
    expect(nextDay('2028-06-30')).toBe('2028-07-01')
    expect(nextDay('2028-12-31')).toBe('2029-01-01')
  })
})

describe('googleCalendarUrl', () => {
  it('creates an all-day event for the configured date', () => {
    const url = new URL(googleCalendarUrl(sampleWedding))
    expect(url.origin).toBe('https://calendar.google.com')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toBe('20280617/20280618')
    expect(url.searchParams.get('text')).toBe('Hochzeit von Emma & Noah')
    expect(url.searchParams.has('location')).toBe(false)
  })
})

describe('outlookCalendarUrl', () => {
  it('creates an all-day event for the configured date', () => {
    const url = new URL(outlookCalendarUrl(sampleWedding))
    expect(url.searchParams.get('startdt')).toBe('2028-06-17')
    expect(url.searchParams.get('enddt')).toBe('2028-06-18')
    expect(url.searchParams.get('allday')).toBe('true')
  })
})

describe('buildIcs', () => {
  const ics = buildIcs(sampleWedding, new Date('2026-11-15T11:00:00Z'))
  const lines = ics.split('\r\n')

  it('uses CRLF line endings and date-only values', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.replaceAll('\r\n', '')).not.toContain('\n')
    expect(lines).toContain('DTSTART;VALUE=DATE:20280617')
    expect(lines).toContain('DTEND;VALUE=DATE:20280618')
    expect(lines).toContain('DTSTAMP:20261115T110000Z')
    expect(lines).toContain(`UID:${sampleWedding.uid}`)
  })

  it('escapes text values and omits an unknown location', () => {
    expect(ics).toContain('DESCRIPTION:Save the Date! Die Einladung mit allen Details folgt.')
    expect(buildIcs({ ...sampleWedding, title: 'a, b; c' })).toContain('SUMMARY:a\\, b\\; c')
    expect(ics).not.toContain('LOCATION')
  })

  it('folds long lines to at most 75 octets', () => {
    const long = buildIcs({ ...sampleWedding, details: 'ä'.repeat(100) })
    const encoder = new TextEncoder()
    for (const line of long.split('\r\n')) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
    }
    expect(long).toContain('\r\n ')
  })
})
