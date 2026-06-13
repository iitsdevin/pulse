import { useState, type FormEvent } from 'react'
import { ACCENT_DEFAULT } from '../lib/constants'
import { useAuth } from '../lib/auth'

export function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const accent = ACCENT_DEFAULT

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(false)
    const ok = await login(username, password)
    if (!ok) {
      setError(true)
      setPassword('')
    }
    setBusy(false)
  }

  const inputStyle = {
    background: '#141416',
    border: '1px solid rgba(255,255,255,0.10)',
    color: '#fff',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#0A0A0B' }}>
      <div className="w-full max-w-[320px]">
        <div className="font-mono font-bold text-[26px] tracking-[6px] text-center" style={{ color: accent }}>
          PULSE
        </div>
        <div className="font-mono text-[10px] tracking-[2px] text-center mt-2 mb-9" style={{ color: 'rgba(255,255,255,0.4)' }}>
          PRIVATE TRAINING LIBRARY
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-xl px-4 py-3 text-[15px] outline-none"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl px-4 py-3 text-[15px] outline-none"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={busy || !username || !password}
            className="rounded-xl py-3 font-mono font-bold text-[13px] tracking-[2px] mt-1 disabled:opacity-40"
            style={{ background: accent, color: '#06222a' }}
          >
            {busy ? 'CHECKING…' : 'ENTER'}
          </button>
        </form>

        {error && (
          <div className="font-mono text-[11px] text-center mt-4" style={{ color: '#FF5C5C' }}>
            Incorrect username or password.
          </div>
        )}
      </div>
    </div>
  )
}
