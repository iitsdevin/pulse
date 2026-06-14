import { useState, useCallback, useMemo, useEffect } from 'react'
import { TabBar } from './components/TabBar'
import type { TabId } from './components/TabBar'
import { TopBar } from './components/TopBar'
import { SettingsSheet } from './components/SettingsSheet'
import { CustomSessionSheet } from './components/CustomSessionSheet'
import { SessionRunner } from './components/SessionRunner'
import { buildCustomSession, type CustomSessionInput } from './lib/sessionBuilder'
import { TodayScreen } from './screens/TodayScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { ProgramScreen } from './screens/ProgramScreen'
import { StatsScreen } from './screens/StatsScreen'
import { useWorkouts } from './hooks/useWorkouts'
import { useSettings } from './hooks/useSettings'
import { useCompletedWorkouts, useLoggedWeights, usePersonalRecords } from './hooks/useDexie'
import { useVideoManifest } from './hooks/useVideoManifest'
import { useAuth } from './lib/auth'
import { LoginScreen } from './components/LoginScreen'
import type { Workout } from './lib/types'
import { formatDisplayDate } from './lib/utils'
import { ACCENT_DEFAULT, THEMES } from './lib/constants'

export function App() {
  const { manifest } = useAuth()
  const [tab, setTab] = useState<TabId>('today')
  const [openWorkout, setOpenWorkout] = useState<Workout | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [runner, setRunner] = useState<Workout | null>(null)

  const { workouts, todayWorkout, loading, error } = useWorkouts()
  const { settings, update: updateSettings } = useSettings()

  // Apply the selected palette to the document root.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])
  const { completed, complete: markComplete, isCompleted: _isCompleted } = useCompletedWorkouts()
  const personalRecords = usePersonalRecords()
  const { getWorkoutVideoUrl, getDemoVideoUrl } = useVideoManifest()

  const accent = ACCENT_DEFAULT
  const chartAccent = THEMES.find(t => t.id === settings.theme)?.swatch.accent ?? '#CCFF00'

  // Active workout for weight logging
  const activeWorkoutId = openWorkout?.workout_id ?? todayWorkout?.workout_id ?? ''
  const { weights: loggedWeights, log: logWeight } = useLoggedWeights(activeWorkoutId)

  // Build demo URL map for the active workout
  const activeWorkout = openWorkout ?? todayWorkout
  const demoVideoUrls = useMemo(() => {
    if (!activeWorkout) return {}
    const map: Record<string, string> = {}
    for (const r of activeWorkout.rounds) {
      for (const ex of r.exercises) {
        const url = getDemoVideoUrl(ex.name_slug)
        if (url) map[ex.name_slug] = url
      }
    }
    return map
  }, [activeWorkout, getDemoVideoUrl])

  const workoutVideoUrl = activeWorkout ? getWorkoutVideoUrl(activeWorkout.full_video_filename) : ''

  const completedIds = useMemo(() => new Set(completed.map(c => c.workout_id)), [completed])

  const handleSetTab = useCallback((t: TabId) => {
    setOpenWorkout(null)
    setTab(t)
  }, [])

  const handleOpenWorkout = useCallback((w: Workout) => {
    setOpenWorkout(w)
  }, [])

  const handleBack = useCallback(() => {
    setOpenWorkout(null)
  }, [])

  const handleStartCustom = useCallback((input: CustomSessionInput) => {
    const session = buildCustomSession(input, workouts, slug => !!getDemoVideoUrl(slug))
    setCustomOpen(false)
    setOpenWorkout(session)
  }, [workouts, getDemoVideoUrl])

  const isCustomSession = (w: Workout | null) => !!w && w.workout_id.startsWith('custom_')

  // A session may carry its own work/rest timing (custom sessions).
  const effectiveSettings = (w: Workout | null) =>
    w && (w.work_sec != null || w.rest_sec != null)
      ? { ...settings, work_sec: w.work_sec ?? settings.work_sec, rest_sec: w.rest_sec ?? settings.rest_sec }
      : settings

  // Gate the whole app behind login. The decrypted manifest is what unlocks video.
  if (!manifest) {
    return <LoginScreen />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 2, color: accent }}>
          LOADING PULSE...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-8" style={{ background: 'var(--bg)' }}>
        <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 2, color: 'var(--danger)' }}>ERROR</div>
        <div className="text-[14px] text-center" style={{ color: 'var(--text-2)' }}>{error}</div>
      </div>
    )
  }

  let content: React.ReactNode
  if (openWorkout) {
    content = (
      <TodayScreen
        workout={openWorkout}
        accent={accent}
        isToday={false}
        settings={effectiveSettings(openWorkout)}
        onOpenSettings={() => setSettingsOpen(true)}
        workoutVideoUrl={workoutVideoUrl}
        demoVideoUrls={demoVideoUrls}
        loggedWeights={loggedWeights}
        onWeightChange={logWeight}
        onStartGuided={() => setRunner(openWorkout)}
        isCustom={isCustomSession(openWorkout)}
      />
    )
  } else if (tab === 'today' && todayWorkout) {
    content = (
      <TodayScreen
        workout={todayWorkout}
        accent={accent}
        isToday={true}
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
        workoutVideoUrl={workoutVideoUrl}
        demoVideoUrls={demoVideoUrls}
        loggedWeights={loggedWeights}
        onWeightChange={logWeight}
        onStartGuided={() => setRunner(todayWorkout)}
        onCustom={() => setCustomOpen(true)}
      />
    )
  } else if (tab === 'today' && !todayWorkout) {
    content = (
      <div className="flex flex-col items-center justify-center px-8 pt-32">
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>NO WORKOUT TODAY</div>
        <div className="text-[14px] mt-2 text-center" style={{ color: 'var(--text-2)' }}>
          Build your own session from real Evlo movements, or browse the Library.
        </div>
        <button
          onClick={() => setCustomOpen(true)}
          className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] font-bold border-none cursor-pointer"
          style={{ background: accent, color: 'var(--accent-on)', padding: '15px 26px', borderRadius: 14, letterSpacing: 1.2 }}
        >
          ＋ CUSTOM SESSION
        </button>
      </div>
    )
  } else if (tab === 'history') {
    content = (
      <HistoryScreen
        workouts={workouts}
        completedWorkouts={completed}
        accent={accent}
        onOpen={handleOpenWorkout}
      />
    )
  } else if (tab === 'library') {
    content = (
      <LibraryScreen
        workouts={workouts}
        accent={accent}
        onOpen={handleOpenWorkout}
      />
    )
  } else if (tab === 'program') {
    content = (
      <ProgramScreen
        workouts={workouts}
        accent={accent}
        completedWorkoutIds={completedIds}
        onOpenWorkout={handleOpenWorkout}
        apiKey={settings.api_key}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    )
  } else if (tab === 'stats') {
    content = (
      <StatsScreen
        workouts={workouts}
        completedWorkouts={completed}
        personalRecords={personalRecords}
        accent={accent}
        chartAccent={chartAccent}
      />
    )
  }

  return (
    <div className="font-sans min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="scrollbar-none overflow-y-auto" style={{ paddingTop: openWorkout ? 60 : 0, paddingBottom: 100 }}>
        {content}
      </div>

      {openWorkout && (
        <TopBar
          title={openWorkout.workout_title}
          subtitle={`${openWorkout.day_of_week.toUpperCase()} · ${formatDisplayDate(openWorkout.date)}`}
          onBack={handleBack}
        />
      )}

      {/* Persistent settings gear for screens whose header has no gear of its own */}
      {!openWorkout && (tab !== 'today' || !todayWorkout) && (
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          className="fixed z-50 flex items-center justify-center p-0 border-none cursor-pointer"
          style={{
            top: 'max(env(safe-area-inset-top, 14px), 14px)', right: 14,
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            color: 'var(--text-1)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 3l-1.4 1.4M4.4 11.6L3 13M13 13l-1.4-1.4M4.4 4.4L3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <TabBar tab={tab} setTab={handleSetTab} />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      <CustomSessionSheet
        visible={customOpen}
        onClose={() => setCustomOpen(false)}
        onStart={handleStartCustom}
      />

      {runner && (
        <SessionRunner
          workout={runner}
          getDemoVideoUrl={getDemoVideoUrl}
          settings={settings}
          onClose={() => setRunner(null)}
          onComplete={() => {
            const total = runner.rounds.reduce((a, r) => a + r.exercises.length, 0)
            markComplete(runner.workout_id, total, total)
          }}
        />
      )}
    </div>
  )
}
