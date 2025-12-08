
// 카테고리 키워드 매핑 (확장됨)
const CATEGORY_KEYWORDS = {
    '식비': ['카페', '커피', '스타벅스', '이디야', '투썸', '빽다방', '메가커피', '식당', '음식', '치킨', '피자', '햄버거', '맥도날드', 'KFC', '버거킹', '롯데리아', '배달', '요기요', '배민', '쿠팡이츠', '반찬', '김밥', '떡볶이', '분식', '밥', '국', '찌개', '고기', '삼겹살', '족발', '보쌈', '파리바게뜨', '뚜레쥬르', '베이커리', '빵', '써브웨이', '아웃백', '빕스', '애슐리'],
    '편의점': ['CU', 'GS25', 'GS편의점', '세븐일레븐', '7-ELEVEN', '이마트24', '미니스톱', '편의점', 'CVS'],
    '마트/식료품': ['이마트', '홈플러스', '롯데마트', '코스트코', '트레이더스', '하나로마트', '농협', '마트', '슈퍼', '식자재', '청과', '정육', '수산', '마켓컬리', '오아시스'],
    '생활용품': ['다이소', '올리브영', '롭스', '시코르', '드럭스토어', '약국', '생활', '잡화', '무인양품', '자주'],
    '교통': ['주유소', 'SK에너지', 'GS칼텍스', 'S-OIL', '현대오일', '주유', '택시', '카카오T', '버스', '지하철', '교통', '톨게이트', '하이패스', '주차', '코레일', 'SRT', '티머니'],
    '문화/여가': ['CGV', '롯데시네마', '메가박스', '영화', '노래방', '볼링', 'PC방', '게임', '넷플릭스', '티빙', '웨이브', '멜론', '유튜브', '전시', '공연', '티켓'],
    '도서/교육': ['교보문고', '영풍문고', '알라딘', '예스24', '서점', '학원', '교육', '강의', '인프런', '패스트캠퍼스', '유데미'],
    '의료': ['병원', '의원', '클리닉', '약국', '치과', '안과', '피부과', '정형외과', '내과', '소아과', '한의원', '건강검진'],
    '쇼핑': ['백화점', '롯데백화점', '신세계', '현대백화점', '아울렛', '쇼핑몰', '무신사', '쿠팡', '11번가', 'G마켓', '네이버페이', '카카오페이', 'SSG', '티몬', '위메프', '지그재그', '에이블리'],
    '통신/구독': ['SKT', 'KT', 'LGU+', '통신', '인터넷', '구독', '멤버십'],
};

const groupFieldsByLine = (fields) => {
    if (!fields || fields.length === 0) return [];

    const sortedByY = [...fields].sort((a, b) => {
        const aY = getCenterY(a.boundingPoly);
        const bY = getCenterY(b.boundingPoly);
        return aY - bY;
    });

    const lines = [];
    let currentLine = [];
    let lastY = -1;
    const LINE_TOLERANCE = 15;

    for (const field of sortedByY) {
        const currentY = getCenterY(field.boundingPoly);

        if (lastY === -1 || Math.abs(currentY - lastY) <= LINE_TOLERANCE) {
            currentLine.push(field);
        } else {
            currentLine.sort((a, b) => getCenterX(a.boundingPoly) - getCenterX(b.boundingPoly));
            lines.push(currentLine);
            currentLine = [field];
        }
        lastY = currentY;
    }

    if (currentLine.length > 0) {
        currentLine.sort((a, b) => getCenterX(a.boundingPoly) - getCenterX(b.boundingPoly));
        lines.push(currentLine);
    }

    return lines;
};

const getCenterY = (poly) => {
    if (!poly || !poly.vertices) return 0;
    const ys = poly.vertices.map(v => v.y);
    return (Math.min(...ys) + Math.max(...ys)) / 2;
};

