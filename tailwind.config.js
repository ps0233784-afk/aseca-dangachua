/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#2f8dff',
          600: '#1a6df5',
          700: '#1456e1',
          800: '#1746b6',
          900: '#193e8f',
        },
        royal: {
          DEFAULT: '#1a56db',
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd3fe',
          300: '#93b4fd',
          400: '#608bfa',
          500: '#3b66f6',
          600: '#1a56db',
          700: '#1742b9',
          800: '#193995',
          900: '#1a347a',
        },
        emerald: {
          DEFAULT: '#0ea576',
        },
        green: {
          DEFAULT: '#147d4b',
          deep: '#0c4a2e',
        },
        earth: {
          DEFAULT: '#8a5a33',
          light: '#b9885c',
        },
        gold: {
          DEFAULT: '#d9a033',
          50: '#fbf6e9',
          100: '#f6ecd0',
          200: '#ecd79f',
          300: '#e0bd68',
          400: '#d9a033',
          500: '#c98a1f',
          600: '#ad6b18',
        },
        sky: {
          DEFAULT: '#38bdf8',
        },
        purple: {
          soft: '#8b7bd8',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        olchiki: ['Noto Sans Ol Chiki', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(10, 40, 80, 0.18)',
        glass: '0 8px 32px rgba(20, 60, 120, 0.12)',
        glow: '0 0 0 1px rgba(26,86,219,0.15), 0 12px 40px -10px rgba(26,86,219,0.35)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(120deg, #1a56db 0%, #147d4b 55%, #d9a033 120%)',
        'grad-hero': 'linear-gradient(160deg, #0c4a2e 0%, #147d4b 40%, #1a56db 100%)',
        'grad-card': 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55))',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
      },
    },
  },
  plugins: [],
};
