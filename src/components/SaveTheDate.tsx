import { m, type Variants } from 'motion/react'
import couple from '../assets/couple.jpg?w=640;960;1280;1500&format=avif;webp;jpg&as=picture'
import { wedding } from '../config.ts'
import { AddToCalendar } from './AddToCalendar.tsx'
import { Countdown } from './Countdown.tsx'
import styles from './SaveTheDate.module.css'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

const SIZES = '(min-width: 900px) 50vw, 100vw'
const longDate = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(
  new Date(`${wedding.date}T12:00:00`),
)

export function SaveTheDate({
  ready,
  onReplayIntro,
}: {
  ready: boolean
  onReplayIntro?: () => void
}) {
  const [first, second] = wedding.names
  const state = ready ? 'show' : 'hidden'

  return (
    <main className={styles.page}>
      <figure className={styles.photo}>
        <picture>
          {Object.entries(couple.sources).map(([format, srcSet]) => (
            <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={SIZES} />
          ))}
          <m.img
            src={couple.img.src}
            width={couple.img.w}
            height={couple.img.h}
            sizes={SIZES}
            alt={`${first} und ${second} umarmen sich lachend im Sonnenuntergang auf einer Wiese`}
            fetchPriority="high"
            decoding="async"
            initial={{ scale: 1.08 }}
            animate={ready ? { scale: 1 } : undefined}
            transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </picture>
      </figure>

      <m.section className={styles.content} variants={container} initial="hidden" animate={state}>
        <m.p variants={item} className={styles.eyebrow}>
          Save the Date
        </m.p>

        <m.h1 variants={item} className={styles.names}>
          {first} <span className={styles.amp}>&amp;</span> {second}
        </m.h1>

        <m.div variants={item} className={styles.divider}>
          <span aria-hidden="true" />
          <button
            type="button"
            className={styles.heartButton}
            onClick={onReplayIntro}
            aria-label="Herz-Animation noch einmal abspielen"
            title="Herz-Animation noch einmal abspielen"
          >
            <svg viewBox="0 0 24 22" width="14" height="13" aria-hidden="true">
              <path d="M12 21s-9-5.6-9-12.1C3 5.6 5.4 3 8.4 3c1.6 0 2.9.8 3.6 2 .7-1.2 2-2 3.6-2 3 0 5.4 2.6 5.4 5.9C21 15.4 12 21 12 21z" />
            </svg>
          </button>
          <span aria-hidden="true" />
        </m.div>

        <m.p variants={item} className={styles.date}>
          <time dateTime={wedding.date}>{longDate}</time>
        </m.p>

        <m.div variants={item} className={styles.block}>
          <Countdown />
        </m.div>

        <m.div variants={item} className={styles.block}>
          <AddToCalendar />
        </m.div>

        <m.p variants={item} className={styles.note}>
          {wedding.location ?? 'Einladung folgt'}
        </m.p>
      </m.section>
    </main>
  )
}
