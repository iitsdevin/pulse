import { useState, useCallback } from 'react'
import type { Workout } from '../lib/types'
import { saveAIProgram, getLatestAIProgram } from '../lib/db'
import { ACCENT_DEFAULT } from '../lib/constants'
import { useEffect } from 'react'

interface ProgramScreenProps {
  workouts: Workout[]
  accent?: string
  completedWorkoutIds: Set<string>
  onOpenWorkout: (workout: Workout) => void
}

interface WeeklyProgram {
  [day: string]: string // day_of_week → workout_id
}

export function ProgramScreen({ workouts, accent = ACCENT_DEFAULT, completedWorkoutIds, onOpenWorkout }: ProgramScreenProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [program, setProgram] = useState<WeeklyProgram | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load the most recent program on mount
  useEffect(() => {
    getLatestAIProgram().then(entry => {
      if (entry) setProgram(entry.program)
    })
  }, [])

  const generate = useCallback(async () => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) {
      setError('Set VITE_ANTHROPIC_API_KEY in .env to use AI programming.')
      return
    }

    setLoading(true)
    setError(null)

    const workoutSummaries = workouts.map(w => ({
      id: w.workout_id,
      title: w.workout_title,
      day: w.day_of_week,
      date: w.date,
      muscle_groups: w.muscle_groups,
      duration: w.total_duration_minutes,
    }))

    const recentCompleted = Array.from(completedWorkoutIds).slice(0, 21)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are a workout programming assistant. Based on the user's request and available workouts, create a weekly program.

Available workouts:
${JSON.stringify(workoutSummaries, null, 2)}

Recently completed workout IDs: ${JSON.stringify(recentCompleted)}

User's request: "${prompt}"

Respond with ONLY valid JSON in this exact format (use workout_id values from the available workouts list):
{"monday": "workout_id_here", "tuesday": "workout_id_here", "wednesday": "workout_id_here", "thursday": "workout_id_here", "friday": "workout_id_here", "saturday": "workout_id_here", "sunday": "rest"}

Use "rest" for rest days. Pick workouts that match the user's request and avoid repeating recently completed workouts when possible.`,
          }],
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`API error ${res.status}: ${errBody}`)
      }

      const data = await res.json() as { content: { type: string; text: string }[] }
      const text = data.content[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed = JSON.parse(jsonMatch[0]) as WeeklyProgram
      setProgram(parsed)
      await saveAIProgram(prompt, parsed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [prompt, workouts, completedWorkoutIds])

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="pb-10">
      {/* header */}
      <div className="relative text-white" style={{ background: '#0A0A0A', padding: '20px 20px 24px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>AI PROGRAM</div>
        <div className="text-[32px] font-[800] uppercase mt-1" style={{ letterSpacing: -1 }}>Weekly Plan</div>
        <div className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Describe your week and get a personalised program from Claude.
        </div>

        {/* input */}
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. I want to focus on upper body this week, with a rest day on Wednesday..."
          className="w-full mt-4 text-[14px] text-white bg-transparent border-none outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '12px 14px',
            minHeight: 80,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="w-full mt-3 font-mono text-[12px] font-bold uppercase border-none cursor-pointer"
          style={{
            background: loading ? 'rgba(255,255,255,0.08)' : accent,
            color: loading ? 'rgba(255,255,255,0.4)' : '#000',
            padding: '14px 0', borderRadius: 14,
            letterSpacing: 1.5,
            opacity: (!prompt.trim() || loading) ? 0.5 : 1,
          }}
        >
          {loading ? 'GENERATING...' : 'GENERATE PROGRAM'}
        </button>
        {error && (
          <div className="mt-2 text-[12px]" style={{ color: '#FF5C5C' }}>{error}</div>
        )}
      </div>

      {/* weekly program cards */}
      {program && (
        <div className="px-4 pt-4 flex flex-col gap-2.5">
          <div className="font-mono text-[11px] font-bold px-1" style={{ letterSpacing: 2, color: 'rgba(255,255,255,0.5)' }}>
            YOUR WEEK
          </div>
          {days.map(day => {
            const workoutId = program[day]
            const isRest = !workoutId || workoutId === 'rest'
            const workout = workouts.find(w => w.workout_id === workoutId)

            return (
              <div
                key={day}
                onClick={() => workout && onOpenWorkout(workout)}
                className={workout ? 'cursor-pointer' : ''}
                style={{
                  background: '#151515',
                  borderRadius: 16, padding: '14px 16px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  opacity: isRest ? 0.5 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold" style={{ letterSpacing: 1, color: accent }}>
                      {day.toUpperCase()}
                    </div>
                    <div className="text-[15px] font-bold text-white mt-1" style={{ letterSpacing: -0.2 }}>
                      {isRest ? 'Rest Day' : workout?.workout_title || workoutId}
                    </div>
                    {workout && (
                      <div className="font-mono text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {workout.muscle_groups.join(' · ')} · {workout.total_duration_minutes}min
                      </div>
                    )}
                  </div>
                  {isRest ? (
                    <div className="font-mono text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>REST</div>
                  ) : (
                    <svg width="10" height="14" viewBox="0 0 10 14">
                      <path d="M2 2L8 7L2 12" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
