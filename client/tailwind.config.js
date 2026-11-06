/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mits: {
          primary: '#0B1020',
          secondary: '#151C30',
          card: '#1C263A',
          'card-glass': 'rgba(28, 38, 58, 0.85)',
          purple: '#7955E8',
          'purple-hover': '#6842df',
          blue: '#526DFF',
          'blue-hover': '#3d5bff',
          text: '#FFFFFF',
          muted: '#AAB3C5',
          border: 'rgba(121, 85, 232, 0.2)',
          'border-blue': 'rgba(82, 109, 255, 0.2)',
          glow: 'rgba(121, 85, 232, 0.35)',
        },
        brand: {
          orange: '#7955E8',
          'orange-hover': '#6842df',
          'orange-light': '#151C30',
          navy: '#0B1020',
          'navy-light': '#151C30',
          'navy-dark': '#070B16',
          grey: '#151C30',
          'grey-border': 'rgba(121, 85, 232, 0.2)',
          'grey-text': '#AAB3C5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 14px 40px -4px rgba(121, 85, 232, 0.35)',
        'token': '0 10px 30px -5px rgba(121, 85, 232, 0.4)',
        'glow-purple': '0 0 25px rgba(121, 85, 232, 0.45)',
        'glow-blue': '0 0 25px rgba(82, 109, 255, 0.45)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 20px rgba(121, 85, 232, 0.4)' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9', boxShadow: '0 0 35px rgba(82, 109, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'float-slow': 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
