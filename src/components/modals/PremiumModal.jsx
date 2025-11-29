import React from 'react';
import { Crown, X, Check } from 'lucide-react';
import { BRAND_COLOR, ACCENT_GOLD } from '../../constants/colors';

/**
 * 프리미엄 플랜 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onSubscribe - 프리미엄 구독 핸들러
 */
const PremiumModal = ({ isOpen, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold">프리미엄 플랜</h2>
            </div>
            <p className="text-gray-600">연간 최대 50만원 추가 절감</p>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* 무료 플랜 */}
          <div className="bg-gray-50 rounded-xl p-6 border">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-500 mb-2">무료 플랜</div>
              <div className="text-4xl font-bold">0원</div>
              <div className="text-sm text-gray-500">/ 월</div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                영수증 등록 (월 30개)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                기본 예산 관리
              </li>
              <li className="flex items-center gap-2 opacity-50">
                <X className="w-4 h-4 text-gray-400" />
                세금 예측
              </li>
              <li className="flex items-center gap-2 opacity-50">
                <X className="w-4 h-4 text-gray-400" />
                AI 분석
              </li>
            </ul>
          </div>

          {/* 프리미엄 플랜 (추천) */}
          <div className="rounded-xl p-6 text-white relative border-4 border-yellow-400" style={{ backgroundColor: BRAND_COLOR }}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}>
              추천
            </div>
            <div className="text-center mb-4">
              <div className="text-sm opacity-90 mb-2">프리미엄 플랜</div>
              <div className="text-5xl font-bold">9,900원</div>
              <div className="text-sm opacity-90">/ 월</div>
              <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                첫 달 무료
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                무제한 영수증 등록
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                세금 예측 (정확도 95%)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                AI 맞춤 분석
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                전문가 우선 상담
              </li>
            </ul>
          </div>

          {/* 연간 플랜 */}
          <div className="bg-gray-50 rounded-xl p-6 border">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-500 mb-2">연간 플랜</div>
              <div className="text-4xl font-bold">99,000원</div>
              <div className="text-sm text-gray-500">/ 년</div>
              <div className="mt-2 text-xs bg-green-100 text-green-700 rounded-full px-3 py-1 inline-block">
                2개월 무료
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                프리미엄 모든 기능
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                연간 재무 리포트
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                전문가 무료 상담 1회
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                우선 고객 지원
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          프리미엄 시작하기 (첫 달 무료)
        </button>
      </div>
    </div>
  );
};

export default PremiumModal;
