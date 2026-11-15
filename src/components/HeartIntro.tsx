import { m } from 'motion/react'
import { useEffect } from 'react'
import styles from './HeartIntro.module.css'

// Zwei Herzhälften, die gleichzeitig von der Spitze nach oben gezeichnet werden.
const LEFT = 'M100 168 C 60 136, 12 104, 12 62 C 12 32, 34 12, 60 12 C 80 12, 94 24, 100 40'
const RIGHT = 'M100 168 C 140 136, 188 104, 188 62 C 188 32, 166 12, 140 12 C 120 12, 106 24, 100 40'
const FULL =
  'M100 168 C 60 136, 12 104, 12 62 C 12 32, 34 12, 60 12 C 80 12, 94 24, 100 40 ' +
  'C 106 24, 120 12, 140 12 C 166 12, 188 32, 188 62 C 188 104, 140 136, 100 168 Z'

const DRAW = { duration: 1.6, ease: [0.65, 0, 0.35, 1] } as const
const TOTAL_MS = 3000

export function HeartIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <m.div
      className={styles.overlay}
      onClick={onDone}
      role="presentation"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <m.svg
        className={styles.heart}
        viewBox="0 0 200 180"
        aria-hidden="true"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1, 1.07, 1, 1.04, 1] }}
        exit={{ scale: 1.5, opacity: 0, filter: 'blur(6px)' }}
        transition={{ duration: 2.6, times: [0, 0.75, 0.83, 0.9, 0.95, 1], ease: 'easeInOut' }}
      >
        <m.path
          d={FULL}
          className={styles.fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.9 }}
        />
        {[LEFT, RIGHT].map((d) => (
          <m.path
            key={d}
            d={d}
            className={styles.stroke}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={DRAW}
          />
        ))}
        <m.text
          x="100"
          y="92"
          className={styles.date}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          25 · 09 · 27
        </m.text>
      </m.svg>
      <m.span
        className={styles.skip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Tippen zum Überspringen
      </m.span>
    </m.div>
  )
}
