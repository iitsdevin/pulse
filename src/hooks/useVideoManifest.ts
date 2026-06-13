import { useCallback } from 'react'
import { useAuth } from '../lib/auth'

// The manifest is decrypted at login and held in auth context (never fetched in clear).
export function useVideoManifest() {
  const { manifest } = useAuth()
  const workouts = manifest?.workouts ?? {}
  const demos = manifest?.demos ?? {}

  const getWorkoutVideoUrl = useCallback(
    (filename: string) => workouts[filename] || '',
    [workouts],
  )

  const getDemoVideoUrl = useCallback(
    (slug: string) => demos[`${slug}.mp4`] || '',
    [demos],
  )

  return { manifest, getWorkoutVideoUrl, getDemoVideoUrl }
}
