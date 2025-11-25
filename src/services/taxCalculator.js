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
const DONATION_TIER_THRESHOLD = 10000000; // 기부금 세액공제 1,000만원 구간

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
export const calculateMedicalDeduction = (totalIncome, medicalExpenses, hasInfertility = false) => {
  const threshold = totalIncome * SPECIAL_DEDUCTION_LIMITS.medical.threshold;
  const excessAmount = Math.max(0, medicalExpenses - threshold);
  const rate = hasInfertility ? SPECIAL_DEDUCTION_LIMITS.medical.maxRate : SPECIAL_DEDUCTION_LIMITS.medical.rate;

  return Math.min(
    Math.floor(excessAmount * rate),
    SPECIAL_DEDUCTION_LIMITS.medical.limit
  );
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

  // 법정기부금 (소득 100%까지, 1천만원 초과분 30%)
  if (donations.legal) {
    totalDeduction += applyTieredCredit(donations.legal, cappedIncome);
  }

  // 지정기부금 (소득의 30%까지, 1천만원 초과분 30%)
  if (donations.designated) {
    const limit = cappedIncome * 0.30;
    totalDeduction += applyTieredCredit(donations.designated, limit);
  }

  // 종교단체 (소득의 10%까지, 1천만원 초과분 30%)
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
}) => {
  // 1. 근로소득공제
  const earnedIncomeDeduction = calculateEarnedIncomeDeduction(annualIncome);

  // 2. 근로소득금액
  const earnedIncome = annualIncome - earnedIncomeDeduction;

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

  // 5. 과세표준
  const taxableIncome = Math.max(0, earnedIncome - personalDeductions - specialDeductions - housingDeduction);

  // 6. 산출세액
  const calculatedTax = calculateIncomeTax(taxableIncome);

  // 7. 세액공제
  const taxCredits =
    calculateMedicalDeduction(annualIncome, medicalExpenses) +
    calculateEducationDeduction(educationExpenses) +
    calculateDonationDeduction(donations, earnedIncome) +
    calculatePensionDeduction(pensionSavings, irpAmount, annualIncome);

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
    annualIncome,
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
};
