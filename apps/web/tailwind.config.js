/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0D10',
          900: '#111419',
          800: '#171B22',
          700: '#1E242E',
          600: '#2A3140',
        },
        mist: {
          50: '#F7F5F1',
          100: '#EDE9E1',
          200: '#D9D3C7',
          300: '#B8B0A2',
          400: '#8F877A',
          500: '#6E675C',
        },
        brass: {
          300: '#E4C47A',
          400: '#D4AF5A',
          500: '#B8923A',
          600: '#8F6E28',
        },
        signal: {
          good: '#3D9B6E',
          warn: '#C4922A',
          bad: '#C45B4A',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
        lift: '0 12px 40px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        panel: '12px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
