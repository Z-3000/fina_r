/**
 * 소상공인/사업자 세금 관련 상수
 *
 * @version 2025
 * @lastUpdated 2025-11-26
 *
 * 【주요 출처】
 * - 노란우산공제: 조세특례제한법 제86조의3 (법률 제20617호, 2024.12.31 개정)
 * - 업종별 부가가치율: 부가가치세법 시행령 제111조 (2021.7.1 시행)
 * - 간이과세 기준: 부가가치세법 시행령 제109조 (2024.7.1 시행)
 * - 신용카드 매출 세액공제: 부가가치세법 제46조 (2024.1.1 시행)
 * - 중소기업 특별세액감면: 조세특례제한법 제7조
 * - 창업중소기업 세액감면: 조세특례제한법 제6조
 * - 성실신고 확인비용: 조세특례제한법 제126조의6
 */

// =============================================
// 공통 메타데이터
// =============================================
export const TAX_CONSTANTS_META = {
  taxYear: 2025,
  lastUpdated: '2025-11-26',
  currency: 'KRW',
  disclaimer: '본 계산은 추정치이며, 실제 세금 신고 시 국세청 홈택스 또는 세무 전문가와 확인하세요.',
  source: '국세청, 기획재정부, 국가법령정보센터',
};

// =============================================
// 노란우산공제 (2025년 기준)
// 출처: 조세특례제한법 제86조의3
// =============================================
export const YELLOW_UMBRELLA_DEDUCTION = {
  meta: {
    name: '노란우산공제',
    legalBasis: '조세특례제한법 제86조의3',
    effectiveFrom: '2025-01-01',
    effectiveTo: null,  // 종료일 미정
  },

  // 소득구간별 공제한도 (2025년 개정)
  deductionLimits: [
    { maxIncome: 40000000, limit: 6000000, description: '4천만원 이하' },
    { maxIncome: 100000000, limit: 4000000, description: '4천만원 초과~1억원 이하' },
    { maxIncome: Infinity, limit: 2000000, description: '1억원 초과' },
  ],

  // 납입 한도
  contribution: {
    monthlyMin: 50000,      // 월 최소 5만원
    monthlyMax: 1000000,    // 월 최대 100만원
    monthlyOptions: [50000, 100000, 200000, 300000, 500000, 700000, 1000000],  // 선택 가능 금액
    annualMax: 12000000,    // 연 최대 1,200만원
  },

  // 가입 대상
  eligibility: {
    // 개인사업자: 소기업·소상공인
    individualBusiness: true,
    // 법인대표자: 총급여 기준
    corporateCeo: {
      eligible: true,
      maxSalary: 80000000,  // 8천만원 이하만 가능 (2025년 개정)
    },
    // 프리랜서/자유직업소득자
    freelancer: true,
    // 근로소득자: 불가
    employee: false,
  },

  // 해지 시 과세 (기타소득)
  earlyTermination: {
    taxable: true,
    taxType: '기타소득',
    note: '임의해지 시 소득공제받은 금액에 대해 기타소득세 부과',
  },

  // 공제 유형
  deductionType: '소득공제',  // 세액공제가 아닌 소득공제
};

