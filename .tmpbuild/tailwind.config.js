// tailwind.config.js
// FINA_R Design System - Flat Design (No Gradients)

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Brand Colors =====
        brand: {
          DEFAULT: '#f80c0cff',      // Dark Amethyst - 주요 텍스트, 헤더, 다크모드 배경
          dark: '#2A0B44',         // Darker variant
          light: '#cee0d3ff',        // Lighter variant
        },

        // ===== Primary Action =====
        primary: {
          DEFAULT: '#202122ff',      // Azure Blue - 확인 버튼, 링크, 활성화 상태
          hover: '#031a31ff',        // Hover state
          light: '#E6F2FF',        // Light background
          dark: '#101011ff',         // Dark variant
        },

        // ===== Secondary/Highlights =====
        secondary: {
          green: '#00FF7F',        // Spring Green - 긍정/성공 상태
          ice: '#50FFEE',          // Neon Ice - 특정 탭 테마, 상태 표시
        },

        // ===== Accent (Point) - 남발 금지! =====
        accent: {
          DEFAULT: '#FFD700',      // Gold - 가장 중요한 CTA, 강조 아이콘
          hover: '#08f894ff',        // Hover state
          light: '#FFF8DC',        // Light background
        },

        // ===== Tab-specific Colors (Contextual) =====
        tab: {
          home: '#131516ff',         // Azure Blue - 대시보드/홈
          budget: '#360F56',       // Dark Amethyst - 지출/예산 관리
          income: '#00FF7F',       // Spring Green - 수입/자산 관리
          settings: '#50FFEE',     // Neon Ice - 설정/기타
        },

        // ===== Semantic Colors =====
        success: {
          DEFAULT: '#00FF7F',      // Spring Green
          bg: '#E6FFF2',           // Light success background
          text: '#006633',         // Dark text for success
        },
        warning: {
          DEFAULT: '#FFD700',      // Gold
          bg: '#FFFCE6',           // Light warning background
          text: '#806B00',         // Dark text for warning
        },
        error: {
          DEFAULT: '#FF4757',      // Red
          bg: '#FFE6E8',           // Light error background
          text: '#CC1F2D',         // Dark text for error
        },
        info: {
          DEFAULT: '#292a2bff',      // Azure Blue
          bg: '#E6F2FF',           // Light info background
          text: '#1e1f20ff',         // Dark text for info
        },

        // ===== Neutral Colors =====
        neutral: {
          white: '#FFFFFF',
          50: '#F9FAFB',           // 배경 (연한 회색)
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
          primary: '#360F56',      // Dark Amethyst - 주요 텍스트
          secondary: '#6B7280',    // Gray-500 - 보조 텍스트
          muted: '#9CA3AF',        // Gray-400 - 비활성 텍스트
          inverse: '#FFFFFF',      // 어두운 배경 위 텍스트
          onLight: '#360F56',      // 밝은 배경 위 (Spring Green, Neon Ice 위)
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

      // ===== Border Radius (Flat Design - 적당한 라운딩) =====
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
        'flat': '0 1px 2px 0 rgba(54, 15, 86, 0.05)',
        'flat-md': '0 2px 4px 0 rgba(54, 15, 86, 0.08)',
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
