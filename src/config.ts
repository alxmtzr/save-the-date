export interface WeddingInput {
  /** Couple names displayed in the hero section, intro animation, and metadata */
  names: readonly [string, string]
  /** All-day wedding date in YYYY-MM-DD format */
  date: string
  /** ISO 8601 timestamp for the countdown target (e.g. start of the wedding day in local timezone) */
  countdownTarget: string
  /** Optional venue or city; when omitted, `locationFallback` is displayed */
  location?: string
  /** Text displayed when `location` is not set yet */
  locationFallback?: string
  /** CSS `object-position` for the couple photo so faces stay framed on all screen sizes */
  photoPosition?: string
  /** Accessible alt text for the couple photo */
  photoAlt?: string
  /** Calendar event title override */
  title?: string
  /** Calendar event description override */
  details?: string
  /** Generated .ics filename (defaults to "save-the-date.ics") */
  icsFileName?: string
  /** Unique iCalendar UID override */
  uid?: string
}

export interface Wedding extends Required<Omit<WeddingInput, 'location'>> {
  location?: string
  /** Formatted couple label, e.g. "Chiara & Alex" */
  coupleLabel: string
  /** Short date for the intro heart, e.g. "25 · 09 · 27" */
  shortDate: string
  /** Localized long date for the hero section, e.g. "25. September 2027" */
  longDate: string
  /** Page and Open Graph metadata */
  meta: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day} · ${month} · ${year.slice(-2)}`
}

function formatDotDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00`))
}

export function defineWedding(input: WeddingInput): Wedding {
  const [first, second] = input.names
  const coupleLabel = `${first} & ${second}`
  const shortDate = formatShortDate(input.date)
  const dotDate = formatDotDate(input.date)
  const longDate = formatLongDate(input.date)
  const compactDate = input.date.replaceAll('-', '')
  const slug = `${slugify(first)}-${slugify(second)}-${compactDate}`

  const title = input.title ?? `Hochzeit von ${coupleLabel}`
  const details = input.details ?? 'Save the Date! Die Einladung mit allen Details folgt.'
  const locationFallback = input.locationFallback ?? 'Einladung folgt'
  const photoPosition = input.photoPosition ?? '55% 35%'
  const photoAlt = input.photoAlt ?? `${first} und ${second}`
  const icsFileName = input.icsFileName ?? 'save-the-date.ics'
  const uid = input.uid ?? `${slug}@save-the-date`

  return {
    names: input.names,
    date: input.date,
    countdownTarget: input.countdownTarget,
    location: input.location,
    locationFallback,
    photoPosition,
    photoAlt,
    title,
    details,
    icsFileName,
    uid,
    coupleLabel,
    shortDate,
    longDate,
    meta: {
      title: `Save the Date · ${coupleLabel} · ${dotDate}`,
      description: `${coupleLabel} heiraten am ${longDate}. ${locationFallback}.`,
      ogTitle: `Save the Date · ${coupleLabel}`,
      ogDescription: `Wir heiraten am ${longDate} – ${locationFallback}.`,
    },
  }
}

export const wedding: Wedding = defineWedding({
  names: ['Chiara', 'Alex'],
  date: '2027-09-25',
  countdownTarget: '2027-09-25T00:00:00+02:00',
  location: undefined,
  photoPosition: '55% 35%',
})
