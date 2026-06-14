export interface Exercise {
  name: string
  name_slug: string
  instructor_weight?: string
  reps_time: string   // e.g. "60 sec", "12 reps", "AMRAP"
  weight: string      // user-logged weight (empty string if not set)
  video?: string      // demo video filename e.g. "chest_press.mp4"
}

export interface Round {
  round_number: number
  timestamp?: string
  exercises: Exercise[]
}

export interface Workout {
  workout_id: string
  workout_title: string
  track: string
  week_start_date: string
  week_end_date: string
  week_label: string
  day_of_week: string   // "mon" | "tue" | ...
  date: string          // "YYYY-MM-DD"
  muscle_groups: string[]
  equipment: string[]
  total_duration_minutes: string
  full_video_filename: string
  rounds: Round[]
  // Optional per-session timing (custom sessions); falls back to global settings.
  work_sec?: number
  rest_sec?: number
}

// Derived/enriched types used in the UI
export interface WorkoutMeta {
  workout_id: string
  workout_title: string
  date: string
  day_of_week: string
  muscle_groups: string[]
  total_duration_minutes: string
  full_video_filename: string
  track: string
  week_label: string
}

export type LibraryCategoryId = 'UPPER' | 'LOWER' | 'BUILDPLUS' | 'MAT' | 'FULL'

export interface LibraryCategory {
  id: LibraryCategoryId
  title: string
  desc: string
  hue: string    // rgba tint for gradient
  accent: string // hex accent color
}

export interface VideoManifest {
  workouts: Record<string, string>
  demos: Record<string, string>
}

// Dexie-stored types
export interface CompletedWorkout {
  id?: number
  workout_id: string
  completed_at: string  // ISO date
  exercises_done: number
  exercises_total: number
}

export interface LoggedWeight {
  id?: number
  workout_id: string
  exercise_slug: string
  weight: string
  logged_at: string
}

export interface PersonalRecord {
  id?: number
  exercise_slug: string
  exercise_name: string
  weight: string
  set_at: string
}

export interface AIProgramEntry {
  id?: number
  created_at: string
  prompt: string
  program: Record<string, string>  // { monday: workout_id, tuesday: workout_id, ... }
}

export interface FavouriteEntry {
  id?: number
  workout_id: string
  saved_at: string
  workout: Workout  // full snapshot so custom sessions survive
}

export type ThemeId = 'ink' | 'midnight' | 'sand' | 'forest' | 'dusk'

export interface AppSettings {
  id?: number
  rest_sec: number
  work_sec: number
  prestart_sec: number
  sound: boolean
  haptics: boolean
  autoplay: boolean
  theme: ThemeId
  api_key: string
}

// Workout type badge
export type WorkoutType = 'UPPER' | 'LOWER' | 'FULL' | 'MAT' | 'BUILDPLUS'

// Maps muscle groups + title → workout type badge
export function inferWorkoutType(muscleGroups: string[], title: string): WorkoutType {
  const titleLower = title.toLowerCase()

  // Title-based checks for Mat and Full Body
  if (titleLower.includes('mat')) return 'MAT'
  if (titleLower.includes('full body')) return 'FULL'

  // Muscle-group based inference
  const groups = muscleGroups.map(g => g.toLowerCase())
  const upperKeywords = ['chest', 'biceps', 'shoulders', 'triceps', 'back', 'arms']
  const lowerKeywords = ['quads', 'glutes', 'hamstrings', 'calves', 'legs']
  const hasUpper = groups.some(g => upperKeywords.includes(g))
  const hasLower = groups.some(g => lowerKeywords.includes(g))

  if (hasUpper && hasLower) return 'FULL'
  if (hasLower) return 'LOWER'
  if (hasUpper) return 'UPPER'

  // Fallback: check title for upper/lower keywords
  if (titleLower.includes('upper')) return 'UPPER'
  if (titleLower.includes('lower')) return 'LOWER'

  return 'FULL'
}

// Maps workout title + muscle groups → library category
export function inferLibraryCategory(_track: string, muscleGroups: string[], title?: string): LibraryCategoryId {
  const t = (title || '').toLowerCase()
  if (t.includes('mat')) return 'MAT'
  if (t.includes('full body')) return 'FULL'

  const type = inferWorkoutType(muscleGroups, title || '')
  if (type === 'UPPER') return 'UPPER'
  if (type === 'LOWER') return 'LOWER'
  if (type === 'MAT') return 'MAT'
  return 'FULL'
}
