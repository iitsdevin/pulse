import { useState } from 'react'

interface DriveFrameProps {
  url: string
  title?: string
}

// Google Drive preview iframe with a reload button. Drive sometimes returns
// "This video file is unplayable due to a temporary failure" while it finishes
// processing — remounting the iframe retries the stream.
export function DriveFrame({ url, title }: DriveFrameProps) {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="relative w-full h-full">
      <iframe
        key={`${url}-${reloadKey}`}
        src={url}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
        title={title || 'video'}
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
