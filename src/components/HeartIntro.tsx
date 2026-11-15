import { m } from 'motion/react'
import { useEffect } from 'react'
import { wedding } from '../config.ts'
import styles from './HeartIntro.module.css'
import { HEART_STROKES } from './heartPaths.ts'

const TOTAL_MS = 3400

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
      transition={{ duration: 0.85, ease: 'easeInOut' }}
    >
      <m.svg
        className={styles.heart}
        viewBox="0 0 380 340"
        aria-hidden="true"
        initial={{ scale: 0.97, rotate: -1.5 }}
        animate={{
          scale: [0.97, 1, 1, 1.035, 1],
          rotate: [-1.5, 0, 0, 0.4, 0],
        }}
        exit={{
          scale: 1.18,
          opacity: 0,
          filter: 'blur(6px)',
          transition: { duration: 0.75, ease: 'easeInOut' },
        }}
        transition={{
          duration: 3.1,
          times: [0, 0.55, 0.72, 0.86, 1],
          ease: 'easeInOut',
        }}
      >
        <defs>
          <radialGradient id="heart-glow" cx="50%" cy="48%" r="44%">
            <stop offset="0%" stopColor="var(--accent-soft)" stopOpacity="0.4" />
            <stop offset="65%" stopColor="var(--accent-soft)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
          </radialGradient>
          {HEART_STROKES.map((s) => (
            <mask key={s.id} id={`mask-${s.id}`} maskUnits="userSpaceOnUse">
              <m.path
                d={s.center}
                fill="none"
                stroke="#fff"
                strokeWidth={s.maskWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { delay: s.delay, duration: s.duration, ease: [0.42, 0, 0.2, 1] },
                  opacity: { delay: s.delay, duration: 0.04 },
                }}
              />
            </mask>
          ))}
        </defs>

        <m.ellipse
          cx="190"
          cy="158"
          rx="145"
          ry="125"
          fill="url(#heart-glow)"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.4, ease: 'easeOut' }}
        />

        {HEART_STROKES.map((s) => (
          <path
            key={s.id}
            d={s.ribbon}
            mask={`url(#mask-${s.id})`}
            className={styles[s.variant]}
          />
        ))}

        <m.text
          x="190"
          y="146"
          className={styles.names}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.75, ease: 'easeOut' }}
        >
          {wedding.coupleLabel}
        </m.text>

        <m.text
          x="190"
          y="182"
          className={styles.date}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.8, ease: 'easeOut' }}
        >
          {wedding.shortDate}
        </m.text>
      </m.svg>

      <m.span
        className={styles.skip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {wedding.t.skipIntro}
      </m.span>
    </m.div>
  )
}
