/**
 * 차트 색상 상수
 * 모든 차트 컴포넌트에서 공통으로 사용
 */

// 기본 차트 색상 (수입/지출, 성공/실패)
export const CHART_COLORS = {
  green: '#10B981',      // 차분한 초록 (emerald-500) - 긍정, 수입
  greenLight: '#34D399', // 밝은 초록 (emerald-400)
  red: '#EF4444',        // 차분한 빨강 (red-500) - 경고, 지출
  redLight: '#F87171',   // 밝은 빨강 (red-400)
  danger: '#DC2626',     // D-day 강조색 (red-600)
};

// 고유 색상 팔레트 (파이 차트, 다중 카테고리용)
export const UNIQUE_CHART_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#9CA3AF', // Gray (기타용)
];
