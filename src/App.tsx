import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useCallback, useState } from 'react'
import { HeartIntro } from './components/HeartIntro.tsx'
import { SaveTheDate } from './components/SaveTheDate.tsx'

export function App() {
  const reducedMotion = useReducedMotion()
  const [showIntro, setShowIntro] = useState(() => !reducedMotion)

  const finishIntro = useCallback(() => setShowIntro(false), [])
  const replayIntro = useCallback(() => setShowIntro(true), [])

  return (
    <>
      <AnimatePresence>{showIntro && <HeartIntro key="intro" onDone={finishIntro} />}</AnimatePresence>
      <SaveTheDate ready={!showIntro} onReplayIntro={replayIntro} />
    </>
  )
}
