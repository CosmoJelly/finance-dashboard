/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          muted: '#1A1A2E',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          muted: '#EAE4D8',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C76A',
          dark: '#9A7A2E',
        },
        jade: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
        },
        coral: {
          DEFAULT: '#E07A5F',
          light: '#F2A99A',
        },
      },
    },
  },
  plugins: [],
}
