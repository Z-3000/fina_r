import React from 'react';
import { SUCCESS_GREEN, BRAND_COLOR, PRIMARY_BLUE } from '../../constants/colors';

/**
 * 리워드 교환 완료 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {object} reward - 선택된 리워드 {icon, name}
 */
const RewardModal = ({ isOpen, onClose, reward }) => {
  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}
        >
          {reward.icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">교환 완료!</h3>
        <p className="text-gray-600 mb-4">
          <span className="font-bold">{reward.name}</span>이(가) 지급되었습니다.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">사용 코드</div>
          <div className="text-2xl font-bold font-mono">ABCD-1234-EFGH</div>
        </div>
        <button
          onClick={onClose}
          className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default RewardModal;
