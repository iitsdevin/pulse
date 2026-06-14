import { useState, useCallback } from 'react'
import type { Workout, AppSettings } from '../lib/types'
import { HeroCard } from '../components/HeroCard'
import { FullWorkoutCard } from '../components/FullWorkoutCard'
import { RoundBlock } from '../components/RoundBlock'
import { ACCENT_DEFAULT } from '../lib/constants'

interface TodayScreenProps {
  workout: Workout
  accent?: string
  isToday?: boolean
  settings: AppSettings
  onOpenSettings?: () => void
  workoutVideoUrl?: string
  demoVideoUrls?: Record<string, string>
  loggedWeights?: Record<string, string>
  onWeightChange?: (slug: string, weight: string) => void
  onStartGuided?: () => void
  onCustom?: () => void
  isCustom?: boolean
  isFav?: boolean
  onToggleFav?: () => void
}

export function TodayScreen({
  workout,
  accent = ACCENT_DEFAULT,
  isToday = true,
  settings,
  onOpenSettings,
  workoutVideoUrl,
  demoVideoUrls = {},
  loggedWeights = {},
  onWeightChange,
  onStartGuided,
  onCustom,
  isCustom = false,
  isFav,
  onToggleFav,
}: TodayScreenProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  const toggle = useCallback((key: string) => {
    setCompleted(c => ({ ...c, [key]: !c[key] }))
  }, [])

  const totalExercises = workout.rounds.reduce((a, r) => a + r.exercises.length, 0)
  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = totalExercises > 0 ? Math.round((doneCount / totalExercises) * 100) : 0

  return (
    <div className="pb-10">
      <HeroCard
        workout={workout}
        accent={accent}
        isToday={isToday}
        pct={pct}
        onOpenSettings={onOpenSettings}
        isFav={isFav}
        onToggleFav={onToggleFav}
      />

      {!isCustom && (
        <FullWorkoutCard
          workout={workout}
          accent={accent}
          videoUrl={workoutVideoUrl}
        />
      )}

      {/* guided session + custom actions */}
      {(onStartGuided || onCustom) && (
        <div className="flex gap-2.5 px-4 pt-3.5">
          {onStartGuided && (
            <button
              onClick={onStartGuided}
              className="flex-1 inline-flex items-center justify-center gap-2 font-mono text-[12px] font-bold border-none cursor-pointer"
              style={{ background: accent, color: 'var(--accent-on)', padding: '14px 0', borderRadius: 14, letterSpacing: 1 }}
            >
              <svg width="13" height="15" viewBox="0 0 13 15"><path d="M0 0L13 7.5L0 15Z" fill="var(--accent-on)" /></svg>
              START GUIDED SESSION
            </button>
          )}
          {onCustom && (
            <button
              onClick={onCustom}
              aria-label="Build custom session"
              className="inline-flex items-center justify-center font-mono text-[12px] font-bold border-none cursor-pointer"
              style={{ background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--hairline)', padding: '0 18px', borderRadius: 14, letterSpacing: 1 }}
            >
              ＋ CUSTOM
            </button>
          )}
        </div>
      )}

      {/* circuit breakdown */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
          <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: 'var(--text-2)' }}>
            CIRCUIT BREAKDOWN
          </div>
          <div className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-3)' }}>
            {workout.rounds.length} rounds · tap ▶ to start
          </div>
        </div>

        {workout.rounds.map((round, i) => (
          <RoundBlock
            key={i}
            round={round}
            roundIndex={i}
            accent={accent}
            completed={completed}
            onToggle={toggle}
            settings={settings}
            demoVideoUrls={demoVideoUrls}
            loggedWeights={loggedWeights}
            onWeightChange={onWeightChange}
          />
        ))}
      </div>
    </div>
  )
}
