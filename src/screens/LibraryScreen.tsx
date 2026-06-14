import { useState } from 'react'
import type { Workout, LibraryCategoryId } from '../lib/types'
import { inferLibraryCategory } from '../lib/types'
import { parseDuration } from '../lib/utils'
import { LIBRARY_CATEGORIES, ACCENT_DEFAULT } from '../lib/constants'

interface LibraryScreenProps {
  workouts: Workout[]
  accent?: string
  onOpen: (workout: Workout) => void
  savedWorkouts?: Workout[]
}

type TabId = LibraryCategoryId | 'SAVED'

export function LibraryScreen({ workouts, accent = ACCENT_DEFAULT, onOpen, savedWorkouts = [] }: LibraryScreenProps) {
  const [active, setActive] = useState<TabId>(LIBRARY_CATEGORIES[0].id)

  // Group workouts by library category
  const sessionsByCat: Record<LibraryCategoryId, Workout[]> = {
    UPPER: [], LOWER: [], BUILDPLUS: [], MAT: [], FULL: [],
  }
  for (const w of workouts) {
    const cat = inferLibraryCategory(w.track, w.muscle_groups, w.workout_title)
    sessionsByCat[cat].push(w)
  }

  const SAVED_VIEW = { title: 'Saved', desc: 'Your hearted sessions', hue: 'rgba(127,127,127,0.14)', accent }
  const view = active === 'SAVED' ? SAVED_VIEW : LIBRARY_CATEGORIES.find(c => c.id === active)!
  const sessions = active === 'SAVED' ? savedWorkouts : sessionsByCat[active as LibraryCategoryId]
  const totalSessions = Object.values(sessionsByCat).reduce((a, s) => a + s.length, 0)

  return (
    <div className="pb-10">
      {/* header */}
      <div className="relative text-white" style={{ background: 'var(--hero)', padding: '20px 20px 18px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent }} />
        <div className="font-mono text-[11px] font-bold" style={{ letterSpacing: 2, color: accent }}>WORKOUT LIBRARY</div>
        <div className="text-[32px] font-[800] uppercase mt-1" style={{ letterSpacing: -1 }}>Full Sessions</div>
        <div className="text-[12px] mt-1.5" style={{ color: 'var(--on-hero-2)', letterSpacing: -0.1 }}>
          Follow a full-length video with {totalSessions} sessions across {LIBRARY_CATEGORIES.length} categories.
        </div>
      </div>

      {/* category chip rail */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ padding: '14px 16px 4px' }}>
        <button
          onClick={() => setActive('SAVED')}
          className="flex-shrink-0 font-mono text-[10px] font-bold uppercase inline-flex items-center gap-1.5 border-none cursor-pointer"
          style={{
            padding: '9px 14px', borderRadius: 999, letterSpacing: 1.2,
            background: active === 'SAVED' ? 'var(--text-1)' : 'var(--surface-2)',
            color: active === 'SAVED' ? 'var(--bg)' : 'var(--text-2)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 18 18" fill={active === 'SAVED' ? 'var(--bg)' : accent}>
            <path d="M9 15.5C9 15.5 2 11.5 2 6.6 2 4.3 3.8 2.8 5.9 2.8 7.2 2.8 8.4 3.5 9 4.6 9.6 3.5 10.8 2.8 12.1 2.8 14.2 2.8 16 4.3 16 6.6 16 11.5 9 15.5 9 15.5Z" />
          </svg>
          Saved
          <span className="text-[9px] opacity-70 ml-0.5">{savedWorkouts.length}</span>
        </button>
        {LIBRARY_CATEGORIES.map(c => {
          const isActive = active === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="flex-shrink-0 font-mono text-[10px] font-bold uppercase inline-flex items-center gap-1.5 border-none cursor-pointer"
              style={{
                padding: '9px 14px',
                borderRadius: 999,
                letterSpacing: 1.2,
                background: isActive ? 'var(--text-1)' : 'var(--surface-2)',
                color: isActive ? 'var(--bg)' : 'var(--text-2)',
              }}
            >
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: c.accent }} />
              {c.title.replace(' Build', '')}
              <span className="text-[9px] opacity-70 ml-0.5">{sessionsByCat[c.id].length}</span>
            </button>
          )
        })}
      </div>

      {/* active category hero */}
      <div className="px-4 pt-3.5">
        <div
          className="flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${view.hue}, transparent 70%), var(--surface)`,
            borderRadius: 20, padding: '14px 16px',
            border: '1px solid var(--hairline)',
          }}
        >
          <div>
            <div className="text-[20px] font-[800]" style={{ letterSpacing: -0.5, color: 'var(--text-1)' }}>{view.title}</div>
            <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-2)' }}>{view.desc}</div>
          </div>
          <div className="font-mono text-right">
            <div className="text-[10px] font-bold" style={{ letterSpacing: 1, color: 'var(--text-2)' }}>VIDEOS</div>
            <div className="text-[26px] font-[800] leading-none mt-0.5" style={{ letterSpacing: -1, color: 'var(--text-1)' }}>{sessions.length}</div>
          </div>
        </div>
      </div>

      {/* empty saved state */}
      {active === 'SAVED' && sessions.length === 0 && (
        <div className="px-8 pt-10 flex flex-col items-center text-center">
          <svg width="34" height="34" viewBox="0 0 18 18" fill="none" style={{ opacity: 0.4 }}>
            <path d="M9 15.5C9 15.5 2 11.5 2 6.6 2 4.3 3.8 2.8 5.9 2.8 7.2 2.8 8.4 3.5 9 4.6 9.6 3.5 10.8 2.8 12.1 2.8 14.2 2.8 16 4.3 16 6.6 16 11.5 9 15.5 9 15.5Z" stroke="var(--text-3)" strokeWidth="1.4" />
          </svg>
          <div className="text-[14px] mt-3" style={{ color: 'var(--text-2)' }}>No saved sessions yet</div>
          <div className="font-mono text-[10px] mt-1.5" style={{ color: 'var(--text-3)' }}>Tap the ♥ on any workout to save it here</div>
        </div>
      )}

      {/* video grid */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-3">
        {sessions.map((w, i) => (
          <div
            key={i}
            onClick={() => onOpen(w)}
            className="cursor-pointer overflow-hidden"
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1px solid var(--hairline)',
            }}
          >
            {/* thumbnail */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3', background: '#0A0A0A' }}>
              <div
                className="absolute inset-0 animate-stripes"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${view.hue}, transparent 60%), repeating-linear-gradient(135deg, #121212 0 10px, #0c0c0c 10px 20px)`,
                  backgroundSize: '48px 48px',
                }}
              />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.55) 85%)' }} />
              {/* play */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: `1.5px solid ${view.accent}`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <svg width="12" height="14" viewBox="0 0 12 14" style={{ marginLeft: 2 }}>
                    <path d="M0 0L12 7L0 14Z" fill={view.accent} />
                  </svg>
                </div>
              </div>
              {/* duration chip */}
              <div
                className="absolute bottom-2 right-2 font-mono text-[9px] font-bold text-white"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '2px 6px', borderRadius: 4,
                  letterSpacing: 0.5,
                  backdropFilter: 'blur(6px)',
                }}
              >
                {parseDuration(w.total_duration_minutes)}:00
              </div>
              {/* scheduled ribbon */}
              <div
                className="absolute top-2 left-2 font-mono text-[8px] font-[800] text-black"
                style={{
                  background: accent,
                  padding: '2px 6px', borderRadius: 3,
                  letterSpacing: 1,
                }}
              >
                {w.day_of_week.toUpperCase()} · WEEK
              </div>
            </div>
            <div style={{ padding: '10px 11px 12px' }}>
              <div className="text-[13px] font-bold truncate" style={{ letterSpacing: -0.2, color: 'var(--text-1)' }}>
                {w.workout_title}
              </div>
              <div className="font-mono text-[9px] mt-[3px]" style={{ letterSpacing: 0.3, color: 'var(--text-3)' }}>
                Evlo
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
