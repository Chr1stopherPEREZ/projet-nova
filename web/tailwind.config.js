/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary - Blue Spruce (teal)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0F766E', // Blue Spruce - main
          700: '#0B5F59', // Stormy Teal - hover
          800: '#115e59',
          900: '#134e4a',
        },
        // Semantic colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#16A16A', // Shamrock
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#F59F59', // Sandy Brown
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#DC2626', // Primary Scarlet
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0F3675', // Regal Navy
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // UI colors
        background: '#FAFAFA', // Bright Snow
        border: '#E5E7EB', // Platinum
        text: '#111111', // Onyx
      },
    },
  },
  plugins: [],
}
