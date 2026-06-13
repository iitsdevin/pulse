import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Workout, CompletedWorkout, PersonalRecord } from '../lib/types'
import { parseDuration } from '../lib/utils'
import { ACCENT_DEFAULT } from '../lib/constants'

interface StatsScreenProps {
  workouts: Workout[]
  completedWorkouts: CompletedWorkout[]
  personalRecords: PersonalRecord[]
  accent?: string
  // Concrete hex for the chart (Recharts can't read CSS variables in SVG attributes).
  chartAccent?: string
}

export function StatsScreen({ workouts, completedWorkouts, personalRecords, accent = ACCENT_DEFAULT, chartAccent = '#CCFF00' }: StatsScreenProps) {
  const completedIds = new Set(completedWorkouts.map(c => c.workout_id))

  // Weekly volume (minutes per week)
  const weeklyData = useMemo(() => {
    const weeks = new Map<string, number>()
    for (const w of workouts) {
      if (!completedIds.has(w.workout_id)) continue
      const weekKey = w.week_start_date || w.date.slice(0, 7)
      weeks.set(weekKey, (weeks.get(weekKey) || 0) + parseDuration(w.total_duration_minutes))
    }
    return Array.from(weeks.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, mins]) => ({ week: week.slice(5), minutes: mins }))
  }, [workouts, completedIds])

  // Body part distribution
  const muscleData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of workouts) {
      if (!completedIds.has(w.workout_id)) continue
      for (const g of w.muscle_groups) {
        counts.set(g, (counts.get(g) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([group, count]) => ({ group, count }))
  }, [workouts, completedIds])

  const totalWorkouts = completedWorkouts.length
  const totalMinutes = workouts.filter(w => completedIds.has(w.workout_id)).reduce((a, w) => a + parseDuration(w.total_duration_minutes), 0)
  const totalExercises = workouts.filter(w => completedIds.has(w.workout_id)).reduce((a, w) => a + w.rounds.reduce((b, r) => b + r.exercises.length, 0), 0)

  return (
    <div className="pb-10">
      {/* header */}
      <div className="relative text-white" style={{ background: 'var(--hero)', padding: '20px 20px 24px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>STATS</div>
        <div className="text-[32px] font-[800] uppercase mt-1" style={{ letterSpacing: -1 }}>Progress</div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'var(--on-hero-2)' }}>WORKOUTS</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>{totalWorkouts}</div>
          </div>
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'var(--on-hero-2)' }}>MINUTES</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>{totalMinutes}</div>
          </div>
          <div>
            <div className="font-mono text-[10px]" style={{ letterSpacing: 1, color: 'var(--on-hero-2)' }}>EXERCISES</div>
            <div className="text-[28px] font-[800] mt-0.5" style={{ letterSpacing: -1 }}>{totalExercises}</div>
          </div>
        </div>
      </div>

      {/* weekly volume chart */}
      <div className="px-4 pt-6">
        <div className="font-mono text-[11px] font-bold px-1 mb-3" style={{ letterSpacing: 2, color: 'var(--text-2)' }}>
          WEEKLY VOLUME
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '16px 12px', border: '1px solid var(--hairline)' }}>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.22)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(130,130,130,0.95)', fontSize: 10, fontFamily: 'ui-monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(130,130,130,0.95)', fontSize: 10, fontFamily: 'ui-monospace' }} axisLine={false} tickLine={false} />
                <Bar dataKey="minutes" fill={chartAccent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[13px]" style={{ color: 'var(--text-3)' }}>
              Complete workouts to see your volume chart
            </div>
          )}
        </div>
      </div>

      {/* muscle group distribution */}
      <div className="px-4 pt-6">
        <div className="font-mono text-[11px] font-bold px-1 mb-3" style={{ letterSpacing: 2, color: 'var(--text-2)' }}>
          MUSCLE GROUPS
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '16px', border: '1px solid var(--hairline)' }}>
          {muscleData.length > 0 ? (
            <div className="flex flex-col gap-3">
              {muscleData.map(({ group, count }) => (
                <div key={group} className="flex items-center gap-3">
                  <div className="text-[13px] font-semibold w-24 truncate">{group}</div>
                  <div className="flex-1 h-[6px] rounded-sm overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                    <div className="h-full rounded-sm" style={{ width: `${(count / muscleData[0].count) * 100}%`, background: accent }} />
                  </div>
                  <div className="font-mono text-[11px] font-bold w-6 text-right">{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center text-[13px]" style={{ color: 'var(--text-3)' }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* personal records */}
      <div className="px-4 pt-6">
        <div className="font-mono text-[11px] font-bold px-1 mb-3" style={{ letterSpacing: 2, color: 'var(--text-2)' }}>
          PERSONAL RECORDS
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
          {personalRecords.length > 0 ? (
            personalRecords.map((pr, i) => (
              <div
                key={pr.exercise_slug}
                className="flex items-center justify-between"
                style={{
                  padding: '14px 16px',
                  borderBottom: i < personalRecords.length - 1 ? '1px solid var(--hairline)' : 'none',
                }}
              >
                <div>
                  <div className="text-[14px] font-semibold">{pr.exercise_name}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Set {pr.set_at ? new Date(pr.set_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div className="text-[20px] font-[800]" style={{ letterSpacing: -0.5 }}>
                  {pr.weight}
                </div>
              </div>
            ))
          ) : (
            <div className="h-[80px] flex items-center justify-center text-[13px]" style={{ color: 'var(--text-3)' }}>
              Log weights to track PRs
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
