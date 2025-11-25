/**
 * 한국 세금 계산기 서비스
 * - 개인: 근로소득세, 연말정산
 * - 사업자: 종합소득세, 부가가치세
 */

// =============================================
// 2024년 기준 소득세율표 (과세표준)
// =============================================
const INCOME_TAX_BRACKETS = [
  { min: 0, max: 14000000, rate: 0.06, deduction: 0 },
  { min: 14000000, max: 50000000, rate: 0.15, deduction: 1260000 },
  { min: 50000000, max: 88000000, rate: 0.24, deduction: 5760000 },
  { min: 88000000, max: 150000000, rate: 0.35, deduction: 15440000 },
  { min: 150000000, max: 300000000, rate: 0.38, deduction: 19940000 },
  { min: 300000000, max: 500000000, rate: 0.40, deduction: 25940000 },
  { min: 500000000, max: 1000000000, rate: 0.42, deduction: 35940000 },
  { min: 1000000000, max: Infinity, rate: 0.45, deduction: 65940000 },
];

// 근로소득공제율
const EARNED_INCOME_DEDUCTION_BRACKETS = [
  { min: 0, max: 5000000, rate: 0.70, maxDeduction: Infinity },
  { min: 5000000, max: 15000000, rate: 0.40, base: 3500000 },
  { min: 15000000, max: 45000000, rate: 0.15, base: 7500000 },
  { min: 45000000, max: 100000000, rate: 0.05, base: 12000000 },
  { min: 100000000, max: Infinity, rate: 0.02, base: 14750000 },
];

// 기본공제
const BASIC_DEDUCTIONS = {
  personal: 1500000, // 본인 기본공제
  spouse: 1500000, // 배우자 공제
  dependent: 1500000, // 부양가족 1인당
};

// 특별공제 한도
const SPECIAL_DEDUCTION_LIMITS = {
  insurance: {
    health: 1000000, // 건강보험료
    employment: Infinity, // 고용보험료 전액
    pension: Infinity, // 국민연금 전액
  },
  medical: {
    threshold: 0.03, // 총급여의 3% 초과분
    rate: 0.15, // 15% 공제
    maxRate: 0.20, // 난임시술비 20%
    limit: 7000000, // 연 700만원 한도
  },
  education: {
    preschool: 3000000, // 유아: 300만원
    elementary: 3000000, // 초중고: 300만원
    highschool: 3000000,
    university: 9000000, // 대학: 900만원
    self: Infinity, // 본인: 한도 없음
  },
  housing: {
    rent: 7500000, // 월세 750만원 한도
    mortgage: {
      under15y: 3000000,
      under30y: 18000000,
      over30y: 5000000,
    },
  },
  donation: {
    legal: 1.0, // 법정기부금 100%
    political: 0.15, // 정치자금 15%
    religious: 0.10, // 종교단체 10%
    designated: 0.30, // 지정기부금 30%
  },
  pension: {
    personal: 4000000, // 연금저축 400만원
    irp: 7000000, // IRP 포함 700만원
  },
};

// 부가가치세율
const VAT_RATE = 0.10;

// 간이과세 기준
const SIMPLIFIED_TAX_THRESHOLD = 80000000; // 8천만원
const SIMPLIFIED_VAT_RELIEF_RATE = 0.5; // 간이과세 납부세액 50% 경감
const SIMPLIFIED_VAT_RELIEF_CAP = 1000000; // 경감 한도 100만원
const DONATION_TIER_THRESHOLD = 20000000; // 2천만원까지 15%, 초과 30%

// 자녀 세액공제 (2024년 기준)
const CHILD_TAX_CREDIT_FIRST_SECOND = 150000; // 1~2번째 자녀
const CHILD_TAX_CREDIT_THIRD_OR_MORE = 300000; // 3번째부터

/**
 * 근로소득공제 계산
 */
export const calculateEarnedIncomeDeduction = (totalIncome) => {
  let deduction = 0;

  for (const bracket of EARNED_INCOME_DEDUCTION_BRACKETS) {
    if (totalIncome <= bracket.min) continue;

    if (bracket.base !== undefined) {
      const taxableInRange = Math.min(totalIncome, bracket.max) - bracket.min;
      deduction = bracket.base + taxableInRange * bracket.rate;
    } else {
      deduction = Math.min(totalIncome, bracket.max) * bracket.rate;
    }

    if (totalIncome <= bracket.max) break;
  }

  // 근로소득공제 한도: 2천만원
  return Math.min(deduction, 20000000);
};

/**
 * 소득세 계산 (과세표준 기준)
 */
