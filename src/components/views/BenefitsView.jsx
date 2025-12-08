import React from 'react';
import { CheckCircle, Gift, Calculator, Home, Briefcase, Heart, CreditCard } from 'lucide-react';
import { BRAND_COLOR, NEON_ICE } from '../../constants/colors';

const BenefitsView = ({
  // 상태
  activeTheme,
  benefitsCategory,
  benefitsData,
  benefitsCategories,
  filteredBenefits,
  eligibleBenefitsCount,
  // 함수
  setBenefitsCategory,
  onOpenDetailsModal,
  onOpenQuestionModal,
}) => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">혜택 자동 탐색</h2>
        <p className="text-gray-600">나에게 맞는 세금 혜택과 지원금을 찾아보세요</p>
      </div>

      {/* 요약 카드 */}
      <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: NEON_ICE, color: BRAND_COLOR }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{benefitsData.length}개</div>
            <div className="text-sm opacity-90">발견된 혜택</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{eligibleBenefitsCount}개</div>
            <div className="text-sm opacity-90">신청 가능</div>
          </div>
          <div>
            <div className="text-3xl font-bold">약 850만원</div>
            <div className="text-sm opacity-90">예상 혜택 총액</div>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {benefitsCategories.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === 'all'
            ? benefitsData.length
            : benefitsData.filter(b => b.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setBenefitsCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                benefitsCategory === cat.id
                  ? ''
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={benefitsCategory === cat.id ? { backgroundColor: activeTheme.primary, color: activeTheme.text } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${benefitsCategory === cat.id ? 'bg-white/30' : 'bg-gray-200'}`}
              >{count}</span>
            </button>
          );
        })}
      </div>

      {/* 혜택 목록 */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredBenefits.map((benefit) => (
          <div
            key={benefit.id}
            className={`bg-white rounded-xl p-5 border-2 transition hover:shadow-lg ${
              benefit.eligible ? 'border-green-300' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{benefit.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">{benefit.provider}</span>
                  <span className="text-xs text-gray-500">{benefit.deadline}</span>
                </div>
              </div>
              {benefit.eligible && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  신청가능
                </span>
              )}
            </div>

            <div className="text-2xl font-bold mb-2" style={{ color: activeTheme.primary }}>{benefit.amount}</div>
            <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>

            <div className="text-xs text-gray-500 mb-4">
              <span className="font-semibold">자격요건:</span> {benefit.eligibility}
            </div>

            <button
              className={`w-full py-2 rounded-lg font-semibold transition ${
                benefit.eligible
                  ? 'hover:opacity-90'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={benefit.eligible ? { backgroundColor: activeTheme.primary, color: activeTheme.text } : {}}
            >
              {benefit.eligible ? '신청하기' : '자격 확인'}
            </button>
          </div>
        ))}
      </div>

      {/* 도움말 카드 */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="font-bold text-lg mb-3">혜택 신청 도움이 필요하신가요?</h3>
        <p className="text-gray-600 text-sm mb-4">
          복잡한 세금 혜택 신청을 전문가가 도와드립니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onOpenDetailsModal?.('experts')}
            className="flex-1 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: activeTheme.primary, color: activeTheme.text }}
          >
            전문가 상담
          </button>
          <button
            onClick={() => onOpenDetailsModal?.('products')}
            className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            금융상품 추천
          </button>
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => onOpenDetailsModal?.('community')}
            className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            커뮤니티
          </button>
          <button
            onClick={() => onOpenQuestionModal?.()}
            className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            질문하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BenefitsView;
