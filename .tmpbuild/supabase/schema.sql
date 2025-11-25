-- =============================================
-- FINA_R Database Schema for Supabase
-- =============================================

-- 1. 사용자 프로필 (auth.users와 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  level INTEGER DEFAULT 1,
  current_exp INTEGER DEFAULT 0,
  exp_to_next_level INTEGER DEFAULT 500,
  badges TEXT[] DEFAULT '{}',
  points INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 10000,
  streak INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  tax_health_score INTEGER DEFAULT 50,
  is_premium BOOLEAN DEFAULT FALSE,
  user_type TEXT DEFAULT 'individual' CHECK (user_type IN ('individual', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 영수증/거래내역
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  tax INTEGER DEFAULT 0,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'ocr', 'auto')),
  ocr_confidence DECIMAL(3,2),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 연결된 계좌
CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'account')),
  bank TEXT NOT NULL,
  name TEXT NOT NULL,
  last_digits TEXT,
  color TEXT,
  icon TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  monthly_spent INTEGER DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  linked_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 예산
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL, -- '2025-11' 형식
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, month)
);

-- 5. 챌린지
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  reward INTEGER NOT NULL,
  badge TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  days_left INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 사용자별 챌린지 진행상황
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- 7. 공제 항목 추적
CREATE TABLE IF NOT EXISTS deduction_tracker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'medical', 'education', 'housing', 'donation', 'pension'
  name TEXT NOT NULL,
  current_amount INTEGER DEFAULT 0,
  threshold INTEGER DEFAULT 0,
  max_deduction INTEGER NOT NULL,
  deduction_rate DECIMAL(3,2) NOT NULL,
  potential_saving INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, year)
);

-- 8. AI 인사이트
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('critical', 'opportunity', 'warning', 'achievement')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  potential_saving INTEGER DEFAULT 0,
  current_amount INTEGER,
  threshold INTEGER,
  action TEXT,
  deadline DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 알림
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  icon TEXT,
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 출석 기록
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 11. 리워드 교환 내역
CREATE TABLE IF NOT EXISTS reward_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_name TEXT NOT NULL,
  points_used INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 세금 데이터 (개인)
CREATE TABLE IF NOT EXISTS individual_tax_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  actual_tax INTEGER DEFAULT 0,
  predicted_tax INTEGER DEFAULT 0,
  expense INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- 13. 세금 데이터 (사업자)
CREATE TABLE IF NOT EXISTS business_tax_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  actual_tax INTEGER DEFAULT 0,
  predicted_tax INTEGER DEFAULT 0,
  income INTEGER DEFAULT 0,
  expense INTEGER DEFAULT 0,
  vat INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- =============================================
-- Row Level Security (RLS) 정책
-- =============================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tax_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_tax_data ENABLE ROW LEVEL SECURITY;

-- Profiles: 본인 데이터만 접근
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Receipts: 본인 영수증만 접근
CREATE POLICY "Users can view own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON receipts FOR DELETE USING (auth.uid() = user_id);

-- Linked Accounts
CREATE POLICY "Users can view own accounts" ON linked_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own accounts" ON linked_accounts FOR ALL USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- User Challenges
CREATE POLICY "Users can view own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON user_challenges FOR ALL USING (auth.uid() = user_id);

-- Deduction Tracker
CREATE POLICY "Users can view own deductions" ON deduction_tracker FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deductions" ON deduction_tracker FOR ALL USING (auth.uid() = user_id);

-- AI Insights
CREATE POLICY "Users can view own insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own insights" ON ai_insights FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Attendance
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reward History
CREATE POLICY "Users can view own rewards" ON reward_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON reward_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tax Data
CREATE POLICY "Users can view own individual tax" ON individual_tax_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own individual tax" ON individual_tax_data FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own business tax" ON business_tax_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own business tax" ON business_tax_data FOR ALL USING (auth.uid() = user_id);

-- Challenges는 모든 사용자가 볼 수 있음 (공통 챌린지)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON challenges FOR SELECT USING (true);

-- =============================================
-- 트리거: 프로필 자동 생성
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 기본 챌린지 데이터 삽입
-- =============================================

INSERT INTO challenges (title, description, target, reward, badge, difficulty, days_left) VALUES
  ('식비 20% 절감', '이번 달 식비를 지난 달 대비 20% 줄이기', 100, 200, '🍽️', 'medium', 30),
  ('영수증 30개 등록', '한 달 동안 영수증 30개 이상 등록하기', 30, 150, '📝', 'easy', 30),
  ('예산 준수 완벽왕', '모든 카테고리에서 예산을 초과하지 않기', 100, 300, '🎯', 'hard', 30),
  ('7일 연속 출석', '일주일 동안 매일 출석체크하기', 7, 100, '🔥', 'easy', 7)
ON CONFLICT DO NOTHING;

-- 완료 메시지
SELECT 'FINA_R 데이터베이스 스키마 생성 완료!' as message;