export const calculateIncomeTax = (taxableIncome) => {
  if (taxableIncome <= 0) return 0;

  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
      return Math.floor(taxableIncome * bracket.rate - bracket.deduction);
    }
  }

  // 최고구간
  const lastBracket = INCOME_TAX_BRACKETS[INCOME_TAX_BRACKETS.length - 1];
  return Math.floor(taxableIncome * lastBracket.rate - lastBracket.deduction);
};

/**
 * 지방소득세 계산 (소득세의 10%)
 */
export const calculateLocalIncomeTax = (incomeTax) => {
  return Math.floor(incomeTax * 0.10);
};

/**
 * 의료비 공제 계산
 */
export const calculateMedicalDeduction = (
  totalIncome,
  medicalExpenses,
  hasInfertility = false,
  infertilityExpenses = 0,
) => {
  const safeIncome = Math.max(0, totalIncome || 0);
  const threshold = safeIncome * SPECIAL_DEDUCTION_LIMITS.medical.threshold;
  const totalMedical = Math.max(0, medicalExpenses || 0);
  const infertilityAmount = Math.max(0, infertilityExpenses || 0);

  // 한도 산정 시 난임 시술비는 별도 20% 공제, 일반 의료비는 15% + 7백만원 한도
  const deductibleBase = Math.max(0, totalMedical - threshold);
  const infertilityDeductible = Math.min(deductibleBase, infertilityAmount);
  const generalDeductible = Math.max(0, deductibleBase - infertilityDeductible);

  const generalCredit = Math.min(
    Math.floor(generalDeductible * SPECIAL_DEDUCTION_LIMITS.medical.rate),
    SPECIAL_DEDUCTION_LIMITS.medical.limit,
  );

  const infertilityCredit = hasInfertility
    ? Math.floor(infertilityDeductible * SPECIAL_DEDUCTION_LIMITS.medical.maxRate)
    : Math.floor(infertilityDeductible * SPECIAL_DEDUCTION_LIMITS.medical.rate);

  return generalCredit + infertilityCredit;
};

/**
 * 교육비 공제 계산
 */
export const calculateEducationDeduction = (educationExpenses) => {
  let totalDeduction = 0;

  if (educationExpenses.self) {
    totalDeduction += educationExpenses.self * 0.15; // 본인 교육비 15%
  }
  if (educationExpenses.preschool) {
    totalDeduction += Math.min(educationExpenses.preschool, SPECIAL_DEDUCTION_LIMITS.education.preschool) * 0.15;
  }
  if (educationExpenses.elementary) {
    totalDeduction += Math.min(educationExpenses.elementary, SPECIAL_DEDUCTION_LIMITS.education.elementary) * 0.15;
  }
  if (educationExpenses.highschool) {
    totalDeduction += Math.min(educationExpenses.highschool, SPECIAL_DEDUCTION_LIMITS.education.highschool) * 0.15;
  }
  if (educationExpenses.university) {
    totalDeduction += Math.min(educationExpenses.university, SPECIAL_DEDUCTION_LIMITS.education.university) * 0.15;
  }

  return Math.floor(totalDeduction);
};

/**
 * 연금저축/IRP 공제 계산
 */
export const calculatePensionDeduction = (pensionSavings, irpAmount, totalIncome) => {
  const pensionLimit = SPECIAL_DEDUCTION_LIMITS.pension.personal;
  const totalLimit = SPECIAL_DEDUCTION_LIMITS.pension.irp;

  const pensionDeductible = Math.min(pensionSavings, pensionLimit);
  const totalDeductible = Math.min(pensionDeductible + irpAmount, totalLimit);

  // 총급여 5,500만원 이하: 16.5%, 5,500만원~1.2억원: 15%, 초과: 13.2%
  const rate = totalIncome <= 55000000 ? 0.165 : totalIncome <= 120000000 ? 0.15 : 0.132;

  return Math.floor(totalDeductible * rate);
};

/**
 * 기부금 공제 계산
 */
export const calculateDonationDeduction = (donations, totalIncome) => {
  const cappedIncome = Math.max(0, totalIncome || 0);
  let totalDeduction = 0;

  const applyTieredCredit = (amount, limit) => {
    const capped = Math.min(amount, limit);
    const base = Math.min(capped, DONATION_TIER_THRESHOLD);
    const excess = Math.max(0, capped - DONATION_TIER_THRESHOLD);
    return (base * 0.15) + (excess * 0.30);
  };

  // 법정기부금 (소득 100%까지, 2천만원 초과분 30%)
  if (donations.legal) {
    totalDeduction += applyTieredCredit(donations.legal, cappedIncome);
  }

  // 지정기부금 (소득의 30%까지, 2천만원 초과분 30%)
  if (donations.designated) {
    const limit = cappedIncome * 0.30;
    totalDeduction += applyTieredCredit(donations.designated, limit);
  }

  // 종교단체 (소득의 10%까지, 2천만원 초과분 30%)
  if (donations.religious) {
    const limit = cappedIncome * 0.10;
    totalDeduction += applyTieredCredit(donations.religious, limit);
  }

  // 정치자금: 10만원까지 100%, 10만원 초과~3천만원 15%, 3천만원 초과 25%
  if (donations.political) {
    const amount = donations.political;
    const tier1 = Math.min(amount, 100000);
    const tier2 = Math.min(Math.max(0, amount - 100000), 29900000);
    const tier3 = Math.max(0, amount - 30000000);
    totalDeduction += tier1 + (tier2 * 0.15) + (tier3 * 0.25);
  }

  return Math.floor(totalDeduction);
};

