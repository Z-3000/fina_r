import React from 'react';
import { X, Check, CheckCircle2 } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';

/**
 * 금융 연동 가치 설명 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onLinkAccount - 계좌 연동 버튼 클릭 핸들러
 */
const ValueModal = ({ isOpen, onClose, onLinkAccount }) => {
  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
    onLinkAccount();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">금융 연동의 가치</h2>
            <p className="text-gray-600">자동화로 얻는 실질적인 혜택</p>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Before & After Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-red-900 flex items-center gap-2">
              <X className="w-5 h-5" />
              연동 전 (수동 관리)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">영수증 직접 입력</div>
                  <div className="text-gray-600">거래당 평균 2분 소요</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">누락 발생</div>
                  <div className="text-gray-600">월평균 15건 빠짐</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">정확도 낮음</div>
                  <div className="text-gray-600">세금 계산 오류 가능성</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">시간 낭비</div>
                  <div className="text-gray-600">월 90분 이상 소모</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              연동 후 (자동 관리)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">자동 수집</div>
                  <div className="text-gray-600">실시간 거래 내역 동기화</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">100% 완벽 기록</div>
                  <div className="text-gray-600">모든 거래 자동 저장</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">정확한 세금 계산</div>
                  <div className="text-gray-600">실시간 VAT 자동 계산</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="font-semibold">시간 절약 95%</div>
                  <div className="text-gray-600">월 85분 절약</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLinkClick}
          className="w-full text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          지금 바로 계좌 연동하기
        </button>
      </div>
    </div>
  );
};

export default ValueModal;
