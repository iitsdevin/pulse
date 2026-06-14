import { useState, useEffect, useCallback } from 'react'
import { getFavourites, addFavourite, removeFavourite } from '../lib/db'
import type { Workout } from '../lib/types'

export function useFavourites() {
  const [favourites, setFavourites] = useState<Workout[]>([])

  const refresh = useCallback(async () => {
    const rows = await getFavourites()
    setFavourites(rows.map(r => r.workout))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const isFavourite = useCallback(
    (workout_id: string) => favourites.some(w => w.workout_id === workout_id),
    [favourites],
  )

  const toggle = useCallback(async (workout: Workout) => {
    if (favourites.some(w => w.workout_id === workout.workout_id)) {
      await removeFavourite(workout.workout_id)
    } else {
      await addFavourite(workout)
    }
    await refresh()
  }, [favourites, refresh])

  return { favourites, isFavourite, toggle }
}
