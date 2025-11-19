import React, { useState, useMemo, useEffect } from 'react';
import { Camera, Upload, Wallet, TrendingUp, TrendingDown, PieChart, FileText, Users, CreditCard, Calculator, Award, ChevronRight, Plus, X, Check, AlertCircle, Sparkles, Calendar, DollarSign, Building, Bell, Target, Trophy, MessageCircle, ThumbsUp, Send, Zap, Crown, Star, Shield, Gift, ArrowUp, ArrowDown, Activity, Clock, CheckCircle, Briefcase, User, Flame, Repeat, Lock, Unlock, PartyPopper, Ticket, Coffee, ShoppingBag, Link, RefreshCw, CheckCircle2, Timer, BarChart3, Eye, EyeOff, Download, FileCheck, Folder, Search, Filter, TrendingUpIcon, AlertTriangle, Lightbulb, Receipt, Heart, GraduationCap, Home, Car, Baby, Pill, BookOpen, Laptop, Waves, LogIn, UserPlus, Key } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar } from 'recharts';
const ReceiptFinancePlatform = () => {
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
  const [showAIInsightModal, setShowAIInsightModal] = useState(false);
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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 인증 상태
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Tax Health Score
  const [taxHealthScore, setTaxHealthScore] = useState(87);

  // Real-time AI Insights (세무사급 AI 알림)
  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      type: 'critical',
      category: 'medical',
      title: '의료비 공제 임계값 근접!',
      description: '현재 의료비 89만원. 11만원 더 지출 시 추가 공제 13만원 발생',
      potentialSaving: 130000,
      currentAmount: 890000,
      threshold: 1000000,
      action: '의료비 지출 계획하기',
      deadline: '2025-12-31',
      priority: 'high',
      icon: Pill,
    },
    {
      id: 2,
      type: 'opportunity',
      category: 'education',
      title: '교육비 공제 한도 미달',
      description: '교육비 공제 한도(300만원) 중 45% 미사용. 온라인 강의/도서 구매 시 추가 세액공제 가능',
      potentialSaving: 165000,
      currentAmount: 1650000,
      threshold: 3000000,
      action: '교육비 활용하기',
      deadline: '2025-12-31',
      priority: 'medium',
      icon: GraduationCap,
    },
    {
      id: 3,
      type: 'warning',
      category: 'card',
      title: '신용카드 공제 최적화',
      description: '현재 신용카드 비중 85%. 체크카드로 전환 시 공제율 15%→30%로 증가',
      potentialSaving: 450000,
      currentRatio: 85,
      optimalRatio: 50,
      action: '카드 사용 전략 보기',
      priority: 'high',
      icon: CreditCard,
    },
    {
      id: 4,
      type: 'achievement',
      category: 'housing',
      title: '월세 공제 완료',
      description: '월세 납부 증빙 12건 자동 수집 완료. 최대 공제액(750만원) 달성',
      potentialSaving: 0,
      status: 'completed',
      action: '증빙 서류 보기',
      priority: 'low',
      icon: Home,
    },
  ]);

  // Deduction Tracker (공제 항목 자동 추적)
  const [deductionTracker, setDeductionTracker] = useState({
    medical: {
      name: '의료비',
      current: 890000,
      threshold: 1000000,
      maxDeduction: 7000000,
      deductionRate: 0.15,
      potentialSaving: 130000,
      icon: Pill,
      color: 'red',
      documents: 12,
    },
    education: {
      name: '교육비',
      current: 1650000,
      threshold: 0,
      maxDeduction: 3000000,
      deductionRate: 0.15,
      potentialSaving: 165000,
      icon: GraduationCap,
      color: 'blue',
      documents: 8,
    },
    housing: {
      name: '월세',
      current: 9000000,
      threshold: 0,
      maxDeduction: 7500000,
      deductionRate: 0.12,
      potentialSaving: 0,
      icon: Home,
      color: 'green',
      documents: 12,
    },
    donation: {
      name: '기부금',
      current: 500000,
      threshold: 0,
      maxDeduction: 10000000,
      deductionRate: 0.15,
      potentialSaving: 75000,
      icon: Heart,
      color: 'pink',
      documents: 3,
    },
    pension: {
      name: '연금저축',
      current: 4000000,
      threshold: 0,
      maxDeduction: 4000000,
      deductionRate: 0.15,
      potentialSaving: 0,
      icon: Wallet,
      color: 'purple',
      documents: 12,
    },
  });

  // Document Space (증빙 자료 자동 정리)
  const [documentSpace, setDocumentSpace] = useState({
    yearEnd: {
      name: '연말정산',
      count: 45,
      folders: [
        { name: '의료비', count: 12, lastUpdated: '2025-11-18' },
        { name: '교육비', count: 8, lastUpdated: '2025-11-15' },
        { name: '기부금', count: 3, lastUpdated: '2025-11-10' },
        { name: '신용카드', count: 18, lastUpdated: '2025-11-18' },
        { name: '주택자금', count: 4, lastUpdated: '2025-11-01' },
      ],
    },
    comprehensiveTax: {
      name: '종합소득세',
      count: 32,
      folders: [
        { name: '사업소득', count: 12, lastUpdated: '2025-11-18' },
        { name: '경비증빙', count: 15, lastUpdated: '2025-11-17' },
        { name: '매입세액', count: 5, lastUpdated: '2025-11-10' },
      ],
    },
    vat: {
      name: '부가가치세',
      count: 28,
      folders: [
        { name: '매출', count: 12, lastUpdated: '2025-11-18' },
        { name: '매입', count: 16, lastUpdated: '2025-11-18' },
      ],
    },
  });

  // Notification Center
  const [notificationCenter, setNotificationCenter] = useState([
    {
      id: 1,
      type: 'ai_insight',
      title: '의료비 공제 기회 발견',
      message: '11만원 추가 지출 시 13만원 공제 가능',
      timestamp: '방금 전',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'document',
      title: '증빙 서류 3건 자동 수집',
      message: '의료비 영수증이 자동으로 정리되었습니다',
      timestamp: '10분 전',
      read: false,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'deadline',
      title: '연말정산 D-42',
      message: '놓치지 말고 공제 항목을 확인하세요',
      timestamp: '1시간 전',
      read: true,
      priority: 'medium',
    },
    {
      id: 4,
      type: 'achievement',
      title: '레벨 13 달성!',
      message: '500 포인트를 획득했습니다',
      timestamp: '2시간 전',
      read: true,
      priority: 'low',
    },
  ]);

  // Linked accounts
  const [linkedAccounts, setLinkedAccounts] = useState([
    {
      id: 1,
      type: 'credit',
      bank: '신한카드',
      name: '신한 Deep Dream',
      lastDigits: '1234',
      color: 'blue',
      icon: '💳',
      linkedDate: '2025-11-01',
      status: 'active',
      monthlySpent: 1234500,
      transactionCount: 45,
    },
    {
      id: 2,
      type: 'debit',
      bank: 'KB국민은행',
      name: 'KB Star 체크카드',
      lastDigits: '5678',
      color: 'yellow',
      icon: '💳',
      linkedDate: '2025-11-01',
      status: 'active',
      monthlySpent: 567800,
      transactionCount: 28,
    },
    {
      id: 3,
      type: 'account',
      bank: '카카오뱅크',
      name: '입출금 통장',
      lastDigits: '9012',
      color: 'purple',
      icon: '🏦',
      linkedDate: '2025-11-02',
      status: 'active',
      monthlySpent: 342100,
      transactionCount: 15,
    },
  ]);

  const availableBanks = [
    { id: 1, name: '신한은행', icon: '🏦', color: 'blue' },
    { id: 2, name: 'KB국민은행', icon: '🏦', color: 'yellow' },
    { id: 3, name: '우리은행', icon: '🏦', color: 'cyan' },
    { id: 4, name: '하나은행', icon: '🏦', color: 'green' },
    { id: 5, name: 'NH농협', icon: '🏦', color: 'green' },
    { id: 6, name: '카카오뱅크', icon: '🏦', color: 'yellow' },
    { id: 7, name: '토스뱅크', icon: '🏦', color: 'blue' },
    { id: 8, name: '삼성카드', icon: '💳', color: 'blue' },
    { id: 9, name: '현대카드', icon: '💳', color: 'purple' },
    { id: 10, name: 'BC카드', icon: '💳', color: 'red' },
  ];

  const [autoTransactions, setAutoTransactions] = useState([
    { id: 'a1', date: '2025-11-18', merchant: 'CU편의점 강남점', category: '편의점', amount: 8500, tax: 850, accountId: 1, matched: false, ocrConfidence: 0.98 },
    { id: 'a2', date: '2025-11-18', merchant: '스타벅스 역삼점', category: '식비', amount: 14800, tax: 1480, accountId: 1, matched: false, ocrConfidence: 0.95 },
    { id: 'a3', date: '2025-11-17', merchant: '이마트 트레이더스', category: '식료품', amount: 125000, tax: 12500, accountId: 2, matched: false, ocrConfidence: 0.99 },
    { id: 'a4', date: '2025-11-17', merchant: '카카오T', category: '교통', amount: 15300, tax: 1530, accountId: 3, matched: false, ocrConfidence: 0.97 },
    { id: 'a5', date: '2025-11-16', merchant: 'CGV 강남', category: '문화/여가', amount: 28000, tax: 2800, accountId: 1, matched: false, ocrConfidence: 0.96 },
    { id: 'a6', date: '2025-11-16', merchant: '올리브영 선릉점', category: '생활용품', amount: 45600, tax: 4560, accountId: 2, matched: false, ocrConfidence: 0.94 },
    { id: 'a7', date: '2025-11-15', merchant: 'GS25 역삼점', category: '편의점', amount: 12400, tax: 1240, accountId: 1, matched: false, ocrConfidence: 0.98 },
    { id: 'a8', date: '2025-11-15', merchant: '교보문고', category: '도서/교육', amount: 38900, tax: 3890, accountId: 2, matched: false, ocrConfidence: 0.99 },
  ]);

  const [userProfile, setUserProfile] = useState({
    name: '김머니',
    email: 'money@example.com',
    level: 12,
    currentExp: 2450,
    expToNextLevel: 3000,
    badges: ['절약왕', '세금마스터', '챌린지러', '출석왕', '리뷰어'],
    points: 2450,
    rank: 156,
    totalUsers: 15234,
    streak: 7,
    totalSaved: 1250000,
    taxHealthScore: 87,
  });

  const [dailyMissions, setDailyMissions] = useState([
    { id: 1, title: '영수증 3개 등록하기', progress: 2, target: 3, reward: 50, completed: false },
    { id: 2, title: '예산 점검하기', progress: 0, target: 1, reward: 30, completed: false },
    { id: 3, title: '금융 상품 둘러보기', progress: 0, target: 1, reward: 20, completed: false },
  ]);

  const [weeklyMissions, setWeeklyMissions] = useState([
    { id: 1, title: '영수증 20개 등록', progress: 12, target: 20, reward: 300, completed: false },
    { id: 2, title: '예산 초과 0회', progress: 5, target: 7, reward: 500, completed: false },
    { id: 3, title: '커뮤니티 질문 3회', progress: 1, target: 3, reward: 200, completed: false },
  ]);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: '🎉 신규 가입 이벤트',
      description: '7일 연속 출석하면 스타벅스 쿠폰 증정!',
      endDate: '2025-12-31',
      reward: '스타벅스 아메리카노',
      progress: 5,
      target: 7,
      type: 'attendance',
      active: true,
    },
    {
      id: 2,
      title: '💰 11월 절약왕 챌린지',
      description: '이번 달 가장 많이 절약한 Top 100에게 추가 포인트!',
      endDate: '2025-11-30',
      reward: '1,000P ~ 10,000P',
      type: 'competition',
      active: true,
    },
    {
      id: 3,
      title: '🎁 친구 초대 이벤트',
      description: '친구 1명 초대 시 양쪽 모두 500P 지급',
      endDate: '상시',
      reward: '500P',
      type: 'referral',
      active: true,
    },
  ]);

  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: '스타벅스 아메리카노',
      description: '스타벅스 아메리카노 Tall',
      points: 500,
      icon: '☕',
      category: 'coffee',
      stock: 'unlimited',
    },
    {
      id: 2,
      name: 'GS25 5천원권',
      description: 'GS25 편의점 상품권 5,000원',
      points: 450,
      icon: '🏪',
      category: 'voucher',
      stock: 'unlimited',
    },
    {
      id: 3,
      name: '쿠팡 1만원 할인쿠폰',
      description: '쿠팡에서 사용 가능한 만원 할인',
      points: 900,
      icon: '🛒',
      category: 'voucher',
      stock: 'limited',
    },
    {
      id: 4,
      name: '올리브영 5천원권',
      description: '올리브영 상품권 5,000원',
      points: 450,
      icon: '💄',
      category: 'beauty',
      stock: 'unlimited',
    },
    {
      id: 5,
      name: '카카오톡 이모티콘',
      description: '인기 이모티콘 1개',
      points: 300,
      icon: '😊',
      category: 'digital',
      stock: 'unlimited',
    },
    {
      id: 6,
      name: '프리미엄 1개월 무료',
      description: '프리미엄 기능 1개월 무료 체험',
      points: 2000,
      icon: '👑',
      category: 'premium',
      stock: 'limited',
    },
  ]);

  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: '식비 20% 절감',
      description: '이번 달 식비를 지난 달 대비 20% 줄이기',
      progress: 65,
      target: 100,
      reward: 200,
      badge: '🍽️',
      status: 'active',
      daysLeft: 8,
      difficulty: 'medium',
    },
    {
      id: 2,
      title: '영수증 30개 등록',
      description: '한 달 동안 영수증 30개 이상 등록하기',
      progress: 22,
      target: 30,
      reward: 150,
      badge: '📝',
      status: 'active',
      daysLeft: 8,
      difficulty: 'easy',
    },
    {
      id: 3,
      title: '예산 준수 완벽왕',
      description: '모든 카테고리에서 예산을 초과하지 않기',
      progress: 85,
      target: 100,
      reward: 300,
      badge: '🎯',
      status: 'active',
      daysLeft: 8,
      difficulty: 'hard',
    },
    {
      id: 4,
      title: '커뮤니티 활동가',
      description: '질문 5개 작성하고 답변 10개 달기',
      progress: 6,
      target: 15,
      reward: 250,
      badge: '💬',
      status: 'active',
      daysLeft: 15,
      difficulty: 'medium',
    },
  ]);

  const [completedChallenges, setCompletedChallenges] = useState([
    { id: 1, title: '첫 영수증 등록', badge: '🎉', reward: 100, completedDate: '2025-11-10' },
    { id: 2, title: '7일 연속 출석', badge: '🔥', reward: 200, completedDate: '2025-11-08' },
    { id: 3, title: '예산 첫 설정', badge: '💰', reward: 50, completedDate: '2025-11-05' },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: '절약마스터', points: 8750, badge: '👑' },
    { rank: 2, name: '돈모으기왕', points: 7320, badge: '🥈' },
    { rank: 3, name: '재테크고수', points: 6890, badge: '🥉' },
    { rank: 156, name: '김머니 (나)', points: 2450, badge: '⭐', isUser: true },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'savings',
      title: '스타벅스 할인 기회!',
      description: 'KB국민카드로 전환 시 월 4,500원 절감',
      icon: '☕',
      savings: 4500,
      priority: 'high',
    },
    {
      id: 2,
      type: 'alert',
      title: '식비 예산 80% 도달',
      description: '이번 달 식비가 예산의 80%에 도달했습니다',
      icon: '🍴',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'tax',
      title: '종합소득세 예상',
      description: '5월 예상 납부액 전년 대비 18% 증가 예상',
      icon: '📋',
      priority: 'high',
    },
  ]);

  const communityPosts = [
    {
      id: 1,
      author: '익명의 프리랜서',
      title: '프리랜서 종소세 신고 시 업무용 태블릿 구매 비용 공제 가능한가요?',
      answers: 12,
      likes: 34,
    },
    {
      id: 2,
      author: '절약왕김씨',
      title: '1인 가구 월 50만원으로 생활 가능할까요?',
      answers: 28,
      likes: 67,
    },
  ];

  const [receipts, setReceipts] = useState([
    { id: 1, date: '2025-11-15', merchant: '스타벅스', category: '식비', amount: 15000, tax: 1500, type: 'manual' },
    { id: 2, date: '2025-11-14', merchant: 'GS25', category: '편의점', amount: 8000, tax: 800, type: 'manual' },
    { id: 3, date: '2025-11-13', merchant: '교보문고', category: '도서/교육', amount: 35000, tax: 3500, type: 'manual' },
    { id: 4, date: '2025-11-12', merchant: '올리브영', category: '생활용품', amount: 42000, tax: 4200, type: 'manual' },
    { id: 5, date: '2025-11-11', merchant: 'CU편의점', category: '식비', amount: 12000, tax: 1200, type: 'manual' },
    { id: 6, date: '2025-11-10', merchant: '이마트', category: '식료품', amount: 89000, tax: 8900, type: 'manual' },
    { id: 7, date: '2025-11-09', merchant: '카페베네', category: '식비', amount: 18000, tax: 1800, type: 'manual' },
    { id: 8, date: '2025-11-08', merchant: '다이소', category: '생활용품', amount: 15000, tax: 1500, type: 'manual' },
  ]);

  const [budgets, setBudgets] = useState({
    '식비': 300000,
    '교통': 100000,
    '생활용품': 150000,
    '문화/여가': 200000,
    '도서/교육': 100000,
    '의료': 50000,
    '기타': 100000,
  });

  const individualTaxData = [
    { month: '1월', actual: 850000, predicted: 850000, expense: 1200000 },
    { month: '2월', actual: 920000, predicted: 920000, expense: 1300000 },
    { month: '3월', actual: 1100000, predicted: 1100000, expense: 1450000 },
    { month: '4월', actual: 950000, predicted: 950000, expense: 1250000 },
    { month: '5월', actual: 1200000, predicted: 1200000, expense: 1600000 },
    { month: '6월', actual: 0, predicted: 1150000, expense: 1500000 },
    { month: '7월', actual: 0, predicted: 1250000, expense: 1650000 },
    { month: '8월', actual: 0, predicted: 1300000, expense: 1700000 },
    { month: '9월', actual: 0, predicted: 1200000, expense: 1550000 },
    { month: '10월', actual: 0, predicted: 1350000, expense: 1750000 },
    { month: '11월', actual: 0, predicted: 1400000, expense: 1800000 },
    { month: '12월', actual: 0, predicted: 1450000, expense: 1850000 },
  ];

  const businessTaxData = [
    { month: '1월', actual: 2800000, predicted: 2800000, income: 8500000, expense: 4200000, vat: 420000 },
    { month: '2월', actual: 3200000, predicted: 3200000, income: 9200000, expense: 4500000, vat: 450000 },
    { month: '3월', actual: 3500000, predicted: 3500000, income: 10500000, expense: 5000000, vat: 500000 },
    { month: '4월', actual: 2900000, predicted: 2900000, income: 8800000, expense: 4300000, vat: 430000 },
    { month: '5월', actual: 3800000, predicted: 3800000, income: 11200000, expense: 5500000, vat: 550000 },
    { month: '6월', actual: 0, predicted: 3600000, income: 10500000, expense: 5200000, vat: 520000 },
    { month: '7월', actual: 0, predicted: 3900000, income: 11800000, expense: 5800000, vat: 580000 },
    { month: '8월', actual: 0, predicted: 4200000, income: 12500000, expense: 6200000, vat: 620000 },
    { month: '9월', actual: 0, predicted: 3700000, income: 11000000, expense: 5400000, vat: 540000 },
    { month: '10월', actual: 0, predicted: 4100000, income: 12200000, expense: 6000000, vat: 600000 },
    { month: '11월', actual: 0, predicted: 4300000, income: 12800000, expense: 6300000, vat: 630000 },
    { month: '12월', actual: 0, predicted: 4500000, income: 13500000, expense: 6700000, vat: 670000 },
  ];

  const premiumComparisonData = [
    { feature: '세금절감', free: 20, premium: 85 },
    { feature: '예측정확도', free: 30, premium: 95 },
    { feature: '절약팁', free: 40, premium: 90 },
    { feature: '전문가상담', free: 0, premium: 100 },
    { feature: '커스텀분석', free: 25, premium: 95 },
  ];

  const taxExperts = [
    {
      id: 1,
      name: '김세무',
      title: '세무사',
      rating: 4.9,
      reviews: 284,
      specialties: ['프리랜서', '소상공인', '부가세 신고'],
      price: 50000,
      experience: 15,
      image: '👨‍💼',
    },
    {
      id: 2,
      name: '이회계',
      title: '공인회계사',
      rating: 4.8,
      reviews: 192,
      specialties: ['종합소득세', '법인세', '재무컨설팅'],
      price: 80000,
      experience: 12,
      image: '👩‍💼',
    },
  ];

  const financialProducts = [
    {
      id: 1,
      type: 'card',
      name: '비즈니스 플러스 카드',
      provider: '신한카드',
      rating: 4.7,
      benefit: '사무용품 5% 캐시백',
      matchScore: 95,
      icon: '💳',
      expectedSavings: 45000,
    },
    {
      id: 2,
      type: 'loan',
      name: '사업자 신용대출',
      provider: 'KB국민은행',
      rating: 4.5,
      benefit: '연 3.5% 저금리',
      matchScore: 88,
      icon: '🏦',
      expectedSavings: 500000,
    },
  ];

  const [newReceipt, setNewReceipt] = useState({
    merchant: '',
    amount: '',
    category: '식비',
    date: new Date().toISOString().split('T')[0],
  });

  // Calculate Tax Health Score
  const calculateTaxHealthScore = () => {
    let score = 100;

    // 공제 활용도
    const deductionUsage = Object.values(deductionTracker).reduce((sum, item) => {
      return sum + (item.current / item.maxDeduction);
    }, 0) / Object.keys(deductionTracker).length;
    score -= (1 - deductionUsage) * 20;

    // 증빙 완성도
    const totalDocs = Object.values(deductionTracker).reduce((sum, item) => sum + item.documents, 0);
    if (totalDocs < 30) score -= 10;

    // 세금 납부 이력
    score -= 5; // 예시

    return Math.round(score);
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
    };
  }, [receipts, autoTransactions, budgets]);

  // Handle functions
  const handleAttendanceCheck = () => {
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
  };

  const handleRewardExchange = (reward) => {
    if (userProfile.points >= reward.points) {
      setUserProfile({
        ...userProfile,
        points: userProfile.points - reward.points,
      });
      setSelectedReward(reward);
      setShowRewardModal(true);
    }
  };

  const handleLinkAccount = (bank) => {
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

    setLinkedAccounts([...linkedAccounts, newAccount]);
    setShowAccountLinkModal(false);

    setUserProfile({
      ...userProfile,
      points: userProfile.points + 100,
      currentExp: userProfile.currentExp + 50,
    });
  };

  const handleAddReceipt = () => {
    if (!newReceipt.merchant || !newReceipt.amount) return;

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
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTimeout(() => {
      const mockData = {
        merchant: '모의 상점',
        amount: Math.floor(Math.random() * 50000 + 10000).toString(),
        category: ['식비', '생활용품', '교통', '문화/여가'][Math.floor(Math.random() * 4)],
        date: new Date().toISOString().split('T')[0],
      };
      setNewReceipt(mockData);
      setShowReceiptModal(true);
    }, 1000);
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    alert('PDF 리포트가 생성되었습니다!\n\n포함 내용:\n- 월간 지출 분석\n- 세금 예측 리포트\n- 공제 항목 상세\n- Tax Health Score\n- 증빙 서류 목록\n\n다운로드가 시작됩니다...');
    setShowPDFReportModal(false);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const pieChartData = Object.entries(stats.categorySpending).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const getCombinedTransactions = () => {
    const manual = receipts.map(r => ({ ...r, source: 'manual' }));
    const auto = autoTransactions.map(t => ({ ...t, source: 'auto' }));
    const combined = [...manual, ...auto].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (receiptViewMode === 'manual') return manual.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (receiptViewMode === 'auto') return auto.sort((a, b) => new Date(b.date) - new Date(a.date));
    return combined;
  };

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

      {/* Tax Health Score Detail */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-lg">Tax Health Score™</h3>
          </div>
          <button
            onClick={() => setShowPDFReportModal(true)}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            리포트 다운로드
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={200}>
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
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">공제 활용도</span>
              </div>
              <span className="font-bold text-green-600">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <span className="text-sm">증빙 완성도</span>
              </div>
              <span className="font-bold text-blue-600">92%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm">납부 이력</span>
              </div>
              <span className="font-bold text-orange-600">양호</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deduction Tracker */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">공제 항목 실시간 추적</h3>
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
                      <div className="text-xs text-gray-500">****{account.lastDigits}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    연동중
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <div className="text-xs text-gray-500">이번 달</div>
                    <div className="font-bold text-sm">₩{account.monthlySpent.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">거래</div>
                    <div className="font-bold text-sm">{account.transactionCount}건</div>
                  </div>
                </div>
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

      {/* View Mode Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">보기:</span>
          <button
            onClick={() => setReceiptViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${receiptViewMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            전체 ({stats.receiptCount})
          </button>
          <button
            onClick={() => setReceiptViewMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${receiptViewMode === 'manual'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            수동 ({stats.manualCount})
          </button>
          <button
            onClick={() => setReceiptViewMode('auto')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${receiptViewMode === 'auto'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            자동 ({stats.autoCount})
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">거래 내역</h3>
        <div className="space-y-3">
          {getCombinedTransactions().map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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
                    {transaction.source === 'auto' && transaction.accountId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {linkedAccounts.find(a => a.id === transaction.accountId)?.bank}
                      </span>
                    )}
                    {transaction.ocrConfidence && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        OCR {Math.round(transaction.ocrConfidence * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{transaction.date} · {transaction.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">₩{transaction.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">VAT ₩{transaction.tax.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Budget View
  const BudgetView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">예산 관리</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">카테고리별 예산 설정</h3>
        <div className="space-y-4">
          {Object.entries(budgets).map(([category, budget]) => (
            <div key={category} className="flex items-center gap-4">
              <div className="w-32 font-medium text-sm">{category}</div>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={budget}
                onChange={(e) => setBudgets({ ...budgets, [category]: parseInt(e.target.value) })}
                className="flex-1"
              />
              <div className="w-32 text-right font-semibold">
                ₩{budget.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

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
  const TaxPredictionView = () => {
    const taxData = userType === 'individual' ? individualTaxData : businessTaxData;
    const totalPredictedTax = taxData.slice(5).reduce((sum, d) => sum + d.predicted, 0);
    const totalActualTax = taxData.slice(0, 5).reduce((sum, d) => sum + d.actual, 0);

    return (
      <div className="space-y-6">
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
          <div className="text-3xl font-bold mb-1">{userProfile.badges.length}</div>
          <div className="text-sm opacity-90">배지</div>
        </div>
        <div className="bg-gradient-to-br from-pink-400 to-red-400 rounded-xl p-6 text-white">
          <Flame className="w-8 h-8 mb-3" />
          <div className="text-3xl font-bold mb-1">{userProfile.streak}</div>
          <div className="text-sm opacity-90">연속 출석</div>
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                {notificationCenter.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notificationCenter.filter(n => !n.read).length}
                  </span>
                )}
              </button>
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

      {/* PDF Report Modal */}
      {showPDFReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">PDF 리포트 생성</h3>
              <button onClick={() => setShowPDFReportModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">리포트 내용</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ Tax Health Score™ 분석</li>
                  <li>✓ 월간 지출 상세 내역</li>
                  <li>✓ 공제 항목 현황</li>
                  <li>✓ 세금 예측 및 절세 전략</li>
                  <li>✓ 증빙 서류 목록</li>
                </ul>
              </div>

              <button
                onClick={generatePDFReport}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                PDF 다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptFinancePlatform;