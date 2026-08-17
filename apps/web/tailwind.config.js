/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        alym: {
          gold: '#f2c738',
          dark: '#0a0c14',
          surface: '#14161f',
        },
      },
    },
  },
  plugins: [],
};
