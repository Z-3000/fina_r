-- =============================================
-- FINA_R 마스터 데이터 테이블 마이그레이션
-- 하드코딩 데이터 → DB 이관
-- 작성일: 2025-11-24
-- =============================================

-- =============================================
-- 1. 세금 설정 테이블 (tax_settings)
-- 소득세율표, 공제한도, 기본공제 등 세금 관련 상수
--
-- [출처 및 근거]
-- - 국세청 (https://www.nts.go.kr)
-- - 소득세법 제55조 (세율)
-- - 소득세법 제50조~제52조 (인적공제)
-- - 조세특례제한법 (연금저축, IRP 공제)
-- - 적용연도: 2024년 (2025년 귀속분부터 변경 시 업데이트 필요)
-- =============================================
CREATE TABLE IF NOT EXISTS tax_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_type TEXT NOT NULL, -- 'income_bracket', 'earned_income_deduction', 'basic_deduction', 'special_deduction_limit', 'vat'
  setting_key TEXT NOT NULL,  -- 구분자 (예: 'bracket_1', 'medical_limit')
  setting_value JSONB NOT NULL, -- 실제 값 (JSON 형태)
  effective_year INTEGER NOT NULL, -- 적용 연도
  source_name TEXT, -- 출처명
  source_url TEXT,  -- 출처 URL
  source_article TEXT, -- 근거 조항
  description TEXT, -- 설명
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(setting_type, setting_key, effective_year)
);

-- =============================================
-- 2. 혜택 마스터 테이블 (benefits_master)
-- 세금공제, 주거, 사업자, 지원금, 금융 관련 혜택 정보
-- =============================================
CREATE TABLE IF NOT EXISTS benefits_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('tax', 'housing', 'business', 'support', 'financial')),
  title TEXT NOT NULL,
  amount TEXT, -- '최대 300만원' 형식
  amount_value INTEGER, -- 실제 금액 (정렬/필터용)
  provider TEXT, -- '국세청', '고용노동부' 등
  description TEXT,
  eligibility TEXT, -- 자격 조건
  eligibility_type TEXT[], -- ['individual', 'business', 'youth', 'low_income'] 등
  deadline TEXT, -- '연말정산 시 자동', '매년 5월' 등
  application_url TEXT, -- 신청 URL
  source_name TEXT, -- 출처명
  source_url TEXT,  -- 출처 URL
  priority INTEGER DEFAULT 100, -- 표시 우선순위 (낮을수록 먼저)
  is_active BOOLEAN DEFAULT TRUE,
  effective_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 공제 항목 마스터 테이블 (deduction_items_master)
-- 연말정산 시 확인해야 할 공제 항목 체크리스트
-- =============================================
CREATE TABLE IF NOT EXISTS deduction_items_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'card', 'medical', 'education', 'housing', 'pension', 'donation', 'insurance'
  user_type TEXT[] DEFAULT ARRAY['individual'], -- ['individual', 'business']
  max_deduction INTEGER, -- 최대 공제 한도
  deduction_rate DECIMAL(5,4), -- 공제율 (0.15 = 15%)
  threshold INTEGER DEFAULT 0, -- 기준금액 (예: 의료비 총급여 3% 초과분)
  threshold_type TEXT, -- 'fixed', 'income_rate' (총급여의 비율)
  tips TEXT, -- 절세 팁
  description TEXT, -- 상세 설명
  source_name TEXT, -- 출처명
  source_url TEXT,  -- 출처 URL
  source_article TEXT, -- 근거 조항
  priority INTEGER DEFAULT 100, -- 표시 우선순위
  is_active BOOLEAN DEFAULT TRUE,
  effective_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. 사용자 세금 기본정보 확장 (profiles 테이블)
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_income INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dependents INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_spouse BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expected_revenue INTEGER DEFAULT 0; -- 사업자용 예상 연매출
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expected_expenses INTEGER DEFAULT 0; -- 사업자용 예상 경비
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_simplified_tax BOOLEAN DEFAULT FALSE; -- 간이과세자 여부

-- =============================================
-- RLS 정책
-- =============================================
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_items_master ENABLE ROW LEVEL SECURITY;

-- 마스터 테이블은 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Authenticated users can view tax_settings"
  ON tax_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view benefits_master"
  ON benefits_master FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view deduction_items_master"
  ON deduction_items_master FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tax_settings_type_year ON tax_settings(setting_type, effective_year);
CREATE INDEX IF NOT EXISTS idx_benefits_category ON benefits_master(category, is_active);
CREATE INDEX IF NOT EXISTS idx_deduction_items_category ON deduction_items_master(category, is_active);

