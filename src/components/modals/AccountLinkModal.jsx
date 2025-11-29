import React from 'react';
import { X, Shield, ChevronRight } from 'lucide-react';
import { PRIMARY_BLUE, BRAND_COLOR } from '../../constants/colors';

/**
 * 금융 계좌 연동 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {Array} banks - 사용 가능한 은행 목록 [{id, icon, name}]
 * @param {function} onLinkBank - 은행 연동 핸들러
 */
const AccountLinkModal = ({ isOpen, onClose, banks = [], onLinkBank }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">금융 계좌 연동하기</h3>
            <p className="text-sm text-gray-600">
              은행/카드사를 선택하고 안전하게 연동하세요
            </p>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="rounded-lg p-4 mb-6 border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PRIMARY_BLUE }} />
            <div className="text-sm" style={{ color: BRAND_COLOR }}>
              <div className="font-semibold mb-1">안전한 연동 보장</div>
              <div style={{ color: `${BRAND_COLOR}CC` }}>
                금융결제원 오픈뱅킹 API를 통한 안전한 연동 · 비밀번호는 저장되지 않습니다
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {banks.map(bank => (
            <button
              key={bank.id}
              onClick={() => onLinkBank(bank)}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:opacity-90 transition text-left"
              style={{ '--hover-border': PRIMARY_BLUE }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = PRIMARY_BLUE; e.currentTarget.style.backgroundColor = `${PRIMARY_BLUE}10`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="text-3xl">{bank.icon}</div>
              <div className="flex-1">
                <div className="font-semibold">{bank.name}</div>
                <div className="text-xs text-gray-500">즉시 연동 가능</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="mt-6 text-xs text-center text-gray-500">
          연동 시 +100P 포인트 지급
        </div>
      </div>
    </div>
  );
};

export default AccountLinkModal;