const getCenterX = (poly) => {
    if (!poly || !poly.vertices) return 0;
    const xs = poly.vertices.map(v => v.x);
    return (Math.min(...xs) + Math.max(...xs)) / 2;
};

const parseReceiptFromFields = (fields, confidence) => {
    const lines = groupFieldsByLine(fields);
    const fullText = lines.map(line => line.map(f => f.inferText).join(' ')).join('\n');

    const result = {
        merchant: null,
        amount: null,
        date: null,
        category: '기타',
        items: [],
        rawText: fullText,
        confidence: confidence || 0,
    };

    for (let i = 0; i < Math.min(lines.length, 7); i++) {
        const lineText = lines[i].map(f => f.inferText).join(' ');
        if (/(영수증|카드전표|매출전표|거래명세|고객용|가맹점|No\.|Tel|사업자|대표|주소)/i.test(lineText)) continue;
        if (/^[0-9\-\.\s:]+$/.test(lineText)) continue;

        let merchantName = lineText;
        if (i + 1 < lines.length) {
            const nextLineText = lines[i + 1].map(f => f.inferText).join(' ');
            if (/(점|지점|Branch)$/i.test(nextLineText) && nextLineText.length < 10) {
                merchantName += ` ${nextLineText}`;
                i++;
            }
        }

        result.merchant = merchantName;
        break;
    }

    const datePatterns = [
        /(\d{4})[.\-\/년]\s*(\d{1,2})[.\-\/월]\s*(\d{1,2})/,
        /(\d{2})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/,
        /(\d{4})\s+(\d{1,2})\s+(\d{1,2})/,
    ];

    for (const line of lines) {
        const lineText = line.map(f => f.inferText).join(' ');
        const hasDateKeyword = /(일시|날짜|Date|거래일|승인일)/i.test(lineText);

        for (const pattern of datePatterns) {
            const match = lineText.match(pattern);
            if (match) {
                let year = parseInt(match[1], 10);
                const month = parseInt(match[2], 10);
                const day = parseInt(match[3], 10);

                if (year < 100) year += 2000;

                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    const date = new Date(year, month - 1, day);
                    const now = new Date();
                    now.setDate(now.getDate() + 1);

                    if (date <= now) {
                        result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        break;
                    }
                }
            }
        }
        if (result.date) break;
    }
    if (!result.date) {
        result.date = new Date().toISOString().split('T')[0];
    }

    const amountCandidates = [];

    for (const line of lines) {
        const lineText = line.map(f => f.inferText).join(' ');

        if (/(합계|총액|결제금액|승인금액|받을금액|합\s*계)/i.test(lineText)) {
            const numbers = lineText.match(/([0-9]{1,3}(?:,?[0-9]{3})*)/g);
            if (numbers) {
                const lastNum = parseInt(numbers[numbers.length - 1].replace(/,/g, ''), 10);
                if (lastNum > 0) amountCandidates.push({ val: lastNum, score: 10 });
            }
        }
    }

    if (amountCandidates.length === 0) {
        const allNumbers = fullText.match(/([0-9]{1,3}(?:,?[0-9]{3})+)/g) || [];
        for (const numStr of allNumbers) {
            const num = parseInt(numStr.replace(/,/g, ''), 10);
            if (num > 100 && num < 100000000) {
                if (num > 20000000 && num < 21001231) continue;
                amountCandidates.push({ val: num, score: 1 });
            }
        }
    }

    if (amountCandidates.length > 0) {
        amountCandidates.sort((a, b) => b.score - a.score || b.val - a.val);
        result.amount = amountCandidates[0].val;
    }

    const searchText = `${result.merchant || ''} ${fullText}`.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                result.category = category;
                break;
            }
        }
        if (result.category !== '기타') break;
    }

    return result;
};

// --- Tests ---

