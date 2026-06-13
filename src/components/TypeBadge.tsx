import type { WorkoutType } from '../lib/types'
import { TYPE_BADGE_COLORS } from '../lib/constants'

interface TypeBadgeProps {
  type: WorkoutType
  size?: 'sm' | 'md'
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const c = TYPE_BADGE_COLORS[type] ?? TYPE_BADGE_COLORS.FULL
  const pad = size === 'sm' ? '2px 7px' : '4px 10px'
  const fs = size === 'sm' ? 10 : 11

  return (
    <span
      className="font-mono font-bold inline-block"
      style={{
        background: c.bg,
        color: c.fg,
        padding: pad,
        borderRadius: 999,
        fontSize: fs,
        letterSpacing: 0.6,
      }}
    >
      {type}
    </span>
  )
}