// =============================================
// 업종별 부가가치율 (간이과세자)
// 출처: 부가가치세법 시행령 제111조 별표
// =============================================
export const INDUSTRY_VALUE_ADDED_RATES = {
  meta: {
    name: '업종별 부가가치율',
    legalBasis: '부가가치세법 시행령 제111조',
    effectiveFrom: '2021-07-01',
    effectiveTo: null,
    note: '간이과세자 부가세 = 매출 × 부가가치율 × 10%',
  },

  // 업종 코드 → 부가가치율 맵 (시행령 별표 기준)
  rates: {
    // ===== 15% 업종 =====
    retail: {
      code: 'G',
      rate: 0.15,
      name: '소매업',
      vatRate: 0.015,  // 실효세율 1.5%
      description: '도소매업 중 소매업',
    },
    restaurant: {
      code: 'I56',
      rate: 0.15,
      name: '음식점업',
      vatRate: 0.015,
      description: '일반음식점, 휴게음식점, 제과점 등',
    },
    recycling: {
      code: 'E38',
      rate: 0.15,
      name: '재생용 재료수집 및 판매업',
      vatRate: 0.015,
      description: '고물상, 재활용품 수집판매',
    },

    // ===== 20% 업종 =====
    manufacturing: {
      code: 'C',
      rate: 0.20,
      name: '제조업',
      vatRate: 0.02,
      description: '식품, 의류, 가구 등 제조',
    },
    agriculture: {
      code: 'A',
      rate: 0.20,
      name: '농업·임업 및 어업',
      vatRate: 0.02,
      description: '작물재배, 축산, 임업, 어업',
    },
    parcelDelivery: {
      code: 'H494',
      rate: 0.20,
      name: '소화물 전문 운송업',
      vatRate: 0.02,
      description: '택배, 퀵서비스 등',
    },

    // ===== 25% 업종 =====
    accommodation: {
      code: 'I55',
      rate: 0.25,
      name: '숙박업',
      vatRate: 0.025,
      description: '호텔, 모텔, 펜션, 게스트하우스 등',
    },

    // ===== 30% 업종 =====
    construction: {
      code: 'F',
      rate: 0.30,
      name: '건설업',
      vatRate: 0.03,
      description: '종합건설, 전문건설 등',
    },
    transport: {
      code: 'H',
      rate: 0.30,
      name: '운수 및 창고업',
      vatRate: 0.03,
      description: '여객운송, 화물운송 (소화물 전문 제외)',
    },
    ict: {
      code: 'J',
      rate: 0.30,
      name: '정보통신업',
      vatRate: 0.03,
      description: '출판, 영상, 방송, 통신, IT서비스',
    },
    otherServices: {
      code: 'S',
      rate: 0.30,
      name: '기타 서비스업',
      vatRate: 0.03,
      description: '수리업, 미용업, 세탁업 등',
    },
    education: {
      code: 'P',
      rate: 0.30,
      name: '교육 서비스업',
      vatRate: 0.03,
      description: '학원, 교습소 등 (면세 제외)',
    },

    // ===== 40% 업종 =====
    finance: {
      code: 'K',
      rate: 0.40,
      name: '금융 및 보험 관련 서비스업',
      vatRate: 0.04,
      description: '보험대리, 금융중개 등',
    },
    professional: {
      code: 'M',
      rate: 0.40,
      name: '전문·과학 및 기술서비스업',
      vatRate: 0.04,
      description: '법무, 회계, 디자인, 광고 등',
    },
    businessSupport: {
      code: 'N',
      rate: 0.40,
      name: '사업시설관리 및 사업지원서비스업',
      vatRate: 0.04,
      description: '인력공급, 경비, 청소 등',
    },
    realEstateRental: {
      code: 'L68',
      rate: 0.40,
      name: '부동산임대업',
      vatRate: 0.04,
      description: '상가, 사무실, 주택 임대',
      specialThreshold: 48000000,  // 4,800만원 미만만 간이과세
    },
    realEstateService: {
      code: 'L68S',
      rate: 0.40,
      name: '부동산 관련 서비스업',
      vatRate: 0.04,
      description: '부동산중개, 감정평가 등',
    },
  },

  // UI 드롭다운용 정렬 리스트 (부가가치율 낮은 순 → 높은 순)
  list: [
    // 15% 업종
    { code: 'restaurant', name: '음식점업', rate: 0.15, vatRate: 0.015 },
    { code: 'retail', name: '소매업', rate: 0.15, vatRate: 0.015 },
    { code: 'recycling', name: '재생용 재료수집 및 판매업', rate: 0.15, vatRate: 0.015 },
    // 20% 업종
    { code: 'manufacturing', name: '제조업', rate: 0.20, vatRate: 0.02 },
    { code: 'agriculture', name: '농업·임업·어업', rate: 0.20, vatRate: 0.02 },
    { code: 'parcelDelivery', name: '소화물 전문 운송업 (택배)', rate: 0.20, vatRate: 0.02 },
    // 25% 업종
    { code: 'accommodation', name: '숙박업', rate: 0.25, vatRate: 0.025 },
    // 30% 업종
    { code: 'construction', name: '건설업', rate: 0.30, vatRate: 0.03 },
    { code: 'transport', name: '운수·창고업', rate: 0.30, vatRate: 0.03 },
    { code: 'ict', name: '정보통신업', rate: 0.30, vatRate: 0.03 },
    { code: 'otherServices', name: '기타 서비스업', rate: 0.30, vatRate: 0.03 },
    { code: 'education', name: '교육 서비스업', rate: 0.30, vatRate: 0.03 },
    // 40% 업종
    { code: 'finance', name: '금융·보험 관련 서비스업', rate: 0.40, vatRate: 0.04 },
    { code: 'professional', name: '전문·기술서비스업', rate: 0.40, vatRate: 0.04 },
    { code: 'businessSupport', name: '사업시설관리·지원서비스업', rate: 0.40, vatRate: 0.04 },
    { code: 'realEstateRental', name: '부동산임대업', rate: 0.40, vatRate: 0.04 },
    { code: 'realEstateService', name: '부동산 관련 서비스업', rate: 0.40, vatRate: 0.04 },
  ],
};

