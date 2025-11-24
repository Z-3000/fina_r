-- =============================================
-- FINA_R 시드 데이터 (2024 통계 기반 현실적 버전)
-- 테스트/시연용 더미 데이터
--
-- 참고 통계:
-- - 직장인 평균 월급: 353만원 (2024 통계청)
-- - 가구 월평균 소비지출: 289만원
-- - 소상공인 월평균 매출: 1,224만원
-- - 소상공인 연간 영업이익: 2,500만원
-- =============================================

-- =============================================
-- 1. 리워드 상품
-- =============================================
INSERT INTO rewards (name, description, points, icon, category, stock) VALUES
  ('스타벅스 아메리카노', '스타벅스 아메리카노 Tall', 500, '☕', 'coffee', 'unlimited'),
  ('이디야 아메리카노', '이디야 아메리카노 Large', 400, '☕', 'coffee', 'unlimited'),
  ('투썸플레이스 케이크', '투썸플레이스 조각 케이크', 800, '🍰', 'coffee', 'limited'),
  ('GS25 5천원권', 'GS25 편의점 상품권 5,000원', 450, '🏪', 'voucher', 'unlimited'),
  ('CU 5천원권', 'CU 편의점 상품권 5,000원', 450, '🏪', 'voucher', 'unlimited'),
  ('쿠팡 1만원 할인쿠폰', '쿠팡에서 사용 가능한 만원 할인', 900, '🛒', 'voucher', 'limited'),
  ('네이버페이 5천원', '네이버페이 포인트 5,000원', 480, '💚', 'voucher', 'unlimited'),
  ('올리브영 5천원권', '올리브영 상품권 5,000원', 450, '💄', 'beauty', 'unlimited'),
  ('카카오톡 이모티콘', '인기 이모티콘 1개', 300, '😊', 'digital', 'unlimited'),
  ('멜론 이용권 1일', '멜론 스트리밍 1일 이용권', 200, '🎵', 'digital', 'unlimited'),
  ('프리미엄 1개월 무료', '프리미엄 기능 1개월 무료 체험', 2000, '👑', 'premium', 'limited'),
  ('세무상담 30분 무료', '전문 세무사 상담 30분 무료', 3000, '💼', 'premium', 'limited')
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. 미션 템플릿
-- =============================================
INSERT INTO missions (title, description, target, reward, type) VALUES
  -- 일일 미션
  ('영수증 2개 등록하기', '오늘 영수증 2개를 등록하세요', 2, 30, 'daily'),
  ('영수증 3개 등록하기', '오늘 영수증 3개를 등록하세요', 3, 50, 'daily'),
  ('예산 점검하기', '예산 현황을 확인하세요', 1, 20, 'daily'),
  ('오늘의 절약 팁 확인', '절약 팁을 확인하세요', 1, 10, 'daily'),
  ('출석 체크하기', '오늘 앱에 로그인하세요', 1, 10, 'daily'),
  -- 주간 미션
  ('영수증 15개 등록', '이번 주 영수증 15개를 등록하세요', 15, 200, 'weekly'),
  ('영수증 20개 등록', '이번 주 영수증 20개를 등록하세요', 20, 300, 'weekly'),
  ('예산 초과 0회', '일주일 동안 예산을 초과하지 마세요', 7, 350, 'weekly'),
  ('5일 연속 출석', '5일 연속으로 출석하세요', 5, 150, 'weekly'),
  -- 월간 미션
  ('영수증 60개 등록', '이번 달 영수증 60개를 등록하세요', 60, 1000, 'monthly'),
  ('예산 목표 달성', '모든 카테고리 예산 목표를 달성하세요', 7, 1500, 'monthly')
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. 챌린지
-- =============================================
INSERT INTO challenges (title, description, target, reward, badge, difficulty, days_left) VALUES
  ('식비 15% 절감', '지난달 대비 식비 15% 절약하기', 100, 200, '🍽️', 'medium', 25),
  ('영수증 25개 등록', '이번 달 영수증 25개 등록하기', 25, 150, '📝', 'easy', 20),
  ('예산 준수왕', '한 달 동안 모든 카테고리 예산 지키기', 100, 300, '🎯', 'hard', 25),
  ('커뮤니티 참여', '질문 3개 작성하고 답변 5개 달기', 8, 150, '💬', 'easy', 15),
  ('첫 영수증 등록', '첫 번째 영수증을 등록하세요', 1, 100, '🎉', 'easy', 30),
  ('5일 연속 출석', '5일 연속으로 출석하세요', 5, 150, '🔥', 'easy', 7),
  ('예산 첫 설정', '첫 번째 예산을 설정하세요', 1, 50, '💰', 'easy', 30),
  ('절약 챌린저', '이번 달 총 30만원 절약하기', 300000, 500, '💎', 'medium', 25),
  ('공제 탐험가', '새로운 공제 항목 3개 발견하기', 3, 300, '🔍', 'medium', 30),
  ('세금 건강 80점', '세금 건강 점수 80점 달성하기', 80, 500, '🏆', 'medium', 30)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. 이벤트 (날짜를 동적으로 설정)
