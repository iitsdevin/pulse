import type { AppSettings } from '../lib/types'

interface SettingsSheetProps {
  visible: boolean
  onClose: () => void
  settings: AppSettings
  onUpdate: (partial: Partial<AppSettings>) => void
}

export function SettingsSheet({ visible, onClose, settings, onUpdate }: SettingsSheetProps) {
  if (!visible) return null

  const stepper = (val: number, min: number, max: number, step: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 3 }}>
      <button
        onClick={() => onChange(Math.max(min, val - step))}
        className="flex items-center justify-center p-0 border-none cursor-pointer text-white"
        style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          fontSize: 18, fontWeight: 600,
          opacity: val <= min ? 0.3 : 1,
        }}
      >−</button>
      <div className="min-w-[46px] text-center font-mono text-[14px] font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {val}s
      </div>
      <button
        onClick={() => onChange(Math.min(max, val + step))}
        className="flex items-center justify-center p-0 border-none cursor-pointer text-white"
        style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          fontSize: 18, fontWeight: 600,
          opacity: val >= max ? 0.3 : 1,
        }}
      >+</button>
    </div>
  )

  const toggle = (val: boolean, onChange: (v: boolean) => void) => (
    <button
      onClick={() => onChange(!val)}
      className="relative p-0 border-none cursor-pointer"
      style={{
        width: 48, height: 28, borderRadius: 999,
        background: val ? '#34C759' : 'rgba(255,255,255,0.15)',
        transition: 'background 0.15s',
      }}
    >
      <div
        className="absolute top-[2px] rounded-full bg-white"
        style={{
          left: val ? 22 : 2,
          width: 24, height: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.18s',
        }}
      />
    </button>
  )

  const row = (label: string, children: React.ReactNode, sub?: string) => (
    <div className="flex items-center justify-between gap-3" style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div className="text-[14px] font-semibold text-white" style={{ letterSpacing: -0.1 }}>{label}</div>
        {sub && <div className="font-mono text-[10px] mt-0.5" style={{ letterSpacing: 0.3, color: 'rgba(255,255,255,0.45)' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} className="fixed inset-0 z-[80] animate-fade-in" style={{ background: 'rgba(0,0,0,0.4)' }} />
      {/* sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] animate-slide-up" style={{ background: '#151517', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, boxShadow: '0 -20px 60px rgba(0,0,0,0.3)' }}>
        {/* grabber */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-[38px] h-[5px] rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>
        {/* header */}
        <div className="flex items-center justify-between" style={{ padding: '12px 18px 14px' }}>
          <div className="text-[22px] font-[800] text-white" style={{ letterSpacing: -0.5 }}>Settings</div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-0 border-none cursor-pointer text-white text-[18px] font-medium"
            style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, width: 32, height: 32 }}
          >×</button>
        </div>

        {/* timer section */}
        <div className="font-mono text-[10px] font-bold" style={{ padding: '8px 18px 6px', letterSpacing: 1.5, color: 'rgba(255,255,255,0.45)' }}>TIMER</div>
        <div className="mx-3.5 overflow-hidden" style={{ background: '#1C1C1E', borderRadius: 16 }}>
          {row('Rest between sets', stepper(settings.rest_sec, 5, 180, 5, v => onUpdate({ rest_sec: v })), "Overrides each round's default rest")}
          {row('Work interval', stepper(settings.work_sec, 10, 180, 5, v => onUpdate({ work_sec: v })), 'For timed exercises only')}
          {row('Countdown before start', stepper(settings.prestart_sec, 0, 15, 1, v => onUpdate({ prestart_sec: v })), '3-2-1 before first round begins')}
        </div>

        {/* feedback section */}
        <div className="font-mono text-[10px] font-bold" style={{ padding: '18px 18px 6px', letterSpacing: 1.5, color: 'rgba(255,255,255,0.45)' }}>FEEDBACK</div>
        <div className="mx-3.5 overflow-hidden" style={{ background: '#1C1C1E', borderRadius: 16 }}>
          {row('Beep on phase change', toggle(settings.sound, v => onUpdate({ sound: v })))}
          {row('Haptic feedback', toggle(settings.haptics, v => onUpdate({ haptics: v })))}
          {row('Auto-play next round', toggle(settings.autoplay, v => onUpdate({ autoplay: v })), 'Chain rounds without tapping ▶')}
        </div>

        <div className="font-mono text-[11px] text-center mt-4" style={{ letterSpacing: 0.5, color: 'rgba(255,255,255,0.35)' }}>
          Applies to every round on every workout
        </div>
      </div>
    </>
  )
}
