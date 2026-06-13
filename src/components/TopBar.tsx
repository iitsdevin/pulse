interface TopBarProps {
  title: string
  subtitle?: string
  onBack: () => void
}

export function TopBar({ title, subtitle, onBack }: TopBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)',
        paddingBottom: 10,
        paddingInline: 16,
        background: 'transparent',
      }}
    >
      <button
        onClick={onBack}
        className="flex-shrink-0 flex items-center justify-center p-0 border-none cursor-pointer"
        style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <svg width="10" height="16" viewBox="0 0 10 16">
          <path d="M8 2L2 8L8 14" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex-1">
        <div className="text-[17px] font-bold text-white" style={{ letterSpacing: -0.3 }}>{title}</div>
        {subtitle && (
          <div className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 }}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}
