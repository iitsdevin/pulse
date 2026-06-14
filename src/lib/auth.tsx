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

// Decrypted manifest is cached in localStorage so the user stays logged in on
// this device across browser restarts (until they explicitly log out).
const STORE_KEY = 'pulse_manifest'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [manifest, setManifest] = useState<VideoManifest | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem(STORE_KEY) ?? sessionStorage.getItem(STORE_KEY)
    if (cached) {
      try { setManifest(JSON.parse(cached) as VideoManifest) } catch { /* ignore */ }
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const blob = (await fetch(`${import.meta.env.BASE_URL}video-manifest.enc.json`).then((r) => r.json())) as EncBlob
      const m = await decryptManifest(blob, username, password)
      setManifest(m)
      localStorage.setItem(STORE_KEY, JSON.stringify(m))
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORE_KEY)
    sessionStorage.removeItem(STORE_KEY)
    setManifest(null)
  }, [])

  return <Ctx.Provider value={{ manifest, login, logout }}>{children}</Ctx.Provider>
}