-- =============================================
INSERT INTO events (title, description, end_date, reward, type, target) VALUES
  ('신규 가입 이벤트', '7일 연속 출석하면 스타벅스 쿠폰 증정!', TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD'), '스타벅스 아메리카노', 'attendance', 7),
  ('이달의 절약왕 챌린지', '이번 달 가장 많이 절약한 Top 100에게 추가 포인트!', TO_CHAR((DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE, 'YYYY-MM-DD'), '500P ~ 5,000P', 'competition', NULL),
  ('친구 초대 이벤트', '친구 1명 초대 시 양쪽 모두 300P 지급', '상시', '300P', 'referral', NULL),
  ('연말정산 준비 이벤트', '공제 항목 5개 이상 등록 시 추가 포인트', TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD'), '500P', 'promotion', 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. 이용 가능한 은행/카드사
-- =============================================
INSERT INTO available_banks (name, icon, color, type) VALUES
  ('신한은행', '🏦', '#0046FF', 'bank'),
  ('KB국민은행', '🏦', '#FFB300', 'bank'),
  ('우리은행', '🏦', '#0066B3', 'bank'),
  ('하나은행', '🏦', '#009490', 'bank'),
  ('NH농협', '🏦', '#02A94D', 'bank'),
  ('카카오뱅크', '🏦', '#FFCD00', 'bank'),
  ('토스뱅크', '🏦', '#0064FF', 'bank'),
  ('케이뱅크', '🏦', '#FFCC00', 'bank'),
  ('삼성카드', '💳', '#0066CC', 'card'),
  ('현대카드', '💳', '#8B00FF', 'card'),
  ('BC카드', '💳', '#FF0000', 'card'),
  ('롯데카드', '💳', '#ED1C24', 'card'),
  ('신한카드', '💳', '#0046FF', 'card'),
  ('KB국민카드', '💳', '#FFB300', 'card')
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. 세금 전문가
-- =============================================
INSERT INTO tax_experts (name, title, rating, reviews_count, specialties, price, experience_years, image) VALUES
  ('김세무', '세무사', 4.9, 284, ARRAY['연말정산', '근로소득', '월세공제'], 35000, 12, '👨‍💼'),
  ('이회계', '공인회계사', 4.8, 192, ARRAY['종합소득세', '소상공인', '부가세'], 50000, 15, '👩‍💼'),
  ('박세무', '세무사', 4.7, 156, ARRAY['프리랜서', '의료비공제', '교육비공제'], 40000, 8, '👨‍💼'),
  ('최회계', '공인회계사', 4.9, 321, ARRAY['법인세', '스타트업', '투자유치'], 80000, 20, '👩‍💼'),
  ('정세무', '세무사', 4.6, 98, ARRAY['유튜버', '인플루언서', '해외소득'], 45000, 6, '👨‍💼')
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. 금융 상품
-- =============================================
INSERT INTO financial_products (type, name, provider, rating, benefit, match_score, icon, expected_savings) VALUES
  ('card', '신한 딥드림 체크카드', '신한카드', 4.7, '편의점/커피 5% 적립', 92, '💳', 25000),
  ('card', '현대카드 M포인트', '현대카드', 4.6, '주유/마트 3% 적립', 88, '💳', 35000),
  ('card', 'KB국민 탄탄대로', 'KB국민카드', 4.5, '대중교통 10% 할인', 85, '💳', 28000),
  ('savings', '카카오뱅크 적금', '카카오뱅크', 4.8, '연 4.0% 금리', 85, '🏦', 48000),
  ('savings', '토스뱅크 목표적금', '토스뱅크', 4.7, '연 4.5% + 우대금리', 82, '🏦', 54000),
  ('insurance', '연금저축펀드', '삼성자산운용', 4.5, '연 400만원 한도 세액공제', 80, '🛡️', 660000)
ON CONFLICT DO NOTHING;

-- =============================================
-- 8. 커뮤니티 게시물
-- =============================================
INSERT INTO community_posts (author_name, title, content, answers_count, likes_count) VALUES
  ('익명의 직장인', '연봉 4천만원인데 연말정산 환급 얼마나 받을 수 있을까요?', '올해 첫 연말정산인데 대략 얼마 정도 환급받을 수 있는지 궁금합니다.', 15, 42),
  ('절약하고싶은사람', '월 300만원 월급으로 100만원 저축 가능할까요?', '고정비 제외하고 얼마나 저축할 수 있을지 조언 부탁드립니다.', 28, 89),
  ('사업초보', '월매출 1천만원 카페 부가세 신고 어떻게 하나요?', '처음 부가세 신고하는데 어떻게 해야 할지 막막합니다.', 12, 35),
  ('세금초보', '연말정산 간소화 서비스 언제부터 이용 가능한가요?', '올해 처음 연말정산하는데 간소화 서비스 이용 시기가 궁금합니다.', 8, 23),
  ('신혼부부', '맞벌이 부부 연말정산 어떻게 하면 유리한가요?', '둘 다 직장인인데 부양가족 공제를 누가 받아야 할까요?', 31, 112),
  ('투잡러', '부업 소득 300만원도 신고해야 하나요?', '직장 외에 부업으로 연간 300만원 정도 버는데 신고 대상인가요?', 19, 56)
ON CONFLICT DO NOTHING;

-- =============================================
-- 테스트용 함수: 특정 사용자에게 더미 데이터 삽입
-- 날짜는 CURRENT_DATE 기준으로 동적 생성
-- 2024 통계 기반 현실적인 금액 적용
-- =============================================
CREATE OR REPLACE FUNCTION seed_user_data(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_current_month TEXT;
  v_last_month TEXT;
  v_two_months_ago TEXT;
BEGIN
  -- 월 변수 설정
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  v_last_month := TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM');
  v_two_months_ago := TO_CHAR(CURRENT_DATE - INTERVAL '2 months', 'YYYY-MM');

  -- =============================================
  -- 영수증 데이터 (현실적인 금액 - 통계 기반)
  -- 커피: 5,000~7,000원
  -- 편의점: 5,000~12,000원
  -- 마트/식료품: 40,000~80,000원
  -- 외식: 8,000~25,000원
  -- 교통(택시): 10,000~20,000원
  -- 영화: 14,000~16,000원
  -- =============================================
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
    -- 이번 달 데이터 (최근)
    (p_user_id, CURRENT_DATE, '스타벅스 강남점', '식비', 6500, 650, 'auto'),
    (p_user_id, CURRENT_DATE, 'GS25 역삼역점', '편의점', 8900, 890, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '1 day', '이마트 성수점', '식료품', 67800, 6780, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '1 day', '카카오T 택시', '교통', 12500, 1250, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '2 days', 'CGV 용산', '문화/여가', 15000, 1500, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '2 days', '올리브영 선릉점', '생활용품', 32500, 3250, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '3 days', '교보문고 강남점', '도서/교육', 24500, 2450, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '3 days', '맘스터치', '식비', 8200, 820, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '4 days', 'CU편의점', '편의점', 5600, 560, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '4 days', '지하철 교통카드', '교통', 2800, 0, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '5 days', '배달의민족', '식비', 18500, 1850, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '5 days', '다이소', '생활용품', 12800, 1280, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '6 days', 'SK주유소', '교통', 65000, 6500, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '7 days', '삼성서울병원', '의료', 35000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '7 days', '약국', '의료', 8500, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '8 days', '롯데마트', '식료품', 54200, 5420, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '8 days', '이디야커피', '식비', 4500, 450, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '9 days', '무신사', '의류', 45000, 4500, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '10 days', 'KT 통신비', '통신', 52000, 5200, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '11 days', '넷플릭스', '문화/여가', 17000, 1700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '12 days', '점심 식사', '식비', 9500, 950, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '13 days', '버스/지하철', '교통', 28000, 0, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '14 days', '홈플러스', '식료품', 48500, 4850, 'auto'),
    -- 지난 달 데이터
    (p_user_id, CURRENT_DATE - INTERVAL '20 days', '스타벅스', '식비', 5800, 580, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '22 days', '이마트', '식료품', 72000, 7200, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '25 days', '메가박스', '문화/여가', 14000, 1400, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '28 days', '병원 진료', '의료', 25000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '30 days', 'SK주유소', '교통', 70000, 7000, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '32 days', 'KT 통신비', '통신', 52000, 5200, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '35 days', '코스트코', '식료품', 85000, 8500, 'auto'),
    -- 2달 전 데이터
    (p_user_id, CURRENT_DATE - INTERVAL '45 days', '이마트', '식료품', 58000, 5800, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '50 days', '넷플릭스', '문화/여가', 17000, 1700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '55 days', 'SK주유소', '교통', 68000, 6800, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '60 days', '월세', '주거', 600000, 0, 'auto')
  ON CONFLICT DO NOTHING;

  -- =============================================
  -- 예산 데이터 (2024 통계청 가구지출 기반)
  -- 월평균 소비지출 289만원 참고
  -- =============================================
  INSERT INTO budgets (user_id, category, amount, month) VALUES
    -- 이번 달
    (p_user_id, '식비', 450000, v_current_month),          -- 음식숙박 45.5만원
    (p_user_id, '편의점', 80000, v_current_month),
    (p_user_id, '식료품', 400000, v_current_month),        -- 식료품 41.2만원
    (p_user_id, '교통', 320000, v_current_month),          -- 교통 32.2만원
    (p_user_id, '생활용품', 120000, v_current_month),      -- 가정용품 12.3만원
    (p_user_id, '문화/여가', 200000, v_current_month),     -- 오락문화 21.5만원
    (p_user_id, '도서/교육', 150000, v_current_month),     -- 교육 18.1만원
    (p_user_id, '의료', 250000, v_current_month),          -- 보건 26.8만원
    (p_user_id, '통신', 120000, v_current_month),          -- 통신 12.6만원
    (p_user_id, '의류', 150000, v_current_month),
    (p_user_id, '기타', 100000, v_current_month),
    -- 지난 달
    (p_user_id, '식비', 450000, v_last_month),
    (p_user_id, '편의점', 80000, v_last_month),
    (p_user_id, '식료품', 400000, v_last_month),
    (p_user_id, '교통', 320000, v_last_month),
    (p_user_id, '생활용품', 120000, v_last_month),
    (p_user_id, '문화/여가', 200000, v_last_month),
    (p_user_id, '도서/교육', 150000, v_last_month),
    (p_user_id, '의료', 250000, v_last_month)
  ON CONFLICT (user_id, category, month) DO UPDATE SET amount = EXCLUDED.amount;

  -- 연결된 계좌
  INSERT INTO linked_accounts (user_id, type, bank, name, last_digits, color, icon, monthly_spent, transaction_count) VALUES
    (p_user_id, 'credit', '신한카드', '신한 Deep Dream', '1234', '#0046FF', '💳', 892000, 34),
    (p_user_id, 'debit', 'KB국민은행', 'KB Star 체크카드', '5678', '#FFB300', '💳', 456000, 21),
    (p_user_id, 'debit', '카카오뱅크', '입출금 통장', '9012', '#FFCD00', '🏦', 285000, 12)
  ON CONFLICT DO NOTHING;

  -- =============================================
  -- 공제 항목 추적 (연봉 4천만원 기준 현실적 데이터)
  -- 총급여 3% = 120만원 (의료비 공제 기준)
  -- =============================================
  INSERT INTO deduction_tracker (user_id, category, name, current_amount, threshold, max_deduction, deduction_rate, potential_saving, documents_count, year) VALUES
    (p_user_id, 'medical', '의료비', 450000, 1200000, 7000000, 0.15, 0, 5, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'education', '교육비', 1200000, 0, 3000000, 0.15, 180000, 4, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'housing', '월세', 6000000, 0, 7500000, 0.12, 720000, 10, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'donation', '기부금', 150000, 0, 10000000, 0.15, 22500, 2, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'pension', '연금저축', 2000000, 0, 4000000, 0.15, 300000, 10, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'credit_card', '신용카드', 12500000, 6250000, 3000000, 0.15, 450000, 34, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'debit_card', '체크카드', 4500000, 0, 3000000, 0.30, 1350000, 33, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
  ON CONFLICT (user_id, category, year) DO UPDATE SET
    current_amount = EXCLUDED.current_amount,
    potential_saving = EXCLUDED.potential_saving,
    documents_count = EXCLUDED.documents_count;

  -- AI 인사이트
  INSERT INTO ai_insights (user_id, type, category, title, description, potential_saving, current_amount, threshold, action, deadline, priority) VALUES
    (p_user_id, 'opportunity', 'card', '체크카드 사용 권장', '신용카드 공제 한도 초과. 남은 달 체크카드 사용 시 추가 45만원 공제 가능', 67500, 12500000, 6250000, '체크카드로 전환하기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'high'),
    (p_user_id, 'opportunity', 'education', '교육비 공제 여유', '교육비 공제 한도(300만원) 중 60% 미사용. 자격증/어학 강의 수강 시 추가 공제 가능', 135000, 1200000, 3000000, '교육비 활용 팁 보기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'medium'),
    (p_user_id, 'info', 'pension', '연금저축 추가 납입 권장', '연금저축 한도(400만원) 중 50% 사용. 추가 납입 시 최대 30만원 세액공제', 300000, 2000000, 4000000, '연금저축 알아보기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'medium'),
    (p_user_id, 'achievement', 'medical', '의료비 공제 현황', '올해 의료비 45만원 사용. 총급여 3%인 120만원 이상 지출 시 공제 가능', 0, 450000, 1200000, '의료비 공제 조건 보기', NULL, 'low')
  ON CONFLICT DO NOTHING;

  -- 알림 센터
  INSERT INTO notification_center (user_id, type, title, message, timestamp_text, priority, is_read) VALUES
    (p_user_id, 'ai_insight', '체크카드 사용 늘리기', '신용카드 공제 한도 초과! 체크카드로 전환 시 추가 공제 가능', '방금 전', 'high', FALSE),
    (p_user_id, 'document', '의료비 영수증 2건 수집', '병원 진료비 영수증이 자동으로 정리되었습니다', '1시간 전', 'medium', FALSE),
    (p_user_id, 'deadline', '연말정산 D-38', '공제 항목 점검하고 절세 기회 놓치지 마세요', '3시간 전', 'medium', TRUE),
    (p_user_id, 'achievement', '레벨 8 달성!', '300 포인트를 획득했습니다', '어제', 'low', TRUE)
  ON CONFLICT DO NOTHING;

  -- 알림 (notifications 테이블)
  INSERT INTO notifications (user_id, type, title, message, icon, priority) VALUES
    (p_user_id, 'savings', '커피값 절약 팁!', '이디야 커피로 바꾸면 월 15,000원 절감 가능', '☕', 'medium'),
    (p_user_id, 'alert', '식비 예산 78% 도달', '이번 달 식비가 예산의 78%에 도달했습니다', '🍴', 'medium'),
    (p_user_id, 'tax', '연말정산 준비', '공제 서류 미리 준비하면 환급액 늘릴 수 있어요', '📋', 'high')
  ON CONFLICT DO NOTHING;

  -- 문서 폴더
  INSERT INTO document_folders (user_id, folder_type, folder_name, document_count, last_updated) VALUES
    (p_user_id, 'yearEnd', '의료비', 5, CURRENT_DATE - INTERVAL '4 days'),
    (p_user_id, 'yearEnd', '교육비', 4, CURRENT_DATE - INTERVAL '9 days'),
    (p_user_id, 'yearEnd', '기부금', 2, CURRENT_DATE - INTERVAL '14 days'),
    (p_user_id, 'yearEnd', '신용카드', 12, CURRENT_DATE),
    (p_user_id, 'yearEnd', '체크카드', 10, CURRENT_DATE),
    (p_user_id, 'yearEnd', '월세', 10, CURRENT_DATE - INTERVAL '23 days')
  ON CONFLICT (user_id, folder_type, folder_name) DO UPDATE SET
    document_count = EXCLUDED.document_count,
    last_updated = EXCLUDED.last_updated;

  -- =============================================
  -- 개인 세금 데이터 (연봉 4,000만원 기준)
  -- 월급 약 333만원, 실수령 약 285만원
  -- 월 원천징수 약 18.5만원
  -- 월 소비지출 약 280만원 (통계청 289만원 기반)
  -- =============================================
  INSERT INTO individual_tax_data (user_id, year, month, actual_tax, predicted_tax, expense) VALUES
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 185000, 185000, 2650000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 2, 185000, 185000, 2480000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 3, 185000, 185000, 2920000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 185000, 185000, 2580000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 5, 185000, 185000, 3150000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 6, 185000, 185000, 2780000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 185000, 185000, 2850000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 8, 185000, 185000, 2720000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 9, 185000, 185000, 3050000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 185000, 185000, 2680000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 11, 0, 185000, 2450000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 0, 185000, 3200000)
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    actual_tax = EXCLUDED.actual_tax,
    predicted_tax = EXCLUDED.predicted_tax,
    expense = EXCLUDED.expense;

  -- =============================================
  -- 사업자 세금 데이터 (소상공인 기준)
  -- 월평균 매출: 1,000~1,300만원 (통계: 1,224만원)
  -- 경비율: 약 70% (원재료비, 인건비, 임차료 등)
  -- 월 순이익: 약 200~300만원 (통계: 연 2,500만원)
  -- =============================================
  INSERT INTO business_tax_data (user_id, year, month, actual_tax, predicted_tax, income, expense, vat) VALUES
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 245000, 245000, 11500000, 8200000, 330000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 2, 218000, 218000, 10800000, 7900000, 290000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 3, 285000, 285000, 12800000, 8800000, 400000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 198000, 198000, 10200000, 7500000, 270000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 5, 312000, 312000, 13500000, 9200000, 430000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 6, 265000, 265000, 12200000, 8600000, 360000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 278000, 278000, 12500000, 8700000, 380000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 8, 232000, 232000, 11200000, 8100000, 310000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 9, 295000, 295000, 13000000, 8900000, 410000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 258000, 258000, 12000000, 8500000, 350000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 11, 0, 275000, 12400000, 8600000, 380000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 0, 320000, 14200000, 9500000, 470000)
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    actual_tax = EXCLUDED.actual_tax,
    predicted_tax = EXCLUDED.predicted_tax,
    income = EXCLUDED.income,
    expense = EXCLUDED.expense,
    vat = EXCLUDED.vat;

  -- 사용자 챌린지 진행상황
  INSERT INTO user_challenges (user_id, challenge_id, progress, status)
  SELECT p_user_id, c.id,
    CASE
      WHEN c.title = '식비 15% 절감' THEN 58
      WHEN c.title = '영수증 25개 등록' THEN 18
      WHEN c.title = '예산 준수왕' THEN 72
      WHEN c.title = '커뮤니티 참여' THEN 4
      WHEN c.title = '첫 영수증 등록' THEN 1
      WHEN c.title = '5일 연속 출석' THEN 5
      WHEN c.title = '예산 첫 설정' THEN 1
      WHEN c.title = '절약 챌린저' THEN 185000
      WHEN c.title = '공제 탐험가' THEN 2
      WHEN c.title = '세금 건강 80점' THEN 72
      ELSE 0
    END,
    CASE
      WHEN c.title IN ('첫 영수증 등록', '5일 연속 출석', '예산 첫 설정') THEN 'completed'
      ELSE 'active'
    END
  FROM challenges c
  ON CONFLICT (user_id, challenge_id) DO UPDATE SET progress = EXCLUDED.progress, status = EXCLUDED.status;

  -- 출석 기록 (최근 7일)
  INSERT INTO attendance (user_id, date, points_earned) VALUES
    (p_user_id, CURRENT_DATE - INTERVAL '6 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '5 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '4 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '3 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '2 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '1 day', 50),
    (p_user_id, CURRENT_DATE, 50)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- 리워드 교환 내역
  INSERT INTO reward_history (user_id, reward_name, points_used, status) VALUES
    (p_user_id, '카카오톡 이모티콘', 300, 'delivered'),
    (p_user_id, '5일 연속 출석 보상', -150, 'delivered')
  ON CONFLICT DO NOTHING;

  -- 사용자 프로필 업데이트 (현실적인 데이터)
  UPDATE profiles SET
    name = '김민수',
    level = 8,
    current_exp = 1850,
    exp_to_next_level = 2500,
    badges = ARRAY['첫걸음', '출석왕', '절약러'],
    points = 1580,
    rank = 2341,
    streak = 5,
    total_saved = 385000,
    tax_health_score = 72,
    is_premium = FALSE,
    user_type = 'individual'
  WHERE id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 사용법:
-- 1. Supabase에서 테스트 사용자 생성 (이메일/비밀번호)
-- 2. auth.users에서 해당 사용자의 UUID 확인
-- 3. 아래 명령어 실행:
--    SELECT seed_user_data('사용자-UUID-여기에-입력');
-- =============================================

-- 완료 메시지
SELECT 'FINA_R 현실적 시드 데이터 준비 완료! (2024 통계 기반)' as message;
