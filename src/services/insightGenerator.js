/**
 * 규칙 기반 AI 공제 추천 인사이트 생성기
 * - 공제 현황, 지출 패턴, 예산 데이터를 분석하여 인사이트 생성
 * - OpenAI 없이 즉시 동작 (무료)
 */

// 인사이트 타입 정의
const INSIGHT_TYPES = {
  CRITICAL: 'critical',      // 긴급 (마감 임박, 한도 초과 등)
  OPPORTUNITY: 'opportunity', // 절세 기회
  WARNING: 'warning',        // 주의 필요
  ACHIEVEMENT: 'achievement', // 달성/긍정적
  INFO: 'info',              // 정보성
};

// 우선순위
const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * 공제 데이터 기반 인사이트 생성
 * @param {Object} deductionTracker - 공제 항목 데이터
 * @param {number} annualIncome - 연소득
 * @param {string} userType - 'individual' | 'business'
 * @returns {Array} 인사이트 배열
 */
export function generateDeductionInsights(deductionTracker, annualIncome = 40000000, userType = 'individual') {
  const insights = [];
  const currentMonth = new Date().getMonth() + 1;
  const remainingMonths = 12 - currentMonth;
  const yearEndDeadline = new Date(new Date().getFullYear(), 11, 31);

  if (!deductionTracker || Object.keys(deductionTracker).length === 0) {
    return insights;
  }

  // 1. 신용카드 vs 체크카드 분석
  const creditCard = deductionTracker.credit_card;
  const debitCard = deductionTracker.debit_card;

  if (creditCard && debitCard) {
    const creditUsage = creditCard.current || 0;
    const creditThreshold = annualIncome * 0.25; // 총급여 25%

    if (creditUsage > creditThreshold) {
      // 신용카드 공제 한도 초과 → 체크카드 전환 권장
      const excessAmount = creditUsage - creditThreshold;
      const potentialSaving = Math.min(excessAmount * 0.15, 450000); // 체크카드 15% 공제

      insights.push({
        id: `insight-card-switch-${Date.now()}`,
        type: INSIGHT_TYPES.OPPORTUNITY,
        category: 'card',
        title: '체크카드 사용 권장',
        description: `신용카드 공제 한도(${formatMoney(creditThreshold)}) 초과! 남은 ${remainingMonths}개월 체크카드 사용 시 추가 ${formatMoney(potentialSaving)} 공제 가능`,
        potential_saving: potentialSaving,
        current_amount: creditUsage,
        threshold: creditThreshold,
        action: '체크카드로 전환하기',
        deadline: yearEndDeadline.toISOString().split('T')[0],
        priority: PRIORITY.HIGH,
      });
    }
  }

  // 2. 의료비 공제 분석
  const medical = deductionTracker.medical;
  if (medical) {
    const medicalThreshold = annualIncome * 0.03; // 총급여 3%
    const medicalCurrent = medical.current || 0;

    if (medicalCurrent < medicalThreshold) {
      const remaining = medicalThreshold - medicalCurrent;
      insights.push({
        id: `insight-medical-threshold-${Date.now()}`,
        type: INSIGHT_TYPES.INFO,
        category: 'medical',
        title: '의료비 공제 기준 안내',
        description: `의료비 공제는 총급여 3%(${formatMoney(medicalThreshold)}) 초과분부터 적용됩니다. 현재 ${formatMoney(medicalCurrent)} 사용 중`,
        potential_saving: 0,
        current_amount: medicalCurrent,
        threshold: medicalThreshold,
        action: '의료비 공제 조건 보기',
        deadline: null,
        priority: PRIORITY.LOW,
      });
    } else {
      // 의료비 공제 가능
      const deductibleAmount = medicalCurrent - medicalThreshold;
      const potentialSaving = Math.round(deductibleAmount * 0.15);
      insights.push({
        id: `insight-medical-eligible-${Date.now()}`,
        type: INSIGHT_TYPES.ACHIEVEMENT,
        category: 'medical',
        title: '의료비 공제 대상',
        description: `의료비 ${formatMoney(medicalCurrent)} 사용으로 ${formatMoney(deductibleAmount)} 공제 가능! 예상 절세 ${formatMoney(potentialSaving)}`,
        potential_saving: potentialSaving,
        current_amount: medicalCurrent,
        threshold: medicalThreshold,
        action: '의료비 영수증 확인',
        deadline: null,
        priority: PRIORITY.MEDIUM,
      });
    }
  }

  // 3. 교육비 공제 분석
  const education = deductionTracker.education;
  if (education) {
    const educationMax = education.maxDeduction || 3000000;
    const educationCurrent = education.current || 0;
    const usageRate = educationCurrent / educationMax;

    if (usageRate < 0.5 && remainingMonths >= 2) {
      const unusedAmount = educationMax - educationCurrent;
      const potentialSaving = Math.round(unusedAmount * 0.15);

      insights.push({
        id: `insight-education-unused-${Date.now()}`,
        type: INSIGHT_TYPES.OPPORTUNITY,
        category: 'education',
        title: '교육비 공제 여유',
        description: `교육비 한도(${formatMoney(educationMax)}) 중 ${Math.round(usageRate * 100)}%만 사용. 자격증/어학 강의 수강 시 추가 ${formatMoney(potentialSaving)} 절세 가능`,
        potential_saving: potentialSaving,
        current_amount: educationCurrent,
        threshold: educationMax,
        action: '교육비 활용 팁 보기',
        deadline: yearEndDeadline.toISOString().split('T')[0],
        priority: PRIORITY.MEDIUM,
      });
    }
  }

  // 4. 연금저축 분석
  const pension = deductionTracker.pension;
  if (pension) {
    const pensionMax = pension.maxDeduction || 4000000;
    const pensionCurrent = pension.current || 0;
    const usageRate = pensionCurrent / pensionMax;

    if (usageRate < 0.8 && remainingMonths >= 1) {
      const unusedAmount = pensionMax - pensionCurrent;
      const potentialSaving = Math.round(unusedAmount * 0.15); // 세액공제 15%

      insights.push({
        id: `insight-pension-recommend-${Date.now()}`,
        type: INSIGHT_TYPES.OPPORTUNITY,
        category: 'pension',
        title: '연금저축 추가 납입 권장',
        description: `연금저축 한도(${formatMoney(pensionMax)}) 중 ${Math.round(usageRate * 100)}% 사용. 연말까지 추가 납입 시 최대 ${formatMoney(potentialSaving)} 세액공제`,
        potential_saving: potentialSaving,
        current_amount: pensionCurrent,
        threshold: pensionMax,
        action: '연금저축 알아보기',
        deadline: yearEndDeadline.toISOString().split('T')[0],
        priority: usageRate < 0.5 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      });
    }
  }

  // 5. 기부금 분석
  const donation = deductionTracker.donation;
  if (donation) {
    const donationCurrent = donation.current || 0;
    if (donationCurrent > 0) {
      const potentialSaving = Math.round(donationCurrent * 0.15);
      insights.push({
        id: `insight-donation-${Date.now()}`,
        type: INSIGHT_TYPES.ACHIEVEMENT,
        category: 'donation',
        title: '기부금 세액공제 대상',
        description: `올해 기부금 ${formatMoney(donationCurrent)} 납입. 예상 세액공제 ${formatMoney(potentialSaving)}`,
        potential_saving: potentialSaving,
        current_amount: donationCurrent,
        threshold: 0,
        action: '기부금 영수증 확인',
        deadline: null,
        priority: PRIORITY.LOW,
      });
    }
  }

  // 6. 연말 마감 임박 경고 (11월 이후)
  if (currentMonth >= 11) {
    const daysLeft = Math.ceil((yearEndDeadline - new Date()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 45 && daysLeft > 0) {
      // 미사용 공제 항목 집계
      const unusedItems = [];
      if (pension && (pension.current || 0) < (pension.maxDeduction || 4000000) * 0.5) {
        unusedItems.push('연금저축');
      }
      if (education && (education.current || 0) < (education.maxDeduction || 3000000) * 0.3) {
        unusedItems.push('교육비');
      }

      if (unusedItems.length > 0) {
        insights.push({
          id: `insight-deadline-warning-${Date.now()}`,
          type: INSIGHT_TYPES.CRITICAL,
          category: 'deadline',
          title: `⚠️ 연말정산 D-${daysLeft}`,
          description: `${unusedItems.join(', ')} 공제 여유분이 있습니다. 연말까지 활용하세요!`,
          potential_saving: 0,
          current_amount: 0,
          threshold: 0,
          action: '공제 현황 확인',
          deadline: yearEndDeadline.toISOString().split('T')[0],
          priority: PRIORITY.HIGH,
        });
      }
    }
  }

  // 우선순위별 정렬 (high → medium → low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}

/**
 * 지출 패턴 기반 인사이트 생성
 * @param {Array} receipts - 영수증 데이터
 * @param {Object} budgets - 예산 데이터
 * @returns {Array} 인사이트 배열
 */
export function generateSpendingInsights(receipts, budgets) {
  const insights = [];

  if (!receipts || receipts.length === 0) {
    return insights;
  }

  // 카테고리별 지출 집계 (현재 월)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySpending = {};
  receipts.forEach(r => {
    const receiptDate = new Date(r.date);
    if (receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear) {
      const category = r.category || '기타';
      monthlySpending[category] = (monthlySpending[category] || 0) + (r.amount || 0);
    }
  });

  // 예산 대비 지출 분석
  Object.entries(monthlySpending).forEach(([category, spent]) => {
    const budget = budgets[category] || 0;
    if (budget > 0) {
      const usageRate = spent / budget;

      if (usageRate > 1.2) {
        // 예산 20% 초과
        insights.push({
          id: `insight-budget-over-${category}-${Date.now()}`,
          type: INSIGHT_TYPES.WARNING,
          category: 'budget',
          title: `${category} 예산 초과`,
          description: `이번 달 ${category} 지출이 예산의 ${Math.round(usageRate * 100)}%입니다. 지출 관리가 필요합니다.`,
          potential_saving: Math.round(spent - budget),
          current_amount: spent,
          threshold: budget,
          action: '지출 내역 확인',
          deadline: null,
          priority: PRIORITY.MEDIUM,
        });
      } else if (usageRate < 0.5 && new Date().getDate() > 20) {
        // 월말인데 예산 50% 미만 사용 → 절약 성공
        insights.push({
          id: `insight-budget-save-${category}-${Date.now()}`,
          type: INSIGHT_TYPES.ACHIEVEMENT,
          category: 'budget',
          title: `${category} 절약 성공!`,
          description: `이번 달 ${category} 예산의 ${Math.round(usageRate * 100)}%만 사용. ${formatMoney(budget - spent)} 절약 중!`,
          potential_saving: budget - spent,
          current_amount: spent,
          threshold: budget,
          action: '절약 팁 보기',
          deadline: null,
          priority: PRIORITY.LOW,
        });
      }
    }
  });

  return insights;
}

/**
 * 모든 규칙 기반 인사이트 통합 생성
 */
export function generateAllInsights(deductionTracker, receipts, budgets, annualIncome, userType) {
  const deductionInsights = generateDeductionInsights(deductionTracker, annualIncome, userType);
  const spendingInsights = generateSpendingInsights(receipts, budgets);

  return [...deductionInsights, ...spendingInsights];
}

// 금액 포맷팅 헬퍼
function formatMoney(amount) {
  if (amount >= 10000) {
    return `${Math.round(amount / 10000)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default {
  generateDeductionInsights,
  generateSpendingInsights,
  generateAllInsights,
};