const mockStarbucks = [
    { inferText: '스타벅스', boundingPoly: { vertices: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 20 }, { x: 10, y: 20 }] } },
    { inferText: '강남점', boundingPoly: { vertices: [{ x: 60, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 20 }, { x: 60, y: 20 }] } },
    { inferText: '영수증', boundingPoly: { vertices: [{ x: 10, y: 30 }, { x: 50, y: 30 }, { x: 50, y: 40 }, { x: 10, y: 40 }] } },
    { inferText: '2023-11-24', boundingPoly: { vertices: [{ x: 10, y: 50 }, { x: 80, y: 50 }, { x: 80, y: 60 }, { x: 10, y: 60 }] } },
    { inferText: '12:30:00', boundingPoly: { vertices: [{ x: 90, y: 50 }, { x: 120, y: 50 }, { x: 120, y: 60 }, { x: 90, y: 60 }] } },
    { inferText: '아메리카노', boundingPoly: { vertices: [{ x: 10, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 90 }, { x: 10, y: 90 }] } },
    { inferText: '4,500', boundingPoly: { vertices: [{ x: 150, y: 80 }, { x: 200, y: 80 }, { x: 200, y: 90 }, { x: 150, y: 90 }] } },
    { inferText: '합계', boundingPoly: { vertices: [{ x: 10, y: 100 }, { x: 40, y: 100 }, { x: 40, y: 110 }, { x: 10, y: 110 }] } },
    { inferText: '4,500', boundingPoly: { vertices: [{ x: 150, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 110 }, { x: 150, y: 110 }] } },
];

const mockComplex = [
    { inferText: '이마트', boundingPoly: { vertices: [{ x: 50, y: 10 }, { x: 100, y: 10 }, { x: 100, y: 30 }, { x: 50, y: 30 }] } },
    { inferText: '2023년', boundingPoly: { vertices: [{ x: 10, y: 50 }, { x: 40, y: 50 }, { x: 40, y: 60 }, { x: 10, y: 60 }] } },
    { inferText: '11월', boundingPoly: { vertices: [{ x: 50, y: 50 }, { x: 70, y: 50 }, { x: 70, y: 60 }, { x: 50, y: 60 }] } },
    { inferText: '25일', boundingPoly: { vertices: [{ x: 80, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 60 }, { x: 80, y: 60 }] } },
    { inferText: '과자', boundingPoly: { vertices: [{ x: 10, y: 100 }, { x: 40, y: 100 }, { x: 40, y: 110 }, { x: 10, y: 110 }] } },
    { inferText: '1,500', boundingPoly: { vertices: [{ x: 200, y: 100 }, { x: 250, y: 100 }, { x: 250, y: 110 }, { x: 200, y: 110 }] } },
    { inferText: '총', boundingPoly: { vertices: [{ x: 10, y: 200 }, { x: 30, y: 200 }, { x: 30, y: 210 }, { x: 10, y: 210 }] } },
    { inferText: '결제금액', boundingPoly: { vertices: [{ x: 40, y: 200 }, { x: 100, y: 200 }, { x: 100, y: 210 }, { x: 40, y: 210 }] } },
    { inferText: '51,500', boundingPoly: { vertices: [{ x: 250, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 210 }, { x: 250, y: 210 }] } },
];

console.log('--- OCR Parsing Tests ---');

console.log('\n1. Starbucks Receipt:');
const result1 = parseReceiptFromFields(mockStarbucks);
console.log(JSON.stringify(result1, null, 2));

if (result1.merchant === '스타벅스 강남점' && result1.amount === 4500 && result1.date === '2023-11-24') {
    console.log('✅ PASS');
} else {
    console.log('❌ FAIL');
}

console.log('\n2. Complex Receipt (Emart):');
const result2 = parseReceiptFromFields(mockComplex);
console.log(JSON.stringify(result2, null, 2));

if (result2.merchant === '이마트' && result2.amount === 51500 && result2.date === '2023-11-25') {
    console.log('✅ PASS');
} else {
    console.log('❌ FAIL');
}
