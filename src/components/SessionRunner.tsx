import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Workout, AppSettings } from '../lib/types'
import { parseRepsTime } from '../lib/utils'
import { DriveFrame } from './DriveFrame'

interface SessionRunnerProps {
  workout: Workout
  getDemoVideoUrl: (slug: string) => string
  settings: AppSettings
  onClose: () => void
  onComplete?: () => void
}

type Interval =
  | { kind: 'prestart'; seconds: number }
  | { kind: 'work'; seconds: number; roundIdx: number; exIdx: number }
  | { kind: 'rest'; seconds: number; nextRoundIdx: number; nextExIdx: number }

export function SessionRunner({ workout, getDemoVideoUrl, settings, onClose, onComplete }: SessionRunnerProps) {
  // Flatten the workout into a sequence of work/rest intervals.
  // Custom sessions carry their own timing; otherwise use global settings.
  const workSec = workout.work_sec ?? settings.work_sec
  const restSec = workout.rest_sec ?? settings.rest_sec

  const intervals = useMemo<Interval[]>(() => {
    const out: Interval[] = []
    if (settings.prestart_sec > 0) out.push({ kind: 'prestart', seconds: settings.prestart_sec })
    const flat: { roundIdx: number; exIdx: number; seconds: number }[] = []
    workout.rounds.forEach((r, roundIdx) => {
      r.exercises.forEach((ex, exIdx) => {
        const m = parseRepsTime(ex.reps_time)
        const seconds = m.type === 'time' ? (m.value as number) : workSec
        flat.push({ roundIdx, exIdx, seconds })
      })
    })
    flat.forEach((f, i) => {
      out.push({ kind: 'work', seconds: f.seconds, roundIdx: f.roundIdx, exIdx: f.exIdx })
      const next = flat[i + 1]
      if (next && restSec > 0) {
        out.push({ kind: 'rest', seconds: restSec, nextRoundIdx: next.roundIdx, nextExIdx: next.exIdx })
      }
    })
    return out
  }, [workout, settings.prestart_sec, workSec, restSec])

  const [idx, setIdx] = useState(0)
  const [remaining, setRemaining] = useState(intervals[0]?.seconds ?? 0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  const totalWork = useMemo(() => intervals.filter(i => i.kind === 'work').length, [intervals])
  const workDoneCount = useMemo(
    () => intervals.slice(0, idx + 1).filter(i => i.kind === 'work').length,
    [intervals, idx],
  )

  // ── audio cue ──
  const audioRef = useRef<AudioContext | null>(null)
  const beep = useCallback((freq: number, ms: number) => {
    if (!settings.sound) return
    try {
      audioRef.current = audioRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const ctx = audioRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000)
      osc.start(); osc.stop(ctx.currentTime + ms / 1000)
    } catch { /* ignore */ }
  }, [settings.sound])

  const buzz = useCallback((pattern: number | number[]) => {
    if (settings.haptics && navigator.vibrate) navigator.vibrate(pattern)
  }, [settings.haptics])

  const cur = intervals[idx]

  // Reset remaining when the interval changes.
  useEffect(() => {
    if (!cur) return
    setRemaining(cur.seconds)
    if (started.current) {
      if (cur.kind === 'work') { beep(880, 160); buzz(60) }
      else if (cur.kind === 'rest') { beep(440, 220); buzz([40, 40, 40]) }
    }
  }, [idx, cur, beep, buzz])

  // Tick.
  useEffect(() => {
    if (!running || done) return
    const id = setInterval(() => {
      setRemaining(r => {
        if (r > 1) {
          if (r <= 4) beep(660, 70) // last-3 countdown ticks
          return r - 1
        }
        // advance
        setIdx(i => {
          if (i + 1 >= intervals.length) {
            setDone(true)
            setRunning(false)
            onComplete?.()
            return i
          }
          return i + 1
        })
        return 0
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, done, intervals.length, onComplete, beep])

  const start = () => { started.current = true; setRunning(true); beep(880, 160) }
  const togglePlay = () => { if (!started.current) return start(); setRunning(r => !r) }
  const skip = () => {
    setIdx(i => {
      if (i + 1 >= intervals.length) { setDone(true); setRunning(false); onComplete?.(); return i }
      return i + 1
    })
  }
  const back = () => setIdx(i => Math.max(0, i - 1))

  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  // Current exercise (for work) or the upcoming one (for rest/prestart).
  const workInterval = cur?.kind === 'work' ? cur : null
  const restNext = cur?.kind === 'rest' ? cur : null
  const firstWork = intervals.find(i => i.kind === 'work') as Extract<Interval, { kind: 'work' }> | undefined
  const shownEx = workInterval
    ? workout.rounds[workInterval.roundIdx]?.exercises[workInterval.exIdx]
    : restNext
      ? workout.rounds[restNext.nextRoundIdx]?.exercises[restNext.nextExIdx]
      : firstWork ? workout.rounds[firstWork.roundIdx]?.exercises[firstWork.exIdx] : undefined
  const demoUrl = shownEx ? getDemoVideoUrl(shownEx.name_slug) : ''

  const phaseLabel = !started.current ? 'READY' : cur?.kind === 'prestart' ? 'GET READY' : cur?.kind === 'rest' ? 'REST' : 'WORK'
  const phaseColor = cur?.kind === 'rest' ? 'var(--rest)' : 'var(--accent)'
  const roundInfo = workInterval
    ? `ROUND ${workInterval.roundIdx + 1}/${workout.rounds.length} · EX ${workInterval.exIdx + 1}/${workout.rounds[workInterval.roundIdx].exercises.length}`
    : ''

  if (done) {
    return (
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-8" style={{ background: 'var(--bg)' }}>
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: 'var(--accent-ink)' }}>SESSION COMPLETE</div>
        <div className="text-[34px] font-[800] mt-2 text-center" style={{ letterSpacing: -1, color: 'var(--text-1)' }}>Nice work 🎉</div>
        <div className="text-[14px] mt-2 text-center" style={{ color: 'var(--text-2)' }}>
          {totalWork} exercises · {workout.rounds.length} rounds
        </div>
        <button onClick={onClose} className="mt-8 font-mono text-[13px] font-bold border-none cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--accent-on)', padding: '14px 40px', borderRadius: 14, letterSpacing: 1.5 }}>
          DONE
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* top bar */}
      <div className="flex items-center justify-between" style={{ padding: 'max(env(safe-area-inset-top,14px),14px) 16px 8px' }}>
        <button onClick={onClose} aria-label="Close" className="flex items-center justify-center p-0 border-none cursor-pointer"
          style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--surface)', color: 'var(--text-1)' }}>✕</button>
        <div className="text-[13px] font-bold" style={{ color: 'var(--text-1)' }}>{workout.workout_title}</div>
        <div className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-3)', width: 36, textAlign: 'right' }}>
          {workDoneCount}/{totalWork}
        </div>
      </div>

      {/* progress */}
      <div className="h-1 mx-4 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div className="h-full transition-[width] duration-300" style={{ width: `${(idx / Math.max(intervals.length - 1, 1)) * 100}%`, background: 'var(--accent)' }} />
      </div>

      {/* demo video */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ aspectRatio: '16 / 9', background: 'var(--hero)', position: 'relative' }}>
        {demoUrl ? (
          <DriveFrame url={demoUrl} title={shownEx?.name || 'demo'} />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-[11px]" style={{ color: 'var(--on-hero-3)' }}>NO DEMO</div>
        )}
        {restNext && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.78)' }}>
            <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 2, color: 'var(--rest)' }}>REST</div>
            <div className="font-mono text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>UP NEXT</div>
            <div className="text-[20px] font-[800] mt-1 text-center px-6" style={{ color: '#fff' }}>{shownEx?.name}</div>
          </div>
        )}
      </div>

      {/* phase + timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 3, color: phaseColor }}>{phaseLabel}</div>
        {started.current && roundInfo && cur?.kind === 'work' && (
          <div className="font-mono text-[10px] mt-1.5" style={{ letterSpacing: 1, color: 'var(--text-3)' }}>{roundInfo}</div>
        )}
        <div className="text-[72px] font-[800] leading-none mt-2" style={{ letterSpacing: -3, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
          {mm}:{ss}
        </div>
        {shownEx && cur?.kind === 'work' && (
          <div className="text-[20px] font-bold mt-2 text-center" style={{ color: 'var(--text-1)' }}>{shownEx.name}</div>
        )}
        {shownEx?.instructor_weight && cur?.kind === 'work' && (
          <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>@ {shownEx.instructor_weight}</div>
        )}
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-6" style={{ padding: '8px 0 max(env(safe-area-inset-bottom,30px),30px)' }}>
        <button onClick={back} aria-label="Previous" className="flex items-center justify-center p-0 border-none cursor-pointer"
          style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--surface)', color: 'var(--text-1)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M13 3v12l-8-6zM4 3h2v12H4z" /></svg>
        </button>
        <button onClick={togglePlay} aria-label={running ? 'Pause' : 'Play'} className="flex items-center justify-center p-0 border-none cursor-pointer"
          style={{ width: 78, height: 78, borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-on)' }}>
          {running ? (
            <span className="inline-flex gap-1.5"><span className="w-[5px] h-[26px] rounded-sm" style={{ background: 'var(--accent-on)' }} /><span className="w-[5px] h-[26px] rounded-sm" style={{ background: 'var(--accent-on)' }} /></span>
          ) : (
            <svg width="30" height="34" viewBox="0 0 30 34" style={{ marginLeft: 4 }}><path d="M0 0L30 17L0 34Z" fill="var(--accent-on)" /></svg>
          )}
        </button>
        <button onClick={skip} aria-label="Skip" className="flex items-center justify-center p-0 border-none cursor-pointer"
          style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--surface)', color: 'var(--text-1)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M5 3v12l8-6zM12 3h2v12h-2z" /></svg>
        </button>
      </div>
    </div>
  )
}
