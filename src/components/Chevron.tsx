interface ChevronProps {
  open: boolean
  color?: string
  size?: number
}

export function Chevron({ open, color = 'var(--text-3)', size = 14 }: ChevronProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className="flex-shrink-0 transition-transform duration-200 ease-in-out"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <path d="M4 2 L10 7 L4 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
