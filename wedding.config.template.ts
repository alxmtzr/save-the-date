import { defineWedding } from './src/weddingSchema.ts'

/**
 * Configuration template with placeholder names, date, language, and sample image.
 * Used to generate the documentation screenshots in `docs/screenshots/`.
 *
 * To customize the website for your own wedding:
 *   cp wedding.config.template.ts wedding.config.ts
 * and edit the fields below.
 */
export default defineWedding({
  // Language for UI labels, date formatting, and calendar defaults ('de' | 'en', or custom via `translations`)
  locale: 'de',
  names: ['Emma', 'Noah'],
  date: '2028-06-17',
  countdownTarget: '2028-06-17T00:00:00+02:00',
  image: 'src/assets/sample-couple.jpg',
  photoPosition: '50% 35%',
  location: undefined,
  icsFileName: 'save-the-date.ics',
})
