import { BaseParser } from '../core/BaseParser';

class HeaderStrategy {
    execute(lines) {
        // 상단 5줄에서 첫 번째 유효한 텍스트를 상호명으로 채택
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const lineText = lines[i].text;

            // 숫자만 있거나 너무 긴 것 제외
            if (/^\d+$/.test(lineText)) continue;
            if (lineText.length > 30) continue;

            return { value: lineText, score: 0.9 };
        }

        return null;
    }
}

export class MerchantParser extends BaseParser {
    constructor(lines) {
        super(lines);
        this.addStrategy(new HeaderStrategy());
    }
}
