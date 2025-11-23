/**
 * Tesseract.js OCR 서비스
 * - 로컬에서 동작 (API 키 불필요)
 * - 한국어 + 영어 인식
 */

import Tesseract from 'tesseract.js';

// 카테고리 키워드 매핑
const CATEGORY_KEYWORDS = {
  '식비': ['카페', '커피', '스타벅스', '이디야', '투썸', '빽다방', '메가커피', '식당', '음식', '치킨', '피자', '햄버거', '맥도날드', 'KFC', '버거킹', '롯데리아', '배달', '요기요', '배민', '쿠팡이츠', '반찬', '김밥', '떡볶이', '분식', '밥', '국', '찌개', '고기', '삼겹살', '족발', '보쌈'],
  '편의점': ['CU', 'GS25', 'GS편의점', '세븐일레븐', '7-ELEVEN', '이마트24', '미니스톱', '편의점'],
  '마트/식료품': ['이마트', '홈플러스', '롯데마트', '코스트코', '트레이더스', '하나로마트', '농협', '마트', '슈퍼', '식자재'],
  '생활용품': ['다이소', '올리브영', '롭스', '시코르', '드럭스토어', '약국'],
  '교통': ['주유소', 'SK에너지', 'GS칼텍스', 'S-OIL', '현대오일', '주유', '택시', '카카오T', '버스', '지하철', '교통', '톨게이트', '하이패스', '주차'],
  '문화/여가': ['CGV', '롯데시네마', '메가박스', '영화', '노래방', '볼링', 'PC방', '게임', '넷플릭스'],
  '도서/교육': ['교보문고', '영풍문고', '알라딘', '예스24', '서점', '학원', '교육'],
  '의료': ['병원', '의원', '클리닉', '약국', '치과', '안과', '피부과', '정형외과', '내과', '소아과'],
  '쇼핑': ['백화점', '롯데백화점', '신세계', '현대백화점', '아울렛', '쇼핑몰', '무신사', '쿠팡'],
};

/**
 * Tesseract.js로 이미지에서 텍스트 추출
 */
export const recognizeText = async (imageFile, onProgress) => {
  try {
    onProgress?.(10);

    const result = await Tesseract.recognize(
      imageFile,
      'kor+eng', // 한국어 + 영어
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(10 + m.progress * 80);
            onProgress?.(progress);
          }
        },
      }
    );

    onProgress?.(100);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words || [],
      lines: result.data.lines || [],
    };
  } catch (error) {
    console.error('Tesseract OCR 오류:', error);
    throw new Error('텍스트 인식에 실패했습니다. 다시 시도해주세요.');
  }
};

/**
 * OCR 결과에서 영수증 정보 파싱
 */
export const parseReceiptFromText = (ocrResult) => {
  const result = {
    merchant: null,
    amount: null,
    date: null,
    category: '기타',
    items: [],
    rawText: ocrResult.text || '',
    confidence: ocrResult.confidence || 0,
  };

  const text = ocrResult.text || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. 상호명 추출 (첫 몇 줄에서 찾기)
  for (const line of lines.slice(0, 5)) {
    // 숫자만 있는 줄 제외
    if (!/^[\d\s\-.:,]+$/.test(line) && line.length >= 2 && line.length <= 30) {
      // 영수증, 카드전표 등 제외
      if (!/(영수증|카드전표|거래명세|합계|총액|부가세|현금|카드)/i.test(line)) {
        result.merchant = line;
        break;
      }
    }
  }

  // 2. 금액 추출 (가장 큰 금액 = 총액으로 추정)
  const amounts = [];
  const amountPatterns = [
    /합\s*계\s*[:\s]*([0-9,]+)/i,
    /총\s*(금액|액)\s*[:\s]*([0-9,]+)/i,
    /결제\s*(금액)?\s*[:\s]*([0-9,]+)/i,
    /([0-9]{1,3}(?:,?[0-9]{3})+)\s*원?/g,
  ];

  // 합계/총액 패턴 먼저 시도
  for (const pattern of amountPatterns.slice(0, 3)) {
    const match = text.match(pattern);
    if (match) {
      const numStr = (match[2] || match[1]).replace(/,/g, '');
      const num = parseInt(numStr, 10);
      if (num >= 100 && num < 100000000) {
        result.amount = num;
        break;
      }
    }
  }

  // 합계 패턴 없으면 모든 금액에서 최대값
  if (!result.amount) {
    const allMatches = text.match(/([0-9]{1,3}(?:,?[0-9]{3})+)/g) || [];
    for (const m of allMatches) {
      const num = parseInt(m.replace(/,/g, ''), 10);
      if (num >= 100 && num < 100000000) {
        amounts.push(num);
      }
    }
    if (amounts.length > 0) {
      result.amount = Math.max(...amounts);
    }
  }

  // 3. 날짜 추출
  const datePatterns = [
    /(\d{4})[.\-\/년]\s*(\d{1,2})[.\-\/월]\s*(\d{1,2})/,
    /(\d{2})[.\-\/]\s*(\d{1,2})[.\-\/]\s*(\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      // 2자리 연도 처리
      if (year < 100) {
        year = 2000 + year;
      }

      if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        break;
      }
    }
  }

  // 날짜가 없으면 오늘 날짜
  if (!result.date) {
    result.date = new Date().toISOString().split('T')[0];
  }

  // 4. 카테고리 추론
  const searchText = `${result.merchant || ''} ${result.rawText}`.toLowerCase();
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

/**
 * 이미지 파일에서 영수증 정보 추출 (통합 함수)
 */
export const processReceiptImage = async (imageFile, onProgress) => {
  try {
    // Tesseract OCR 호출
    const ocrResult = await recognizeText(imageFile, onProgress);

    // 결과 파싱
    const parsedData = parseReceiptFromText(ocrResult);

    return {
      ...parsedData,
      ocrResult, // 디버깅용 원본 결과
    };
  } catch (error) {
    console.error('영수증 처리 실패:', error);
    throw new Error('영수증 인식에 실패했습니다. 다시 시도해주세요.');
  }
};

/**
 * 이미지 미리보기 URL 생성
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 이미지 압축 (큰 이미지 처리용)
 */
export const compressImage = async (file, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default {
  recognizeText,
  parseReceiptFromText,
  processReceiptImage,
  createImagePreview,
  compressImage,
};
