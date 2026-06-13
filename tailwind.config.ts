import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#00E5FF',
          lime: '#CCFF00',
          burnt: '#FF6B35',
          cyan: '#00E5FF',
          fire: '#FF3B3B',
          ultra: '#B47CFF',
        },
        bg: {
          dark: '#0A0A0B',
          light: '#F3F3F1',
        },
        hero: '#0A0A0A',
        card: {
          dark: '#151515',
          light: '#FFFFFF',
        },
        rest: '#4FD9A8',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        chip: '10px',
        timer: '14px',
        panel: '18px',
        round: '22px',
      },
      keyframes: {
        stripeMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 0' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        stripes: 'stripeMove 2.4s linear infinite',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s',
      },
    },
  },
  plugins: [],
} satisfies Config
