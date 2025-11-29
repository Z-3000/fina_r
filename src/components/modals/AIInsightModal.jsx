import React from 'react';
import { X } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';

/**
 * AI 세무사 인사이트 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {Array} insights - AI 인사이트 배열 [{id, icon, title, description, priority, potentialSaving}]
 */
const AIInsightModal = ({ isOpen, onClose, insights = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">AI 세무사 인사이트</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {insights.map(insight => {
            const Icon = insight.icon;
            return (
              <div key={insight.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: insight.priority === 'high' ? '#FFF3E6' : `${PRIMARY_BLUE}15` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: insight.priority === 'high' ? '#EA580C' : PRIMARY_BLUE }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-1">{insight.title}</div>
                    <div className="text-sm text-gray-700 mb-2">{insight.description}</div>
                    {insight.potentialSaving > 0 && (
                      <div className="text-lg font-bold text-green-600">
                        {insight.potentialSaving.toLocaleString()}원 절감 가능
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIInsightModal;
