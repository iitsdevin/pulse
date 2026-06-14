import { ACCENT_DEFAULT } from '../lib/constants'
import { DriveFrame } from './DriveFrame'

interface VideoPlayerProps {
  url: string
  label?: string
  accent?: string
}

export function VideoPlayer({ url, label, accent = ACCENT_DEFAULT }: VideoPlayerProps) {
  if (!url) {
    return <VideoPlaceholder label={label} accent={accent} />
  }

  // Google Drive videos stream via the Drive preview iframe (no download needed)
  if (url.includes('drive.google.com')) {
    return (
      <div className="relative w-full rounded-timer overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
        <DriveFrame url={url} title={label || 'Workout video'} />
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-timer overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
      <video
        src={url}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  )
}

function VideoPlaceholder({ label, accent }: { label?: string; accent: string }) {
  return (
    <div className="relative w-full rounded-timer overflow-hidden" style={{ aspectRatio: '16 / 9', background: '#111' }}>
      <div
        className="absolute inset-0 animate-stripes"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, #1a1a1a 0 12px, #0f0f0f 12px 24px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
          <svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 2L16 10L2 18Z" fill="#fff" /></svg>
        </div>
      </div>
      {label && (
        <div className="absolute top-[10px] left-3 font-mono text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span className="inline-block w-[7px] h-[7px] rounded-full mr-1.5 align-middle" style={{ background: accent }} />
          DEMO · {label}
        </div>
      )}
    </div>
  )
}
