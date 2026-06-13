import type { LibraryCategory } from './types'

export const ACCENT_DEFAULT = '#00E5FF'

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  { id: 'UPPER',     title: 'Upper Body Build', desc: 'Chest, back, shoulders, arms',   hue: 'rgba(255, 220, 80, 0.22)',  accent: '#F5D547' },
  { id: 'LOWER',     title: 'Lower Body Build', desc: 'Quads, glutes, hamstrings',      hue: 'rgba(80, 220, 170, 0.22)',  accent: '#4FD9A8' },
  { id: 'BUILDPLUS', title: 'Build+',           desc: 'Heavy compounds + power',         hue: 'rgba(255, 120, 90, 0.22)',  accent: '#FF7A5C' },
  { id: 'MAT',       title: 'Mat Build',        desc: 'Floor work, mobility, flow',      hue: 'rgba(180, 124, 255, 0.22)', accent: '#B47CFF' },
  { id: 'FULL',      title: 'Full Body Build',  desc: 'Total body conditioning',         hue: 'rgba(0, 229, 255, 0.18)',   accent: '#00E5FF' },
]

export const DEFAULT_SETTINGS = {
  rest_sec: 45,
  work_sec: 40,
  prestart_sec: 3,
  sound: true,
  haptics: true,
  autoplay: false,
}

export const TYPE_BADGE_COLORS = {
  UPPER:     { bg: '#2a2410', fg: '#F5D547' },
  LOWER:     { bg: '#10221c', fg: '#4FD9A8' },
  FULL:      { bg: '#2a1010', fg: '#FF7A5C' },
  MAT:       { bg: '#1e1530', fg: '#B47CFF' },
  BUILDPLUS: { bg: '#2a1a12', fg: '#FF7A5C' },
}

export const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
