-- =============================================
-- FINA_R 개선된 더미데이터 (MVP 시연용)
-- 2025년 1월 1일 ~ 현재 기준
-- =============================================

-- =============================================
-- 1. 직장인 시나리오 함수 (test@naver.com용)
-- 연봉 4,200만원 (월급 350만원, 실수령 약 295만원)
-- 소득: 신한은행(급여)
-- 지출: 신한카드(주사용), 국민은행 체크카드 + 현금
-- =============================================
CREATE OR REPLACE FUNCTION seed_employee_data(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_year INTEGER := 2025;
  v_current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
  v_current_day INTEGER := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;
  i INTEGER;
  j INTEGER;
  v_date DATE;
  v_month TEXT;
BEGIN
  -- 프로필 업데이트
  UPDATE profiles SET
    name = '김민수',
    level = 12,
    current_exp = 2850,
    exp_to_next_level = 3500,
    badges = ARRAY['첫걸음', '출석왕', '절약러', '예산마스터', '공제탐험가'],
    points = 2580,
    rank = 1847,
    streak = 7,
    total_saved = 485000,
    tax_health_score = 72,
    is_premium = FALSE,
    user_type = 'individual'
  WHERE id = p_user_id;

  -- 기존 데이터 정리
  DELETE FROM receipts WHERE user_id = p_user_id;
  DELETE FROM budgets WHERE user_id = p_user_id;
  DELETE FROM linked_accounts WHERE user_id = p_user_id;
  DELETE FROM deduction_tracker WHERE user_id = p_user_id;
  DELETE FROM individual_tax_data WHERE user_id = p_user_id;
  DELETE FROM ai_insights WHERE user_id = p_user_id;
  DELETE FROM document_folders WHERE user_id = p_user_id;
  DELETE FROM attendance WHERE user_id = p_user_id;

  -- =============================================
  -- 연결 계좌 (은행 1곳 + 카드 2곳)
  -- =============================================
  INSERT INTO linked_accounts (user_id, type, bank, name, last_digits, color, icon, monthly_spent, transaction_count) VALUES
    (p_user_id, 'account', '신한은행', '급여통장', '1234', '#0046FF', '🏦', 0, 1),
    (p_user_id, 'credit', '신한카드', '신한 Deep Dream', '5678', '#0046FF', '💳', 1250000, 42),
    (p_user_id, 'debit', '국민은행', 'KB Star 체크카드', '9012', '#FFB300', '💳', 380000, 18);

  -- =============================================
  -- 월별 영수증 데이터 생성 (1월 ~ 현재)
  -- 직장인 월평균 지출 약 280만원 기준
  -- =============================================
  FOR i IN 1..v_current_month LOOP
    v_month := v_year || '-' || LPAD(i::TEXT, 2, '0');

    -- 고정 지출 (매월 발생)
    -- 월세
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-05')::DATE, '월세이체', '주거', 550000, 0, 'auto', '원룸 월세');

    -- 관리비
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-10')::DATE, '관리비', '주거', 80000 + (random() * 20000)::INTEGER, 0, 'auto');

    -- 통신비
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-15')::DATE, 'KT 통신비', '통신', 52000, 5200, 'auto');

    -- 보험료 (실손보험)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-20')::DATE, '삼성생명 실손보험', '보험', 35000, 0, 'auto', '실손의료보험');

    -- 연금저축 (IRP)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-25')::DATE, '미래에셋 연금저축', '연금/저축', 200000, 0, 'auto', '연금저축펀드 자동이체');

    -- 구독 서비스
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-01')::DATE, '넷플릭스', '문화/여가', 17000, 1700, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-01')::DATE, '유튜브 프리미엄', '문화/여가', 14900, 1490, 'auto');

    -- 교통비 (정기권 + 택시)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-01')::DATE, '서울교통공사 정기권', '교통', 65000, 0, 'auto');

    -- 주유비 (월 1회)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD((10 + (random() * 10)::INTEGER)::TEXT, 2, '0'))::DATE,
       'SK에너지 주유소', '교통', 65000 + (random() * 15000)::INTEGER, 6500, 'auto');

    -- 식비 (일별 변동 지출) - 월 15-20건
    FOR j IN 1..18 LOOP
      IF i < v_current_month OR (i = v_current_month AND j * 2 <= v_current_day) THEN
        v_date := (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD(LEAST(j * 2, 28)::TEXT, 2, '0'))::DATE;

        -- 커피/음료
        IF j % 3 = 0 THEN
          INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
            (p_user_id, v_date,
             CASE (random() * 3)::INTEGER WHEN 0 THEN '스타벅스' WHEN 1 THEN '이디야커피' ELSE '투썸플레이스' END,
             '식비', 4500 + (random() * 3000)::INTEGER, 450, 'auto');
        END IF;

        -- 점심/저녁
        IF j % 2 = 0 THEN
          INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
            (p_user_id, v_date,
             CASE (random() * 5)::INTEGER
               WHEN 0 THEN '맘스터치' WHEN 1 THEN '김밥천국' WHEN 2 THEN '본죽'
               WHEN 3 THEN '배달의민족' ELSE '요기요' END,
             '식비', 8000 + (random() * 15000)::INTEGER,
             (800 + (random() * 1500)::INTEGER),
             CASE WHEN random() > 0.7 THEN 'manual' ELSE 'auto' END);
        END IF;

        -- 편의점
        IF j % 4 = 0 THEN
          INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
            (p_user_id, v_date,
             CASE (random() * 3)::INTEGER WHEN 0 THEN 'GS25' WHEN 1 THEN 'CU' ELSE '세븐일레븐' END,
             '편의점', 5000 + (random() * 8000)::INTEGER, 500, 'auto');
        END IF;
      END IF;
    END LOOP;

    -- 마트/식료품 (월 2-3회)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD((5 + (random() * 5)::INTEGER)::TEXT, 2, '0'))::DATE,
       CASE (random() * 3)::INTEGER WHEN 0 THEN '이마트' WHEN 1 THEN '홈플러스' ELSE '롯데마트' END,
       '식료품', 55000 + (random() * 35000)::INTEGER, 5500, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD((15 + (random() * 5)::INTEGER)::TEXT, 2, '0'))::DATE,
       CASE (random() * 2)::INTEGER WHEN 0 THEN '이마트' ELSE '쿠팡' END,
       '식료품', 45000 + (random() * 25000)::INTEGER, 4500, 'auto');

    -- 생활용품 (월 1-2회)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD((8 + (random() * 10)::INTEGER)::TEXT, 2, '0'))::DATE,
       CASE (random() * 3)::INTEGER WHEN 0 THEN '올리브영' WHEN 1 THEN '다이소' ELSE '무신사' END,
       '생활용품', 25000 + (random() * 35000)::INTEGER, 2500, 'auto');

    -- 예산 설정
    INSERT INTO budgets (user_id, category, amount, month) VALUES
      (p_user_id, '주거', 650000, v_month),
      (p_user_id, '식비', 400000, v_month),
      (p_user_id, '편의점', 80000, v_month),
      (p_user_id, '식료품', 250000, v_month),
      (p_user_id, '교통', 200000, v_month),
      (p_user_id, '통신', 60000, v_month),
      (p_user_id, '생활용품', 100000, v_month),
      (p_user_id, '문화/여가', 150000, v_month),
      (p_user_id, '의료', 100000, v_month),
      (p_user_id, '보험', 40000, v_month),
      (p_user_id, '연금/저축', 200000, v_month)
    ON CONFLICT (user_id, category, month) DO UPDATE SET amount = EXCLUDED.amount;

    -- 개인 세금 데이터 (월별)
    -- 연봉 4,200만원 기준 월 원천징수 약 15만원
    INSERT INTO individual_tax_data (user_id, year, month, actual_tax, predicted_tax, expense) VALUES
      (p_user_id, v_year, i,
       CASE WHEN i < v_current_month THEN 152000 ELSE 0 END,
       152000,
       2650000 + (random() * 300000)::INTEGER)
    ON CONFLICT (user_id, year, month) DO UPDATE SET
      actual_tax = EXCLUDED.actual_tax,
      predicted_tax = EXCLUDED.predicted_tax,
      expense = EXCLUDED.expense;
  END LOOP;

  -- =============================================
  -- 특별 지출 (비정기)
  -- =============================================
  -- 의료비 (분기별)
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-02-15'::DATE, '서울대병원', '의료', 45000, 0, 'manual', '건강검진'),
    (p_user_id, '2025-03-20'::DATE, '이비인후과', '의료', 15000, 0, 'manual', '감기 진료'),
    (p_user_id, '2025-03-20'::DATE, '온누리약국', '의료', 8500, 0, 'manual', '처방약'),
    (p_user_id, '2025-05-10'::DATE, '치과', '의료', 120000, 0, 'manual', '스케일링'),
    (p_user_id, '2025-07-25'::DATE, '안과', '의료', 35000, 0, 'manual', '눈 검사'),
    (p_user_id, '2025-09-05'::DATE, '정형외과', '의료', 25000, 0, 'manual', '허리 진료');

  -- 교육비 (자기계발)
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-01-15'::DATE, '클래스101', '도서/교육', 89000, 8900, 'manual', '엑셀 강의'),
    (p_user_id, '2025-03-01'::DATE, '해커스어학원', '도서/교육', 350000, 35000, 'manual', '토익 수강료'),
    (p_user_id, '2025-04-20'::DATE, '교보문고', '도서/교육', 28000, 2800, 'manual', '자기계발서'),
    (p_user_id, '2025-06-10'::DATE, '인프런', '도서/교육', 66000, 6600, 'manual', 'Python 강의'),
    (p_user_id, '2025-08-15'::DATE, '패스트캠퍼스', '도서/교육', 150000, 15000, 'manual', '데이터분석 강의');

  -- 기부금
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-02-01'::DATE, '유니세프', '기부금', 30000, 0, 'manual', '정기후원'),
    (p_user_id, '2025-05-01'::DATE, '유니세프', '기부금', 30000, 0, 'manual', '정기후원'),
    (p_user_id, '2025-08-01'::DATE, '유니세프', '기부금', 30000, 0, 'manual', '정기후원');

  -- 문화/여가 (영화, 공연 등)
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
    (p_user_id, '2025-01-25'::DATE, 'CGV 용산', '문화/여가', 15000, 1500, 'manual'),
    (p_user_id, '2025-02-14'::DATE, 'CGV', '문화/여가', 30000, 3000, 'manual'),
    (p_user_id, '2025-04-05'::DATE, '멜론 이용권', '문화/여가', 10900, 1090, 'auto'),
    (p_user_id, '2025-06-20'::DATE, '인터파크 공연', '문화/여가', 88000, 8800, 'manual'),
    (p_user_id, '2025-08-10'::DATE, '워터파크', '문화/여가', 65000, 6500, 'manual');

  -- =============================================
  -- 공제 항목 추적 (연봉 4,200만원 기준)
  -- 의료비 공제 기준: 총급여의 3% = 126만원 초과분
  -- =============================================
  INSERT INTO deduction_tracker (user_id, category, name, current_amount, threshold, max_deduction, deduction_rate, potential_saving, documents_count, year) VALUES
    (p_user_id, 'medical', '의료비', 248500, 1260000, 7000000, 0.15, 0, 6, v_year),
    (p_user_id, 'education', '교육비', 683000, 0, 3000000, 0.15, 102450, 5, v_year),
    (p_user_id, 'housing', '월세', 550000 * v_current_month, 0, 7500000, 0.12, (550000 * v_current_month * 0.12)::INTEGER, v_current_month, v_year),
    (p_user_id, 'donation', '기부금', 90000, 0, 10000000, 0.15, 13500, 3, v_year),
    (p_user_id, 'pension', '연금저축', 200000 * v_current_month, 0, 4000000, 0.165, LEAST(200000 * v_current_month, 4000000) * 0.165, v_current_month, v_year),
    (p_user_id, 'credit_card', '신용카드', 1250000 * v_current_month, 5250000, 3000000, 0.15, 450000, 42 * v_current_month, v_year),
    (p_user_id, 'debit_card', '체크카드', 380000 * v_current_month, 0, 3000000, 0.30, LEAST(380000 * v_current_month, 3000000) * 0.30, 18 * v_current_month, v_year),
    (p_user_id, 'insurance', '보장성보험', 35000 * v_current_month, 0, 1000000, 0.12, LEAST(35000 * v_current_month, 1000000) * 0.12, v_current_month, v_year)
  ON CONFLICT (user_id, category, year) DO UPDATE SET
    current_amount = EXCLUDED.current_amount,
    potential_saving = EXCLUDED.potential_saving,
    documents_count = EXCLUDED.documents_count;

  -- =============================================
  -- AI 인사이트
  -- =============================================
  INSERT INTO ai_insights (user_id, type, category, title, description, potential_saving, current_amount, threshold, action, deadline, priority) VALUES
    (p_user_id, 'opportunity', 'pension', '연금저축 추가 납입 권장',
     '연말까지 연금저축 추가 납입 시 최대 66만원 세액공제 가능. 현재 ' || (200000 * v_current_month / 10000) || '만원 납입 중',
     660000 - (LEAST(200000 * v_current_month, 4000000) * 0.165)::INTEGER,
     200000 * v_current_month, 4000000, '연금저축 한도 채우기', '2025-12-31'::DATE, 'high'),
    (p_user_id, 'opportunity', 'card', '체크카드 사용 늘리기',
     '신용카드 공제 한도 초과 예상. 남은 기간 체크카드 위주 사용 시 추가 공제 가능',
     150000, 1250000 * v_current_month, 5250000, '체크카드로 전환', '2025-12-31'::DATE, 'medium'),
    (p_user_id, 'info', 'education', '교육비 공제 여유',
     '본인 교육비 공제 한도 여유 있음. 자격증/어학 수강 시 추가 공제 가능',
     (3000000 - 683000) * 0.15, 683000, 3000000, '교육비 활용하기', '2025-12-31'::DATE, 'medium'),
    (p_user_id, 'achievement', 'housing', '월세 공제 순조로운 진행',
     '월세 세액공제 서류 ' || v_current_month || '건 확보 완료. 연말정산 준비 순조로움',
     0, 550000 * v_current_month, 7500000, NULL, NULL, 'low');

  -- =============================================
  -- 문서 폴더
  -- =============================================
  INSERT INTO document_folders (user_id, folder_type, folder_name, document_count, last_updated) VALUES
    (p_user_id, 'yearEnd', '의료비', 6, CURRENT_DATE - INTERVAL '5 days'),
    (p_user_id, 'yearEnd', '교육비', 5, CURRENT_DATE - INTERVAL '10 days'),
    (p_user_id, 'yearEnd', '기부금', 3, CURRENT_DATE - INTERVAL '30 days'),
    (p_user_id, 'yearEnd', '신용카드', 42 * v_current_month, CURRENT_DATE),
    (p_user_id, 'yearEnd', '체크카드', 18 * v_current_month, CURRENT_DATE),
    (p_user_id, 'yearEnd', '월세', v_current_month, CURRENT_DATE - INTERVAL '3 days'),
    (p_user_id, 'yearEnd', '연금저축', v_current_month, CURRENT_DATE - INTERVAL '5 days'),
    (p_user_id, 'yearEnd', '보험료', v_current_month, CURRENT_DATE - INTERVAL '7 days')
  ON CONFLICT (user_id, folder_type, folder_name) DO UPDATE SET
    document_count = EXCLUDED.document_count,
    last_updated = EXCLUDED.last_updated;

  -- 출석 기록 (최근 7일)
  FOR i IN 0..6 LOOP
    INSERT INTO attendance (user_id, date, points_earned) VALUES
      (p_user_id, CURRENT_DATE - (i || ' days')::INTERVAL, 50)
    ON CONFLICT (user_id, date) DO NOTHING;
  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 2. 소상공인 시나리오 함수 (test_00@naver.com용)
