import Tesseract from 'tesseract.js';

// 카테고리 키워드 매핑
const CATEGORY_KEYWORDS = {
  '식비': ['카페', '커피', '스타벅스', '이디야', '투썸', '빽다방', '메가커피', '식당', '음식', '치킨', '피자', '햄버거', '맥도날드', 'KFC', '버거킹', '롯데리아', '배달', '요기요', '배민', '쿠팡이츠'],
  '편의점': ['CU', 'GS25', 'GS편의점', '세븐일레븐', '7-ELEVEN', '이마트24', '미니스톱', '편의점'],
  '마트/식료품': ['이마트', '홈플러스', '롯데마트', '코스트코', '트레이더스', '하나로마트', '농협', '마트', '슈퍼'],
  '생활용품': ['다이소', '올리브영', '롭스', '시코르', '드럭스토어', '약국'],
  '교통': ['주유소', 'SK에너지', 'GS칼텍스', 'S-OIL', '현대오일', '주유', '택시', '카카오T', '버스', '지하철', '교통'],
  '문화/여가': ['CGV', '롯데시네마', '메가박스', '영화', '노래방', '볼링', 'PC방', '게임'],
  '도서/교육': ['교보문고', '영풍문고', '알라딘', '예스24', '서점', '학원', '교육'],
  '의료': ['병원', '의원', '클리닉', '약국', '치과', '안과', '피부과', '정형외과'],
  '쇼핑': ['백화점', '롯데백화점', '신세계', '현대백화점', '아울렛', '쇼핑몰'],
};

// 금액 패턴
const AMOUNT_PATTERNS = [
  /총\s*금?액?\s*:?\s*([\d,]+)\s*원?/i,
  /합\s*계\s*:?\s*([\d,]+)\s*원?/i,
  /결제\s*금?액?\s*:?\s*([\d,]+)\s*원?/i,
  /Total\s*:?\s*([\d,]+)/i,
  /금액\s*:?\s*([\d,]+)\s*원?/i,
  /([\d,]+)\s*원/g,
];

// 날짜 패턴
const DATE_PATTERNS = [
  /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/,
  /(\d{2})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/,
  /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
];

// 상호명 추출 패턴
const MERCHANT_PATTERNS = [
  /상\s*호\s*:?\s*(.+)/,
  /가맹점\s*:?\s*(.+)/,
  /매장\s*:?\s*(.+)/,
];

/**
 * OCR로 영수증 이미지에서 텍스트 추출
 */
export const extractTextFromImage = async (imageFile, onProgress) => {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'kor+eng', // 한국어 + 영어
      {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        },
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
      words: result.data.words,
    };
  } catch (error) {
    console.error('OCR 텍스트 추출 실패:', error);
    throw new Error('이미지에서 텍스트를 추출할 수 없습니다.');
  }
};

/**
 * 추출된 텍스트에서 영수증 정보 파싱
 */
export const parseReceiptText = (text) => {
  const result = {
    merchant: null,
    amount: null,
    date: null,
    category: '기타',
    rawText: text,
  };

  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // 1. 상호명 추출
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.merchant = match[1].trim();
      break;
    }
  }

  // 상호명이 없으면 첫 몇 줄에서 추출 시도
  if (!result.merchant && lines.length > 0) {
    // 첫 3줄 중에서 가장 가능성 있는 것 선택
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      // 숫자만 있는 라인이나 너무 짧은 라인 제외
      if (line.length >= 2 && !/^[\d\s\-.:]+$/.test(line)) {
        result.merchant = line.replace(/[^\w가-힣\s]/g, '').trim();
        if (result.merchant.length >= 2) break;
      }
    }
  }

  // 2. 금액 추출 (가장 큰 금액을 총액으로 간주)
  const amounts = [];
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      const amountStr = match[1] || match[0];
      const amount = parseInt(amountStr.replace(/[^\d]/g, ''), 10);
      if (amount > 0 && amount < 100000000) { // 1억 미만만 유효
        amounts.push(amount);
      }
    }
  }

  if (amounts.length > 0) {
    // 가장 큰 금액을 총액으로 (보통 합계가 가장 큼)
    result.amount = Math.max(...amounts);
  }

  // 3. 날짜 추출
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      // 2자리 연도 처리
      if (year < 100) {
        year += 2000;
      }

      // 유효성 검사
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
  const textLower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        result.category = category;
        break;
      }
    }
    if (result.category !== '기타') break;
  }

  // 상호명으로도 카테고리 추론 시도
  if (result.category === '기타' && result.merchant) {
    const merchantLower = result.merchant.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (merchantLower.includes(keyword.toLowerCase())) {
          result.category = category;
          break;
        }
      }
      if (result.category !== '기타') break;
    }
  }

  return result;
};

/**
 * 이미지 파일에서 영수증 정보 추출 (통합 함수)
 */
export const processReceiptImage = async (imageFile, onProgress) => {
  // 1. OCR 텍스트 추출
  const ocrResult = await extractTextFromImage(imageFile, onProgress);

  // 2. 텍스트 파싱
  const parsedData = parseReceiptText(ocrResult.text);

  return {
    ...parsedData,
    confidence: ocrResult.confidence,
    ocrText: ocrResult.text,
  };
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
  extractTextFromImage,
  parseReceiptText,
  processReceiptImage,
  createImagePreview,
  compressImage,
};