/**
 * 자녀 세액공제 계산 (첫째/둘째 15만원, 셋째 이상 30만원)
 */
export const calculateChildTaxCredit = (childDependents = 0) => {
  if (childDependents <= 0) return 0;
  if (childDependents === 1) return CHILD_TAX_CREDIT_FIRST_SECOND;
  if (childDependents === 2) return CHILD_TAX_CREDIT_FIRST_SECOND * 2;

  // 3번째부터는 30만원씩
  const thirdAndMore = childDependents - 2;
  return (CHILD_TAX_CREDIT_FIRST_SECOND * 2) + (thirdAndMore * CHILD_TAX_CREDIT_THIRD_OR_MORE);
};

/**
 * 개인 연말정산 종합 계산
 */
export const calculateIndividualTax = ({
  annualIncome, // 연간 총급여
  dependents = 0, // 부양가족 수
  hasSpouse = false, // 배우자 유무
  insurancePremiums = {}, // 보험료
  medicalExpenses = 0, // 의료비
  educationExpenses = {}, // 교육비
  donations = {}, // 기부금
  pensionSavings = 0, // 연금저축
  irpAmount = 0, // IRP
  housingDeduction = 0, // 주택자금공제
  hasInfertility = false, // 난임 시술비 여부
  medicalInfertility = 0, // 난임 시술비 금액
  medicalGeneral = 0, // 일반 의료비 (상세 입력 지원)
  medicalSenior = 0, // 고령자 의료비
  childDependents = 0, // 자녀 수 (자녀 세액공제용)
}) => {
  const safeAnnualIncome = Math.max(0, annualIncome || 0);

  // 1. 근로소득공제
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(safeAnnualIncome);

  // 2. 근로소득금액
  const earnedIncome = safeAnnualIncome - earnedIncomeDeduction;

  // 3. 인적공제
  const personalDeductions =
    BASIC_DEDUCTIONS.personal +
    (hasSpouse ? BASIC_DEDUCTIONS.spouse : 0) +
    (dependents * BASIC_DEDUCTIONS.dependent);

  // 4. 특별공제 합계
  const specialDeductions =
    (insurancePremiums.national || 0) + // 국민연금
    (insurancePremiums.health || 0) + // 건강보험
    (insurancePremiums.employment || 0); // 고용보험

  // 주택자금 공제는 법정 한도로 캡 (기본 월세 한도 사용, 필요시 주택종류별 추가 파라미터로 확장)
  const cappedHousingDeduction = Math.min(
    Math.max(0, housingDeduction || 0),
    SPECIAL_DEDUCTION_LIMITS.housing.rent,
  );

  // 상세 의료비가 들어왔으면 총액이 누락되지 않도록 최대값 사용
  const detailedMedicalSum = (medicalGeneral || 0) + (medicalSenior || 0) + (medicalInfertility || 0);
  const totalMedicalExpenses = Math.max(
    Math.max(0, medicalExpenses || 0),
    detailedMedicalSum,
  );
  const infertilityAmount = Math.min(Math.max(0, medicalInfertility || 0), totalMedicalExpenses);
  const hasInfertilityExpense = hasInfertility || infertilityAmount > 0;
  const eligibleChildDependents = Math.max(0, childDependents || dependents || 0);

  // 5. 과세표준
  const taxableIncome = Math.max(0, earnedIncome - personalDeductions - specialDeductions - cappedHousingDeduction);

  // 6. 산출세액
  const calculatedTax = calculateIncomeTax(taxableIncome);

  // 7. 세액공제
  const taxCredits =
    calculateMedicalDeduction(safeAnnualIncome, totalMedicalExpenses, hasInfertilityExpense, infertilityAmount) +
    calculateEducationDeduction(educationExpenses) +
    calculateDonationDeduction(donations, earnedIncome) +
    calculatePensionDeduction(pensionSavings, irpAmount, safeAnnualIncome) +
    calculateChildTaxCredit(eligibleChildDependents);

  // 근로소득세액공제: 산출세액 55%(한도 66만) + 추가공제 30%(최대 74만)
  let earnedIncomeTaxCredit = Math.min(calculatedTax * 0.55, 660000);
  if (calculatedTax > 1200000) {
    const additional = (calculatedTax - 1200000) * 0.30;
    earnedIncomeTaxCredit = Math.min(660000 + additional, 740000);
  }

  // 8. 결정세액
  const finalTax = Math.max(0, calculatedTax - taxCredits - earnedIncomeTaxCredit);

  // 9. 지방소득세
  const localTax = calculateLocalIncomeTax(finalTax);

  // 10. 총 세액
  const totalTax = finalTax + localTax;

  return {
    annualIncome: safeAnnualIncome,
    earnedIncomeDeduction,
    earnedIncome,
    personalDeductions,
    specialDeductions,
    taxableIncome,
    calculatedTax,
    taxCredits,
    earnedIncomeTaxCredit,
    finalTax,
    localTax,
    totalTax,
    effectiveRate: annualIncome > 0 ? (totalTax / annualIncome * 100).toFixed(2) : 0,
    monthlyTax: Math.ceil(totalTax / 12),
  };
};

