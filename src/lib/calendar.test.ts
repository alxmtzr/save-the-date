import { describe, expect, it } from 'vitest'
import { wedding } from '../config.ts'
import { buildIcs, googleCalendarUrl, nextDay, outlookCalendarUrl } from './calendar.ts'

describe('nextDay', () => {
  it('handles month and year boundaries', () => {
    expect(nextDay('2027-09-25')).toBe('2027-09-26')
    expect(nextDay('2027-09-30')).toBe('2027-10-01')
    expect(nextDay('2027-12-31')).toBe('2028-01-01')
  })
})

describe('googleCalendarUrl', () => {
  it('creates an all-day event on 25.09.2027', () => {
    const url = new URL(googleCalendarUrl(wedding))
    expect(url.origin).toBe('https://calendar.google.com')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toBe('20270925/20270926')
    expect(url.searchParams.get('text')).toBe('Hochzeit von Chiara & Alex')
    expect(url.searchParams.has('location')).toBe(false)
  })
})

describe('outlookCalendarUrl', () => {
  it('creates an all-day event on 25.09.2027', () => {
    const url = new URL(outlookCalendarUrl(wedding))
    expect(url.searchParams.get('startdt')).toBe('2027-09-25')
    expect(url.searchParams.get('enddt')).toBe('2027-09-26')
    expect(url.searchParams.get('allday')).toBe('true')
  })
})

describe('buildIcs', () => {
  const ics = buildIcs(wedding, new Date('2026-11-15T11:00:00Z'))
  const lines = ics.split('\r\n')

  it('uses CRLF line endings and date-only values', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.replaceAll('\r\n', '')).not.toContain('\n')
    expect(lines).toContain('DTSTART;VALUE=DATE:20270925')
    expect(lines).toContain('DTEND;VALUE=DATE:20270926')
    expect(lines).toContain('DTSTAMP:20261115T110000Z')
    expect(lines).toContain(`UID:${wedding.uid}`)
  })

  it('escapes text values and omits an unknown location', () => {
    expect(ics).toContain('DESCRIPTION:Save the Date! Die Einladung mit allen Details folgt.')
    expect(buildIcs({ ...wedding, title: 'a, b; c' })).toContain('SUMMARY:a\\, b\\; c')
    expect(ics).not.toContain('LOCATION')
  })

  it('folds long lines to at most 75 octets', () => {
    const long = buildIcs({ ...wedding, details: 'ä'.repeat(100) })
    const encoder = new TextEncoder()
    for (const line of long.split('\r\n')) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
    }
    expect(long).toContain('\r\n ')
  })
})
