import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Camera, Upload, Wallet, TrendingUp, TrendingDown, PieChart, FileText, Users, CreditCard, Calculator, Award, ChevronRight, Plus, X, Check, AlertCircle, Sparkles, Calendar, DollarSign, Building, Bell, Target, Trophy, MessageCircle, ThumbsUp, Send, Zap, Crown, Star, Shield, Gift, ArrowUp, ArrowDown, Activity, Clock, CheckCircle, Briefcase, User, Flame, Repeat, Lock, Unlock, PartyPopper, Ticket, Coffee, ShoppingBag, Link, RefreshCw, CheckCircle2, Timer, BarChart3, Eye, EyeOff, Download, FileCheck, Folder, Search, Filter, TrendingUpIcon, AlertTriangle, Lightbulb, Receipt, Heart, GraduationCap, Home, Car, Baby, Pill, BookOpen, Laptop, Waves, LogIn, UserPlus, Key } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar } from 'recharts';
import { supabase, onAuthStateChange } from './lib/supabase';
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
} from './services/supabaseApi';
import { processReceiptImage, compressImage } from './services/ocrService';
import { calculateIndividualTax, calculateBusinessTax } from './services/taxCalculator';
import {
  generateMonthlyExpenseReport,
  generateYearEndTaxReport,
  generateTaxHealthReport,
  exportReceiptsToExcel,
  exportBudgetToExcel,
  exportTaxDataToExcel,
  exportAllDataToExcel,
} from './services/exportService';