/**
 * 사업자 부가가치세 계산
 */
export const calculateVAT = ({
  sales, // 매출
  purchases, // 매입
  isSimplified = false, // 간이과세자 여부
  industryRate = 0.10, // 업종별 부가가치율 (간이과세)
}) => {
  if (isSimplified) {
    // 간이과세자: 매출 × 업종별 부가가치율 × 10%
    const vat = Math.floor(sales * industryRate * VAT_RATE);
    const deductible = Math.floor(purchases * VAT_RATE * 0.5); // 50%만 공제
    const relief = Math.min(Math.floor(vat * SIMPLIFIED_VAT_RELIEF_RATE), SIMPLIFIED_VAT_RELIEF_CAP);
    const vatPayable = Math.max(0, vat - deductible - relief);
    return {
      type: 'simplified',
      sales,
      purchases,
      outputVat: vat,
      inputVat: deductible,
      relief,
      vatPayable,
      overThreshold: sales > SIMPLIFIED_TAX_THRESHOLD,
    };
  }

  // 일반과세자
  const outputVat = Math.floor(sales * VAT_RATE);
  const inputVat = Math.floor(purchases * VAT_RATE);

  return {
    type: 'general',
    sales,
    purchases,
    outputVat,
    inputVat,
    vatPayable: Math.max(0, outputVat - inputVat),
    vatRefund: Math.max(0, inputVat - outputVat),
  };
};

/**
 * 사업자 종합소득세 계산
 */
export const calculateBusinessTax = ({
  revenue, // 총수입
  expenses, // 필요경비
  otherIncome = 0, // 기타 소득
  dependents = 0,
  hasSpouse = false,
  pensionSavings = 0,
  irpAmount = 0,
}) => {
  // 1. 사업소득금액
  const businessIncome = revenue - expenses;

  // 2. 종합소득금액
  const totalIncome = businessIncome + otherIncome;

  // 3. 인적공제
  const personalDeductions =
    BASIC_DEDUCTIONS.personal +
    (hasSpouse ? BASIC_DEDUCTIONS.spouse : 0) +
    (dependents * BASIC_DEDUCTIONS.dependent);

  // 4. 과세표준
  const taxableIncome = Math.max(0, totalIncome - personalDeductions);

  // 5. 산출세액
  const calculatedTax = calculateIncomeTax(taxableIncome);

  // 6. 세액공제
  const taxCredits = calculatePensionDeduction(pensionSavings, irpAmount, revenue);

  // 7. 결정세액
  const finalTax = Math.max(0, calculatedTax - taxCredits);

  // 8. 지방소득세
  const localTax = calculateLocalIncomeTax(finalTax);

  // 9. 총 세액
  const totalTax = finalTax + localTax;

  return {
    revenue,
    expenses,
    businessIncome,
    totalIncome,
    personalDeductions,
    taxableIncome,
    calculatedTax,
    taxCredits,
    finalTax,
    localTax,
    totalTax,
    effectiveRate: revenue > 0 ? (totalTax / revenue * 100).toFixed(2) : 0,
    quarterlyTax: Math.ceil(totalTax / 4),
  };
};

/**
 * 예상 세금 절감액 계산
 */
export const calculatePotentialSavings = ({
  currentDeductions,
  additionalDeductions,
  taxableIncome,
}) => {
  const currentTax = calculateIncomeTax(taxableIncome - currentDeductions);
  const potentialTax = calculateIncomeTax(taxableIncome - currentDeductions - additionalDeductions);

  return {
    currentTax,
    potentialTax,
    savings: currentTax - potentialTax,
    savingsRate: currentTax > 0 ? ((currentTax - potentialTax) / currentTax * 100).toFixed(2) : 0,
  };
};

