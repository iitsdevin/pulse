import { useState } from 'react'
import type { Exercise } from '../lib/types'
import { parseRepsTime } from '../lib/utils'
import { VideoPlayer } from './VideoPlayer'
import { SimpleTimer } from './SimpleTimer'
import { ACCENT_DEFAULT } from '../lib/constants'

interface ExerciseRowProps {
  exercise: Exercise
  accent?: string
  completed: boolean
  onToggle: () => void
  demoVideoUrl?: string
  loggedWeight?: string
  onWeightChange?: (weight: string) => void
}

export function ExerciseRow({
  exercise,
  accent = ACCENT_DEFAULT,
  completed,
  onToggle,
  demoVideoUrl,
  loggedWeight,
  onWeightChange,
}: ExerciseRowProps) {
  const [open, setOpen] = useState(false)
  const metric = parseRepsTime(exercise.reps_time)
  const hasVideo = !!exercise.name_slug

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-3" style={{ padding: '14px 16px' }}>
        {/* checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggle() }}
          className="flex-shrink-0 flex items-center justify-center p-0 border-none cursor-pointer"
          style={{
            width: 22, height: 22, borderRadius: 6,
            border: completed ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
            background: completed ? accent : 'transparent',
          }}
        >
          {completed && (
            <svg width="12" height="10" viewBox="0 0 12 10">
              <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* name + weight */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div
            className="text-[15px] font-semibold text-white truncate"
            style={{
              letterSpacing: -0.2,
              textDecoration: completed ? 'line-through' : 'none',
              opacity: completed ? 0.45 : 1,
            }}
          >
            {exercise.name}
          </div>
          {(exercise.instructor_weight || loggedWeight) && (
            <div className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 }}>
              @ {loggedWeight || exercise.instructor_weight}
            </div>
          )}
        </div>

        {/* reps or time */}
        <div className="flex items-baseline gap-0.5 cursor-pointer flex-shrink-0" onClick={() => setOpen(o => !o)}>
          <div
            className="text-[22px] font-[800] text-white leading-none"
            style={{ letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}
          >
            {metric.value}
          </div>
          <div className="font-mono text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {metric.type === 'time' ? 's' : typeof metric.value === 'number' ? 'reps' : ''}
          </div>
        </div>

        {/* chevron */}
        {hasVideo && (
          <div className="w-[22px] h-[22px] flex items-center justify-center cursor-pointer" onClick={() => setOpen(o => !o)}>
            <svg
              width="10" height="14" viewBox="0 0 10 14"
              className="transition-transform duration-200 ease-in-out"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <path d="M2 2L8 7L2 12" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* expanded content */}
      {open && hasVideo && (
        <div className="flex flex-col gap-2.5" style={{ padding: '0 16px 16px' }}>
          <VideoPlayer url={demoVideoUrl || ''} label={exercise.name_slug} accent={accent} />
          {metric.type === 'time' && (
            <SimpleTimer seconds={metric.value as number} accent={accent} />
          )}
          {/* weight input */}
          {exercise.instructor_weight && (
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>WEIGHT</label>
              <input
                type="text"
                placeholder={exercise.instructor_weight}
                value={loggedWeight || ''}
                onChange={e => onWeightChange?.(e.target.value)}
                className="flex-1 font-mono text-[13px] font-bold text-white bg-transparent border-none outline-none"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  padding: '4px 0',
                }}
              />
            </div>
          )}
          <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Keep core engaged throughout. Control the eccentric — {metric.type === 'time' ? 'maintain pace with the timer.' : 'focus on form over speed.'}
          </div>
        </div>
      )}
    </div>
  )
}
