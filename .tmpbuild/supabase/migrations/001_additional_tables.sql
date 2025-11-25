-- =============================================
-- 추가 테이블 마이그레이션
-- 하드코딩된 데이터를 DB로 이전하기 위한 테이블들
-- =============================================

-- 1. 리워드 상품 목록
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  icon TEXT,
  category TEXT CHECK (category IN ('coffee', 'voucher', 'beauty', 'digital', 'premium')),
  stock TEXT DEFAULT 'unlimited' CHECK (stock IN ('unlimited', 'limited', 'out_of_stock')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 미션 템플릿
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  reward INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 사용자별 미션 진행상황
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  period_start DATE NOT NULL, -- 미션 시작일 (일일: 해당 날짜, 주간: 주 시작일)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id, period_start)
);

-- 4. 이벤트
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  end_date TEXT, -- '2025-12-31' 또는 '상시'
  reward TEXT,
  type TEXT CHECK (type IN ('attendance', 'competition', 'referral', 'promotion')),
  target INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 사용자별 이벤트 진행상황
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 6. 이용 가능한 은행/카드사 목록
CREATE TABLE IF NOT EXISTS available_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT CHECK (type IN ('bank', 'card')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 문서 공간 (카테고리별 문서 수 추적)
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  folder_type TEXT NOT NULL CHECK (folder_type IN ('yearEnd', 'comprehensiveTax', 'vat')),
  folder_name TEXT NOT NULL,
  document_count INTEGER DEFAULT 0,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, folder_type, folder_name)
);

-- 8. 커뮤니티 게시물
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '익명',
  title TEXT NOT NULL,
  content TEXT,
  answers_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 세금 전문가
CREATE TABLE IF NOT EXISTS tax_experts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  specialties TEXT[],
  price INTEGER NOT NULL,
  experience_years INTEGER,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 금융 상품
CREATE TABLE IF NOT EXISTS financial_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('card', 'loan', 'insurance', 'savings')),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  benefit TEXT,
  match_score INTEGER DEFAULT 0,
  icon TEXT,
  expected_savings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 알림 센터 (notifications과 별도로 더 상세한 알림)
CREATE TABLE IF NOT EXISTS notification_center (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai_insight', 'document', 'deadline', 'achievement', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  timestamp_text TEXT, -- '방금 전', '10분 전' 등
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS 정책 추가
-- =============================================

-- Rewards: 모든 사용자 조회 가능
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rewards" ON rewards FOR SELECT USING (true);

-- Missions: 모든 사용자 조회 가능
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view missions" ON missions FOR SELECT USING (true);

-- User Missions
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own missions" ON user_missions FOR ALL USING (auth.uid() = user_id);

-- Events: 모든 사용자 조회 가능
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);

-- User Events
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own events" ON user_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own events" ON user_events FOR ALL USING (auth.uid() = user_id);

-- Available Banks: 모든 사용자 조회 가능
ALTER TABLE available_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view banks" ON available_banks FOR SELECT USING (true);

-- Document Folders
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own folders" ON document_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own folders" ON document_folders FOR ALL USING (auth.uid() = user_id);

-- Community Posts: 모든 사용자 조회 가능, 본인만 수정/삭제
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Tax Experts: 모든 사용자 조회 가능
ALTER TABLE tax_experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view experts" ON tax_experts FOR SELECT USING (true);

-- Financial Products: 모든 사용자 조회 가능
ALTER TABLE financial_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON financial_products FOR SELECT USING (true);

-- Notification Center
ALTER TABLE notification_center ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notification_center FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON notification_center FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 포인트 추가 함수
-- =============================================

CREATE OR REPLACE FUNCTION add_points(p_user_id UUID, p_points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = points + p_points,
      current_exp = current_exp + p_points,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
