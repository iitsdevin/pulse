import { useState, useEffect } from 'react'
import { DriveFrame } from './DriveFrame'

interface DemoVideoProps {
  // The manifest stores Drive /preview URLs; we derive a direct-stream URL from the id.
  previewUrl: string
  title?: string
  autoPlay?: boolean
}

function driveIdFromPreview(url: string): string {
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : ''
}

// Plays a Google Drive demo clip in a native <video> (no third-party cookies,
// no Drive player overlay, and muted autoplay works on mobile). Falls back to
// the Drive preview iframe if the direct stream fails (e.g. file not public, or
// too large for Drive's direct endpoint).
export function DemoVideo({ previewUrl, title, autoPlay = true }: DemoVideoProps) {
  const id = driveIdFromPreview(previewUrl)
  const directUrl = id ? `https://drive.usercontent.google.com/download?id=${id}&export=download` : ''
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Reset the failed state when the clip changes.
  useEffect(() => { setFailed(false) }, [directUrl])

  if (!directUrl || failed) {
    return <DriveFrame url={previewUrl} title={title} />
  }

  return (
    <div className="relative w-full h-full" style={{ background: '#000' }}>
      <video
        key={`${directUrl}-${reloadKey}`}
        src={directUrl}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        controls
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
      <button
        onClick={() => setReloadKey(k => k + 1)}
        aria-label="Reload video"
        className="absolute top-2 right-2 flex items-center justify-center p-0 border-none cursor-pointer"
        style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M13.6 8a5.6 5.6 0 11-1.7-4M13.6 1.5V5h-3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