// =============================================
// 간이과세 기준
// 출처: 부가가치세법 시행령 제109조
// =============================================
export const SIMPLIFIED_TAX_CRITERIA = {
  meta: {
    name: '간이과세 기준',
    legalBasis: '부가가치세법 시행령 제109조',
    effectiveFrom: '2024-07-01',
    effectiveTo: null,
  },

  // 간이과세 적용 기준
  threshold: {
    general: 104000000,           // 일반: 1억 400만원 미만
    realEstateRental: 48000000,   // 부동산임대업: 4,800만원 미만
    entertainmentVenue: 48000000, // 과세유흥장소: 4,800만원 미만
  },

  // 부가세 납부 면제 기준
  vatExemptThreshold: 48000000,  // 4,800만원 미만

  // 납부세액 경감
  relief: {
    rate: 0.50,           // 50% 경감
    cap: 1000000,         // 최대 100만원
    description: '간이과세자 납부세액 50% 경감 (한도 100만원)',
  },

  // 매입세액 공제율
  inputTaxCreditRate: 0.50,  // 매입세액의 50%만 공제

  // 간이과세 배제 업종
  excludedIndustries: [
    '광업',
    '과세유흥장소 (일부)',
    '전문직 (변호사, 세무사, 공인회계사 등)',
  ],
};

