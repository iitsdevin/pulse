import { useMemo } from 'react'
import type { Workout } from '../lib/types'

export interface ExerciseEntry {
  name: string
  slug: string
  seen_in: string[] // workout_ids
}

export function useExerciseLibrary(workouts: Workout[]): ExerciseEntry[] {
  return useMemo(() => {
    const map = new Map<string, ExerciseEntry>()
    for (const w of workouts) {
      for (const r of w.rounds) {
        for (const ex of r.exercises) {
          const slug = ex.name_slug
          if (map.has(slug)) {
            const entry = map.get(slug)!
            if (!entry.seen_in.includes(w.workout_id)) {
              entry.seen_in.push(w.workout_id)
            }
          } else {
            map.set(slug, { name: ex.name, slug, seen_in: [w.workout_id] })
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [workouts])
}