const ReceiptFinancePlatform = () => {
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
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
  const [showAIInsightModal, setShowAIInsightModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // 설정 모달
  
  // 세금 계산용 기본 정보
  const [taxBasicInfo, setTaxBasicInfo] = useState({
    // 개인용
    annualIncome: 50000000,      // 연봉
    dependents: 0,               // 부양가족 수
    hasSpouse: false,            // 배우자 유무
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 인증 상태
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [currentUser, setCurrentUser] = useState(null); // Supabase 사용자
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Supabase 인증 상태 감시
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        loadUserProfile(session.user.id);
      }
    });

    // 인증 상태 변화 리스너
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        loadUserProfile(session.user.id);
        setShowAuthModal(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 사용자 프로필 로드
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

  // 이메일 로그인
  const handleEmailLogin = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      await authAPI.signIn(authEmail, authPassword);
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
      setAuthError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 회원가입
  const handleEmailSignup = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      await authAPI.signUp(authEmail, authPassword, authName);
      setAuthError('가입 확인 이메일을 확인해주세요.');
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (error) {
      setAuthError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setAuthError('');
    try {
      await authAPI.signInWithKakao();
    } catch (error) {
      setAuthError(error.message || '카카오 로그인에 실패했습니다.');
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // Tax Health Score
  const [taxHealthScore, setTaxHealthScore] = useState(50);

  // Real-time AI Insights (세무사급 AI 알림) - API에서 로드
  const [aiInsights, setAiInsights] = useState([]);

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
    console.log('🔄 API 로드 시작 - User ID:', uid);
    setIsLoading(true);
    setApiError(null);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
      const currentYear = new Date().getFullYear();

      // 병렬로 API 호출
      const [
        receiptsData,
        autoTransactionsData,
        linkedAccountsData,
        budgetsData,
        challengesData,
        completedChallengesData,
        dailyMissionsData,
        weeklyMissionsData,
        leaderboardData,
        rewardsData,
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
      ] = await Promise.all([
        receiptsAPI.getAll(uid).catch(() => []),
        autoTransactionsAPI.getAll(uid).catch(() => []),
        accountsAPI.getLinkedAccounts(uid).catch(() => []),
        budgetsAPI.getAll(uid, currentMonth).catch(() => []),
        challengesAPI.getAll().catch(() => []),
        gamificationAPI.getCompletedChallenges(uid).catch(() => []),
        missionsAPI.getDailyMissions().catch(() => []),
        missionsAPI.getWeeklyMissions().catch(() => []),
        leaderboardAPI.getTopRanks(10).catch(() => []),
        rewardsProductAPI.getAll().catch(() => []),
        eventsAPI.getAll().catch(() => []),
        insightsAPI.getAll(uid).catch(() => []),
        notificationCenterAPI.getAll(uid).catch(() => []),
        notificationsAPI.getAll(uid).catch(() => []),
        deductionAPI.getAll(uid, currentYear).catch(() => []),
        documentFoldersAPI.getAll(uid).catch(() => { }),
        taxAPI.getIndividualTax(uid, currentYear).catch(() => []),
        taxAPI.getBusinessTax(uid, currentYear).catch(() => []),
        banksAPI.getAll().catch(() => []),
        communityAPI.getPosts().catch(() => []),
        expertsAPI.getAll().catch(() => []),
        productsAPI.getAll().catch(() => []),
      ]);

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

      if (challengesData?.length > 0) setChallenges(challengesData);
      if (completedChallengesData?.length > 0) setCompletedChallenges(completedChallengesData);
      if (dailyMissionsData?.length > 0) setDailyMissions(dailyMissionsData);
      if (weeklyMissionsData?.length > 0) setWeeklyMissions(weeklyMissionsData);
      if (leaderboardData?.length > 0) setLeaderboard(leaderboardData);
      if (rewardsData?.length > 0) setRewards(rewardsData);
      if (eventsData?.length > 0) setEvents(eventsData);
      if (communityPostsData?.length > 0) setCommunityPosts(communityPostsData);
      if (taxExpertsData?.length > 0) setTaxExperts(taxExpertsData);
      if (financialProductsData?.length > 0) setFinancialProducts(financialProductsData);

      // AI 인사이트에 아이콘 추가
      if (aiInsightsData?.length > 0) {
        const iconMap = { medical: Pill, education: GraduationCap, card: CreditCard, housing: Home };
        const insightsWithIcons = aiInsightsData.map(insight => ({
          ...insight,
          icon: iconMap[insight.category] || AlertCircle,
        }));
        setAiInsights(insightsWithIcons);
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
    } catch (error) {
      console.error('API 데이터 로드 실패:', error);
      setApiError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // 사용자 로그인 시 API 데이터 로드
  useEffect(() => {
    if (currentUser?.id) {
      loadDataFromAPI(currentUser.id);
    }
  }, [currentUser, loadDataFromAPI]);

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
        const taxResult = calculateIndividualTax({
          annualIncome: taxSimulatorData.annualIncome,
          dependents: taxSimulatorData.dependents,
          hasSpouse: taxSimulatorData.hasSpouse,
          medicalExpenses: taxSimulatorData.medicalExpenses,
          pensionSavings: taxSimulatorData.pensionSavings,
          irpAmount: taxSimulatorData.irpAmount,
        });
        fileName = await generateYearEndTaxReport({
          taxResult,
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
    hasSpouse: false,
    medicalExpenses: 0,
    educationExpenses: 0,
    pensionSavings: 0,
    irpAmount: 0,
    donations: 0,
  });

  const [taxSimulatorResult, setTaxSimulatorResult] = useState(null);

  // 연말정산 계산
  const calculateTaxSimulation = () => {
    const result = calculateIndividualTax({
      annualIncome: taxSimulatorData.annualIncome,
      dependents: taxSimulatorData.dependents,
      hasSpouse: taxSimulatorData.hasSpouse,
      medicalExpenses: taxSimulatorData.medicalExpenses,
      pensionSavings: taxSimulatorData.pensionSavings,
      irpAmount: taxSimulatorData.irpAmount,
    });
    setTaxSimulatorResult(result);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

  // Get Tax Health Score color
  const getTaxHealthColor = (score) => {
    if (score >= 90) return { bg: 'from-green-500 to-emerald-500', text: 'text-green-600' };
    if (score >= 70) return { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600' };
    if (score >= 50) return { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-600' };
    return { bg: 'from-red-500 to-pink-500', text: 'text-red-600' };
  };

  const taxHealthColor = getTaxHealthColor(taxHealthScore);

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* User Profile with Tax Health Score */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center relative">
              <Crown className="w-10 h-10" />
              <div className="absolute -bottom-1 bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold">
                Lv.{userProfile.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                {isPremium && <span className="bg-yellow-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold">PRO</span>}
                <span className={"px-2 py-0.5 rounded-full text-xs font-bold " + (userType === 'individual' ? 'bg-blue-400 text-blue-900' : 'bg-purple-400 text-purple-900')}>
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
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all"
              style={{ width: `${(userProfile.currentExp / userProfile.expToNextLevel) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights - Critical First */}
      {aiInsights.filter(i => i.priority === 'high').length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4 animate-pulse">
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
                            +₩{insight.potentialSaving.toLocaleString()}
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
            <span className={`text-xs px-2 py-0.5 rounded-full ${taxHealthScore >= 90 ? 'bg-green-100 text-green-700' :
                taxHealthScore >= 70 ? 'bg-blue-100 text-blue-700' :
                  taxHealthScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
              }`}>
              {taxHealthScore >= 90 ? '최상' : taxHealthScore >= 70 ? '양호' : taxHealthScore >= 50 ? '보통' : '주의'}
            </span>
          </div>
          <button
            onClick={() => setShowPDFReportModal(true)}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
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
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 상세 항목 */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">상세 항목</div>
            {(() => {
              const deductionUsage = Object.keys(deductionTracker).length > 0
                ? Math.round(Object.values(deductionTracker).reduce((sum, item) =>
                  sum + (item.current / item.maxDeduction), 0) / Object.keys(deductionTracker).length * 100)
                : 85;
              const documentCount = Object.values(deductionTracker).reduce((sum, item) => sum + (item.documents || 0), 0);
              const docCompleteness = Math.min(100, Math.round(documentCount / 30 * 100));

              return (
                <>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${deductionUsage >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs">공제 활용도</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${deductionUsage >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${deductionUsage}%` }}></div>
                      </div>
                      <span className="text-xs font-bold w-8">{deductionUsage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${docCompleteness >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs">증빙 완성도</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${docCompleteness >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${docCompleteness}%` }}></div>
                      </div>
                      <span className="text-xs font-bold w-8">{docCompleteness}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs">납부 이력</span>
                    </div>
                    <span className="text-xs font-bold text-green-600">양호</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${userProfile.streak >= 7 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs">관리 꾸준함</span>
                    </div>
                    <span className={`text-xs font-bold ${userProfile.streak >= 7 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {userProfile.streak >= 7 ? '우수' : '보통'}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* 개선 제안 */}
        {taxHealthScore < 90 && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              점수 향상 제안
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {taxHealthScore < 90 && Object.keys(deductionTracker).length < 5 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="text-xs font-semibold text-yellow-800 mb-1">공제 항목 추가</div>
                  <div className="text-xs text-yellow-700">의료비, 교육비 등 더 많은 공제 항목을 등록하세요</div>
                  <div className="text-[10px] text-yellow-600 mt-1">예상 +5점</div>
                </div>
              )}
              {taxHealthScore < 85 && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs font-semibold text-blue-800 mb-1">증빙 자료 업로드</div>
                  <div className="text-xs text-blue-700">영수증과 증빙 자료를 더 등록해주세요</div>
                  <div className="text-[10px] text-blue-600 mt-1">예상 +8점</div>
                </div>
              )}
              {userProfile.streak < 7 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-xs font-semibold text-green-800 mb-1">꾸준히 관리하기</div>
                  <div className="text-xs text-green-700">매일 출석하고 지출을 기록하세요</div>
                  <div className="text-[10px] text-green-600 mt-1">예상 +3점</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 유저타입별 세금 핵심 정보 */}
      <div className={"rounded-xl p-6 shadow-sm border " + (userType === 'individual' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {userType === 'individual' ? (
              <>
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-blue-900">개인 연말정산 현황</h3>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg text-purple-900">사업자 세금 현황</h3>
              </>
            )}
          </div>
          <button
            onClick={() => setShowTaxSimulatorModal(true)}
            className={"text-sm px-3 py-1 rounded-lg transition flex items-center gap-1 " + (userType === 'individual' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-purple-500 text-white hover:bg-purple-600')}
          >
            <Calculator className="w-4 h-4" />
            {userType === 'individual' ? '연말정산 시뮬레이터' : '종합소득세 계산'}
          </button>
        </div>

        {userType === 'individual' ? (
          /* 개인 사용자 - 연말정산 정보 */
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">예상 환급액</div>
              <div className="text-2xl font-bold text-blue-900">₩{((stats.taxEstimate || 0) * 0.15).toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">공제 활용 시 예상</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">공제 가능 총액</div>
              <div className="text-2xl font-bold text-blue-900">₩{Object.values(deductionTracker).reduce((sum, d) => sum + d.current, 0).toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">{Object.keys(deductionTracker).length}개 항목</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">신고 마감까지</div>
              <div className="text-2xl font-bold text-blue-900">D-{Math.max(0, Math.floor((new Date('2026-02-28') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs text-blue-600 mt-1">연말정산 마감</div>
            </div>
          </div>
        ) : (
          /* 소상공인 - 사업자 세금 정보 */
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">예상 종합소득세</div>
              <div className="text-2xl font-bold text-purple-900">₩{(stats.taxEstimate || 0).toLocaleString()}</div>
              <div className="text-xs text-purple-600 mt-1">올해 예상 납부액</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">이번 달 매출</div>
              <div className="text-2xl font-bold text-purple-900">₩{stats.totalSpent.toLocaleString()}</div>
              <div className="text-xs text-purple-600 mt-1">지출 기준</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-sm text-purple-700 mb-1">부가세 신고까지</div>
              <div className="text-2xl font-bold text-purple-900">D-{Math.max(0, Math.floor((new Date('2026-01-25') - new Date()) / (1000 * 60 * 60 * 24)))}</div>
              <div className="text-xs text-purple-600 mt-1">2기 확정신고</div>
            </div>
          </div>
        )}
      </div>

      {/* Tax Health Score 상세 분석 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-red-500" />
          <h3 className="font-bold text-lg">Tax Health Score™ 상세</h3>
        </div>

        {/* 카테고리별 점수 */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            { name: '세금 리스크', score: Math.min(100, taxHealthScore + 7), status: '양호', color: 'green', icon: AlertTriangle },
            { name: '증빙 완성도', score: Math.max(50, taxHealthScore - 13), status: taxHealthScore >= 70 ? '양호' : '주의', color: taxHealthScore >= 70 ? 'blue' : 'orange', icon: FileText },
            { name: '환급 가능성', score: Math.min(100, taxHealthScore + 4), status: '우수', color: 'blue', icon: TrendingUp },
            { name: '절세 여력', score: Math.max(50, taxHealthScore - 8), status: '보통', color: 'purple', icon: Target },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 bg-${cat.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${cat.color}-600`} />
                  </div>
                  <span className="font-semibold text-sm">{cat.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-bold text-${cat.color}-600`}>{cat.score}</span>
                  <span className={`text-xs px-2 py-1 bg-${cat.color}-100 text-${cat.color}-700 rounded`}>{cat.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className={`h-1.5 rounded-full bg-${cat.color}-500`} style={{ width: `${cat.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 점수 변화 추이 */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">최근 6개월 점수 변화</div>
          <div className="flex items-end justify-between h-32 gap-2">
            {[
              { month: '6월', score: Math.max(50, taxHealthScore - 13) },
              { month: '7월', score: Math.max(55, taxHealthScore - 10) },
              { month: '8월', score: Math.max(60, taxHealthScore - 6) },
              { month: '9월', score: Math.max(65, taxHealthScore - 3) },
              { month: '10월', score: Math.max(70, taxHealthScore - 1) },
              { month: '11월', score: taxHealthScore },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all hover:from-blue-600 hover:to-purple-600"
                  style={{ height: `${(item.score / 100) * 100}%` }}
                />
                <div className="text-xs font-semibold">{item.score}</div>
                <div className="text-xs text-gray-500">{item.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 개선 제안 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-orange-900 mb-1">맞춤형 개선 제안</div>
              <p className="text-sm text-orange-700">
                {taxHealthScore < 70
                  ? '의료비 증빙을 추가하면 점수를 +5점 올릴 수 있습니다.'
                  : taxHealthScore < 85
                    ? '신용카드 사용 비율을 25% 이상으로 맞추면 추가 공제가 가능합니다.'
                    : '현재 세금 관리 상태가 매우 좋습니다! 계속 유지하세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deduction Tracker */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">{userType === 'individual' ? '공제 항목 실시간 추적' : '필요경비 추적'}</h3>
          </div>
          <button
            onClick={() => setShowDocSpaceModal(true)}
            className="text-sm text-purple-600 hover:text-purple-700 transition flex items-center gap-1"
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
                    <span>₩{item.current.toLocaleString()}</span>
                    <span className="text-gray-500">/ ₩{item.maxDeduction.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {item.potentialSaving > 0 && (
                  <div className="text-xs text-green-600 font-semibold">
                    +₩{item.potentialSaving.toLocaleString()} 추가 가능
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI 공제 추천 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
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
                    <span className="text-sm font-bold text-green-600">+₩{Math.round((500000 - (deductionTracker.medical?.current || 0)) * 0.15).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 교육비 추천 */}
          {(deductionTracker.education?.current || 0) < 1000000 && (
            <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">교육비 공제 놓치지 마세요</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">최대 15% 공제</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    학원비, 온라인 강의, 자격증 취득 비용도 교육비 공제 대상입니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-600 font-medium">예상 추가 절세:</span>
                    <span className="text-sm font-bold text-green-600">+₩{Math.round((1000000 - (deductionTracker.education?.current || 0)) * 0.15).toLocaleString()}</span>
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
                    <span className="text-sm font-bold text-green-600">+₩{Math.round((3000000 - (deductionTracker.housing?.current || 0)) * 0.12).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 연금/보험 추천 */}
          <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">연금저축/IRP 활용하기</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">최대 16.5% 공제</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  연금저축과 IRP에 연간 700만원까지 납입하면 최대 115.5만원 절세됩니다.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium">연간 최대 절세:</span>
                  <span className="text-sm font-bold text-green-600">+₩1,155,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4" />
            전체 절세 전략 보기
          </button>
        </div>
      </div>

      {/* Account Linking Status */}
      {linkedAccounts.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Link className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-green-900">금융 계좌 연동 중</h3>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {linkedAccounts.length}개
                </span>
              </div>
              <p className="text-sm text-green-800 mb-2">
                자동으로 거래 내역을 불러오고 있습니다. 수동 입력 시간 <span className="font-bold">95% 절감!</span>
              </p>
              <div className="flex items-center gap-2">
                {linkedAccounts.slice(0, 3).map(acc => (
                  <div key={acc.id} className="text-2xl">{acc.icon}</div>
                ))}
                {linkedAccounts.length > 3 && (
                  <span className="text-sm text-green-700">+{linkedAccounts.length - 3}개</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Check */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">출석 체크</h3>
          </div>
          <button
            onClick={handleAttendanceCheck}
            disabled={attendanceChecked.every(d => d)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${attendanceChecked.every(d => d)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {attendanceChecked.every(d => d) ? '완료' : '출석 체크 +50P'}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500 mb-2">{day}</div>
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${attendanceChecked[idx]
                ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-400'
                }`}>
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

      {/* Daily Missions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-500" />
          <h3 className="font-bold text-lg">오늘의 미션</h3>
        </div>
        <div className="space-y-3">
          {dailyMissions.map(mission => (
            <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{mission.title}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{mission.progress}/{mission.target}</span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-xs text-gray-500">보상</div>
                <div className="font-bold text-green-600">+{mission.reward}P</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">이번 달</span>
          </div>
          <div className="text-2xl font-bold">₩{stats.totalSpent.toLocaleString()}</div>
          <div className="text-xs opacity-80">총 지출</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">절감액</span>
          </div>
          <div className="text-2xl font-bold">₩{Math.floor(userProfile.totalSaved / 1000)}K</div>
          <div className="text-xs opacity-80">누적 절감</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">배지</span>
          </div>
          <div className="text-2xl font-bold">{userProfile.badges.length}개</div>
          <div className="text-xs opacity-80">획득 완료</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">포인트</span>
          </div>
          <div className="text-2xl font-bold">{userProfile.points.toLocaleString()}P</div>
          <div className="text-xs opacity-80">사용 가능</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">카테고리별 지출</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              데이터가 없습니다
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">예산 사용 현황</h3>
          <div className="space-y-4">
            {stats.budgetUsage.slice(0, 5).map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-gray-600">
                    ₩{item.spent.toLocaleString()} / ₩{item.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${parseFloat(item.percentage) > 90 ? 'bg-red-500' :
                      parseFloat(item.percentage) > 70 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.percentage}% 사용</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white mb-4">
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

  // Enhanced Receipts View
  const ReceiptsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">거래 내역 관리</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowValueModal(true)}
            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-100 transition border border-purple-200"
          >
            <Sparkles className="w-4 h-4" />
            연동 효과 보기
          </button>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
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
            <Link className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">금융 계좌 연동</h3>
          </div>
          <button
            onClick={() => setShowAccountLinkModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition text-sm"
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
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              지금 연동하기
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedAccounts.map(account => (
              <div key={account.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border">
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
                    <div className="font-bold text-sm">₩{(account.monthly_spent || account.monthlySpent || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">거래</div>
                    <div className="font-bold text-sm">{account.transaction_count || account.transactionCount || 0}건</div>
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
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">총 거래</span>
          </div>
          <div className="text-2xl font-bold">{stats.receiptCount}건</div>
          <div className="text-xs text-gray-500">이번 달</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-purple-500" />
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
            className="ml-auto text-xs text-blue-500 hover:text-blue-700"
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
            검색 결과: <span className="font-semibold text-blue-600">{totalFilteredTransactions}</span>건
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
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${transaction.source === 'manual' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                  {transaction.source === 'manual' ? (
                    <Camera className="w-6 h-6 text-purple-500" />
                  ) : (
                    <RefreshCw className="w-6 h-6 text-green-500" />
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
                  <div className="font-bold text-lg">₩{(transaction.amount || 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">VAT ₩{(transaction.tax || 0).toLocaleString()}</div>
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
                        ? 'bg-blue-500 text-white'
                        : 'border hover:bg-gray-100'
                      }`}
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
  // 월별 지출 데이터 계산
  const monthlySpendingData = useMemo(() => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const currentMonth = new Date().getMonth();

    // 최근 6개월 데이터 생성
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

  const BudgetView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">예산 관리</h2>

      {/* 월별 지출 추이 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">월별 지출 추이</h3>
          </div>
          <div className="text-sm text-gray-500">최근 6개월</div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `₩${v.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="지출" stroke="#3b82f6" fill="#93c5fd" />
            <Area type="monotone" dataKey="예산" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 예산 vs 실제 비교 차트 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">예산 vs 실제 지출</h3>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              예산
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              실제
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(v) => `₩${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="예산" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="실제" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 절약/초과 요약 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">절약한 항목</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {budgetComparisonData.filter(d => d.차이 > 0).length}개
          </div>
          <div className="text-sm text-green-700 mt-1">
            총 ₩{budgetComparisonData.filter(d => d.차이 > 0).reduce((sum, d) => sum + d.차이, 0).toLocaleString()} 절약
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">초과한 항목</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {budgetComparisonData.filter(d => d.차이 < 0).length}개
          </div>
          <div className="text-sm text-red-700 mt-1">
            총 ₩{Math.abs(budgetComparisonData.filter(d => d.차이 < 0).reduce((sum, d) => sum + d.차이, 0)).toLocaleString()} 초과
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">예산 달성률</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((budgetComparisonData.filter(d => d.차이 >= 0).length / Math.max(budgetComparisonData.length, 1)) * 100)}%
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {budgetComparisonData.filter(d => d.차이 >= 0).length}/{budgetComparisonData.length} 카테고리 달성
          </div>
        </div>
      </div>

      {/* 카테고리별 예산 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">카테고리별 예산 설정</h3>
        <div className="space-y-4">
          {Object.entries(budgets).map(([category, budget]) => {
            const maxLimit = budgetMaxLimits[category] || 500000;
            return (
              <div key={category} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">{category}</div>
                    <div className="text-sm text-gray-600">
                      설정 예산: ₩{budget.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBudgetCategory(category);
                      setTempBudgetLimit(maxLimit.toString());
                      setShowBudgetLimitModal(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition font-medium"
                    title="상한 설정"
                  >
                    상한: {(maxLimit / 10000).toFixed(0)}만원
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={maxLimit}
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudgets({ ...budgets, [category]: parseInt(e.target.value) })}
                    className="flex-1 accent-blue-500 h-2"
                  />
                  <div className="w-24 text-right font-bold text-lg text-blue-600">
                    ₩{budget.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 예산 사용 상세 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">예산 사용 상세</h3>
        <div className="space-y-4">
          {stats.budgetUsage.map((item, idx) => (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{item.category}</div>
                  <div className="text-sm text-gray-600">
                    ₩{item.spent.toLocaleString()} / ₩{item.budget.toLocaleString()}
                  </div>
                </div>
                <div className={`text-lg font-bold ${parseFloat(item.percentage) > 90 ? 'text-red-500' :
                  parseFloat(item.percentage) > 70 ? 'text-orange-500' :
                    'text-green-500'
                  }`}>
                  {item.percentage}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${parseFloat(item.percentage) > 90 ? 'bg-red-500' :
                    parseFloat(item.percentage) > 70 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                  style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Tax Prediction View
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

  const TaxPredictionView = () => {
    const taxData = userType === 'individual' ? individualTaxData : businessTaxData;
    const totalPredictedTax = taxData.slice(5).reduce((sum, d) => sum + d.predicted, 0);
    const totalActualTax = taxData.slice(0, 5).reduce((sum, d) => sum + d.actual, 0);

    return (
      <div className="space-y-6">
        {/* 연말정산 계산기 (슬라이더 기반) - 개인만 표시 */}
        {userType === 'individual' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-xl">연말정산 계산기</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* 입력 섹션 */}
              <div className="space-y-6">
                {/* 총급여 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">총급여액</label>
                    <span className="text-blue-600 font-bold">{calcIncome.toLocaleString()}원</span>
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
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{creditCardRatio}%</span>
                      <span className="text-blue-600 font-bold">{calcCreditCard.toLocaleString()}원</span>
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
                    <span className="text-blue-600 font-bold">{calcCashReceipt.toLocaleString()}원</span>
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
                    <span className="text-blue-600 font-bold">{calcMedical.toLocaleString()}원</span>
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
                    <span className="text-blue-600 font-bold">{calcEducation.toLocaleString()}원</span>
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
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 text-white">
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
                  <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3 mt-2">
                    <span className="font-bold text-blue-900">총 공제액</span>
                    <span className="font-bold text-blue-600">
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
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userType === 'individual' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
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
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userType === 'business' ? 'bg-purple-500' : 'bg-gray-200'
                  }`}>
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

        {/* Tax Prediction Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-bold text-lg mb-4">
            {userType === 'individual' ? '월별 세금 예상 (개인)' : '월별 세금 예상 (사업자)'}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={taxData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" name="실제 납부" />
              <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPredicted)" name="예상 납부" />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">실제 납부액 (1~5월)</div>
              <div className="text-2xl font-bold text-blue-600">₩{totalActualTax.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">예상 납부액 (6~12월)</div>
              <div className="text-2xl font-bold text-orange-600">₩{totalPredictedTax.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">절세 기회</div>
              <div className="text-2xl font-bold text-green-600">₩{Math.floor(totalPredictedTax * 0.15).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Business Specific: Cash Flow */}
        {userType === 'business' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-4">사업 현금 흐름 분석</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessTaxData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₩${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="수입" />
                <Bar dataKey="expense" fill="#ef4444" name="지출" />
              </BarChart>
            </ResponsiveContainer>
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

  // TOP 10 공제항목 체크리스트 state
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

  // Benefits View
  const BenefitsView = () => (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">혜택 자동 탐색</h2>
        <p className="text-gray-600">나에게 맞는 세금 혜택과 지원금을 찾아보세요</p>
      </div>

      {/* 요약 카드 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
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
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                benefitsCategory === cat.id ? 'bg-blue-400' : 'bg-gray-200'
              }`}>{count}</span>
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

            <div className="text-2xl font-bold text-blue-600 mb-2">{benefit.amount}</div>
            <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>

            <div className="text-xs text-gray-500 mb-4">
              <span className="font-semibold">자격요건:</span> {benefit.eligibility}
            </div>

            <button
              className={`w-full py-2 rounded-lg font-semibold transition ${
                benefit.eligible
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
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
          <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
            전문가 상담
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition">
            신청 가이드
          </button>
        </div>
      </div>
    </div>
  );

  // Challenges View
  const ChallengesView = () => (
    <div className="space-y-6">
      {/* User Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-6 text-white">
          <Trophy className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.level}</div>
          <div className="text-sm opacity-90">레벨</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl p-6 text-white">
          <Star className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.points.toLocaleString()}</div>
          <div className="text-sm opacity-90">포인트</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl p-6 text-white">
          <Award className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{unlockedBadges.length}</div>
          <div className="text-sm opacity-90">획득 배지</div>
        </div>
        <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-xl p-6 text-white">
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
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{challengeStats.active}</div>
              <div className="text-sm text-gray-600">진행 중</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{challengeStats.completed}</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{challengeStats.avgProgress}%</div>
              <div className="text-sm text-gray-600">평균 진행률</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{challengeStats.totalRewardsEarned.toLocaleString()}P</div>
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
                  <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-4 text-center border-2 border-yellow-300 hover:scale-105 transition cursor-pointer">
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
              className={`flex items-center justify-between p-4 rounded-lg ${user.isUser ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300' : 'bg-gray-50'
                }`}
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
                <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-bold">
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
          <Repeat className="w-5 h-5 text-purple-500" />
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
                  <div className="text-lg font-bold text-purple-600">+{mission.reward}P</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${(mission.progress / mission.target) * 100}%` }}
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
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{challenge.progress} / {challenge.target}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600">완료 시 보상</span>
                <span className="font-bold text-blue-600">+{challenge.reward}P</span>
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
          <div className="text-sm font-semibold text-blue-600">
            보유: {userProfile.points.toLocaleString()}P
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-4xl mx-auto mb-3">
                  {reward.icon}
                </div>
                <h4 className="font-bold mb-1">{reward.name}</h4>
                <p className="text-xs text-gray-600">{reward.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="font-bold text-lg text-blue-600">{reward.points}P</div>
                <button
                  onClick={() => handleRewardExchange(reward)}
                  disabled={userProfile.points < reward.points}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${userProfile.points >= reward.points
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">머니플랫 AI</h1>
            <p className="text-gray-500 mt-1">세무사급 AI 재무 플랫폼</p>
          </div>

          {/* 탭 전환 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${authMode === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
            >
              로그인
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${authMode === 'signup' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
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
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 카카오 로그인 */}
            <button
              onClick={handleKakaoLogin}
              className="w-full py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-lg hover:bg-[#FDD835] transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.463 2 10.714c0 2.804 1.862 5.263 4.643 6.634-.146.53-.925 3.403-.96 3.622 0 0-.02.166.088.229.108.063.235.014.235.014.31-.044 3.593-2.351 4.155-2.758.597.088 1.213.134 1.839.134 5.523 0 10-3.463 10-7.875S17.523 3 12 3z" />
              </svg>
              카카오로 시작하기
            </button>
          </div>

          {/* 테스트 계정 안내 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">테스트 방법</p>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. 위에서 회원가입 후 이메일 인증</li>
              <li>2. Supabase에서 시드 데이터 실행:</li>
              <li className="ml-3 font-mono bg-blue-100 px-2 py-1 rounded">
                SELECT seed_user_data('사용자-UUID');
              </li>
              <li>3. 로그인하면 더미 데이터가 표시됩니다</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Header with Notification Center */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">머니플랫 AI</h1>
                <p className="text-xs text-gray-500">세무사급 AI 재무 플랫폼</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 사용자 정보 */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">Lv.{userProfile.level}</p>
                </div>
              </div>

              {/* 알림 버튼 */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                {notificationCenter.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationCenter.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* OCR 스캔 버튼 */}
              <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition flex items-center gap-2">
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
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition flex items-center gap-2"
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
      <nav className="bg-white border-b sticky top-16 z-30">
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
                className={`px-6 py-3 flex items-center gap-2 whitespace-nowrap transition relative ${currentTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'receipts' && <ReceiptsView />}
        {currentTab === 'budget' && <BudgetView />}
        {currentTab === 'prediction' && <TaxPredictionView />}
        {currentTab === 'benefits' && <BenefitsView />}
        {currentTab === 'challenges' && <ChallengesView />}
      </main>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">영수증 추가</h3>
              <button onClick={() => setShowReceiptModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">상점명</label>
                <input
                  type="text"
                  value={newReceipt.merchant}
                  onChange={(e) => setNewReceipt({ ...newReceipt, merchant: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="예: 스타벅스"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">금액</label>
                <input
                  type="number"
                  value={newReceipt.amount}
                  onChange={(e) => setNewReceipt({ ...newReceipt, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  value={newReceipt.category}
                  onChange={(e) => setNewReceipt({ ...newReceipt, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {Object.keys(budgets).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">날짜</label>
                <input
                  type="date"
                  value={newReceipt.date}
                  onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <button
                onClick={handleAddReceipt}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                추가하기 (+10P)
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
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
                  입력값: ₩{parseInt(tempBudgetLimit || 0).toLocaleString()}
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
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
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
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${selectedTransaction.source === 'manual' ? 'bg-purple-100' : 'bg-green-100'}`}>
                  {selectedTransaction.source === 'manual' ? (
                    <Camera className="w-7 h-7 text-purple-500" />
                  ) : (
                    <RefreshCw className="w-7 h-7 text-green-500" />
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
                  <span className="font-bold text-xl">₩{(selectedTransaction.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">부가세 (VAT)</span>
                  <span className="font-semibold">₩{(selectedTransaction.tax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">카테고리</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{selectedTransaction.category}</span>
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
      {showAccountLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">금융 계좌 연동하기</h3>
                <p className="text-sm text-gray-600">
                  은행/카드사를 선택하고 안전하게 연동하세요
                </p>
              </div>
              <button onClick={() => setShowAccountLinkModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <div className="font-semibold mb-1">안전한 연동 보장</div>
                  <div className="text-blue-800">
                    금융결제원 오픈뱅킹 API를 통한 안전한 연동 · 비밀번호는 저장되지 않습니다
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {availableBanks.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => handleLinkAccount(bank)}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
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
      )}

      {/* Value Proposition Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">금융 연동의 가치</h2>
                <p className="text-gray-600">자동화로 얻는 실질적인 혜택</p>
              </div>
              <button onClick={() => setShowValueModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Before & After Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 text-red-900 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  연동 전 (수동 관리)
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">영수증 직접 입력</div>
                      <div className="text-gray-600">거래당 평균 2분 소요</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">누락 발생</div>
                      <div className="text-gray-600">월평균 15건 빠짐</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">정확도 낮음</div>
                      <div className="text-gray-600">세금 계산 오류 가능성</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">시간 낭비</div>
                      <div className="text-gray-600">월 90분 이상 소모</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  연동 후 (자동 관리)
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">자동 수집</div>
                      <div className="text-gray-600">실시간 거래 내역 동기화</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">100% 완벽 기록</div>
                      <div className="text-gray-600">모든 거래 자동 저장</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">정확한 세금 계산</div>
                      <div className="text-gray-600">실시간 VAT 자동 계산</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">시간 절약 95%</div>
                      <div className="text-gray-600">월 85분 절약</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowValueModal(false);
                setShowAccountLinkModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition"
            >
              지금 바로 계좌 연동하기
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal - 유저타입 및 세금 기본정보 설정 */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">설정</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 유저타입 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">사용자 유형</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleUserTypeChange('individual')}
                  className={"p-4 rounded-xl border-2 transition " + (userType === 'individual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300')}
                >
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 " + (userType === 'individual' ? 'bg-blue-500' : 'bg-gray-200')}>
                    <User className={"w-6 h-6 " + (userType === 'individual' ? 'text-white' : 'text-gray-500')} />
                  </div>
                  <div className="font-semibold text-center">개인</div>
                  <div className="text-xs text-gray-500 text-center mt-1">근로소득자, 연말정산</div>
                </button>
                <button
                  onClick={() => handleUserTypeChange('business')}
                  className={"p-4 rounded-xl border-2 transition " + (userType === 'business'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300')}
                >
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 " + (userType === 'business' ? 'bg-purple-500' : 'bg-gray-200')}>
                    <Briefcase className={"w-6 h-6 " + (userType === 'business' ? 'text-white' : 'text-gray-500')} />
                  </div>
                  <div className="font-semibold text-center">소상공인</div>
                  <div className="text-xs text-gray-500 text-center mt-1">사업자, 종합소득세</div>
                </button>
              </div>
            </div>

            {/* 세금 계산용 기본 정보 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                세금 계산 기본 정보
              </label>

              {userType === 'individual' ? (
                /* 개인용 입력 폼 */
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">연봉 (세전)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={taxBasicInfo.annualIncome}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, annualIncome: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                        placeholder="50000000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      월 {Math.round(taxBasicInfo.annualIncome / 12).toLocaleString()}원
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">부양가족 수</label>
                      <select
                        value={taxBasicInfo.dependents}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, dependents: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value={0}>없음</option>
                        <option value={1}>1명</option>
                        <option value={2}>2명</option>
                        <option value={3}>3명</option>
                        <option value={4}>4명 이상</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">배우자</label>
                      <select
                        value={taxBasicInfo.hasSpouse ? 'yes' : 'no'}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, hasSpouse: e.target.value === 'yes'})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="no">없음</option>
                        <option value="yes">있음</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* 소상공인용 입력 폼 */
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">예상 연매출</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={taxBasicInfo.expectedRevenue}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, expectedRevenue: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                        placeholder="100000000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      월 평균 {Math.round(taxBasicInfo.expectedRevenue / 12).toLocaleString()}원
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">예상 경비 (재료비, 임대료 등)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={taxBasicInfo.expectedExpenses}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, expectedExpenses: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg text-right pr-12"
                        placeholder="60000000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      경비율 {taxBasicInfo.expectedRevenue > 0 ? Math.round(taxBasicInfo.expectedExpenses / taxBasicInfo.expectedRevenue * 100) : 0}%
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxBasicInfo.isSimplifiedTax}
                        onChange={(e) => setTaxBasicInfo({...taxBasicInfo, isSimplifiedTax: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">간이과세자입니다</span>
                      <span className="text-xs text-gray-500">(연매출 8천만원 이하)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 유저타입별 안내 */}
            <div className={"p-4 rounded-lg " + (userType === 'individual' ? 'bg-blue-50' : 'bg-purple-50')}>
              <div className="font-semibold mb-2">
                {userType === 'individual' ? '개인 사용자 기능' : '소상공인 기능'}
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {userType === 'individual' ? (
                  <>
                    <li>• 연말정산 시뮬레이터</li>
                    <li>• 소득공제 항목 관리</li>
                    <li>• 근로소득세 예측</li>
                    <li>• 예상 환급액 계산</li>
                  </>
                ) : (
                  <>
                    <li>• 종합소득세 계산</li>
                    <li>• 부가가치세 관리</li>
                    <li>• 매출/매입 현황</li>
                    <li>• 필요경비 추적</li>
                  </>
                )}
              </ul>
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSaveSettings}
                className={"flex-1 py-3 px-4 rounded-lg text-white font-semibold transition " +
                  (userType === 'individual' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600')}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-3xl font-bold">프리미엄 플랜</h2>
                </div>
                <p className="text-gray-600">연간 최대 50만원 추가 절감</p>
              </div>
              <button onClick={() => setShowPremiumModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 mb-2">무료 플랜</div>
                  <div className="text-4xl font-bold">₩0</div>
                  <div className="text-sm text-gray-500">/ 월</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    영수증 등록 (월 30개)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    기본 예산 관리
                  </li>
                  <li className="flex items-center gap-2 opacity-50">
                    <X className="w-4 h-4 text-gray-400" />
                    세금 예측
                  </li>
                  <li className="flex items-center gap-2 opacity-50">
                    <X className="w-4 h-4 text-gray-400" />
                    AI 분석
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white relative border-4 border-yellow-400">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-xs font-bold">
                  추천
                </div>
                <div className="text-center mb-4">
                  <div className="text-sm opacity-90 mb-2">프리미엄 플랜</div>
                  <div className="text-5xl font-bold">₩9,900</div>
                  <div className="text-sm opacity-90">/ 월</div>
                  <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    첫 달 무료
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    무제한 영수증 등록
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    세금 예측 (정확도 95%)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    AI 맞춤 분석
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    전문가 우선 상담
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 mb-2">연간 플랜</div>
                  <div className="text-4xl font-bold">₩99,000</div>
                  <div className="text-sm text-gray-500">/ 년</div>
                  <div className="mt-2 text-xs bg-green-100 text-green-700 rounded-full px-3 py-1 inline-block">
                    2개월 무료
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    프리미엄 모든 기능
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    연간 재무 리포트
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    전문가 무료 상담 1회
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    우선 고객 지원
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setIsPremium(true);
                setShowPremiumModal(false);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition"
            >
              프리미엄 시작하기 (첫 달 무료)
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {detailsModalType === 'experts' && '세무 전문가'}
                {detailsModalType === 'products' && '맞춤 금융 상품'}
                {detailsModalType === 'community' && '재무 커뮤니티'}
              </h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {detailsModalType === 'experts' && (
              <div className="space-y-4">
                {taxExperts.map(expert => (
                  <div key={expert.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl">
                        {expert.image}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{expert.name}</h3>
                          <span className="text-sm text-gray-600">{expert.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{expert.rating}</span>
                          <span className="text-sm text-gray-500">({expert.reviews}개 리뷰)</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {expert.specialties.map((spec, idx) => (
                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full">
                              {spec}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-blue-600">₩{expert.price.toLocaleString()}</div>
                          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                            상담 신청
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailsModalType === 'products' && (
              <div className="space-y-4">
                {financialProducts.map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl">
                        {product.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                            매칭도 {product.matchScore}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{product.provider}</div>
                        <div className="text-sm font-semibold text-blue-600 mb-3">{product.benefit}</div>
                        {product.expectedSavings > 0 && (
                          <div className="text-sm text-green-600 font-bold mb-3">
                            연 ₩{product.expectedSavings.toLocaleString()} 절감
                          </div>
                        )}
                        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition">
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailsModalType === 'community' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                >
                  <Plus className="w-4 h-4" />
                  질문하기
                </button>
                {communityPosts.map(post => (
                  <div key={post.id} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">{post.author}</div>
                        <h3 className="font-bold mb-3">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.answers}개 답변
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">질문하기</h3>
              <button onClick={() => setShowQuestionModal(false)}>
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
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-32"
                  placeholder="질문 내용을 자세히 작성해주세요"
                />
              </div>

              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                질문 등록하기 (+30P)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Exchange Success Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              {selectedReward.icon}
            </div>
            <h3 className="text-2xl font-bold mb-2">교환 완료!</h3>
            <p className="text-gray-600 mb-4">
              <span className="font-bold">{selectedReward.name}</span>이(가) 지급되었습니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">사용 코드</div>
              <div className="text-2xl font-bold font-mono">ABCD-1234-EFGH</div>
            </div>
            <button
              onClick={() => {
                setShowRewardModal(false);
                setSelectedReward(null);
              }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* AI Insight Modal */}
      {showAIInsightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">AI 세무사 인사이트</h3>
              <button onClick={() => setShowAIInsightModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {aiInsights.map(insight => {
                const Icon = insight.icon;
                return (
                  <div key={insight.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 ${insight.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                        } rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${insight.priority === 'high' ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold mb-1">{insight.title}</div>
                        <div className="text-sm text-gray-700 mb-2">{insight.description}</div>
                        {insight.potentialSaving > 0 && (
                          <div className="text-lg font-bold text-green-600">
                            ₩{insight.potentialSaving.toLocaleString()} 절감 가능
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
      )}

      {/* Document Space Modal */}
      {showDocSpaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">도큐스페이스 (증빙 자료 자동 정리)</h3>
              <button onClick={() => setShowDocSpaceModal(false)}>
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
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
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
      )}

      {/* PDF Report Modal - Enhanced */}
      {showPDFReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">리포트 내보내기</h3>
              <button onClick={() => setShowPDFReportModal(false)}>
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
                    onClick={() => generatePDFReport('monthly')}
                    disabled={isLoading}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">월별 지출 리포트</div>
                        <div className="text-xs text-gray-500">거래내역, 예산현황, 카테고리 분석</div>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => generatePDFReport('yearEnd')}
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
                    onClick={() => generatePDFReport('taxHealth')}
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
                    onClick={() => handleExcelExport('receipts')}
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
                    onClick={() => handleExcelExport('budget')}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">예산현황</div>
                        <div className="text-xs text-gray-500">카테고리별 예산 vs 실제</div>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-purple-500" />
                  </button>
                  <button
                    onClick={() => handleExcelExport('all')}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition border border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">전체 데이터</div>
                        <div className="text-xs text-gray-500">모든 데이터 통합 Excel</div>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-purple-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 연말정산 시뮬레이터 Modal */}
      {showTaxSimulatorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">연말정산 시뮬레이터</h3>
                <p className="text-sm text-gray-500">예상 세금을 미리 계산해보세요</p>
              </div>
              <button onClick={() => setShowTaxSimulatorModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 입력 폼 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">소득 정보</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">연간 총급여</label>
                  <input
                    type="number"
                    value={taxSimulatorData.annualIncome}
                    onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, annualIncome: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50,000,000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">부양가족 수</label>
                    <input
                      type="number"
                      value={taxSimulatorData.dependents}
                      onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, dependents: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxSimulatorData.hasSpouse}
                        onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, hasSpouse: e.target.checked })}
                        className="w-5 h-5 text-blue-500 rounded"
                      />
                      <span className="text-sm">배우자 공제</span>
                    </label>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-700 pt-2">공제 항목</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">의료비</label>
                  <input
                    type="number"
                    value={taxSimulatorData.medicalExpenses}
                    onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, medicalExpenses: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">연금저축</label>
                    <input
                      type="number"
                      value={taxSimulatorData.pensionSavings}
                      onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, pensionSavings: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">IRP</label>
                    <input
                      type="number"
                      value={taxSimulatorData.irpAmount}
                      onChange={(e) => setTaxSimulatorData({ ...taxSimulatorData, irpAmount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateTaxSimulation}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  세금 계산하기
                </button>
              </div>

              {/* 결과 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-4">계산 결과</h4>
                {taxSimulatorResult ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-500">연간 총급여</div>
                      <div className="text-lg font-bold">{taxSimulatorResult.annualIncome.toLocaleString()}원</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-500">근로소득공제</div>
                      <div className="text-lg font-bold text-green-600">-{taxSimulatorResult.earnedIncomeDeduction.toLocaleString()}원</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-500">과세표준</div>
                      <div className="text-lg font-bold">{taxSimulatorResult.taxableIncome.toLocaleString()}원</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-500">산출세액</div>
                      <div className="text-lg font-bold">{taxSimulatorResult.calculatedTax.toLocaleString()}원</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-500">세액공제</div>
                      <div className="text-lg font-bold text-green-600">-{(taxSimulatorResult.taxCredits + taxSimulatorResult.earnedIncomeTaxCredit).toLocaleString()}원</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-4 text-white">
                      <div className="text-sm opacity-90">예상 총 세금</div>
                      <div className="text-2xl font-bold">{taxSimulatorResult.totalTax.toLocaleString()}원</div>
                      <div className="text-sm opacity-90 mt-1">
                        실효세율: {taxSimulatorResult.effectiveRate}% | 월 {taxSimulatorResult.monthlyTax.toLocaleString()}원
                      </div>
                    </div>

                    <button
                      onClick={() => generatePDFReport('yearEnd')}
                      className="w-full bg-white border-2 border-blue-500 text-blue-500 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF로 저장
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Calculator className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>소득 정보를 입력하고<br />계산하기 버튼을 눌러주세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptFinancePlatform;