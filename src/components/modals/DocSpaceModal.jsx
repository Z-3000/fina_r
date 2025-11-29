import React from 'react';
import { X, Folder } from 'lucide-react';
import { PRIMARY_BLUE } from '../../constants/colors';

/**
 * 도큐스페이스 모달 - 증빙 자료 자동 정리
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {object} documentSpace - 문서 공간 데이터
 */
const DocSpaceModal = ({ isOpen, onClose, documentSpace = {} }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">도큐스페이스 (증빙 자료 자동 정리)</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(documentSpace).map(([key, section]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-500" />
                  <h4 className="font-bold">{section.name}</h4>
                </div>
                <span className="text-sm px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>
                  {section.count}건
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {section.folders.map((folder, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border hover:border-blue-300 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{folder.name}</span>
                      <span className="text-xs text-gray-500">{folder.count}건</span>
                    </div>
                    <div className="text-xs text-gray-500">최근 업데이트: {folder.lastUpdated}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocSpaceModal;
