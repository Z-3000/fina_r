/**
 * 한국 세금 계산기 서비스
 * - 개인: 근로소득세, 연말정산
 * - 사업자: 종합소득세, 부가가치세
 *
 * 2025년 세법 개정사항 반영 (2024년 귀속분)
 * - 신용카드 소득공제 3중 한도 (기본/추가/증가분)
 * - 4대보험 상·하한 적용
 * - 월세 세액공제 한도 1,000만원, 소득기준 8천만원
 * - 연금저축 600만원, IRP 포함 900만원
 * - 소상공인 세액공제 (노란우산, 신용카드 매출, 간이과세)
 */

// 소상공인/사업자 세금 상수
import {
  YELLOW_UMBRELLA_DEDUCTION,
  INDUSTRY_VALUE_ADDED_RATES,
  SIMPLIFIED_TAX_CRITERIA,
  CARD_SALES_TAX_CREDIT,
} from '../../constants/businessTaxConstants';

// =============================================
// 2025년 기준 소득세율표 (과세표준) - 변동 없음
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
    rent: 10000000, // 월세 공제대상액 한도 1,000만원 (2025년 개정)
    mortgage: {
      under15y: 6000000,  // 600만원 (2025년 개정, 기존 300만)
      under30y: 20000000, // 2,000만원 (2025년 개정, 기존 1,800만)
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
    personal: 6000000, // 연금저축 600만원 (2025년 개정, 기존 400만)
    irp: 9000000, // IRP 포함 900만원 (2025년 개정, 기존 700만)
  },
};

// =============================================
// 2025년 신용카드 소득공제 상수
// =============================================
const CREDIT_CARD_DEDUCTION = {
  // 최저사용금액: 총급여의 25%
  minimumUsageRate: 0.25,

  // 공제율
  rates: {
    creditCard: 0.15,        // 신용카드 15%
    debitCard: 0.30,         // 체크카드/직불카드 30%
    cash: 0.30,              // 현금영수증 30%
    traditionalMarket: 0.40, // 전통시장 40%
    publicTransport: 0.40,   // 대중교통 40%
    culture: 0.30,           // 도서/공연/박물관 30%
    sports: 0.30,            // 체육시설 30% (2025년 7월부터, 문화비와 동일)
  },

  // 기본한도 (총급여 구간별)
  basicLimits: [
    { maxIncome: 70000000, limit: 3000000 },   // 7천만 이하: 300만원
    { maxIncome: 120000000, limit: 2500000 },  // 7천~1.2억: 250만원
    { maxIncome: Infinity, limit: 2000000 },   // 1.2억 초과: 200만원
  ],

  // 추가한도 (전통시장+대중교통+문화비+체육시설)
  additionalLimits: {
    under70m: 3000000,  // 7천만 이하: 300만원 (시장+교통+문화+체육)
    over70m: 2000000,   // 7천만 초과: 200만원 (시장+교통만, 문화/체육 제외)
  },

  // 소비증가분 추가공제 (전년 대비 5% 초과분)
  consumptionIncrease: {
    threshold: 0.05,  // 5% 초과분
    rate: 0.10,       // 10% 공제
    limit: 1000000,   // 한도 100만원
  },
};

// =============================================
// 2025년 4대보험 상수 (상·하한 포함)
// =============================================
const INSURANCE_RATES_2025 = {
  // 국민연금 (근로자 부담분 4.5%)
  nationalPension: {
    rate: 0.045,
    // 기준소득월액 상·하한 (1~6월)
    firstHalf: { min: 390000, max: 6170000 },
    // 기준소득월액 상·하한 (7~12월)
    secondHalf: { min: 400000, max: 6370000 },
  },

  // 건강보험 (근로자 부담분 3.545%)
  healthInsurance: {
    rate: 0.03545,
    // 보험료 상·하한 (보수월액 아닌 보험료 기준)
    minPremium: 19780,    // 하한 보험료
    maxPremium: 9008340,  // 상한 보험료
  },

  // 장기요양보험 (건강보험료의 12.95%)
  longTermCare: {
    rate: 0.1295,
  },

  // 고용보험 (근로자 부담분 0.9%)
  employmentInsurance: {
    rate: 0.009,
    // 상·하한 없음
  },
};