// =============================================
// 신용카드 매출 세액공제
// 출처: 부가가치세법 제46조
//
// 【사용 가이드】
// - 계산 로직: `rates`, `annualLimit` 사용 (meta.effectiveTo까지 유효)
// - scheduledChanges: status === 'scheduled'인 경우 계산에 적용하지 말 것
//   → UI에서 "2027년부터 공제율 축소 예정" 등 경고/툴팁으로만 노출
//   → status가 'enacted'로 변경되면 해당 시점에 rates 교체 필요
// =============================================
export const CARD_SALES_TAX_CREDIT = {
  meta: {
    name: '신용카드 매출전표 발행 세액공제',
    legalBasis: '부가가치세법 제46조',
    effectiveFrom: '2024-01-01',
    effectiveTo: '2026-12-31',
    note: '개인사업자만 적용, 법인사업자 제외. 기본 1%→2026년까지 1.3% 한시 상향',
  },

  // 현행 공제율 (2024~2026) - 현재 적용 기준
  rates: [
    { maxSales: 500000000, rate: 0.013, description: '5억원 이하: 1.3%' },
    { maxSales: 1000000000, rate: 0.0065, description: '5억원 초과~10억원: 0.65%' },
    { maxSales: Infinity, rate: 0, description: '10억원 초과: 공제 불가' },
  ],

  // 연간 공제 한도 (현행)
  annualLimit: 10000000,  // 1,000만원

  // ⚠️ 2027년 이후 예정 변경사항 (참고용, 현재 미적용)
  // 해당 시점에 별도 상수 파일 또는 연도별 분기 처리 예정
  scheduledChanges: {
    effectiveFrom: '2027-01-01',
    status: 'scheduled',  // 'scheduled' | 'confirmed' | 'enacted'
    rates: [
      { maxSales: 500000000, rate: 0.01, description: '5억원 이하: 1.0%' },
      { maxSales: 1000000000, rate: 0.005, description: '5억원 초과~10억원: 0.5%' },
      { maxSales: Infinity, rate: 0, description: '10억원 초과: 공제 불가' },
    ],
    annualLimit: 5000000,  // 500만원
    note: '2027년 시행 예정, 법률 개정 확정 시 업데이트 필요',
  },

  // 적용 대상
  eligibility: {
    individual: true,      // 개인사업자: 가능
    corporate: false,      // 법인사업자: 불가
    simplified: true,      // 간이과세자: 가능
    general: true,         // 일반과세자: 영수증교부대상 업종만
  },

  // 공제 대상 결제수단
  eligiblePaymentMethods: [
    '신용카드',
    '체크카드',
    '현금영수증',
    '간편결제 (PG등록업체)',
  ],

  // 배제 업종 (세금계산서 필수 발급 업종)
  excludedIndustries: [
    '제조업 (B2B)',
    '도매업 (B2B)',
    '부동산매매업',
  ],
};

// =============================================
// 중소기업 특별세액감면
// 출처: 조세특례제한법 제7조
// =============================================
export const SME_SPECIAL_TAX_REDUCTION = {
  meta: {
    name: '중소기업 특별세액감면',
    legalBasis: '조세특례제한법 제7조',
    effectiveFrom: '2023-01-01',
    effectiveTo: '2025-12-31',
    note: '신고 시 별도 신청 필요 (자동 적용 안됨)',
  },

  // 감면율 테이블
  rates: {
    // 소기업 (중소기업기본법 시행령 별표3 기준)
    small: {
      metropolitan: {  // 수도권
        manufacturing: 0.20,    // 제조업 등: 20%
        knowledgeBased: 0.20,   // 지식기반산업: 20%
        wholesale: 0.10,        // 도소매업: 10%
        other: 0.10,            // 기타: 10%
      },
      nonMetropolitan: {  // 비수도권
        all: 0.30,  // 모든 업종: 30%
      },
    },
    // 중기업
    medium: {
      metropolitan: {
        knowledgeBased: 0.10,   // 지식기반산업: 10%
        other: 0.00,            // 기타: 0%
      },
      nonMetropolitan: {
        manufacturing: 0.15,    // 제조업 등: 15%
        wholesale: 0.05,        // 도소매업: 5%
        other: 0.15,            // 기타: 15%
      },
    },
  },

  // 추가 감면 (110% 적용 조건)
  longTermBonus: {
    multiplier: 1.10,
    conditions: [
      '10년 이상 계속 경영',
      '종합소득금액 1억원 이하',
      '성실사업자 요건 충족',
    ],
  },

  // 감면 한도
  annualLimit: 100000000,  // 연 1억원

  // 상시근로자 감소 시 한도 차감
  workerReductionPenalty: 5000000,  // 1인당 500만원

  // 소기업 기준 (업종별 매출액)
  smallBusinessCriteria: {
    manufacturing: 12000000000,   // 제조업: 120억원
    construction: 8000000000,     // 건설업: 80억원
    transport: 8000000000,        // 운수업: 80억원
    wholesale: 5000000000,        // 도소매업: 50억원
    services: 3000000000,         // 서비스업: 30억원
  },

  // 감면 대상 업종 (주요)
  eligibleIndustries: [
    '제조업', '광업', '건설업', '도소매업', '음식점업',
    '출판업', '영상제작업', '방송업', '전기통신업',
    '컴퓨터 프로그래밍', '정보서비스업', '연구개발업',
    '광고업', '전문디자인업', '창작 및 예술 서비스업',
    '엔지니어링사업', '물류산업', '학원업', '직업기술훈련업',
    '관광숙박업', '여객운송업',
  ],

  // 감면 배제 (수도권 과밀억제권역 내)
  metropolitanExclusions: [
    '신설 사업장',
    '증설 사업장 (일부)',
  ],
};