/**
 * 월별 세금 예측 (간이)
 */
export const predictMonthlyTax = ({
  monthlyIncome,
  monthlyExpenses = 0,
  userType = 'individual',
}) => {
  if (userType === 'individual') {
    const annualIncome = monthlyIncome * 12;
    const result = calculateIndividualTax({ annualIncome });
    return {
      estimatedMonthlyTax: result.monthlyTax,
      estimatedAnnualTax: result.totalTax,
      effectiveRate: result.effectiveRate,
    };
  } else {
    const annualRevenue = monthlyIncome * 12;
    const annualExpenses = monthlyExpenses * 12;
    const result = calculateBusinessTax({ revenue: annualRevenue, expenses: annualExpenses });
    return {
      estimatedQuarterlyTax: result.quarterlyTax,
      estimatedAnnualTax: result.totalTax,
      effectiveRate: result.effectiveRate,
    };
  }
};

/**
 * 공제 항목별 최대 한도 조회
 */
export const getDeductionLimits = () => {
  return {
    medical: SPECIAL_DEDUCTION_LIMITS.medical.limit,
    education: {
      self: '한도 없음',
      children: SPECIAL_DEDUCTION_LIMITS.education.university,
    },
    pension: SPECIAL_DEDUCTION_LIMITS.pension.irp,
    donation: '소득의 30%까지',
    housing: SPECIAL_DEDUCTION_LIMITS.housing.rent,
  };
};

/**
 * 세금 건강 점수 계산 (0-100)
 */
export const calculateTaxHealthScore = ({
  usedDeductions = {},
  potentialDeductions = {},
  documentsUploaded = 0,
  budgetAdherence = 0, // 예산 준수율 (0-100)
}) => {
  let score = 50; // 기본 점수

  // 공제 활용도 (최대 +30점)
  const deductionCategories = ['medical', 'education', 'donation', 'pension', 'housing'];
  let deductionUtilization = 0;

  for (const category of deductionCategories) {
    const used = usedDeductions[category] || 0;
    const potential = potentialDeductions[category] || 0;
    if (potential > 0) {
      deductionUtilization += (used / potential);
    }
  }
  score += Math.min(30, (deductionUtilization / deductionCategories.length) * 30);

  // 문서 관리 (최대 +10점)
  score += Math.min(10, documentsUploaded * 2);

  // 예산 준수 (최대 +10점)
  score += budgetAdherence * 0.1;

  return Math.min(100, Math.round(score));
};

// =============================================
// 업종별 표준 지표 (국세청 기준 참고)
// =============================================
const INDUSTRY_BENCHMARKS = {
  individual: {
    // 개인 근로소득자
    avgDeductionRate: 0.15, // 평균 공제율 15%
    avgDocumentRatio: 0.7,  // 평균 증빙율 70%
    recommendedCategories: 5, // 권장 공제 카테고리 수
  },
  freelancer: {
    // 프리랜서
    avgDeductionRate: 0.25,
    avgDocumentRatio: 0.6,
    avgExpenseRatio: 0.4, // 매출 대비 경비 비율
    recommendedCategories: 4,
  },
  business: {
    // 일반 사업자
    avgDeductionRate: 0.30,
    avgDocumentRatio: 0.8,
    avgExpenseRatio: 0.5,
    recommendedCategories: 4,
  },
};

/**
 * =============================================
 * 세금 리스크 점수 (Tax Risk Score)
 * - 높을수록 리스크 낮음 (안전)
 * - 캐시노트 방식 참고: 규칙 기반 이상징후 탐지
 * =============================================
 */
