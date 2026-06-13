import { ACCENT_DEFAULT } from '../lib/constants'

export type TabId = 'today' | 'history' | 'library' | 'program' | 'stats'

interface TabBarProps {
  tab: TabId
  setTab: (t: TabId) => void
  accent?: string
}

const tabs: { id: TabId; label: string; icon: (c: string) => JSX.Element }[] = [
  {
    id: 'today', label: 'Today',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 3v3M18 3v3M4 10h16M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.5" fill={c} />
      </svg>
    ),
  },
  {
    id: 'history', label: 'History',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 109-9" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 4v5h5M12 7v5l3 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'library', label: 'Library',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="14" y="4" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke={c} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'program', label: 'Program',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'stats', label: 'Stats',
    icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10M12 20V4M6 20v-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function TabBar({ tab, setTab, accent = ACCENT_DEFAULT }: TabBarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 28, paddingTop: 8, paddingInline: 8,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex justify-around">
        {tabs.map(t => {
          const active = tab === t.id
          const color = active ? accent : 'rgba(255,255,255,0.45)'
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center gap-[3px] bg-transparent border-none cursor-pointer py-1.5"
            >
              {t.icon(color)}
              <div
                className="font-mono text-[10px] font-bold uppercase"
                style={{ color, letterSpacing: 0.8 }}
              >
                {t.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
