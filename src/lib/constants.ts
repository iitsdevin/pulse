import type { LibraryCategory, ThemeId } from './types'

// All accent usages resolve to the active theme's CSS variable.
export const ACCENT_DEFAULT = 'var(--accent)'

export interface ThemeInfo {
  id: ThemeId
  name: string
  blurb: string
  dark: boolean
  swatch: { bg: string; surface: string; accent: string }
}

export const THEMES: ThemeInfo[] = [
  { id: 'ink',      name: 'Ink',      blurb: 'High-contrast lime',   dark: false, swatch: { bg: '#F3F3F1', surface: '#FFFFFF', accent: '#CCFF00' } },
  { id: 'midnight', name: 'Midnight', blurb: 'Full dark mode',        dark: true,  swatch: { bg: '#0A0A0B', surface: '#151515', accent: '#CCFF00' } },
  { id: 'sand',     name: 'Sand',     blurb: 'Warm bone + clay',      dark: false, swatch: { bg: '#ECE3D4', surface: '#FBF7F0', accent: '#C8794D' } },
  { id: 'forest',   name: 'Forest',   blurb: 'Deep green + cream',    dark: true,  swatch: { bg: '#162420', surface: '#1F332B', accent: '#E9E4D3' } },
  { id: 'dusk',     name: 'Dusk',     blurb: 'Dusty blue + beige',    dark: false, swatch: { bg: '#D4DDE0', surface: '#F4F6F5', accent: '#D8BE96' } },
]

export const DEFAULT_THEME: ThemeId = 'midnight'

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
  theme: DEFAULT_THEME,
  api_key: '',
}

export const TYPE_BADGE_COLORS = {
  UPPER:     { bg: '#2a2410', fg: '#F5D547' },
  LOWER:     { bg: '#10221c', fg: '#4FD9A8' },
  FULL:      { bg: '#2a1010', fg: '#FF7A5C' },
  MAT:       { bg: '#1e1530', fg: '#B47CFF' },
  BUILDPLUS: { bg: '#2a1a12', fg: '#FF7A5C' },
}

export const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
