import { defineWedding } from './src/weddingSchema.ts'

/**
 * Active wedding configuration used for the site build, calendar invite, and Open Graph tags.
 * Copy `wedding.config.template.ts` to `wedding.config.ts` when adapting this repository for another wedding.
 */
export default defineWedding({
  locale: 'de',
  names: ['Chiara', 'Alex'],
  date: '2027-09-25',
  countdownTarget: '2027-09-25T00:00:00+02:00',
  image: 'src/assets/couple.jpg',
  photoPosition: '55% 35%',
  location: undefined,
  icsFileName: 'save-the-date.ics',
})
