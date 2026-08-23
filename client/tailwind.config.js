/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Primary Ocean Blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        medical: {
          teal: '#0d9488',
          emerald: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          purple: '#8b5cf6',
        }
      },
    },
  },
  plugins: [],
}