// =============================================
// 창업중소기업 세액감면
// 출처: 조세특례제한법 제6조
// =============================================
export const STARTUP_TAX_REDUCTION = {
  meta: {
    name: '창업중소기업 세액감면',
    legalBasis: '조세특례제한법 제6조',
    effectiveFrom: '2018-05-29',
    effectiveTo: '2027-12-31',  // 창업 기한
    note: '최초 소득발생 연도부터 5년간 적용',
  },

  // 감면 기간
  duration: 5,  // 5년

  // 감면 한도 (2025년 귀속분부터)
  annualLimit: 500000000,  // 연 5억원

  // 2025.12.31 이전 창업 시 감면율
  rates2025: {
    youth: {  // 청년창업 (만 15~34세)
      nonMetropolitan: 1.00,        // 비수도권: 100%
      populationDecline: 1.00,      // 인구감소지역: 100%
      metropolitanCrowded: 0.50,    // 수도권 과밀억제권역: 50%
    },
    general: {  // 일반창업
      nonMetropolitan: 0.50,        // 비수도권: 50%
      populationDecline: 0.50,      // 인구감소지역: 50%
      metropolitanCrowded: 0.00,    // 수도권 과밀억제권역: 0%
    },
  },

  // 2026.1.1 이후 창업 시 감면율 (개정)
  rates2026: {
    youth: {
      nonMetropolitan: 1.00,
      populationDecline: 1.00,
      metropolitanNonCrowded: 0.75,  // 수도권 비과밀: 75%
      metropolitanCrowded: 0.50,
    },
    general: {
      nonMetropolitan: 0.50,
      populationDecline: 0.50,
      metropolitanNonCrowded: 0.25,  // 수도권 비과밀: 25%
      metropolitanCrowded: 0.00,
    },
  },

  // 청년 기준
  youthCriteria: {
    minAge: 15,
    maxAge: 34,
    militaryServiceDeduction: true,  // 병역기간 차감 (최대 6년)
    note: '창업 당시 나이 기준, 법인은 최대주주 등이어야 함',
  },

  // 대상 업종 (주요)
  eligibleIndustries: [
    '제조업', '건설업', '음식점업', '출판업',
    '영상·오디오 기록물 제작업', '방송업',
    '전기통신업', '컴퓨터 프로그래밍·시스템 통합 및 관리업',
    '정보서비스업', '연구개발업', '광고업',
    '전문디자인업', '창작 및 예술 관련 서비스업',
    '엔지니어링사업', '전시·컨벤션업', '물류산업',
    '학원업', '직업기술 분야 훈련업', '관광숙박업',
    '국제회의업', '유원시설업', '관광객이용시설업',
    '노인복지시설운영업', '전자상거래업',
    '보안시스템서비스업', '콜센터서비스업',
  ],

  // 배제 업종
  excludedIndustries: [
    '소매업 (일반)', '부동산업', '유흥주점업',
    '사행행위업', '소비성 서비스업',
  ],
};

