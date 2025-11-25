import { supabase } from '../lib/supabase';
import taxCalculator from './taxCalculator';

// ============================================
// 인증 API
// ============================================
export const authAPI = {
  // 이메일/비밀번호 회원가입
  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return data;
  },

  // 이메일/비밀번호 로그인
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // 카카오 로그인
  signInWithKakao: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 현재 사용자
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 세션 가져오기
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // 프로필 가져오기
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // 프로필 업데이트
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// 영수증 API
// ============================================
export const receiptsAPI = {
  // 영수증 목록
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // 영수증 추가
  create: async (receiptData) => {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        user_id: receiptData.userId,
        date: receiptData.date,
        merchant: receiptData.merchant,
        category: receiptData.category,
        amount: receiptData.amount,
        tax: Math.floor(receiptData.amount * 0.1),
        type: receiptData.type || 'manual',
        ocr_confidence: receiptData.ocrConfidence,
        memo: receiptData.memo
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 영수증 수정
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('receipts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 영수증 삭제
  delete: async (id) => {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // 월별 통계
  getMonthlyStats: async (userId, yearMonth) => {
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-31`;

    const { data, error } = await supabase
      .from('receipts')
      .select('category, amount, tax')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      totalSpent: 0,
      totalTax: 0,
      byCategory: {}
    };

    data.forEach(r => {
      stats.totalSpent += r.amount;
      stats.totalTax += r.tax;
      stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + r.amount;
    });

    return stats;
  }
};

// ============================================
// 예산 API
// ============================================
export const budgetsAPI = {
  // 예산 목록
  getAll: async (userId, month) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month);
    if (error) throw error;
    return data;
  },

  // 예산 설정 (upsert)
  setBudget: async (userId, category, amount, month) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id: userId,
        category,
        amount,
        month
      }, {
        onConflict: 'user_id,category,month'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 여러 예산 한번에 설정
  setBudgets: async (userId, budgets, month) => {
    const budgetData = Object.entries(budgets).map(([category, amount]) => ({
      user_id: userId,
      category,
      amount,
      month
    }));

    const { data, error } = await supabase
      .from('budgets')
      .upsert(budgetData, {
        onConflict: 'user_id,category,month'
      })
      .select();
    if (error) throw error;
    return data;
  },

  // 월별 지출 추이 데이터 (최근 6개월)
  getMonthlySpendingTrend: async (userId) => {
    const now = new Date();
    const months = [];

    // 최근 6개월 목록 생성
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${d.getMonth() + 1}월`
      });
    }

    // 6개월치 데이터 범위
    const startDate = `${months[0].yearMonth}-01`;
    const endDate = `${months[5].yearMonth}-31`;

    // 지출 데이터 (receipts)
    const { data: receiptsData, error: receiptsError } = await supabase
      .from('receipts')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (receiptsError) throw receiptsError;

    // 예산 데이터 (budgets)
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('month, amount')
      .eq('user_id', userId)
      .in('month', months.map(m => m.yearMonth));

    if (budgetsError) throw budgetsError;

    // 월별 집계
    const result = months.map(m => {
      // 해당 월 지출 합계
      const monthSpending = receiptsData
        ?.filter(r => r.date.startsWith(m.yearMonth))
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // 해당 월 예산 합계
      const monthBudget = budgetsData
        ?.filter(b => b.month === m.yearMonth)
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

      return {
        month: m.label,
        지출: monthSpending,
        예산: monthBudget
      };
    });

    return result;
  }
};

