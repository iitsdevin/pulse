import { useState } from 'react'
import { FOCUS_OPTIONS, INTENSITY, type FocusId, type IntensityId, type CustomSessionInput } from '../lib/sessionBuilder'

interface CustomSessionSheetProps {
  visible: boolean
  onClose: () => void
  onStart: (input: CustomSessionInput) => void
}

const INTENSITIES: IntensityId[] = ['chill', 'standard', 'spicy']

export function CustomSessionSheet({ visible, onClose, onStart }: CustomSessionSheetProps) {
  const [focus, setFocus] = useState<FocusId>('upper')
  const [duration, setDuration] = useState(20)
  const [intensity, setIntensity] = useState<IntensityId>('standard')

  if (!visible) return null

  const sectionLabel = (t: string) => (
    <div className="font-mono text-[10px] font-bold" style={{ padding: '18px 18px 8px', letterSpacing: 1.5, color: 'var(--text-3)' }}>{t}</div>
  )

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[80] animate-fade-in" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[90] animate-slide-up scrollbar-none"
        style={{ background: 'var(--surface)', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 36, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -20px 60px rgba(0,0,0,0.35)' }}
      >
        <div className="flex justify-center pt-2.5 pb-1 sticky top-0" style={{ background: 'var(--surface)' }}>
          <div className="w-[38px] h-[5px] rounded" style={{ background: 'var(--surface-3)' }} />
        </div>
        <div className="flex items-center justify-between" style={{ padding: '6px 18px 2px' }}>
          <div>
            <div className="text-[22px] font-[800]" style={{ letterSpacing: -0.5, color: 'var(--text-1)' }}>Custom Session</div>
            <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>Built from real Evlo movements</div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center p-0 border-none cursor-pointer text-[18px] font-medium"
            style={{ background: 'var(--surface-3)', color: 'var(--text-1)', borderRadius: 999, width: 32, height: 32 }}>×</button>
        </div>

        {/* FOCUS */}
        {sectionLabel('FOCUS')}
        <div className="grid grid-cols-2 gap-2.5 mx-3.5">
          {FOCUS_OPTIONS.map(f => {
            const active = focus === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFocus(f.id)}
                className="p-0 border-none cursor-pointer text-left"
                style={{
                  borderRadius: 14, padding: '12px 13px',
                  background: active ? 'var(--accent)' : 'var(--surface-2)',
                  outline: active ? 'none' : '1px solid var(--hairline)',
                }}
              >
                <div className="text-[14px] font-bold" style={{ color: active ? 'var(--accent-on)' : 'var(--text-1)' }}>{f.label}</div>
                <div className="font-mono text-[9px] mt-1 leading-tight" style={{ color: active ? 'var(--accent-on)' : 'var(--text-3)', opacity: active ? 0.8 : 1 }}>{f.desc}</div>
              </button>
            )
          })}
        </div>

        {/* DURATION */}
        {sectionLabel('DURATION')}
        <div className="mx-3.5" style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '16px 18px' }}>
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[15px] font-semibold" style={{ color: 'var(--text-1)' }}>Target length</div>
            <div className="font-mono font-[800] text-[26px]" style={{ color: 'var(--accent-ink)', letterSpacing: -1 }}>
              {duration}<span className="text-[12px] ml-0.5" style={{ color: 'var(--text-3)' }}>min</span>
            </div>
          </div>
          <input
            type="range" min={5} max={60} step={5}
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value, 10))}
            className="pulse-range w-full"
          />
          <div className="flex justify-between mt-1 font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>
            <span>5</span><span>60</span>
          </div>
        </div>

        {/* INTENSITY */}
        {sectionLabel('INTENSITY')}
        <div className="mx-3.5 flex gap-2">
          {INTENSITIES.map(i => {
            const active = intensity === i
            return (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className="flex-1 p-0 border-none cursor-pointer"
                style={{ borderRadius: 12, padding: '11px 0', background: active ? 'var(--accent)' : 'var(--surface-2)', outline: active ? 'none' : '1px solid var(--hairline)' }}
              >
                <div className="text-[13px] font-bold" style={{ color: active ? 'var(--accent-on)' : 'var(--text-1)' }}>{INTENSITY[i].label}</div>
                <div className="font-mono text-[9px] mt-0.5" style={{ color: active ? 'var(--accent-on)' : 'var(--text-3)', opacity: active ? 0.8 : 1 }}>{INTENSITY[i].work}s / {INTENSITY[i].rest}s</div>
              </button>
            )
          })}
        </div>

        {/* START */}
        <div className="mx-3.5 mt-5">
          <button
            onClick={() => onStart({ focus, durationMin: duration, intensity })}
            className="w-full font-mono text-[13px] font-bold border-none cursor-pointer"
            style={{ background: 'var(--accent)', color: 'var(--accent-on)', padding: '15px 0', borderRadius: 14, letterSpacing: 1.5 }}
          >
            BUILD SESSION →
          </button>
        </div>
      </div>
    </>
  )
}
