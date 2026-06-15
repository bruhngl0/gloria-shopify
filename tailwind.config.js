/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
  ],
  theme: {
    extend: {
      colors: {
        sbg: {
          black: '#0A0A0A',
          white: '#FFFFFF',
          offwhite: '#FAFAFA',
          grey: '#666666',
          border: '#E0E0E0',
          hover: '#F5F5F5',
          gold: '#C5A880',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        script: ['Pinyon Script', 'cursive'],
      },
    },
  },
  plugins: [],
};
