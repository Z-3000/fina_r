// ============================================
// FINA_R Design System - Color Constants
// 단일 진실 공급원 (Single Source of Truth)
// ============================================

// ===== Base Brand Colors =====
export const COLORS = {
  // Primary - Navy (메인, 전문성, 신뢰)
  primary: {
    main: '#003262',
    light: '#004080',
    dark: '#001a40',
    soft: '#E6F4FF',      // 배경용
    softer: '#F0F8FF',    // 더 연한 배경
  },

  // Secondary - Mint (성공, 성장, 수입)
  secondary: {
    main: '#00FFBF',
    light: '#66FFD9',
    dark: '#00CC99',
    soft: '#E6FFF7',
    text: '#006644',      // Mint 배경 위 텍스트
  },

  // Tertiary - Cyan (하이라이트, 정보)
  tertiary: {
    main: '#0FFFFF',
    light: '#66FFFF',
    dark: '#00CCCC',
    soft: '#E6FFFF',
    text: '#006666',
  },

  // Accent - Peach (따뜻한 악센트, 보상, 주의)
  accent: {
    main: '#FFC591',
    light: '#FFD9B3',
    dark: '#E6A060',
    soft: '#FFF5EC',
    text: '#8B4513',
  },

  // ===== Semantic Colors =====
  success: {
    main: '#00FFBF',       // = secondary.main
    bg: '#E6FFF7',
    text: '#006644',
  },

  warning: {
    main: '#FFC591',       // = accent.main
    bg: '#FFF5EC',
    text: '#8B4513',
  },

  error: {
    main: '#FF6B6B',
    bg: '#FFE6E8',
    text: '#CC1F2D',
  },

  info: {
    main: '#0FFFFF',       // = tertiary.main
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
    primary: '#003262',    // Navy
    secondary: '#6B7280',  // Gray-500
    muted: '#9CA3AF',      // Gray-400
    inverse: '#FFFFFF',
    link: '#003262',
  },
};

// ===== Tab Theme Colors =====
export const TAB_THEMES = {
  dashboard: {
    primary: COLORS.primary.main,
    soft: COLORS.primary.soft,
    text: COLORS.neutral.white,
    border: COLORS.primary.main,
  },
  receipts: {
    primary: COLORS.primary.main,
    soft: COLORS.primary.soft,
    text: COLORS.neutral.white,
    border: COLORS.primary.light,
  },
  budget: {
    primary: COLORS.accent.main,
    soft: COLORS.accent.soft,
    text: COLORS.primary.main,
    border: COLORS.accent.main,
  },
  prediction: {
    primary: COLORS.secondary.main,
    soft: COLORS.secondary.soft,
    text: COLORS.primary.main,
    border: COLORS.secondary.main,
  },
  benefits: {
    primary: COLORS.tertiary.main,
    soft: COLORS.tertiary.soft,
    text: COLORS.primary.main,
    border: COLORS.tertiary.main,
  },
  challenges: {
    primary: COLORS.primary.main,
    soft: COLORS.primary.soft,
    text: COLORS.neutral.white,
    border: COLORS.primary.main,
  },
};

// ===== Legacy Aliases (하위 호환성 - 점진적 제거 예정) =====
export const PRIMARY_COLOR = COLORS.primary.main;
export const SECONDARY_COLOR = COLORS.secondary.main;
export const TERTIARY_COLOR = COLORS.tertiary.main;
export const ACCENT_COLOR = COLORS.accent.main;

export const PRIMARY_LIGHT = COLORS.primary.light;
export const PRIMARY_DARK = COLORS.primary.dark;
export const SECONDARY_LIGHT = COLORS.secondary.light;
export const SECONDARY_DARK = COLORS.secondary.dark;
export const TERTIARY_LIGHT = COLORS.tertiary.light;
export const TERTIARY_DARK = COLORS.tertiary.dark;
export const ACCENT_LIGHT = COLORS.accent.light;
export const ACCENT_DARK = COLORS.accent.dark;

export const SUCCESS_COLOR = COLORS.success.main;
export const WARNING_COLOR = COLORS.warning.main;
export const ERROR_COLOR = COLORS.error.main;
export const INFO_COLOR = COLORS.info.main;

// 레거시 별명 (기존 코드 호환)
export const ACCENT_GOLD = COLORS.accent.main;
export const BRAND_COLOR = COLORS.primary.main;
export const PRIMARY_BLUE = COLORS.primary.main;
export const SUCCESS_GREEN = COLORS.secondary.main;
export const NEON_ICE = COLORS.tertiary.main;

// ===== Utility Functions =====
/**
 * 색상에 투명도 적용
 * @param {string} hex - 헥스 컬러 코드
 * @param {number} alpha - 투명도 (0-1)
 * @returns {string} rgba 문자열
 */
export const withAlpha = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 점수에 따른 색상 반환 (세금 건강도 등)
 * @param {number} score - 점수 (0-100)
 * @returns {object} { bg, text } 색상 객체
 */
export const getScoreColor = (score) => {
  if (score >= 70) {
    return { bg: COLORS.primary.main, text: COLORS.neutral.white };
  } else if (score >= 50) {
    return { bg: COLORS.accent.main, text: COLORS.primary.main };
  }
  return { bg: COLORS.error.main, text: COLORS.neutral.white };
};

/**
 * 증감에 따른 색상 반환
 * @param {number} value - 값 (양수/음수)
 * @returns {string} 색상 코드
 */
export const getTrendColor = (value) => {
  if (value > 0) return COLORS.secondary.main;  // 증가 - Mint
  if (value < 0) return COLORS.error.main;      // 감소 - Red
  return COLORS.neutral[500];                    // 변동없음 - Gray
};

// ===== CSS Variable 생성 (선택적 사용) =====
export const CSS_VARIABLES = {
  '--color-primary': COLORS.primary.main,
  '--color-primary-light': COLORS.primary.light,
  '--color-primary-dark': COLORS.primary.dark,
  '--color-primary-soft': COLORS.primary.soft,

  '--color-secondary': COLORS.secondary.main,
  '--color-secondary-light': COLORS.secondary.light,
  '--color-secondary-soft': COLORS.secondary.soft,

  '--color-tertiary': COLORS.tertiary.main,
  '--color-tertiary-soft': COLORS.tertiary.soft,

  '--color-accent': COLORS.accent.main,
  '--color-accent-soft': COLORS.accent.soft,

  '--color-success': COLORS.success.main,
  '--color-warning': COLORS.warning.main,
  '--color-error': COLORS.error.main,
  '--color-info': COLORS.info.main,

  '--color-text-primary': COLORS.text.primary,
  '--color-text-secondary': COLORS.text.secondary,
  '--color-text-muted': COLORS.text.muted,
};

export default COLORS;
