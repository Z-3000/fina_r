/**
 * 유틸리티 함수 모음
 * - 숫자 입력 처리
 * - 금액 포맷팅
 */

// ===== 숫자 입력 유틸리티 =====

/**
 * Focus 시 0이면 빈 문자열로 변환 (입력 편의)
 * @param {Event} e - input focus 이벤트
 */
export const handleNumberFocus = (e) => {
  if (e.target.value === '0' || e.target.value === 0) {
    e.target.value = '';
  }
};

/**
 * Blur 시 빈 문자열이면 0으로 설정
 * @param {Event} e - input blur 이벤트
 * @param {Function} setter - state setter 함수
 * @param {string} field - 업데이트할 필드명
 */
export const handleNumberBlur = (e, setter, field) => {
  if (e.target.value === '' || e.target.value === null) {
    if (setter && field) {
      setter(prev => ({ ...prev, [field]: 0 }));
    }
  }
};

// ===== 금액 포맷팅 =====

/**
 * 금액을 천단위 콤마가 포함된 문자열로 변환
 * @param {number|null|undefined} amount - 포맷팅할 금액
 * @returns {string} 포맷팅된 금액 문자열
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return Math.round(amount).toLocaleString();
};

/**
 * 금액을 한국 원화 형식으로 포맷팅 (원 단위 포함)
 * @param {number|null|undefined} amount - 포맷팅할 금액
 * @returns {string} "1,234원" 형식의 문자열
 */
export const formatKRW = (amount) => {
  return `${formatAmount(amount)}원`;
};
