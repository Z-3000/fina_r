import React from 'react';
import {
  FileText, Camera, RefreshCw, Plus, X, Link, Sparkles, Filter, Timer
} from 'lucide-react';
import { BRAND_COLOR, PRIMARY_BLUE, SUCCESS_GREEN } from '../../constants/colors';

const ReceiptsView = ({
  // 상태
  linkedAccounts,
  stats,
  transactionFilters,
  itemsPerPage,
  currentPage,
  uniqueBanks,
  uniqueCategories,
  totalFilteredTransactions,
  totalPages,
  // 함수
  setShowValueModal,
  setShowReceiptModal,
  setShowAccountLinkModal,
  setTransactionFilters,
  setCurrentPage,
  setItemsPerPage,
  handleUnlinkAccount,
  getCombinedTransactions,
  handleTransactionClick,
  handleDeleteTransaction,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">거래 내역 관리</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowValueModal(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-80 transition border"
            style={{ backgroundColor: `${BRAND_COLOR}10`, color: BRAND_COLOR, borderColor: `${BRAND_COLOR}30` }}
          >
            <Sparkles className="w-4 h-4" />
            연동 효과 보기
          </button>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            <Plus className="w-4 h-4" />
            영수증 추가
          </button>
        </div>
      </div>

      {/* Account Integration Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
            <h3 className="font-bold text-lg">금융 계좌 연동</h3>
          </div>
          <button
            onClick={() => setShowAccountLinkModal(true)}
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition text-sm"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            <Plus className="w-4 h-4" />
            계좌 연동하기
          </button>
        </div>

        {linkedAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold mb-2">계좌를 연동하면 자동으로 관리됩니다</h4>
            <p className="text-sm text-gray-600 mb-4">
              수동 입력 시간 95% 절감 · 누락 없는 완벽한 기록
            </p>
            <button
              onClick={() => setShowAccountLinkModal(true)}
              className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              지금 연동하기
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedAccounts.map(account => (
              <div key={account.id} className="bg-gray-50 rounded-lg p-4 border shadow-flat">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{account.icon}</div>
                    <div>
                      <div className="font-semibold text-sm">{account.bank}</div>
                      <div className="text-xs text-gray-500">****{account.last_digits || account.lastDigits}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    연동중
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">이번 달</div>
                    <div className="font-bold text-sm text-right tabular-nums">{(account.monthly_spent || account.monthlySpent || 0).toLocaleString()}원</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">거래</div>
                    <div className="font-bold text-sm tabular-nums">{account.transaction_count || account.transactionCount || 0}건</div>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlinkAccount(account)}
                  className="w-full mt-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  연동중지
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
            <span className="text-sm text-gray-600">총 거래</span>
          </div>
          <div className="text-2xl font-bold">{stats.receiptCount}건</div>
          <div className="text-xs text-gray-500">이번 달</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5" style={{ color: BRAND_COLOR }} />
            <span className="text-sm text-gray-600">수동 입력</span>
          </div>
          <div className="text-2xl font-bold">{stats.manualCount}건</div>
          <div className="text-xs text-gray-500">{stats.receiptCount > 0 ? Math.round((stats.manualCount / stats.receiptCount) * 100) : 0}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">자동 수집</span>
          </div>
          <div className="text-2xl font-bold">{stats.autoCount}건</div>
          <div className="text-xs text-gray-500">{stats.receiptCount > 0 ? Math.round((stats.autoCount / stats.receiptCount) * 100) : 0}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">절약 시간</span>
          </div>
          <div className="text-2xl font-bold">{stats.autoCount * 2}분</div>
          <div className="text-xs text-gray-500">이번 달</div>
        </div>
      </div>

      {/* 필터링 영역 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold">필터</h3>
          <button
            onClick={() => {
              setTransactionFilters({ dateFrom: '', dateTo: '', bank: 'all', source: 'all', category: 'all' });
              setCurrentPage(1);
            }}
            className="ml-auto text-xs hover:opacity-70"
            style={{ color: PRIMARY_BLUE }}
          >
            필터 초기화
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* 날짜 시작 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작일</label>
            <input
              type="date"
              value={transactionFilters.dateFrom}
              onChange={(e) => { setTransactionFilters({ ...transactionFilters, dateFrom: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 날짜 종료 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input
              type="date"
              value={transactionFilters.dateTo}
              onChange={(e) => { setTransactionFilters({ ...transactionFilters, dateTo: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 입력방식 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">입력방식</label>
            <select
              value={transactionFilters.source}
              onChange={(e) => { setTransactionFilters({ ...transactionFilters, source: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="manual">수동 입력</option>
              <option value="auto">자동 연동</option>
            </select>
          </div>

          {/* 금융사 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">금융사</label>
            <select
              value={transactionFilters.bank}
              onChange={(e) => { setTransactionFilters({ ...transactionFilters, bank: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="manual">수동 입력</option>
              {uniqueBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">카테고리</label>
            <select
              value={transactionFilters.category}
              onChange={(e) => { setTransactionFilters({ ...transactionFilters, category: e.target.value }); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 필터 결과 요약 */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            검색 결과: <span className="font-semibold" style={{ color: PRIMARY_BLUE }}>{totalFilteredTransactions}</span>건
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">페이지당</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">거래 내역</h3>
        <div className="space-y-3">
          {getCombinedTransactions().map((transaction, index) => (
            <div
              key={`${transaction.source}-${transaction.id}-${index}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer group"
              onClick={() => handleTransactionClick(transaction)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: transaction.source === 'manual' ? `${BRAND_COLOR}20` : `${SUCCESS_GREEN}30` }}
                >
                  {transaction.source === 'manual' ? (
                    <Camera className="w-6 h-6" style={{ color: BRAND_COLOR }} />
                  ) : (
                    <RefreshCw className="w-6 h-6" style={{ color: SUCCESS_GREEN }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{transaction.merchant}</div>
                    {transaction.ocrConfidence && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        OCR {Math.round(transaction.ocrConfidence * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{transaction.date} · {transaction.category}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {transaction.source === 'auto' ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {transaction.bankName || '자동 연동'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        수동 입력
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-lg tabular-nums">{(transaction.amount || 0).toLocaleString()}원</div>
                  <div className="text-xs text-gray-500 tabular-nums">VAT {(transaction.tax || 0).toLocaleString()}원</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTransaction(transaction);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                  title="삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              처음
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              이전
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm font-medium transition ${currentPage === pageNum
                      ? 'text-white'
                      : 'border hover:bg-gray-100'
                      }`}
                    style={currentPage === pageNum ? { backgroundColor: PRIMARY_BLUE } : {}}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              다음
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              마지막
            </button>

            <span className="ml-4 text-sm text-gray-500">
              {currentPage} / {totalPages} 페이지
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsView;
