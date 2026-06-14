import { useState } from 'react'
import type { AppSettings, ThemeId } from '../lib/types'
import { THEMES } from '../lib/constants'
import { useAuth } from '../lib/auth'
import { encryptManifest, downloadJSON } from '../lib/crypto'
import { resetHistory } from '../lib/db'

interface SettingsSheetProps {
  visible: boolean
  onClose: () => void
  settings: AppSettings
  onUpdate: (partial: Partial<AppSettings>) => void
}

export function SettingsSheet({ visible, onClose, settings, onUpdate }: SettingsSheetProps) {
  const { manifest, logout } = useAuth()
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [credDone, setCredDone] = useState(false)

  if (!visible) return null

  const stepper = (val: number, min: number, max: number, step: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-2" style={{ background: 'var(--surface-2)', borderRadius: 999, padding: 3 }}>
      <button
        onClick={() => onChange(Math.max(min, val - step))}
        className="flex items-center justify-center p-0 border-none cursor-pointer"
        style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-3)', color: 'var(--text-1)', fontSize: 18, fontWeight: 600, opacity: val <= min ? 0.3 : 1 }}
      >−</button>
      <div className="min-w-[46px] text-center font-mono text-[14px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-1)' }}>
        {val}s
      </div>
      <button
        onClick={() => onChange(Math.min(max, val + step))}
        className="flex items-center justify-center p-0 border-none cursor-pointer"
        style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-3)', color: 'var(--text-1)', fontSize: 18, fontWeight: 600, opacity: val >= max ? 0.3 : 1 }}
      >+</button>
    </div>
  )

  const toggle = (val: boolean, onChange: (v: boolean) => void) => (
    <button
      onClick={() => onChange(!val)}
      className="relative p-0 border-none cursor-pointer"
      style={{ width: 48, height: 28, borderRadius: 999, background: val ? '#34C759' : 'var(--surface-3)', transition: 'background 0.15s' }}
    >
      <div className="absolute top-[2px] rounded-full" style={{ left: val ? 22 : 2, width: 24, height: 24, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.18s' }} />
    </button>
  )

  const row = (label: string, children: React.ReactNode, sub?: string) => (
    <div className="flex items-center justify-between gap-3" style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline)' }}>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold" style={{ letterSpacing: -0.1, color: 'var(--text-1)' }}>{label}</div>
        {sub && <div className="font-mono text-[10px] mt-0.5" style={{ letterSpacing: 0.3, color: 'var(--text-3)' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  const sectionLabel = (t: string) => (
    <div className="font-mono text-[10px] font-bold" style={{ padding: '18px 18px 6px', letterSpacing: 1.5, color: 'var(--text-3)' }}>{t}</div>
  )

  const card = (children: React.ReactNode) => (
    <div className="mx-3.5 overflow-hidden" style={{ background: 'var(--surface-2)', borderRadius: 16 }}>{children}</div>
  )

  const generateCreds = async () => {
    if (!manifest || !newUser.trim() || !newPass) return
    const blob = await encryptManifest(manifest, newUser.trim(), newPass)
    downloadJSON('video-manifest.enc.json', blob)
    setCredDone(true)
  }

  const doReset = () => {
    if (window.confirm('Reset all history? This clears completed workouts, logged weights, and PRs. Your videos and settings are kept.')) {
      resetHistory().then(() => window.location.reload())
    }
  }

  const fieldStyle = {
    background: 'var(--bg)', border: '1px solid var(--hairline)', color: 'var(--text-1)',
    borderRadius: 10, padding: '10px 12px', fontSize: 14, width: '100%', outline: 'none' as const,
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[80] animate-fade-in" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[90] animate-slide-up scrollbar-none"
        style={{
          background: 'var(--surface)', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingBottom: 40, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex justify-center pt-2.5 pb-1 sticky top-0" style={{ background: 'var(--surface)' }}>
          <div className="w-[38px] h-[5px] rounded" style={{ background: 'var(--surface-3)' }} />
        </div>
        <div className="flex items-center justify-between" style={{ padding: '6px 18px 4px' }}>
          <div className="text-[22px] font-[800]" style={{ letterSpacing: -0.5, color: 'var(--text-1)' }}>Settings</div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-0 border-none cursor-pointer text-[18px] font-medium"
            style={{ background: 'var(--surface-3)', color: 'var(--text-1)', borderRadius: 999, width: 32, height: 32 }}
          >×</button>
        </div>

        {/* APPEARANCE */}
        {sectionLabel('APPEARANCE')}
        <div className="grid grid-cols-3 gap-2.5 mx-3.5">
          {THEMES.map(t => {
            const active = settings.theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => onUpdate({ theme: t.id as ThemeId })}
                className="p-0 border-none cursor-pointer text-left overflow-hidden"
                style={{
                  borderRadius: 14, background: 'var(--surface-2)',
                  outline: active ? '2px solid var(--accent)' : '1px solid var(--hairline)',
                  outlineOffset: active ? 0 : -1,
                }}
              >
                <div className="relative h-[54px]" style={{ background: t.swatch.bg }}>
                  <div className="absolute left-2 bottom-2 right-2 h-[18px] rounded" style={{ background: t.swatch.surface }} />
                  <div className="absolute right-2 top-2 w-3.5 h-3.5 rounded-full" style={{ background: t.swatch.accent }} />
                  {active && (
                    <div className="absolute left-2 top-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                      <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3.5 6L8 1" stroke="var(--accent-on)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                </div>
                <div style={{ padding: '7px 9px 9px' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--text-1)' }}>{t.name}</div>
                  <div className="font-mono text-[8px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{t.blurb}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* AI */}
        {sectionLabel('AI PROGRAMMING')}
        {card(
          <div style={{ padding: '14px 16px' }}>
            <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Anthropic API key</div>
            <div className="font-mono text-[10px] mb-2.5" style={{ color: 'var(--text-3)' }}>
              Powers the Program tab. Stored only on this device.
            </div>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={settings.api_key}
              onChange={e => onUpdate({ api_key: e.target.value })}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="font-mono"
              style={{ ...fieldStyle, fontSize: 13 }}
            />
          </div>,
        )}

        {/* TIMER */}
        {sectionLabel('TIMER')}
        {card(
          <>
            {row('Rest between sets', stepper(settings.rest_sec, 5, 180, 5, v => onUpdate({ rest_sec: v })), "Overrides each round's default rest")}
            {row('Work interval', stepper(settings.work_sec, 10, 180, 5, v => onUpdate({ work_sec: v })), 'For timed exercises only')}
            {row('Countdown before start', stepper(settings.prestart_sec, 0, 15, 1, v => onUpdate({ prestart_sec: v })), '3-2-1 before first round begins')}
          </>,
        )}

        {/* FEEDBACK */}
        {sectionLabel('FEEDBACK')}
        {card(
          <>
            {row('Beep on phase change', toggle(settings.sound, v => onUpdate({ sound: v })))}
            {row('Haptic feedback', toggle(settings.haptics, v => onUpdate({ haptics: v })))}
            {row('Auto-play next round', toggle(settings.autoplay, v => onUpdate({ autoplay: v })), 'Chain rounds without tapping ▶')}
          </>,
        )}

        {/* ACCOUNT */}
        {sectionLabel('LOGIN & PRIVACY')}
        {card(
          <div style={{ padding: '14px 16px' }}>
            <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Change username &amp; password</div>
            <div className="font-mono text-[10px] mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              This re-encrypts your video links with new credentials and downloads a
              <span style={{ color: 'var(--text-2)' }}> video-manifest.enc.json</span> file. Replace the one in your
              project's <span style={{ color: 'var(--text-2)' }}>public/</span> folder and push to apply.
            </div>
            <div className="flex flex-col gap-2">
              <input type="text" placeholder="New username" value={newUser} onChange={e => { setNewUser(e.target.value); setCredDone(false) }} autoCapitalize="none" autoCorrect="off" style={fieldStyle} />
              <input type="password" placeholder="New password" value={newPass} onChange={e => { setNewPass(e.target.value); setCredDone(false) }} style={fieldStyle} />
              <button
                onClick={generateCreds}
                disabled={!newUser.trim() || !newPass || !manifest}
                className="font-mono text-[12px] font-bold border-none cursor-pointer disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--accent-on)', padding: '11px 0', borderRadius: 10, letterSpacing: 1 }}
              >
                {credDone ? 'DOWNLOADED ✓ — REPLACE & PUSH' : 'DOWNLOAD NEW CREDENTIALS FILE'}
              </button>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--hairline)' }}>
              <div className="font-mono text-[10px] mb-2" style={{ color: 'var(--text-3)' }}>
                You stay logged in on this device. Log out to require the password again.
              </div>
              <button
                onClick={logout}
                className="w-full font-mono text-[12px] font-bold border-none cursor-pointer"
                style={{ background: 'var(--surface-3)', color: 'var(--text-1)', padding: '11px 0', borderRadius: 10, letterSpacing: 1 }}
              >
                LOG OUT
              </button>
            </div>
          </div>,
        )}

        {/* DATA */}
        {sectionLabel('DATA')}
        {card(
          <div style={{ padding: '14px 16px' }}>
            <button
              onClick={doReset}
              className="w-full font-mono text-[12px] font-bold border-none cursor-pointer"
              style={{ background: 'var(--surface-3)', color: 'var(--danger)', padding: '12px 0', borderRadius: 10, letterSpacing: 1 }}
            >
              RESET ALL HISTORY
            </button>
            <div className="font-mono text-[10px] mt-2 text-center" style={{ color: 'var(--text-3)' }}>
              Clears completions, logged weights &amp; PRs
            </div>
          </div>,
        )}

        <div className="font-mono text-[10px] text-center mt-5" style={{ letterSpacing: 0.5, color: 'var(--text-3)' }}>
          PULSE · {THEMES.find(t => t.id === settings.theme)?.name}
        </div>
      </div>
    </>
  )
}
