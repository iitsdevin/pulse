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
      />

      <FullWorkoutCard
        workout={workout}
        accent={accent}
        videoUrl={workoutVideoUrl}
      />

      {/* circuit breakdown */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
          <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: 'rgba(255,255,255,0.6)' }}>
            CIRCUIT BREAKDOWN
          </div>
          <div className="font-mono text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
