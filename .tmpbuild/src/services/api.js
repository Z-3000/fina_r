import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// 사용자 인증 API
// ============================================
export const authAPI = {
  // 로그인
  login: async (email, password) => {
    const response = await api.get(`/users?email=${email}&password=${password}`);
    if (response.data.length > 0) {
      const user = response.data[0];
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  },

  // 회원가입
  signup: async (userData) => {
    const existingUser = await api.get(`/users?email=${userData.email}`);
    if (existingUser.data.length > 0) {
      return { success: false, error: '이미 등록된 이메일입니다.' };
    }

    const newUser = {
      ...userData,
      level: 1,
      currentExp: 0,
      expToNextLevel: 500,
      badges: [],
      points: 0,
      rank: 10000,
      totalUsers: 15234,
      streak: 0,
      totalSaved: 0,
      taxHealthScore: 50,
      isPremium: false,
      userType: 'individual',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const response = await api.post('/users', newUser);
    localStorage.setItem('userId', response.data.id);
    localStorage.setItem('user', JSON.stringify(response.data));
    return { success: true, user: response.data };
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
  },

  // 현재 사용자 가져오기
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 사용자 정보 업데이트
  updateUser: async (userId, updates) => {
    const response = await api.patch(`/users/${userId}`, updates);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};

// ============================================
// 거래내역 (영수증) API
// ============================================
export const receiptsAPI = {
  // 영수증 목록 가져오기
  getAll: async (userId) => {
    const response = await api.get(`/receipts?userId=${userId}&_sort=date&_order=desc`);
    return response.data;
  },

  // 영수증 추가
  create: async (receiptData) => {
    const receipt = {
      ...receiptData,
      tax: Math.floor(receiptData.amount * 0.1),
      type: 'manual',
      createdAt: new Date().toISOString(),
    };
    const response = await api.post('/receipts', receipt);
    return response.data;
  },

  // 영수증 수정
  update: async (id, updates) => {
    const response = await api.patch(`/receipts/${id}`, updates);
    return response.data;
  },

  // 영수증 삭제
  delete: async (id) => {
    await api.delete(`/receipts/${id}`);
    return true;
  },

  // OCR 영수증 처리 (시뮬레이션)
  processOCR: async (file) => {
    // OCR 시뮬레이션 - 더미 데이터 반환
    await new Promise(resolve => setTimeout(resolve, 1500)); // 처리 시간 시뮬레이션

    const merchants = ['스타벅스', '이마트', 'GS25', '올리브영', '교보문고', 'CU편의점', 'CGV'];
    const categories = ['식비', '생활용품', '교통', '문화/여가', '도서/교육', '편의점'];

    return {
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      amount: Math.floor(Math.random() * 50000 + 10000),
      category: categories[Math.floor(Math.random() * categories.length)],
      date: new Date().toISOString().split('T')[0],
      confidence: 0.85 + Math.random() * 0.15, // 85% ~ 100%
    };
  },
};

// ============================================
// 자동 거래 (계좌 연동) API
// ============================================
export const autoTransactionsAPI = {
  // 자동 거래 내역 가져오기
  getAll: async (userId) => {
    const response = await api.get(`/autoTransactions?userId=${userId}&_sort=date&_order=desc`);
    return response.data;
  },

  // 거래 매칭 처리
  matchTransaction: async (transactionId) => {
    const response = await api.patch(`/autoTransactions/${transactionId}`, { matched: true });
    return response.data;
  },

  // 새 자동 거래 동기화 (시뮬레이션)
  syncTransactions: async (accountId) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 동기화 시간 시뮬레이션

    const newTransactions = [
      {
        date: new Date().toISOString().split('T')[0],
        merchant: `새로운 거래처 ${Math.floor(Math.random() * 100)}`,
        category: '기타',
        amount: Math.floor(Math.random() * 30000 + 5000),
        accountId,
        matched: false,
        ocrConfidence: 0.95,
      },
    ];

    return newTransactions;
  },
};

// ============================================
// 계좌 연동 API
// ============================================
export const accountsAPI = {
  // 연결된 계좌 목록
  getLinkedAccounts: async (userId) => {
    const response = await api.get(`/linkedAccounts?userId=${userId}`);
    return response.data;
  },

  // 계좌 연결
  linkAccount: async (accountData) => {
    const newAccount = {
      ...accountData,
      linkedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      monthlySpent: 0,
      transactionCount: 0,
    };
    const response = await api.post('/linkedAccounts', newAccount);
    return response.data;
  },

  // 계좌 연결 해제
  unlinkAccount: async (id) => {
    await api.delete(`/linkedAccounts/${id}`);
    return true;
  },

  // 사용 가능한 은행 목록
  getAvailableBanks: async () => {
    const response = await api.get('/availableBanks');
    return response.data;
  },
};

// ============================================
// 예산 관리 API
// ============================================
export const budgetsAPI = {
  // 예산 목록
  getAll: async (userId, month) => {
    const response = await api.get(`/budgets?userId=${userId}&month=${month}`);
    return response.data;
  },

  // 예산 설정/수정
  setBudget: async (budgetData) => {
    const existing = await api.get(
      `/budgets?userId=${budgetData.userId}&category=${budgetData.category}&month=${budgetData.month}`
    );

    if (existing.data.length > 0) {
      const response = await api.patch(`/budgets/${existing.data[0].id}`, { amount: budgetData.amount });
      return response.data;
    } else {
      const response = await api.post('/budgets', budgetData);
      return response.data;
    }
  },

  // 카테고리별 지출 계산
  getSpendingByCategory: async (userId, month) => {
    const receipts = await api.get(`/receipts?userId=${userId}`);
    const autoTx = await api.get(`/autoTransactions?userId=${userId}`);

    const spending = {};
    const allTransactions = [...receipts.data, ...autoTx.data];

    allTransactions
      .filter(tx => tx.date.startsWith(month))
      .forEach(tx => {
        spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
      });

    return spending;
  },
};

// ============================================
// 세금 관리 API
// ============================================
export const taxAPI = {
  // 개인 세금 데이터
  getIndividualTaxData: async (userId) => {
    const response = await api.get(`/individualTaxData?userId=${userId}`);
    return response.data;
  },

  // 사업자 세금 데이터
  getBusinessTaxData: async (userId) => {
    const response = await api.get(`/businessTaxData?userId=${userId}`);
    return response.data;
  },

  // 공제 항목 추적
  getDeductionTracker: async (userId) => {
    const response = await api.get(`/deductionTracker?userId=${userId}`);
    return response.data;
  },

  // 공제 항목 업데이트
  updateDeduction: async (id, updates) => {
    const response = await api.patch(`/deductionTracker/${id}`, updates);
    return response.data;
  },

  // 세금 건강 점수 계산
  calculateTaxHealthScore: async (userId) => {
    const deductions = await api.get(`/deductionTracker?userId=${userId}`);

    let score = 100;
    const deductionData = deductions.data;

    // 공제 활용도 계산
    const deductionUsage = deductionData.reduce((sum, item) => {
      return sum + (item.current / item.maxDeduction);
    }, 0) / deductionData.length;
    score -= (1 - deductionUsage) * 20;

    // 증빙 완성도
    const totalDocs = deductionData.reduce((sum, item) => sum + item.documents, 0);
    if (totalDocs < 30) score -= 10;

    return Math.round(Math.max(0, Math.min(100, score)));
  },

  // 세금 예측 (AI 시뮬레이션)
  predictTax: async (userId, userType) => {
    const endpoint = userType === 'business' ? 'businessTaxData' : 'individualTaxData';
    const response = await api.get(`/${endpoint}?userId=${userId}`);

    // 예측 로직 시뮬레이션
    const data = response.data;
    const lastActual = data.filter(d => d.actual > 0).slice(-1)[0];

    return {
      nextMonthPredicted: lastActual ? Math.floor(lastActual.actual * (1 + Math.random() * 0.1)) : 1000000,
      yearEndPredicted: data.reduce((sum, d) => sum + d.predicted, 0),
      potentialSavings: Math.floor(Math.random() * 500000 + 100000),
    };
  },
};

// ============================================
// 챌린지 & 게임화 API
// ============================================
export const gamificationAPI = {
  // 활성 챌린지 목록
  getChallenges: async () => {
    const response = await api.get('/challenges?status=active');
    return response.data;
  },

  // 완료된 챌린지
  getCompletedChallenges: async (userId) => {
    const response = await api.get(`/completedChallenges?userId=${userId}`);
    return response.data;
  },

  // 챌린지 진행상황 업데이트
  updateChallengeProgress: async (challengeId, progress) => {
    const response = await api.patch(`/challenges/${challengeId}`, { progress });
    return response.data;
  },

  // 챌린지 완료 처리
  completeChallenge: async (userId, challenge) => {
    // 완료된 챌린지에 추가
    await api.post('/completedChallenges', {
      userId,
      title: challenge.title,
      badge: challenge.badge,
      reward: challenge.reward,
      completedDate: new Date().toISOString().split('T')[0],
    });

    // 기존 챌린지 삭제
    await api.delete(`/challenges/${challenge.id}`);

    return true;
  },

  // 일일 미션
  getDailyMissions: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/dailyMissions?userId=${userId}&date=${today}`);
    return response.data;
  },

  // 주간 미션
  getWeeklyMissions: async (userId) => {
    const response = await api.get(`/weeklyMissions?userId=${userId}`);
    return response.data;
  },

  // 미션 진행상황 업데이트
  updateMissionProgress: async (missionType, missionId, progress) => {
    const endpoint = missionType === 'daily' ? 'dailyMissions' : 'weeklyMissions';
    const response = await api.patch(`/${endpoint}/${missionId}`, { progress });
    return response.data;
  },

  // 리더보드
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard?_sort=points&_order=desc&_limit=10');
    return response.data;
  },

  // 리워드 목록
  getRewards: async () => {
    const response = await api.get('/rewards');
    return response.data;
  },

  // 리워드 교환
  exchangeReward: async (userId, reward) => {
    // 교환 내역 추가
    await api.post('/rewardHistory', {
      userId,
      rewardId: reward.id,
      rewardName: reward.name,
      points: reward.points,
      exchangedAt: new Date().toISOString(),
      status: 'pending',
    });

    return true;
  },

  // 출석 체크
  checkAttendance: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = await api.get(`/attendance?userId=${userId}&date=${today}`);

    if (existing.data.length > 0 && existing.data[0].checked) {
      return { success: false, message: '이미 출석체크했습니다.' };
    }

    if (existing.data.length > 0) {
      await api.patch(`/attendance/${existing.data[0].id}`, { checked: true, points: 50 });
    } else {
      await api.post('/attendance', { userId, date: today, checked: true, points: 50 });
    }

    return { success: true, points: 50 };
  },

  // 출석 기록
  getAttendanceHistory: async (userId) => {
    const response = await api.get(`/attendance?userId=${userId}&_sort=date&_order=desc&_limit=7`);
    return response.data;
  },

  // 이벤트 목록
  getEvents: async () => {
    const response = await api.get('/events?active=true');
    return response.data;
  },
};

// ============================================
// AI 인사이트 & 알림 API
// ============================================
export const insightsAPI = {
  // AI 인사이트 가져오기
  getAIInsights: async (userId) => {
    const response = await api.get(`/aiInsights?userId=${userId}&_sort=priority&_order=desc`);
    return response.data;
  },

  // 알림 센터
  getNotificationCenter: async (userId) => {
    const response = await api.get(`/notificationCenter?userId=${userId}&_sort=read&_order=asc`);
    return response.data;
  },

  // 일반 알림
  getNotifications: async (userId) => {
    const response = await api.get(`/notifications?userId=${userId}&_sort=createdAt&_order=desc`);
    return response.data;
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId, type = 'notificationCenter') => {
    const response = await api.patch(`/${type}/${notificationId}`, { read: true });
    return response.data;
  },

  // 새 AI 인사이트 생성 (시뮬레이션)
  generateInsight: async (userId) => {
    const insightTypes = [
      {
        type: 'opportunity',
        category: 'savings',
        title: '절약 기회 발견!',
        description: '지난 주 커피 지출이 평균보다 30% 높습니다. 집에서 커피를 마시면 월 45,000원 절약 가능',
        potentialSaving: 45000,
        action: '커피 지출 분석보기',
        priority: 'medium',
      },
      {
        type: 'warning',
        category: 'budget',
        title: '예산 초과 위험',
        description: '식비가 예산의 85%에 도달했습니다. 남은 기간 동안 지출을 줄이는 것이 좋겠습니다.',
        action: '예산 조정하기',
        priority: 'high',
      },
    ];

    const insight = insightTypes[Math.floor(Math.random() * insightTypes.length)];
    const newInsight = {
      ...insight,
      userId,
      id: Date.now(),
    };

    await api.post('/aiInsights', newInsight);
    return newInsight;
  },
};

// ============================================
// 문서 관리 API
// ============================================
export const documentsAPI = {
  // 문서 공간 정보
  getDocumentSpace: async (userId) => {
    const response = await api.get(`/documentSpace?userId=${userId}`);
    return response.data;
  },

  // PDF 리포트 생성 (시뮬레이션)
  generatePDFReport: async (userId, reportType) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 생성 시간 시뮬레이션

    return {
      success: true,
      message: 'PDF 리포트가 생성되었습니다!',
      contents: [
        '월간 지출 분석',
        '세금 예측 리포트',
        '공제 항목 상세',
        'Tax Health Score',
        '증빙 서류 목록',
      ],
      downloadUrl: '#', // 실제로는 다운로드 URL
    };
  },
};

// ============================================
// 커뮤니티 API
// ============================================
export const communityAPI = {
  // 커뮤니티 글 목록
  getPosts: async () => {
    const response = await api.get('/communityPosts?_sort=createdAt&_order=desc');
    return response.data;
  },

  // 글 작성
  createPost: async (postData) => {
    const post = {
      ...postData,
      answers: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const response = await api.post('/communityPosts', post);
    return response.data;
  },

  // 좋아요
  likePost: async (postId) => {
    const post = await api.get(`/communityPosts/${postId}`);
    const response = await api.patch(`/communityPosts/${postId}`, { likes: post.data.likes + 1 });
    return response.data;
  },

  // 세무 전문가 목록
  getTaxExperts: async () => {
    const response = await api.get('/taxExperts');
    return response.data;
  },

  // 금융 상품 추천
  getFinancialProducts: async () => {
    const response = await api.get('/financialProducts?_sort=matchScore&_order=desc');
    return response.data;
  },
};

export default api;
