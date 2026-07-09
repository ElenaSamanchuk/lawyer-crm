/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#1a2332',
        muted: '#5c6b82',
        line: '#d9e2ef',
        canvas: '#f4f6fa',
        brand: '#1e3a5f',
        accent: '#2f5d9e',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(26 35 50 / 0.06), 0 8px 24px rgb(26 35 50 / 0.06)',
      },
    },
  },
  plugins: [],
};
