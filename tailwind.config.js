/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#152033',
        muted: '#5f6f86',
        line: '#dbe3ef',
        canvas: '#eef2f7',
        surface: '#ffffff',
        brand: '#1a3358',
        accent: '#2b5ea8',
        success: '#1f7a55',
        warning: '#b45309',
        danger: '#c0392b',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(21 32 51 / 0.05), 0 10px 30px rgb(21 32 51 / 0.06)',
        float: '0 8px 32px rgb(21 32 51 / 0.14)',
      },
      maxWidth: {
        app: '72rem',
      },
    },
  },
  plugins: [],
};
