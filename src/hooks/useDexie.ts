import { useState, useEffect, useCallback } from 'react'
import {
  getCompletedWorkouts,
  markWorkoutComplete,
  getLoggedWeightsForWorkout,
  logWeight,
  getPersonalRecords,
} from '../lib/db'
import type { CompletedWorkout, PersonalRecord } from '../lib/types'

export function useCompletedWorkouts() {
  const [completed, setCompleted] = useState<CompletedWorkout[]>([])

  const refresh = useCallback(async () => {
    setCompleted(await getCompletedWorkouts())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const complete = useCallback(async (
    workout_id: string,
    exercises_done: number,
    exercises_total: number,
  ) => {
    await markWorkoutComplete(workout_id, exercises_done, exercises_total)
    await refresh()
  }, [refresh])

  const isCompleted = useCallback(
    (workout_id: string) => completed.some(c => c.workout_id === workout_id),
    [completed],
  )

  return { completed, complete, isCompleted, refresh }
}

export function useLoggedWeights(workout_id: string) {
  const [weights, setWeights] = useState<Record<string, string>>({})

  const refresh = useCallback(async () => {
    if (!workout_id) return
    setWeights(await getLoggedWeightsForWorkout(workout_id))
  }, [workout_id])

  useEffect(() => { refresh() }, [refresh])

  const log = useCallback(async (exercise_slug: string, weight: string) => {
    await logWeight(workout_id, exercise_slug, weight)
    await refresh()
  }, [workout_id, refresh])

  return { weights, log, refresh }
}

export function usePersonalRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>([])

  useEffect(() => {
    getPersonalRecords().then(setRecords)
  }, [])

  return records
}