-- =============================================
-- 초기 데이터 삽입: 소득세율표 (2024년 기준)
-- [출처] 국세청, 소득세법 제55조
-- [URL] https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&cntntsId=7667
-- =============================================
INSERT INTO tax_settings (setting_type, setting_key, setting_value, effective_year, source_name, source_url, source_article, description) VALUES
  ('income_bracket', 'bracket_1', '{"min": 0, "max": 14000000, "rate": 0.06, "deduction": 0}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '1,400만원 이하 6%'),
  ('income_bracket', 'bracket_2', '{"min": 14000000, "max": 50000000, "rate": 0.15, "deduction": 1260000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '1,400만원 초과~5,000만원 이하 15%'),
  ('income_bracket', 'bracket_3', '{"min": 50000000, "max": 88000000, "rate": 0.24, "deduction": 5760000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '5,000만원 초과~8,800만원 이하 24%'),
  ('income_bracket', 'bracket_4', '{"min": 88000000, "max": 150000000, "rate": 0.35, "deduction": 15440000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '8,800만원 초과~1.5억원 이하 35%'),
  ('income_bracket', 'bracket_5', '{"min": 150000000, "max": 300000000, "rate": 0.38, "deduction": 19940000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '1.5억원 초과~3억원 이하 38%'),
  ('income_bracket', 'bracket_6', '{"min": 300000000, "max": 500000000, "rate": 0.40, "deduction": 25940000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '3억원 초과~5억원 이하 40%'),
  ('income_bracket', 'bracket_7', '{"min": 500000000, "max": 1000000000, "rate": 0.42, "deduction": 35940000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '5억원 초과~10억원 이하 42%'),
  ('income_bracket', 'bracket_8', '{"min": 1000000000, "max": null, "rate": 0.45, "deduction": 65940000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제55조', '10억원 초과 45%')
ON CONFLICT (setting_type, setting_key, effective_year) DO NOTHING;

-- =============================================
-- 초기 데이터 삽입: 근로소득공제율
-- [출처] 국세청, 소득세법 제47조
-- =============================================
INSERT INTO tax_settings (setting_type, setting_key, setting_value, effective_year, source_name, source_url, source_article, description) VALUES
  ('earned_income_deduction', 'bracket_1', '{"min": 0, "max": 5000000, "rate": 0.70, "base": 0}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제47조', '500만원 이하 70%'),
  ('earned_income_deduction', 'bracket_2', '{"min": 5000000, "max": 15000000, "rate": 0.40, "base": 3500000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제47조', '500만원 초과~1,500만원 이하 40%'),
  ('earned_income_deduction', 'bracket_3', '{"min": 15000000, "max": 45000000, "rate": 0.15, "base": 7500000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제47조', '1,500만원 초과~4,500만원 이하 15%'),
  ('earned_income_deduction', 'bracket_4', '{"min": 45000000, "max": 100000000, "rate": 0.05, "base": 12000000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제47조', '4,500만원 초과~1억원 이하 5%'),
  ('earned_income_deduction', 'bracket_5', '{"min": 100000000, "max": null, "rate": 0.02, "base": 14750000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제47조', '1억원 초과 2%')
ON CONFLICT (setting_type, setting_key, effective_year) DO NOTHING;

-- =============================================
-- 초기 데이터 삽입: 기본공제
-- [출처] 국세청, 소득세법 제50조
-- =============================================
INSERT INTO tax_settings (setting_type, setting_key, setting_value, effective_year, source_name, source_url, source_article, description) VALUES
  ('basic_deduction', 'personal', '{"amount": 1500000, "type": "fixed"}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제50조', '본인 기본공제 150만원'),
  ('basic_deduction', 'spouse', '{"amount": 1500000, "type": "fixed"}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제50조', '배우자 공제 150만원'),
  ('basic_deduction', 'dependent', '{"amount": 1500000, "type": "per_person"}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제50조', '부양가족 1인당 150만원')
ON CONFLICT (setting_type, setting_key, effective_year) DO NOTHING;

-- =============================================
-- 초기 데이터 삽입: 특별공제 한도
-- [출처] 국세청, 소득세법 제52조, 조세특례제한법 제86조의2
-- =============================================
INSERT INTO tax_settings (setting_type, setting_key, setting_value, effective_year, source_name, source_url, source_article, description) VALUES
  -- 의료비
  ('special_deduction_limit', 'medical', '{"threshold_rate": 0.03, "deduction_rate": 0.15, "max_rate": 0.20, "limit": 7000000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '의료비: 총급여 3% 초과분, 15% 공제, 한도 700만원'),
  -- 교육비
  ('special_deduction_limit', 'education_preschool', '{"limit": 3000000, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '유아 교육비 한도 300만원'),
  ('special_deduction_limit', 'education_elementary', '{"limit": 3000000, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '초중고 교육비 한도 300만원'),
  ('special_deduction_limit', 'education_university', '{"limit": 9000000, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '대학 교육비 한도 900만원'),
  ('special_deduction_limit', 'education_self', '{"limit": null, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '본인 교육비 한도 없음'),
  -- 주택자금
  ('special_deduction_limit', 'housing_rent', '{"limit": 7500000, "deduction_rate": 0.12}', 2024, '국세청', 'https://www.nts.go.kr', '조세특례제한법 제95조의2', '월세 세액공제 한도 750만원, 12%'),
  ('special_deduction_limit', 'housing_mortgage_15y', '{"limit": 3000000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '주택담보대출 이자 (15년 미만)'),
  ('special_deduction_limit', 'housing_mortgage_30y', '{"limit": 18000000}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제52조', '주택담보대출 이자 (15-30년)'),
  -- 연금저축/IRP
  ('special_deduction_limit', 'pension_savings', '{"limit": 4000000, "deduction_rate_low": 0.165, "deduction_rate_high": 0.132, "income_threshold": 55000000}', 2024, '국세청', 'https://www.nts.go.kr', '조세특례제한법 제86조의2', '연금저축 한도 400만원 (총급여 5,500만원 이하 16.5%, 초과 13.2%)'),
  ('special_deduction_limit', 'irp_total', '{"limit": 7000000}', 2024, '국세청', 'https://www.nts.go.kr', '조세특례제한법 제86조의2', '연금저축+IRP 합산 한도 700만원'),
  -- 기부금
  ('special_deduction_limit', 'donation_legal', '{"limit_rate": 1.00, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제34조', '법정기부금 소득의 100%'),
  ('special_deduction_limit', 'donation_designated', '{"limit_rate": 0.30, "deduction_rate": 0.15}', 2024, '국세청', 'https://www.nts.go.kr', '소득세법 제34조', '지정기부금 소득의 30%'),
  -- 부가세
  ('vat', 'rate', '{"rate": 0.10}', 2024, '국세청', 'https://www.nts.go.kr', '부가가치세법 제30조', '부가가치세율 10%'),
  ('vat', 'simplified_threshold', '{"threshold": 80000000}', 2024, '국세청', 'https://www.nts.go.kr', '부가가치세법 제61조', '간이과세 기준 8,000만원')
ON CONFLICT (setting_type, setting_key, effective_year) DO NOTHING;

-- =============================================
-- 초기 데이터 삽입: 혜택 마스터 (benefits_master)
-- =============================================
INSERT INTO benefits_master (category, title, amount, amount_value, provider, description, eligibility, eligibility_type, deadline, source_name, source_url, priority) VALUES
  -- 세금공제 (tax)
  ('tax', '신용카드 소득공제', '최대 300만원', 3000000, '국세청', '총급여 25% 초과분의 15~30% 공제', '근로소득자', ARRAY['individual'], '연말정산 시 자동', '국세청', 'https://www.nts.go.kr', 10),
  ('tax', '월세 세액공제', '최대 750만원', 7500000, '국세청', '총급여 7천만원 이하 무주택 세대주 월세의 12~17% 공제', '총급여 7천만원 이하 무주택 세대주', ARRAY['individual'], '연말정산 시', '국세청', 'https://www.nts.go.kr', 20),
  ('tax', '연금저축 세액공제', '최대 66만원', 660000, '국세청', '연금저축 납입액의 최대 16.5% 공제 (총급여 5,500만원 이하)', '근로소득자, 종합소득자', ARRAY['individual', 'business'], '연말정산 시', '국세청', 'https://www.nts.go.kr', 30),

  -- 주거 (housing)
  ('housing', '청년전세자금대출', '최대 2억원', 200000000, '주택도시기금', '연 1.5~2.1% 저금리 전세자금', '만 19~34세 무주택자', ARRAY['individual', 'youth'], '상시', '주택도시기금', 'https://nhuf.molit.go.kr', 40),
  ('housing', '청약저축 소득공제', '최대 240만원 (96만원 공제)', 2400000, '국세청', '청약저축 납입액의 40% 소득공제', '총급여 7천만원 이하 무주택 세대주', ARRAY['individual'], '연말정산 시', '국세청', 'https://www.nts.go.kr', 50),

  -- 사업자 (business)
  ('business', '노란우산공제', '최대 500만원 공제', 5000000, '중소기업중앙회', '소기업·소상공인 퇴직금 제도, 납입액 소득공제', '소기업·소상공인 대표자', ARRAY['business'], '상시', '노란우산', 'https://www.8899.or.kr', 60),
  ('business', '간이과세 부가세 면제', '부가세 면제', 0, '국세청', '연매출 4,800만원 미만 간이과세자 부가세 납부 면제', '연매출 4,800만원 미만 사업자', ARRAY['business'], '상시', '국세청', 'https://www.nts.go.kr', 70),

  -- 지원금 (support)
  ('support', '근로장려금', '최대 330만원', 3300000, '국세청', '저소득 근로자 소득지원', '단독가구 연소득 2,200만원 이하', ARRAY['individual', 'low_income'], '매년 5월, 9월', '국세청', 'https://www.nts.go.kr', 80),
  ('support', '자녀장려금', '자녀 1인당 최대 80만원', 800000, '국세청', '저소득 가구 자녀 양육 지원', '홑벌이 연소득 4,000만원 이하', ARRAY['individual', 'low_income'], '매년 5월, 9월', '국세청', 'https://www.nts.go.kr', 90),

  -- 금융 (financial)
  ('financial', 'ISA계좌 비과세', '최대 200~400만원 비과세', 4000000, '금융위원회', '개인종합자산관리계좌 비과세 혜택', '19세 이상 거주자', ARRAY['individual', 'business'], '상시', '금융위원회', 'https://www.fsc.go.kr', 100)
ON CONFLICT DO NOTHING;

-- =============================================
-- 초기 데이터 삽입: 공제 항목 마스터 (deduction_items_master)
-- =============================================
INSERT INTO deduction_items_master (title, category, user_type, max_deduction, deduction_rate, threshold, threshold_type, tips, source_name, source_url, source_article, priority) VALUES
  ('신용카드 소득공제', 'card', ARRAY['individual'], 3000000, 0.15, NULL, 'income_rate', '총급여 25% 초과분부터 공제! 초과분은 체크카드(30%)가 유리', '국세청', 'https://www.nts.go.kr', '조세특례제한법 제126조의2', 10),
  ('의료비 세액공제', 'medical', ARRAY['individual'], 7000000, 0.15, 0.03, 'income_rate', '총급여의 3% 초과분부터 공제. 난임시술비는 20% 공제', '국세청', 'https://www.nts.go.kr', '소득세법 제59조의4', 20),
  ('교육비 세액공제', 'education', ARRAY['individual'], 9000000, 0.15, 0, 'fixed', '본인 교육비는 한도 없음! 대학원, 직업능력개발 포함', '국세청', 'https://www.nts.go.kr', '소득세법 제59조의4', 30),
  ('주택자금 공제', 'housing', ARRAY['individual'], 18000000, NULL, 0, 'fixed', '장기주택저당차입금 이자상환액 공제. 대출기간/상환방식에 따라 한도 다름', '국세청', 'https://www.nts.go.kr', '소득세법 제52조', 40),
  ('연금저축 세액공제', 'pension', ARRAY['individual', 'business'], 4000000, 0.165, 0, 'fixed', '총급여 5,500만원 이하 16.5%, 초과 13.2%. IRP 추가 시 700만원까지!', '국세청', 'https://www.nts.go.kr', '조세특례제한법 제86조의2', 50),
  ('기부금 세액공제', 'donation', ARRAY['individual', 'business'], NULL, 0.15, 0, 'fixed', '1천만원 이하 15%, 초과분 30%. 정치자금 10만원까지 전액 공제', '국세청', 'https://www.nts.go.kr', '소득세법 제34조', 60),
  ('월세 세액공제', 'housing', ARRAY['individual'], 7500000, 0.12, 0, 'fixed', '총급여 7천만원 이하 12%, 5,500만원 이하 17%. 계약서와 이체내역 필수!', '국세청', 'https://www.nts.go.kr', '조세특례제한법 제95조의2', 70),
  ('보험료 세액공제', 'insurance', ARRAY['individual'], 1000000, 0.12, 0, 'fixed', '보장성 보험료 연 100만원 한도, 12% 공제', '국세청', 'https://www.nts.go.kr', '소득세법 제59조의4', 80),
  ('개인연금저축 소득공제', 'pension', ARRAY['individual'], 4000000, 0.40, 0, 'fixed', '2000년 이전 가입자만 해당. 납입액의 40% 공제', '국세청', 'https://www.nts.go.kr', '조세특례제한법 제86조', 90),
  ('청약저축 소득공제', 'housing', ARRAY['individual'], 2400000, 0.40, 0, 'fixed', '총급여 7천만원 이하 무주택 세대주. 연 240만원 한도 40% 공제', '국세청', 'https://www.nts.go.kr', '조세특례제한법 제87조', 100)
ON CONFLICT DO NOTHING;

-- =============================================
-- 완료 메시지
-- =============================================
SELECT '마스터 데이터 테이블 마이그레이션 완료!' as message;
SELECT '- tax_settings: 세금 관련 상수 (세율표, 공제한도 등)' as created_table_1;
SELECT '- benefits_master: 혜택 정보 마스터 (10개 항목)' as created_table_2;
SELECT '- deduction_items_master: 공제 항목 마스터 (10개 항목)' as created_table_3;
SELECT '- profiles 테이블 확장: 사용자 세금 기본정보 컬럼 추가' as modified_table;
