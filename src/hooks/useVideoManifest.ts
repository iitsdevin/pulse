import { useState, useEffect, useCallback } from 'react'
import type { VideoManifest } from '../lib/types'

const MANIFEST_PATH = `${import.meta.env.BASE_URL}video-manifest.json`

export function useVideoManifest() {
  const [manifest, setManifest] = useState<VideoManifest>({ workouts: {}, demos: {} })

  useEffect(() => {
    fetch(MANIFEST_PATH)
      .then(r => r.json() as Promise<VideoManifest>)
      .then(setManifest)
      .catch(() => {})
  }, [])

  const getWorkoutVideoUrl = useCallback(
    (filename: string) => manifest.workouts[filename] || '',
    [manifest],
  )

  const getDemoVideoUrl = useCallback(
    (slug: string) => manifest.demos[`${slug}.mp4`] || '',
    [manifest],
  )

  return { manifest, getWorkoutVideoUrl, getDemoVideoUrl }
}
