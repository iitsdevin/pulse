import type { Workout } from '../lib/types'
import { parseDuration } from '../lib/utils'
import { ACCENT_DEFAULT } from '../lib/constants'

interface FullWorkoutCardProps {
  workout: Workout
  accent?: string
  videoUrl?: string
}

export function FullWorkoutCard({ workout, accent = ACCENT_DEFAULT, videoUrl }: FullWorkoutCardProps) {
  const duration = parseDuration(workout.total_duration_minutes)

  // If a real video URL exists, show a playable video.
  // Google Drive videos must stream through the Drive preview iframe.
  if (videoUrl) {
    const isDrive = videoUrl.includes('drive.google.com')
    return (
      <div className="mx-4 mt-3.5 overflow-hidden" style={{ background: 'var(--surface)', borderRadius: 22, border: '1px solid var(--hairline)' }}>
        <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: 'var(--hero)' }}>
          {isDrive ? (
            <iframe
              src={videoUrl}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
              title={workout.workout_title}
            />
          ) : (
            <video src={videoUrl} controls playsInline className="w-full h-full object-cover" />
          )}
        </div>
        <MetadataRow workout={workout} accent={accent} />
      </div>
    )
  }

  return (
    <div className="mx-4 mt-3.5 overflow-hidden" style={{ background: 'var(--surface)', borderRadius: 22, border: '1px solid var(--hairline)' }}>
      {/* video placeholder area */}
      <div className="relative w-full cursor-pointer" style={{ aspectRatio: '16 / 9', background: 'var(--hero)' }}>
        {/* animated stripes */}
        <div
          className="absolute inset-0 animate-stripes"
          style={{
            background: 'repeating-linear-gradient(135deg, #131313 0 14px, #0b0b0b 14px 28px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.55) 80%)' }} />
        {/* FULL WORKOUT label */}
        <div className="absolute top-3 left-3.5 font-mono text-[10px] font-bold inline-flex items-center gap-1.5" style={{ color: accent, letterSpacing: 1.5 }}>
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: accent }} />
          FULL WORKOUT
        </div>
        {/* duration chip */}
        <div
          className="absolute bottom-3 right-3.5 font-mono text-[11px] font-bold text-white"
          style={{
            background: 'rgba(0,0,0,0.55)',
            padding: '3px 8px', borderRadius: 6,
            backdropFilter: 'blur(8px)',
          }}
        >
          {duration}:00
        </div>
        {/* play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[66px] h-[66px] rounded-full flex items-center justify-center"
            style={{
              background: accent,
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            }}
          >
            <svg width="22" height="26" viewBox="0 0 22 26" style={{ marginLeft: 3 }}>
              <path d="M0 0L22 13L0 26Z" fill="#000" />
            </svg>
          </div>
        </div>
        {/* scrubber */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <div className="h-full" style={{ width: '0%', background: accent }} />
        </div>
      </div>
      <MetadataRow workout={workout} accent={accent} />
    </div>
  )
}

function MetadataRow({ workout, accent }: { workout: Workout; accent: string }) {
  const initials = 'EV'
  return (
    <div className="flex items-center gap-2.5" style={{ padding: '12px 14px 14px' }}>
      <div
        className="flex-shrink-0 flex items-center justify-center text-[11px] font-[800]"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: accent, color: 'var(--accent-on)',
        }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold" style={{ letterSpacing: -0.1, color: 'var(--text-1)' }}>Evlo</div>
        <div className="font-mono text-[10px] mt-[1px] truncate" style={{ color: 'var(--text-2)', letterSpacing: 0.3 }}>
          {workout.full_video_filename || '—'}
        </div>
      </div>
      <div
        className="font-mono text-[10px] font-bold"
        style={{
          color: 'var(--text-2)',
          padding: '5px 10px', borderRadius: 999,
          background: 'var(--surface-2)',
          letterSpacing: 1,
        }}
      >
        HD · EN
      </div>
    </div>
  )
}
