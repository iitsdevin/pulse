import type { Workout, WorkoutType } from '../lib/types'
import { parseDuration, formatDisplayDate, todayEyebrow } from '../lib/utils'
import { inferWorkoutType } from '../lib/types'
import { TypeBadge } from './TypeBadge'
import { ACCENT_DEFAULT } from '../lib/constants'

interface HeroCardProps {
  workout: Workout
  accent?: string
  isToday?: boolean
  pct: number
  onOpenSettings?: () => void
}

export function HeroCard({ workout, accent = ACCENT_DEFAULT, isToday = true, pct, onOpenSettings }: HeroCardProps) {
  const duration = parseDuration(workout.total_duration_minutes)
  const totalExercises = workout.rounds.reduce((a, r) => a + r.exercises.length, 0)
  const type: WorkoutType = inferWorkoutType(workout.muscle_groups, workout.workout_title)

  const eyebrow = isToday
    ? todayEyebrow()
    : `${workout.day_of_week.toUpperCase()} · ${formatDisplayDate(workout.date)}`

  return (
    <div className="relative overflow-hidden text-white" style={{ background: '#0A0A0A', padding: '20px 20px 24px' }}>
      {/* accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />

      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>
            {eyebrow}
          </div>
          <div className="mt-1.5 text-[32px] font-[800] uppercase leading-[1.05]" style={{ letterSpacing: -1 }}>
            {workout.workout_title}
          </div>
          <div className="mt-1.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: -0.1 }}>
            {workout.muscle_groups.join(' · ')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TypeBadge type={type} />
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="flex items-center justify-center p-0 border-none cursor-pointer"
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2" stroke="#fff" strokeWidth="1.5" />
                <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 3l-1.4 1.4M4.4 11.6L3 13M13 13l-1.4-1.4M4.4 4.4L3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.45)' }}>DURATION</div>
          <div className="text-[22px] font-[800] mt-0.5" style={{ letterSpacing: -0.8 }}>
            {duration}<span className="text-[11px] ml-[3px]" style={{ color: 'rgba(255,255,255,0.5)' }}>min</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.45)' }}>ROUNDS</div>
          <div className="text-[22px] font-[800] mt-0.5" style={{ letterSpacing: -0.8 }}>{workout.rounds.length}</div>
        </div>
        <div>
          <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.45)' }}>EXERCISES</div>
          <div className="text-[22px] font-[800] mt-0.5" style={{ letterSpacing: -0.8 }}>{totalExercises}</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-[18px]">
        <div className="flex justify-between mb-1.5 font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.55)' }}>
          <span>PROGRESS</span>
          <span style={{ color: accent }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full transition-[width] duration-300" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
    </div>
  )
}