export const calculateTaxRiskScore = ({
  deductionTracker = {},      // 공제 항목별 { current, max, documents }
  transactions = [],          // 거래 내역
  annualIncome = 0,           // 연간 소득
  userType = 'individual',    // 사용자 유형
  hasUnverifiedTransactions = false, // 미검증 거래 존재 여부
  taxDeadlineDays = 365,      // 신고 마감일까지 남은 일수
}) => {
  let score = 100; // 만점에서 시작 (리스크 없음)
  const benchmark = INDUSTRY_BENCHMARKS[userType] || INDUSTRY_BENCHMARKS.individual;
  const riskFactors = [];

  // ========== 규칙 1: 증빙 누락 위험 (최대 -30점) ==========
  // 금액 대비 증빙 서류 부족 체크
  const categories = Object.keys(deductionTracker);
  let missingDocsCount = 0;
  let totalAmount = 0;
  let totalDocs = 0;

  for (const cat of categories) {
    const item = deductionTracker[cat] || {};
    const current = item.current || 0;
    const docs = item.documents || 0;
    totalAmount += current;
    totalDocs += docs;

    // 50만원당 최소 1개 증빙 필요 (국세청 권장)
    const requiredDocs = Math.ceil(current / 500000);
    if (docs < requiredDocs && current > 0) {
      missingDocsCount++;
    }
  }

  const docDeficitPenalty = Math.min(30, missingDocsCount * 10);
  score -= docDeficitPenalty;
  if (docDeficitPenalty > 0) {
    riskFactors.push({
      type: 'missing_docs',
      severity: docDeficitPenalty >= 20 ? 'high' : 'medium',
      message: `${missingDocsCount}개 카테고리에서 증빙 서류 부족`,
      penalty: docDeficitPenalty,
    });
  }

  // ========== 규칙 2: 공제 한도 초과 위험 (최대 -20점) ==========
  let overLimitCount = 0;
  for (const cat of categories) {
    const item = deductionTracker[cat] || {};
    const current = item.current || 0;
    const max = item.max || Infinity;
    if (current > max) {
      overLimitCount++;
    }
  }

  const overLimitPenalty = Math.min(20, overLimitCount * 10);
  score -= overLimitPenalty;
  if (overLimitPenalty > 0) {
    riskFactors.push({
      type: 'over_limit',
      severity: 'high',
      message: `${overLimitCount}개 항목이 공제 한도 초과`,
      penalty: overLimitPenalty,
    });
  }

  // ========== 규칙 3: 소득 대비 공제 비율 이상치 (최대 -15점) ==========
  // 업종 평균 대비 20% 이상 차이나면 이상 신호
  if (annualIncome > 0) {
    const deductionRate = totalAmount / annualIncome;
    const deviation = Math.abs(deductionRate - benchmark.avgDeductionRate) / benchmark.avgDeductionRate;

    if (deviation > 0.5) {
      // 50% 이상 차이
      const anomalyPenalty = Math.min(15, Math.floor(deviation * 15));
      score -= anomalyPenalty;
      riskFactors.push({
        type: 'deduction_anomaly',
        severity: deviation > 0.8 ? 'high' : 'medium',
        message: deductionRate > benchmark.avgDeductionRate
          ? '공제 비율이 업종 평균보다 높음 (검증 필요)'
          : '공제 비율이 업종 평균보다 낮음 (절세 기회 손실)',
        penalty: anomalyPenalty,
      });
    }
  }

  // ========== 규칙 4: 미검증 거래 존재 (최대 -15점) ==========
  if (hasUnverifiedTransactions) {
    score -= 15;
    riskFactors.push({
      type: 'unverified_transactions',
      severity: 'medium',
      message: '미검증 거래가 존재합니다',
      penalty: 15,
    });
  }

  // ========== 규칙 5: 신고 마감일 임박 (-10점) ==========
  if (taxDeadlineDays < 30 && totalDocs < categories.length) {
    const urgencyPenalty = taxDeadlineDays < 7 ? 10 : 5;
    score -= urgencyPenalty;
    riskFactors.push({
      type: 'deadline_urgent',
      severity: taxDeadlineDays < 7 ? 'high' : 'medium',
      message: `신고 마감 ${taxDeadlineDays}일 전, 증빙 준비 필요`,
      penalty: urgencyPenalty,
    });
  }

  // ========== 업종/규모 보정 (캐시노트 방식) ==========
  // 소규모/신규는 변동성 높아도 패널티 완화
  if (annualIncome < 30000000) {
    score = Math.min(100, score + 5); // 저소득자 보정
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    riskFactors,
    status: score >= 80 ? '안전' : score >= 60 ? '주의' : score >= 40 ? '경고' : '위험',
    statusColor: score >= 80 ? 'green' : score >= 60 ? 'yellow' : score >= 40 ? 'orange' : 'red',
  };
};

/**
 * =============================================
 * 증빙 완성도 점수 (Documentation Score)
 * - 카테고리별 필요 서류 대비 실제 업로드 비율
 * =============================================
 */
