/**
 * Fuzzy Matcher
 * 오타 및 공백에 유연한 텍스트 매칭 유틸리티
 */

export const FuzzyMatcher = {
    /**
     * 키워드를 유연한 정규식으로 변환 (공백 허용)
     * 예: "합계" -> /합\s*계/
     */
    createFlexibleRegex(keyword) {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = escaped.split('').join('\\s*');
        return new RegExp(pattern, 'i');
    },

    /**
     * 텍스트에 키워드가 포함되어 있는지 확인 (Fuzzy)
     */
    contains(text, keyword) {
        if (!text || !keyword) return false;
        const regex = this.createFlexibleRegex(keyword);
        return regex.test(text);
    },

    /**
     * Levenshtein Distance (편집 거리) 계산
     * (필요 시 사용, 현재는 Regex 위주로 처리)
     */
    levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
};
