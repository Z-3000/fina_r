import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Camera, Upload, Wallet, TrendingUp, TrendingDown, PieChart, FileText, Users, CreditCard, Calculator, Award, ChevronRight, Plus, X, Check, AlertCircle, Sparkles, Calendar, DollarSign, Building, Bell, Target, Trophy, MessageCircle, ThumbsUp, Send, Zap, Crown, Star, Shield, Gift, ArrowUp, ArrowDown, Activity, Clock, CheckCircle, Briefcase, User, Flame, Repeat, Lock, Unlock, PartyPopper, Ticket, Coffee, ShoppingBag, Link, RefreshCw, CheckCircle2, Timer, BarChart3, Eye, EyeOff, Download, FileCheck, Folder, Search, Filter, TrendingUpIcon, AlertTriangle, Lightbulb, Receipt, Heart, GraduationCap, Home, Car, Baby, Pill, BookOpen, Laptop, Waves, LogIn, UserPlus, Key } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, ComposedChart, ReferenceLine } from 'recharts';
import { supabase } from './lib/supabase';
import './App.css';
import {
  authAPI,
  receiptsAPI,
  budgetsAPI,
  accountsAPI,
  challengesAPI,
  deductionAPI,
  insightsAPI,
  notificationsAPI,
  attendanceAPI,
  rewardsAPI,
  taxAPI,
  // 새로 추가된 API
  rewardsProductAPI,
  missionsAPI,
  eventsAPI,
  banksAPI,
  documentFoldersAPI,
  communityAPI,
  expertsAPI,
  productsAPI,
  notificationCenterAPI,
  leaderboardAPI,
  autoTransactionsAPI,
  gamificationAPI,
  bankDummyTransactionsAPI,
} from './services/api';
import { processReceiptImage, compressImage } from './services/ocrService';
import {
  calculateIndividualTax,
  calculateBusinessTax,
  calculateDetailedTaxHealthScores,
  calculateCreditCardDeduction,
  calculateAnnualInsurancePremiums,
  calculateRentTaxCredit,
} from './services/calculators';
import {
  generateMonthlyExpenseReport,
  generateYearEndTaxReport,
  generateTaxHealthReport,
  exportReceiptsToExcel,
  exportBudgetToExcel,
  exportTaxDataToExcel,
  exportAllDataToExcel,
} from './services/exportService';
import { generateAllInsights } from './services/insightGenerator';

// ===== Color System (from constants/colors.js) =====
import {
  COLORS,
  TAB_THEMES,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TERTIARY_COLOR,
  ACCENT_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_DARK,
  SECONDARY_LIGHT,
  SECONDARY_DARK,
  TERTIARY_LIGHT,
  TERTIARY_DARK,
  ACCENT_LIGHT,
  ACCENT_DARK,
  SUCCESS_COLOR,
  WARNING_COLOR,
  ERROR_COLOR,
  INFO_COLOR,
  ACCENT_GOLD,
  BRAND_COLOR,
  PRIMARY_BLUE,
  SUCCESS_GREEN,
  NEON_ICE,
  withAlpha,
  getScoreColor,
  getTrendColor,
} from './constants/colors';
import { BIZ_CALC_DEFAULTS } from './constants/businessTaxConstants';

// ===== View Components =====
import DashboardView from './components/views/DashboardView';
import ReceiptsView from './components/views/ReceiptsView';
import BudgetView from './components/views/BudgetView';
import TaxPredictionView from './components/views/TaxPredictionView';
import BenefitsView from './components/views/BenefitsView';
import ChallengesView from './components/views/ChallengesView';

// ===== Modal Components =====
import AIInsightModal from './components/modals/AIInsightModal';
import PremiumModal from './components/modals/PremiumModal';
import RewardModal from './components/modals/RewardModal';
import QuestionModal from './components/modals/QuestionModal';
import ValueModal from './components/modals/ValueModal';
import SettingsModal from './components/modals/SettingsModal';
import DocSpaceModal from './components/modals/DocSpaceModal';
import PDFReportModal from './components/modals/PDFReportModal';
import ReceiptModal from './components/modals/ReceiptModal';
import AccountLinkModal from './components/modals/AccountLinkModal';
import DetailsModal from './components/modals/DetailsModal';
import TaxSimulatorModal from './components/modals/TaxSimulatorModal';

// ===== Toast =====
import { useToast } from './context/ToastContext';

// ===== Custom Hooks =====
import { useChallengesData } from './hooks/useChallengesData';
import { useAuth } from './hooks/useAuth';

// ===== Utils =====
import { formatAmount, handleNumberFocus, handleNumberBlur } from './utils/formatting';
import { CHART_COLORS } from './constants/charts';

const ReceiptFinancePlatform = () => {
  // Toast hook for error notifications
  const toast = useToast();

  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const isDataLoadedRef = useRef(false); // 데이터 로드 완료 여부 (중복 호출 방지)
  const loadingUserIdRef = useRef(null); // 현재 로딩 중인 사용자 ID
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 상태 관리
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDocSpaceModal, setShowDocSpaceModal] = useState(false);
  const [showPDFReportModal, setShowPDFReportModal] = useState(false);
  const [showTaxSimulatorModal, setShowTaxSimulatorModal] = useState(false);
  const [showTaxAdvanced, setShowTaxAdvanced] = useState(false);
  const [showAIInsightModal, setShowAIInsightModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // 설정 모달
  
  // 세금 계산용 기본 정보
  const [taxBasicInfo, setTaxBasicInfo] = useState({
    // 개인용
    annualIncome: 50000000,      // 연봉
    dependents: 0,               // 부양가족 수
    hasSpouse: false,            // 배우자 유무
    childDependents: 0,          // 자녀 수(선택)
    // 소상공인용
    expectedRevenue: 100000000,  // 예상 연매출
    expectedExpenses: 60000000,  // 예상 경비
    isSimplifiedTax: false,      // 간이과세자 여부
  });
  
  const [selectedReward, setSelectedReward] = useState(null);
  const [detailsModalType, setDetailsModalType] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPremium, setIsPremium] = useState(true); // 프리미엄 기능 시연
  const [userType, setUserType] = useState('individual');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [attendanceChecked, setAttendanceChecked] = useState([true, true, false, false, false, false, false]);
  const [receiptViewMode, setReceiptViewMode] = useState('all');
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [budgetMaxLimits, setBudgetMaxLimits] = useState({});
  const [showBudgetLimitModal, setShowBudgetLimitModal] = useState(false);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState(null);
  const [tempBudgetLimit, setTempBudgetLimit] = useState('');
  // 거래내역 필터링 및 페이지네이션
  const [transactionFilters, setTransactionFilters] = useState({
    dateFrom: '',
    dateTo: '',
    bank: 'all',
    source: 'all',
    category: 'all',
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Auth 훅 - 인증 상태 및 로그인/로그아웃 관리
  const auth = useAuth({
    onAuthSuccess: (user) => {
      loadUserProfile(user.id);
      setShowAuthModal(false);
    },
    onLogout: () => {
      // 데이터 캐시 초기화
      isDataLoadedRef.current = false;
      loadingUserIdRef.current = null;
      challengesData.reset();
    },
  });

  // 기존 코드 호환을 위한 destructuring
  const {
    isAuthenticated,
    currentUser,
    authMode,
    setAuthMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authName,
    setAuthName,
    authError,
    setAuthError,
    isSubmitting: authIsSubmitting,
    handleEmailLogin,
    handleEmailSignup,
    handleKakaoLogin,
    handleLogout,
  } = auth;

  // Challenges 탭 지연 로드 훅
  const challengesData = useChallengesData(currentUser?.id);

  const activeTheme = TAB_THEMES[currentTab] || TAB_THEMES.dashboard;
  const themeStyle = {
    '--theme-primary': activeTheme.primary,
    '--theme-soft': activeTheme.soft,
    '--theme-text': activeTheme.text,
    '--theme-border': activeTheme.border,
    '--theme-accent': ACCENT_GOLD,
  };

  // 스크롤 이벤트 리스너 - 상단바 축소 효과
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 사용자 프로필 로드 (useAuth onAuthSuccess 콜백에서 호출)
  const loadUserProfile = async (userId) => {
    try {
      const profile = await authAPI.getProfile(userId);
      if (profile) {
        setUserProfile({
          name: profile.name || '사용자',
          email: profile.email,
          level: profile.level || 1,
          currentExp: profile.current_exp || 0,
          expToNextLevel: profile.exp_to_next_level || 500,
          badges: profile.badges || [],
          points: profile.points || 0,
          rank: profile.rank || 10000,
          totalUsers: 15234,
          streak: profile.streak || 0,
          totalSaved: profile.total_saved || 0,
          taxHealthScore: profile.tax_health_score || 50,
        });
        setIsPremium(profile.is_premium || false);
        setUserType(profile.user_type || 'individual');
        // taxBasicInfo 로드
        if (profile.tax_basic_info) {
          setTaxBasicInfo({
            annualIncome: profile.tax_basic_info.annualIncome || 50000000,
            dependents: profile.tax_basic_info.dependents || 0,
            hasSpouse: profile.tax_basic_info.hasSpouse || false,
            childDependents: profile.tax_basic_info.childDependents || profile.tax_basic_info.dependents || 0,
            expectedRevenue: profile.tax_basic_info.expectedRevenue || 100000000,
            expectedExpenses: profile.tax_basic_info.expectedExpenses || 60000000,
            isSimplifiedTax: profile.tax_basic_info.isSimplifiedTax || false,
          });
        }
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  // 유저타입 변경 핸들러 (설정에서 사용) - 즉시 상태만 변경
  const handleUserTypeChange = (newType) => {
    setUserType(newType);
  };

  // 설정 저장 핸들러 (유저타입 + taxBasicInfo 모두 저장)
  const handleSaveSettings = async () => {
    try {
      if (currentUser) {
        await authAPI.updateProfile(currentUser.id, {
          user_type: userType,
          tax_basic_info: taxBasicInfo,
        });
        setShowSettingsModal(false);
        console.log('✅ 설정 저장 완료:', { userType, taxBasicInfo });
      }
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  // 로그인/회원가입/로그아웃 함수는 useAuth 훅에서 제공 (handleEmailLogin, handleEmailSignup, handleKakaoLogin, handleLogout)

  // Tax Health Score
  const [taxHealthScore, setTaxHealthScore] = useState(50);

  // Real-time AI Insights (세무사급 AI 알림) - API에서 로드
  const [aiInsights, setAiInsights] = useState([]);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);

  // Deduction Tracker (공제 항목 자동 추적) - API에서 로드
  const [deductionTracker, setDeductionTracker] = useState({});

  // Document Space (증빙 자료 자동 정리) - API에서 로드
  const [documentSpace, setDocumentSpace] = useState({
    yearEnd: { name: '연말정산', count: 0, folders: [] },
    comprehensiveTax: { name: '종합소득세', count: 0, folders: [] },
    vat: { name: '부가가치세', count: 0, folders: [] },
  });

  // Notification Center - API에서 로드
  const [notificationCenter, setNotificationCenter] = useState([]);

  // Linked accounts - API에서 로드
  const [linkedAccounts, setLinkedAccounts] = useState([]);

  // Available Banks - API에서 로드
  const [availableBanks, setAvailableBanks] = useState([]);

  // Auto Transactions - API에서 로드
  const [autoTransactions, setAutoTransactions] = useState([]);

  // User Profile - 기본값 (API 로드 시 업데이트)
  const [userProfile, setUserProfile] = useState({
    name: '사용자',
    email: '',
    level: 1,
    currentExp: 0,
    expToNextLevel: 500,
    badges: [],
    points: 0,
    rank: 0,
    totalUsers: 0,
    streak: 0,
    totalSaved: 0,
    taxHealthScore: 50,
  });

  // Daily/Weekly Missions - API에서 로드
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyMissions, setWeeklyMissions] = useState([]);

  // Events - API에서 로드
  const [events, setEvents] = useState([]);

  // Rewards, Challenges, Leaderboard, Notifications - API에서 로드
  const [rewards, setRewards] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  // monthlySpendingTrendData 제거 - receipts/budgets에서 useMemo로 계산
  const [notifications, setNotifications] = useState([]);

  // Community, Receipts, Budgets - API에서 로드
  const [communityPosts, setCommunityPosts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [budgets, setBudgets] = useState({});

  // Tax Data - API에서 로드
  const [individualTaxData, setIndividualTaxData] = useState([]);
  const [businessTaxData, setBusinessTaxData] = useState([]);

  // 프리미엄 비교 데이터 (정적 - 변경 불필요)
  const premiumComparisonData = [
    { feature: '세금절감', free: 20, premium: 85 },
    { feature: '예측정확도', free: 30, premium: 95 },
    { feature: '절약팁', free: 40, premium: 90 },
    { feature: '전문가상담', free: 0, premium: 100 },
    { feature: '커스텀분석', free: 25, premium: 95 },
  ];

  // Tax Experts, Financial Products - API에서 로드
  const [taxExperts, setTaxExperts] = useState([]);
  const [financialProducts, setFinancialProducts] = useState([]);

  const [newReceipt, setNewReceipt] = useState({
    merchant: '',
    amount: '',
    category: '식비',
    date: new Date().toISOString().split('T')[0],
  });

  // API 데이터 로드 함수
  const loadDataFromAPI = useCallback(async (userId = null) => {
    if (!userId && !currentUser?.id) {
      console.log('사용자 ID가 없어 API 로드를 건너뜁니다.');
      return;
    }

    const uid = userId || currentUser.id;

    // 이미 같은 사용자 데이터 로드 완료면 스킵
    if (isDataLoadedRef.current && loadingUserIdRef.current === uid) {
      console.log('🔄 데이터 이미 로드됨, 스킵 - User ID:', uid);
      return;
    }

    // 다른 사용자면 ref 초기화
    if (loadingUserIdRef.current !== uid) {
      isDataLoadedRef.current = false;
    }

    loadingUserIdRef.current = uid;
    console.log('🔄 API 로드 시작 - User ID:', uid);
    setIsLoading(true);
    setApiError(null);

    // 에러 발생 시 toast 알림 + fallback 반환 헬퍼
    const failedApis = [];
    const withErrorHandling = (promise, name, fallback = []) =>
      promise.catch((error) => {
        console.error(`[${name}] 로드 실패:`, error);
        failedApis.push(name);
        return fallback;
      });

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
      const currentYear = new Date().getFullYear();

      // 병렬로 API 호출 (challenges 관련은 탭 선택 시 지연 로드)
      const [
        receiptsData,
        autoTransactionsData,
        linkedAccountsData,
        budgetsData,
        dailyMissionsData,
        eventsData,
        aiInsightsData,
        notificationCenterData,
        notificationsData,
        deductionTrackerData,
        documentSpaceData,
        individualTaxDataResult,
        businessTaxDataResult,
        availableBanksData,
        communityPostsData,
        taxExpertsData,
        financialProductsData,
        // monthlySpendingTrend는 receipts/budgets에서 계산하므로 API 호출 불필요
      ] = await Promise.all([
        withErrorHandling(receiptsAPI.getAll(uid), '영수증'),
        withErrorHandling(autoTransactionsAPI.getAll(uid), '자동거래'),
        withErrorHandling(accountsAPI.getLinkedAccounts(uid), '연결계좌'),
        withErrorHandling(budgetsAPI.getAll(uid, currentMonth), '예산'),
        withErrorHandling(missionsAPI.getDailyMissions(), '일일미션'),
        withErrorHandling(eventsAPI.getAll(), '이벤트'),
        withErrorHandling(insightsAPI.getAll(uid), 'AI인사이트'),
        withErrorHandling(notificationCenterAPI.getAll(uid), '알림센터'),
        withErrorHandling(notificationsAPI.getAll(uid), '알림'),
        withErrorHandling(deductionAPI.getAll(uid, currentYear), '공제추적'),
        withErrorHandling(documentFoldersAPI.getAll(uid), '문서폴더', {}),
        withErrorHandling(taxAPI.getIndividualTax(uid, currentYear), '개인세금'),
        withErrorHandling(taxAPI.getBusinessTax(uid, currentYear), '사업세금'),
        withErrorHandling(banksAPI.getAll(), '은행목록'),
        withErrorHandling(communityAPI.getPosts(), '커뮤니티'),
        withErrorHandling(expertsAPI.getAll(), '전문가'),
        withErrorHandling(productsAPI.getAll(), '금융상품'),
      ]);

      // 실패한 API가 있으면 사용자에게 알림
      if (failedApis.length > 0) {
        if (failedApis.length <= 3) {
          toast.warning(`일부 데이터 로드 실패: ${failedApis.join(', ')}`);
        } else {
          toast.warning(`${failedApis.length}개 데이터 로드 실패: ${failedApis.slice(0, 3).join(', ')} 외`);
        }
      }

      console.log('📦 receiptsData:', receiptsData?.length || 0, '건');
      console.log('📦 budgetsData:', budgetsData?.length || 0, '건');

      // 데이터가 있으면 상태 업데이트
      if (receiptsData?.length > 0) setReceipts(receiptsData);
      if (autoTransactionsData?.length > 0) setAutoTransactions(autoTransactionsData);
      if (linkedAccountsData?.length > 0) setLinkedAccounts(linkedAccountsData);
      if (availableBanksData?.length > 0) setAvailableBanks(availableBanksData);

      // 예산 데이터 변환 (배열 -> 객체)
      if (budgetsData?.length > 0) {
        const budgetObj = {};
        budgetsData.forEach(b => { budgetObj[b.category] = b.amount; });
        setBudgets(budgetObj);
      }

      // challenges 관련 데이터는 useChallengesData 훅에서 탭 선택 시 로드
      if (dailyMissionsData?.length > 0) setDailyMissions(dailyMissionsData);
      if (eventsData?.length > 0) setEvents(eventsData);
      if (communityPostsData?.length > 0) setCommunityPosts(communityPostsData);
      if (taxExpertsData?.length > 0) setTaxExperts(taxExpertsData);
      if (financialProductsData?.length > 0) setFinancialProducts(financialProductsData);
      // monthlySpendingTrend는 receipts/budgets에서 useMemo로 계산

      // AI 인사이트: DB 인사이트 + 규칙 기반 인사이트 병합
      {
        const iconMap = { medical: Pill, education: GraduationCap, card: CreditCard, housing: Home, pension: Wallet, donation: Heart, budget: PieChart, deadline: AlertCircle };

        // 1. DB에서 가져온 인사이트에 아이콘 추가
        const dbInsights = (aiInsightsData || []).map(insight => ({
          ...insight,
          icon: iconMap[insight.category] || AlertCircle,
          source: 'db',
        }));

        // 2. 규칙 기반 인사이트 생성 (deductionTracker 변환 후 사용)
        let deductionObj = {};
        if (deductionTrackerData?.length > 0) {
          deductionTrackerData.forEach(d => {
            deductionObj[d.category] = {
              current: d.current_amount,
              maxDeduction: d.max_deduction,
            };
          });
        }

        // 연소득 추정 (개인 세금 데이터에서 가져오거나 기본값)
        const annualIncome = individualTaxDataResult?.[0]?.income || 40000000;

        // 규칙 기반 인사이트 생성
        const ruleBasedInsights = generateAllInsights(
          deductionObj,
          receiptsData || [],
          budgetsData || {},
          annualIncome,
          userType
        ).map(insight => ({
          ...insight,
          icon: iconMap[insight.category] || AlertCircle,
          source: 'rule',
        }));

        // 3. 중복 제거 후 병합 (같은 카테고리의 DB 인사이트가 있으면 규칙 기반 제외)
        const dbCategories = new Set(dbInsights.map(i => i.category));
        const filteredRuleInsights = ruleBasedInsights.filter(i => !dbCategories.has(i.category));

        const combinedInsights = [...dbInsights, ...filteredRuleInsights];
        setAiInsights(combinedInsights);
      }

      if (notificationCenterData?.length > 0) setNotificationCenter(notificationCenterData);
      if (notificationsData?.length > 0) setNotifications(notificationsData);

      // 공제 추적 데이터 변환
      if (deductionTrackerData?.length > 0) {
        const iconMap = { medical: Pill, education: GraduationCap, housing: Home, donation: Heart, pension: Wallet };
        const colorMap = { medical: 'red', education: 'blue', housing: 'green', donation: 'pink', pension: 'purple' };
        const deductionObj = {};
        deductionTrackerData.forEach(d => {
          deductionObj[d.category] = {
            name: d.name,
            current: d.current_amount,
            threshold: d.threshold,
            maxDeduction: d.max_deduction,
            deductionRate: d.deduction_rate,
            potentialSaving: d.potential_saving,
            icon: iconMap[d.category] || Wallet,
            color: colorMap[d.category] || 'gray',
            documents: d.documents_count,
          };
        });
        setDeductionTracker(deductionObj);
      }

      // 문서 공간 데이터 (이미 그룹화된 형태로 반환됨)
      if (documentSpaceData && Object.keys(documentSpaceData).length > 0) {
        setDocumentSpace(documentSpaceData);
      }

      // 세금 데이터 변환
      if (individualTaxDataResult?.length > 0) {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        const taxData = individualTaxDataResult.map(d => ({
          month: months[d.month - 1],
          actual: d.actual_tax,
          predicted: d.predicted_tax,
          expense: d.expense,
        }));
        setIndividualTaxData(taxData);
      }

      if (businessTaxDataResult?.length > 0) {
        const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        const taxData = businessTaxDataResult.map(d => ({
          month: months[d.month - 1],
          actual: d.actual_tax,
          predicted: d.predicted_tax,
          income: d.income,
          expense: d.expense,
          vat: d.vat,
        }));
        setBusinessTaxData(taxData);
      }

      console.log('API 데이터 로드 완료');
      isDataLoadedRef.current = true; // 로드 완료 표시
    } catch (error) {
      console.error('API 데이터 로드 실패:', error);
      setApiError('데이터를 불러오는 중 오류가 발생했습니다.');
      toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      isDataLoadedRef.current = true; // 에러여도 재시도 방지 (수동 새로고침 필요)
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  // 사용자 로그인 시 API 데이터 로드
  useEffect(() => {
    if (currentUser?.id) {
      loadDataFromAPI(currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // loadDataFromAPI는 ref로 중복 방지하므로 의존성에서 제외

  // Challenges 탭 선택 시 지연 로드
  useEffect(() => {
    if (currentTab === 'challenges' && currentUser?.id) {
      challengesData.loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, currentUser?.id]); // loadData는 useChallengesData 내부 ref로 중복 방지

  // Supabase Realtime 구독 - 양방향 데이터 동기화
  useEffect(() => {
    if (!currentUser?.id) return;

    const uid = currentUser.id;
    console.log('🔔 Realtime 구독 시작 - User ID:', uid);

    // receipts 테이블 구독
    const receiptsChannel = supabase
      .channel('receipts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'receipts', filter: `user_id=eq.${uid}` },
        (payload) => {
          console.log('📨 receipts 변경 감지:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            setReceipts(prev => [payload.new, ...prev.filter(r => r.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setReceipts(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
          } else if (payload.eventType === 'DELETE') {
            setReceipts(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // budgets 테이블 구독
    const budgetsChannel = supabase
      .channel('budgets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${uid}` },
        (payload) => {
          console.log('📨 budgets 변경 감지:', payload.eventType, payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setBudgets(prev => ({ ...prev, [payload.new.category]: payload.new.amount }));
          } else if (payload.eventType === 'DELETE') {
            setBudgets(prev => {
              const updated = { ...prev };
              delete updated[payload.old.category];
              return updated;
            });
          }
        }
      )
      .subscribe();

    // profiles 테이블 구독 (유저타입, 세금정보 등)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` },
        (payload) => {
          console.log('📨 profiles 변경 감지:', payload);
          const profile = payload.new;
          if (profile.user_type) setUserType(profile.user_type);
          if (profile.tax_basic_info) {
            setTaxBasicInfo({
              annualIncome: profile.tax_basic_info.annualIncome || 50000000,
              dependents: profile.tax_basic_info.dependents || 0,
              hasSpouse: profile.tax_basic_info.hasSpouse || false,
              childDependents: profile.tax_basic_info.childDependents || profile.tax_basic_info.dependents || 0,
              expectedRevenue: profile.tax_basic_info.expectedRevenue || 100000000,
              expectedExpenses: profile.tax_basic_info.expectedExpenses || 60000000,
              isSimplifiedTax: profile.tax_basic_info.isSimplifiedTax || false,
            });
          }
          if (profile.is_premium !== undefined) setIsPremium(profile.is_premium);
        }
      )
      .subscribe();

    // linked_accounts 테이블 구독
    const accountsChannel = supabase
      .channel('accounts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'linked_accounts', filter: `user_id=eq.${uid}` },
        (payload) => {
          console.log('📨 linked_accounts 변경 감지:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            setLinkedAccounts(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setLinkedAccounts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
          } else if (payload.eventType === 'DELETE') {
            setLinkedAccounts(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('🔕 Realtime 구독 해제');
      supabase.removeChannel(receiptsChannel);
      supabase.removeChannel(budgetsChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(accountsChannel);
    };
  }, [currentUser?.id]);

  // Calculate Tax Health Score - 유저타입별 다른 기준 적용
  const calculateTaxHealthScore = () => {
    let score = 100;

    if (userType === 'individual') {
      // 개인: 공제 활용도 중심
      
      // 1. 공제 활용도 (최대 -25점)
      const deductionUsage = Object.keys(deductionTracker).length > 0 
        ? Object.values(deductionTracker).reduce((sum, item) => {
            return sum + (item.current / item.maxDeduction);
          }, 0) / Object.keys(deductionTracker).length
        : 0;
      score -= (1 - deductionUsage) * 25;

      // 2. 증빙 완성도 (최대 -15점)
      const totalDocs = Object.values(deductionTracker).reduce((sum, item) => sum + item.documents, 0);
      if (totalDocs < 10) score -= 15;
      else if (totalDocs < 20) score -= 10;
      else if (totalDocs < 30) score -= 5;

      // 3. 연말정산 준비 상태 (최대 -10점)
      const deductionCategories = Object.keys(deductionTracker).length;
      if (deductionCategories < 3) score -= 10;
      else if (deductionCategories < 5) score -= 5;

    } else {
      // 소상공인: 경비처리 + 부가세 관리 중심
      
      // 1. 경비 기록 완성도 (최대 -25점)
      const monthlyReceiptCount = receipts.filter(r => {
        const receiptDate = new Date(r.date);
        const now = new Date();
        return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
      }).length;
      if (monthlyReceiptCount < 10) score -= 25;
      else if (monthlyReceiptCount < 30) score -= 15;
      else if (monthlyReceiptCount < 50) score -= 5;

      // 2. 자동 연동 활용도 (최대 -15점)
      const linkedCount = linkedAccounts.length;
      if (linkedCount === 0) score -= 15;
      else if (linkedCount < 2) score -= 10;
      else if (linkedCount < 3) score -= 5;

      // 3. 부가세 신고 대비 (최대 -10점)
      const hasVatReady = receipts.filter(r => r.tax > 0).length > 0;
      if (!hasVatReady) score -= 10;
    }

    // 공통: 연속 출석 보너스
    if (userProfile.streak >= 7) score = Math.min(100, score + 5);
    
    return Math.max(0, Math.round(score));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const monthlyReceipts = receipts.filter(r => new Date(r.date).getMonth() === currentMonth);
    const monthlyAuto = autoTransactions.filter(t => new Date(t.date).getMonth() === currentMonth);

    const totalSpent = monthlyReceipts.reduce((sum, r) => sum + r.amount, 0) +
      monthlyAuto.reduce((sum, t) => sum + t.amount, 0);
    const totalTax = monthlyReceipts.reduce((sum, r) => sum + r.tax, 0) +
      monthlyAuto.reduce((sum, t) => sum + t.tax, 0);
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);

    const categorySpending = {};
    monthlyReceipts.forEach(r => {
      categorySpending[r.category] = (categorySpending[r.category] || 0) + r.amount;
    });
    monthlyAuto.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const budgetUsage = Object.entries(budgets).map(([category, budget]) => ({
      category,
      spent: categorySpending[category] || 0,
      budget,
      percentage: ((categorySpending[category] || 0) / budget * 100).toFixed(1),
    }));

    // 실제 세금 계산 (taxCalculator 사용)
    let taxEstimate = 0;
    try {
      if (userType === 'individual') {
        const taxResult = calculateIndividualTax({
          annualIncome: taxBasicInfo.annualIncome,
          dependents: taxBasicInfo.dependents,
          hasSpouse: taxBasicInfo.hasSpouse,
          childDependents: taxBasicInfo.childDependents || taxBasicInfo.dependents,
        });
        taxEstimate = taxResult.totalTax || 0;
      } else {
        const taxResult = calculateBusinessTax({
          revenue: taxBasicInfo.expectedRevenue,
          expenses: taxBasicInfo.expectedExpenses,
          dependents: taxBasicInfo.dependents || 0,
          hasSpouse: taxBasicInfo.hasSpouse || false,
        });
        taxEstimate = taxResult.totalTax || 0;
      }
    } catch (e) {
      taxEstimate = 0;
    }

    return {
      totalSpent,
      totalTax,
      totalBudget,
      budgetRemaining: totalBudget - totalSpent,
      categorySpending,
      budgetUsage,
      receiptCount: monthlyReceipts.length + monthlyAuto.length,
      manualCount: monthlyReceipts.length,
      autoCount: monthlyAuto.length,
      taxEstimate,
    };
  }, [receipts, autoTransactions, budgets]);

  // Handle functions
  const handleAttendanceCheck = async () => {
    try {
      const result = await gamificationAPI.checkAttendance(1);
      if (result.success) {
        const today = attendanceChecked.findIndex(day => !day);
        if (today !== -1) {
          const newAttendance = [...attendanceChecked];
          newAttendance[today] = true;
          setAttendanceChecked(newAttendance);
        }
        setUserProfile({
          ...userProfile,
          points: userProfile.points + result.points,
          currentExp: userProfile.currentExp + 20,
          streak: userProfile.streak + 1,
        });
        console.log('✅ 출석체크 완료! +' + result.points + 'P');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('출석체크 실패:', error);
      // Fallback
      const today = attendanceChecked.findIndex(day => !day);
      if (today !== -1) {
        const newAttendance = [...attendanceChecked];
        newAttendance[today] = true;
        setAttendanceChecked(newAttendance);
        setUserProfile({
          ...userProfile,
          points: userProfile.points + 50,
          currentExp: userProfile.currentExp + 20,
          streak: userProfile.streak + 1,
        });
      }
    }
  };

  // AI 인사이트 새로고침 (OpenAI 호출)
  const handleRefreshAIInsights = async () => {
    if (!currentUser?.id) return;

    setIsRefreshingAI(true);
    try {
      const newInsights = await insightsAPI.generateWithAI(currentUser.id);

      // 아이콘 매핑 추가
      const iconMap = { medical: Pill, education: GraduationCap, card: CreditCard, housing: Home, pension: Wallet, donation: Heart };
      const insightsWithIcons = newInsights.map(insight => ({
        ...insight,
        icon: iconMap[insight.category] || AlertCircle,
        potentialSaving: insight.potential_saving,
      }));

      setAiInsights(insightsWithIcons);
      console.log('✅ AI 인사이트 새로고침 완료!', newInsights.length + '건');
    } catch (error) {
      console.error('AI 인사이트 생성 실패:', error);
      alert('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleRewardExchange = async (reward) => {
    if (userProfile.points >= reward.points) {
      try {
        await gamificationAPI.exchangeReward(1, reward);
        setUserProfile({
          ...userProfile,
          points: userProfile.points - reward.points,
        });
        setSelectedReward(reward);
        setShowRewardModal(true);
        console.log('✅ 리워드 교환 완료:', reward.name);
      } catch (error) {
        console.error('리워드 교환 실패:', error);
        // Fallback
        setUserProfile({
          ...userProfile,
          points: userProfile.points - reward.points,
        });
        setSelectedReward(reward);
        setShowRewardModal(true);
      }
    } else {
      alert('포인트가 부족합니다.');
    }
  };

  const handleLinkAccount = async (bank) => {
    // 이미 연동된 계좌인지 확인
    const alreadyLinked = linkedAccounts.some(a => a.bank === bank.name);
    if (alreadyLinked) {
      alert(`${bank.name}은(는) 이미 연동되어 있습니다.`);
      return;
    }

    try {
      const newAccountData = {
        userId: currentUser?.id || 1,
        type: bank.icon === '💳' ? 'credit' : 'account',
        bank: bank.name,
        name: `${bank.name} 계좌`,
        lastDigits: Math.floor(1000 + Math.random() * 9000).toString(),
        color: bank.color,
        icon: bank.icon,
      };

      const newAccount = await accountsAPI.linkAccount(newAccountData);

      // 더미 거래내역 생성 (Supabase에서 해당 은행/카드의 거래 조회)
      const dummyTransactions = await generateDummyTransactions(bank.name, newAccount.id);

      setLinkedAccounts([...linkedAccounts, { ...newAccount, monthlySpent: dummyTransactions.reduce((sum, t) => sum + t.amount, 0), transactionCount: dummyTransactions.length }]);
      setAutoTransactions([...autoTransactions, ...dummyTransactions]);
      setShowAccountLinkModal(false);

      // 사용자 포인트 업데이트
      setUserProfile({
        ...userProfile,
        points: userProfile.points + 100,
        currentExp: userProfile.currentExp + 50,
      });

      console.log('✅ 계좌 연결 완료:', newAccount.bank);
    } catch (error) {
      console.error('계좌 연결 실패:', error);
      // Fallback to local state update
      const newAccount = {
        id: Date.now(),
        type: bank.icon === '💳' ? 'credit' : 'account',
        bank: bank.name,
        name: `${bank.name} 계좌`,
        lastDigits: Math.floor(1000 + Math.random() * 9000).toString(),
        color: bank.color,
        icon: bank.icon,
        linkedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        monthlySpent: 0,
        transactionCount: 0,
      };

      // 더미 거래내역 생성 (Supabase에서 조회)
      const dummyTransactions = await generateDummyTransactions(bank.name, newAccount.id);
      newAccount.monthlySpent = dummyTransactions.reduce((sum, t) => sum + t.amount, 0);
      newAccount.transactionCount = dummyTransactions.length;

      setLinkedAccounts([...linkedAccounts, newAccount]);
      setAutoTransactions([...autoTransactions, ...dummyTransactions]);
      setShowAccountLinkModal(false);
      setUserProfile({
        ...userProfile,
        points: userProfile.points + 100,
        currentExp: userProfile.currentExp + 50,
      });
    }
  };

  // 더미 거래내역 생성 함수 (Supabase에서 데이터 조회)
  const generateDummyTransactions = async (bankName, accountId) => {
    try {
      // Supabase에서 해당 금융사의 더미 데이터 조회
      let dummyData = await bankDummyTransactionsAPI.getByBank(bankName);

      // 해당 금융사 데이터가 없으면 기본 데이터 사용
      if (!dummyData || dummyData.length === 0) {
        dummyData = await bankDummyTransactionsAPI.getDefault();
      }

      const today = new Date();

      return dummyData.map((item, idx) => {
        const date = new Date(today);
        date.setDate(date.getDate() - idx * 3 - Math.floor(Math.random() * 3));
        const hours = Math.floor(Math.random() * 14) + 8; // 8~22시
        const minutes = Math.floor(Math.random() * 60);

        return {
          id: `auto-${Date.now()}-${idx}`,
          accountId: accountId,
          merchant: item.merchant,
          category: item.category,
          amount: Math.abs(item.amount),
          tax: Math.floor(Math.abs(item.amount) * 0.1),
          date: date.toISOString().split('T')[0],
          time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          type: 'auto',
          source: 'auto',
          bankName: bankName,
        };
      });
    } catch (error) {
      console.error('더미 거래내역 조회 실패, 기본값 사용:', error);
      // API 실패 시 fallback 데이터
      const fallbackData = [
        { merchant: '편의점', category: '식비', amount: 5000 },
        { merchant: '카페', category: '식비', amount: 4500 },
        { merchant: '마트', category: '식비', amount: 35000 },
      ];

      const today = new Date();
      return fallbackData.map((item, idx) => {
        const date = new Date(today);
        date.setDate(date.getDate() - idx * 3);
        return {
          id: `auto-${Date.now()}-${idx}`,
          accountId: accountId,
          merchant: item.merchant,
          category: item.category,
          amount: item.amount,
          tax: Math.floor(item.amount * 0.1),
          date: date.toISOString().split('T')[0],
          time: '12:00',
          type: 'auto',
          source: 'auto',
          bankName: bankName,
        };
      });
    }
  };

  // 계좌 연동 해제
  const handleUnlinkAccount = async (account) => {
    if (!confirm(`${account.bank} 연동을 해제하시겠습니까?\n연동 해제 시 해당 계좌의 자동 수집된 거래내역도 삭제됩니다.`)) {
      return;
    }

    try {
      await accountsAPI.unlinkAccount(account.id);
      setLinkedAccounts(linkedAccounts.filter(a => a.id !== account.id));
      setAutoTransactions(autoTransactions.filter(t => t.accountId !== account.id));
      console.log('✅ 계좌 연동 해제:', account.bank);
    } catch (error) {
      console.error('계좌 연동 해제 실패:', error);
      // Fallback
      setLinkedAccounts(linkedAccounts.filter(a => a.id !== account.id));
      setAutoTransactions(autoTransactions.filter(t => t.accountId !== account.id));
    }
  };

  // 거래내역 삭제
  const handleDeleteTransaction = async (transaction) => {
    if (!confirm(`"${transaction.merchant}" 거래를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      if (transaction.source === 'manual') {
        await receiptsAPI.delete(transaction.id);
        setReceipts(receipts.filter(r => r.id !== transaction.id));
      } else {
        setAutoTransactions(autoTransactions.filter(t => t.id !== transaction.id));
      }
      setShowTransactionDetailModal(false);
      setSelectedTransaction(null);
      console.log('✅ 거래 삭제 완료');
    } catch (error) {
      console.error('거래 삭제 실패:', error);
      // Fallback
      if (transaction.source === 'manual') {
        setReceipts(receipts.filter(r => r.id !== transaction.id));
      } else {
        setAutoTransactions(autoTransactions.filter(t => t.id !== transaction.id));
      }
      setShowTransactionDetailModal(false);
      setSelectedTransaction(null);
    }
  };

  // 거래내역 클릭 핸들러
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailModal(true);
  };

  const handleAddReceipt = async () => {
    if (!newReceipt.merchant || !newReceipt.amount) return;

    try {
      const amount = parseInt(newReceipt.amount);
      const receiptData = {
        userId: 1,
        date: newReceipt.date,
        merchant: newReceipt.merchant,
        category: newReceipt.category,
        amount: amount,
      };

      const savedReceipt = await receiptsAPI.create(receiptData);
      setReceipts([savedReceipt, ...receipts]);

      // 미션 및 챌린지 진행상황 업데이트
      setDailyMissions(dailyMissions.map(m =>
        m.id === 1 ? { ...m, progress: Math.min(m.progress + 1, m.target) } : m
      ));

      setChallenges(challenges.map(c =>
        c.id === 2 ? { ...c, progress: Math.min(c.progress + 1, c.target) } : c
      ));

      // 사용자 포인트 업데이트
      setUserProfile({
        ...userProfile,
        points: userProfile.points + 10,
        currentExp: userProfile.currentExp + 5,
      });

      setNewReceipt({
        merchant: '',
        amount: '',
        category: '식비',
        date: new Date().toISOString().split('T')[0],
      });
      setShowReceiptModal(false);

      console.log('✅ 영수증 추가 완료:', savedReceipt.merchant);
    } catch (error) {
      console.error('영수증 추가 실패:', error);
      // Fallback to local state update
      const amount = parseInt(newReceipt.amount);
      const receipt = {
        id: Date.now(),
        date: newReceipt.date,
        merchant: newReceipt.merchant,
        category: newReceipt.category,
        amount: amount,
        tax: Math.floor(amount * 0.1),
        type: 'manual',
      };
      setReceipts([receipt, ...receipts]);
      setDailyMissions(dailyMissions.map(m =>
        m.id === 1 ? { ...m, progress: Math.min(m.progress + 1, m.target) } : m
      ));
      setChallenges(challenges.map(c =>
        c.id === 2 ? { ...c, progress: Math.min(c.progress + 1, c.target) } : c
      ));
      setUserProfile({
        ...userProfile,
        points: userProfile.points + 10,
        currentExp: userProfile.currentExp + 5,
      });
      setNewReceipt({
        merchant: '',
        amount: '',
        category: '식비',
        date: new Date().toISOString().split('T')[0],
      });
      setShowReceiptModal(false);
    }
  };

  // OCR 진행률 상태
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 이미지 파일 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);
    setOcrProgress(0);

    try {
      // 큰 이미지는 압축
      let processFile = file;
      if (file.size > 2 * 1024 * 1024) { // 2MB 이상
        console.log('이미지 압축 중...');
        processFile = await compressImage(file);
      }

      // 실제 OCR 처리
      console.log('OCR 처리 시작...');
      const ocrResult = await processReceiptImage(processFile, (progress) => {
        setOcrProgress(progress);
      });

      console.log('OCR 결과:', ocrResult);

      // 결과가 있으면 폼에 설정
      setNewReceipt({
        merchant: ocrResult.merchant || '',
        amount: ocrResult.amount ? ocrResult.amount.toString() : '',
        category: ocrResult.category || '기타',
        date: ocrResult.date || new Date().toISOString().split('T')[0],
      });

      setShowReceiptModal(true);

      const confidence = (ocrResult.confidence * 100).toFixed(1);
      console.log(`✅ OCR 처리 완료, 신뢰도: ${confidence}%`);

      if (ocrResult.confidence < 0.5) {
        alert(`OCR 인식률이 낮습니다 (${confidence}%). 직접 수정해주세요.`);
      }
    } catch (error) {
      console.error('OCR 처리 실패:', error);
      alert('영수증 인식에 실패했습니다. 직접 입력해주세요.');
      // 빈 폼으로 모달 열기
      setNewReceipt({
        merchant: '',
        amount: '',
        category: '식비',
        date: new Date().toISOString().split('T')[0],
      });
      setShowReceiptModal(true);
    } finally {
      setIsLoading(false);
      setOcrProgress(0);
      // input 초기화
      e.target.value = '';
    }
  };

  // Generate PDF Report
  const generatePDFReport = async (reportType = 'monthly') => {
    setIsLoading(true);
    try {
      let fileName = '';
      if (reportType === 'monthly') {
        fileName = await generateMonthlyExpenseReport({
          receipts,
          budgets,
          stats,
          userProfile,
        });
      } else if (reportType === 'yearEnd') {
        // taxSimulatorResult가 있으면 재사용 (시뮬레이터에서 계산한 결과 그대로 사용)
        // 없으면 먼저 시뮬레이터에서 계산하도록 안내
        if (!taxSimulatorResult) {
          alert('Please calculate tax in the simulator first before generating PDF.');
          setIsLoading(false);
          return;
        }
        fileName = await generateYearEndTaxReport({
          taxResult: taxSimulatorResult,
          userProfile,
        });
      } else if (reportType === 'taxHealth') {
        fileName = await generateTaxHealthReport({
          taxHealthScore,
          deductionTracker,
          userProfile,
        });
      }
      alert(`${fileName} 파일이 다운로드되었습니다.`);
      setShowPDFReportModal(false);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Excel 내보내기
  const handleExcelExport = (exportType = 'receipts') => {
    try {
      let fileName = '';
      if (exportType === 'receipts') {
        fileName = exportReceiptsToExcel(receipts);
      } else if (exportType === 'budget') {
        fileName = exportBudgetToExcel(stats.budgetUsage);
      } else if (exportType === 'all') {
        fileName = exportAllDataToExcel({
          receipts,
          budgetUsage: stats.budgetUsage,
          taxResult: taxSimulatorResult,
          deductionTracker,
        });
      }
      alert(`${fileName} 파일이 다운로드되었습니다.`);
    } catch (error) {
      console.error('Excel 내보내기 실패:', error);
      alert('Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 연말정산 시뮬레이터 데이터
  const [taxSimulatorData, setTaxSimulatorData] = useState({
    annualIncome: 50000000,
    dependents: 0,
    childDependents: 0,
    hasSpouse: false,
    medicalExpenses: 0, // 간단 입력용 합계
    medicalGeneral: 0,
    medicalInfertility: 0,
    medicalSenior: 0,
    educationTotal: 0, // 간단 입력용 합계
    educationSelf: 0,
    educationChild: 0,
    educationUniversity: 0,
    pensionSavings: 0,
    irpAmount: 0,
    donationsSimple: 0, // 간단 입력용 합계
    donationsLegal: 0,
    donationsDesignated: 0,
    donationsReligious: 0,
    donationsPolitical: 0,
    insuranceNational: 0,
    insuranceHealth: 0,
    insuranceEmployment: 0,
    housingDeduction: 0,
    // 2025년 신규: 신용카드 소득공제
    creditCardTotal: 0, // 간단 입력용 총액
    creditCardAmount: 0,
    debitCardAmount: 0,
    cashReceiptAmount: 0,
    traditionalMarketAmount: 0,
    publicTransportAmount: 0,
    cultureAmount: 0,
    sportsAmount: 0,
    previousYearCardTotal: 0, // 전년도 사용액 (소비증가분 계산)
    // 2025년 신규: 월세 세액공제
    annualRent: 0,
    isHomeOwner: false,
    housingSize: 85,
  });

  const [taxSimulatorResult, setTaxSimulatorResult] = useState(null);
  const [autoCalculateFlag, setAutoCalculateFlag] = useState(false);

  // 연말정산 계산
  const calculateTaxSimulation = () => {
    const medicalAdvancedTotal = (taxSimulatorData.medicalGeneral || 0) + (taxSimulatorData.medicalInfertility || 0) + (taxSimulatorData.medicalSenior || 0);
    const medicalTotal = medicalAdvancedTotal > 0 ? medicalAdvancedTotal : (taxSimulatorData.medicalExpenses || 0);
    const hasInfertility = (taxSimulatorData.medicalInfertility || 0) > 0;

    const educationAdvanced = {
      self: taxSimulatorData.educationSelf || 0,
      preschool: taxSimulatorData.educationChild || 0,
      elementary: 0,
      highschool: 0,
      university: taxSimulatorData.educationUniversity || 0,
    };
    const hasAdvancedEducation = Object.values(educationAdvanced).some(v => v > 0);
    const educationExpenses = hasAdvancedEducation
      ? educationAdvanced
      : { self: taxSimulatorData.educationTotal || 0 };

    const donationAdvanced = {
      legal: taxSimulatorData.donationsLegal || 0,
      designated: taxSimulatorData.donationsDesignated || 0,
      religious: taxSimulatorData.donationsReligious || 0,
      political: taxSimulatorData.donationsPolitical || 0,
    };
    const hasAdvancedDonations = Object.values(donationAdvanced).some(v => v > 0);
    const donations = hasAdvancedDonations
      ? donationAdvanced
      : { designated: taxSimulatorData.donationsSimple || 0 };

    const insurancePremiums = {
      national: taxSimulatorData.insuranceNational || 0,
      health: taxSimulatorData.insuranceHealth || 0,
      employment: taxSimulatorData.insuranceEmployment || 0,
    };
    const childDependents = taxSimulatorData.childDependents || taxSimulatorData.dependents || 0;

    // 2025년 신규: 신용카드 소득공제 계산
    const hasAdvancedCardInput = (taxSimulatorData.creditCardAmount || 0) > 0 ||
      (taxSimulatorData.debitCardAmount || 0) > 0 ||
      (taxSimulatorData.cashReceiptAmount || 0) > 0;

    const creditCardResult = hasAdvancedCardInput
      ? calculateCreditCardDeduction({
          annualIncome: taxSimulatorData.annualIncome,
          creditCardAmount: taxSimulatorData.creditCardAmount || 0,
          debitCardAmount: taxSimulatorData.debitCardAmount || 0,
          cashReceiptAmount: taxSimulatorData.cashReceiptAmount || 0,
          traditionalMarketAmount: taxSimulatorData.traditionalMarketAmount || 0,
          publicTransportAmount: taxSimulatorData.publicTransportAmount || 0,
          cultureAmount: taxSimulatorData.cultureAmount || 0,
          sportsAmount: taxSimulatorData.sportsAmount || 0,
          previousYearTotal: taxSimulatorData.previousYearCardTotal || 0,
        })
      : taxSimulatorData.creditCardTotal > 0
        ? calculateCreditCardDeduction({
            annualIncome: taxSimulatorData.annualIncome,
            creditCardAmount: taxSimulatorData.creditCardTotal * 0.6, // 추정 비율
            debitCardAmount: taxSimulatorData.creditCardTotal * 0.3,
            cashReceiptAmount: taxSimulatorData.creditCardTotal * 0.1,
          })
        : null;

    // 2025년 신규: 월세 세액공제 계산
    const rentResult = taxSimulatorData.annualRent > 0
      ? calculateRentTaxCredit({
          annualRent: taxSimulatorData.annualRent,
          annualIncome: taxSimulatorData.annualIncome,
          isHomeOwner: taxSimulatorData.isHomeOwner,
          housingSize: taxSimulatorData.housingSize || 85,
        })
      : null;

    const creditCardDeduction = creditCardResult?.totalDeduction || 0;

    const result = calculateIndividualTax({
      annualIncome: taxSimulatorData.annualIncome,
      dependents: taxSimulatorData.dependents,
      hasSpouse: taxSimulatorData.hasSpouse,
      medicalExpenses: medicalTotal,
      medicalGeneral: taxSimulatorData.medicalGeneral || 0,
      medicalSenior: taxSimulatorData.medicalSenior || 0,
      medicalInfertility: taxSimulatorData.medicalInfertility || 0,
      educationExpenses,
      donations,
      pensionSavings: taxSimulatorData.pensionSavings,
      irpAmount: taxSimulatorData.irpAmount,
      insurancePremiums,
      housingDeduction: taxSimulatorData.housingDeduction || 0,
      hasInfertility,
      childDependents,
      creditCardDeduction,
    });

    // 신용카드 공제 + 월세 세액공제 반영
    const rentCredit = rentResult?.credit || 0;
    const adjustedTaxCredits = result.taxCredits + rentCredit;
    const adjustedFinalTax = Math.max(0, result.calculatedTax - adjustedTaxCredits - result.earnedIncomeTaxCredit);
    const adjustedLocalTax = Math.floor(adjustedFinalTax * 0.10);
    const adjustedTotalTax = adjustedFinalTax + adjustedLocalTax;

    setTaxSimulatorResult({
      ...result,
      // 신용카드 공제는 소득공제라 과세표준에 영향
      creditCardDeduction,
      rentCredit,
      taxCredits: adjustedTaxCredits,
      finalTax: adjustedFinalTax,
      localTax: adjustedLocalTax,
      totalTax: adjustedTotalTax,
      effectiveRate: taxSimulatorData.annualIncome > 0 ? (adjustedTotalTax / taxSimulatorData.annualIncome * 100).toFixed(2) : 0,
      monthlyTax: Math.ceil(adjustedTotalTax / 12),
      meta: {
        medicalTotal,
        educationExpenses,
        donations,
        insurancePremiums,
        hasInfertility,
        childDependents,
        creditCardResult,
        rentResult,
      },
    });
  };

  // 앱 DB에서 데이터 불러오기
  const loadFromAppData = () => {
    // 영수증 데이터에서 카테고리별 합계 계산
    const categoryTotals = receipts.reduce((acc, r) => {
      const cat = r.category || '기타';
      acc[cat] = (acc[cat] || 0) + (r.amount || 0);
      return acc;
    }, {});

    // 카테고리 매핑 (영수증 카테고리 → 세금 공제 항목)
    const medicalCategories = ['병원', '약국', '의료', '건강'];
    const educationCategories = ['교육', '학원', '학비', '수업료'];
    const donationCategories = ['기부', '후원', '봉사'];
    const transportCategories = ['대중교통', '교통', '버스', '지하철'];

    const medicalTotal = Object.entries(categoryTotals)
      .filter(([cat]) => medicalCategories.some(mc => cat.includes(mc)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    const educationTotal = Object.entries(categoryTotals)
      .filter(([cat]) => educationCategories.some(ec => cat.includes(ec)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    const donationTotal = Object.entries(categoryTotals)
      .filter(([cat]) => donationCategories.some(dc => cat.includes(dc)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    const transportTotal = Object.entries(categoryTotals)
      .filter(([cat]) => transportCategories.some(tc => cat.includes(tc)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    // 총 지출 (카드 사용액 추정)
    const totalSpending = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    // 4대보험 자동 계산
    const monthlyIncome = Math.floor(taxBasicInfo.annualIncome / 12);
    const insuranceResult = calculateAnnualInsurancePremiums(monthlyIncome);

    // taxSimulatorData 업데이트
    setTaxSimulatorData({
      annualIncome: taxBasicInfo.annualIncome || 50000000,
      dependents: taxBasicInfo.dependents || 0,
      childDependents: taxBasicInfo.childDependents || 0,
      hasSpouse: taxBasicInfo.hasSpouse || false,
      medicalExpenses: medicalTotal,
      medicalGeneral: medicalTotal,
      medicalInfertility: 0,
      medicalSenior: 0,
      educationTotal: educationTotal,
      educationSelf: 0,
      educationChild: educationTotal,
      educationUniversity: 0,
      pensionSavings: 0,
      irpAmount: 0,
      donationsSimple: donationTotal,
      donationsLegal: 0,
      donationsDesignated: donationTotal,
      donationsReligious: 0,
      donationsPolitical: 0,
      insuranceNational: insuranceResult.annualPension,
      insuranceHealth: insuranceResult.annualHealth + insuranceResult.annualLongTermCare,
      insuranceEmployment: insuranceResult.annualEmployment,
      housingDeduction: 0,
      creditCardTotal: totalSpending,
      creditCardAmount: Math.round(totalSpending * 0.6),
      debitCardAmount: Math.round(totalSpending * 0.3),
      cashReceiptAmount: Math.round(totalSpending * 0.1),
      traditionalMarketAmount: 0,
      publicTransportAmount: transportTotal,
      cultureAmount: 0,
      sportsAmount: 0,
      previousYearCardTotal: 0,
      annualRent: 0,
      isHomeOwner: false,
      housingSize: 85,
    });

    // 자동 계산 플래그 설정 (useEffect에서 계산 트리거)
    setAutoCalculateFlag(true);
  };

  // 4대보험 자동 계산 (연봉 변경 시 자동 적용)
  useEffect(() => {
    if (taxSimulatorData.annualIncome > 0) {
      const monthlyIncome = Math.floor(taxSimulatorData.annualIncome / 12);
      const insuranceResult = calculateAnnualInsurancePremiums(monthlyIncome);
      setTaxSimulatorData(prev => ({
        ...prev,
        insuranceNational: insuranceResult.annualPension,
        insuranceHealth: insuranceResult.annualHealth + insuranceResult.annualLongTermCare,
        insuranceEmployment: insuranceResult.annualEmployment,
      }));
    }
  }, [taxSimulatorData.annualIncome]);

  // 자동 계산 트리거 (데이터 불러오기 후)
  useEffect(() => {
    if (autoCalculateFlag) {
      calculateTaxSimulation();
      setAutoCalculateFlag(false);
    }
  }, [autoCalculateFlag]);

  const chartPalette = useMemo(() => [
    activeTheme.primary,
    NEON_ICE,
    ACCENT_GOLD,
    SUCCESS_GREEN,
    BRAND_COLOR,
    PRIMARY_BLUE,
    '#FF6B6B',
    '#845EC2',
  ], [activeTheme]);

  const pieChartData = Object.entries(stats.categorySpending).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const getCombinedTransactions = (applyPagination = true) => {
    const manual = receipts.map(r => ({ ...r, source: 'manual' }));
    const auto = autoTransactions.map(t => ({ ...t, source: 'auto' }));
    let combined = [...manual, ...auto].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 입력방식 필터
    if (transactionFilters.source !== 'all') {
      combined = combined.filter(t => t.source === transactionFilters.source);
    }

    // 날짜 필터
    if (transactionFilters.dateFrom) {
      combined = combined.filter(t => t.date >= transactionFilters.dateFrom);
    }
    if (transactionFilters.dateTo) {
      combined = combined.filter(t => t.date <= transactionFilters.dateTo);
    }

    // 금융사 필터
    if (transactionFilters.bank !== 'all') {
      combined = combined.filter(t => {
        const bankName = t.bankName || linkedAccounts.find(a => a.id === t.accountId)?.bank;
        return bankName === transactionFilters.bank || (transactionFilters.bank === 'manual' && t.source === 'manual');
      });
    }

    // 카테고리 필터
    if (transactionFilters.category !== 'all') {
      combined = combined.filter(t => t.category === transactionFilters.category);
    }

    // 페이지네이션 적용
    if (applyPagination) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return combined.slice(startIndex, startIndex + itemsPerPage);
    }

    return combined;
  };

  // 전체 필터링된 거래 수 (페이지네이션 계산용)
  const totalFilteredTransactions = getCombinedTransactions(false).length;
  const totalPages = Math.ceil(totalFilteredTransactions / itemsPerPage);

  // 고유 카테고리 목록
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    receipts.forEach(r => categories.add(r.category));
    autoTransactions.forEach(t => categories.add(t.category));
    return Array.from(categories).sort();
  }, [receipts, autoTransactions]);

  // 고유 금융사 목록
  const uniqueBanks = useMemo(() => {
    const banks = new Set();
    linkedAccounts.forEach(a => banks.add(a.bank));
    autoTransactions.forEach(t => {
      if (t.bankName) banks.add(t.bankName);
    });
    return Array.from(banks).sort();
  }, [linkedAccounts, autoTransactions]);

  // Get Tax Health Score color (Flat Design - Solid Colors)
  const getTaxHealthColor = (score) => {
    if (score >= 90) return { bg: SUCCESS_GREEN, text: BRAND_COLOR };
    if (score >= 70) return { bg: PRIMARY_BLUE, text: '#FFFFFF' };
    if (score >= 50) return { bg: ACCENT_GOLD, text: BRAND_COLOR };
    return { bg: '#FF4757', text: '#FFFFFF' };
  };

  const taxHealthColor = getTaxHealthColor(taxHealthScore);

  // 세부 Tax Health 점수 계산 (캐시노트 방식 참고 - 규칙 기반)
  const detailedTaxHealthScores = useMemo(() => {
    return calculateDetailedTaxHealthScores({
      deductionTracker,
      transactions: [...receipts, ...autoTransactions],
      receipts,
      annualIncome: userProfile.annualIncome || 50000000,
      prepaidTax: 0, // 기납부세액 (원천징수된 세금)
      userType,
      dependents: userProfile.dependents || 0,
      hasSpouse: userProfile.hasSpouse || false,
      hasBasicDocuments: Object.values(documentSpace).some(d => d.count > 0),
      hasUnverifiedTransactions: receipts.some(t => !t.verified),
      taxDeadlineDays: (() => {
        // 연말정산: 2월 말, 종합소득세: 5월 말
        const now = new Date();
        const yearEndDeadline = new Date(now.getFullYear() + 1, 1, 28); // 다음해 2월 28일
        const compTaxDeadline = new Date(now.getFullYear(), 4, 31); // 5월 31일
        const deadline = userType === 'individual' ? yearEndDeadline : compTaxDeadline;
        return Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
      })(),
    });
  }, [deductionTracker, autoTransactions, receipts, userProfile, userType, documentSpace]);

  // Dashboard View (deprecated - using imported component)
  const _DashboardView = () => (
    <div className="space-y-6">
      {/* User Profile with Tax Health Score */}
      <div
        className="rounded-xl p-6 text-white shadow-flat-md"
        style={{ backgroundColor: activeTheme.primary }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center relative">
              <Crown className="w-10 h-10" />
              <div
                className="absolute -bottom-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: ACCENT_GOLD, color: activeTheme.primary }}
              >
                Lv.{userProfile.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                {isPremium && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: ACCENT_GOLD, color: activeTheme.primary }}
                  >
                    PRO
                  </span>
                )}
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
                >
                  {userType === 'individual' ? '개인' : '사업자'}
                </span>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="ml-2 p-1 bg-white/20 rounded-full hover:bg-white/30 transition"
                  title="설정"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div className="text-sm opacity-90 mb-2">{userProfile.points.toLocaleString()} 포인트</div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="text-xs">{userProfile.streak}일 연속 출석</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75 mb-1">Tax Health Score™</div>
            <div className="text-4xl font-bold">{taxHealthScore}</div>
            <div className="text-xs opacity-75">
              {taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의'}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>레벨 {userProfile.level}</span>
            <span>{userProfile.currentExp} / {userProfile.expToNextLevel} EXP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${(userProfile.currentExp / userProfile.expToNextLevel) * 100}%`, backgroundColor: ACCENT_GOLD }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights - Critical First */}
      {aiInsights.filter(i => i.priority === 'high').length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-orange-900">🔥 세무사 AI 긴급 알림</h3>
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {aiInsights.filter(i => i.priority === 'high').length}건
                </span>
              </div>
              {aiInsights.filter(i => i.priority === 'high').slice(0, 2).map(insight => (
                <div key={insight.id} className="mb-3 last:mb-0">
                  <div className="flex items-start gap-2">
                    <insight.icon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-orange-900">{insight.title}</div>
                      <div className="text-sm text-orange-800 mt-1">{insight.description}</div>
                      {insight.potentialSaving > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            +{insight.potentialSaving.toLocaleString()}원
                          </span>
                          <span className="text-xs text-gray-600">절감 가능</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAIInsightModal(true);
                    }}
                    className="mt-2 text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition"
                  >
                    {insight.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tax Health Score Detail - Enhanced */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">Tax Health Score™</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: taxHealthScore >= 90 ? `${SUCCESS_GREEN}30` :
                  taxHealthScore >= 70 ? `${PRIMARY_BLUE}20` :
                    taxHealthScore >= 50 ? `${ACCENT_GOLD}30` : '#FFE6E8',
                color: taxHealthScore >= 90 ? SUCCESS_GREEN :
                  taxHealthScore >= 70 ? PRIMARY_BLUE :
                    taxHealthScore >= 50 ? '#806B00' : '#CC1F2D'
              }}
            >
              {taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의'}
            </span>
          </div>
          <button
            onClick={() => setShowPDFReportModal(true)}
            className="text-sm px-3 py-1 rounded-lg hover:opacity-80 transition flex items-center gap-1"
            style={{ backgroundColor: activeTheme.soft, color: activeTheme.primary }}
          >
            <Download className="w-4 h-4" />
            리포트 다운로드
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 게이지 차트 */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={20}
                data={[{ name: 'Score', value: taxHealthScore, fill: taxHealthScore >= 70 ? '#10b981' : '#f59e0b' }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold">
                  {taxHealthScore}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600 -mt-4">
              상위 {Math.max(1, 100 - taxHealthScore)}% 수준
            </div>
          </div>

          {/* 히스토리 트렌드 차트 */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">점수 추이 (최근 6개월)</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={[
                { month: '6월', score: Math.max(30, taxHealthScore - 25) },
                { month: '7월', score: Math.max(35, taxHealthScore - 20) },
                { month: '8월', score: Math.max(40, taxHealthScore - 15) },
                { month: '9월', score: Math.max(45, taxHealthScore - 10) },
                { month: '10월', score: Math.max(50, taxHealthScore - 5) },
                { month: '11월', score: taxHealthScore },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}점`, '점수']} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={activeTheme.primary}
                  strokeWidth={2}
                  dot={{ fill: activeTheme.primary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 점수 향상 제안 알림 */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">점수 향상 제안</div>
            {taxHealthScore < 90 && Object.keys(deductionTracker).length < 5 && (
              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                <div className="text-xs font-semibold text-yellow-800">공제 항목 추가 +5점</div>
                <div className="text-[10px] text-yellow-700">의료비, 교육비 등 등록</div>
              </div>
            )}
            {taxHealthScore < 85 && (
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800">증빙 자료 업로드 +8점</div>
                <div className="text-[10px] text-blue-700">영수증 추가 등록</div>
              </div>
            )}
            {userProfile.streak < 7 && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <div className="text-xs font-semibold text-green-800">꾸준히 관리 +3점</div>
                <div className="text-[10px] text-green-700">매일 출석하기</div>
              </div>
            )}
            {taxHealthScore >= 90 && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                <div className="text-xs font-semibold text-green-800">최상 상태! 👏</div>
                <div className="text-[10px] text-green-700">세금 관리를 잘 하고 계세요</div>
              </div>
            )}
          </div>
        </div>

        {/* 4개 카테고리 세부 점수 (캐시노트 방식 참고 - 규칙 기반 산출) */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                name: '세금 리스크',
                score: detailedTaxHealthScores.taxRisk.score,
                status: detailedTaxHealthScores.taxRisk.status,
                color: detailedTaxHealthScores.taxRisk.statusColor,
                icon: AlertTriangle,
                tooltip: '증빙 누락, 한도 초과, 업종 평균 대비 이상치 등을 분석',
              },
              {
                name: '증빙 완성도',
                score: detailedTaxHealthScores.documentation.score,
                status: detailedTaxHealthScores.documentation.status,
                color: detailedTaxHealthScores.documentation.statusColor,
                icon: FileText,
                tooltip: '공제 금액 대비 증빙 서류 업로드 비율',
              },
              {
                name: '환급 가능성',
                score: detailedTaxHealthScores.refundPotential.score,
                status: detailedTaxHealthScores.refundPotential.status,
                color: detailedTaxHealthScores.refundPotential.statusColor,
                icon: TrendingUp,
                tooltip: detailedTaxHealthScores.refundPotential.tip,
              },
              {
                name: '절세 여력',
                score: detailedTaxHealthScores.savingsPotential.score,
                status: detailedTaxHealthScores.savingsPotential.status,
                color: detailedTaxHealthScores.savingsPotential.statusColor,
                icon: Target,
                tooltip: `추가 절세 가능: ${detailedTaxHealthScores.savingsPotential.totalPotentialSavings.toLocaleString()}원`,
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 group relative" title={cat.tooltip}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 bg-${cat.color}-100 rounded flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 text-${cat.color}-600`} />
                    </div>
                    <span className="font-semibold text-xs">{cat.name}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`text-xl font-bold text-${cat.color}-600`}>{cat.score}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 bg-${cat.color}-100 text-${cat.color}-700 rounded`}>{cat.status}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div className={`h-1 rounded-full bg-${cat.color}-500`} style={{ width: `${cat.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 유저타입별 세금 핵심 정보 */}
      <div
        className="rounded-xl p-6 shadow-flat border"
        style={{
          backgroundColor: userType === 'individual' ? '#E6F2FF' : '#F3E8FF',
          borderColor: userType === 'individual' ? PRIMARY_BLUE : BRAND_COLOR
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {userType === 'individual' ? (
              <>
                <User className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
                <h3 className="font-bold text-lg" style={{ color: BRAND_COLOR }}>개인 연말정산 현황</h3>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                <h3 className="font-bold text-lg" style={{ color: BRAND_COLOR }}>사업자 세금 현황</h3>
              </>
            )}
          </div>
          <button
            onClick={() => setShowTaxSimulatorModal(true)}
            className="text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 text-white hover:opacity-90"
            style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : BRAND_COLOR }}
          >
            <Calculator className="w-4 h-4" />
            {userType === 'individual' ? '연말정산 시뮬레이터' : '종합소득세 계산'}
          </button>
        </div>

        {userType === 'individual' ? (
          /* 개인 사용자 - 연말정산 정보 */
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>예상 환급액</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{Math.round((stats.taxEstimate || 0) * 0.15).toLocaleString()}원</div>
              <div className="text-xs mt-1" style={{ color: PRIMARY_BLUE }}>공제 활용 시 예상</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>공제 가능 총액</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{Object.values(deductionTracker).reduce((sum, d) => sum + d.current, 0).toLocaleString()}원</div>
              <div className="text-xs mt-1" style={{ color: PRIMARY_BLUE }}>{Object.keys(deductionTracker).length}개 항목</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: PRIMARY_BLUE }}>신고 마감까지</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: CHART_COLORS.danger }}>D-{Math.max(0, Math.floor((new Date('2026-02-28') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs mt-1" style={{ color: PRIMARY_BLUE }}>연말정산 마감</div>
            </div>
          </div>
        ) : (
          /* 소상공인 - 사업자 세금 정보 */
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>예상 종합소득세</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{(stats.taxEstimate || 0).toLocaleString()}원</div>
              <div className="text-xs mt-1" style={{ color: BRAND_COLOR, opacity: 0.7 }}>올해 예상 납부액</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>이번 달 매출</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: BRAND_COLOR }}>{stats.totalSpent.toLocaleString()}원</div>
              <div className="text-xs mt-1" style={{ color: BRAND_COLOR, opacity: 0.7 }}>지출 기준</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm mb-1" style={{ color: BRAND_COLOR }}>부가세 신고까지</div>
              <div className="text-2xl font-bold text-right tabular-nums" style={{ color: CHART_COLORS.danger }}>D-{Math.max(0, Math.floor((new Date('2026-01-25') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs mt-1" style={{ color: BRAND_COLOR, opacity: 0.7 }}>2기 확정신고</div>
            </div>
          </div>
        )}
      </div>

      {/* Deduction Tracker */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: BRAND_COLOR }} />
            <h3 className="font-bold text-lg">{userType === 'individual' ? '공제 항목 실시간 추적' : '필요경비 추적'}</h3>
          </div>
          <button
            onClick={() => setShowDocSpaceModal(true)}
            className="text-sm hover:opacity-80 transition flex items-center gap-1"
            style={{ color: BRAND_COLOR }}
          >
            <Folder className="w-4 h-4" />
            증빙 서류 보기
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(deductionTracker).map(([key, item]) => {
            const Icon = item.icon;
            const progress = (item.current / item.maxDeduction) * 100;
            const isNearThreshold = item.threshold > 0 && item.current >= item.threshold * 0.85;

            return (
              <div key={key} className={`border-2 rounded-lg p-4 ${isNearThreshold ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${item.color}-600`} />
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.documents}건 증빙</div>
                    </div>
                  </div>
                  {isNearThreshold && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatAmount(item.current)}원</span>
                    <span className="text-gray-500">/ {formatAmount(item.maxDeduction)}원</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: CHART_COLORS.green }}
                    />
                  </div>
                </div>

                {item.potentialSaving > 0 && (
                  <div className="text-xs text-gray-700 font-medium text-right">
                    +{formatAmount(item.potentialSaving)}원 추가 가능
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI 공제 추천 */}
      <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg text-indigo-900">AI 공제 추천</h3>
          <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">맞춤형</span>
        </div>
        <div className="space-y-3">
          {/* 의료비 추천 */}
          {(deductionTracker.medical?.current || 0) < 500000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">의료비 공제 확대 가능</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">최대 15% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    안경, 렌즈, 치과 치료, 보청기 등 누락된 의료비가 있는지 확인하세요.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((500000 - (deductionTracker.medical?.current || 0)) * 0.15).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 교육비 추천 */}
          {(deductionTracker.education?.current || 0) < 1000000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PRIMARY_BLUE}20` }}>
                  <GraduationCap className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">교육비 공제 놓치지 마세요</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>최대 15% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    학원비, 온라인 강의, 자격증 취득 비용도 교육비 공제 대상입니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((1000000 - (deductionTracker.education?.current || 0)) * 0.15).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 주거비 추천 */}
          {(deductionTracker.housing?.current || 0) < 3000000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">월세/주거 관련 공제</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">최대 12% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    월세 납부 내역, 주택청약저축이 있다면 추가 공제가 가능합니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+{Math.round((3000000 - (deductionTracker.housing?.current || 0)) * 0.12).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 연금/보험 추천 */}
          <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND_COLOR}20` }}>
                <Shield className="w-5 h-5" style={{ color: BRAND_COLOR }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">연금저축/IRP 활용하기</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BRAND_COLOR}20`, color: BRAND_COLOR }}>최대 16.5% 공제</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  연금저축과 IRP에 연간 700만원까지 납입하면 최대 115.5만원 절세됩니다.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium">연간 최대 절세:</span>
                  <span className="text-sm font-bold text-green-600">+1,155,000원</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 mx-auto" style={{ backgroundColor: PRIMARY_BLUE }}>
            <Sparkles className="w-4 h-4" />
            전체 절세 전략 보기
          </button>
        </div>
      </div>

      {/* Attendance Check */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: PRIMARY_BLUE }} />
            <h3 className="font-bold text-lg">출석 체크</h3>
          </div>
          <button
            onClick={handleAttendanceCheck}
            disabled={attendanceChecked.every(d => d)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${attendanceChecked.every(d => d)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'text-white hover:opacity-90'
              }`}
            style={!attendanceChecked.every(d => d) ? { backgroundColor: PRIMARY_BLUE } : {}}
          >
            {attendanceChecked.every(d => d) ? '완료' : '출석 체크 +50P'}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500 mb-2">{day}</div>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center ${attendanceChecked[idx]
                ? 'text-white'
                : 'bg-gray-100 text-gray-400'
                }`}
                style={attendanceChecked[idx] ? { backgroundColor: PRIMARY_BLUE } : {}}>
                {attendanceChecked[idx] ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <div className="text-lg font-bold">{idx + 1}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">이번 달</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{stats.totalSpent.toLocaleString()}원</div>
          <div className="text-xs opacity-80">총 지출</div>
        </div>

        <div className="rounded-xl p-4 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">절감액</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{Math.floor(userProfile.totalSaved / 1000)}천원</div>
          <div className="text-xs opacity-80">누적 절감</div>
        </div>

        <div className="rounded-xl p-4 text-white shadow-flat" style={{ backgroundColor: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">배지</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{userProfile.badges.length}개</div>
          <div className="text-xs opacity-80">획득 완료</div>
        </div>

        <div className="rounded-xl p-4 shadow-flat" style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}>
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-xs bg-white/30 px-2 py-1 rounded-full">포인트</span>
          </div>
          <div className="text-2xl font-bold text-right tabular-nums">{userProfile.points.toLocaleString()}P</div>
          <div className="text-xs opacity-80">사용 가능</div>
        </div>
      </div>

      {/* 카테고리별 지출 - 확대 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">카테고리별 지출</h3>
        {pieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPie>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill={activeTheme.soft}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
            </RechartsPie>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            데이터가 없습니다
          </div>
        )}
      </div>

    </div>
  );

  // Enhanced Receipts View (deprecated - using imported component)
  const _ReceiptsView = () => (
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
          {getCombinedTransactions().map((transaction) => (
            <div
              key={transaction.id}
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
                        {transaction.bankName || linkedAccounts.find(a => a.id === transaction.accountId)?.bank || '자동 연동'}
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

  // Budget View
  // 월별 지출 데이터 계산 - 로컬 receipts/budgets에서 산출
  const monthlySpendingData = useMemo(() => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const currentMonth = new Date().getMonth();

    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, idx) => {
      const monthReceipts = receipts.filter(r => {
        const receiptMonth = new Date(r.date).getMonth();
        return receiptMonth === (currentMonth - 5 + idx);
      });
      const total = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
      return { month, 지출: total, 예산: Object.values(budgets).reduce((a, b) => a + b, 0) };
    });
  }, [receipts, budgets]);

  // 예산 vs 실제 비교 데이터
  const budgetComparisonData = useMemo(() => {
    return stats.budgetUsage.map(item => ({
      category: item.category,
      예산: item.budget,
      실제: item.spent,
      차이: item.budget - item.spent,
    }));
  }, [stats.budgetUsage]);

  // BudgetView (deprecated - using imported component)
  const _BudgetView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">예산 관리</h2>

      {/* 월별 지출 추이 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: activeTheme.primary }} />
                <h3 className="font-bold text-lg">월별 지출 추이</h3>
              </div>
              <div className="text-sm text-gray-500">최근 6개월</div>
            </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
            <Legend />
            <Area type="monotone" dataKey="지출" stroke={CHART_COLORS.red} fill={CHART_COLORS.redLight} fillOpacity={0.4} />
            <Area type="monotone" dataKey="예산" stroke={CHART_COLORS.green} fill={CHART_COLORS.greenLight} fillOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 예산 vs 실제 비교 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: activeTheme.primary }} />
                <h3 className="font-bold text-lg">예산 vs 실제 지출</h3>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.green }}></div>
                  예산
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.red }}></div>
                  실제 지출
                </span>
              </div>
            </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `${v.toLocaleString()}원`} />
            <Legend />
            <Bar dataKey="예산" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="실제" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 절약/초과 요약 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${CHART_COLORS.green}15`, borderColor: `${CHART_COLORS.green}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" style={{ color: CHART_COLORS.green }} />
            <span className="font-semibold" style={{ color: CHART_COLORS.green }}>절약한 항목</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.green }}>
            {budgetComparisonData.filter(d => d.차이 > 0).length}개
          </div>
          <div className="text-sm mt-1" style={{ color: CHART_COLORS.green }}>
            총 {budgetComparisonData.filter(d => d.차이 > 0).reduce((sum, d) => sum + d.차이, 0).toLocaleString()}원 절약
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ backgroundColor: `${CHART_COLORS.red}15`, borderColor: `${CHART_COLORS.red}40` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: CHART_COLORS.red }} />
            <span className="font-semibold" style={{ color: CHART_COLORS.red }}>초과한 항목</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.red }}>
            {budgetComparisonData.filter(d => d.차이 < 0).length}개
          </div>
          <div className="text-sm mt-1" style={{ color: CHART_COLORS.red }}>
            총 {Math.abs(budgetComparisonData.filter(d => d.차이 < 0).reduce((sum, d) => sum + d.차이, 0)).toLocaleString()}원 초과
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ backgroundColor: activeTheme.soft, borderColor: activeTheme.border }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5" style={{ color: CHART_COLORS.green }} />
            <span className="font-semibold" style={{ color: BRAND_COLOR }}>예산 달성률</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: CHART_COLORS.green }}>
            {Math.round((budgetComparisonData.filter(d => d.차이 >= 0).length / Math.max(budgetComparisonData.length, 1)) * 100)}%
          </div>
          <div className="text-sm mt-1" style={{ color: BRAND_COLOR }}>
            {budgetComparisonData.filter(d => d.차이 >= 0).length}/{budgetComparisonData.length} 카테고리 달성
          </div>
        </div>
      </div>

      {/* 예산 사용 상세 - 예산 설정 가능 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">예산 사용 상세</h3>
        <div className="space-y-4">
          {stats.budgetUsage.map((item, idx) => {
            const pct = parseFloat(item.percentage);
            const barColor = pct > 90 ? CHART_COLORS.red : pct > 70 ? CHART_COLORS.redLight : CHART_COLORS.green;
            return (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-semibold">{item.category}</div>
                  <div className="text-sm" style={{ color: CHART_COLORS.red }}>
                    현재 지출: {item.spent.toLocaleString()}원
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: CHART_COLORS.green }}>예산:</span>
                  <input
                    type="text"
                    className="w-28 px-2 py-1 text-right border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2"
                    style={{ borderColor: CHART_COLORS.greenLight }}
                    defaultValue={(budgets[item.category] || item.budget).toLocaleString()}
                    onFocus={(e) => {
                      e.target.value = (budgets[item.category] || item.budget).toString();
                      e.target.select();
                      // 스크롤 점프 방지
                      e.preventDefault();
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                      setBudgets({ ...budgets, [item.category]: value });
                      e.target.value = value.toLocaleString();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    placeholder="예산 입력"
                  />
                  <span className="text-sm text-gray-500">원</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: barColor
                    }}
                  />
                </div>
                <div
                  className="text-lg font-bold min-w-[50px] text-right"
                  style={{ color: barColor }}
                >
                  {item.percentage}%
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // TOP 10 공제항목 체크리스트 state (TaxPredictionView에서 사용)
  const [checkedDeductions, setCheckedDeductions] = useState([]);
  const deductionItems = [
    { id: 1, title: '신용카드 소득공제', estimatedSaving: 450000, tips: '현금영수증과 체크카드 함께 사용 시 공제율 UP' },
    { id: 2, title: '의료비 세액공제', estimatedSaving: 350000, tips: '안경 구입비, 보청기도 공제 대상' },
    { id: 3, title: '교육비 세액공제', estimatedSaving: 300000, tips: '교복 구입비도 공제 가능' },
    { id: 4, title: '주택자금 공제', estimatedSaving: 400000, tips: '전세자금 대출 이자도 공제 가능' },
    { id: 5, title: '연금저축 세액공제', estimatedSaving: 594000, tips: 'IRP 포함 시 연 700만원까지' },
    { id: 6, title: '기부금 세액공제', estimatedSaving: 150000, tips: '이월공제 가능' },
    { id: 7, title: '월세 세액공제', estimatedSaving: 960000, tips: '총급여 7천만원 이하 대상' },
    { id: 8, title: '보험료 세액공제', estimatedSaving: 120000, tips: '보장성 보험료 연 100만원 한도' },
    { id: 9, title: '개인연금저축 소득공제', estimatedSaving: 720000, tips: '연 1,800만원 한도 40% 공제' },
    { id: 10, title: '청약저축 소득공제', estimatedSaving: 480000, tips: '무주택 세대주만 해당' },
  ];

  const handleDeductionCheck = (id) => {
    setCheckedDeductions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const deductionCompletionRate = (checkedDeductions.length / deductionItems.length) * 100;
  const totalDeductionSavings = deductionItems
    .filter(d => checkedDeductions.includes(d.id))
    .reduce((sum, d) => sum + d.estimatedSaving, 0);

  // Tax Prediction View (deprecated - using imported component)
  // 연말정산 계산기 슬라이더 state
  const [calcIncome, setCalcIncome] = useState(taxBasicInfo.annualIncome);
  const [calcCreditCard, setCalcCreditCard] = useState(Math.floor(taxBasicInfo.annualIncome * 0.3));
  const [calcCashReceipt, setCalcCashReceipt] = useState(3000000);
  const [calcMedical, setCalcMedical] = useState(2000000);
  const [calcEducation, setCalcEducation] = useState(1000000);

  // 간단한 연말정산 계산
  const calculateSimpleRefund = () => {
    const totalDeduction = calcCreditCard * 0.15 + calcCashReceipt * 0.3 + calcMedical * 0.15 + calcEducation * 0.15;
    const taxBase = Math.max(0, calcIncome - totalDeduction - 15000000);
    const estimatedTax = taxBase * 0.15;
    const withheldTax = calcIncome * 0.08;
    return Math.max(0, withheldTax - estimatedTax);
  };

  const calcRefund = calculateSimpleRefund();
  const creditCardRatio = calcIncome > 0 ? ((calcCreditCard / calcIncome) * 100).toFixed(1) : 0;

  // 사업자 세금 계산기 state (상수에서 초기값 로드)
  const [bizCalcState, setBizCalcState] = useState({
    ...BIZ_CALC_DEFAULTS.defaults,
    businessIncome: 0,            // 사업소득 (자동 계산)
  });

  // 사업자 계산기 입력값 변경 핸들러
  const handleBizCalcChange = (field, value) => {
    setBizCalcState(prev => ({
      ...prev,
      [field]: value,
      // 매출/매입 변경 시 사업소득 자동 계산
      ...(field === 'annualSales' || field === 'annualPurchases'
        ? { businessIncome: (field === 'annualSales' ? value : prev.annualSales) -
                           (field === 'annualPurchases' ? value : prev.annualPurchases) }
        : {})
    }));
  };

  // 실제 데이터 기반 월별 세금 예측 계산 (복합형)
  const calculatedTaxData = useMemo(() => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const currentMonth = new Date().getMonth(); // 0-11
    const annualIncome = taxBasicInfo.annualIncome || 50000000;

    // 월별 소득 변동 패턴 (한국 직장인: 1월 성과급, 6월 상여, 12월 연말 보너스)
    const incomePattern = [1.15, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2];
    const totalPattern = incomePattern.reduce((a, b) => a + b, 0);

    // 영수증 데이터를 월별로 그룹화
    const monthlyExpenses = {};
    const categoryTotals = {};

    receipts.forEach(r => {
      const date = new Date(r.date);
      const monthIdx = date.getMonth();
      const category = r.category || '기타';

      if (!monthlyExpenses[monthIdx]) {
        monthlyExpenses[monthIdx] = { total: 0, categories: {} };
      }
      monthlyExpenses[monthIdx].total += r.amount || 0;
      monthlyExpenses[monthIdx].categories[category] =
        (monthlyExpenses[monthIdx].categories[category] || 0) + (r.amount || 0);

      categoryTotals[category] = (categoryTotals[category] || 0) + (r.amount || 0);
    });

    // 카테고리별 연간 누적 (공제 계산용)
    const medicalCategories = ['병원', '약국', '의료', '건강'];
    const educationCategories = ['교육', '학원', '학비'];

    const annualMedical = Object.entries(categoryTotals)
      .filter(([cat]) => medicalCategories.some(mc => cat.includes(mc)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    const annualEducation = Object.entries(categoryTotals)
      .filter(([cat]) => educationCategories.some(ec => cat.includes(ec)))
      .reduce((sum, [, amt]) => sum + amt, 0);

    const totalCardUsage = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    // 공제 적용 세금 계산
    const taxWithDeductions = calculateIndividualTax({
      annualIncome,
      dependents: taxBasicInfo.dependents || 0,
      hasSpouse: taxBasicInfo.hasSpouse || false,
      medicalExpenses: annualMedical,
      educationExpenses: { self: annualEducation },
      creditCardDeduction: totalCardUsage > annualIncome * 0.25
        ? Math.min((totalCardUsage - annualIncome * 0.25) * 0.15, 3000000)
        : 0,
    });

    // 공제 미적용 세금 계산 (비교용)
    const taxWithoutDeductions = calculateIndividualTax({
      annualIncome,
      dependents: 0,
      hasSpouse: false,
    });

    // 사업자용 계산
    const businessTax = userType === 'business' ? calculateBusinessTax({
      revenue: taxBasicInfo.expectedRevenue || annualIncome,
      expenses: taxBasicInfo.expectedExpenses || annualIncome * 0.6,
      isSimplifiedTax: taxBasicInfo.isSimplifiedTax || false,
    }) : null;

    // 사업자 경비공제 미적용 세금 계산 (비교용)
    const businessTaxNoDeduction = userType === 'business' ? calculateBusinessTax({
      revenue: taxBasicInfo.expectedRevenue || annualIncome,
      expenses: 0,
      isSimplifiedTax: taxBasicInfo.isSimplifiedTax || false,
    }) : null;

    // 누적 변수
    let cumulativeTax = 0;
    let cumulativeNoDeduction = 0;
    let cumulativeExpense = 0;

    // 월별 데이터 생성
    return months.map((month, idx) => {
      const isPast = idx <= currentMonth;
      const monthData = monthlyExpenses[idx] || { total: 0, categories: {} };

      if (userType === 'individual') {
        // 월별 소득에 따른 세금 비율 적용
        const monthRatio = incomePattern[idx] / totalPattern;
        const monthlyTax = Math.floor(taxWithDeductions.totalTax * monthRatio);
        const monthlyTaxNoDeduction = Math.floor(taxWithoutDeductions.totalTax * monthRatio);

        // 실제 지출이 있으면 해당 값 사용, 없으면 예상 지출 패턴
        const actualExpense = monthData.total || Math.floor(annualIncome * 0.05 * (0.8 + Math.random() * 0.4));

        cumulativeTax += monthlyTax;
        cumulativeNoDeduction += monthlyTaxNoDeduction;
        cumulativeExpense += actualExpense;

        return {
          month,
          monthlyTax: isPast ? monthlyTax : 0,
          predictedTax: !isPast ? monthlyTax : 0,
          cumulativeTax: isPast ? cumulativeTax : null,
          predictedCumulative: cumulativeTax,
          noDeductionTax: monthlyTaxNoDeduction,
          savings: monthlyTaxNoDeduction - monthlyTax,
          expense: actualExpense,
          cumulativeExpense,
          isPast,
        };
      } else {
        // 사업자: DB 데이터 우선 사용, 없으면 계산값 사용
        const dbData = businessTaxData.find(d => d.month === month);
        const isQuarterMonth = [0, 3, 6, 9].includes(idx);
        const quarterlyTax = isQuarterMonth && businessTax ? businessTax.quarterlyTax : 0;
        const quarterlyTaxNoDeduction = isQuarterMonth && businessTaxNoDeduction ? businessTaxNoDeduction.quarterlyTax : 0;

        // DB에 데이터가 있으면 사용, 없으면 taxBasicInfo에서 계산
        const monthlyRevenue = dbData?.income ?? (taxBasicInfo.expectedRevenue ? Math.floor(taxBasicInfo.expectedRevenue / 12) : 0);
        const monthlyExp = dbData?.expense ?? (taxBasicInfo.expectedExpenses ? Math.floor(taxBasicInfo.expectedExpenses / 12) : 0);
        const monthlyVat = dbData?.vat ?? (isQuarterMonth && businessTax ? Math.floor(businessTax.vat / 4) : 0);

        cumulativeTax += quarterlyTax;
        cumulativeNoDeduction += quarterlyTaxNoDeduction;
        cumulativeExpense += monthlyExp;

        return {
          month,
          monthlyTax: isPast ? (dbData?.actual ?? quarterlyTax) : 0,
          predictedTax: !isPast ? (dbData?.predicted ?? quarterlyTax) : 0,
          cumulativeTax: isPast ? cumulativeTax : null,
          predictedCumulative: cumulativeTax,
          noDeductionTax: quarterlyTaxNoDeduction,
          savings: quarterlyTaxNoDeduction - quarterlyTax,
          income: monthlyRevenue,
          expense: monthlyExp,
          cumulativeExpense,
          vat: monthlyVat,
          isPast,
        };
      }
    });
  }, [receipts, taxBasicInfo, userType, businessTaxData]);

  const _TaxPredictionView = () => {
    // DB 데이터 대신 실제 계산된 데이터 사용
    const taxData = calculatedTaxData;
    const currentMonth = new Date().getMonth();
    const totalActualTax = taxData.slice(0, currentMonth + 1).reduce((sum, d) => sum + (d.monthlyTax || 0), 0);
    const totalPredictedTax = taxData.slice(currentMonth + 1).reduce((sum, d) => sum + (d.predictedTax || 0), 0);

    return (
      <div className="space-y-6">
        {/* 연말정산 계산기 (슬라이더 기반) - 개인만 표시 */}
        {userType === 'individual' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-6 h-6" style={{ color: activeTheme.primary }} />
              <h3 className="font-bold text-xl">연말정산 계산기</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* 입력 섹션 */}
              <div className="space-y-6">
                {/* 총급여 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">총급여액</label>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcIncome.toLocaleString()}원</span>
                  </div>
                  <input
                    type="range"
                    min={20000000}
                    max={150000000}
                    step={1000000}
                    value={calcIncome}
                    onChange={(e) => setCalcIncome(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2천만원</span>
                    <span>1억5천만원</span>
                  </div>
                </div>

                {/* 신용카드 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">신용카드 사용액</label>
                    <span className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>{creditCardRatio}%</span>
                      <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcCreditCard.toLocaleString()}원</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={calcIncome}
                    step={100000}
                    value={calcCreditCard}
                    onChange={(e) => setCalcCreditCard(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* 현금영수증 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">현금영수증</label>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcCashReceipt.toLocaleString()}원</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20000000}
                    step={100000}
                    value={calcCashReceipt}
                    onChange={(e) => setCalcCashReceipt(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                {/* 의료비 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">의료비</label>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcMedical.toLocaleString()}원</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={100000}
                    value={calcMedical}
                    onChange={(e) => setCalcMedical(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* 교육비 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">교육비</label>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>{calcEducation.toLocaleString()}원</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={100000}
                    value={calcEducation}
                    onChange={(e) => setCalcEducation(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>

              {/* 결과 섹션 */}
              <div className="space-y-4">
                {/* 예상 환급액 */}
                <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
                  <div className="text-sm opacity-90 mb-2">예상 환급액</div>
                  <div className="text-4xl font-bold mb-2">{calcRefund.toLocaleString()}원</div>
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    <TrendingUp className="w-4 h-4" />
                    <span>작년 대비 예상 증가율 +12%</span>
                  </div>
                </div>

                {/* 공제 항목 요약 */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="font-semibold text-gray-800 mb-3">공제 항목 요약</div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">신용카드 공제</span>
                    <span className="font-semibold">{Math.floor(calcCreditCard * 0.15).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">현금영수증 공제</span>
                    <span className="font-semibold">{Math.floor(calcCashReceipt * 0.3).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">의료비 공제</span>
                    <span className="font-semibold">{Math.floor(calcMedical * 0.15).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">교육비 공제</span>
                    <span className="font-semibold">{Math.floor(calcEducation * 0.15).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-3 rounded-lg px-3 mt-2" style={{ backgroundColor: `${PRIMARY_BLUE}15` }}>
                    <span className="font-bold" style={{ color: BRAND_COLOR }}>총 공제액</span>
                    <span className="font-bold" style={{ color: PRIMARY_BLUE }}>
                      {Math.floor(calcCreditCard * 0.15 + calcCashReceipt * 0.3 + calcMedical * 0.15 + calcEducation * 0.15).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 절세 팁 */}
                {calcCreditCard < calcIncome * 0.25 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-orange-900 mb-1">절세 팁</div>
                        <p className="text-sm text-orange-700">
                          신용카드 사용액을 총급여의 25% 이상으로 늘리면 추가 공제를 받을 수 있습니다.
                        </p>
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          추가 절세 가능액: {Math.floor((calcIncome * 0.25 - calcCreditCard) * 0.15).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Type Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">사용자 유형 선택</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('individual')}
              className={`p-6 rounded-xl border-2 transition ${userType === 'individual'
                ? ''
                : 'border-gray-200 hover:border-gray-300'
                }`}
              style={userType === 'individual' ? { borderColor: PRIMARY_BLUE, backgroundColor: `${PRIMARY_BLUE}10` } : {}}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: userType === 'individual' ? PRIMARY_BLUE : '#E5E7EB' }}
                >
                  <User className={`w-6 h-6 ${userType === 'individual' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">개인</div>
                  <div className="text-sm text-gray-600">직장인, 프리랜서</div>
                </div>
              </div>
              <div className="text-left text-sm text-gray-600">
                종합소득세, 연말정산, 개인 지출 관리에 최적화
              </div>
            </button>

            <button
              onClick={() => setUserType('business')}
              className={`p-6 rounded-xl border-2 transition ${userType === 'business'
                ? ''
                : 'border-gray-200 hover:border-gray-300'
                }`}
              style={userType === 'business' ? { borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` } : {}}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: userType === 'business' ? BRAND_COLOR : '#E5E7EB' }}
                >
                  <Briefcase className={`w-6 h-6 ${userType === 'business' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">사업자</div>
                  <div className="text-sm text-gray-600">소상공인, 1인 사업자</div>
                </div>
              </div>
              <div className="text-left text-sm text-gray-600">
                부가세, 법인세, 사업 현금 흐름 관리에 최적화
              </div>
            </button>
          </div>
        </div>

        {/* Tax Prediction Chart - 복합형 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">
              {userType === 'individual' ? '월별 세금 분석 (개인)' : '월별 세금 분석 (사업자)'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">실시간 계산</span>
              <span>영수증 {receipts.length}건 반영</span>
            </div>
          </div>

          {/* 범례 설명 */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.primary }}></span>
              납부 세금 (막대)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: ACCENT_GOLD }}></span>
              예상 세금 (막대)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-0.5" style={{ backgroundColor: CHART_COLORS.green }}></span>
              누적 세금 (라인)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: CHART_COLORS.red }}></span>
              공제 미적용 시 (라인)
            </span>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={taxData}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                tick={{ fontSize: 11 }}
                stroke={CHART_COLORS.green}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (value === null) return ['-', name];
                  return [`${value.toLocaleString()}원`, name];
                }}
                labelFormatter={(label) => `${label}`}
              />
              <ReferenceLine
                x={`${currentMonth + 1}월`}
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                label={{ value: '현재', position: 'top', fontSize: 10, fill: '#6B7280' }}
                yAxisId="left"
              />

              {/* 막대: 월별 세금 (실제/예상) */}
              <Bar yAxisId="left" dataKey="monthlyTax" fill={activeTheme.primary} name="납부 세금" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="predictedTax" fill={ACCENT_GOLD} name="예상 세금" radius={[4, 4, 0, 0]} />

              {/* 라인: 누적 세금 */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="predictedCumulative"
                stroke={CHART_COLORS.green}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS.green }}
                name="누적 세금"
                connectNulls
              />

              {/* 라인: 공제 미적용 시 (비교용) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="noDeductionTax"
                stroke={CHART_COLORS.red}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                name={userType === 'individual' ? '공제 미적용' : '경비공제 미적용'}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* 요약 카드 */}
          <div className="grid md:grid-cols-4 gap-3 mt-4">
            <div className="rounded-lg p-3" style={{ backgroundColor: activeTheme.soft }}>
              <div className="text-xs text-gray-600 mb-1">납부 완료 (1~{currentMonth + 1}월)</div>
              <div className="text-xl font-bold tabular-nums text-right" style={{ color: activeTheme.primary }}>{totalActualTax.toLocaleString()}원</div>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255, 215, 0, 0.12)' }}>
              <div className="text-xs text-gray-600 mb-1">예상 납부 ({currentMonth + 2}~12월)</div>
              <div className="text-xl font-bold tabular-nums text-right" style={{ color: ACCENT_GOLD }}>{totalPredictedTax.toLocaleString()}원</div>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: `${CHART_COLORS.green}12` }}>
              <div className="text-xs text-gray-600 mb-1">연간 총 예상</div>
              <div className="text-xl font-bold tabular-nums text-right" style={{ color: CHART_COLORS.green }}>
                {(taxData[11]?.predictedCumulative || 0).toLocaleString()}원
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ backgroundColor: `${CHART_COLORS.red}12` }}>
              <div className="text-xs text-gray-600 mb-1">공제로 절감액</div>
              <div className="text-xl font-bold tabular-nums text-right" style={{ color: CHART_COLORS.red }}>
                {taxData.reduce((sum, d) => sum + (d.savings || 0), 0).toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* Business Specific: Cash Flow */}
        {userType === 'business' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4">사업 현금 흐름 분석</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={taxData.slice(0, currentMonth + 1).map(d => ({
                  ...d,
                  netProfit: (d.income || 0) - (d.expense || 0),
                }))}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value.toLocaleString()}원`,
                    name === 'netProfit' ? '순이익' : name
                  ]}
                  contentStyle={{ borderRadius: '8px', border: `1px solid ${activeTheme.soft}` }}
                />
                <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                <Bar
                  dataKey="netProfit"
                  name="순이익 (수입-지출)"
                  radius={[6, 6, 6, 6]}
                >
                  {taxData.slice(0, currentMonth + 1).map((entry, index) => {
                    const netProfit = (entry.income || 0) - (entry.expense || 0);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={netProfit >= 0 ? activeTheme.primary : ACCENT_COLOR}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* 범례 */}
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.primary }}></div>
                <span className="text-gray-600">흑자</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: ACCENT_COLOR }}></div>
                <span className="text-gray-600">적자</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights for Tax */}
        {isPremium && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-red-900">주의 필요</h3>
                  <p className="text-sm text-red-800 mb-2">
                    {userType === 'individual'
                      ? '현재 추세대로 지출 시, 연말 종합소득세가 예상보다 20만원 높을 것으로 예상됩니다.'
                      : '다음 분기 부가세 신고액이 전 분기 대비 15% 증가할 것으로 예상됩니다.'}
                  </p>
                  <p className="text-xs text-red-700">
                    • 도서/교육비 증액으로 세액공제 활용 권장
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-green-900">절세 기회</h3>
                  <p className="text-sm text-green-800 mb-2">
                    {userType === 'individual'
                      ? '도서/교육 카테고리 지출을 늘리면 연간 최대 30만원 세액공제 가능합니다.'
                      : '업무용 장비 구매를 6월에 진행하면 상반기 부가세 환급액이 증가합니다.'}
                  </p>
                  <p className="text-xs text-green-700">
                    • 현재 공제 한도 대비 65% 활용 중
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP 10 공제항목 체크리스트 - 개인만 표시 */}
        {userType === 'individual' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-lg">TOP 10 공제항목 체크</h3>
              </div>
              <span className="text-sm text-gray-500">{checkedDeductions.length}/10 확인</span>
            </div>

            {/* 진행 상태 바 */}
            <div className="rounded-lg p-4 mb-4 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">진행률</span>
                <span className="font-bold">{deductionCompletionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="h-2 bg-white rounded-full transition-all"
                  style={{ width: `${deductionCompletionRate}%` }}
                />
              </div>
              <div className="mt-2 text-sm">
                예상 절세액: <span className="font-bold">{(totalDeductionSavings / 10000).toFixed(0)}만원</span>
              </div>
            </div>

            {/* 체크리스트 */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {deductionItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleDeductionCheck(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    checkedDeductions.includes(item.id)
                      ? 'bg-green-50 border-2 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    checkedDeductions.includes(item.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300'
                  }`}>
                    {checkedDeductions.includes(item.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.tips}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      {(item.estimatedSaving / 10000).toFixed(0)}만원
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {deductionCompletionRate === 100 && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
                <PartyPopper className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-800">모든 항목 확인 완료!</div>
                <div className="text-sm text-green-700">
                  총 예상 절세액: {(totalDeductionSavings / 10000).toFixed(0)}만원
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Challenge Statistics 계산
  const challengeStats = useMemo(() => {
    const activeChallenges = challenges.filter(c => c.status === 'active');
    const totalProgress = activeChallenges.reduce((sum, c) => sum + (c.progress / c.target) * 100, 0);
    const avgProgress = activeChallenges.length > 0 ? totalProgress / activeChallenges.length : 0;

    return {
      active: activeChallenges.length,
      completed: completedChallenges.length,
      avgProgress: Math.round(avgProgress),
      totalRewardsEarned: completedChallenges.reduce((sum, c) => sum + (c.reward || 0), 0),
      pieData: [
        { name: '완료', value: completedChallenges.length, fill: '#10b981' },
        { name: '진행중', value: activeChallenges.length, fill: '#3b82f6' },
      ],
    };
  }, [challenges, completedChallenges]);

  // 배지 목록 (전체 획득 가능한 배지)
  const allBadges = useMemo(() => [
    { id: 'first_receipt', name: '첫 영수증', icon: '📝', description: '첫 영수증 등록', category: '시작', unlocked: userProfile.badges.includes('first_receipt') },
    { id: 'streak_7', name: '7일 연속 출석', icon: '🔥', description: '7일 연속 출석 달성', category: '출석', unlocked: userProfile.streak >= 7 },
    { id: 'streak_30', name: '30일 연속 출석', icon: '⚡', description: '30일 연속 출석 달성', category: '출석', unlocked: userProfile.streak >= 30 },
    { id: 'saver_bronze', name: '절약 브론즈', icon: '🥉', description: '10만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 100000 },
    { id: 'saver_silver', name: '절약 실버', icon: '🥈', description: '50만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 500000 },
    { id: 'saver_gold', name: '절약 골드', icon: '🥇', description: '100만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 1000000 },
    { id: 'challenge_master', name: '챌린지 마스터', icon: '🏆', description: '10개 챌린지 완료', category: '챌린지', unlocked: completedChallenges.length >= 10 },
    { id: 'tax_expert', name: '절세 전문가', icon: '📊', description: '세금 건강 점수 90 달성', category: '세금', unlocked: taxHealthScore >= 90 },
    { id: 'deduction_hunter', name: '공제 헌터', icon: '🎯', description: '5개 공제 항목 최대 활용', category: '공제', unlocked: false },
    { id: 'early_bird', name: '얼리버드', icon: '🐦', description: '세금 신고 1달 전 준비 완료', category: '특별', unlocked: false },
    { id: 'community_star', name: '커뮤니티 스타', icon: '⭐', description: '질문에 10회 답변', category: '커뮤니티', unlocked: false },
    { id: 'premium_member', name: '프리미엄 멤버', icon: '👑', description: '프리미엄 구독', category: '특별', unlocked: isPremium },
  ], [userProfile, completedChallenges, taxHealthScore, isPremium]);

  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const lockedBadges = allBadges.filter(b => !b.unlocked);

  // Challenges 탭용 통계 (훅 데이터 기반)
  const challengeStatsFromHook = useMemo(() => {
    const activeChallenges = challengesData.challenges.filter(c => c.status === 'active');
    const totalProgress = activeChallenges.reduce((sum, c) => sum + (c.progress / c.target) * 100, 0);
    const avgProgress = activeChallenges.length > 0 ? totalProgress / activeChallenges.length : 0;

    return {
      active: activeChallenges.length,
      completed: challengesData.completedChallenges.length,
      avgProgress: Math.round(avgProgress),
      totalRewardsEarned: challengesData.completedChallenges.reduce((sum, c) => sum + (c.reward || 0), 0),
      pieData: [
        { name: '완료', value: challengesData.completedChallenges.length, fill: '#10b981' },
        { name: '진행중', value: activeChallenges.length, fill: '#3b82f6' },
      ],
    };
  }, [challengesData.challenges, challengesData.completedChallenges]);

  const allBadgesFromHook = useMemo(() => [
    { id: 'first_receipt', name: '첫 영수증', icon: '📝', description: '첫 영수증 등록', category: '시작', unlocked: userProfile.badges.includes('first_receipt') },
    { id: 'streak_7', name: '7일 연속 출석', icon: '🔥', description: '7일 연속 출석 달성', category: '출석', unlocked: userProfile.streak >= 7 },
    { id: 'streak_30', name: '30일 연속 출석', icon: '⚡', description: '30일 연속 출석 달성', category: '출석', unlocked: userProfile.streak >= 30 },
    { id: 'saver_bronze', name: '절약 브론즈', icon: '🥉', description: '10만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 100000 },
    { id: 'saver_silver', name: '절약 실버', icon: '🥈', description: '50만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 500000 },
    { id: 'saver_gold', name: '절약 골드', icon: '🥇', description: '100만원 절약 달성', category: '절약', unlocked: userProfile.totalSaved >= 1000000 },
    { id: 'challenge_master', name: '챌린지 마스터', icon: '🏆', description: '10개 챌린지 완료', category: '챌린지', unlocked: challengesData.completedChallenges.length >= 10 },
    { id: 'tax_expert', name: '절세 전문가', icon: '📊', description: '세금 건강 점수 90 달성', category: '세금', unlocked: taxHealthScore >= 90 },
    { id: 'deduction_hunter', name: '공제 헌터', icon: '🎯', description: '5개 공제 항목 최대 활용', category: '공제', unlocked: false },
    { id: 'early_bird', name: '얼리버드', icon: '🐦', description: '세금 신고 1달 전 준비 완료', category: '특별', unlocked: false },
    { id: 'community_star', name: '커뮤니티 스타', icon: '⭐', description: '질문에 10회 답변', category: '커뮤니티', unlocked: false },
    { id: 'premium_member', name: '프리미엄 멤버', icon: '👑', description: '프리미엄 구독', category: '특별', unlocked: isPremium },
  ], [userProfile, challengesData.completedChallenges, taxHealthScore, isPremium]);

  const unlockedBadgesFromHook = allBadgesFromHook.filter(b => b.unlocked);
  const lockedBadgesFromHook = allBadgesFromHook.filter(b => !b.unlocked);

  // Benefits (혜택 탐색) 데이터
  const [benefitsCategory, setBenefitsCategory] = useState('all');
  const benefitsData = [
    {
      id: 1,
      category: 'tax',
      title: '신용카드 소득공제',
      amount: '최대 300만원',
      provider: '국세청',
      description: '총급여 25% 초과분 15~30% 공제',
      eligibility: '근로소득자',
      deadline: '연말정산 시 자동',
      eligible: true,
    },
    {
      id: 2,
      category: 'tax',
      title: '월세 세액공제',
      amount: '최대 750만원',
      provider: '국세청',
      description: '무주택 세대주 월세 세액공제',
      eligibility: '총급여 7천만원 이하',
      deadline: '연말정산 시 신청',
      eligible: userType === 'individual',
    },
    {
      id: 3,
      category: 'tax',
      title: '연금저축 세액공제',
      amount: '최대 66만원',
      provider: '국세청',
      description: '연금저축 납입액의 12~15% 공제',
      eligibility: '총급여 5,500만원 이하 15%',
      deadline: '연말정산 시 자동',
      eligible: true,
    },
    {
      id: 4,
      category: 'housing',
      title: '청년 전세자금 대출',
      amount: '최대 1억원',
      provider: '주택도시기금',
      description: '연 1.8%~2.7% 저금리 전세자금',
      eligibility: '만 19~34세 무주택자',
      deadline: '상시 신청',
      eligible: false,
    },
    {
      id: 5,
      category: 'housing',
      title: '주택청약종합저축 소득공제',
      amount: '최대 96만원',
      provider: '국세청',
      description: '납입액의 40% 소득공제',
      eligibility: '무주택 세대주, 총급여 7천만원 이하',
      deadline: '연말정산 시 자동',
      eligible: userType === 'individual',
    },
    {
      id: 6,
      category: 'business',
      title: '노란우산공제',
      amount: '최대 500만원',
      provider: '중소기업중앙회',
      description: '납입액 100% 소득공제',
      eligibility: '소기업·소상공인',
      deadline: '상시 가입',
      eligible: userType === 'business',
    },
    {
      id: 7,
      category: 'business',
      title: '간이과세자 부가세 면제',
      amount: '부가세 전액',
      provider: '국세청',
      description: '연매출 4,800만원 미만 면제',
      eligibility: '간이과세자',
      deadline: '자동 적용',
      eligible: userType === 'business' && taxBasicInfo.isSimplifiedTax,
    },
    {
      id: 8,
      category: 'support',
      title: '근로장려금',
      amount: '최대 330만원',
      provider: '국세청',
      description: '저소득 근로자 지원금',
      eligibility: '총급여 2,200만원 이하',
      deadline: '5월 신청',
      eligible: false,
    },
    {
      id: 9,
      category: 'support',
      title: '자녀장려금',
      amount: '최대 80만원/인',
      provider: '국세청',
      description: '18세 미만 자녀 양육 지원',
      eligibility: '총급여 4,000만원 이하',
      deadline: '5월 신청',
      eligible: taxBasicInfo.dependents > 0,
    },
    {
      id: 10,
      category: 'financial',
      title: 'ISA 계좌 비과세',
      amount: '최대 200만원',
      provider: '금융위원회',
      description: '수익에 대한 비과세 혜택',
      eligibility: '19세 이상 거주자',
      deadline: '상시 가입',
      eligible: true,
    },
  ];

  const benefitsCategories = [
    { id: 'all', label: '전체', icon: Gift },
    { id: 'tax', label: '세금공제', icon: Calculator },
    { id: 'housing', label: '주거', icon: Home },
    { id: 'business', label: '사업자', icon: Briefcase },
    { id: 'support', label: '지원금', icon: Heart },
    { id: 'financial', label: '금융', icon: CreditCard },
  ];

  const filteredBenefits = benefitsCategory === 'all'
    ? benefitsData
    : benefitsData.filter(b => b.category === benefitsCategory);

  const eligibleBenefitsCount = benefitsData.filter(b => b.eligible).length;

  // Benefits View (deprecated - using imported component)
  const _BenefitsView = () => (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">혜택 자동 탐색</h2>
        <p className="text-gray-600">나에게 맞는 세금 혜택과 지원금을 찾아보세요</p>
      </div>

      {/* 요약 카드 */}
      <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: NEON_ICE, color: BRAND_COLOR }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{benefitsData.length}개</div>
            <div className="text-sm opacity-90">발견된 혜택</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{eligibleBenefitsCount}개</div>
            <div className="text-sm opacity-90">신청 가능</div>
          </div>
          <div>
            <div className="text-3xl font-bold">약 850만원</div>
            <div className="text-sm opacity-90">예상 혜택 총액</div>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {benefitsCategories.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === 'all'
            ? benefitsData.length
            : benefitsData.filter(b => b.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setBenefitsCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                benefitsCategory === cat.id
                  ? ''
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={benefitsCategory === cat.id ? { backgroundColor: activeTheme.primary, color: activeTheme.text } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${benefitsCategory === cat.id ? 'bg-white/30' : 'bg-gray-200'}`}
              >{count}</span>
            </button>
          );
        })}
      </div>

      {/* 혜택 목록 */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredBenefits.map((benefit) => (
          <div
            key={benefit.id}
            className={`bg-white rounded-xl p-5 border-2 transition hover:shadow-lg ${
              benefit.eligible ? 'border-green-300' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{benefit.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">{benefit.provider}</span>
                  <span className="text-xs text-gray-500">{benefit.deadline}</span>
                </div>
              </div>
              {benefit.eligible && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  신청가능
                </span>
              )}
            </div>

            <div className="text-2xl font-bold mb-2" style={{ color: activeTheme.primary }}>{benefit.amount}</div>
            <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>

            <div className="text-xs text-gray-500 mb-4">
              <span className="font-semibold">자격요건:</span> {benefit.eligibility}
            </div>

            <button
              className={`w-full py-2 rounded-lg font-semibold transition ${
                benefit.eligible
                  ? 'hover:opacity-90'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={benefit.eligible ? { backgroundColor: activeTheme.primary, color: activeTheme.text } : {}}
            >
              {benefit.eligible ? '신청하기' : '자격 확인'}
            </button>
          </div>
        ))}
      </div>

      {/* 도움말 카드 */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="font-bold text-lg mb-3">혜택 신청 도움이 필요하신가요?</h3>
        <p className="text-gray-600 text-sm mb-4">
          복잡한 세금 혜택 신청을 전문가가 도와드립니다.
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: activeTheme.primary, color: activeTheme.text }}
          >
            전문가 상담
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition">
            신청 가이드
          </button>
        </div>
      </div>
    </div>
  );

  // Challenges View (deprecated - using imported component)
  const _ChallengesView = () => (
    <div className="space-y-6">
      {/* User Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 shadow-flat" style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}>
          <Trophy className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.level}</div>
          <div className="text-sm opacity-80">레벨</div>
        </div>
        <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: PRIMARY_BLUE }}>
          <Star className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.points.toLocaleString()}</div>
          <div className="text-sm opacity-90">포인트</div>
        </div>
        <div className="rounded-xl p-6 shadow-flat" style={{ backgroundColor: SUCCESS_GREEN, color: BRAND_COLOR }}>
          <Award className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{unlockedBadges.length}</div>
          <div className="text-sm opacity-80">획득 배지</div>
        </div>
        <div className="rounded-xl p-6 text-white shadow-flat" style={{ backgroundColor: BRAND_COLOR }}>
          <Flame className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.streak}</div>
          <div className="text-sm opacity-90">연속 출석</div>
        </div>
      </div>

      {/* 챌린지 진행 현황 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-lg">챌린지 진행 현황</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 파이 차트 */}
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={challengeStats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {challengeStats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600">
              총 {challengeStats.active + challengeStats.completed}개 챌린지
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${PRIMARY_BLUE}15` }}>
              <div className="text-2xl font-bold" style={{ color: PRIMARY_BLUE }}>{challengeStats.active}</div>
              <div className="text-sm text-gray-600">진행 중</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${SUCCESS_GREEN}20` }}>
              <div className="text-2xl font-bold" style={{ color: SUCCESS_GREEN }}>{challengeStats.completed}</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${BRAND_COLOR}15` }}>
              <div className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>{challengeStats.avgProgress}%</div>
              <div className="text-sm text-gray-600">평균 진행률</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${ACCENT_GOLD}25` }}>
              <div className="text-2xl font-bold" style={{ color: ACCENT_GOLD }}>{challengeStats.totalRewardsEarned.toLocaleString()}P</div>
              <div className="text-sm text-gray-600">총 획득 포인트</div>
            </div>
          </div>
        </div>
      </div>

      {/* 배지 갤러리 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg">배지 갤러리</h3>
          </div>
          <span className="text-sm text-gray-500">{unlockedBadges.length}/{allBadges.length} 획득</span>
        </div>

        {/* 획득한 배지 */}
        {unlockedBadges.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> 획득한 배지
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {unlockedBadges.map(badge => (
                <div key={badge.id} className="group relative">
                  <div className="bg-yellow-50 rounded-xl p-4 text-center border-2 border-yellow-300 hover:scale-105 transition cursor-pointer">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="text-xs font-semibold truncate">{badge.name}</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                    {badge.description}
                    <div className="text-yellow-400 text-[10px]">{badge.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 미획득 배지 */}
        <div>
          <div className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
            <Lock className="w-4 h-4" /> 미획득 배지
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="group relative">
                <div className="bg-gray-100 rounded-xl p-4 text-center border-2 border-gray-200 opacity-60 hover:opacity-80 transition cursor-pointer">
                  <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                  <div className="text-xs font-semibold truncate text-gray-400">{badge.name}</div>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                  {badge.description}
                  <div className="text-gray-400 text-[10px]">{badge.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="font-bold text-lg">절약왕 리더보드</h3>
          </div>
          <span className="text-sm text-gray-500">이번 달</span>
        </div>
        <div className="space-y-3">
          {leaderboard.map((user, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-lg ${user.isUser ? 'border-2' : 'bg-gray-50'
                }`}
              style={user.isUser ? { backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}50` } : {}}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                  }`}>
                  {user.rank}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {user.name}
                    <span className="text-xl">{user.badge}</span>
                  </div>
                  <div className="text-xs text-gray-500">{user.points.toLocaleString()} 포인트</div>
                </div>
              </div>
              {user.isUser && (
                <span className="text-xs text-white px-3 py-1 rounded-full font-bold" style={{ backgroundColor: PRIMARY_BLUE }}>
                  나
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Missions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="w-5 h-5" style={{ color: BRAND_COLOR }} />
          <h3 className="font-bold text-lg">주간 미션</h3>
        </div>
        <div className="space-y-4">
          {weeklyMissions.map(mission => (
            <div key={mission.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold mb-1">{mission.title}</div>
                  <div className="text-sm text-gray-600">{mission.progress} / {mission.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">보상</div>
                  <div className="text-lg font-bold" style={{ color: BRAND_COLOR }}>+{mission.reward}P</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${(mission.progress / mission.target) * 100}%`, backgroundColor: BRAND_COLOR }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="font-bold text-lg mb-4">진행 중인 챌린지</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.filter(c => c.status === 'active').map(challenge => (
            <div key={challenge.id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
                    {challenge.badge}
                  </div>
                  <div>
                    <div className="font-bold mb-1">{challenge.title}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {challenge.difficulty === 'easy' ? '쉬움' :
                          challenge.difficulty === 'medium' ? '보통' : '어려움'}
                      </span>
                      <span className="text-xs text-gray-500">D-{challenge.daysLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">진행률</span>
                  <span className="font-semibold">{Math.floor((challenge.progress / challenge.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%`, backgroundColor: PRIMARY_BLUE }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{challenge.progress} / {challenge.target}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">완료 시 보상</span>
                <span className="font-bold" style={{ color: PRIMARY_BLUE }}>+{challenge.reward}P</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">완료한 챌린지</h3>
        <div className="space-y-2">
          {completedChallenges.map(challenge => (
            <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                  {challenge.badge}
                </div>
                <div>
                  <div className="font-semibold text-sm">{challenge.title}</div>
                  <div className="text-xs text-gray-500">{challenge.completedDate}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-green-600">+{challenge.reward}P</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Shop */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">리워드 샵</h3>
          <div className="text-sm font-semibold" style={{ color: PRIMARY_BLUE }}>
            보유: {userProfile.points.toLocaleString()}P
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition">
              <div className="text-center mb-4">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl mx-auto mb-3 border" style={{ backgroundColor: `${PRIMARY_BLUE}10`, borderColor: `${PRIMARY_BLUE}30` }}>
                  {reward.icon}
                </div>
                <h4 className="font-bold mb-1">{reward.name}</h4>
                <p className="text-xs text-gray-600">{reward.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="font-bold text-lg" style={{ color: PRIMARY_BLUE }}>{reward.points}P</div>
                <button
                  onClick={() => handleRewardExchange(reward)}
                  disabled={userProfile.points < reward.points}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${userProfile.points >= reward.points
                    ? 'hover:opacity-90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  style={userProfile.points >= reward.points ? { backgroundColor: activeTheme.primary, color: activeTheme.text } : {}}
                >
                  {userProfile.points >= reward.points ? '교환하기' : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              </div>
              {reward.stock === 'limited' && (
                <div className="mt-2 text-xs text-center text-red-600 font-semibold">
                  ⚡ 한정 수량
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral Event */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">친구 초대하고 포인트 받기</h3>
            <p className="text-sm text-gray-700 mb-4">
              친구가 가입하면 <span className="font-bold text-green-600">양쪽 모두 500P</span>를 받아요!
            </p>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
              초대 링크 복사하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 로그인되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ ...themeStyle, backgroundColor: BRAND_COLOR }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          style={{ border: `1px solid ${activeTheme.soft}` }}
        >
          {/* 로고 */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">머니플랫 AI</h1>
            <p className="text-gray-500 mt-1">세무사급 AI 재무 플랫폼</p>
          </div>

          {/* 탭 전환 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${authMode === 'login' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              style={authMode === 'login' ? { color: BRAND_COLOR } : {}}
            >
              로그인
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${authMode === 'signup' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              style={authMode === 'signup' ? { color: BRAND_COLOR } : {}}
            >
              회원가입
            </button>
          </div>

          {/* 에러 메시지 */}
          {authError && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${authError.includes('확인') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {authError}
              </div>
            </div>
          )}

          {/* 로그인/회원가입 폼 */}
          <div className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    authMode === 'login' ? handleEmailLogin() : handleEmailSignup();
                  }
                }}
              />
            </div>

            <button
              onClick={authMode === 'login' ? handleEmailLogin : handleEmailSignup}
              disabled={isLoading}
              className="w-full py-3 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-flat-md hover:opacity-90"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  처리 중...
                </>
              ) : (
                <>
                  {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {authMode === 'login' ? '로그인' : '회원가입'}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={themeStyle}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: activeTheme.primary, borderTopColor: 'transparent' }}
            ></div>
            <p className="text-gray-700 font-medium">처리 중...</p>
          </div>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{apiError}</span>
            <button onClick={() => setApiError(null)} className="ml-4 underline">닫기</button>
          </div>
        </div>
      )}

      {/* Header + Navigation 스티키 컨테이너 */}
      <div className="sticky top-0 z-40">
      {/* Header with Notification Center - 스크롤 시 축소 효과 */}
      <header className={`bg-white shadow-sm border-b transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className={`max-w-7xl mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg flex items-center justify-center shadow-flat transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
                style={{ backgroundColor: activeTheme.primary }}
              >
                <Wallet className={`text-white transition-all duration-300 ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </div>
              <div>
                <h1 className={`font-bold transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>머니플랫 AI</h1>
                <p className={`text-gray-500 transition-all duration-300 ${isScrolled ? 'text-xs hidden' : 'text-xs'}`}>세무사급 AI 재무 플랫폼</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 알림 버튼 */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                {notificationCenter.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationCenter.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* 질문하기 버튼 */}
              <button
                onClick={() => setShowQuestionModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="질문하기"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* OCR 스캔 버튼 */}
              <label
                className="px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2 font-semibold"
                style={{ backgroundColor: activeTheme.soft, color: activeTheme.primary }}
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-semibold">OCR 스캔</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReceiptUpload}
                />
              </label>

              {/* 연말정산 시뮬레이터 버튼 */}
              <button
                onClick={() => setShowTaxSimulatorModal(true)}
                className="text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-flat hover:opacity-90"
                style={{ backgroundColor: ACCENT_GOLD, color: BRAND_COLOR }}
                title="연말정산 시뮬레이터"
              >
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-semibold hidden md:inline">연말정산</span>
              </button>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 border border-gray-200"
                title="로그아웃"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                <span className="text-sm hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: '대시보드', icon: PieChart },
              { id: 'receipts', label: '거래내역', icon: FileText },
              { id: 'budget', label: '예산관리', icon: Wallet },
              { id: 'prediction', label: '세금예측', icon: Activity },
              { id: 'benefits', label: '혜택탐색', icon: Gift },
              { id: 'challenges', label: '챌린지', icon: Trophy },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-6 py-3 flex items-center gap-2 whitespace-nowrap transition relative border-b-2 ${currentTab === tab.id
                  ? 'font-semibold'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
                  }`}
                style={currentTab === tab.id ? { color: activeTheme.primary, borderColor: activeTheme.primary, backgroundColor: activeTheme.soft } : {}}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            activeTheme={activeTheme}
            userProfile={userProfile}
            isPremium={isPremium}
            userType={userType}
            taxHealthScore={taxHealthScore}
            aiInsights={aiInsights}
            deductionTracker={deductionTracker}
            detailedTaxHealthScores={detailedTaxHealthScores}
            attendanceChecked={attendanceChecked}
            stats={stats}
            pieChartData={pieChartData}
            chartPalette={chartPalette}
            setShowSettingsModal={setShowSettingsModal}
            setShowAIInsightModal={setShowAIInsightModal}
            setShowPDFReportModal={setShowPDFReportModal}
            setShowTaxSimulatorModal={setShowTaxSimulatorModal}
            setShowDocSpaceModal={setShowDocSpaceModal}
            handleAttendanceCheck={handleAttendanceCheck}
            handleRefreshAIInsights={handleRefreshAIInsights}
            isRefreshingAI={isRefreshingAI}
          />
        )}
        {currentTab === 'receipts' && (
          <ReceiptsView
            linkedAccounts={linkedAccounts}
            stats={stats}
            transactionFilters={transactionFilters}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            uniqueBanks={uniqueBanks}
            uniqueCategories={uniqueCategories}
            totalFilteredTransactions={totalFilteredTransactions}
            totalPages={totalPages}
            setShowValueModal={setShowValueModal}
            setShowReceiptModal={setShowReceiptModal}
            setShowAccountLinkModal={setShowAccountLinkModal}
            setTransactionFilters={setTransactionFilters}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            handleUnlinkAccount={handleUnlinkAccount}
            getCombinedTransactions={getCombinedTransactions}
            handleTransactionClick={handleTransactionClick}
            handleDeleteTransaction={handleDeleteTransaction}
          />
        )}
        {currentTab === 'budget' && (
          <BudgetView
            activeTheme={activeTheme}
            stats={stats}
            budgets={budgets}
            monthlySpendingData={monthlySpendingData}
            budgetComparisonData={budgetComparisonData}
            setBudgets={setBudgets}
          />
        )}
        {currentTab === 'prediction' && (
          <TaxPredictionView
            activeTheme={activeTheme}
            userType={userType}
            isPremium={isPremium}
            receipts={receipts}
            calculatedTaxData={calculatedTaxData}
            calcIncome={calcIncome}
            calcCreditCard={calcCreditCard}
            calcCashReceipt={calcCashReceipt}
            calcMedical={calcMedical}
            calcEducation={calcEducation}
            calcRefund={calcRefund}
            creditCardRatio={creditCardRatio}
            checkedDeductions={checkedDeductions}
            deductionItems={deductionItems}
            deductionCompletionRate={deductionCompletionRate}
            totalDeductionSavings={totalDeductionSavings}
            setUserType={setUserType}
            setCalcIncome={setCalcIncome}
            setCalcCreditCard={setCalcCreditCard}
            setCalcCashReceipt={setCalcCashReceipt}
            setCalcMedical={setCalcMedical}
            setCalcEducation={setCalcEducation}
            handleDeductionCheck={handleDeductionCheck}
            // 사업자 계산기 props
            bizCalcState={bizCalcState}
            handleBizCalcChange={handleBizCalcChange}
            businessTaxData={businessTaxData}
          />
        )}
        {currentTab === 'benefits' && (
          <BenefitsView
            activeTheme={activeTheme}
            benefitsCategory={benefitsCategory}
            benefitsData={benefitsData}
            benefitsCategories={benefitsCategories}
            filteredBenefits={filteredBenefits}
            eligibleBenefitsCount={eligibleBenefitsCount}
            setBenefitsCategory={setBenefitsCategory}
            onOpenDetailsModal={(type) => {
              setDetailsModalType(type);
              setShowDetailsModal(true);
            }}
            onOpenQuestionModal={() => setShowQuestionModal(true)}
          />
        )}
        {currentTab === 'challenges' && (
          challengesData.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">챌린지 데이터 로딩 중...</p>
              </div>
            </div>
          ) : challengesData.error && challengesData.challenges.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">데이터를 불러올 수 없습니다</p>
                <p className="text-gray-500 text-sm mb-4">{challengesData.error}</p>
                <button
                  onClick={() => challengesData.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : (
            <ChallengesView
              activeTheme={activeTheme}
              userProfile={userProfile}
              challengeStats={challengeStatsFromHook}
              allBadges={allBadgesFromHook}
              unlockedBadges={unlockedBadgesFromHook}
              lockedBadges={lockedBadgesFromHook}
              leaderboard={challengesData.leaderboard}
              weeklyMissions={challengesData.weeklyMissions}
              challenges={challengesData.challenges}
              completedChallenges={challengesData.completedChallenges}
              rewards={challengesData.rewards}
              handleRewardExchange={handleRewardExchange}
            />
          )
        )}
      </main>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={newReceipt}
        onReceiptChange={setNewReceipt}
        onSubmit={handleAddReceipt}
        categories={Object.keys(budgets)}
      />

      {/* Budget Limit Setting Modal */}
      {showBudgetLimitModal && editingBudgetCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">예산 상한 설정</h3>
              <button onClick={() => { setShowBudgetLimitModal(false); setEditingBudgetCategory(null); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <span className="px-4 py-2 rounded-full font-semibold" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>
                  {editingBudgetCategory}
                </span>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">최대 상한 금액 (원)</label>
                <input
                  type="number"
                  value={tempBudgetLimit}
                  onChange={(e) => setTempBudgetLimit(e.target.value)}
                  placeholder="예: 1000000"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  min="10000"
                  step="10000"
                />
                <div className="text-xs text-gray-500 mt-1">
                  입력값: {parseInt(tempBudgetLimit || 0).toLocaleString()}원
                </div>
              </div>

              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setTempBudgetLimit('300000')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  30만원
                </button>
                <button
                  onClick={() => setTempBudgetLimit('500000')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  50만원
                </button>
                <button
                  onClick={() => setTempBudgetLimit('1000000')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  100만원
                </button>
                <button
                  onClick={() => setTempBudgetLimit('2000000')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  200만원
                </button>
              </div>

              <button
                onClick={() => {
                  const newLimit = parseInt(tempBudgetLimit) || 500000;
                  setBudgetMaxLimits({ ...budgetMaxLimits, [editingBudgetCategory]: newLimit });
                  // 현재 예산이 새 상한보다 크면 조정
                  if (budgets[editingBudgetCategory] > newLimit) {
                    setBudgets({ ...budgets, [editingBudgetCategory]: newLimit });
                  }
                  setShowBudgetLimitModal(false);
                  setEditingBudgetCategory(null);
                }}
                className="w-full py-3 text-white rounded-lg hover:opacity-90 transition font-semibold"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                반영하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">거래 상세</h3>
              <button onClick={() => { setShowTransactionDetailModal(false); setSelectedTransaction(null); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 거래처 */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedTransaction.source === 'manual' ? `${BRAND_COLOR}20` : `${SUCCESS_GREEN}30` }}
                >
                  {selectedTransaction.source === 'manual' ? (
                    <Camera className="w-7 h-7" style={{ color: BRAND_COLOR }} />
                  ) : (
                    <RefreshCw className="w-7 h-7" style={{ color: SUCCESS_GREEN }} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedTransaction.merchant}</div>
                  <div className="text-sm text-gray-500">
                    {selectedTransaction.source === 'manual' ? '수동 입력' : '자동 수집'}
                    {selectedTransaction.bankName && ` · ${selectedTransaction.bankName}`}
                  </div>
                </div>
              </div>

              {/* 세부 정보 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">금액</span>
                  <span className="font-bold text-xl">{(selectedTransaction.amount || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">부가세 (VAT)</span>
                  <span className="font-semibold">{(selectedTransaction.tax || 0).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">카테고리</span>
                  <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${PRIMARY_BLUE}20`, color: PRIMARY_BLUE }}>{selectedTransaction.category}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">거래일</span>
                  <span className="font-medium">{selectedTransaction.date}</span>
                </div>
                {selectedTransaction.time && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">거래시간</span>
                    <span className="font-medium">{selectedTransaction.time}</span>
                  </div>
                )}
                {selectedTransaction.bankName && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">결제수단</span>
                    <span className="font-medium">{selectedTransaction.bankName}</span>
                  </div>
                )}
                {selectedTransaction.memo && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">메모</span>
                    <span className="font-medium">{selectedTransaction.memo}</span>
                  </div>
                )}
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDeleteTransaction(selectedTransaction)}
                className="w-full mt-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 font-semibold"
              >
                <X className="w-5 h-5" />
                거래 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Link Modal */}
      <AccountLinkModal
        isOpen={showAccountLinkModal}
        onClose={() => setShowAccountLinkModal(false)}
        banks={availableBanks}
        onLinkBank={handleLinkAccount}
      />

      {/* Value Proposition Modal */}
      {/* Value Modal */}
      <ValueModal
        isOpen={showValueModal}
        onClose={() => setShowValueModal(false)}
        onLinkAccount={() => setShowAccountLinkModal(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
        taxBasicInfo={taxBasicInfo}
        onTaxBasicInfoChange={setTaxBasicInfo}
        onSave={handleSaveSettings}
      />


      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={() => setIsPremium(true)}
      />

      {/* Details Modal */}
      <DetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        modalType={detailsModalType}
        experts={taxExperts}
        products={financialProducts}
        communityPosts={communityPosts}
        onOpenQuestionModal={() => setShowQuestionModal(true)}
      />

      {/* Question Modal */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        questionText={newQuestion}
        onQuestionChange={setNewQuestion}
      />

      {/* Reward Exchange Success Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setSelectedReward(null);
        }}
        reward={selectedReward}
      />

      {/* AI Insight Modal */}
      <AIInsightModal
        isOpen={showAIInsightModal}
        onClose={() => setShowAIInsightModal(false)}
        insights={aiInsights}
      />

      {/* Document Space Modal */}
      <DocSpaceModal
        isOpen={showDocSpaceModal}
        onClose={() => setShowDocSpaceModal(false)}
        documentSpace={documentSpace}
      />

      {/* PDF Report Modal */}
      <PDFReportModal
        isOpen={showPDFReportModal}
        onClose={() => setShowPDFReportModal(false)}
        isLoading={isLoading}
        onGeneratePDF={generatePDFReport}
        onExportExcel={handleExcelExport}
      />

      {/* 연말정산 시뮬레이터 Modal */}
      <TaxSimulatorModal
        isOpen={showTaxSimulatorModal}
        onClose={() => setShowTaxSimulatorModal(false)}
        taxSimulatorData={taxSimulatorData}
        setTaxSimulatorData={setTaxSimulatorData}
        taxSimulatorResult={taxSimulatorResult}
        setTaxSimulatorResult={setTaxSimulatorResult}
        showTaxAdvanced={showTaxAdvanced}
        setShowTaxAdvanced={setShowTaxAdvanced}
        loadFromAppData={loadFromAppData}
        calculateTaxSimulation={calculateTaxSimulation}
        generatePDFReport={generatePDFReport}
      />
    </div>
  );
};

export default ReceiptFinancePlatform;
