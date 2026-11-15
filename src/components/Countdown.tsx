import { AnimatePresence, m } from 'motion/react'
import { wedding } from '../config.ts'
import { useCountdown } from '../lib/countdown.ts'
import styles from './Countdown.module.css'

function Digit({ value }: { value: string }) {
  return (
    <span className={styles.digit}>
      <AnimatePresence initial={false}>
        <m.span
          key={value}
          initial={{ y: '85%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-85%', opacity: 0 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  )
}

function Unit({ value, label, pad }: { value: number; label: string; pad: number }) {
  const digits = String(value).padStart(pad, '0').split('')
  return (
    <div className={styles.unit}>
      <span className={styles.value}>
        {digits.map((d, i) => (
          // Key by place value from right so digits stay stable when total length changes
          <Digit key={digits.length - i} value={d} />
        ))}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export function Countdown() {
  const { days, hours, minutes, seconds, done } = useCountdown(wedding.countdownTarget)

  if (done) return <p className={styles.done}>Heute ist der große Tag ♥</p>

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        role="timer"
        aria-live="off"
        aria-label={`Noch ${days} Tage bis zur Hochzeit`}
      >
        <Unit value={days} label="Tage" pad={1} />
        <Unit value={hours} label="Stunden" pad={2} />
        <Unit value={minutes} label="Minuten" pad={2} />
        <Unit value={seconds} label="Sekunden" pad={2} />
      </div>
      <p className={styles.caption}>
        bis wir <span className={styles.yes}>Ja</span> sagen
      </p>
    </div>
  )
}
