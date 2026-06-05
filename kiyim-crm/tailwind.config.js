/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        accent: {
          400: '#f472b6', 500: '#ec4899', 600: '#db2777',
        },
        ink: '#1e1b2e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(30,27,46,0.06), 0 1px 2px rgba(30,27,46,0.04)',
        card: '0 4px 24px -8px rgba(99,102,241,0.15)',
      },
    },
  },
  plugins: [],
}
