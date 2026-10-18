import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusSettings } from '@/types'

export type Phase = 'work' | 'break' | 'longBreak'

interface Options {
  settings: FocusSettings
  onWorkComplete: (durationMin: number) => void
  onPhaseComplete?: (from: Phase, to: Phase) => void
}

export interface Pomodoro {
  phase: Phase
  running: boolean
  remainingMs: number
  totalMs: number
  cycleCount: number
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
}

/**
 * Pomodoro engine. Time is derived from an absolute end timestamp rather than
 * decremented each tick, so it stays accurate even when the tab is throttled.
 */
export function usePomodoro({ settings, onWorkComplete, onPhaseComplete }: Options): Pomodoro {
  const [phase, setPhase] = useState<Phase>('work')
  const [running, setRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  const durationMs = useCallback(
    (p: Phase) => {
      const min = p === 'work' ? settings.workMin : p === 'longBreak' ? settings.longBreakMin : settings.breakMin
      return min * 60_000
    },
    [settings],
  )

  const [remainingMs, setRemainingMs] = useState(() => durationMs('work'))

  const endRef = useRef(0)
  const remainingRef = useRef(remainingMs)
  useEffect(() => {
    remainingRef.current = remainingMs
  }, [remainingMs])

  // When durations change while idle, keep the display in sync with settings.
  const runningRef = useRef(running)
  const phaseRef = useRef(phase)
  runningRef.current = running
  phaseRef.current = phase
  useEffect(() => {
    if (!runningRef.current) setRemainingMs(durationMs(phaseRef.current))
  }, [durationMs])

  // The tick logic is stored in a ref so the interval always runs the latest
  // closure (fresh phase/settings) without being torn down every render.
  const tickRef = useRef<() => void>(() => {})
  tickRef.current = () => {
    const rem = endRef.current - Date.now()
    if (rem > 0) {
      setRemainingMs(rem)
      return
    }
    // Phase finished.
    setRunning(false)
    setRemainingMs(0)
    if (phase === 'work') {
      onWorkComplete(settings.workMin)
      const nextCount = cycleCount + 1
      setCycleCount(nextCount)
      const next: Phase = nextCount % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'break'
      setPhase(next)
      setRemainingMs(durationMs(next))
      onPhaseComplete?.('work', next)
    } else {
      setPhase('work')
      setRemainingMs(durationMs('work'))
      onPhaseComplete?.(phase, 'work')
    }
  }

  useEffect(() => {
    if (!running) return
    endRef.current = Date.now() + remainingRef.current
    const id = window.setInterval(() => tickRef.current(), 250)
    return () => window.clearInterval(id)
  }, [running])

  const start = useCallback(() => {
    if (remainingRef.current <= 0) setRemainingMs(durationMs(phaseRef.current))
    setRunning(true)
  }, [durationMs])

  const pause = useCallback(() => {
    if (runningRef.current) setRemainingMs(Math.max(0, endRef.current - Date.now()))
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setRemainingMs(durationMs(phaseRef.current))
  }, [durationMs])

  const skip = useCallback(() => {
    setRunning(false)
    const from = phaseRef.current
    const to: Phase = from === 'work' ? 'break' : 'work'
    setPhase(to)
    setRemainingMs(durationMs(to))
    onPhaseComplete?.(from, to)
  }, [durationMs, onPhaseComplete])

  return {
    phase,
    running,
    remainingMs,
    totalMs: durationMs(phase),
    cycleCount,
    start,
    pause,
    reset,
    skip,
  }
}
