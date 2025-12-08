import { BaseParser } from '../core/BaseParser';

class DatePatternStrategy {
    execute(lines) {
        const patterns = [
            /(\d{4})-(\d{2})-(\d{2})/,                            // 2015-11-03
            /(\d{4})[.\-\/년]\s*(\d{1,2})[.\-\/월]\s*(\d{1,2})/, // 2023년 11월 24일
            /(\d{2})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/,     // 23-11-24
        ];

        for (const line of lines) {
            for (const pattern of patterns) {
                const match = line.text.match(pattern);
                if (match) {
                    let year = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10);
                    const day = parseInt(match[3], 10);

                    if (year < 100) year += 2000;

                    if (this._isValidDate(year, month, day)) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        return { value: dateStr, score: 0.9 };
                    }
                }
            }
        }

        return null;
    }

    _isValidDate(year, month, day) {
        if (month < 1 || month > 12 || day < 1 || day > 31) return false;
        const date = new Date(year, month - 1, day);
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 15);

        return date <= now && date >= minDate;
    }
}

export class DateParser extends BaseParser {
    constructor(lines) {
        super(lines);
        this.addStrategy(new DatePatternStrategy());
    }
}
