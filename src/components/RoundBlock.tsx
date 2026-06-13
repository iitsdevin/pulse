import { useState } from 'react'
import type { Round, AppSettings } from '../lib/types'
import { RoundTimer } from './RoundTimer'
import { ExerciseRow } from './ExerciseRow'
import { Chevron } from './Chevron'
import { ACCENT_DEFAULT } from '../lib/constants'

interface RoundBlockProps {
  round: Round
  roundIndex: number
  accent?: string
  completed: Record<string, boolean>
  onToggle: (key: string) => void
  settings: AppSettings
  demoVideoUrls?: Record<string, string>
  loggedWeights?: Record<string, string>
  onWeightChange?: (slug: string, weight: string) => void
}

export function RoundBlock({
  round,
  roundIndex,
  accent = ACCENT_DEFAULT,
  completed,
  onToggle,
  settings,
  demoVideoUrls = {},
  loggedWeights = {},
  onWeightChange,
}: RoundBlockProps) {
  const [open, setOpen] = useState(roundIndex === 0)
  const [running, setRunning] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const totalExercises = round.exercises.length
  const doneCount = round.exercises.filter((_, i) => completed[`${roundIndex}-${i}`]).length

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!open) setOpen(true)
    setRunning(r => !r)
  }

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRunning(false)
    setResetKey(k => k + 1)
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        background: '#151515',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* header */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 cursor-pointer"
        style={{
          padding: '14px 14px',
          borderBottom: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
      >
        {/* play button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 flex items-center justify-center p-0 border-none cursor-pointer"
          style={{
            width: 46, height: 46, borderRadius: 14,
            background: running ? '#fff' : accent,
            boxShadow: running ? 'none' : `0 0 0 4px ${accent}22`,
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
          aria-label={running ? 'Pause round timer' : 'Start round timer'}
        >
          {running ? (
            <span className="inline-flex gap-[3px]">
              <span className="w-1 h-[14px] bg-black rounded-sm" />
              <span className="w-1 h-[14px] bg-black rounded-sm" />
            </span>
          ) : (
            <svg width="14" height="16" viewBox="0 0 14 16" style={{ marginLeft: 2 }}>
              <path d="M0 0L14 8L0 16Z" fill="#000" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="font-mono text-[11px] font-[800]" style={{ color: accent, letterSpacing: 1.4 }}>
              R{String(roundIndex + 1).padStart(2, '0')}
            </div>
            <div className="text-[15px] font-bold text-white truncate" style={{ letterSpacing: -0.2 }}>
              Round {roundIndex + 1}
            </div>
          </div>
          <div className="font-mono text-[10px] mt-[3px]" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
            {totalExercises} EX · REST {settings.rest_sec}s
          </div>
        </div>

        <div
          className="font-mono text-[12px] font-bold"
          style={{ color: doneCount === totalExercises ? accent : 'rgba(255,255,255,0.45)' }}
        >
          {doneCount}/{totalExercises}
        </div>

        <Chevron open={open} />
      </div>

      {open && (
        <div>
          {/* timer */}
          <div style={{ padding: '12px 14px 0' }}>
            <RoundTimer
              round={round}
              accent={accent}
              running={running}
              setRunning={setRunning}
              resetKey={resetKey}
              settings={settings}
            />
            <div className="flex justify-end mt-1.5">
              <button
                onClick={resetTimer}
                className="font-mono text-[10px] font-bold border-none cursor-pointer inline-flex items-center gap-[5px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.65)',
                  padding: '6px 12px',
                  borderRadius: 999,
                  letterSpacing: 1.2,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 5.5a4 4 0 104-4M1.5 1.5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                RESET
              </button>
            </div>
          </div>
          {round.exercises.map((ex, i) => (
            <ExerciseRow
              key={i}
              exercise={ex}
              accent={accent}
              completed={!!completed[`${roundIndex}-${i}`]}
              onToggle={() => onToggle(`${roundIndex}-${i}`)}
              demoVideoUrl={demoVideoUrls[ex.name_slug]}
              loggedWeight={loggedWeights[ex.name_slug]}
              onWeightChange={w => onWeightChange?.(ex.name_slug, w)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
