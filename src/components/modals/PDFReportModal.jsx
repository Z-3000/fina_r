import React from 'react';
import { X, FileText, Download, Receipt, Calculator, Shield, Wallet } from 'lucide-react';
import { PRIMARY_BLUE, BRAND_COLOR } from '../../constants/colors';

/**
 * PDF/Excel 리포트 내보내기 모달
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 닫기 핸들러
 * @param {boolean} isLoading - 로딩 상태
 * @param {function} onGeneratePDF - PDF 생성 핸들러 (type: 'monthly' | 'yearEnd' | 'taxHealth')
 * @param {function} onExportExcel - Excel 내보내기 핸들러 (type: 'receipts' | 'budget' | 'all')
 */
const PDFReportModal = ({ isOpen, onClose, isLoading, onGeneratePDF, onExportExcel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">리포트 내보내기</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* PDF 리포트 섹션 */}
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              PDF 리포트
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onGeneratePDF('monthly')}
                disabled={isLoading}
                className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition"
                style={{ backgroundColor: `${PRIMARY_BLUE}15` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PRIMARY_BLUE }}>
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">월별 지출 리포트</div>
                    <div className="text-xs text-gray-500">거래내역, 예산현황, 카테고리 분석</div>
                  </div>
                </div>
                <Download className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
              </button>
              <button
                onClick={() => onGeneratePDF('yearEnd')}
                disabled={isLoading}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">연말정산 예상 리포트</div>
                    <div className="text-xs text-gray-500">소득, 공제, 예상 세금 분석</div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-red-500" />
              </button>
              <button
                onClick={() => onGeneratePDF('taxHealth')}
                disabled={isLoading}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">세금 건강 리포트</div>
                    <div className="text-xs text-gray-500">Tax Health Score, 공제 현황</div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-green-500" />
              </button>
            </div>
          </div>

          {/* Excel 내보내기 섹션 */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Excel 내보내기
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onExportExcel('receipts')}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">거래내역</div>
                    <div className="text-xs text-gray-500">전체 거래내역 Excel 파일</div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-emerald-500" />
              </button>
              <button
                onClick={() => onExportExcel('budget')}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_COLOR }}>
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">예산현황</div>
                    <div className="text-xs text-gray-500">카테고리별 예산 vs 실제</div>
                  </div>
                </div>
                <Download className="w-5 h-5" style={{ color: BRAND_COLOR }} />
              </button>
              <button
                onClick={() => onExportExcel('all')}
                className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition border"
                style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: PRIMARY_BLUE }}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">전체 데이터</div>
                    <div className="text-xs text-gray-500">모든 데이터 통합 Excel</div>
                  </div>
                </div>
                <Download className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFReportModal;
