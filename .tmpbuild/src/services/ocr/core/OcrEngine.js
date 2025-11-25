import { Preprocessor } from './Preprocessor';
import { MerchantParser } from '../parsers/MerchantParser';
import { DateParser } from '../parsers/DateParser';
import { AmountParser } from '../parsers/AmountParser';
import { ItemParser } from '../parsers/ItemParser';
import { CategoryParser } from '../parsers/CategoryParser';

export class OcrEngine {
    constructor() {
        // Config 설정 가능
    }

    process(ocrResult) {
        // 1. 전처리
        const preprocessor = new Preprocessor(ocrResult.fields);
        const lines = preprocessor.process();
        const fullText = lines.map(l => l.text).join('\n');

        // 신뢰도 계산
        const fields = ocrResult.fields || [];
        let totalConfidence = 0;
        for (const field of fields) {
            totalConfidence += (field.inferConfidence || 0);
        }
        const avgConfidence = fields.length > 0 ? totalConfidence / fields.length : 0;

        // 2. 각 파서 실행
        const merchant = new MerchantParser(lines).parse();
        const date = new DateParser(lines).parse() || new Date().toISOString().split('T')[0];
        const amount = new AmountParser(lines).parse();
        const items = new ItemParser(lines).parse();

        // 카테고리는 상호명과 품목을 기반으로 추론
        const category = new CategoryParser(lines).parse(merchant, fullText);

        // 3. 결과 조립
        return {
            merchant,
            date,
            amount,
            category,
            items,
            rawText: fullText,
            confidence: avgConfidence,
            source: 'clova-advanced'
        };
    }
}
