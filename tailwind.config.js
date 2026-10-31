/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6D4AFF',
          dark: '#5A35F0',
          light: '#A592FF',
          secondary: '#8B6CFF',
        },
        // Cinzas "grafite" levemente azulados (substituem o zinc padrão)
        zinc: {
          50: '#F6F7F9',
          100: '#EDEEF2',
          150: '#E3E5EA',
          200: '#D8DBE2',
          250: '#C9CDD6',
          300: '#B4B9C4',
          400: '#8A909C',
          450: '#757B88',
          500: '#636976',
          600: '#4B505C',
          650: '#3F4450',
          700: '#333844',
          750: '#2A2E39',
          800: '#22262F',
          850: '#1B1F27',
          900: '#15181F',
          925: '#111319',
          950: '#0B0D12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(109 74 255 / 0.25), 0 8px 30px -8px rgb(109 74 255 / 0.45)',
      },
    },
  },
  plugins: [],
};