// ============================================
// 계좌 연동 API
// ============================================
export const accountsAPI = {
  // 연결된 계좌 목록
  getLinkedAccounts: async (userId) => {
    const { data, error } = await supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw error;
    return data;
  },

  // 계좌 연결
  linkAccount: async (accountData) => {
    const { data, error } = await supabase
      .from('linked_accounts')
      .insert({
        user_id: accountData.userId,
        type: accountData.type,
        bank: accountData.bank,
        name: accountData.name,
        last_digits: accountData.lastDigits,
        color: accountData.color,
        icon: accountData.icon
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 계좌 연결 해제
  unlinkAccount: async (id) => {
    const { error } = await supabase
      .from('linked_accounts')
      .update({ status: 'inactive' })
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ============================================
// 챌린지 API
// ============================================
export const challengesAPI = {
  // 모든 챌린지 목록
  getAll: async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // 사용자 챌린지 진행상황
  getUserChallenges: async (userId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // 챌린지 참여
  joinChallenge: async (userId, challengeId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        status: 'active'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 진행상황 업데이트
  updateProgress: async (userId, challengeId, progress) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({ progress })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 챌린지 완료
  completeChallenge: async (userId, challengeId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ============================================
// 공제 추적 API
// ============================================
export const deductionAPI = {
  // 공제 항목 목록
  getAll: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('deduction_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year);
    if (error) throw error;
    return data;
  },

  // 공제 항목 업데이트
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('deduction_tracker')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 공제 항목 초기화 (새 연도)
  initializeDeductions: async (userId, year) => {
    const defaultDeductions = [
      { category: 'medical', name: '의료비', max_deduction: 7000000, deduction_rate: 0.15, threshold: 1000000 },
      { category: 'education', name: '교육비', max_deduction: 3000000, deduction_rate: 0.15, threshold: 0 },
      { category: 'housing', name: '월세', max_deduction: 7500000, deduction_rate: 0.12, threshold: 0 },
      { category: 'donation', name: '기부금', max_deduction: 10000000, deduction_rate: 0.15, threshold: 0 },
      { category: 'pension', name: '연금저축', max_deduction: 4000000, deduction_rate: 0.15, threshold: 0 }
    ];

    const deductionData = defaultDeductions.map(d => ({
      user_id: userId,
      year,
      ...d
    }));

    const { data, error } = await supabase
      .from('deduction_tracker')
      .upsert(deductionData, {
        onConflict: 'user_id,category,year'
      })
      .select();
    if (error) throw error;
    return data;
  }
};

// ============================================
// AI 인사이트 API
// ============================================
export const insightsAPI = {
  // 인사이트 목록
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // 인사이트 읽음 처리
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // 인사이트 생성 (서버에서 호출)
  create: async (insightData) => {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insightData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // OpenAI로 새 인사이트 생성 (Edge Function 호출)
  generateWithAI: async (userId) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\s/g, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/\s/g, '');

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-ai-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 인사이트 생성 실패: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'AI 인사이트 생성 실패');
    }

    return result.insights;
  }
};

// ============================================
// 알림 API
// ============================================
export const notificationsAPI = {
  // 알림 목록
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  // 알림 읽음 처리
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // 모든 알림 읽음
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
};

// ============================================
// 출석 API
// ============================================
export const attendanceAPI = {
  // 출석 체크
  checkIn: async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    // 이미 출석했는지 확인
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      return { success: false, message: '이미 출석체크했습니다.' };
    }

    // 출석 기록
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        date: today,
        points_earned: 50
      })
      .select()
      .single();

    if (error) throw error;

    // 포인트 추가
    await supabase.rpc('add_points', { user_id: userId, points: 50 });

    return { success: true, points: 50, data };
  },

  // 출석 기록 조회
  getHistory: async (userId, days = 7) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(days);
    if (error) throw error;
    return data;
  }
};

// ============================================
// 리워드 API
// ============================================
export const rewardsAPI = {
  // 리워드 교환 (DB 함수로 원자성 보장)
  exchange: async (userId, rewardName, points) => {
    // RPC로 포인트 확인 + 차감 + 기록 추가를 한 번에 처리
    const { data, error } = await supabase.rpc('exchange_reward', {
      p_user_id: userId,
      p_reward_name: rewardName,
      p_points: points
    });

    if (error) {
      if (error.message.includes('insufficient')) {
        throw new Error('포인트가 부족합니다.');
      }
      throw error;
    }

    return data;
  },

  // 교환 내역
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('reward_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ============================================
// 세금 데이터 API
// ============================================
export const taxAPI = {
  // 개인 세금 데이터
  getIndividualTax: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('individual_tax_data')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true });
    if (error) throw error;
    return data;
  },

  // 사업자 세금 데이터
  getBusinessTax: async (userId, year = new Date().getFullYear()) => {
    const { data, error } = await supabase
      .from('business_tax_data')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true });
    if (error) throw error;
    return data;
  },

  // 세금 데이터 업데이트
  updateIndividualTax: async (userId, year, month, data) => {
    const { data: result, error } = await supabase
      .from('individual_tax_data')
      .upsert({
        user_id: userId,
        year,
        month,
        ...data
      }, {
        onConflict: 'user_id,year,month'
      })
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  // Tax Health Score 계산
  calculateTaxHealthScore: async (userId) => {
    const deductions = await deductionAPI.getAll(userId);

    let score = 100;

    if (deductions.length > 0) {
      const deductionUsage = deductions.reduce((sum, item) => {
        const current = item.current_amount || 0;
        const max = item.max_deduction || 1; // 0으로 나누기 방지
        return sum + (max > 0 ? current / max : 0);
      }, 0) / deductions.length;
      score -= (1 - deductionUsage) * 20;

      const totalDocs = deductions.reduce((sum, item) => sum + (item.documents_count || 0), 0);
      if (totalDocs < 30) score -= 10;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  },

  // ============================================
  // 세금 계산기 함수들 (taxCalculator 연동)
  // ============================================

  // 개인 연말정산 계산
  calculateIndividualTax: (params) => {
    return taxCalculator.calculateIndividualTax(params);
  },

  // 사업자 종합소득세 계산
  calculateBusinessTax: (params) => {
    return taxCalculator.calculateBusinessTax(params);
  },

  // 부가가치세 계산
  calculateVAT: (params) => {
    return taxCalculator.calculateVAT(params);
  },

  // 월별 세금 예측
  predictMonthlyTax: (params) => {
    return taxCalculator.predictMonthlyTax(params);
  },

  // 예상 절감액 계산
  calculatePotentialSavings: (params) => {
    return taxCalculator.calculatePotentialSavings(params);
  },

  // 공제 한도 조회
  getDeductionLimits: () => {
    return taxCalculator.getDeductionLimits();
  },

  // 의료비 공제 계산
  calculateMedicalDeduction: (totalIncome, medicalExpenses, hasInfertility) => {
    return taxCalculator.calculateMedicalDeduction(totalIncome, medicalExpenses, hasInfertility);
  },

  // 교육비 공제 계산
  calculateEducationDeduction: (educationExpenses) => {
    return taxCalculator.calculateEducationDeduction(educationExpenses);
  },

  // 기부금 공제 계산
  calculateDonationDeduction: (donations, totalIncome) => {
    return taxCalculator.calculateDonationDeduction(donations, totalIncome);
  },

  // 연금저축 공제 계산
  calculatePensionDeduction: (pensionSavings, irpAmount, totalIncome) => {
    return taxCalculator.calculatePensionDeduction(pensionSavings, irpAmount, totalIncome);
  }
};

// ============================================
// 리워드 상품 API
// ============================================
export const rewardsProductAPI = {
  // 리워드 상품 목록
  getAll: async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });
    if (error) throw error;
    return data;
  },
};

