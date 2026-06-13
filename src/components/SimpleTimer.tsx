import { useState, useEffect } from 'react'
import { ACCENT_DEFAULT } from '../lib/constants'

interface SimpleTimerProps {
  seconds: number
  accent?: string
}

export function SimpleTimer({ seconds, accent = ACCENT_DEFAULT }: SimpleTimerProps) {
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => { setRemaining(seconds); setRunning(false) }, [seconds])

  useEffect(() => {
    if (!running || remaining <= 0) { if (remaining <= 0) setRunning(false); return }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining])

  const progress = 1 - (remaining / seconds)
  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-2.5 rounded-chip" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)' }}>
      <button
        onClick={() => { if (remaining === 0) setRemaining(seconds); setRunning(r => !r) }}
        className="flex-shrink-0 flex items-center justify-center p-0 border-none cursor-pointer"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: running ? '#fff' : accent,
        }}
      >
        {running ? (
          <span className="inline-flex gap-0.5">
            <span className="w-[3px] h-[10px] rounded-sm bg-black" />
            <span className="w-[3px] h-[10px] rounded-sm bg-black" />
          </span>
        ) : (
          <svg width="8" height="10" viewBox="0 0 8 10"><path d="M0 0L8 5L0 10Z" fill="#000" /></svg>
        )}
      </button>
      <div className="flex-1">
        <div className="font-mono text-[16px] font-bold text-white leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {mm}:{ss}
        </div>
        <div className="mt-1.5 h-[3px] rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full transition-[width] duration-1000 linear" style={{ width: `${progress * 100}%`, background: accent }} />
        </div>
      </div>
      <div className="font-mono text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>/ {seconds}s</div>
    </div>
  )
}
