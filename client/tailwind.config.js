/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#1B4332', light: '#2D6A4F', dark: '#0B2A1E', 50: '#F0F7F3' },
        royal: { DEFAULT: '#1E3A8A', light: '#3B5BDB', dark: '#13245C' },
        terra: { DEFAULT: '#7F2E1E', light: '#A8422E', dark: '#5C1F13' },
        gold: { DEFAULT: '#D97706', light: '#F59E0B', dark: '#B45309' },
        sky2: { DEFAULT: '#0284C7', light: '#38BDF8' },
        cream: '#FBF7F0',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        olchiki: ['"Noto Sans Ol Chiki"', '"Noto Sans"', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(27, 67, 50, 0.12)',
        card: '0 2px 12px rgba(15, 42, 30, 0.08)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1B4332 0%, #1E3A8A 55%, #0284C7 100%)',
        'warm-gradient': 'linear-gradient(135deg, #7F2E1E 0%, #D97706 100%)',
      },
    },
  },
  plugins: [],
};
