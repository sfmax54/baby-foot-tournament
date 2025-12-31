/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1972f5',
          600: '#1560d6',
          700: '#1148ad',
          800: '#0e3a8c',
          900: '#0c2d6b',
        },
        secondary: {
          50: '#fef8ed',
          100: '#fdefd1',
          200: '#fbdda3',
          300: '#f9c66a',
          400: '#f7ab30',
          500: '#f5951a',
          600: '#e07b07',
          700: '#ba6208',
          800: '#954e0e',
          900: '#79400f',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1972f5',
          600: '#1560d6',
          700: '#1148ad',
          800: '#0e3a8c',
          900: '#0c2d6b',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'box': '1rem',
        'field': '0.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
