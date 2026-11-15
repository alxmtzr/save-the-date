import { describe, expect, it } from 'vitest'
import { defineWedding, wedding } from '../config.ts'
import { buildIcs, googleCalendarUrl, nextDay, outlookCalendarUrl } from './calendar.ts'

const sampleWedding = defineWedding({
  names: ['Anna', 'Ben'],
  date: '2028-06-15',
  countdownTarget: '2028-06-15T00:00:00+02:00',
})

describe('defineWedding', () => {
  it('derives generic filenames, UIDs, and formatted dates from couple config', () => {
    expect(sampleWedding.icsFileName).toBe('save-the-date.ics')
    expect(sampleWedding.uid).toBe('anna-ben-20280615@save-the-date')
    expect(sampleWedding.coupleLabel).toBe('Anna & Ben')
    expect(sampleWedding.shortDate).toBe('15 · 06 · 28')
    expect(sampleWedding.longDate).toBe('15. Juni 2028')
  })

  it('validates active wedding configuration in src/config.ts', () => {
    expect(wedding.names).toHaveLength(2)
    expect(wedding.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(wedding.countdownTarget))).toBe(false)
  })
})

describe('nextDay', () => {
  it('handles month and year boundaries', () => {
    expect(nextDay('2027-09-25')).toBe('2027-09-26')
    expect(nextDay('2027-09-30')).toBe('2027-10-01')
    expect(nextDay('2027-12-31')).toBe('2028-01-01')
  })
})

describe('googleCalendarUrl', () => {
  it('creates an all-day event for the configured date', () => {
    const url = new URL(googleCalendarUrl(sampleWedding))
    expect(url.origin).toBe('https://calendar.google.com')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toBe('20280615/20280616')
    expect(url.searchParams.get('text')).toBe('Hochzeit von Anna & Ben')
    expect(url.searchParams.has('location')).toBe(false)
  })
})

describe('outlookCalendarUrl', () => {
  it('creates an all-day event for the configured date', () => {
    const url = new URL(outlookCalendarUrl(sampleWedding))
    expect(url.searchParams.get('startdt')).toBe('2028-06-15')
    expect(url.searchParams.get('enddt')).toBe('2028-06-16')
    expect(url.searchParams.get('allday')).toBe('true')
  })
})

describe('buildIcs', () => {
  const ics = buildIcs(sampleWedding, new Date('2026-11-15T11:00:00Z'))
  const lines = ics.split('\r\n')

  it('uses CRLF line endings and date-only values', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.replaceAll('\r\n', '')).not.toContain('\n')
    expect(lines).toContain('DTSTART;VALUE=DATE:20280615')
    expect(lines).toContain('DTEND;VALUE=DATE:20280616')
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
