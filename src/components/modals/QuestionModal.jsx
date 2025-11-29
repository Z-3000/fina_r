import React from 'react';
import { X, Send } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';

/**
 * 질문하기 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {string} questionText - 질문 내용
 * @param {function} onQuestionChange - 질문 내용 변경 핸들러
 */
const QuestionModal = ({ isOpen, onClose, questionText = '', onQuestionChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">질문하기</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>세금</option>
              <option>절약</option>
              <option>사업자</option>
              <option>투자</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="질문 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              value={questionText}
              onChange={(e) => onQuestionChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-32"
              placeholder="질문 내용을 자세히 작성해주세요"
            />
          </div>

          <button
            onClick={onClose}
            className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            <Send className="w-4 h-4" />
            질문 등록하기 (+30P)
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
