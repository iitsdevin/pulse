import { DAYS_OF_WEEK } from './constants'
import type { Workout } from './types'

export function getTodayWorkout(workouts: Workout[]): Workout | null {
  const today = new Date()
  const todayStr = formatDateISO(today)
  return workouts.find(w => w.date === todayStr) ?? null
}

export function getWorkoutForDate(workouts: Workout[], dateStr: string): Workout | null {
  return workouts.find(w => w.date === dateStr) ?? null
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }).toUpperCase()
}

export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return DAYS_OF_WEEK[d.getDay()].toUpperCase()
}

export function getDayOfWeekIndex(dayStr: string): number {
  return DAYS_OF_WEEK.indexOf(dayStr.toLowerCase())
}

export function parseDuration(total_duration_minutes: string): number {
  return parseInt(total_duration_minutes, 10) || 0
}

// Parse reps_time field: "60 sec" → { type: 'time', value: 60 }
// "12 reps" → { type: 'reps', value: 12 }
// "AMRAP" → { type: 'reps', value: 'AMRAP' }
export type ExerciseMetric =
  | { type: 'time'; value: number }
  | { type: 'reps'; value: number | string }

export function parseRepsTime(reps_time: string): ExerciseMetric {
  const str = (reps_time || '').trim()
  const secMatch = str.match(/^(\d+)\s*sec/)
  if (secMatch) return { type: 'time', value: parseInt(secMatch[1], 10) }
  const repMatch = str.match(/^(\d+)/)
  if (repMatch) return { type: 'reps', value: parseInt(repMatch[1], 10) }
  return { type: 'reps', value: str || '—' }
}

export function slugToName(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Derive today's date string for the eyebrow label
export function todayEyebrow(): string {
  const d = new Date()
  const month = d.toLocaleDateString('en-AU', { month: 'short' }).toUpperCase()
  const day = d.getDate()
  return `TODAY · ${month} ${day}`
}

// Group workouts by week (keyed by week_start_date)
export function groupByWeek(workouts: Workout[]): Map<string, Workout[]> {
  const map = new Map<string, Workout[]>()
  for (const w of workouts) {
    const key = w.week_start_date
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(w)
  }
  return map
}

export function pluralise(n: number, singular: string, plural = singular + 's'): string {
  return n === 1 ? singular : plural
}
