import { defineWedding } from './src/weddingSchema.ts'

/**
 * Active wedding configuration used for the site build, calendar invite, and Open Graph tags.
 * Copy values from `wedding.config.example.ts` when adapting this repository for another wedding.
 */
export default defineWedding({
  names: ['Chiara', 'Alex'],
  date: '2027-09-25',
  countdownTarget: '2027-09-25T00:00:00+02:00',
  image: 'src/assets/couple.jpg',
  photoPosition: '55% 35%',
  location: undefined,
  locationFallback: 'Einladung folgt',
  title: 'Hochzeit von Chiara & Alex',
  details: 'Save the Date! Die Einladung mit allen Details folgt.',
  icsFileName: 'save-the-date.ics',
})
