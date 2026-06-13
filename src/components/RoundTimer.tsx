import { useState, useEffect } from 'react'
import type { Round, AppSettings } from '../lib/types'
import { parseRepsTime } from '../lib/utils'
import { ACCENT_DEFAULT } from '../lib/constants'

interface RoundTimerProps {
  round: Round
  accent?: string
  running: boolean
  setRunning: (r: boolean) => void
  resetKey: number
  settings: AppSettings
}

export function RoundTimer({ round, accent = ACCENT_DEFAULT, running, setRunning, resetKey, settings }: RoundTimerProps) {
  const firstTimed = round.exercises.find(e => parseRepsTime(e.reps_time).type === 'time')
  const workSec = firstTimed
    ? (settings.work_sec ?? (parseRepsTime(firstTimed.reps_time).value as number))
    : (settings.work_sec ?? 45)
  const restSec = settings.rest_sec ?? 20
  const totalRounds = round.exercises.length

  const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work')
  const [currentRound, setCurrentRound] = useState(1)
  const [remaining, setRemaining] = useState(workSec)

  useEffect(() => {
    setPhase('work')
    setCurrentRound(1)
    setRemaining(workSec)
  }, [resetKey, workSec])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r > 1) return r - 1
        if (phase === 'work') {
          if (restSec > 0) { setPhase('rest'); return restSec }
          if (currentRound < totalRounds) { setCurrentRound(c => c + 1); return workSec }
          setPhase('done'); setRunning(false); return 0
        }
        if (phase === 'rest') {
          if (currentRound < totalRounds) { setCurrentRound(c => c + 1); setPhase('work'); return workSec }
          setPhase('done'); setRunning(false); return 0
        }
        return 0
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, phase, currentRound, totalRounds, workSec, restSec, setRunning])

  const total = phase === 'work' ? workSec : restSec
  const progress = phase === 'done' ? 1 : 1 - (remaining / total)
  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const phaseColor = phase === 'rest' ? 'var(--rest)' : accent
  const label = phase === 'work' ? 'WORK' : phase === 'rest' ? 'REST' : 'DONE'

  return (
    <div className="flex items-center gap-3 rounded-timer" style={{ background: 'var(--surface-2)', padding: '10px 12px' }}>
      <div style={{ minWidth: 84 }}>
        <div className="flex items-baseline gap-1">
          <div
            className="text-[26px] font-[800] leading-none"
            style={{
              letterSpacing: -1,
              fontVariantNumeric: 'tabular-nums',
              color: phase === 'done' ? 'var(--text-3)' : 'var(--text-1)',
            }}
          >
            {mm}:{ss}
          </div>
          <div className="font-mono text-[9px] font-bold" style={{ letterSpacing: 1.2, color: phaseColor }}>
            {label}
          </div>
        </div>
        <div className="font-mono text-[9px] mt-[3px]" style={{ letterSpacing: 0.8, color: 'var(--text-3)' }}>
          {currentRound}/{totalRounds} · {workSec}s / {restSec}s
        </div>
      </div>
      <div className="flex-1 h-1 rounded-sm overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div
          className="h-full transition-[width] duration-1000 linear"
          style={{ width: `${progress * 100}%`, background: phaseColor }}
        />
      </div>
    </div>
  )
}
