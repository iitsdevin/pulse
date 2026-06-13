import { useState, useCallback, useMemo } from 'react'
import { TabBar } from './components/TabBar'
import type { TabId } from './components/TabBar'
import { TopBar } from './components/TopBar'
import { SettingsSheet } from './components/SettingsSheet'
import { TodayScreen } from './screens/TodayScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LibraryScreen } from './screens/LibraryScreen'
import { ProgramScreen } from './screens/ProgramScreen'
import { StatsScreen } from './screens/StatsScreen'
import { useWorkouts } from './hooks/useWorkouts'
import { useSettings } from './hooks/useSettings'
import { useCompletedWorkouts, useLoggedWeights, usePersonalRecords } from './hooks/useDexie'
import { useVideoManifest } from './hooks/useVideoManifest'
import type { Workout } from './lib/types'
import { formatDisplayDate } from './lib/utils'
import { ACCENT_DEFAULT } from './lib/constants'

export function App() {
  const [tab, setTab] = useState<TabId>('today')
  const [openWorkout, setOpenWorkout] = useState<Workout | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { workouts, todayWorkout, loading, error } = useWorkouts()
  const { settings, update: updateSettings } = useSettings()
  const { completed, complete: _complete, isCompleted: _isCompleted } = useCompletedWorkouts()
  const personalRecords = usePersonalRecords()
  const { getWorkoutVideoUrl, getDemoVideoUrl } = useVideoManifest()

  const accent = ACCENT_DEFAULT

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0B' }}>
        <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 2, color: accent }}>
          LOADING PULSE...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-8" style={{ background: '#0A0A0B' }}>
        <div className="font-mono text-[12px] font-bold" style={{ letterSpacing: 2, color: '#FF5C5C' }}>ERROR</div>
        <div className="text-[14px] text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>{error}</div>
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
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
        workoutVideoUrl={workoutVideoUrl}
        demoVideoUrls={demoVideoUrls}
        loggedWeights={loggedWeights}
        onWeightChange={logWeight}
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
      />
    )
  } else if (tab === 'today' && !todayWorkout) {
    content = (
      <div className="flex flex-col items-center justify-center px-8 pt-32">
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>NO WORKOUT TODAY</div>
        <div className="text-[14px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Check the Library for sessions or use Program to generate a weekly plan.
        </div>
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
      />
    )
  } else if (tab === 'stats') {
    content = (
      <StatsScreen
        workouts={workouts}
        completedWorkouts={completed}
        personalRecords={personalRecords}
        accent={accent}
      />
    )
  }

  return (
    <div className="font-sans min-h-screen" style={{ background: '#0A0A0B' }}>
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

      <TabBar tab={tab} setTab={handleSetTab} accent={accent} />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />
    </div>
  )
}
