import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { VideoManifest } from './types'
import { decryptManifest, type EncBlob } from './crypto'

interface AuthCtx {
  manifest: VideoManifest | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const Ctx = createContext<AuthCtx>({
  manifest: null,
  login: async () => false,
  logout: () => {},
})

export const useAuth = () => useContext(Ctx)

// Decrypted manifest is cached for the browser session so reloads don't re-prompt.
const SESSION_KEY = 'pulse_manifest'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<VideoManifest | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY)
    if (cached) {
      try { setManifest(JSON.parse(cached) as VideoManifest) } catch { /* ignore */ }
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const blob = (await fetch(`${import.meta.env.BASE_URL}video-manifest.enc.json`).then((r) => r.json())) as EncBlob
      const m = await decryptManifest(blob, username, password)
      setManifest(m)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(m))
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setManifest(null)
  }, [])

  return <Ctx.Provider value={{ manifest, login, logout }}>{children}</Ctx.Provider>
}
