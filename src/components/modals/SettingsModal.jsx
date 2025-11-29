import React from 'react';
import { X, User, Briefcase } from 'lucide-react';
import { PRIMARY_BLUE, BRAND_COLOR } from '../../constants/colors';

/**
 * 설정 모달 - 사용자 유형 및 세금 기본정보 설정
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {string} userType - 사용자 유형 ('individual' | 'business')
 * @param {function} onUserTypeChange - 사용자 유형 변경 핸들러
 * @param {object} taxBasicInfo - 세금 기본 정보 객체
 * @param {function} onTaxBasicInfoChange - 세금 기본 정보 변경 핸들러
 * @param {function} onSave - 저장 핸들러
 */
const SettingsModal = ({
  isOpen,
  onClose,
  userType,
  onUserTypeChange,
  taxBasicInfo,
  onTaxBasicInfoChange,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">설정</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 유저타입 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">사용자 유형</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onUserTypeChange('individual')}
              className={"p-4 rounded-xl border-2 transition " + (userType === 'individual'
                ? ''
                : 'border-gray-200 hover:border-gray-300')}
              style={userType === 'individual' ? { borderColor: PRIMARY_BLUE, backgroundColor: `${PRIMARY_BLUE}10` } : {}}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : '#E5E7EB' }}
              >
                <User className={"w-6 h-6 " + (userType === 'individual' ? 'text-white' : 'text-gray-500')} />
              </div>
              <div className="font-semibold text-center">개인</div>
              <div className="text-xs text-gray-500 text-center mt-1">근로소득자, 연말정산</div>
            </button>
            <button
              onClick={() => onUserTypeChange('business')}
              className={"p-4 rounded-xl border-2 transition " + (userType === 'business'
                ? ''
                : 'border-gray-200 hover:border-gray-300')}
              style={userType === 'business' ? { borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` } : {}}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: userType === 'business' ? BRAND_COLOR : '#E5E7EB' }}
              >
                <Briefcase className={"w-6 h-6 " + (userType === 'business' ? 'text-white' : 'text-gray-500')} />
              </div>
              <div className="font-semibold text-center">소상공인</div>
              <div className="text-xs text-gray-500 text-center mt-1">사업자, 종합소득세</div>
            </button>
          </div>
        </div>

        {/* 세금 계산용 기본 정보 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            세금 계산 기본 정보
          </label>

          {userType === 'individual' ? (
            /* 개인용 입력 폼 */
            <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: `${PRIMARY_BLUE}10` }}>
              <div>
                <label className="block text-xs text-gray-600 mb-1">연봉 (세전)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxBasicInfo.annualIncome}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, annualIncome: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                    placeholder="50000000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  월 {Math.round(taxBasicInfo.annualIncome / 12).toLocaleString()}원
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">부양가족 수</label>
                  <select
                    value={taxBasicInfo.dependents}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, dependents: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value={0}>없음</option>
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명 이상</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">배우자</label>
                  <select
                    value={taxBasicInfo.hasSpouse ? 'yes' : 'no'}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, hasSpouse: e.target.value === 'yes'})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="no">없음</option>
                    <option value="yes">있음</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">자녀 수 (선택)</label>
                <input
                  type="number"
                  value={taxBasicInfo.childDependents}
                  onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, childDependents: Math.max(0, parseInt(e.target.value) || 0)})}
                  className="w-full px-3 py-2 border rounded-lg text-right"
                  placeholder="0"
                  min="0"
                />
                <p className="text-[11px] text-gray-500 mt-1">미입력 시 부양가족 수로 계산합니다.</p>
              </div>
            </div>
          ) : (
            /* 소상공인용 입력 폼 */
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <label className="block text-xs text-gray-600 mb-1">예상 연매출</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxBasicInfo.expectedRevenue}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, expectedRevenue: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                    placeholder="100000000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  월 평균 {Math.round(taxBasicInfo.expectedRevenue / 12).toLocaleString()}원
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">예상 경비 (재료비, 임대료 등)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxBasicInfo.expectedExpenses}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, expectedExpenses: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                    placeholder="60000000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  경비율 {taxBasicInfo.expectedRevenue > 0 ? Math.round(taxBasicInfo.expectedExpenses / taxBasicInfo.expectedRevenue * 100) : 0}%
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxBasicInfo.isSimplifiedTax}
                    onChange={(e) => onTaxBasicInfoChange({...taxBasicInfo, isSimplifiedTax: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">간이과세자입니다</span>
                  <span className="text-xs text-gray-500">(연매출 8천만원 이하)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 유저타입별 안내 */}
        <div className={"p-4 rounded-lg " + (userType === 'individual' ? 'bg-blue-50' : 'bg-purple-50')}>
          <div className="font-semibold mb-2">
            {userType === 'individual' ? '개인 사용자 기능' : '소상공인 기능'}
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            {userType === 'individual' ? (
              <>
                <li>• 연말정산 시뮬레이터</li>
                <li>• 소득공제 항목 관리</li>
                <li>• 근로소득세 예측</li>
                <li>• 예상 환급액 계산</li>
              </>
            ) : (
              <>
                <li>• 종합소득세 계산</li>
                <li>• 부가가치세 관리</li>
                <li>• 매출/매입 현황</li>
                <li>• 필요경비 추적</li>
              </>
            )}
          </ul>
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3 px-4 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : BRAND_COLOR }}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
