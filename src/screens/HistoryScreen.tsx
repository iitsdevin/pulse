import type { Workout } from '../lib/types'
import { parseDuration, formatDisplayDate } from '../lib/utils'
import { inferWorkoutType } from '../lib/types'
import { TypeBadge } from '../components/TypeBadge'
import { ACCENT_DEFAULT } from '../lib/constants'
import type { CompletedWorkout } from '../lib/types'

interface HistoryScreenProps {
  workouts: Workout[]
  completedWorkouts: CompletedWorkout[]
  accent?: string
  onOpen: (workout: Workout) => void
}

export function HistoryScreen({ workouts, completedWorkouts, accent = ACCENT_DEFAULT, onOpen }: HistoryScreenProps) {
  // Build history from all workouts that have dates in the past
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const pastWorkouts = workouts
    .filter(w => w.date <= todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))

  const completedIds = new Set(completedWorkouts.map(c => c.workout_id))
  const totalMins = pastWorkouts.filter(w => completedIds.has(w.workout_id)).reduce((a, w) => a + parseDuration(w.total_duration_minutes), 0)
  const done = pastWorkouts.filter(w => completedIds.has(w.workout_id)).length

  // Simple streak calculation
  let streak = 0
  const sortedDone = completedWorkouts.map(c => c.completed_at.split('T')[0]).sort().reverse()
  if (sortedDone.length > 0) {
    const d = new Date(sortedDone[0])
    const check = new Date(todayStr)
    if (d >= new Date(check.getTime() - 86400000)) {
      streak = 1
      for (let i = 1; i < sortedDone.length; i++) {
        const prev = new Date(sortedDone[i - 1])
        const curr = new Date(sortedDone[i])
        const diff = (prev.getTime() - curr.getTime()) / 86400000
        if (diff <= 1.5) streak++
        else break
      }
    }
  }

  // Group into weeks
  const weeks: { label: string; items: Workout[] }[] = []
  const grouped = new Map<string, Workout[]>()
  for (const w of pastWorkouts) {
    const key = w.week_start_date || w.date
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(w)
  }
  for (const [key, items] of grouped) {
    weeks.push({ label: items[0]?.week_label || key, items })
  }

  return (
    <div className="pb-10">
      {/* Stats strip */}
      <div className="relative text-white" style={{ background: '#0A0A0A', padding: '16px 20px 20px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>RECENT ACTIVITY</div>

        <div className="grid grid-cols-3 gap-3 mt-3.5">
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.5)' }}>STREAK</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>
              {streak}<span className="text-[12px] ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>days</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.5)' }}>SESSIONS</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>{done}</div>
          </div>
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'rgba(255,255,255,0.5)' }}>TIME</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>
              {Math.round(totalMins / 60)}<span className="text-[12px] ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>hr</span>
            </div>
          </div>
        </div>

        {/* dot calendar — last 7 workouts */}
        <div className="flex gap-[5px] justify-between mt-4">
          {pastWorkouts.slice(0, 7).reverse().map((w, i) => {
            const isCompleted = completedIds.has(w.workout_id)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="font-mono text-[8px] font-bold" style={{ letterSpacing: 0.5, color: 'rgba(255,255,255,0.35)' }}>
                  {w.day_of_week[0].toUpperCase()}
                </div>
                <div
                  className="w-full h-[22px] rounded"
                  style={{
                    background: isCompleted ? accent : 'rgba(255,255,255,0.08)',
                    border: isCompleted ? 'none' : '1px dashed rgba(255,255,255,0.12)',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* workout list grouped by week */}
      <div className="px-4 pt-4">
        {weeks.map(group => (
          <div key={group.label} className="mb-4">
            <div className="font-mono text-[11px] font-bold px-1 pb-2.5 pt-1" style={{ letterSpacing: 2, color: 'rgba(255,255,255,0.5)' }}>
              {group.label.toUpperCase()}
            </div>
            <div className="overflow-hidden" style={{ background: '#151515', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              {group.items.map((w, i) => {
                const isCompleted = completedIds.has(w.workout_id)
                const type = inferWorkoutType(w.muscle_groups, w.workout_title)
                const duration = parseDuration(w.total_duration_minutes)
                const dayNum = w.date.split('-')[2]

                return (
                  <div
                    key={w.workout_id}
                    onClick={() => onOpen(w)}
                    className="flex items-center gap-3 cursor-pointer"
                    style={{
                      padding: '14px 16px',
                      borderBottom: i < group.items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}
                  >
                    {/* date block */}
                    <div className="w-[42px] text-center flex-shrink-0">
                      <div className="font-mono text-[9px] font-bold" style={{ letterSpacing: 0.8, color: 'rgba(255,255,255,0.4)' }}>
                        {w.day_of_week.toUpperCase()}
                      </div>
                      <div className="text-[18px] font-[800] text-white leading-none mt-0.5" style={{ letterSpacing: -0.5 }}>
                        {dayNum}
                      </div>
                    </div>
                    {/* name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-white truncate" style={{ letterSpacing: -0.2 }}>
                        {w.workout_title}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <TypeBadge type={type} size="sm" />
                        <span className="font-mono text-[10px]" style={{ letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)' }}>
                          {duration}min · {w.rounds.length}rd
                        </span>
                      </div>
                    </div>
                    {/* status */}
                    {isCompleted ? (
                      <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: accent }}>
                        <svg width="12" height="10" viewBox="0 0 12 10">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="#000" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="font-mono text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>
                        {formatDisplayDate(w.date)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