// =============================================
// 성실신고 확인비용 세액공제
// 출처: 조세특례제한법 제126조의6
// =============================================
export const SINCERE_FILING_COST_CREDIT = {
  meta: {
    name: '성실신고 확인비용 세액공제',
    legalBasis: '조세특례제한법 제126조의6',
    effectiveFrom: '2019-01-01',
    effectiveTo: null,
    note: '성실신고확인대상 사업자만 해당',
  },

  // 공제율 및 한도
  rate: 0.60,           // 60%
  limit: 1200000,       // 120만원

  // 성실신고확인 대상 기준 (업종별 수입금액)
  thresholds: {
    agriculture: 1500000000,        // 농업·임업·어업, 광업, 도소매업: 15억원
    manufacturing: 750000000,       // 제조업, 숙박·음식점업, 건설업, 운수·창고업: 7.5억원
    services: 500000000,            // 부동산임대업, 전문서비스업, 기타 서비스업: 5억원
  },

  // 가산공제 (전자신고 등)
  additionalCredit: {
    electronicFiling: false,  // 별도 가산 없음
  },
};

// =============================================
// 지역 구분
// =============================================
export const REGION_TYPES = {
  METROPOLITAN_CROWDED: 'metropolitan_crowded',       // 수도권 과밀억제권역
  METROPOLITAN_NON_CROWDED: 'metropolitan_non_crowded', // 수도권 비과밀
  NON_METROPOLITAN: 'non_metropolitan',               // 비수도권
  POPULATION_DECLINE: 'population_decline',           // 인구감소지역
};

// 지역 선택 드롭다운용
export const REGION_LIST = [
  { code: 'seoul', name: '서울', type: REGION_TYPES.METROPOLITAN_CROWDED },
  { code: 'incheon', name: '인천 (일반)', type: REGION_TYPES.METROPOLITAN_CROWDED },
  { code: 'gyeonggi_crowded', name: '경기 (수원·성남·고양·안양 등)', type: REGION_TYPES.METROPOLITAN_CROWDED },
  { code: 'gyeonggi_other', name: '경기 (용인·화성·파주 등)', type: REGION_TYPES.METROPOLITAN_NON_CROWDED },
  { code: 'incheon_fez', name: '인천 경제자유구역 (송도·청라)', type: REGION_TYPES.METROPOLITAN_NON_CROWDED },  // 과밀억제권역 제외, 청년 75%/일반 25%
  { code: 'incheon_namdong', name: '인천 남동국가산업단지', type: REGION_TYPES.METROPOLITAN_NON_CROWDED },  // 과밀억제권역 제외
  { code: 'gyeonggi_decline', name: '경기 인구감소지역 (가평·연천)', type: REGION_TYPES.POPULATION_DECLINE },
  { code: 'incheon_decline', name: '인천 인구감소지역 (강화·옹진)', type: REGION_TYPES.POPULATION_DECLINE },
  { code: 'busan', name: '부산', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'daegu', name: '대구', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'gwangju', name: '광주', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'daejeon', name: '대전', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'ulsan', name: '울산', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'sejong', name: '세종', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'gangwon', name: '강원', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'chungbuk', name: '충북', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'chungnam', name: '충남', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'jeonbuk', name: '전북', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'jeonnam', name: '전남', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'gyeongbuk', name: '경북', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'gyeongnam', name: '경남', type: REGION_TYPES.NON_METROPOLITAN },
  { code: 'jeju', name: '제주', type: REGION_TYPES.NON_METROPOLITAN },
];