// ============================================
// 미션 API
// ============================================
export const missionsAPI = {
  // 미션 템플릿 목록
  getAll: async (type = null) => {
    let query = supabase.from('missions').select('*').eq('is_active', true);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 일일 미션
  getDailyMissions: async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('type', 'daily')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // 주간 미션
  getWeeklyMissions: async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('type', 'weekly')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // 사용자 미션 진행상황
  getUserMissions: async (userId, type = null) => {
    let query = supabase
      .from('user_missions')
      .select(`*, mission:missions(*)`)
      .eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    if (type && data) {
      return data.filter(um => um.mission?.type === type);
    }
    return data;
  },

  // 미션 진행상황 업데이트
  updateProgress: async (userId, missionId, progress, periodStart) => {
    const { data, error } = await supabase
      .from('user_missions')
      .upsert({
        user_id: userId,
        mission_id: missionId,
        progress,
        period_start: periodStart,
        completed: false
      }, { onConflict: 'user_id,mission_id,period_start' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// 이벤트 API
// ============================================
export const eventsAPI = {
  // 활성 이벤트 목록
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // 사용자 이벤트 진행상황
  getUserEvents: async (userId) => {
    const { data, error } = await supabase
      .from('user_events')
      .select(`*, event:events(*)`)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // 이벤트 참여
  joinEvent: async (userId, eventId) => {
    const { data, error } = await supabase
      .from('user_events')
      .insert({ user_id: userId, event_id: eventId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// 은행/카드사 API
// ============================================
export const banksAPI = {
  // 이용 가능한 은행 목록
  getAll: async () => {
    const { data, error } = await supabase
      .from('available_banks')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },
};

// ============================================
// 문서 폴더 API
// ============================================
export const documentFoldersAPI = {
  // 사용자 문서 폴더 조회
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('document_folders')
      .select('*')
      .eq('user_id', userId)
      .order('folder_type')
      .order('folder_name');
    if (error) throw error;

    // 폴더 타입별로 그룹화
    const grouped = {
      yearEnd: { name: '연말정산', count: 0, folders: [] },
      comprehensiveTax: { name: '종합소득세', count: 0, folders: [] },
      vat: { name: '부가가치세', count: 0, folders: [] },
    };

    data?.forEach(folder => {
      if (grouped[folder.folder_type]) {
        grouped[folder.folder_type].folders.push({
          name: folder.folder_name,
          count: folder.document_count,
          lastUpdated: folder.last_updated
        });
        grouped[folder.folder_type].count += folder.document_count;
      }
    });

    return grouped;
  },

  // 문서 수 업데이트
  updateCount: async (userId, folderType, folderName, count) => {
    const { data, error } = await supabase
      .from('document_folders')
      .upsert({
        user_id: userId,
        folder_type: folderType,
        folder_name: folderName,
        document_count: count,
        last_updated: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id,folder_type,folder_name' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// 커뮤니티 API
// ============================================
export const communityAPI = {
  // 게시물 목록
  getPosts: async (limit = 10) => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  // 게시물 작성
  createPost: async (userId, title, content, authorName = '익명') => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        author_name: authorName,
        title,
        content
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 좋아요
  likePost: async (postId) => {
    // RPC로 likes_count 증가 처리 (DB 함수에서 원자적 증감)
    const { data, error } = await supabase.rpc('increment_likes', { post_id: postId });
    if (error) throw error;
    return data;
  },
};

// ============================================
// 세금 전문가 API
// ============================================
export const expertsAPI = {
  // 전문가 목록
  getAll: async () => {
    const { data, error } = await supabase
      .from('tax_experts')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });
    if (error) throw error;
    return data;
  },
};

// ============================================
// 금융 상품 API
// ============================================
export const productsAPI = {
  // 금융 상품 목록
  getAll: async (type = null) => {
    let query = supabase.from('financial_products').select('*').eq('is_active', true);
    if (type) query = query.eq('type', type);
    const { data, error } = await query.order('match_score', { ascending: false });
    if (error) throw error;
    return data;
  },
};

// ============================================
// 알림 센터 API
// ============================================
export const notificationCenterAPI = {
  // 알림 목록
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('notification_center')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  // 읽음 처리
  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notification_center')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // 모두 읽음
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notification_center')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },
};

// ============================================
// 리더보드 API
// ============================================
export const leaderboardAPI = {
  // 상위 랭킹 조회
  getTopRanks: async (limit = 10) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, points, level')
      .order('points', { ascending: false })
      .limit(limit);
    if (error) throw error;

    return data?.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points,
      badge: index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐',
    }));
  },

  // 사용자 랭킹 조회
  getUserRank: async (userId) => {
    const { data: user } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('points', user.points);

    return (count || 0) + 1;
  },

  // 총 사용자 수
  getTotalUsers: async () => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
};

// ============================================
// 금융사별 더미 거래내역 API
// ============================================
export const bankDummyTransactionsAPI = {
  // 특정 금융사의 더미 거래내역 조회
  getByBank: async (bankName) => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .eq('bank_name', bankName)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 기본 더미 거래내역 조회 (매칭 안 되는 금융사용)
  getDefault: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .eq('bank_name', '기본')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 모든 금융사 목록 조회 (중복 제거)
  getBankList: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('bank_name')
      .eq('is_active', true);

    if (error) throw error;

    // 중복 제거
    const uniqueBanks = [...new Set(data.map(d => d.bank_name))];
    return uniqueBanks.filter(b => b !== '기본');
  },

  // 전체 더미 거래내역 조회 (관리용)
  getAll: async () => {
    const { data, error } = await supabase
      .from('bank_dummy_transactions')
      .select('*')
      .order('bank_name')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },
};

// ============================================
// 자동 거래 API (OCR/연동 거래)
// ============================================
export const autoTransactionsAPI = {
  // 자동 거래 목록 (type = 'auto' 또는 'ocr')
  getAll: async (userId) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .in('type', ['auto', 'ocr'])
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // 거래 매칭 처리
  matchTransaction: async (id) => {
    const { data, error } = await supabase
      .from('receipts')
      .update({ type: 'matched' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ============================================
// 게이미피케이션 통합 API
// ============================================
export const gamificationAPI = {
  getChallenges: challengesAPI.getAll,
  getUserChallenges: challengesAPI.getUserChallenges,
  getCompletedChallenges: async (userId) => {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`*, challenge:challenges(*)`)
      .eq('user_id', userId)
      .eq('status', 'completed');
    if (error) throw error;
    return data?.map(uc => ({
      id: uc.challenge_id,
      title: uc.challenge?.title,
      badge: uc.challenge?.badge,
      reward: uc.challenge?.reward,
      completedDate: uc.completed_at?.split('T')[0]
    }));
  },
  getDailyMissions: missionsAPI.getDailyMissions,
  getWeeklyMissions: missionsAPI.getWeeklyMissions,
  getLeaderboard: leaderboardAPI.getTopRanks,
  getRewards: rewardsProductAPI.getAll,
  getEvents: eventsAPI.getAll,
};

export default {
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
};
