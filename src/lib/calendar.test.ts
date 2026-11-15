import { describe, expect, it } from 'vitest'
import templateWedding from '../../wedding.config.template.ts'
import { defineWedding, registerLocale, wedding } from '../config.ts'
import { en } from '../i18n/locales.ts'
import { buildIcs, googleCalendarUrl, nextDay, outlookCalendarUrl } from './calendar.ts'

const sampleWedding = defineWedding({
  locale: 'de',
  names: ['Emma', 'Noah'],
  date: '2028-06-17',
  countdownTarget: '2028-06-17T00:00:00+02:00',
  image: 'src/assets/sample-couple.jpg',
})

describe('defineWedding & i18n', () => {
  it('derives generic filenames, UIDs, and German formatted dates when locale is "de"', () => {
    expect(sampleWedding.icsFileName).toBe('save-the-date.ics')
    expect(sampleWedding.uid).toBe('emma-noah-20280617@save-the-date')
    expect(sampleWedding.coupleLabel).toBe('Emma & Noah')
    expect(sampleWedding.shortDate).toBe('17 · 06 · 28')
    expect(sampleWedding.longDate).toBe('17. Juni 2028')
    expect(sampleWedding.title).toBe('Hochzeit von Emma & Noah')
    expect(sampleWedding.locationFallback).toBe('Einladung folgt')
    expect(templateWedding.coupleLabel).toBe('Emma & Noah')
  })

  it('localizes dates, UI labels, and calendar defaults when locale is "en"', () => {
    const englishWedding = defineWedding({
      locale: 'en',
      names: ['Emma', 'Noah'],
      date: '2028-06-17',
      countdownTarget: '2028-06-17T00:00:00Z',
      image: 'src/assets/sample-couple.jpg',
    })
    expect(englishWedding.t.htmlLang).toBe('en')
    expect(englishWedding.longDate).toBe('June 17, 2028')
    expect(englishWedding.title).toBe('Wedding of Emma & Noah')
    expect(englishWedding.locationFallback).toBe('Invitation to follow')
    expect(englishWedding.t.countdown.days).toBe('Days')
    expect(englishWedding.t.countdown.captionHighlight).toBe('I do')
    expect(englishWedding.t.calendar.button).toBe('Add to calendar')
    expect(englishWedding.t.skipIntro).toBe('Tap to skip')
  })

  it('supports extending i18n with custom locales or inline translation overrides', () => {
    registerLocale('fr', {
      ...en,
      htmlLang: 'fr',
      intlLocale: 'fr-FR',
      skipIntro: 'Toucher pour passer',
    })
    const frenchWedding = defineWedding({
      locale: 'fr',
      names: ['Emma', 'Noah'],
      date: '2028-06-17',
      countdownTarget: '2028-06-17T00:00:00+02:00',
      image: 'src/assets/sample-couple.jpg',
      translations: {
        calendar: { button: 'Ajouter au calendrier' },
      },
    })
    expect(frenchWedding.t.htmlLang).toBe('fr')
    expect(frenchWedding.t.skipIntro).toBe('Toucher pour passer')
    expect(frenchWedding.t.calendar.button).toBe('Ajouter au calendrier')
    expect(frenchWedding.longDate.toLowerCase()).toContain('juin')
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
