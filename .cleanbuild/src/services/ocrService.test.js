
import { parseReceiptFromFields } from './ocrService.js';

// Mock Data 1: 표준 영수증 (스타벅스)
const mockStarbucks = [
    { inferText: '스타벅스', boundingPoly: { vertices: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 20 }, { x: 10, y: 20 }] } },
    { inferText: '강남점', boundingPoly: { vertices: [{ x: 60, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 20 }, { x: 60, y: 20 }] } }, // 같은 라인
    { inferText: '영수증', boundingPoly: { vertices: [{ x: 10, y: 30 }, { x: 50, y: 30 }, { x: 50, y: 40 }, { x: 10, y: 40 }] } },
    { inferText: '2023-11-24', boundingPoly: { vertices: [{ x: 10, y: 50 }, { x: 80, y: 50 }, { x: 80, y: 60 }, { x: 10, y: 60 }] } },
    { inferText: '12:30:00', boundingPoly: { vertices: [{ x: 90, y: 50 }, { x: 120, y: 50 }, { x: 120, y: 60 }, { x: 90, y: 60 }] } },
    { inferText: '아메리카노', boundingPoly: { vertices: [{ x: 10, y: 80 }, { x: 80, y: 80 }, { x: 80, y: 90 }, { x: 10, y: 90 }] } },
    { inferText: '4,500', boundingPoly: { vertices: [{ x: 150, y: 80 }, { x: 200, y: 80 }, { x: 200, y: 90 }, { x: 150, y: 90 }] } },
    { inferText: '합계', boundingPoly: { vertices: [{ x: 10, y: 100 }, { x: 40, y: 100 }, { x: 40, y: 110 }, { x: 10, y: 110 }] } },
    { inferText: '4,500', boundingPoly: { vertices: [{ x: 150, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 110 }, { x: 150, y: 110 }] } },
];

// Mock Data 2: 2단 레이아웃 (합계와 금액이 멀리 떨어짐)
const mockComplex = [
    { inferText: '이마트', boundingPoly: { vertices: [{ x: 50, y: 10 }, { x: 100, y: 10 }, { x: 100, y: 30 }, { x: 50, y: 30 }] } },
    { inferText: '2023년', boundingPoly: { vertices: [{ x: 10, y: 50 }, { x: 40, y: 50 }, { x: 40, y: 60 }, { x: 10, y: 60 }] } },
    { inferText: '11월', boundingPoly: { vertices: [{ x: 50, y: 50 }, { x: 70, y: 50 }, { x: 70, y: 60 }, { x: 50, y: 60 }] } },
    { inferText: '25일', boundingPoly: { vertices: [{ x: 80, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 60 }, { x: 80, y: 60 }] } },
    // ... 중간 생략 ...
    { inferText: '과자', boundingPoly: { vertices: [{ x: 10, y: 100 }, { x: 40, y: 100 }, { x: 40, y: 110 }, { x: 10, y: 110 }] } },
    { inferText: '1,500', boundingPoly: { vertices: [{ x: 200, y: 100 }, { x: 250, y: 100 }, { x: 250, y: 110 }, { x: 200, y: 110 }] } },
    { inferText: '총', boundingPoly: { vertices: [{ x: 10, y: 200 }, { x: 30, y: 200 }, { x: 30, y: 210 }, { x: 10, y: 210 }] } },
    { inferText: '결제금액', boundingPoly: { vertices: [{ x: 40, y: 200 }, { x: 100, y: 200 }, { x: 100, y: 210 }, { x: 40, y: 210 }] } },
    // 금액이 같은 Y축에 있지만 X축으로 멀리 떨어짐
    { inferText: '51,500', boundingPoly: { vertices: [{ x: 250, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 210 }, { x: 250, y: 210 }] } },
];

async function runTests() {
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
}

runTests();
