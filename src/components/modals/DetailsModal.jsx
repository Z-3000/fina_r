import React from 'react';
import { X, Award, Plus, Users, MessageCircle, ThumbsUp } from 'lucide-react';
import { PRIMARY_BLUE, BRAND_COLOR } from '../../constants/colors';

/**
 * 상세 정보 모달 (전문가/금융상품/커뮤니티)
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {string} modalType - 모달 타입 ('experts' | 'products' | 'community')
 * @param {Array} experts - 세무 전문가 목록
 * @param {Array} products - 금융 상품 목록
 * @param {Array} communityPosts - 커뮤니티 게시물 목록
 * @param {function} onOpenQuestionModal - 질문하기 버튼 클릭 핸들러
 */
const DetailsModal = ({
  isOpen,
  onClose,
  modalType,
  experts = [],
  products = [],
  communityPosts = [],
  onOpenQuestionModal
}) => {
  if (!isOpen) return null;

  const titles = {
    experts: '세무 전문가',
    products: '맞춤 금융 상품',
    community: '재무 커뮤니티'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{titles[modalType]}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {modalType === 'experts' && (
          <div className="space-y-4">
            {experts.map(expert => (
              <div key={expert.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white" style={{ backgroundColor: PRIMARY_BLUE }}>
                    {expert.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{expert.name}</h3>
                      <span className="text-sm text-gray-600">{expert.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{expert.rating}</span>
                      <span className="text-sm text-gray-500">({expert.reviews}개 리뷰)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {expert.specialties.map((spec, idx) => (
                        <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold" style={{ color: PRIMARY_BLUE }}>{expert.price.toLocaleString()}원</div>
                      <button className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition" style={{ backgroundColor: PRIMARY_BLUE }}>
                        상담 신청
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalType === 'products' && (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
                    {product.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>
                        매칭도 {product.matchScore}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{product.provider}</div>
                    <div className="text-sm font-semibold mb-3" style={{ color: PRIMARY_BLUE }}>{product.benefit}</div>
                    {product.expectedSavings > 0 && (
                      <div className="text-sm text-green-600 font-bold mb-3">
                        연 {product.expectedSavings.toLocaleString()}원 절감
                      </div>
                    )}
                    <button className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition" style={{ backgroundColor: PRIMARY_BLUE }}>
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modalType === 'community' && (
          <div className="space-y-4">
            <button
              onClick={onOpenQuestionModal}
              className="w-full text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              <Plus className="w-4 h-4" />
              질문하기
            </button>
            {communityPosts.map(post => (
              <div key={post.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${BRAND_COLOR}10`, borderColor: `${BRAND_COLOR}30` }}>
                    <Users className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">{post.author}</div>
                    <h3 className="font-bold mb-3">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.answers}개 답변
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsModal;
