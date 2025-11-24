import { BaseParser } from '../core/BaseParser';
import { FuzzyMatcher } from '../utils/FuzzyMatcher';

class KeywordAmountStrategy {
    execute(lines) {
        const keywords = ['합계', '총액', '결제금액', '승인금액', '받을금액', '판매총액', '매출금액'];

        for (const line of lines) {
            for (const keyword of keywords) {
                if (FuzzyMatcher.contains(line.text, keyword)) {
                    // 1. 같은 라인의 마지막 숫자
                    const numbers = line.text.match(/([0-9]{1,3}(?:,?[0-9]{3})*)/g);
                    if (numbers) {
                        const lastNum = parseInt(numbers[numbers.length - 1].replace(/,/g, ''), 10);
                        if (lastNum > 0) return { value: lastNum, score: 1.0 };
                    }

                    // 2. (TODO) 다음 라인 탐색 로직 추가 가능
                }
            }
        }
        return null;
    }
}

class MaxNumberStrategy {
    execute(lines) {
        let maxAmount = 0;
        const allText = lines.map(l => l.text).join('\n');
        const allNumbers = allText.match(/([0-9]{1,3}(?:,?[0-9]{3})+)/g) || [];

        for (const numStr of allNumbers) {
            const num = parseInt(numStr.replace(/,/g, ''), 10);
            // 필터링: 너무 작거나 크거나, 날짜/전화번호 형식
            if (num > 100 && num < 100000000) {
                if (num > 20000000 && num < 21001231) continue; // 날짜
                if (num > maxAmount) maxAmount = num;
            }
        }

        if (maxAmount > 0) {
            return { value: maxAmount, score: 0.5 }; // 낮은 신뢰도 (Fallback)
        }
        return null;
    }
}

export class AmountParser extends BaseParser {
    constructor(lines) {
        super(lines);
        this.addStrategy(new KeywordAmountStrategy());
        this.addStrategy(new MaxNumberStrategy());
    }
}
