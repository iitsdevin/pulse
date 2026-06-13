import { useState, useEffect, useMemo } from 'react'
import type { Workout } from '../lib/types'
import { getTodayWorkout } from '../lib/utils'

// Data source — served from public/ so it works in dev and on GitHub Pages
const DATA_SOURCE = `${import.meta.env.BASE_URL}workouts.json`

interface UseWorkoutsReturn {
  workouts: Workout[]
  todayWorkout: Workout | null
  loading: boolean
  error: string | null
  getWorkoutById: (id: string) => Workout | undefined
}

export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(DATA_SOURCE)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load workouts: ${r.status}`)
        return r.json() as Promise<Workout[]>
      })
      .then(data => {
        setWorkouts(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      })
  }, [])

  const todayWorkout = useMemo(() => getTodayWorkout(workouts), [workouts])

  const getWorkoutById = (id: string) => workouts.find(w => w.workout_id === id)

  return { workouts, todayWorkout, loading, error, getWorkoutById }
}