export const calculateDocumentationScore = ({
  deductionTracker = {},
  receipts = [],             // 영수증 목록
  hasBasicDocuments = false, // 기본 서류 (소득증빙, 신분증) 보유 여부
}) => {
  let totalRequired = 0;
  let totalUploaded = 0;
  const categoryScores = [];

  // ========== 카테고리별 증빙 완성도 ==========
  for (const [category, item] of Object.entries(deductionTracker)) {
    const current = item.current || 0;
    const docs = item.documents || 0;

    // 금액 기준 필요 서류 수 (50만원당 1개, 최소 1개)
    const requiredDocs = current > 0 ? Math.max(1, Math.ceil(current / 500000)) : 0;
    const completionRate = requiredDocs > 0 ? Math.min(1, docs / requiredDocs) : 1;

    totalRequired += requiredDocs;
    totalUploaded += Math.min(docs, requiredDocs);

    if (requiredDocs > 0) {
      categoryScores.push({
        category,
        required: requiredDocs,
        uploaded: docs,
        completionRate: Math.round(completionRate * 100),
        status: completionRate >= 1 ? '완료' : completionRate >= 0.5 ? '진행중' : '미흡',
      });
    }
  }

  // ========== 기본 점수 계산 ==========
  let score = 0;

  // 카테고리별 가중치 적용 점수 (80점 만점)
  if (totalRequired > 0) {
    score = (totalUploaded / totalRequired) * 80;
  } else {
    score = 50; // 공제 금액이 없으면 기본 50점
  }

  // ========== 기본 서류 보너스 (10점) ==========
  if (hasBasicDocuments) {
    score += 10;
  }

  // ========== 영수증 OCR 검증 보너스 (10점) ==========
  const verifiedReceipts = receipts.filter(r => r.verified || r.ocr_verified).length;
  const receiptBonus = receipts.length > 0
    ? (verifiedReceipts / receipts.length) * 10
    : 0;
  score += receiptBonus;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    categoryScores,
    totalRequired,
    totalUploaded,
    status: score >= 80 ? '우수' : score >= 60 ? '양호' : score >= 40 ? '보통' : '미흡',
    statusColor: score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'yellow' : 'orange',
    recommendation: score < 80
      ? categoryScores.filter(c => c.completionRate < 100).map(c => c.category)
      : [],
  };
};

/**
 * =============================================
 * 환급 가능성 점수 (Refund Potential Score)
 * - 기납부세액 대비 예상 결정세액 비교
 * - 공제 활용도 반영
 * =============================================
 */
export const calculateRefundPotentialScore = ({
  deductionTracker = {},
  annualIncome = 0,
  prepaidTax = 0,            // 기납부 세액 (원천징수)
  userType = 'individual',
  dependents = 0,
  hasSpouse = false,
}) => {
  // ========== 1. 현재 공제 합계 계산 ==========
  let totalUsedDeductions = 0;
  let totalMaxDeductions = 0;

  for (const item of Object.values(deductionTracker)) {
    totalUsedDeductions += item.current || 0;
    totalMaxDeductions += item.max || 0;
  }

  // ========== 2. 공제 활용률 계산 ==========
  const utilizationRate = totalMaxDeductions > 0
    ? totalUsedDeductions / totalMaxDeductions
    : 0;

  // ========== 3. 예상 세금 계산 ==========
  let estimatedTax = 0;
  if (userType === 'individual' && annualIncome > 0) {
    const taxResult = calculateIndividualTax({
      annualIncome,
      dependents,
      hasSpouse,
      medicalExpenses: deductionTracker.medical?.current || 0,
      educationExpenses: { self: deductionTracker.education?.current || 0 },
      donations: { designated: deductionTracker.donation?.current || 0 },
      pensionSavings: deductionTracker.pension?.current || 0,
      housingDeduction: deductionTracker.housing?.current || 0,
    });
    estimatedTax = taxResult.totalTax;
  }

  // ========== 4. 기납부세액 추정 (없으면 소득의 10% 가정) ==========
  const actualPrepaidTax = prepaidTax > 0 ? prepaidTax : annualIncome * 0.10;

  // ========== 5. 환급 가능성 점수 계산 ==========
  let score = 0;

  // 환급 예상액 기반 점수 (50점 만점)
  const refundAmount = actualPrepaidTax - estimatedTax;
  if (refundAmount > 0) {
    // 환급 비율에 따른 점수
    const refundRate = refundAmount / actualPrepaidTax;
    score += Math.min(50, refundRate * 100);
  }

  // 공제 활용도 점수 (30점 만점)
  score += utilizationRate * 30;

  // 증빙 완성도 반영 (20점 만점)
  const totalDocs = Object.values(deductionTracker).reduce((sum, item) => sum + (item.documents || 0), 0);
  const docScore = Math.min(20, totalDocs * 2);
  score += docScore;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    estimatedTax,
    prepaidTax: actualPrepaidTax,
    estimatedRefund: Math.max(0, refundAmount),
    utilizationRate: Math.round(utilizationRate * 100),
    status: score >= 80 ? '우수' : score >= 60 ? '양호' : score >= 40 ? '보통' : '낮음',
    statusColor: score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'yellow' : 'gray',
    tip: refundAmount <= 0
      ? '공제 항목을 더 활용하면 환급 가능성이 높아집니다'
      : `약 ${Math.round(refundAmount).toLocaleString()}원 환급 예상`,
  };
};

