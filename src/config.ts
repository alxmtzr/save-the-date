export interface Wedding {
  names: readonly [string, string]
  /** Ganztägiges Datum im Format YYYY-MM-DD */
  date: string
  /** Zeitpunkt, auf den der Countdown zählt (Beginn des Tages in Europe/Berlin) */
  countdownTarget: string
  title: string
  details: string
  location?: string
  icsFileName: string
  uid: string
}

export const wedding: Wedding = {
  names: ['Chiara', 'Alex'],
  date: '2027-09-25',
  countdownTarget: '2027-09-25T00:00:00+02:00',
  title: 'Hochzeit von Chiara & Alex',
  details: 'Save the Date! Die Einladung mit allen Details folgt.',
  location: undefined, // steht noch nicht fest
  icsFileName: 'hochzeit-chiara-alex.ics',
  uid: 'hochzeit-chiara-alex-20270925@save-the-date',
}
