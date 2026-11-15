import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useCallback, useState } from 'react'
import { HeartIntro } from './components/HeartIntro.tsx'
import { SaveTheDate } from './components/SaveTheDate.tsx'

const INTRO_KEY = 'std-intro-seen'

function introAlreadySeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export function App() {
  const reducedMotion = useReducedMotion()
  const [showIntro, setShowIntro] = useState(() => !reducedMotion && !introAlreadySeen())

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // Privater Modus o. Ä. – Intro wird dann einfach erneut gezeigt
    }
    setShowIntro(false)
  }, [])

  return (
    <>
      <AnimatePresence>{showIntro && <HeartIntro key="intro" onDone={finishIntro} />}</AnimatePresence>
      <SaveTheDate ready={!showIntro} />
    </>
  )
}
