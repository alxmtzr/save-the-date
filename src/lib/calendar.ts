import type { Wedding } from '../config.ts'

/** "2027-09-25" -> "20270925" */
const compactDate = (isoDate: string) => isoDate.replaceAll('-', '')

/** Folgetag eines ISO-Datums; ganztägige Termine enden exklusiv am nächsten Tag. */
export function nextDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function googleCalendarUrl(w: Wedding): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: w.title,
    dates: `${compactDate(w.date)}/${compactDate(nextDay(w.date))}`,
    details: w.details,
  })
  if (w.location) params.set('location', w.location)
  return `https://calendar.google.com/calendar/render?${params}`
}

export function outlookCalendarUrl(w: Wedding): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: w.title,
    startdt: w.date,
    enddt: nextDay(w.date),
    allday: 'true',
    body: w.details,
  })
  if (w.location) params.set('location', w.location)
  return `https://outlook.live.com/calendar/0/action/compose?${params}`
}

/** Escaping für TEXT-Werte nach RFC 5545 §3.3.11 */
function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Faltet Zeilen auf max. 75 Oktette (RFC 5545 §3.1), ohne UTF-8-Zeichen zu zerteilen. */
function foldLine(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74 // Folgezeilen beginnen mit einem Leerzeichen
    if (bytes + size > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function buildIcs(w: Wedding, now: Date = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chiara & Alex//Save the Date//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${w.uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART;VALUE=DATE:${compactDate(w.date)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay(w.date))}`,
    `SUMMARY:${escapeText(w.title)}`,
    `DESCRIPTION:${escapeText(w.details)}`,
    ...(w.location ? [`LOCATION:${escapeText(w.location)}`] : []),
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(w.title)}`,
    'TRIGGER:-P7D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
