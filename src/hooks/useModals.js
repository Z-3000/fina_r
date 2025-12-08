/**
 * useModals - 모달 상태 통합 관리 훅
 * App.jsx의 15개 모달 상태를 하나의 훅으로 관리
 */
import { useState, useCallback } from 'react';

/**
 * 모달 상태 관리 훅
 * @returns {Object} 모달 상태와 제어 함수들
 */
export function useModals() {
  // 모달 표시 상태
  const [modals, setModals] = useState({
    receipt: false,
    premium: false,
    details: false,
    reward: false,
    accountLink: false,
    value: false,
    auth: false,
    docSpace: false,
    pdfReport: false,
    taxSimulator: false,
    aiInsight: false,
    settings: false,
    question: false,
    transactionDetail: false,
    budgetLimit: false,
  });

  // 모달 관련 추가 상태
  const [modalData, setModalData] = useState({
    detailsType: '', // 'experts' | 'products' | 'community'
    selectedReward: null,
    selectedExpert: null,
    selectedProduct: null,
    selectedTransaction: null,
    budgetLimitCategory: null,
  });

  /**
   * 특정 모달 열기
   * @param {string} modalName - 모달 이름
   * @param {Object} data - 모달에 전달할 데이터 (선택적)
   */
  const openModal = useCallback((modalName, data = {}) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (Object.keys(data).length > 0) {
      setModalData(prev => ({ ...prev, ...data }));
    }
  }, []);

  /**
   * 특정 모달 닫기
   * @param {string} modalName - 모달 이름
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  /**
   * 모든 모달 닫기
   */
  const closeAllModals = useCallback(() => {
    setModals({
      receipt: false,
      premium: false,
      details: false,
      reward: false,
      accountLink: false,
      value: false,
      auth: false,
      docSpace: false,
      pdfReport: false,
      taxSimulator: false,
      aiInsight: false,
      settings: false,
      question: false,
      transactionDetail: false,
      budgetLimit: false,
    });
  }, []);

  /**
   * 모달 토글
   * @param {string} modalName - 모달 이름
   */
  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  // 편의를 위한 개별 모달 핸들러
  const modalHandlers = {
    // Receipt Modal
    openReceiptModal: () => openModal('receipt'),
    closeReceiptModal: () => closeModal('receipt'),

    // Premium Modal
    openPremiumModal: () => openModal('premium'),
    closePremiumModal: () => closeModal('premium'),

    // Details Modal (타입 포함)
    openDetailsModal: (type) => openModal('details', { detailsType: type }),
    closeDetailsModal: () => closeModal('details'),

    // Reward Modal
    openRewardModal: (reward) => openModal('reward', { selectedReward: reward }),
    closeRewardModal: () => closeModal('reward'),

    // Account Link Modal
    openAccountLinkModal: () => openModal('accountLink'),
    closeAccountLinkModal: () => closeModal('accountLink'),

    // Value Modal
    openValueModal: () => openModal('value'),
    closeValueModal: () => closeModal('value'),

    // Auth Modal
    openAuthModal: () => openModal('auth'),
    closeAuthModal: () => closeModal('auth'),

    // DocSpace Modal
    openDocSpaceModal: () => openModal('docSpace'),
    closeDocSpaceModal: () => closeModal('docSpace'),

    // PDF Report Modal
    openPDFReportModal: () => openModal('pdfReport'),
    closePDFReportModal: () => closeModal('pdfReport'),

    // Tax Simulator Modal
    openTaxSimulatorModal: () => openModal('taxSimulator'),
    closeTaxSimulatorModal: () => closeModal('taxSimulator'),

    // AI Insight Modal
    openAIInsightModal: () => openModal('aiInsight'),
    closeAIInsightModal: () => closeModal('aiInsight'),

    // Settings Modal
    openSettingsModal: () => openModal('settings'),
    closeSettingsModal: () => closeModal('settings'),

    // Question Modal
    openQuestionModal: () => openModal('question'),
    closeQuestionModal: () => closeModal('question'),

    // Transaction Detail Modal
    openTransactionDetailModal: (transaction) =>
      openModal('transactionDetail', { selectedTransaction: transaction }),
    closeTransactionDetailModal: () => closeModal('transactionDetail'),

    // Budget Limit Modal
    openBudgetLimitModal: (category) =>
      openModal('budgetLimit', { budgetLimitCategory: category }),
    closeBudgetLimitModal: () => closeModal('budgetLimit'),
  };

  return {
    // 상태
    modals,
    modalData,

    // 일반 함수
    openModal,
    closeModal,
    closeAllModals,
    toggleModal,
    setModalData,

    // 개별 핸들러
    ...modalHandlers,

    // 기존 App.jsx와 호환을 위한 별칭
    showReceiptModal: modals.receipt,
    showPremiumModal: modals.premium,
    showDetailsModal: modals.details,
    showRewardModal: modals.reward,
    showAccountLinkModal: modals.accountLink,
    showValueModal: modals.value,
    showAuthModal: modals.auth,
    showDocSpaceModal: modals.docSpace,
    showPDFReportModal: modals.pdfReport,
    showTaxSimulatorModal: modals.taxSimulator,
    showAIInsightModal: modals.aiInsight,
    showSettingsModal: modals.settings,
    showQuestionModal: modals.question,
    showTransactionDetailModal: modals.transactionDetail,
    showBudgetLimitModal: modals.budgetLimit,
    detailsModalType: modalData.detailsType,
    selectedReward: modalData.selectedReward,
    selectedTransaction: modalData.selectedTransaction,
    budgetLimitCategory: modalData.budgetLimitCategory,

    // setter 호환
    setShowReceiptModal: (v) => v ? openModal('receipt') : closeModal('receipt'),
    setShowPremiumModal: (v) => v ? openModal('premium') : closeModal('premium'),
    setShowDetailsModal: (v) => v ? openModal('details') : closeModal('details'),
    setShowRewardModal: (v) => v ? openModal('reward') : closeModal('reward'),
    setShowAccountLinkModal: (v) => v ? openModal('accountLink') : closeModal('accountLink'),
    setShowValueModal: (v) => v ? openModal('value') : closeModal('value'),
    setShowAuthModal: (v) => v ? openModal('auth') : closeModal('auth'),
    setShowDocSpaceModal: (v) => v ? openModal('docSpace') : closeModal('docSpace'),
    setShowPDFReportModal: (v) => v ? openModal('pdfReport') : closeModal('pdfReport'),
    setShowTaxSimulatorModal: (v) => v ? openModal('taxSimulator') : closeModal('taxSimulator'),
    setShowAIInsightModal: (v) => v ? openModal('aiInsight') : closeModal('aiInsight'),
    setShowSettingsModal: (v) => v ? openModal('settings') : closeModal('settings'),
    setShowQuestionModal: (v) => v ? openModal('question') : closeModal('question'),
    setShowTransactionDetailModal: (v) => v ? openModal('transactionDetail') : closeModal('transactionDetail'),
    setShowBudgetLimitModal: (v) => v ? openModal('budgetLimit') : closeModal('budgetLimit'),
    setDetailsModalType: (type) => setModalData(prev => ({ ...prev, detailsType: type })),
    setSelectedReward: (reward) => setModalData(prev => ({ ...prev, selectedReward: reward })),
    setSelectedTransaction: (t) => setModalData(prev => ({ ...prev, selectedTransaction: t })),
    setBudgetLimitCategory: (cat) => setModalData(prev => ({ ...prev, budgetLimitCategory: cat })),
  };
}

export default useModals;
