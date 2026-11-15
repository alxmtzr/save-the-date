import {
  resolveTranslations,
  type DeepPartial,
  type SupportedLocale,
  type Translations,
} from './i18n/locales.ts'

export interface WeddingInput {
  /** Couple names displayed in the hero section, intro animation, and metadata */
  names: readonly [string, string]
  /** All-day wedding date in YYYY-MM-DD format */
  date: string
  /** ISO 8601 timestamp for the countdown target (e.g. start of the wedding day in local timezone) */
  countdownTarget: string
  /** Path to the couple photo relative to the repository root (e.g. "src/assets/couple.jpg") */
  image: string
  /** UI and date formatting language (built-in: 'de' | 'en', or any custom locale) */
  locale?: SupportedLocale
  /** Optional custom translation overrides or full dictionary for another language */
  translations?: DeepPartial<Translations>
  /** Optional venue or city; when omitted, `locationFallback` is displayed */
  location?: string
  /** Text displayed when `location` is not set yet (defaults to locale's `locationFallback`) */
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

export interface Wedding extends Required<Omit<WeddingInput, 'location' | 'translations'>> {
  location?: string
  /** Resolved UI translations for the configured locale */
  t: Translations
  /** Formatted couple label, e.g. "Emma & Noah" */
  coupleLabel: string
  /** Short date for the intro heart, e.g. "17 · 06 · 28" */
  shortDate: string
  /** Localized long date for the hero section, e.g. "17. Juni 2028" or "June 17, 2028" */
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

function formatNumericDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

function formatLongDate(isoDate: string, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00`))
}

export function defineWedding(input: WeddingInput): Wedding {
  const locale = input.locale ?? 'de'
  const t = resolveTranslations(locale, input.translations)
  const [first, second] = input.names
  const coupleLabel = `${first} & ${second}`
  const shortDate = formatShortDate(input.date)
  const numericDate = formatNumericDate(input.date)
  const longDate = formatLongDate(input.date, t.intlLocale)
  const compactDate = input.date.replaceAll('-', '')
  const slug = `${slugify(first)}-${slugify(second)}-${compactDate}`

  const locationFallback = input.locationFallback ?? t.defaults.locationFallback
  const locationNote = input.location ?? locationFallback
  const title = input.title ?? t.defaults.calendarTitle(coupleLabel)
  const details = input.details ?? t.defaults.calendarDetails
  const photoPosition = input.photoPosition ?? '50% 35%'
  const photoAlt = input.photoAlt ?? t.defaults.photoAlt(first, second)
  const icsFileName = input.icsFileName ?? 'save-the-date.ics'
  const uid = input.uid ?? `${slug}@save-the-date`

  return {
    names: input.names,
    date: input.date,
    countdownTarget: input.countdownTarget,
    image: input.image,
    locale,
    t,
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
      title: t.defaults.metaTitle(coupleLabel, numericDate),
      description: t.defaults.metaDescription(coupleLabel, longDate, locationNote),
      ogTitle: t.defaults.ogTitle(coupleLabel),
      ogDescription: t.defaults.ogDescription(longDate, locationNote),
    },
  }
}
