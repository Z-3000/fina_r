import React from 'react';
import { X, Sparkles, Calculator, Download, RefreshCw, GraduationCap, Heart, Shield, CreditCard, Home } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';
import { CHART_COLORS } from '../../constants/charts';

/**
 * 연말정산 시뮬레이터 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {object} taxSimulatorData - 세금 시뮬레이터 입력 데이터
 * @param {function} setTaxSimulatorData - 세금 시뮬레이터 데이터 설정 함수
 * @param {object|null} taxSimulatorResult - 계산 결과
 * @param {function} setTaxSimulatorResult - 결과 설정 함수
 * @param {boolean} showTaxAdvanced - 세부 특례 표시 여부
 * @param {function} setShowTaxAdvanced - 세부 특례 표시 설정 함수
 * @param {function} loadFromAppData - 앱 데이터 불러오기 핸들러
 * @param {function} calculateTaxSimulation - 세금 계산 핸들러
 * @param {function} generatePDFReport - PDF 리포트 생성 핸들러
 */
const TaxSimulatorModal = ({
  isOpen,
  onClose,
  taxSimulatorData,
  setTaxSimulatorData,
  taxSimulatorResult,
  setTaxSimulatorResult,
  showTaxAdvanced,
  setShowTaxAdvanced,
  loadFromAppData,
  calculateTaxSimulation,
  generatePDFReport
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    setTaxSimulatorData({
      annualIncome: 0,
      dependents: 0,
      childDependents: 0,
      hasSpouse: false,
      medicalExpenses: 0,
      medicalGeneral: 0,
      medicalInfertility: 0,
      medicalSenior: 0,
      educationTotal: 0,
      educationSelf: 0,
      educationChild: 0,
      educationUniversity: 0,
      pensionSavings: 0,
      irpAmount: 0,
      donationsSimple: 0,
      donationsLegal: 0,
      donationsDesignated: 0,
      donationsReligious: 0,
      donationsPolitical: 0,
      insuranceNational: 0,
      insuranceHealth: 0,
      insuranceEmployment: 0,
      housingDeduction: 0,
      creditCardTotal: 0,
      creditCardAmount: 0,
      debitCardAmount: 0,
      cashReceiptAmount: 0,
      traditionalMarketAmount: 0,
      publicTransportAmount: 0,
      cultureAmount: 0,
      sportsAmount: 0,
      previousYearCardTotal: 0,
      annualRent: 0,
      isHomeOwner: false,
      housingSize: 85,
    });
    setTaxSimulatorResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="tax-simulator-modal relative bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-6 h-6" />
        </button>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold nowrap">연말정산 시뮬레이터</h3>
              <span className="tag-nowrap text-xs px-2 py-1 rounded-full border" style={{ backgroundColor: `${PRIMARY_BLUE}15`, color: PRIMARY_BLUE, borderColor: `${PRIMARY_BLUE}30` }}>예상치 · 교육용</span>
              <span className="tag-nowrap text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">홈택스 신고 전 검증 필요</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-orange-700">
              <span className="tag-nowrap tight-spacing px-2 py-1 bg-orange-50 border border-orange-200 rounded">의료·교육 특례 인별 한도 미반영(난임 제외)</span>
              <span className="tag-nowrap tight-spacing px-2 py-1 bg-orange-50 border border-orange-200 rounded">보험료·기부금 세부 규정 단순화</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">소득 정보</h4>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">연간 총급여</label>
              <input
                type="number"
                value={taxSimulatorData.annualIncome}
                onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, annualIncome: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="50,000,000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">부양가족 수</label>
                <input
                  type="number"
                  value={taxSimulatorData.dependents}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, dependents: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxSimulatorData.hasSpouse}
                    onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, hasSpouse: e.target.checked })}
                    className="w-5 h-5 text-blue-500 rounded"
                  />
                  <span className="text-sm">배우자 공제</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">자녀 수 (선택)</label>
              <input
                type="number"
                value={taxSimulatorData.childDependents}
                onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, childDependents: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1 keep-all">미입력 시 부양가족 수와 동일하게 계산합니다.</p>
            </div>

            <h4 className="font-semibold text-gray-700 pt-2">간단 입력</h4>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">의료비 (합계)</label>
              <input
                type="number"
                value={taxSimulatorData.medicalExpenses}
                onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, medicalExpenses: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1 keep-all">세부 의료비 입력 시 이 값 대신 합산이 사용됩니다.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">교육비 (합계)</label>
                <input
                  type="number"
                  value={taxSimulatorData.educationTotal}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, educationTotal: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">기부금 (합계)</label>
                <input
                  type="number"
                  value={taxSimulatorData.donationsSimple}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, donationsSimple: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 신용카드 사용액 (2025년 신규) */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                신용카드 등 사용액 (총액)
                <span className="text-xs text-gray-400 ml-1">세부 입력 시 무시됨</span>
              </label>
              <input
                type="number"
                value={taxSimulatorData.creditCardTotal}
                onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, creditCardTotal: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="연간 카드 사용 총액"
              />
              <p className="text-xs text-gray-500 mt-1 keep-all">세부 특례에서 결제수단별 입력 시 더 정확한 계산 가능</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">연금저축</label>
                <input
                  type="number"
                  value={taxSimulatorData.pensionSavings}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, pensionSavings: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">2025: 600만원 한도</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">IRP</label>
                <input
                  type="number"
                  value={taxSimulatorData.irpAmount}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, irpAmount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">연금저축 포함 900만원</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">주택자금 공제</label>
                <input
                  type="number"
                  value={taxSimulatorData.housingDeduction}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, housingDeduction: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  월세 (연간)
                  <span className="text-xs text-teal-600 ml-1">세액공제</span>
                </label>
                <input
                  type="number"
                  value={taxSimulatorData.annualRent}
                  onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, annualRent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">무주택자 8천만원 이하, 한도 1천만원</p>
              </div>
            </div>

            {/* 세부 특례 토글 버튼 */}
            <button
              onClick={() => setShowTaxAdvanced(!showTaxAdvanced)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2 keep-all"
            >
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="tight-spacing">{showTaxAdvanced ? '세부 특례 접기' : '세부 특례 입력 (의료비/교육비/기부금/신용카드 세부)'}</span>
            </button>

            {showTaxAdvanced && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <h5 className="font-semibold text-gray-700">의료비 특례(요약 입력)</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 h-4 leading-4">일반</label>
                      <input
                        type="number"
                        value={taxSimulatorData.medicalGeneral}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, medicalGeneral: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 h-4 leading-4">난임(20%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.medicalInfertility}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, medicalInfertility: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 h-4 leading-4 nowrap tight-spacing" title="65세 이상/장애인/3자녀 이상">65세↑장애</label>
                      <input
                        type="number"
                        value={taxSimulatorData.medicalSenior}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, medicalSenior: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 keep-all">인별/항목 한도는 단순 합산으로 반영됩니다.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <h5 className="font-semibold text-gray-700">교육비 세부 입력</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">본인</label>
                      <input
                        type="number"
                        value={taxSimulatorData.educationSelf}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, educationSelf: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">자녀(초·중·고)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.educationChild}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, educationChild: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">대학/대학원</label>
                      <input
                        type="number"
                        value={taxSimulatorData.educationUniversity}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, educationUniversity: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 keep-all">인별 한도/특례(장애, 다자녀)는 간략 합산으로만 반영됩니다.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h5 className="font-semibold text-gray-700">기부금 구분</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">법정</label>
                      <input
                        type="number"
                        value={taxSimulatorData.donationsLegal}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, donationsLegal: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">지정</label>
                      <input
                        type="number"
                        value={taxSimulatorData.donationsDesignated}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, donationsDesignated: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">종교</label>
                      <input
                        type="number"
                        value={taxSimulatorData.donationsReligious}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, donationsReligious: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">정치자금</label>
                      <input
                        type="number"
                        value={taxSimulatorData.donationsPolitical}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, donationsPolitical: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 keep-all">소득 대비 한도/종교 구분은 단순 합산으로 계산됩니다.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <h5 className="font-semibold text-gray-700">4대보험 (자동 계산)</h5>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">2025년 요율</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 h-4 leading-4">국민연금</div>
                      <div className="font-semibold text-emerald-700">{(taxSimulatorData.insuranceNational || 0).toLocaleString()}원</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 h-4 leading-4 nowrap" title="건강보험+장기요양보험">건강+요양</div>
                      <div className="font-semibold text-emerald-700">{(taxSimulatorData.insuranceHealth || 0).toLocaleString()}원</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500 h-4 leading-4">고용보험</div>
                      <div className="font-semibold text-emerald-700">{(taxSimulatorData.insuranceEmployment || 0).toLocaleString()}원</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 keep-all">총급여 기준 자동 계산 (국민연금 4.5%, 건강 3.545%, 장기요양 12.95%, 고용 0.9%)</p>
                </div>

                {/* 신용카드 결제수단별 세부 입력 (2025년 신규) */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-violet-500" />
                    <h5 className="font-semibold text-gray-700">신용카드 등 결제수단별</h5>
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">2025 3중한도</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">신용카드 (15%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.creditCardAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, creditCardAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">체크카드 (30%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.debitCardAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, debitCardAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">현금영수증 (30%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.cashReceiptAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, cashReceiptAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">전통시장 (40%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.traditionalMarketAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, traditionalMarketAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">대중교통 (40%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.publicTransportAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, publicTransportAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">문화비 (30%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.cultureAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, cultureAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">체육시설 (30%)</label>
                      <input
                        type="number"
                        value={taxSimulatorData.sportsAmount}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, sportsAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">전년도 총액</label>
                      <input
                        type="number"
                        value={taxSimulatorData.previousYearCardTotal}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, previousYearCardTotal: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-gray-400 text-sm"
                        placeholder="소비증가분용"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    기본한도(7천만↓300만) + 추가한도(시장·교통·문화·체육 300만) + 소비증가분(100만)
                  </p>
                  <p className="text-[10px] text-orange-600 mt-0.5">
                    ※ 7천만원 초과 시 문화비·체육시설은 추가한도 제외
                  </p>
                </div>

                {/* 월세 세액공제 세부 옵션 */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-teal-500" />
                    <h5 className="font-semibold text-gray-700">월세 세액공제 옵션</h5>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxSimulatorData.isHomeOwner}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, isHomeOwner: e.target.checked })}
                        className="w-4 h-4 text-teal-500 rounded"
                      />
                      <span className="text-xs">주택 소유 (공제 불가)</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-600">전용면적:</label>
                      <input
                        type="number"
                        value={taxSimulatorData.housingSize}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, housingSize: parseInt(e.target.value) || 85 })}
                        className="w-16 px-2 py-1 border rounded text-xs"
                        placeholder="85"
                      />
                      <span className="text-xs text-gray-500">㎡</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 keep-all">
                    무주택 + 총급여 8천만원 이하 + 85㎡ 이하(또는 4억 이하)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 결과 */}
          <div className="bg-gray-50 rounded-xl p-4">
            {/* 계산/불러오기 버튼 - 결과 없을 때만 표시 */}
            {!taxSimulatorResult && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={loadFromAppData}
                  className="w-full text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
                  style={{ backgroundColor: CHART_COLORS.green }}
                >
                  <Download className="w-4 h-4" />
                  <span className="keep-all">내 데이터 불러오기</span>
                </button>
                <button
                  onClick={calculateTaxSimulation}
                  className="w-full text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  <Calculator className="w-4 h-4" />
                  <span className="keep-all">직접 계산하기</span>
                </button>
              </div>
            )}
            {taxSimulatorResult ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-500">연간 총급여</div>
                  <div className="text-lg font-bold text-right tabular-nums">{taxSimulatorResult.annualIncome.toLocaleString()}원</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-500">근로소득공제</div>
                  <div className="text-lg font-bold text-right tabular-nums text-green-600">-{taxSimulatorResult.earnedIncomeDeduction.toLocaleString()}원</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-500">과세표준</div>
                  <div className="text-lg font-bold text-right tabular-nums">{taxSimulatorResult.taxableIncome.toLocaleString()}원</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-500">산출세액</div>
                  <div className="text-lg font-bold text-right tabular-nums">{taxSimulatorResult.calculatedTax.toLocaleString()}원</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm text-gray-500">세액공제</div>
                  <div className="text-lg font-bold text-right tabular-nums text-green-600">-{(taxSimulatorResult.taxCredits + taxSimulatorResult.earnedIncomeTaxCredit).toLocaleString()}원</div>
                </div>
                <div className="bg-red-500 rounded-lg p-4 text-white shadow-flat">
                  <div className="text-sm opacity-90">예상 총 세금</div>
                  <div className="text-2xl font-bold text-right tabular-nums">{taxSimulatorResult.totalTax.toLocaleString()}원</div>
                  <div className="text-sm opacity-90 mt-1 text-right tabular-nums">
                    실효세율: {taxSimulatorResult.effectiveRate}% | 월 {taxSimulatorResult.monthlyTax.toLocaleString()}원
                  </div>
                </div>

                {(() => {
                  const meta = taxSimulatorResult.meta || {};
                  const insurancePremiums = meta.insurancePremiums || {};
                  const insuranceTotal = (insurancePremiums.national || 0) + (insurancePremiums.health || 0) + (insurancePremiums.employment || 0);
                  const donationSum = Object.values(meta.donations || {}).reduce((sum, v) => sum + (v || 0), 0);
                  const educationSum = Object.values(meta.educationExpenses || {}).reduce((sum, v) => sum + (v || 0), 0);
                  const childCount = meta.childDependents || 0;
                  const creditCardResult = meta.creditCardResult;
                  const rentResult = meta.rentResult;
                  return (
                    <div className="space-y-3">
                      {/* 신용카드 공제 결과 */}
                      {creditCardResult && creditCardResult.totalDeduction > 0 && (
                        <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                          <div className="text-xs font-semibold text-violet-700 mb-2">신용카드 소득공제</div>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div className="flex justify-between">
                              <span>총 사용액</span>
                              <span>{creditCardResult.totalUsage.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>최저사용금액 (25%)</span>
                              <span>{creditCardResult.minimumUsage.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>기본한도 공제</span>
                              <span className="text-green-600">{creditCardResult.basicDeduction.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>추가한도 공제</span>
                              <span className="text-green-600">{creditCardResult.additionalDeduction.toLocaleString()}원</span>
                            </div>
                            {creditCardResult.increaseDeduction > 0 && (
                              <div className="flex justify-between">
                                <span>소비증가분</span>
                                <span className="text-green-600">{creditCardResult.increaseDeduction.toLocaleString()}원</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold pt-1 border-t border-violet-200">
                              <span>총 공제액</span>
                              <span className="text-violet-700">{creditCardResult.totalDeduction.toLocaleString()}원</span>
                            </div>
                          </div>
                          {!creditCardResult.isUnder70m && (
                            <p className="text-[10px] text-orange-600 mt-1 keep-all">※ 7천만원 초과로 문화비/체육시설 추가한도 제외</p>
                          )}
                        </div>
                      )}

                      {/* 월세 세액공제 결과 */}
                      {rentResult && rentResult.credit > 0 && (
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <div className="text-xs font-semibold text-teal-700 mb-2">월세 세액공제</div>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div className="flex justify-between">
                              <span>연간 월세</span>
                              <span>{rentResult.annualRent.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>공제대상 금액</span>
                              <span>{rentResult.eligibleRent.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span>공제율 ({rentResult.incomeCategory})</span>
                              <span>{rentResult.ratePercent}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-1 border-t border-teal-200">
                              <span>세액공제</span>
                              <span className="text-teal-700">{rentResult.credit.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {rentResult && !rentResult.conditions.isEligible && (
                        <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                          <div className="text-xs text-orange-700">
                            월세 세액공제 불가: {rentResult.conditions.reasons.join(', ')}
                          </div>
                        </div>
                      )}

                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-xs text-gray-500 mb-2">입력 요약</div>
                        <div className="text-xs text-gray-700 space-y-1">
                          <div className="flex justify-between"><span>의료비</span><span>{(meta.medicalTotal || 0).toLocaleString()}원{meta.hasInfertility ? ' (난임 20% 적용)' : ''}</span></div>
                          <div className="flex justify-between"><span>교육비</span><span>{educationSum.toLocaleString()}원</span></div>
                          <div className="flex justify-between"><span>기부금</span><span>{donationSum.toLocaleString()}원</span></div>
                          <div className="flex justify-between"><span>보험료</span><span>{insuranceTotal.toLocaleString()}원</span></div>
                          <div className="flex justify-between"><span>주택 공제</span><span>{(taxSimulatorData.housingDeduction || 0).toLocaleString()}원</span></div>
                          <div className="flex justify-between"><span>자녀 세액공제</span><span>{childCount > 0 ? `${childCount}명 반영` : '입력 없음'}</span></div>
                        </div>
                        <div className="text-[11px] text-orange-600 mt-2 keep-all">
                          특례·인별 한도는 단순 계산(난임 제외)이며, 실제 신고 전 최신 고시와 홈택스 결과를 확인하세요.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => generatePDFReport('yearEnd')}
                  className="w-full bg-white border-2 border-blue-500 text-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF로 저장
                </button>
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  초기화
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm keep-all">위 버튼을 눌러 계산을 시작하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSimulatorModal;
