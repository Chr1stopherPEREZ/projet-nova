/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Core Palette */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563EB', /* Royal Blue - Brand Primary */
          600: '#2563EB', /* Royal Blue */
          700: '#1D4ED8', /* Royal Azur - Brand Primary Hover */
          800: '#1e40af',
          900: '#1e3a8a',
        },
        background: {
          app: '#F8FAFC',    /* Bright Snow */
          card: '#FFFFFF',   /* White */
          sidebar: '#F9FAFB', /* Catskill White */
        },
        border: {
          default: '#E5E7EB', /* Platinium */
          subtle: '#CBD5E1',  /* Pale Slate */
        },
        text: {
          primary: '#0F172A',   /* Prussian Blue */
          secondary: '#64748B', /* Slate Grey */
          muted: '#94A3B8',     /* Cool Steel */
          light: '#F8FAFC',     /* Bright Snow (Pour Bg Noir) */
        },
        /* Semantic Palette */
        success: {
          text: '#16A34A',      /* Medium Jungle */
          bg: '#DCFCE7',        /* Frosted Mint */
        },
        danger: {
          text: '#DC2626',      /* Primary Scarlet */
          bg: '#FEE2E2',        /* Soft Blush */
          hover: '#B91C1C',     /* Darker Scarlet */
        },
        warning: {
          text: '#F59E0B',      /* Golden Orange */
          bg: '#FEF3C7',        /* Lemon Chiffon */
        },
        neutral: {
          text: '#64748B',      /* Slate Grey */
          bg: '#F1F5F9',        /* Alice Blue */
        },
        info: {
          text: '#2563EB',      /* Royal Blue */
          bg: '#DBEAFE',        /* Light Grayish */
        },
        /* Auth Dark Theme */
        auth: {
          bg: '#0F172A',           /* Prussian Blue */
          bgSecondary: '#111827',  /* Ink Black */
          grid: '#1E293B',         /* Deep Space Blue */
          border: '#334155',       /* Charcoal Blue */
        }
      },
    },
  },
  plugins: [],
}
