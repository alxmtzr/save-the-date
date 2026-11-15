import { defineWedding } from './src/weddingSchema.ts'

/**
 * Example configuration template with placeholder names, date, and sample image.
 * Used to generate the documentation screenshots in `docs/screenshots/`.
 * To customize the site for your own wedding, copy this file to `wedding.config.ts` and edit the fields below.
 */
export default defineWedding({
  names: ['Emma', 'Noah'],
  date: '2028-06-17',
  countdownTarget: '2028-06-17T00:00:00+02:00',
  image: 'src/assets/sample-couple.jpg',
  photoPosition: '50% 35%',
  location: undefined,
  locationFallback: 'Einladung folgt',
  title: 'Hochzeit von Emma & Noah',
  details: 'Save the Date! Die Einladung mit allen Details folgt.',
  icsFileName: 'save-the-date.ics',
})
