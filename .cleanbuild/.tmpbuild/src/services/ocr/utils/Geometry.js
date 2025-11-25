/**
 * Geometry Utils
 * 좌표 및 공간 분석을 위한 유틸리티
 */

export const Geometry = {
    /**
     * 폴리곤의 중심 Y좌표 계산
     */
    getCenterY(poly) {
        if (!poly || !poly.vertices) return 0;
        const ys = poly.vertices.map(v => v.y);
        return (Math.min(...ys) + Math.max(...ys)) / 2;
    },

    /**
     * 폴리곤의 중심 X좌표 계산
     */
    getCenterX(poly) {
        if (!poly || !poly.vertices) return 0;
        const xs = poly.vertices.map(v => v.x);
        return (Math.min(...xs) + Math.max(...xs)) / 2;
    },

    /**
     * 두 폴리곤 사이의 수직 거리 (Y축)
     */
    getVerticalDistance(poly1, poly2) {
        return Math.abs(this.getCenterY(poly1) - this.getCenterY(poly2));
    },

    /**
     * 두 폴리곤이 같은 라인에 있는지 확인
     * @param {Object} poly1 
     * @param {Object} poly2 
     * @param {number} tolerance 허용 오차 (픽셀)
     */
    isSameLine(poly1, poly2, tolerance = 15) {
        return this.getVerticalDistance(poly1, poly2) <= tolerance;
    },

    /**
     * 폴리곤이 특정 영역(상단/하단 등)에 포함되는지 확인
     * @param {Object} poly 
     * @param {number} imgHeight 이미지 전체 높이 (추정치)
     * @param {number} ratio 비율 (0.0 ~ 1.0)
     * @param {string} type 'top' | 'bottom'
     */
    isInRegion(poly, imgHeight, ratio, type = 'top') {
        const y = this.getCenterY(poly);
        const threshold = imgHeight * ratio;
        if (type === 'top') return y <= threshold;
        if (type === 'bottom') return y >= (imgHeight - threshold);
        return false;
    }
};
