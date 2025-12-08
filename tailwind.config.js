// tailwind.config.js
// FINA_R Design System - Unified Color System
// Source of Truth: src/constants/colors.js

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Primary - Navy (메인, 전문성, 신뢰) =====
        primary: {
          DEFAULT: '#003262',
          light: '#004080',
          dark: '#001a40',
          soft: '#E6F4FF',
          softer: '#F0F8FF',
        },

        // ===== Secondary - Mint (성공, 성장, 수입) =====
        secondary: {
          DEFAULT: '#00FFBF',
          light: '#66FFD9',
          dark: '#00CC99',
          soft: '#E6FFF7',
        },

        // ===== Tertiary - Cyan (하이라이트, 정보) =====
        tertiary: {
          DEFAULT: '#0FFFFF',
          light: '#66FFFF',
          dark: '#00CCCC',
          soft: '#E6FFFF',
        },

        // ===== Accent - Peach (따뜻한 악센트, 보상) =====
        accent: {
          DEFAULT: '#FFC591',
          light: '#FFD9B3',
          dark: '#E6A060',
          soft: '#FFF5EC',
        },

        // ===== Semantic Colors =====
        success: {
          DEFAULT: '#00FFBF',
          bg: '#E6FFF7',
          text: '#006644',
        },
        warning: {
          DEFAULT: '#FFC591',
          bg: '#FFF5EC',
          text: '#8B4513',
        },
        error: {
          DEFAULT: '#FF6B6B',
          bg: '#FFE6E8',
          text: '#CC1F2D',
        },
        info: {
          DEFAULT: '#0FFFFF',
          bg: '#E6FFFF',
          text: '#006666',
        },

        // ===== Neutral Colors =====
        neutral: {
          white: '#FFFFFF',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          black: '#000000',
        },

        // ===== Text Colors =====
        text: {
          primary: '#003262',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          inverse: '#FFFFFF',
        },

        // ===== Legacy Brand (for backward compatibility) =====
        brand: {
          DEFAULT: '#003262',
          dark: '#001a40',
          light: '#004080',
        },
      },

      // ===== Typography =====
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // ===== Spacing =====
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ===== Border Radius (Flat Design) =====
      borderRadius: {
        'DEFAULT': '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },

      // ===== Box Shadow (최소화 - Flat Design) =====
      boxShadow: {
        'flat': '0 1px 2px 0 rgba(0, 50, 98, 0.05)',
        'flat-md': '0 2px 4px 0 rgba(0, 50, 98, 0.08)',
        'none': 'none',
      },

      // ===== Animation =====
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