-- 카페 운영자, 월매출 약 1,200만원
-- 소득: 매장 매출 (현금+카드)
-- 지출: 원재료비, 임대료, 인건비, 공과금 등
-- =============================================
CREATE OR REPLACE FUNCTION seed_business_data(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_year INTEGER := 2025;
  v_current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
  v_current_day INTEGER := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;
  i INTEGER;
  j INTEGER;
  v_date DATE;
  v_month TEXT;
  v_monthly_revenue INTEGER;
  v_daily_revenue INTEGER;
BEGIN
  -- 프로필 업데이트
  UPDATE profiles SET
    name = '박카페',
    level = 15,
    current_exp = 4200,
    exp_to_next_level = 5000,
    badges = ARRAY['첫걸음', '사업시작', '매출왕', '절세마스터', 'VAT전문가'],
    points = 3850,
    rank = 892,
    streak = 12,
    total_saved = 1250000,
    tax_health_score = 78,
    is_premium = TRUE,
    user_type = 'business'
  WHERE id = p_user_id;

  -- 기존 데이터 정리
  DELETE FROM receipts WHERE user_id = p_user_id;
  DELETE FROM budgets WHERE user_id = p_user_id;
  DELETE FROM linked_accounts WHERE user_id = p_user_id;
  DELETE FROM deduction_tracker WHERE user_id = p_user_id;
  DELETE FROM business_tax_data WHERE user_id = p_user_id;
  DELETE FROM ai_insights WHERE user_id = p_user_id;
  DELETE FROM document_folders WHERE user_id = p_user_id;
  DELETE FROM attendance WHERE user_id = p_user_id;

  -- =============================================
  -- 연결 계좌 (사업자용)
  -- =============================================
  INSERT INTO linked_accounts (user_id, type, bank, name, last_digits, color, icon, monthly_spent, transaction_count) VALUES
    (p_user_id, 'account', '기업은행', '사업자통장', '1111', '#0066B3', '🏦', 0, 45),
    (p_user_id, 'account', '하나은행', '예비자금통장', '2222', '#009490', '🏦', 0, 5),
    (p_user_id, 'credit', 'BC카드', '사업자카드', '3333', '#FF0000', '💳', 4500000, 85),
    (p_user_id, 'debit', '기업은행', '체크카드', '4444', '#0066B3', '💳', 850000, 32);

  -- =============================================
  -- 월별 데이터 생성 (1월 ~ 현재)
  -- 카페 월평균 매출 1,200만원, 원가율 30%
  -- =============================================
  FOR i IN 1..v_current_month LOOP
    v_month := v_year || '-' || LPAD(i::TEXT, 2, '0');

    -- 월별 매출 변동 (계절성 반영)
    v_monthly_revenue := CASE
      WHEN i IN (1, 2) THEN 10500000 + (random() * 1000000)::INTEGER  -- 겨울 (따뜻한 음료)
      WHEN i IN (3, 4, 5) THEN 11500000 + (random() * 1000000)::INTEGER  -- 봄
      WHEN i IN (6, 7, 8) THEN 13500000 + (random() * 1500000)::INTEGER  -- 여름 (아이스)
      WHEN i IN (9, 10, 11) THEN 12000000 + (random() * 1000000)::INTEGER  -- 가을
      ELSE 11000000 + (random() * 1000000)::INTEGER
    END;

    -- =============================================
    -- 고정 지출 (매월)
    -- =============================================
    -- 임대료
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-05')::DATE, '건물주 임대료', '임대료', 2200000, 220000, 'auto', '매장 월세');

    -- 인건비 (알바 2명)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-10')::DATE, '직원급여', '인건비', 2400000, 0, 'auto', '알바 2명 급여'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-10')::DATE, '4대보험', '인건비', 280000, 0, 'auto', '사업자 부담분');

    -- 공과금
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-15')::DATE, '한국전력', '공과금', 180000 + (random() * 50000)::INTEGER, 18000, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-15')::DATE, '서울시 상수도', '공과금', 45000 + (random() * 15000)::INTEGER, 4500, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-15')::DATE, '도시가스', '공과금', 85000 + (random() * 25000)::INTEGER, 8500, 'auto');

    -- 통신/인터넷
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-20')::DATE, 'KT 기업인터넷', '통신', 55000, 5500, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-20')::DATE, 'POS/카드단말기', '통신', 33000, 3300, 'auto');

    -- 보험료
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-25')::DATE, '화재보험', '보험', 85000, 0, 'auto', '매장 화재보험'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-25')::DATE, '배상책임보험', '보험', 45000, 0, 'auto', '영업배상책임보험');

    -- =============================================
    -- 원재료비 (매출의 약 30%)
    -- =============================================
    -- 원두/부재료 (주 1회 대량 구매)
    FOR j IN 1..4 LOOP
      INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
        (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-' || LPAD((j * 7)::TEXT, 2, '0'))::DATE,
         CASE (j % 2) WHEN 0 THEN '커피원두도매' ELSE '식자재마트' END,
         '원재료비', 750000 + (random() * 150000)::INTEGER, 75000, 'auto', '원두/우유/시럽 등');
    END LOOP;

    -- 일회용품/포장재 (월 2회)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-08')::DATE, '포장재도매', '소모품', 280000, 28000, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-22')::DATE, '포장재도매', '소모품', 250000, 25000, 'auto');

    -- =============================================
    -- 기타 사업 관련 지출
    -- =============================================
    -- 마케팅/광고
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-01')::DATE, '네이버 플레이스 광고', '광고/마케팅', 150000, 15000, 'auto'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-01')::DATE, '배달앱 광고', '광고/마케팅', 200000, 20000, 'auto');

    -- 청소/위생
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-12')::DATE, '위생용품', '소모품', 85000, 8500, 'auto');

    -- 수수료 (카드수수료, 배달수수료)
    INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-28')::DATE, '카드수수료', '수수료', (v_monthly_revenue * 0.015)::INTEGER, 0, 'auto', '카드결제 수수료'),
      (p_user_id, (v_year || '-' || LPAD(i::TEXT, 2, '0') || '-28')::DATE, '배달수수료', '수수료', (v_monthly_revenue * 0.08)::INTEGER, 0, 'auto', '배달앱 수수료');

    -- =============================================
    -- 사업자 세금 데이터
    -- 월매출 1,200만원, 경비 약 850만원, 순이익 약 350만원
    -- =============================================
    INSERT INTO business_tax_data (user_id, year, month, actual_tax, predicted_tax, income, expense, vat) VALUES
      (p_user_id, v_year, i,
       CASE WHEN i < v_current_month THEN (v_monthly_revenue * 0.03)::INTEGER ELSE 0 END,
       (v_monthly_revenue * 0.03)::INTEGER,
       v_monthly_revenue,
       (v_monthly_revenue * 0.70)::INTEGER,
       (v_monthly_revenue * 0.10 - (v_monthly_revenue * 0.70 * 0.10))::INTEGER)
    ON CONFLICT (user_id, year, month) DO UPDATE SET
      actual_tax = EXCLUDED.actual_tax,
      predicted_tax = EXCLUDED.predicted_tax,
      income = EXCLUDED.income,
      expense = EXCLUDED.expense,
      vat = EXCLUDED.vat;

    -- 예산 설정 (사업자용)
    INSERT INTO budgets (user_id, category, amount, month) VALUES
      (p_user_id, '임대료', 2500000, v_month),
      (p_user_id, '인건비', 2800000, v_month),
      (p_user_id, '원재료비', 3500000, v_month),
      (p_user_id, '공과금', 350000, v_month),
      (p_user_id, '통신', 100000, v_month),
      (p_user_id, '소모품', 700000, v_month),
      (p_user_id, '광고/마케팅', 400000, v_month),
      (p_user_id, '보험', 150000, v_month),
      (p_user_id, '수수료', 1500000, v_month)
    ON CONFLICT (user_id, category, month) DO UPDATE SET amount = EXCLUDED.amount;
  END LOOP;

  -- =============================================
  -- 특별 지출 (비정기 사업 관련)
  -- =============================================
  -- 설비 수리/유지보수
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-02-20'::DATE, '에스프레소머신 수리', '수리/유지', 350000, 35000, 'manual', '에스프레소머신 정기점검'),
    (p_user_id, '2025-05-15'::DATE, '냉장고 수리', '수리/유지', 180000, 18000, 'manual', '업소용 냉장고 수리'),
    (p_user_id, '2025-08-10'::DATE, '에어컨 수리', '수리/유지', 250000, 25000, 'manual', '에어컨 가스충전');

  -- 사업자 교육
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-03-05'::DATE, '바리스타 교육', '교육', 500000, 50000, 'manual', '신메뉴 교육'),
    (p_user_id, '2025-07-20'::DATE, '위생교육', '교육', 50000, 0, 'manual', '식품위생교육');

  -- 소형 집기 구매
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type, memo) VALUES
    (p_user_id, '2025-04-10'::DATE, '주방용품', '비품', 280000, 28000, 'manual', '텀블러, 머그컵 등'),
    (p_user_id, '2025-06-25'::DATE, '인테리어 소품', '비품', 450000, 45000, 'manual', '매장 분위기 개선');

  -- =============================================
  -- 공제 항목 추적 (사업자용)
  -- =============================================
  INSERT INTO deduction_tracker (user_id, category, name, current_amount, threshold, max_deduction, deduction_rate, potential_saving, documents_count, year) VALUES
    (p_user_id, 'business_expense', '사업경비', (12000000 * 0.70 * v_current_month)::INTEGER, 0, 999999999, 1.00, 0, 85 * v_current_month, v_year),
    (p_user_id, 'pension', '노란우산공제', 300000 * v_current_month, 0, 5000000, 0.165, LEAST(300000 * v_current_month, 5000000) * 0.165, v_current_month, v_year),
    (p_user_id, 'insurance', '사업자보험', 130000 * v_current_month, 0, 2000000, 0.12, LEAST(130000 * v_current_month, 2000000) * 0.12, v_current_month * 2, v_year)
  ON CONFLICT (user_id, category, year) DO UPDATE SET
    current_amount = EXCLUDED.current_amount,
    potential_saving = EXCLUDED.potential_saving,
    documents_count = EXCLUDED.documents_count;

  -- =============================================
  -- AI 인사이트 (사업자용)
  -- =============================================
  INSERT INTO ai_insights (user_id, type, category, title, description, potential_saving, current_amount, threshold, action, deadline, priority) VALUES
    (p_user_id, 'critical', 'vat', '부가세 신고 준비',
     CASE WHEN v_current_month IN (1, 4, 7, 10) THEN '이번 달 부가세 신고 기간입니다. 매입세액 공제 확인하세요.'
          ELSE '다음 분기 부가세 신고를 위해 세금계산서를 정리하세요.' END,
     (12000000 * v_current_month * 0.10 * 0.70)::INTEGER,
     12000000 * v_current_month, 0, '부가세 준비하기',
     CASE WHEN v_current_month < 4 THEN '2025-04-25'::DATE
          WHEN v_current_month < 7 THEN '2025-07-25'::DATE
          WHEN v_current_month < 10 THEN '2025-10-25'::DATE
          ELSE '2026-01-25'::DATE END, 'high'),
    (p_user_id, 'opportunity', 'pension', '노란우산공제 추가 납입',
     '소기업소상공인 공제부금(노란우산) 추가 납입 시 최대 500만원 소득공제',
     (5000000 - LEAST(300000 * v_current_month, 5000000)) * 0.165,
     300000 * v_current_month, 5000000, '노란우산 추가 납입', '2025-12-31'::DATE, 'medium'),
    (p_user_id, 'info', 'expense', '경비처리 현황',
     '올해 사업경비 ' || ((12000000 * 0.70 * v_current_month) / 10000) || '만원 처리 완료. 누락된 영수증 확인하세요.',
     0, (12000000 * 0.70 * v_current_month)::INTEGER, 0, '영수증 점검', NULL, 'low'),
    (p_user_id, 'warning', 'income', '매출 분석',
     '전월 대비 매출 ' || CASE WHEN random() > 0.5 THEN '5% 증가' ELSE '3% 감소' END || '. 계절성 트렌드를 확인하세요.',
     0, 12000000, 0, '매출분석 보기', NULL, 'medium');

  -- =============================================
  -- 문서 폴더 (사업자용)
  -- =============================================
  INSERT INTO document_folders (user_id, folder_type, folder_name, document_count, last_updated) VALUES
    (p_user_id, 'vat', '매입세금계산서', 85 * v_current_month, CURRENT_DATE),
    (p_user_id, 'vat', '매출세금계산서', 30 * v_current_month, CURRENT_DATE),
    (p_user_id, 'vat', '신용카드매출', 42 * v_current_month, CURRENT_DATE),
    (p_user_id, 'comprehensiveTax', '사업경비', 120 * v_current_month, CURRENT_DATE),
    (p_user_id, 'comprehensiveTax', '인건비', v_current_month * 2, CURRENT_DATE - INTERVAL '5 days'),
    (p_user_id, 'comprehensiveTax', '임대료', v_current_month, CURRENT_DATE - INTERVAL '3 days'),
    (p_user_id, 'comprehensiveTax', '보험료', v_current_month * 2, CURRENT_DATE - INTERVAL '7 days')
  ON CONFLICT (user_id, folder_type, folder_name) DO UPDATE SET
    document_count = EXCLUDED.document_count,
    last_updated = EXCLUDED.last_updated;

  -- 출석 기록 (최근 12일 연속)
  FOR i IN 0..11 LOOP
    INSERT INTO attendance (user_id, date, points_earned) VALUES
      (p_user_id, CURRENT_DATE - (i || ' days')::INTERVAL, 50)
    ON CONFLICT (user_id, date) DO NOTHING;
  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 사용법:
-- 1. 직장인 시나리오 (test@naver.com):
--    SELECT seed_employee_data('사용자-UUID');
--
-- 2. 소상공인 시나리오 (test_00@naver.com):
--    SELECT seed_business_data('사용자-UUID');
-- =============================================

SELECT '개선된 더미데이터 함수 생성 완료! (직장인: seed_employee_data, 소상공인: seed_business_data)' as message;