/**
 * =============================================
 * 절세 여력 점수 (Tax Savings Potential Score)
 * - 아직 사용하지 않은 공제 한도 기반
 * - 높을수록 절세 기회가 많음
 * =============================================
 */
export const calculateSavingsPotentialScore = ({
  deductionTracker = {},
  annualIncome = 0,
  userType = 'individual',
}) => {
  const unusedByCategory = [];
  let totalPotential = 0;
  let totalUsed = 0;

  // ========== 1. 카테고리별 미사용 한도 계산 ==========
  for (const [category, item] of Object.entries(deductionTracker)) {
    const current = item.current || 0;
    const max = item.max || 0;
    const remaining = Math.max(0, max - current);

    totalPotential += max;
    totalUsed += current;

    if (remaining > 0) {
      // 예상 절세 금액 계산 (소득구간별 한계세율 적용)
      const marginalRate = getMarginalTaxRate(annualIncome);
      const potentialSavings = Math.round(remaining * marginalRate);

      unusedByCategory.push({
        category,
        remaining,
        max,
        usageRate: max > 0 ? Math.round((current / max) * 100) : 100,
        potentialSavings,
      });
    }
  }

  // ========== 2. 미사용 비율을 점수로 변환 ==========
  // 높은 점수 = 아직 절세할 여지가 많음
  const remainingRatio = totalPotential > 0
    ? (totalPotential - totalUsed) / totalPotential
    : 0;

  let score = remainingRatio * 100;

  // ========== 3. 소득 구간별 보정 ==========
  // 저소득자는 공제 효과가 더 크므로 보너스
  if (annualIncome <= 55000000) {
    score = Math.min(100, score * 1.1);
  }

  // ========== 4. 총 절세 가능 금액 계산 ==========
  const marginalRate = getMarginalTaxRate(annualIncome);
  const totalPotentialSavings = Math.round((totalPotential - totalUsed) * marginalRate);

  // 정렬: 절세 효과 큰 순
  unusedByCategory.sort((a, b) => b.potentialSavings - a.potentialSavings);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    unusedByCategory,
    totalRemaining: totalPotential - totalUsed,
    totalPotentialSavings,
    status: score >= 70 ? '여력 많음' : score >= 40 ? '보통' : '한도 근접',
    statusColor: score >= 70 ? 'purple' : score >= 40 ? 'blue' : 'green',
    topRecommendations: unusedByCategory.slice(0, 3),
  };
};

/**
 * 소득 구간별 한계세율 반환
 */
const getMarginalTaxRate = (annualIncome) => {
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (annualIncome <= bracket.max) {
      return bracket.rate;
    }
  }
  return 0.45; // 최고세율
};

/**
 * =============================================
 * 통합 Tax Health 상세 점수 계산
 * - 4가지 세부 점수를 한번에 계산
 * =============================================
 */
export const calculateDetailedTaxHealthScores = ({
  deductionTracker = {},
  transactions = [],
  receipts = [],
  annualIncome = 0,
  prepaidTax = 0,
  userType = 'individual',
  dependents = 0,
  hasSpouse = false,
  hasBasicDocuments = false,
  hasUnverifiedTransactions = false,
  taxDeadlineDays = 365,
}) => {
  const taxRisk = calculateTaxRiskScore({
    deductionTracker,
    transactions,
    annualIncome,
    userType,
    hasUnverifiedTransactions,
    taxDeadlineDays,
  });

  const documentation = calculateDocumentationScore({
    deductionTracker,
    receipts,
    hasBasicDocuments,
  });

  const refundPotential = calculateRefundPotentialScore({
    deductionTracker,
    annualIncome,
    prepaidTax,
    userType,
    dependents,
    hasSpouse,
  });

  const savingsPotential = calculateSavingsPotentialScore({
    deductionTracker,
    annualIncome,
    userType,
  });

  return {
    taxRisk,
    documentation,
    refundPotential,
    savingsPotential,
    // 종합 점수 (가중 평균)
    overallScore: Math.round(
      taxRisk.score * 0.25 +
      documentation.score * 0.25 +
      refundPotential.score * 0.25 +
      savingsPotential.score * 0.25
    ),
  };
};

export default {
  calculateIndividualTax,
  calculateBusinessTax,
  calculateVAT,
  calculatePotentialSavings,
  predictMonthlyTax,
  getDeductionLimits,
  calculateTaxHealthScore,
  calculateMedicalDeduction,
  calculateEducationDeduction,
  calculateDonationDeduction,
  calculatePensionDeduction,
  calculateChildTaxCredit,
  // 세부 Tax Health 점수 계산 함수들
  calculateTaxRiskScore,
  calculateDocumentationScore,
  calculateRefundPotentialScore,
  calculateSavingsPotentialScore,
  calculateDetailedTaxHealthScores,
};
