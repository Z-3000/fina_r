import React, { useMemo } from 'react';
import {
  Calculator, TrendingUp, User, Briefcase, AlertCircle, CheckCircle,
  Check, PartyPopper, Store, CreditCard, PiggyBank, ChevronDown, Download
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Cell
} from 'recharts';
import {
  BRAND_COLOR, PRIMARY_BLUE, SUCCESS_GREEN, ACCENT_GOLD, ACCENT_COLOR
} from '../../constants/colors';
// 소상공인 세금 계산 함수
import {
  calculateYellowUmbrellaDeduction,
  calculateCardSalesTaxCredit,
  calculateSimplifiedVAT,
  calculateGeneralVAT,
  getIndustryList,
} from '../../services/taxCalculator';

// 차트 색상 상수
const CHART_COLORS = {
  green: '#10B981',
  greenLight: '#34D399',
  red: '#EF4444',
  redLight: '#F87171',
};

const TaxPredictionView = ({
  // 상태
  activeTheme,
  userType,
  isPremium,
  receipts,
  calculatedTaxData,
  // 연말정산 계산기 상태
  calcIncome,
  calcCreditCard,
  calcCashReceipt,
  calcMedical,
  calcEducation,
  calcRefund,
  creditCardRatio,
  // 공제 체크리스트 상태
  checkedDeductions,
  deductionItems,
  deductionCompletionRate,
  totalDeductionSavings,
  // 함수
  setUserType,
  setCalcIncome,
  setCalcCreditCard,
  setCalcCashReceipt,
  setCalcMedical,
  setCalcEducation,
  handleDeductionCheck,
  // 사업자 계산기 상태
  bizCalcState = {},
  handleBizCalcChange = () => {},
  businessTaxData = [],
}) => {
  // 내 자료 불러오기 핸들러 (business_tax_data에서 연간 합산)
  const handleLoadMyData = () => {
    if (businessTaxData && businessTaxData.length > 0) {
      // 월별 income 합산 → 연매출
      const totalIncome = businessTaxData.reduce((sum, d) => sum + (d.income || 0), 0);
      // 월별 expense 합산 → 연매입
      const totalExpense = businessTaxData.reduce((sum, d) => sum + (d.expense || 0), 0);

      if (totalIncome > 0) {
        handleBizCalcChange('annualSales', totalIncome);
      }
      if (totalExpense > 0) {
        handleBizCalcChange('annualPurchases', totalExpense);
      }
      // 간이과세 여부: 연매출 1억400만 미만이면 간이과세 가능
      handleBizCalcChange('isSimplified', totalIncome < 104000000);
    }
  };

  // 불러올 데이터 존재 여부
  const hasDataToLoad = businessTaxData && businessTaxData.length > 0;

  const currentMonth = new Date().getMonth();

  // 공제 미적용 누적값 계산
  const taxDataWithCumulative = useMemo(() => {
    let noDeductionCumulative = 0;
    return calculatedTaxData.map((d, idx) => {
      noDeductionCumulative += (d.noDeductionTax || 0);
      return {
        ...d,
        noDeductionCumulative,
      };
    });
  }, [calculatedTaxData]);

  const taxData = taxDataWithCumulative;
  const totalActualTax = taxData.slice(0, currentMonth + 1).reduce((sum, d) => sum + (d.monthlyTax || 0), 0);
  const totalPredictedTax = taxData.slice(currentMonth + 1).reduce((sum, d) => sum + (d.predictedTax || 0), 0);

  // 업종 목록
  const industryList = useMemo(() => getIndustryList(), []);

  // 사업자 세금 계산 결과
  const bizCalcResults = useMemo(() => {
    const {
      annualSales = 0,
      annualPurchases = 0,
      cardSalesRatio = 80,
      industryCode = 'restaurant',
      isSimplified = true,
      yellowUmbrellaContribution = 0,
    } = bizCalcState;

    const businessIncome = annualSales - annualPurchases;
    const cardSales = Math.floor(annualSales * (cardSalesRatio / 100));

    // 부가세 계산 (간이/일반 분기)
    let vatResult;
    if (isSimplified) {
      // 간이과세자 부가세
      vatResult = calculateSimplifiedVAT({
        annualSales,
        annualPurchases,
        industryCode,
      });
    } else {
      // 일반과세자 부가세 (서비스 함수 사용)
      vatResult = calculateGeneralVAT({
        annualSales,
        annualPurchases,
        industryCode,
      });
    }

    // 신용카드 매출 세액공제
    const cardCreditResult = calculateCardSalesTaxCredit({
      annualCardSales: cardSales,
      businessType: 'individual',
      isSimplified,
    });

    // 노란우산공제
    const umbrellaResult = calculateYellowUmbrellaDeduction({
      annualContribution: yellowUmbrellaContribution,
      businessIncome,
      businessType: 'individual',
    });

    // 총 절세액 (간이과세자만 경감액 포함)
    const vatRelief = isSimplified ? (vatResult.calculation?.reliefAmount || 0) : 0;
    const totalSavings =
      (cardCreditResult.creditAmount || 0) +
      (umbrellaResult.totalTaxSavings || 0) +
      vatRelief;

    return {
      businessIncome,
      cardSales,
      vat: vatResult,
      cardCredit: cardCreditResult,
      umbrella: umbrellaResult,
      totalSavings,
      isSimplified,
    };
  }, [bizCalcState]);

  return (
    <div className="space-y-6">
      {/* User Type Selector - 항상 맨 위에 표시 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">사용자 유형 선택</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setUserType('individual')}
            className={`p-6 rounded-xl border-2 transition ${userType === 'individual' ? '' : 'border-gray-200 hover:border-gray-300'}`}
            style={userType === 'individual' ? { borderColor: PRIMARY_BLUE, backgroundColor: `${PRIMARY_BLUE}10` } : {}}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : '#E5E7EB' }}
              >
                <User className={`w-6 h-6 ${userType === 'individual' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">개인</div>
                <div className="text-sm text-gray-600">직장인, 프리랜서</div>
              </div>
            </div>
            <div className="text-left text-sm text-gray-600">
              종합소득세, 연말정산, 개인 지출 관리에 최적화
            </div>
          </button>

          <button
            onClick={() => setUserType('business')}
            className={`p-6 rounded-xl border-2 transition ${userType === 'business' ? '' : 'border-gray-200 hover:border-gray-300'}`}
            style={userType === 'business' ? { borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` } : {}}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: userType === 'business' ? BRAND_COLOR : '#E5E7EB' }}
              >
                <Briefcase className={`w-6 h-6 ${userType === 'business' ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">사업자</div>
                <div className="text-sm text-gray-600">소상공인, 1인 사업자</div>
              </div>
            </div>
            <div className="text-left text-sm text-gray-600">
              부가세, 법인세, 사업 현금 흐름 관리에 최적화
            </div>
          </button>
        </div>
      </div>

      {/* 연말정산 계산기 (슬라이더 기반) - 개인만 표시 */}
      {userType === 'individual' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6" style={{ color: activeTheme.primary }} />
            <h3 className="font-bold text-xl">연말정산 계산기</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="space-y-6">
              {/* 총급여 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">총급여액</label>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcIncome.toLocaleString()}원</span>
                </div>
                <input
                  type="range"
                  min={20000000}
                  max={150000000}
                  step={1000000}
                  value={calcIncome}
                  onChange={(e) => setCalcIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2천만원</span>
                  <span>1억5천만원</span>
                </div>
              </div>

              {/* 신용카드 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">신용카드 사용액</label>
                  <span className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>{creditCardRatio}%</span>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcCreditCard.toLocaleString()}원</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={calcIncome}
                  step={100000}
                  value={calcCreditCard}
                  onChange={(e) => setCalcCreditCard(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 현금영수증 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">현금영수증</label>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcCashReceipt.toLocaleString()}원</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000000}
                  step={100000}
                  value={calcCashReceipt}
                  onChange={(e) => setCalcCashReceipt(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* 의료비 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">의료비</label>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcMedical.toLocaleString()}원</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000000}
                  step={100000}
                  value={calcMedical}
                  onChange={(e) => setCalcMedical(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* 교육비 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">교육비</label>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcEducation.toLocaleString()}원</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000000}
                  step={100000}
                  value={calcEducation}
                  onChange={(e) => setCalcEducation(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>

            {/* 결과 섹션 */}
            <div className="space-y-4">
              {/* 예상 환급액 */}
              <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
                <div className="text-sm opacity-90 mb-2">예상 환급액</div>
                <div className="text-4xl font-bold mb-2">{calcRefund.toLocaleString()}원</div>
                <div className="flex items-center gap-1 text-sm opacity-90">
                  <TrendingUp className="w-4 h-4" />
                  <span>작년 대비 예상 증가율 +12%</span>
                </div>
              </div>

              {/* 공제 항목 요약 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="font-semibold text-gray-800 mb-3">공제 항목 요약</div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">신용카드 공제</span>
                  <span className="font-semibold">{Math.floor(calcCreditCard * 0.15).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">현금영수증 공제</span>
                  <span className="font-semibold">{Math.floor(calcCashReceipt * 0.3).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">의료비 공제</span>
                  <span className="font-semibold">{Math.floor(calcMedical * 0.15).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">교육비 공제</span>
                  <span className="font-semibold">{Math.floor(calcEducation * 0.15).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-3 rounded-lg px-3 mt-2" style={{ backgroundColor: `${PRIMARY_BLUE}15` }}>
                  <span className="font-bold" style={{ color: BRAND_COLOR }}>총 공제액</span>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>
                    {Math.floor(calcCreditCard * 0.15 + calcCashReceipt * 0.3 + calcMedical * 0.15 + calcEducation * 0.15).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 절세 팁 */}
              {calcCreditCard < calcIncome * 0.25 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-900 mb-1">절세 팁</div>
                      <p className="text-sm text-orange-700">
                        신용카드 사용액을 총급여의 25% 이상으로 늘리면 추가 공제를 받을 수 있습니다.
                      </p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                        추가 절세 가능액: {Math.floor((calcIncome * 0.25 - calcCreditCard) * 0.15).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tax Prediction Chart - 복합형 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {userType === 'individual' ? '월별 세금 분석 (개인)' : '월별 세금 분석 (사업자)'}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">실시간 계산</span>
            <span>영수증 {receipts.length}건 반영</span>
          </div>
        </div>

        {/* 범례 설명 */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.primary }}></span>
            납부 세금
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: ACCENT_GOLD }}></span>
            예상 세금
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-0.5" style={{ backgroundColor: CHART_COLORS.green }}></span>
            누적 세금
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS.red }}></span>
            공제 미적용 누적
          </span>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={taxData}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
              tick={{ fontSize: 11 }}
              stroke={CHART_COLORS.green}
            />
            <Tooltip
              formatter={(value, name) => {
                if (value === null) return ['-', name];
                return [`${value.toLocaleString()}원`, name];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <ReferenceLine
              x={`${currentMonth + 1}월`}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{ value: '현재', position: 'top', fontSize: 10, fill: '#6B7280' }}
              yAxisId="left"
            />

            <Bar yAxisId="left" dataKey="monthlyTax" fill={activeTheme.primary} name="납부 세금" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="predictedTax" fill={ACCENT_GOLD} name="예상 세금" radius={[4, 4, 0, 0]} />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="predictedCumulative"
              stroke={CHART_COLORS.green}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.green }}
              name="누적 세금"
              connectNulls
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="noDeductionCumulative"
              stroke={CHART_COLORS.red}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name={userType === 'individual' ? '공제 미적용 누적' : '경비공제 미적용 누적'}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* 요약 카드 */}
        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-lg p-3" style={{ backgroundColor: activeTheme.soft }}>
            <div className="text-xs text-gray-600 mb-1">납부 완료 (1~{currentMonth + 1}월)</div>
            <div className="text-xl font-bold tabular-nums text-right" style={{ color: activeTheme.primary }}>{totalActualTax.toLocaleString()}원</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255, 215, 0, 0.12)' }}>
            <div className="text-xs text-gray-600 mb-1">예상 납부 ({currentMonth + 2}~12월)</div>
            <div className="text-xl font-bold tabular-nums text-right" style={{ color: ACCENT_GOLD }}>{totalPredictedTax.toLocaleString()}원</div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${CHART_COLORS.green}12` }}>
            <div className="text-xs text-gray-600 mb-1">연간 총 예상</div>
            <div className="text-xl font-bold tabular-nums text-right" style={{ color: CHART_COLORS.green }}>
              {(taxData[11]?.predictedCumulative || 0).toLocaleString()}원
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: `${CHART_COLORS.red}12` }}>
            <div className="text-xs text-gray-600 mb-1">공제로 절감액</div>
            <div className="text-xl font-bold tabular-nums text-right" style={{ color: CHART_COLORS.red }}>
              {taxData.reduce((sum, d) => sum + (d.savings || 0), 0).toLocaleString()}원
            </div>
          </div>
        </div>
      </div>

      {/* 사업자 세금 계산기 - 사업자만 표시 */}
      {userType === 'business' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          {/* 제목 + 면책 라벨 */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Store className="w-6 h-6" style={{ color: activeTheme.primary }} />
            <h3 className="font-bold text-xl">소상공인 세금 계산기</h3>
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">2025년 기준</span>
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              단순 추정 · 특례 미반영
            </span>
          </div>
          {/* 내 자료 불러오기 */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleLoadMyData}
              disabled={!hasDataToLoad}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                hasDataToLoad
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              내 자료 불러오기
            </button>
            <span className="text-xs text-gray-500">
              {hasDataToLoad
                ? `월별 매출/매입 데이터 (${businessTaxData.length}개월) 합산`
                : '불러올 데이터가 없습니다'}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* 입력 섹션 */}
            <div className="space-y-5">
              {/* 연매출 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">연매출</label>
                  <span className="font-bold" style={{ color: PRIMARY_BLUE }}>
                    {(bizCalcState.annualSales || 0).toLocaleString()}원
                  </span>
                </div>
                <input
                  type="range"
                  min={10000000}
                  max={200000000}
                  step={5000000}
                  value={bizCalcState.annualSales || 80000000}
                  onChange={(e) => handleBizCalcChange('annualSales', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1천만</span>
                  <span>2억</span>
                </div>
              </div>

              {/* 연매입 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">연매입 (필요경비)</label>
                  <span className="font-bold" style={{ color: ACCENT_COLOR }}>
                    {(bizCalcState.annualPurchases || 0).toLocaleString()}원
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100000000}
                  step={1000000}
                  value={bizCalcState.annualPurchases || 20000000}
                  onChange={(e) => handleBizCalcChange('annualPurchases', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0원</span>
                  <span>1억</span>
                </div>
              </div>

              {/* 업종 선택 */}
              <div>
                <label className="font-semibold text-gray-700 block mb-2">업종</label>
                <div className="relative">
                  <select
                    value={bizCalcState.industryCode || 'restaurant'}
                    onChange={(e) => handleBizCalcChange('industryCode', e.target.value)}
                    className="w-full p-3 pr-10 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {industryList.map((ind) => (
                      <option key={ind.code} value={ind.code}>
                        {ind.name} (부가가치율 {(ind.rate * 100).toFixed(0)}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 카드매출 비율 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700">카드/현금영수증 매출 비율</label>
                  <span className="font-bold text-emerald-600">{bizCalcState.cardSalesRatio || 80}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={bizCalcState.cardSalesRatio || 80}
                  onChange={(e) => handleBizCalcChange('cardSalesRatio', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* 노란우산공제 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-gray-700 flex items-center gap-1">
                    <PiggyBank className="w-4 h-4" />
                    노란우산공제 연납입액
                  </label>
                  <span className="font-bold" style={{ color: ACCENT_GOLD }}>
                    {(bizCalcState.yellowUmbrellaContribution || 0).toLocaleString()}원
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12000000}
                  step={100000}
                  value={bizCalcState.yellowUmbrellaContribution || 0}
                  onChange={(e) => handleBizCalcChange('yellowUmbrellaContribution', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0원</span>
                  <span>월 100만 (연 1,200만)</span>
                </div>
              </div>

              {/* 간이과세 여부 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">간이과세자 여부</span>
                <button
                  onClick={() => handleBizCalcChange('isSimplified', !bizCalcState.isSimplified)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    bizCalcState.isSimplified ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      bizCalcState.isSimplified ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 결과 섹션 */}
            <div className="space-y-4">
              {/* 사업소득 */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: `${PRIMARY_BLUE}08` }}>
                <div className="text-sm text-gray-600 mb-1">사업소득 (매출 - 매입)</div>
                <div className="text-2xl font-bold" style={{ color: PRIMARY_BLUE }}>
                  {bizCalcResults.businessIncome.toLocaleString()}원
                </div>
              </div>

              {/* 부가세 (간이/일반 분기) */}
              <div className="p-4 rounded-xl border" style={{ borderColor: activeTheme.soft }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: activeTheme.soft }}>
                    <Calculator className="w-4 h-4" style={{ color: activeTheme.primary }} />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {bizCalcResults.isSimplified ? '간이과세 부가세' : '일반과세 부가세'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bizCalcResults.isSimplified
                        ? `${bizCalcResults.vat.industry?.name} (부가가치율 ${((bizCalcResults.vat.industry?.valueAddedRate || 0) * 100).toFixed(0)}%)`
                        : '매출세액 - 매입세액'}
                    </div>
                  </div>
                </div>
                {bizCalcResults.vat.isGeneralTaxpayer ? (
                  // 일반과세자
                  <>
                    <div className="text-2xl font-bold" style={{ color: activeTheme.primary }}>
                      {(bizCalcResults.vat.vatPayable || 0).toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      매출세액 {(bizCalcResults.vat.calculation?.outputVat || 0).toLocaleString()}원
                      - 매입세액 {(bizCalcResults.vat.calculation?.inputVat || 0).toLocaleString()}원
                    </div>
                    {(bizCalcResults.vat.vatRefund || 0) > 0 && (
                      <div className="text-sm text-emerald-600 mt-1">
                        환급 예상: {bizCalcResults.vat.vatRefund.toLocaleString()}원
                      </div>
                    )}
                  </>
                ) : bizCalcResults.vat.isVatExempt ? (
                  <div className="text-lg font-bold text-emerald-600">납부 면제 (4,800만 미만)</div>
                ) : bizCalcResults.vat.isEligibleForSimplified === false ? (
                  <div className="text-lg font-bold text-orange-600">
                    매출 {((bizCalcResults.vat.applicableThreshold || 104000000) / 10000).toLocaleString()}만원 이상 - 일반과세자 전환 필요
                  </div>
                ) : (
                  // 간이과세자
                  <>
                    <div className="text-2xl font-bold" style={{ color: activeTheme.primary }}>
                      {(bizCalcResults.vat.vatPayable || 0).toLocaleString()}원
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      경감액: {(bizCalcResults.vat.calculation?.reliefAmount || 0).toLocaleString()}원 (50%, 최대 100만)
                    </div>
                  </>
                )}
              </div>

              {/* 신용카드 매출 세액공제 */}
              <div className="p-4 rounded-xl border" style={{ borderColor: `${SUCCESS_GREEN}40` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${SUCCESS_GREEN}20` }}>
                    <CreditCard className="w-4 h-4" style={{ color: SUCCESS_GREEN }} />
                  </div>
                  <div>
                    <div className="font-semibold">신용카드 매출 세액공제</div>
                    <div className="text-xs text-gray-500">카드매출 {bizCalcResults.cardSales.toLocaleString()}원</div>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: SUCCESS_GREEN }}>
                  -{(bizCalcResults.cardCredit.creditAmount || 0).toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {bizCalcResults.cardCredit.breakdown?.length
                    ? bizCalcResults.cardCredit.breakdown.map((b, i) => (
                        <span key={i}>{i > 0 && ' + '}{b.description}</span>
                      ))
                    : '공제율 1.3%'}
                  {' | 한도 '}{((bizCalcResults.cardCredit.annualLimit || 10000000) / 10000).toLocaleString()}만원
                  {bizCalcResults.cardCredit.limitApplied && ' (한도 적용)'}
                </div>
              </div>

              {/* 노란우산공제 절세액 */}
              <div className="p-4 rounded-xl border" style={{ borderColor: `${ACCENT_GOLD}40` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT_GOLD}20` }}>
                    <PiggyBank className="w-4 h-4" style={{ color: ACCENT_GOLD }} />
                  </div>
                  <div>
                    <div className="font-semibold">노란우산공제 절세</div>
                    <div className="text-xs text-gray-500">
                      소득공제 {(bizCalcResults.umbrella.actualDeduction || 0).toLocaleString()}원
                      ({bizCalcResults.umbrella.incomeCategory || ''})
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: ACCENT_GOLD }}>
                  -{(bizCalcResults.umbrella.totalTaxSavings || 0).toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  한계세율 {((bizCalcResults.umbrella.marginalRate || 0) * 100).toFixed(0)}% 적용
                </div>
              </div>

              {/* 총 절세액 */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: `${SUCCESS_GREEN}12` }}>
                <div className="text-sm text-gray-600 mb-1">예상 총 절세액</div>
                <div className="text-3xl font-bold" style={{ color: SUCCESS_GREEN }}>
                  {bizCalcResults.totalSavings.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ※ 실제 세금은 종합소득세 신고 시 확정됩니다
                </div>
              </div>
            </div>
          </div>

          {/* 경고/안내 메시지 */}
          {bizCalcResults.vat.thresholdWarning && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              {bizCalcResults.vat.thresholdWarning}
            </div>
          )}
          {bizCalcResults.cardCredit.scheduledChangeWarning && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              {bizCalcResults.cardCredit.scheduledChangeWarning}
            </div>
          )}
        </div>
      )}

      {/* Business Specific: Cash Flow */}
      {userType === 'business' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">사업 현금 흐름 분석</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={taxData.slice(0, currentMonth + 1).map(d => ({
                ...d,
                netProfit: (d.income || 0) - (d.expense || 0),
              }))}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value.toLocaleString()}원`,
                  name === 'netProfit' ? '순이익' : name
                ]}
                contentStyle={{ borderRadius: '8px', border: `1px solid ${activeTheme.soft}` }}
              />
              <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
              <Bar
                dataKey="netProfit"
                name="순이익 (수입-지출)"
                radius={[6, 6, 6, 6]}
              >
                {taxData.slice(0, currentMonth + 1).map((entry, index) => {
                  const netProfit = (entry.income || 0) - (entry.expense || 0);
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={netProfit >= 0 ? activeTheme.primary : ACCENT_COLOR}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.primary }}></div>
              <span className="text-gray-600">흑자</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: ACCENT_COLOR }}></div>
              <span className="text-gray-600">적자</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights for Tax */}
      {isPremium && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-red-900">주의 필요</h3>
                <p className="text-sm text-red-800 mb-2">
                  {userType === 'individual'
                    ? '현재 추세대로 지출 시, 연말 종합소득세가 예상보다 20만원 높을 것으로 예상됩니다.'
                    : '다음 분기 부가세 신고액이 전 분기 대비 15% 증가할 것으로 예상됩니다.'}
                </p>
                <p className="text-xs text-red-700">
                  • 도서/교육비 증액으로 세액공제 활용 권장
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-green-900">절세 기회</h3>
                <p className="text-sm text-green-800 mb-2">
                  {userType === 'individual'
                    ? '도서/교육 카테고리 지출을 늘리면 연간 최대 30만원 세액공제 가능합니다.'
                    : '업무용 장비 구매를 6월에 진행하면 상반기 부가세 환급액이 증가합니다.'}
                </p>
                <p className="text-xs text-green-700">
                  • 현재 공제 한도 대비 65% 활용 중
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 10 공제항목 체크리스트 - 개인만 표시 */}
      {userType === 'individual' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-lg">TOP 10 공제항목 체크</h3>
            </div>
            <span className="text-sm text-gray-500">{checkedDeductions.length}/10 확인</span>
          </div>

          {/* 진행 상태 바 */}
          <div className="rounded-lg p-4 mb-4 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">진행률</span>
              <span className="font-bold">{deductionCompletionRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="h-2 bg-white rounded-full transition-all"
                style={{ width: `${deductionCompletionRate}%` }}
              />
            </div>
            <div className="mt-2 text-sm">
              예상 절세액: <span className="font-bold">{(totalDeductionSavings / 10000).toFixed(0)}만원</span>
            </div>
          </div>

          {/* 체크리스트 */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {deductionItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleDeductionCheck(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                  checkedDeductions.includes(item.id)
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  checkedDeductions.includes(item.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300'
                }`}>
                  {checkedDeductions.includes(item.id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold text-white">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.tips}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">
                    {(item.estimatedSaving / 10000).toFixed(0)}만원
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deductionCompletionRate === 100 && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
              <PartyPopper className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-800">모든 항목 확인 완료!</div>
              <div className="text-sm text-green-700">
                총 예상 절세액: {(totalDeductionSavings / 10000).toFixed(0)}만원
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxPredictionView;
