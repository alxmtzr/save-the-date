export interface Translations {
  /** HTML `<html lang="...">` attribute */
  htmlLang: string
  /** BCP 47 locale tag passed to `Intl.DateTimeFormat` for long date formatting */
  intlLocale: string
  /** Eyebrow label above the couple's names */
  eyebrow: string
  /** Hint shown at the bottom of the calligraphic heart intro */
  skipIntro: string
  /** Accessible label and tooltip for the heart button that replays the intro */
  replayIntroAriaLabel: string
  /** Countdown unit labels and captions */
  countdown: {
    days: string
    hours: string
    minutes: string
    seconds: string
    captionPrefix: string
    captionHighlight: string
    captionSuffix: string
    todayMessage: string
    ariaLabel: (days: number) => string
  }
  /** Add-to-calendar button and dropdown items */
  calendar: {
    button: string
    apple: string
    appleHint: string
    google: string
    outlook: string
    otherIcs: string
  }
  /** Locale-aware default templates when not overridden in `wedding.config.ts` */
  defaults: {
    locationFallback: string
    calendarTitle: (coupleLabel: string) => string
    calendarDetails: string
    photoAlt: (first: string, second: string) => string
    metaTitle: (coupleLabel: string, numericDate: string) => string
    metaDescription: (coupleLabel: string, longDate: string, locationNote: string) => string
    ogTitle: (coupleLabel: string) => string
    ogDescription: (longDate: string, locationNote: string) => string
  }
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export const de: Translations = {
  htmlLang: 'de',
  intlLocale: 'de-DE',
  eyebrow: 'Save the Date',
  skipIntro: 'Tippen zum Überspringen',
  replayIntroAriaLabel: 'Herz-Animation noch einmal abspielen',
  countdown: {
    days: 'Tage',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    captionPrefix: 'bis wir ',
    captionHighlight: 'Ja',
    captionSuffix: ' sagen',
    todayMessage: 'Heute ist der große Tag ♥',
    ariaLabel: (days) => `Noch ${days} Tage bis zur Hochzeit`,
  },
  calendar: {
    button: 'In meinen Kalender',
    apple: 'Apple Kalender',
    appleHint: 'iPhone & Mac',
    google: 'Google Kalender',
    outlook: 'Outlook',
    otherIcs: 'Andere (.ics)',
  },
  defaults: {
    locationFallback: 'Einladung folgt',
    calendarTitle: (coupleLabel) => `Hochzeit von ${coupleLabel}`,
    calendarDetails: 'Save the Date! Die Einladung mit allen Details folgt.',
    photoAlt: (first, second) => `${first} und ${second}`,
    metaTitle: (coupleLabel, numericDate) => `Save the Date · ${coupleLabel} · ${numericDate}`,
    metaDescription: (coupleLabel, longDate, locationNote) =>
      `${coupleLabel} heiraten am ${longDate}. ${locationNote}.`,
    ogTitle: (coupleLabel) => `Save the Date · ${coupleLabel}`,
    ogDescription: (longDate, locationNote) => `Wir heiraten am ${longDate} – ${locationNote}.`,
  },
}

export const en: Translations = {
  htmlLang: 'en',
  intlLocale: 'en-US',
  eyebrow: 'Save the Date',
  skipIntro: 'Tap to skip',
  replayIntroAriaLabel: 'Replay heart animation',
  countdown: {
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    captionPrefix: 'until we say ',
    captionHighlight: 'I do',
    captionSuffix: '',
    todayMessage: 'Today is the big day ♥',
    ariaLabel: (days) => `${days} days until the wedding`,
  },
  calendar: {
    button: 'Add to calendar',
    apple: 'Apple Calendar',
    appleHint: 'iPhone & Mac',
    google: 'Google Calendar',
    outlook: 'Outlook',
    otherIcs: 'Other (.ics)',
  },
  defaults: {
    locationFallback: 'Invitation to follow',
    calendarTitle: (coupleLabel) => `Wedding of ${coupleLabel}`,
    calendarDetails: 'Save the Date! Formal invitation with all details to follow.',
    photoAlt: (first, second) => `${first} and ${second}`,
    metaTitle: (coupleLabel, numericDate) => `Save the Date · ${coupleLabel} · ${numericDate}`,
    metaDescription: (coupleLabel, longDate, locationNote) =>
      `${coupleLabel} are getting married on ${longDate}. ${locationNote}.`,
    ogTitle: (coupleLabel) => `Save the Date · ${coupleLabel}`,
    ogDescription: (longDate, locationNote) =>
      `We are getting married on ${longDate} – ${locationNote}.`,
  },
}

export const BUILTIN_LOCALES = {
  de,
  en,
} as const

export type SupportedLocale = keyof typeof BUILTIN_LOCALES | (string & {})

const customRegistry = new Map<string, Translations>()

/**
 * Registers an additional language dictionary so any locale code can be used in `wedding.config.ts`.
 */
export function registerLocale(locale: string, translations: Translations): void {
  customRegistry.set(locale, translations)
}

/**
 * Resolves a locale code and optional partial overrides into a complete `Translations` dictionary.
 * Falls back to English (`en`) as base if a custom locale code is provided with partial overrides.
 */
export function resolveTranslations(
  locale: SupportedLocale = 'de',
  overrides?: DeepPartial<Translations>,
): Translations {
  const base: Translations =
    customRegistry.get(locale) ??
    (locale in BUILTIN_LOCALES ? BUILTIN_LOCALES[locale as keyof typeof BUILTIN_LOCALES] : en)

  if (!overrides) return base

  return {
    ...base,
    ...overrides,
    htmlLang: overrides.htmlLang ?? (locale in BUILTIN_LOCALES ? base.htmlLang : locale),
    intlLocale: overrides.intlLocale ?? (locale in BUILTIN_LOCALES ? base.intlLocale : locale),
    countdown: {
      ...base.countdown,
      ...overrides.countdown,
    },
    calendar: {
      ...base.calendar,
      ...overrides.calendar,
    },
    defaults: {
      ...base.defaults,
      ...overrides.defaults,
    },
  }
}
