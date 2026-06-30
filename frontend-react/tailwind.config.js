/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05080f',
          900: '#0a0f1e',
          800: '#0d1526',
          700: '#111c30',
          600: '#162038',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.09)',
        },
        accent: {
          violet: '#7c3aed',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          indigo: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark': `
          radial-gradient(at 20% 20%, rgba(99,102,241,0.15) 0px, transparent 50%),
          radial-gradient(at 80% 10%, rgba(6,182,212,0.10) 0px, transparent 50%),
          radial-gradient(at 50% 80%, rgba(139,92,246,0.12) 0px, transparent 50%)
        `,
        'sidebar-gradient': 'linear-gradient(180deg, #0d1526 0%, #111c30 100%)',
        'primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-sm': '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-violet': '0 0 20px rgba(124,58,237,0.35)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.35)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.35)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'blob': 'blob 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}