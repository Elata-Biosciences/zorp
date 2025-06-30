/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Elata Design System Color Palette
        black: '#0A0A0A',
        offBlack: '#171717',
        gray3: '#6D6D6D',
        gray2: '#CCCCCC',
        gray1: '#DDDDDD',
        offWhite: '#F7F7F7',
        white: '#FDFDFD',
        elataGreen: '#607274',
        accentRed: '#FF797B',
        offCream: '#F8F5EE',
        cream1: '#F3EEE2',
        cream2: '#E5E0D3',
        
        // Legacy colors for compatibility
        primary: '#607274', // Updated to elataGreen
        secondary: '#FF797B', // Updated to accentRed
        warning: '#ffcc00',
        danger: '#ff3b30',
        success: '#34c759',
        info: '#32ade6',
      },
      fontFamily: {
        'montserrat': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'sf-pro': ['var(--font-sf-pro)', 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-pattern': 'none', // Clean minimal background
      },
      screens: {
        xxs: '256px',
        xs: '384px',
        s: '512px',
      },
      maxWidth: {
        'header-nav': '39rem',
      },
      height: {
        sidebar: 'calc(100dvh - 5rem)',
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeInScale': 'fadeInScale 0.4s ease-out forwards',
        'slideInRight': 'slideInRight 0.5s ease-out forwards',
        'pillActivate': 'pillActivate 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pillDeactivate': 'pillDeactivate 0.2s ease-out forwards',
        'contentSlideIn': 'contentSlideIn 0.5s ease-out forwards',
        'staggerFadeIn': 'staggerFadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInScale: {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        slideInRight: {
          from: {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        pillActivate: {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
          '50%': {
            transform: 'scale(1.08)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
          },
          '100%': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        pillDeactivate: {
          '0%': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contentSlideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px) scale(0.99)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        staggerFadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(15px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
