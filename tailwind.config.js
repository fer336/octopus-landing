/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './landing.html',
    './politicas-privacidad.html',
    './politicas-seguridad.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f2fa',
          100: '#ece6f6',
          200: '#d9caeb',
          300: '#c3abdf',
          400: '#ad8ed2',
          500: '#9d84bf',
          600: '#7c5ca8',
          700: '#5c3a8c',
          800: '#4b2f72',
          900: '#3a2459',
          950: '#25163a',
        },
        tool: {
          background: '#0d1f0e',
          surface: '#1a3d1f',
          border: '#2d6b35',
          primary: '#3d8c47',
          accent: '#5aad62',
          highlight: '#7ecf86',
          'text-dark': '#b4e8b8',
          'text-light': '#e0f5e2',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
