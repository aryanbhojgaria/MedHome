/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          // New red primary palette
          red: {
            DEFAULT: '#E53935',
            light: '#FF6B6B',
            dark: '#B71C1C',
            glow: 'rgba(229, 57, 53, 0.3)',
            soft: 'rgba(229, 57, 53, 0.1)',
          },
          // Keep emergency red
          emergency: {
            DEFAULT: '#FF3B30',
            glow: 'rgba(255, 59, 48, 0.3)',
          },
          // Dark surfaces
          dark: {
            bg: '#0A0A0A',
            card: '#141414',
            card2: '#1A1A1A',
            border: 'rgba(255, 255, 255, 0.07)',
            text: '#FFFFFF',
          },
          // Light surfaces
          light: {
            bg: '#F5F5F7',
            card: '#FFFFFF',
            border: 'rgba(0, 0, 0, 0.07)',
            text: '#111111',
          },
          // Legacy compat aliases
          blue: {
            DEFAULT: '#E53935',
            light: '#FF6B6B',
            dark: '#B71C1C',
            glow: 'rgba(229, 57, 53, 0.15)',
          },
          teal: {
            DEFAULT: '#FF6B6B',
            light: '#FF8A80',
            dark: '#E53935',
            glow: 'rgba(255, 107, 107, 0.15)',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '60px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'spin-slow': 'spin 12s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-400px 0' },
          to: { backgroundPosition: '400px 0' },
        },
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(229, 57, 53, 0.25)',
        'red-glow-lg': '0 0 40px rgba(229, 57, 53, 0.35)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-light': '0 4px 24px rgba(0, 0, 0, 0.06)',
        // Legacy
        'neon-blue': '0 0 15px rgba(229, 57, 53, 0.4)',
        'neon-teal': '0 0 15px rgba(255, 107, 107, 0.4)',
        'neon-emergency': '0 0 20px rgba(255, 59, 48, 0.6)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
