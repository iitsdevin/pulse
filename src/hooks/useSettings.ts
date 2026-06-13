import { useState, useEffect, useCallback } from 'react'
import { getSettings, saveSettings } from '../lib/db'
import type { AppSettings } from '../lib/types'
import { DEFAULT_SETTINGS } from '../lib/constants'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS })

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial }
    setSettings(next)
    await saveSettings(partial)
  }, [settings])

  return { settings, update }
}
