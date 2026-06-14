import type { Workout, Exercise, Round, LibraryCategoryId } from './types'
import { inferLibraryCategory } from './types'
import { formatDateISO } from './utils'

export type FocusId = 'upper' | 'lower' | 'full' | 'mat' | 'recovery' | 'mobility'
export type IntensityId = 'chill' | 'standard' | 'spicy'

export interface FocusOption {
  id: FocusId
  label: string
  desc: string
  muscles: string[]
}

export const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'upper',    label: 'Upper Body', desc: 'Chest, back, shoulders, arms', muscles: ['Chest', 'Back', 'Shoulders', 'Arms'] },
  { id: 'lower',    label: 'Lower Body', desc: 'Quads, glutes, hamstrings',     muscles: ['Quads', 'Glutes', 'Hamstrings'] },
  { id: 'full',     label: 'Full Body',  desc: 'Total-body conditioning',       muscles: ['Chest', 'Quads', 'Glutes', 'Shoulders', 'Core'] },
  { id: 'mat',      label: 'Mat',        desc: 'Floor work, core, flow',        muscles: ['Core', 'Glutes'] },
  { id: 'recovery', label: 'Recovery',   desc: 'Gentle, restorative',           muscles: ['Mobility', 'Recovery'] },
  { id: 'mobility', label: 'Mobility',   desc: 'Range of motion + control',     muscles: ['Mobility'] },
]

const INTENSITY: Record<IntensityId, { work: number; rest: number; label: string }> = {
  chill:    { work: 30, rest: 25, label: 'Chill' },
  standard: { work: 40, rest: 20, label: 'Standard' },
  spicy:    { work: 45, rest: 15, label: 'Spicy' },
}

// Focus → which Evlo library category to pull exercises from.
const FOCUS_CATEGORY: Record<FocusId, LibraryCategoryId> = {
  upper: 'UPPER', lower: 'LOWER', full: 'FULL', mat: 'MAT', recovery: 'MAT', mobility: 'MAT',
}

// Keyword bias for gentle / mobility-oriented movements.
const GENTLE_KEYWORDS = ['stretch', 'bridge', 'clam', 'glute', 'march', 'dead bug', 'bird', 'cat', 'breathing', 'hip', 'mobility', 'reach', 'rotation', 'roll', 'pelvic', 'fallout', 'plank', 'side lying', 'reverse table']

interface PoolExercise {
  name: string
  name_slug: string
  instructor_weight: string
}

// Collect unique exercises (with demos) for a focus, drawn from real Evlo sessions.
function buildPool(focus: FocusId, workouts: Workout[], hasDemo: (slug: string) => boolean): PoolExercise[] {
  const wantCat = FOCUS_CATEGORY[focus]
  const seen = new Map<string, PoolExercise>()
  for (const w of workouts) {
    const cat = inferLibraryCategory(w.track, w.muscle_groups, w.workout_title)
    if (cat !== wantCat) continue
    for (const r of w.rounds) {
      for (const ex of r.exercises) {
        if (!ex.name_slug || seen.has(ex.name_slug)) continue
        if (!hasDemo(ex.name_slug)) continue
        seen.set(ex.name_slug, {
          name: ex.name,
          name_slug: ex.name_slug,
          instructor_weight: ex.instructor_weight || '',
        })
      }
    }
  }
  let pool = [...seen.values()]
  if ((focus === 'recovery' || focus === 'mobility') && pool.length > 6) {
    const gentle = pool.filter(p => GENTLE_KEYWORDS.some(k => p.name.toLowerCase().includes(k)))
    if (gentle.length >= 3) pool = gentle
  }
  return pool
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export interface CustomSessionInput {
  focus: FocusId
  durationMin: number
  intensity: IntensityId
}

// Generates a Workout-shaped circuit from real Evlo exercises.
export function buildCustomSession(
  input: CustomSessionInput,
  workouts: Workout[],
  hasDemo: (slug: string) => boolean,
): Workout {
  const { focus, durationMin, intensity } = input
  const { work, rest } = INTENSITY[intensity]
  const focusOpt = FOCUS_OPTIONS.find(f => f.id === focus)!

  const pool = buildPool(focus, workouts, hasDemo)
  const secPerEx = work + rest
  const exPerRound = clamp(Math.round(durationMin / 8) + 2, 3, 6)
  const setSize = Math.min(exPerRound, pool.length || exPerRound)
  const numRounds = clamp(Math.round((durationMin * 60) / (Math.max(setSize, 1) * secPerEx)), 2, 5)

  const set = shuffle(pool).slice(0, setSize)

  const rounds: Round[] = []
  for (let r = 0; r < numRounds; r++) {
    const exercises: Exercise[] = set.map(p => ({
      name: p.name,
      name_slug: p.name_slug,
      instructor_weight: p.instructor_weight,
      reps_time: `${work} sec`,
      weight: '',
    }))
    rounds.push({ round_number: r + 1, timestamp: '', exercises })
  }

  const today = formatDateISO(new Date())
  const id = `custom_${focus}_${Date.now()}`

  return {
    workout_id: id,
    workout_title: `Custom ${focusOpt.label}`,
    track: `Custom · ${INTENSITY[intensity].label}`,
    week_start_date: today,
    week_end_date: today,
    week_label: 'Custom Session',
    day_of_week: '',
    date: today,
    muscle_groups: focusOpt.muscles,
    equipment: ['2 dumbbells'],
    total_duration_minutes: String(durationMin),
    full_video_filename: '',
    rounds,
    work_sec: work,
    rest_sec: rest,
  }
}

export { INTENSITY }
