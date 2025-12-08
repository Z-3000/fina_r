/**
 * API 호출 래퍼 유틸리티
 * - 에러를 삼키지 않고 { data, error } 형태로 반환
 * - toast와 연동하여 에러 표시
 */

/**
 * API 호출을 래핑하여 에러를 안전하게 처리
 * @param {Promise} apiCall - API 호출 Promise
 * @param {string} context - 에러 컨텍스트 (예: '영수증 로드')
 * @param {Object} options - 옵션
 * @param {Function} options.onError - 에러 발생 시 호출할 함수 (toast.error 등)
 * @param {*} options.fallback - 에러 시 반환할 기본값 (기본: null)
 * @returns {Promise<{data: *, error: Error|null}>}
 */
export async function wrapApiCall(apiCall, context = '', options = {}) {
  const { onError, fallback = null } = options;

  try {
    const data = await apiCall;
    return { data, error: null };
  } catch (error) {
    const message = error?.message || '알 수 없는 오류가 발생했습니다';
    console.error(`[${context}] API 오류:`, error);

    if (onError) {
      onError(`${context}: ${message}`);
    }

    return { data: fallback, error };
  }
}

/**
 * 여러 API 호출을 병렬로 실행하고 각각의 결과를 래핑
 * @param {Array<{call: Promise, context: string, fallback?: *}>} calls - API 호출 배열
 * @param {Object} options - 공통 옵션
 * @param {Function} options.onError - 에러 발생 시 호출할 함수
 * @returns {Promise<Array<{data: *, error: Error|null}>>}
 */
export async function wrapApiCalls(calls, options = {}) {
  const { onError } = options;

  const results = await Promise.all(
    calls.map(({ call, context, fallback = null }) =>
      wrapApiCall(call, context, { onError, fallback })
    )
  );

  return results;
}

/**
 * API 결과에서 에러가 있는지 확인
 * @param {Array<{data: *, error: Error|null}>} results
 * @returns {boolean}
 */
export function hasApiErrors(results) {
  return results.some((r) => r.error !== null);
}

/**
 * API 결과에서 데이터만 추출 (에러가 있으면 fallback 사용)
 * @param {{data: *, error: Error|null}} result
 * @param {*} fallback
 * @returns {*}
 */
export function extractData(result, fallback = null) {
  return result.error ? fallback : result.data;
}