// =============================================
// 2025년 월세 세액공제 상수
// =============================================
const RENT_TAX_CREDIT_2025 = {
  maxEligibleRent: 10000000, // 공제대상 월세액 한도 1,000만원
  maxIncome: 80000000,       // 총급여 8천만원 이하
  rates: {
    under55m: 0.17,  // 5,500만원 이하: 17%
    over55m: 0.15,   // 5,500만원 초과: 15%
  },
  incomeThreshold: 55000000, // 공제율 구분 기준
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

  // 공제대상 의료비를 700만원까지로 제한한 뒤 15% 적용 (세액공제 상한 105만원)
  const generalCredit = Math.floor(
    Math.min(generalDeductible, SPECIAL_DEDUCTION_LIMITS.medical.limit) *
      SPECIAL_DEDUCTION_LIMITS.medical.rate,
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
  creditCardDeduction = 0, // 신용카드 소득공제 (2025년)
}) => {
  const safeAnnualIncome = Math.max(0, annualIncome || 0);
  const safeCardDeduction = Math.max(0, creditCardDeduction || 0);

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
  // 자녀 수는 명시적으로 입력된 값만 사용 (부양가족 전체를 자녀로 간주하지 않음)
  const eligibleChildDependents = Math.max(0, childDependents || 0);

  // 5. 과세표준
  const taxableIncome = Math.max(
    0,
    earnedIncome - personalDeductions - specialDeductions - cappedHousingDeduction - safeCardDeduction,
  );

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

// =============================================
// 2025년 신규 함수: 신용카드 소득공제 계산
// =============================================
/**
 * 신용카드 등 소득공제 계산 (2025년 기준)
 *
 * 【계산 구조】
 * 1. 총 사용액 - 최저사용금액(25%) = 초과분
 * 2. 초과분에 대해 결제수단별 공제율 적용
 * 3. 3중 한도 적용: 기본한도 + 추가한도 + 소비증가분
 *
 * 【공제율】
 * - 신용카드: 15%, 체크/현금: 30%, 전통시장/대중교통: 40%, 문화/체육: 30%
 *
 * 【한도】
 * - 기본: 7천만↓300만, 7천~1.2억 250만, 1.2억↑200만
 * - 추가: 7천만↓300만(시장+교통+문화+체육), 7천만↑200만(시장+교통만)
 * - 소비증가분: 전년대비 5%↑ 사용시 10% 추가공제, 한도 100만
 */
export const calculateCreditCardDeduction = ({
  annualIncome = 0,          // 연간 총급여
  creditCardAmount = 0,      // 신용카드 사용액 (공제율 15%)
  debitCardAmount = 0,       // 체크카드/직불카드 (공제율 30%)
  cashReceiptAmount = 0,     // 현금영수증 (공제율 30%)
  traditionalMarketAmount = 0, // 전통시장 (공제율 40%, 추가한도)
  publicTransportAmount = 0,   // 대중교통 (공제율 40%, 추가한도)
  cultureAmount = 0,         // 도서/공연/박물관 (공제율 30%, 7천만↓만 추가한도)
  sportsAmount = 0,          // 체육시설 (공제율 30%, 7천만↓만 추가한도, 2025.7~)
  previousYearTotal = 0,     // 전년도 총 사용액 (소비증가분 계산용)
}) => {
  // 상수 구조분해: rates(공제율), basicLimits(기본한도), additionalLimits(추가한도), consumptionIncrease(소비증가분), minimumUsageRate(25%)
  const { rates, basicLimits, additionalLimits, consumptionIncrease, minimumUsageRate } = CREDIT_CARD_DEDUCTION;

  // ───────────────────────────────────────────────────────────────
  // STEP 1: 최저사용금액 계산 (총급여의 25%)
  // ───────────────────────────────────────────────────────────────
  const minimumUsage = annualIncome * minimumUsageRate;  // 예: 5천만원 × 0.25 = 1,250만원

  // ───────────────────────────────────────────────────────────────
  // STEP 2: 총 사용액 계산 (모든 결제수단 합산)
  // ───────────────────────────────────────────────────────────────
  const totalUsage = creditCardAmount + debitCardAmount + cashReceiptAmount +  // 일반 사용액
    traditionalMarketAmount + publicTransportAmount + cultureAmount + sportsAmount;  // 추가한도 항목 포함

  // ───────────────────────────────────────────────────────────────
  // STEP 3: 최저사용금액 미달 체크 → 공제 없음
  // ───────────────────────────────────────────────────────────────
  if (totalUsage <= minimumUsage) {  // 총 사용액 ≤ 25%면 공제 대상 없음
    return {
      totalUsage,                    // 총 사용액 (원본)
      minimumUsage,                  // 최저사용금액 (25%)
      excessAmount: 0,               // 초과분 없음
      basicDeduction: 0,             // 기본공제 0
      additionalDeduction: 0,        // 추가공제 0
      increaseDeduction: 0,          // 소비증가분 공제 0
      totalDeduction: 0,             // 총 공제액 0
      breakdown: {},                 // 항목별 내역 없음
    };
  }

  // ───────────────────────────────────────────────────────────────
  // STEP 4: 초과 사용액 계산 (공제 대상 금액)
  // ───────────────────────────────────────────────────────────────
  const excessAmount = totalUsage - minimumUsage;  // 예: 2,000만원 - 1,250만원 = 750만원 (이 금액만 공제 대상)

  // ───────────────────────────────────────────────────────────────
  // STEP 5: 최저사용금액 순차 차감 (신용카드→체크→현금→전통시장→대중교통→문화→체육)
  // 【핵심】공제율 낮은 신용카드(15%)부터 먼저 25%를 채우고, 나머지가 공제 대상
  // ───────────────────────────────────────────────────────────────
  let remainingMinimum = minimumUsage;  // 아직 채워야 할 최저사용금액

  // 기본한도 대상 항목 순서 (공제율 낮은 순)
  const usageOrder = [
    { amount: creditCardAmount, rate: rates.creditCard, name: 'creditCard' },   // 15% (가장 먼저 25% 채움)
    { amount: debitCardAmount, rate: rates.debitCard, name: 'debitCard' },       // 30%
    { amount: cashReceiptAmount, rate: rates.cash, name: 'cash' },               // 30%
  ];

  const breakdown = {};           // 항목별 공제 내역 저장
  let basicDeductionTotal = 0;    // 기본한도 공제액 누적

  /**
   * applyDeduction: 각 항목에 대해 최저사용금액 차감 후 공제액 계산
   * @param amount - 해당 항목 사용금액
   * @param rate - 공제율 (0.15, 0.30, 0.40)
   * @param name - 항목명 (breakdown 저장용)
   * @param allowDeduction - 공제 허용 여부 (7천만↑ 문화/체육은 false)
   */
  const applyDeduction = (amount, rate, name, { allowDeduction = true } = {}) => {
    if (amount <= 0) {  // 사용액 없으면 스킵
      breakdown[name] = { amount, deductible: 0, deduction: 0, excluded: !allowDeduction };
      return 0;
    }

    // Case 1: 이 항목 전체가 최저사용금액 채우기에 사용됨 → 공제 0
    if (remainingMinimum >= amount) {
      remainingMinimum -= amount;  // 최저사용금액에서 차감
      breakdown[name] = { amount, deductible: 0, deduction: 0, excluded: !allowDeduction };
      return 0;  // 공제액 없음
    }

    // Case 2: 이 항목이 최저사용금액을 넘음 → 초과분만 공제
    const deductible = amount - remainingMinimum;  // 예: 500만원 - 남은 200만원 = 300만원 (공제 대상)
    const deduction = allowDeduction ? Math.floor(deductible * rate) : 0;  // 공제액 = 300만 × 15% = 45만
    breakdown[name] = {
      amount,                                      // 원래 사용금액
      deductible: allowDeduction ? deductible : 0, // 공제 대상 금액
      deduction,                                   // 실제 공제액
      excluded: !allowDeduction                    // 7천만↑ 문화/체육 제외 여부
    };
    remainingMinimum = 0;  // 최저사용금액 다 채움
    return deduction;
  };

  // 기본한도 항목들 순차 처리 (신용카드 → 체크 → 현금)
  for (const item of usageOrder) {
    basicDeductionTotal += applyDeduction(item.amount, item.rate, item.name);
  }

  // ───────────────────────────────────────────────────────────────
  // STEP 6: 기본한도 적용
  // ───────────────────────────────────────────────────────────────
  const basicLimit = basicLimits.find(b => annualIncome <= b.maxIncome)?.limit || 2000000;  // 소득구간별 한도
  const basicDeduction = Math.min(basicDeductionTotal, basicLimit);  // 한도 초과 시 잘라냄

  // ───────────────────────────────────────────────────────────────
  // STEP 7: 추가한도 항목 계산 (전통시장, 대중교통, 문화비, 체육시설)
  // 【주의】이 항목들도 최저사용금액(25%) 차감 대상임!
  // ───────────────────────────────────────────────────────────────
  const isUnder70m = annualIncome <= 70000000;  // 7천만원 이하 여부 (문화/체육 포함 기준)
  let additionalDeductionTotal = 0;

  // 전통시장 (40%) - 모든 소득구간 추가한도 적용
  additionalDeductionTotal += applyDeduction(
    traditionalMarketAmount,
    rates.traditionalMarket,  // 0.40
    'traditionalMarket',
  );

  // 대중교통 (40%) - 모든 소득구간 추가한도 적용
  additionalDeductionTotal += applyDeduction(
    publicTransportAmount,
    rates.publicTransport,  // 0.40
    'publicTransport',
  );

  // 문화비 (30%) - 7천만↓만 추가한도, 7천만↑는 최저사용금액 차감만 반영
  additionalDeductionTotal += applyDeduction(
    cultureAmount,
    rates.culture,  // 0.30
    'culture',
    { allowDeduction: isUnder70m },  // 7천만↑면 공제 불가 (excluded: true)
  );

  // 체육시설 (30%) - 7천만↓만 추가한도, 7천만↑는 최저사용금액 차감만 반영
  additionalDeductionTotal += applyDeduction(
    sportsAmount,
    rates.sports,  // 0.30 (40% 아님!)
    'sports',
    { allowDeduction: isUnder70m },  // 7천만↑면 공제 불가 (excluded: true)
  );

  // 추가한도 적용: 7천만↓ 300만원, 7천만↑ 200만원
  const additionalLimit = isUnder70m ? additionalLimits.under70m : additionalLimits.over70m;
  const additionalDeduction = Math.min(additionalDeductionTotal, additionalLimit);

  // ───────────────────────────────────────────────────────────────
  // STEP 8: 소비증가분 추가공제 계산
  // 전년 대비 5% 초과 사용시 → 초과분의 10%, 한도 100만원
  // ───────────────────────────────────────────────────────────────
  let increaseDeduction = 0;
  if (previousYearTotal > 0) {  // 전년도 데이터 있을 때만
    const increaseThreshold = previousYearTotal * (1 + consumptionIncrease.threshold);  // 전년도 × 1.05
    if (totalUsage > increaseThreshold) {  // 올해 > 전년도×1.05 이면
      const increaseAmount = totalUsage - increaseThreshold;  // 5% 초과분
      increaseDeduction = Math.min(
        Math.floor(increaseAmount * consumptionIncrease.rate),  // 초과분 × 10%
        consumptionIncrease.limit  // 한도 100만원
      );
    }
  }

  // ───────────────────────────────────────────────────────────────
  // STEP 9: 총 공제액 (3중 한도 별도 합산)
  // 【핵심】기본한도 + 추가한도 + 소비증가분은 각각 별도 한도이므로 단순 합산
  // ───────────────────────────────────────────────────────────────
  const totalDeduction = basicDeduction + additionalDeduction + increaseDeduction;

  return {
    totalUsage,
    minimumUsage,
    excessAmount,
    basicDeduction,
    basicLimit,
    additionalDeduction,
    additionalLimit,
    increaseDeduction,
    totalDeduction,
    breakdown,
    isUnder70m,
  };
};

// =============================================
// 2025년 신규 함수: 4대보험 자동 계산
// =============================================
/**
 * 4대보험료 자동 계산 (2025년 기준, 상·하한 적용)
 * @param {number} monthlyIncome - 월 소득
 * @param {number} month - 적용 월 (1~12, 국민연금 상·하한 분기 적용)
 * @returns {Object} 4대보험료 상세
 */
export const calculateInsurancePremiums = (monthlyIncome, month = new Date().getMonth() + 1) => {
  const { nationalPension, healthInsurance, longTermCare, employmentInsurance } = INSURANCE_RATES_2025;

  // 1. 국민연금 (기준소득월액 상·하한 적용)
  const pensionLimits = month <= 6 ? nationalPension.firstHalf : nationalPension.secondHalf;
  const pensionBase = Math.min(Math.max(monthlyIncome, pensionLimits.min), pensionLimits.max);
  const pensionPremium = Math.floor(pensionBase * nationalPension.rate);

  // 2. 건강보험 (보험료 상·하한 적용)
  let healthPremium = Math.floor(monthlyIncome * healthInsurance.rate);
  healthPremium = Math.max(healthPremium, healthInsurance.minPremium / 2); // 근로자 부담분
  healthPremium = Math.min(healthPremium, healthInsurance.maxPremium / 2); // 근로자 부담분

  // 3. 장기요양보험 (건강보험료의 12.95%)
  const longTermCarePremium = Math.floor(healthPremium * longTermCare.rate);

  // 4. 고용보험 (상·하한 없음)
  const employmentPremium = Math.floor(monthlyIncome * employmentInsurance.rate);

  // 총액
  const totalPremium = pensionPremium + healthPremium + longTermCarePremium + employmentPremium;

  return {
    monthlyIncome,
    month,
    nationalPension: {
      base: pensionBase,
      premium: pensionPremium,
      limits: pensionLimits,
    },
    healthInsurance: {
      premium: healthPremium,
      limits: { min: healthInsurance.minPremium / 2, max: healthInsurance.maxPremium / 2 },
    },
    longTermCare: {
      premium: longTermCarePremium,
      rate: longTermCare.rate,
    },
    employmentInsurance: {
      premium: employmentPremium,
    },
    totalPremium,
    annualTotal: totalPremium * 12,
  };
};

/**
 * 연간 4대보험료 계산 (월별 상·하한 변동 반영)
 */
export const calculateAnnualInsurancePremiums = (monthlyIncome) => {
  let annualTotal = 0;
  const monthlyDetails = [];

  for (let month = 1; month <= 12; month++) {
    const monthly = calculateInsurancePremiums(monthlyIncome, month);
    annualTotal += monthly.totalPremium;
    monthlyDetails.push(monthly);
  }

  return {
    monthlyIncome,
    annualTotal,
    monthlyAverage: Math.floor(annualTotal / 12),
    monthlyDetails,
    // 연말정산용 연간 합계
    annualPension: monthlyDetails.reduce((sum, m) => sum + m.nationalPension.premium, 0),
    annualHealth: monthlyDetails.reduce((sum, m) => sum + m.healthInsurance.premium, 0),
    annualLongTermCare: monthlyDetails.reduce((sum, m) => sum + m.longTermCare.premium, 0),
    annualEmployment: monthlyDetails.reduce((sum, m) => sum + m.employmentInsurance.premium, 0),
  };
};

// =============================================
// 2025년 신규 함수: 월세 세액공제 계산
// =============================================
/**
 * 월세 세액공제 계산 (2025년 기준)
 * - 공제대상 월세액 한도: 1,000만원
 * - 총급여 8천만원 이하 무주택자
 * - 공제율: 5,500만원 이하 17%, 초과 15%
 */
export const calculateRentTaxCredit = ({
  annualRent = 0,           // 연간 월세 총액
  annualIncome = 0,         // 총급여
  isHomeOwner = false,      // 주택 소유 여부
  housingSize = 85,         // 전용면적 (㎡)
  housingPrice = 0,         // 기준시가 (원)
}) => {
  const { maxEligibleRent, maxIncome, rates, incomeThreshold } = RENT_TAX_CREDIT_2025;

  // 조건 체크
  const conditions = {
    isEligible: true,
    reasons: [],
  };

  if (isHomeOwner) {
    conditions.isEligible = false;
    conditions.reasons.push('무주택자만 가능');
  }

  if (annualIncome > maxIncome) {
    conditions.isEligible = false;
    conditions.reasons.push(`총급여 ${(maxIncome / 10000).toLocaleString()}만원 초과`);
  }

  // 국민주택규모 초과 또는 기준시가 4억원 초과 중 하나라도 해당하면 탈락
  if (housingSize > 85 || housingPrice > 400000000) {
    conditions.isEligible = false;
    conditions.reasons.push(
      housingSize > 85 && housingPrice > 400000000
        ? '국민주택규모(85㎡) 및 기준시가 4억원 초과'
        : housingSize > 85
          ? '국민주택규모(85㎡) 초과'
          : '기준시가 4억원 초과',
    );
  }

  if (!conditions.isEligible) {
    return {
      annualRent,
      eligibleRent: 0,
      rate: 0,
      credit: 0,
      maxCredit: 0,
      conditions,
    };
  }

  // 공제 계산
  const eligibleRent = Math.min(annualRent, maxEligibleRent);
  const rate = annualIncome <= incomeThreshold ? rates.under55m : rates.over55m;
  const credit = Math.floor(eligibleRent * rate);
  const maxCredit = annualIncome <= incomeThreshold
    ? Math.floor(maxEligibleRent * rates.under55m)  // 170만원
    : Math.floor(maxEligibleRent * rates.over55m);  // 150만원

  return {
    annualRent,
    eligibleRent,
    rate,
    credit,
    maxCredit,
    conditions,
    // 추가 정보
    incomeCategory: annualIncome <= incomeThreshold ? '5,500만원 이하' : '5,500만원 초과',
    ratePercent: `${(rate * 100).toFixed(0)}%`,
  };
};

/**
 * 혼인 세액공제 (2024~2026년 한정)
 * ⚠️ 세부 요건 미확정으로 기본 로직만 구현
 */
export const calculateMarriageCredit = ({
  isMarriedThisYear = false,  // 해당 연도 혼인신고 여부
  isFirstMarriageCredit = true, // 생애 첫 혼인공제 여부
}) => {
  // TODO: 세부 요건 확정 후 상세 구현
  // - 혼인신고일 vs 귀속연도 기준
  // - 부부 중 1인만 소득 있는 경우
  // - 2024~2026년 한정

  if (!isMarriedThisYear || !isFirstMarriageCredit) {
    return {
      credit: 0,
      reason: !isMarriedThisYear ? '해당 연도 혼인신고 없음' : '이미 혼인공제 적용',
    };
  }

  return {
    credit: 500000, // 본인 기준 50만원
    maxCredit: 1000000, // 부부 합산 100만원
    note: '2024~2026년 혼인신고 시 생애 1회 적용',
  };
};

// =============================================
// 소상공인/사업자 세금 계산 함수
// =============================================

/**
 * 노란우산공제 계산 (2025년 기준)
 * - 소득공제 방식 (세액공제 아님)
 * - 소기업·소상공인, 프리랜서 대상
 * - 법인대표자: 총급여 8천만원 이하만 가능
 *
 * @param {Object} params
 * @param {number} params.annualContribution - 연간 납입액 (원)
 * @param {number} params.businessIncome - 사업소득금액 또는 근로소득금액 (원)
 * @param {string} params.businessType - 'individual' | 'corporate' | 'freelancer'
 * @param {number} params.corporateSalary - 법인대표자의 경우 총급여 (원)
 * @returns {Object} 공제 계산 결과
 */
export const calculateYellowUmbrellaDeduction = ({
  annualContribution = 0,
  businessIncome = 0,
  businessType = 'individual',
  corporateSalary = 0,
}) => {
  const { deductionLimits, contribution, eligibility } = YELLOW_UMBRELLA_DEDUCTION;

  // 가입 자격 체크
  const eligibilityCheck = {
    isEligible: true,
    reasons: [],
  };

  // 법인대표자 급여 기준 체크
  if (businessType === 'corporate') {
    if (!eligibility.corporateCeo.eligible) {
      eligibilityCheck.isEligible = false;
      eligibilityCheck.reasons.push('법인대표자 가입 불가');
    } else if (corporateSalary > eligibility.corporateCeo.maxSalary) {
      eligibilityCheck.isEligible = false;
      eligibilityCheck.reasons.push(
        `법인대표자 총급여 ${(eligibility.corporateCeo.maxSalary / 10000).toLocaleString()}만원 초과`
      );
    }
  }

  // 근로소득자 체크
  if (businessType === 'employee') {
    eligibilityCheck.isEligible = false;
    eligibilityCheck.reasons.push('근로소득자는 가입 불가 (사업소득/프리랜서만)');
  }

  if (!eligibilityCheck.isEligible) {
    return {
      annualContribution,
      deductionLimit: 0,
      actualDeduction: 0,
      taxSavings: 0,
      eligibility: eligibilityCheck,
    };
  }

  // 납입액 유효성 체크
  const validContribution = Math.min(annualContribution, contribution.annualMax);

  // 소득구간별 공제한도 결정
  const incomeForLimit = businessType === 'corporate' ? corporateSalary : businessIncome;
  let deductionLimit = 0;
  let incomeCategory = '';

  for (const bracket of deductionLimits) {
    if (incomeForLimit <= bracket.maxIncome) {
      deductionLimit = bracket.limit;
      incomeCategory = bracket.description;
      break;
    }
  }

  // 실제 공제액 (납입액과 한도 중 작은 값)
  const actualDeduction = Math.min(validContribution, deductionLimit);

  // 예상 절세액 계산 (한계세율 적용)
  const marginalRate = getMarginalTaxRate(incomeForLimit);
  const taxSavings = Math.floor(actualDeduction * marginalRate);

  return {
    annualContribution,
    validContribution,
    deductionLimit,
    actualDeduction,
    incomeCategory,
    marginalRate,
    taxSavings,
    localTaxSavings: Math.floor(taxSavings * 0.1),  // 지방소득세 절감
    totalTaxSavings: Math.floor(taxSavings * 1.1),  // 총 절세액
    eligibility: eligibilityCheck,
    unusedLimit: deductionLimit - actualDeduction,
    deductionType: '소득공제',
  };
};

/**
 * 신용카드 매출 세액공제 계산 (2024~2026년 기준)
 * - 개인사업자만 적용 (법인 제외)
 * - 간이과세자/일반과세자 모두 가능
 *
 * @param {Object} params
 * @param {number} params.annualCardSales - 연간 신용카드/현금영수증 매출액 (원)
 * @param {string} params.businessType - 'individual' | 'corporate'
 * @param {boolean} params.isSimplified - 간이과세자 여부
 * @returns {Object} 세액공제 계산 결과
 */
export const calculateCardSalesTaxCredit = ({
  annualCardSales = 0,
  businessType = 'individual',
  isSimplified = false,
}) => {
  const { meta, rates, annualLimit, eligibility, scheduledChanges } = CARD_SALES_TAX_CREDIT;

  // 적용 자격 체크
  const eligibilityCheck = {
    isEligible: true,
    reasons: [],
  };

  if (businessType === 'corporate') {
    eligibilityCheck.isEligible = false;
    eligibilityCheck.reasons.push('법인사업자는 적용 제외');
  }

  if (!eligibilityCheck.isEligible) {
    return {
      annualCardSales,
      creditAmount: 0,
      appliedRate: 0,
      eligibility: eligibilityCheck,
    };
  }

  // 매출 구간별 공제액 계산
  let totalCredit = 0;
  let remainingSales = annualCardSales;
  const breakdown = [];

  for (const bracket of rates) {
    if (remainingSales <= 0) break;

    const prevMax = rates[rates.indexOf(bracket) - 1]?.maxSales || 0;
    const bracketSales = Math.min(remainingSales, bracket.maxSales - prevMax);

    if (bracketSales > 0 && bracket.rate > 0) {
      const credit = Math.floor(bracketSales * bracket.rate);
      totalCredit += credit;
      breakdown.push({
        sales: bracketSales,
        rate: bracket.rate,
        credit,
        description: bracket.description,
      });
    }

    remainingSales -= bracketSales;
  }

  // 연간 한도 적용
  const finalCredit = Math.min(totalCredit, annualLimit);
  const limitApplied = totalCredit > annualLimit;

  // 2027년 이후 변경 예정 알림
  const scheduledChangeWarning = scheduledChanges?.status === 'scheduled'
    ? `⚠️ ${scheduledChanges.effectiveFrom}부터 공제율 축소 예정 (한도 ${(scheduledChanges.annualLimit / 10000).toLocaleString()}만원)`
    : null;

  return {
    annualCardSales,
    calculatedCredit: totalCredit,
    creditAmount: finalCredit,
    annualLimit,
    limitApplied,
    breakdown,
    effectiveRate: annualCardSales > 0
      ? ((finalCredit / annualCardSales) * 100).toFixed(3)
      : 0,
    eligibility: eligibilityCheck,
    isSimplified,
    meta: {
      effectiveFrom: meta.effectiveFrom,
      effectiveTo: meta.effectiveTo,
    },
    scheduledChangeWarning,
    deductionType: '세액공제',
  };
};

/**
 * 간이과세자 부가세 계산 (업종별 부가가치율 적용)
 *
 * @param {Object} params
 * @param {number} params.annualSales - 연간 매출액 (원)
 * @param {number} params.annualPurchases - 연간 매입액 (원)
 * @param {string} params.industryCode - 업종 코드 (INDUSTRY_VALUE_ADDED_RATES.rates 키)
 * @returns {Object} 부가세 계산 결과
 */
export const calculateSimplifiedVAT = ({
  annualSales = 0,
  annualPurchases = 0,
  industryCode = 'otherServices',
}) => {
  const { rates } = INDUSTRY_VALUE_ADDED_RATES;
  const { threshold, vatExemptThreshold, relief, inputTaxCreditRate } = SIMPLIFIED_TAX_CRITERIA;

  // 업종 정보 조회
  const industry = rates[industryCode] || rates.otherServices;
  const valueAddedRate = industry.rate;
  const vatRate = industry.vatRate;  // 실효세율 (부가가치율 × 10%)

  // 간이과세 적용 가능 여부 체크
  const applicableThreshold = industry.specialThreshold || threshold.general;
  const isEligibleForSimplified = annualSales < applicableThreshold;

  // 부가세 면제 여부 (4,800만원 미만)
  const isVatExempt = annualSales < vatExemptThreshold;

  if (isVatExempt) {
    return {
      annualSales,
      annualPurchases,
      industry: {
        code: industryCode,
        name: industry.name,
        valueAddedRate,
        vatRate,
      },
      isEligibleForSimplified: true,
      isVatExempt: true,
      vatPayable: 0,
      message: `매출 ${(vatExemptThreshold / 10000).toLocaleString()}만원 미만으로 부가세 납부 면제`,
    };
  }

  if (!isEligibleForSimplified) {
    return {
      annualSales,
      annualPurchases,
      industry: {
        code: industryCode,
        name: industry.name,
        valueAddedRate,
        vatRate,
      },
      isEligibleForSimplified: false,
      isVatExempt: false,
      vatPayable: null,
      message: `매출 ${(applicableThreshold / 10000).toLocaleString()}만원 이상으로 일반과세자 전환 필요`,
      recommendedAction: '일반과세자 신고로 전환하세요',
    };
  }

  // 간이과세자 부가세 계산
  // 매출세액 = 매출 × 업종별 부가가치율 × 10%
  const outputVat = Math.floor(annualSales * valueAddedRate * 0.1);

  // 매입세액공제 = 매입세액 × 50%
  const inputVatBeforeCredit = Math.floor(annualPurchases * 0.1);
  const inputVatCredit = Math.floor(inputVatBeforeCredit * inputTaxCreditRate);

  // 납부세액 (경감 전)
  const vatBeforeRelief = Math.max(0, outputVat - inputVatCredit);

  // 납부세액 경감 (50%, 최대 100만원)
  const reliefAmount = Math.min(
    Math.floor(vatBeforeRelief * relief.rate),
    relief.cap
  );

  // 최종 납부세액
  const vatPayable = Math.max(0, vatBeforeRelief - reliefAmount);

  return {
    annualSales,
    annualPurchases,
    industry: {
      code: industryCode,
      name: industry.name,
      valueAddedRate,
      vatRate,
    },
    isEligibleForSimplified: true,
    isVatExempt: false,
    calculation: {
      outputVat,
      inputVatBeforeCredit,
      inputVatCredit,
      vatBeforeRelief,
      reliefAmount,
      reliefRate: relief.rate,
      reliefCap: relief.cap,
    },
    vatPayable,
    effectiveRate: annualSales > 0
      ? ((vatPayable / annualSales) * 100).toFixed(2)
      : 0,
    applicableThreshold,
    overThreshold: annualSales >= applicableThreshold,
    thresholdWarning: annualSales >= applicableThreshold * 0.9
      ? `⚠️ 매출이 간이과세 기준(${(applicableThreshold / 10000).toLocaleString()}만원)의 90% 이상입니다`
      : null,
  };
};

/**
 * 일반과세자 부가세 계산
 *
 * @param {Object} params
 * @param {number} params.annualSales - 연간 매출액 (원)
 * @param {number} params.annualPurchases - 연간 매입액 (원)
 * @param {string} [params.industryCode] - 업종 코드 (선택, 참고용)
 * @returns {Object} 부가세 계산 결과
 */
export const calculateGeneralVAT = ({
  annualSales = 0,
  annualPurchases = 0,
  industryCode = null,
}) => {
  // 일반과세자: 매출세액 - 매입세액
  const outputVat = Math.floor(annualSales * 0.1);
  const inputVat = Math.floor(annualPurchases * 0.1);

  // 납부세액 (음수면 환급)
  const netVat = outputVat - inputVat;
  const vatPayable = Math.max(0, netVat);
  const vatRefund = Math.max(0, -netVat);

  // 업종 정보 (있으면 포함)
  let industryInfo = null;
  if (industryCode) {
    const { rates } = INDUSTRY_VALUE_ADDED_RATES;
    const industry = rates[industryCode];
    if (industry) {
      industryInfo = {
        code: industryCode,
        name: industry.name,
        valueAddedRate: industry.rate,
      };
    }
  }

  return {
    annualSales,
    annualPurchases,
    industry: industryInfo,
    isGeneralTaxpayer: true,
    isSimplified: false,
    calculation: {
      outputVat,
      inputVat,
      netVat,
    },
    vatPayable,
    vatRefund,
    effectiveRate: annualSales > 0
      ? ((vatPayable / annualSales) * 100).toFixed(2)
      : '0.00',
    summary: vatRefund > 0
      ? `환급 예상: ${vatRefund.toLocaleString()}원`
      : `납부 예상: ${vatPayable.toLocaleString()}원`,
  };
};

/**
 * 업종 목록 조회 (UI 드롭다운용)
 * @returns {Array} 업종 목록
 */
export const getIndustryList = () => {
  return INDUSTRY_VALUE_ADDED_RATES.list;
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
  // 2025년 신규 함수
  calculateCreditCardDeduction,
  calculateInsurancePremiums,
  calculateAnnualInsurancePremiums,
  calculateRentTaxCredit,
  calculateMarriageCredit,
  // 소상공인/사업자 세금 함수
  calculateYellowUmbrellaDeduction,
  calculateCardSalesTaxCredit,
  calculateSimplifiedVAT,
  calculateGeneralVAT,
  getIndustryList,
};
