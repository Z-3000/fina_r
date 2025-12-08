import { Geometry } from '../utils/Geometry';

export class Preprocessor {
    constructor(fields) {
        this.fields = fields || [];
    }

    /**
     * OCR 데이터를 분석 가능한 라인 단위로 재구성
     */
    process() {
        if (!this.fields || this.fields.length === 0) return [];

        // 1. Y축 정렬
        const sortedByY = [...this.fields].sort((a, b) => {
            const aY = Geometry.getCenterY(a.boundingPoly);
            const bY = Geometry.getCenterY(b.boundingPoly);
            return aY - bY;
        });

        // 2. 라인 클러스터링
        const lines = [];
        let currentLine = [];
        let lastY = -1;
        const LINE_TOLERANCE = 15; // 픽셀 단위 허용 오차

        for (const field of sortedByY) {
            const currentY = Geometry.getCenterY(field.boundingPoly);

            if (lastY === -1 || Math.abs(currentY - lastY) <= LINE_TOLERANCE) {
                currentLine.push(field);
            } else {
                // 라인 변경: 이전 라인을 X축 정렬하여 저장
                this._finalizeLine(currentLine, lines);
                currentLine = [field];
            }
            lastY = currentY;
        }

        if (currentLine.length > 0) {
            this._finalizeLine(currentLine, lines);
        }

        return lines;
    }

    _finalizeLine(currentLine, lines) {
        // X축 정렬
        currentLine.sort((a, b) => Geometry.getCenterX(a.boundingPoly) - Geometry.getCenterX(b.boundingPoly));

        // 라인 객체 생성
        const text = currentLine.map(f => f.inferText).join(' ');
        const boundingPoly = this._mergeBoundingPolys(currentLine);

        lines.push({
            fields: currentLine,
            text,
            boundingPoly,
            y: Geometry.getCenterY(boundingPoly)
        });
    }

    _mergeBoundingPolys(fields) {
        if (!fields.length) return null;
        // 전체를 감싸는 박스 계산 (단순화)
        const allVertices = fields.flatMap(f => f.boundingPoly.vertices);
        const xs = allVertices.map(v => v.x);
        const ys = allVertices.map(v => v.y);

        return {
            vertices: [
                { x: Math.min(...xs), y: Math.min(...ys) }, // Top-Left
                { x: Math.max(...xs), y: Math.min(...ys) }, // Top-Right
                { x: Math.max(...xs), y: Math.max(...ys) }, // Bottom-Right
                { x: Math.min(...xs), y: Math.max(...ys) }  // Bottom-Left
            ]
        };
    }
}
