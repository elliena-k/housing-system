/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Royal blue brand palette
        primary: {
          50: '#eef3fb',
          100: '#d7e3f6',
          200: '#b3c9ec',
          300: '#86a8df',
          400: '#5a83cf',
          500: '#3561bb',
          600: '#294d99',
          700: '#203c78',
          800: '#182c58',
          900: '#101d3a',
          DEFAULT: '#3561bb',
        },
        // Gold accent, used sparingly
        accent: {
          50: '#fdf8e8',
          100: '#faedbf',
          200: '#f3d97a',
          300: '#e9c142',
          400: '#d9a51f',
          500: '#b8840f',
          600: '#94680a',
          700: '#6f4d06',
          800: '#4b3304',
          900: '#2a1c02',
          DEFAULT: '#d9a51f',
        },
        // Ink neutrals
        ink: {
          50: '#f6f6f5',
          100: '#ebebea',
          200: '#d5d5d3',
          300: '#b3b3b0',
          400: '#8e8e8b',
          500: '#6b6b68',
          600: '#515150',
          700: '#3a3a39',
          800: '#252524',
          900: '#141413',
        },
        surface: {
          DEFAULT: '#ffffff',
          1: '#f6f7f9',
          2: '#eceef2',
        },
        success: {
          light: '#d9f3e6',
          DEFAULT: '#1f7a52',
          dark: '#0c3d2c',
        },
        warning: {
          light: '#fdf0cc',
          DEFAULT: '#a86a06',
          dark: '#4d3208',
        },
        danger: {
          light: '#fde8e8',
          DEFAULT: '#b8322a',
          dark: '#5c1915',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        pill: '999px',
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        label: ['12px', { lineHeight: '1.4', letterSpacing: '0.005em' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        body: ['15px', { lineHeight: '1.55' }],
        'body-lg': ['17px', { lineHeight: '1.55' }],
        title: ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        display: ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
