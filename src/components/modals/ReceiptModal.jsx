import React from 'react';
import { X } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';

/**
 * 영수증 추가 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {object} receipt - 새 영수증 데이터 {merchant, amount, category, date}
 * @param {function} onReceiptChange - 영수증 데이터 변경 핸들러
 * @param {function} onSubmit - 추가 버튼 클릭 핸들러
 * @param {Array} categories - 카테고리 목록
 */
const ReceiptModal = ({
  isOpen,
  onClose,
  receipt,
  onReceiptChange,
  onSubmit,
  categories = []
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">영수증 추가</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">상점명</label>
            <input
              type="text"
              value={receipt.merchant}
              onChange={(e) => onReceiptChange({ ...receipt, merchant: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="예: 스타벅스"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">금액</label>
            <input
              type="number"
              value={receipt.amount}
              onChange={(e) => onReceiptChange({ ...receipt, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select
              value={receipt.category}
              onChange={(e) => onReceiptChange({ ...receipt, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">날짜</label>
            <input
              type="date"
              value={receipt.date}
              onChange={(e) => onReceiptChange({ ...receipt, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={onSubmit}
            className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            추가하기 (+10P)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
