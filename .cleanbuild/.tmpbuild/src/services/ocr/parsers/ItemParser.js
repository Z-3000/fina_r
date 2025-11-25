import { BaseParser } from '../core/BaseParser';
import { FuzzyMatcher } from '../utils/FuzzyMatcher';

class TableExtractionStrategy {
    execute(lines) {
        const items = [];
        let isTableStarted = false;

        // 테이블 헤더 찾기
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (FuzzyMatcher.contains(line.text, '상품') ||
                (FuzzyMatcher.contains(line.text, '단가') && FuzzyMatcher.contains(line.text, '수량'))) {
                isTableStarted = true;
                continue;
            }

            if (isTableStarted) {
                // 합계 섹션 만나면 종료
                if (FuzzyMatcher.contains(line.text, '합계') ||
                    FuzzyMatcher.contains(line.text, '총액') ||
                    FuzzyMatcher.contains(line.text, '결제금액')) {
                    break;
                }

                // 과세/면세/부가세 라인 제외 (Fix)
                if (/(과세|면세|부가세|물품가액)/.test(line.text)) continue;

                // 라인 파싱
                const item = this._parseItemLine(line);
                if (item) items.push(item);
            }
        }

        if (items.length > 0) {
            return { value: items, score: 0.9 };
        }
        return { value: [], score: 0 };
    }

    _parseItemLine(line) {
        // 단순화된 로직: 라인의 마지막 숫자를 금액으로, 나머지를 상품명으로
        const numbers = line.text.match(/([0-9,]+)$/);
        if (numbers) {
            const priceStr = numbers[1];
            const price = parseInt(priceStr.replace(/,/g, ''), 10);
            const name = line.text.replace(priceStr, '').trim();

            if (name.length > 0 && price > 0) {
                return { name, price, qty: 1 };
            }
        }
        return null;
    }
}

export class ItemParser extends BaseParser {
    constructor(lines) {
        super(lines);
        this.addStrategy(new TableExtractionStrategy());
    }
}