// =============================================
// 사업자 체크리스트 (UI용)
// =============================================
export const BUSINESS_DEDUCTION_CHECKLIST = [
  {
    id: 'yellowUmbrella',
    title: '노란우산공제',
    description: '소기업·소상공인 퇴직금 마련 + 소득공제',
    maxDeduction: 6000000,
    deductionType: '소득공제',
    priority: 1,
  },
  {
    id: 'cardSalesCredit',
    title: '신용카드 매출 세액공제',
    description: '신용카드·현금영수증 매출액의 1.3%',
    maxDeduction: 10000000,
    deductionType: '세액공제',
    priority: 2,
  },
  {
    id: 'simplifiedRelief',
    title: '간이과세 납부세액 경감',
    description: '간이과세자 납부세액 50% 경감 (한도 100만원)',
    maxDeduction: 1000000,
    deductionType: '세액경감',
    priority: 3,
  },
  {
    id: 'smeReduction',
    title: '중소기업 특별세액감면',
    description: '소기업 최대 30%, 중기업 최대 15% 감면',
    maxDeduction: 100000000,
    deductionType: '세액감면',
    priority: 4,
  },
  {
    id: 'startupReduction',
    title: '창업중소기업 세액감면',
    description: '청년창업 비수도권 100%, 5년간',
    maxDeduction: null,  // 전액 감면 가능
    deductionType: '세액감면',
    priority: 5,
  },
  {
    id: 'sincereFilingCredit',
    title: '성실신고 확인비용 공제',
    description: '확인비용의 60%, 한도 120만원',
    maxDeduction: 1200000,
    deductionType: '세액공제',
    priority: 6,
  },
];

// =============================================
// 사업자 계산기 기본값 및 UI 범위
// =============================================
export const BIZ_CALC_DEFAULTS = {
  // 기본값 (초기 상태)
  defaults: {
    annualSales: 80000000,           // 연매출 8천만원
    annualPurchases: 20000000,       // 연매입 2천만원
    cardSalesRatio: 80,              // 카드매출 비율 80%
    industryCode: 'restaurant',      // 기본 업종: 음식점
    isSimplified: true,              // 기본: 간이과세자
    yellowUmbrellaContribution: 0,   // 노란우산공제: 0원
  },

  // 슬라이더 범위 - 연매출
  annualSales: {
    min: 10000000,      // 1천만원
    max: 200000000,     // 2억원
    step: 5000000,      // 5백만원 단위
    format: (v) => `${(v / 100000000).toFixed(1)}억원`,
  },

  // 슬라이더 범위 - 연매입
  annualPurchases: {
    min: 0,
    max: 100000000,     // 1억원
    step: 1000000,      // 1백만원 단위
    format: (v) => `${(v / 10000).toLocaleString()}만원`,
  },

  // 슬라이더 범위 - 카드매출 비율
  cardSalesRatio: {
    min: 0,
    max: 100,
    step: 5,
    format: (v) => `${v}%`,
  },

  // 슬라이더 범위 - 노란우산공제
  yellowUmbrellaContribution: {
    min: 0,
    max: 12000000,      // 월 100만원 × 12개월
    step: 100000,       // 10만원 단위
    format: (v) => `${(v / 10000).toLocaleString()}만원`,
    monthly: {
      min: 50000,       // 월 최소 5만원
      max: 1000000,     // 월 최대 100만원
    },
  },

  // 참고 안내 문구
  tooltips: {
    annualSales: '연간 총 매출액 (부가세 포함)',
    annualPurchases: '연간 총 매입액 (재료비, 임대료 등)',
    cardSalesRatio: '전체 매출 중 카드/현금영수증 비율',
    yellowUmbrella: '소상공인 퇴직금 마련 + 소득공제 혜택',
    isSimplified: '연매출 1억 400만원 미만 시 선택 가능',
  },
};

export default {
  TAX_CONSTANTS_META,
  YELLOW_UMBRELLA_DEDUCTION,
  INDUSTRY_VALUE_ADDED_RATES,
  SIMPLIFIED_TAX_CRITERIA,
  CARD_SALES_TAX_CREDIT,
  SME_SPECIAL_TAX_REDUCTION,
  STARTUP_TAX_REDUCTION,
  SINCERE_FILING_COST_CREDIT,
  REGION_TYPES,
  REGION_LIST,
  BUSINESS_DEDUCTION_CHECKLIST,
  BIZ_CALC_DEFAULTS,
};
