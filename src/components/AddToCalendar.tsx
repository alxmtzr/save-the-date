import { AnimatePresence, m } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { wedding } from '../config.ts'
import { googleCalendarUrl, outlookCalendarUrl } from '../lib/calendar.ts'
import styles from './AddToCalendar.module.css'

const icsHref = `./${wedding.icsFileName}`

const options = [
  { label: 'Apple Kalender', href: icsHref, hint: 'iPhone & Mac' },
  { label: 'Google Kalender', href: googleCalendarUrl(wedding), external: true },
  { label: 'Outlook', href: outlookCalendarUrl(wedding), external: true },
  { label: 'Andere (.ics)', href: icsHref, download: wedding.icsFileName },
] as const

export function AddToCalendar() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <div className={styles.root} ref={rootRef}>
      <m.button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <CalendarIcon />
        In meinen Kalender
        <m.svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          animate={{ rotate: open ? 180 : 0 }}
          aria-hidden="true"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </m.svg>
      </m.button>

      <AnimatePresence initial={false}>
        {open && (
          <m.ul
            id={menuId}
            className={styles.menu}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((o, i) => (
              <m.li
                key={o.label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <a
                  className={styles.option}
                  href={o.href}
                  {...('external' in o ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  {...('download' in o ? { download: o.download } : {})}
                  onClick={() => setOpen(false)}
                >
                  <span>{o.label}</span>
                  <span className={styles.hint} aria-hidden="true">
                    {'external' in o ? '↗' : 'download' in o ? '↓' : o.hint}
                  </span>
                </a>
              </m.li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
      <path d="M12 17.2s-2.6-1.5-2.6-3.1c0-.8.6-1.4 1.3-1.4.6 0 1 .3 1.3.8.3-.5.7-.8 1.3-.8.7 0 1.3.6 1.3 1.4 0 1.6-2.6 3.1-2.6 3.1z" fill="currentColor" stroke="none" />
    </svg>
  )
}
