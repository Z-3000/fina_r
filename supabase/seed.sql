-- =============================================
-- FINA_R 시드 데이터 (풍성한 버전)
-- 테스트/시연용 더미 데이터
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
  ('영수증 3개 등록하기', '오늘 영수증 3개를 등록하세요', 3, 50, 'daily'),
  ('영수증 5개 등록하기', '오늘 영수증 5개를 등록하세요', 5, 80, 'daily'),
  ('예산 점검하기', '예산 현황을 확인하세요', 1, 30, 'daily'),
  ('금융 상품 둘러보기', '추천 금융 상품을 확인하세요', 1, 20, 'daily'),
  ('출석 체크하기', '오늘 앱에 로그인하세요', 1, 10, 'daily'),
  -- 주간 미션
  ('영수증 20개 등록', '이번 주 영수증 20개를 등록하세요', 20, 300, 'weekly'),
  ('영수증 30개 등록', '이번 주 영수증 30개를 등록하세요', 30, 500, 'weekly'),
  ('예산 초과 0회', '일주일 동안 예산을 초과하지 마세요', 7, 500, 'weekly'),
  ('커뮤니티 질문 3회', '커뮤니티에 질문 3개를 작성하세요', 3, 200, 'weekly'),
  ('5일 연속 출석', '5일 연속으로 출석하세요', 5, 250, 'weekly'),
  -- 월간 미션
  ('영수증 100개 등록', '이번 달 영수증 100개를 등록하세요', 100, 1500, 'monthly'),
  ('예산 목표 달성', '모든 카테고리 예산 목표를 달성하세요', 7, 2000, 'monthly')
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. 챌린지
-- =============================================
INSERT INTO challenges (title, description, target, reward, badge, difficulty, days_left) VALUES
  ('식비 20% 절감', '지난달 대비 식비 20% 절약하기', 100, 300, '🍽️', 'medium', 25),
  ('영수증 30개 등록', '이번 달 영수증 30개 등록하기', 30, 150, '📝', 'easy', 20),
  ('예산 준수 완벽왕', '한 달 동안 모든 카테고리 예산 지키기', 100, 500, '👑', 'hard', 25),
  ('커뮤니티 활동가', '질문 5개 작성하고 답변 10개 달기', 15, 250, '💬', 'medium', 15),
  ('첫 영수증 등록', '첫 번째 영수증을 등록하세요', 1, 100, '🎉', 'easy', 30),
  ('7일 연속 출석', '7일 연속으로 출석하세요', 7, 200, '🔥', 'easy', 7),
  ('예산 첫 설정', '첫 번째 예산을 설정하세요', 1, 50, '💰', 'easy', 30),
  ('절약 마스터', '이번 달 총 50만원 절약하기', 500000, 1000, '💎', 'hard', 25),
  ('공제 탐험가', '새로운 공제 항목 3개 발견하기', 3, 400, '🔍', 'medium', 30),
  ('세금 건강 90점', '세금 건강 점수 90점 달성하기', 90, 800, '🏆', 'hard', 30)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. 이벤트 (날짜를 동적으로 설정)
-- =============================================
INSERT INTO events (title, description, end_date, reward, type, target) VALUES
  ('신규 가입 이벤트', '7일 연속 출석하면 스타벅스 쿠폰 증정!', TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD'), '스타벅스 아메리카노', 'attendance', 7),
  ('이달의 절약왕 챌린지', '이번 달 가장 많이 절약한 Top 100에게 추가 포인트!', TO_CHAR((DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE, 'YYYY-MM-DD'), '1,000P ~ 10,000P', 'competition', NULL),
  ('친구 초대 이벤트', '친구 1명 초대 시 양쪽 모두 500P 지급', '상시', '500P', 'referral', NULL),
  ('연말정산 준비 이벤트', '공제 항목 5개 이상 등록 시 추가 포인트', TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD'), '1,000P', 'promotion', 5),
  ('영수증 왕 챌린지', '이번 달 영수증 100개 이상 등록자 추첨', TO_CHAR((DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE, 'YYYY-MM-DD'), '카카오페이 5만원', 'competition', 100)
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
  ('김세무', '세무사', 4.9, 284, ARRAY['프리랜서', '소상공인', '부가세 신고'], 50000, 15, '👨‍💼'),
  ('이회계', '공인회계사', 4.8, 192, ARRAY['종합소득세', '법인세', '재무컨설팅'], 80000, 12, '👩‍💼'),
  ('박세무', '세무사', 4.7, 156, ARRAY['연말정산', '의료비공제', '월세공제'], 45000, 8, '👨‍💼'),
  ('최회계', '공인회계사', 4.9, 321, ARRAY['스타트업', '법인전환', '투자유치'], 100000, 20, '👩‍💼'),
  ('정세무', '세무사', 4.6, 98, ARRAY['유튜버', '인플루언서', '해외소득'], 55000, 6, '👨‍💼'),
  ('한회계', '공인회계사', 4.8, 167, ARRAY['부동산', '양도소득세', '상속세'], 90000, 18, '👩‍💼')
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. 금융 상품
-- =============================================
INSERT INTO financial_products (type, name, provider, rating, benefit, match_score, icon, expected_savings) VALUES
  ('card', '비즈니스 플러스 카드', '신한카드', 4.7, '사무용품 5% 캐시백', 95, '💳', 45000),
  ('card', '연말정산 올인원 카드', '현대카드', 4.6, '의료/교육/교통 공제 최적화', 92, '💳', 120000),
  ('card', '간편결제 적립 카드', 'KB국민카드', 4.5, '온라인 결제 2% 적립', 88, '💳', 35000),
  ('card', '교통비 절약 카드', '롯데카드', 4.4, '대중교통 10% 할인', 85, '💳', 28000),
  ('loan', '사업자 신용대출', 'KB국민은행', 4.5, '연 3.5% 저금리', 88, '🏦', 500000),
  ('loan', '소상공인 특별대출', '신한은행', 4.6, '연 3.2% + 보증료 면제', 90, '🏦', 650000),
  ('savings', '세금우대 적금', '카카오뱅크', 4.8, '연 4.5% 금리 + 세금우대', 85, '🏦', 80000),
  ('savings', '목표달성 적금', '토스뱅크', 4.7, '연 4.8% + 우대금리', 82, '🏦', 95000),
  ('insurance', '세액공제 연금보험', '삼성생명', 4.5, '연 400만원 한도 세액공제', 80, '🛡️', 660000),
  ('insurance', '소득공제 보장보험', '한화생명', 4.3, '연 100만원 한도 소득공제', 75, '🛡️', 165000)
ON CONFLICT DO NOTHING;

-- =============================================
-- 8. 커뮤니티 게시물
-- =============================================
INSERT INTO community_posts (author_name, title, content, answers_count, likes_count) VALUES
  ('익명의 프리랜서', '프리랜서 종소세 신고 시 업무용 태블릿 구매 비용 공제 가능한가요?', '업무용으로 태블릿을 구매했는데 경비처리가 가능한지 궁금합니다.', 12, 34),
  ('절약왕김씨', '1인 가구 월 50만원으로 생활 가능할까요?', '고정비 제외하고 변동비만 50만원으로 생활하려고 합니다.', 28, 67),
  ('세금초보', '연말정산 간소화 서비스 언제부터 이용 가능한가요?', '올해 처음 연말정산하는데 간소화 서비스 이용 시기가 궁금합니다.', 8, 23),
  ('사업시작', '개인사업자 부가세 신고 기한이 언제인가요?', '7월에 사업을 시작했는데 부가세 신고를 언제까지 해야 하나요?', 15, 41),
  ('직장인A', '연봉 5천만원 연말정산 환급 예상액이 궁금해요', '올해 연봉이 5천만원인데 대략 얼마정도 환급받을 수 있을까요?', 22, 89),
  ('신혼부부', '맞벌이 부부 연말정산 어떻게 하면 유리한가요?', '둘 다 직장인인데 부양가족 공제를 누가 받아야 할까요?', 31, 112),
  ('투잡러', '부업 소득 300만원도 신고해야 하나요?', '직장 외에 부업으로 연간 300만원 정도 버는데 신고 대상인가요?', 19, 56),
  ('창업예정자', '법인 설립 vs 개인사업자 어떤 게 유리할까요?', '연매출 1억 예상되는데 어떤 형태가 세금 측면에서 유리할까요?', 45, 156),
  ('주식초보', '주식 매매 수익도 세금 내야 하나요?', '올해 주식으로 500만원 정도 수익이 났는데 세금 납부 대상인지요?', 17, 48),
  ('부동산고민', '전세 vs 월세 세금 혜택 차이가 있나요?', '이사를 앞두고 있는데 세금 혜택 측면에서 뭐가 나을까요?', 24, 73)
ON CONFLICT DO NOTHING;

-- =============================================
-- 테스트용 함수: 특정 사용자에게 더미 데이터 삽입
-- 날짜는 CURRENT_DATE 기준으로 동적 생성
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

  -- 영수증 데이터 (50+ 건, 최근 3개월) - 동적 날짜 사용
  INSERT INTO receipts (user_id, date, merchant, category, amount, tax, type) VALUES
    -- 이번 달 데이터 (최근)
    (p_user_id, CURRENT_DATE, '스타벅스 강남점', '식비', 6500, 650, 'auto'),
    (p_user_id, CURRENT_DATE, 'GS25 역삼역점', '편의점', 12800, 1280, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '1 day', '이마트 트레이더스', '식료품', 156000, 15600, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '1 day', '카카오T 택시', '교통', 18500, 1850, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '2 days', 'CGV 용산아이파크몰', '문화/여가', 32000, 3200, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '2 days', '올리브영 선릉점', '생활용품', 45600, 4560, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '3 days', '교보문고 강남점', '도서/교육', 38900, 3890, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '3 days', '맘스터치 역삼점', '식비', 8900, 890, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '4 days', 'CU편의점 강남점', '편의점', 8500, 850, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '4 days', '스타벅스 역삼점', '식비', 14800, 1480, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '5 days', '이마트 성수점', '식료품', 89000, 8900, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '5 days', '지하철 교통', '교통', 2800, 0, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '6 days', '넷플릭스', '문화/여가', 17000, 1700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '6 days', '쿠팡 생필품', '생활용품', 34500, 3450, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '7 days', '삼성병원 진료', '의료', 35000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '7 days', '약국 약값', '의료', 12000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '8 days', '배달의민족 치킨', '식비', 23000, 2300, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '8 days', 'GS25 역삼점', '편의점', 6200, 620, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '9 days', '무신사 옷구매', '의류', 89000, 8900, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '9 days', '다이소', '생활용품', 15000, 1500, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '10 days', 'SK 주유소', '교통', 80000, 8000, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '10 days', '세차장', '교통', 15000, 1500, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '11 days', '롯데마트', '식료품', 67000, 6700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '11 days', 'KT 통신비', '통신', 59000, 5900, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '12 days', '스포츠센터 월회비', '건강', 99000, 9900, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '13 days', '유튜브 프리미엄', '문화/여가', 14900, 1490, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '14 days', '점심 식사', '식비', 12000, 1200, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '15 days', '커피빈', '식비', 7500, 750, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '16 days', '다이소 문구', '생활용품', 8500, 850, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '17 days', '영어학원 수강료', '도서/교육', 350000, 35000, 'manual'),
    -- 지난 달 데이터
    (p_user_id, CURRENT_DATE - INTERVAL '25 days', '스타벅스 판교점', '식비', 13500, 1350, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '28 days', '이마트 판교점', '식료품', 143000, 14300, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '30 days', '네이버 쇼핑', '생활용품', 56000, 5600, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '33 days', '병원 건강검진', '의료', 150000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '35 days', '영화관 CGV', '문화/여가', 28000, 2800, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '38 days', 'KTX 출장비', '교통', 98000, 9800, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '41 days', '온라인 강의', '도서/교육', 199000, 19900, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '43 days', '코스트코', '식료품', 234000, 23400, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '45 days', '치과 치료', '의료', 85000, 0, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '48 days', '주유소', '교통', 75000, 7500, 'auto'),
    -- 2달 전 데이터
    (p_user_id, CURRENT_DATE - INTERVAL '55 days', '선물 세트', '기타', 120000, 12000, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '58 days', '이마트', '식료품', 167000, 16700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '63 days', '안경점 안경구매', '의료', 250000, 25000, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '68 days', 'KT 통신비', '통신', 59000, 5900, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '71 days', '생일파티 식사', '식비', 180000, 18000, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '73 days', '헬스장 PT', '건강', 500000, 50000, 'manual'),
    (p_user_id, CURRENT_DATE - INTERVAL '75 days', '넷플릭스', '문화/여가', 17000, 1700, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '78 days', '버스/지하철', '교통', 45000, 0, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '80 days', '마트 장보기', '식료품', 89000, 8900, 'auto'),
    (p_user_id, CURRENT_DATE - INTERVAL '83 days', '월세', '주거', 800000, 0, 'auto')
  ON CONFLICT DO NOTHING;

  -- 예산 데이터 (3개월분) - 동적 월 사용
  INSERT INTO budgets (user_id, category, amount, month) VALUES
    -- 이번 달
    (p_user_id, '식비', 400000, v_current_month),
    (p_user_id, '교통', 150000, v_current_month),
    (p_user_id, '생활용품', 150000, v_current_month),
    (p_user_id, '문화/여가', 200000, v_current_month),
    (p_user_id, '도서/교육', 200000, v_current_month),
    (p_user_id, '의료', 100000, v_current_month),
    (p_user_id, '통신', 70000, v_current_month),
    (p_user_id, '건강', 150000, v_current_month),
    (p_user_id, '의류', 100000, v_current_month),
    (p_user_id, '기타', 100000, v_current_month),
    -- 지난 달
    (p_user_id, '식비', 400000, v_last_month),
    (p_user_id, '교통', 150000, v_last_month),
    (p_user_id, '생활용품', 150000, v_last_month),
    (p_user_id, '문화/여가', 200000, v_last_month),
    (p_user_id, '도서/교육', 200000, v_last_month),
    (p_user_id, '의료', 100000, v_last_month),
    -- 2달 전
    (p_user_id, '식비', 350000, v_two_months_ago),
    (p_user_id, '교통', 120000, v_two_months_ago),
    (p_user_id, '생활용품', 100000, v_two_months_ago),
    (p_user_id, '문화/여가', 150000, v_two_months_ago),
    (p_user_id, '도서/교육', 150000, v_two_months_ago),
    (p_user_id, '의료', 100000, v_two_months_ago)
  ON CONFLICT (user_id, category, month) DO UPDATE SET amount = EXCLUDED.amount;

  -- 연결된 계좌 (더 풍성하게)
  INSERT INTO linked_accounts (user_id, type, bank, name, last_digits, color, icon, monthly_spent, transaction_count) VALUES
    (p_user_id, 'credit', '신한카드', '신한 Deep Dream', '1234', '#0046FF', '💳', 1856000, 67),
    (p_user_id, 'credit', 'KB국민카드', 'KB 탄탄대로', '5678', '#FFB300', '💳', 1234000, 45),
    (p_user_id, 'credit', '현대카드', '현대 M포인트', '9012', '#8B00FF', '💳', 567800, 23),
    (p_user_id, 'debit', '카카오뱅크', '입출금 통장', '3456', '#FFCD00', '🏦', 892000, 56),
    (p_user_id, 'debit', '토스뱅크', '토스 통장', '7890', '#0064FF', '🏦', 234000, 18)
  ON CONFLICT DO NOTHING;

  -- 공제 항목 추적 (현실적인 데이터) - 동적 연도 사용
  INSERT INTO deduction_tracker (user_id, category, name, current_amount, threshold, max_deduction, deduction_rate, potential_saving, documents_count, year) VALUES
    (p_user_id, 'medical', '의료비', 2350000, 1875000, 7000000, 0.15, 352500, 18, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'education', '교육비', 2150000, 0, 3000000, 0.15, 322500, 12, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'housing', '월세', 9600000, 0, 7500000, 0.12, 900000, 12, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'donation', '기부금', 850000, 0, 10000000, 0.15, 127500, 5, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'pension', '연금저축', 3200000, 0, 4000000, 0.15, 480000, 12, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'credit_card', '신용카드', 18500000, 6250000, 3000000, 0.15, 450000, 67, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'debit_card', '체크카드', 5600000, 0, 3000000, 0.30, 1680000, 56, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (p_user_id, 'insurance', '보장성보험', 1200000, 0, 1000000, 0.12, 120000, 12, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
  ON CONFLICT (user_id, category, year) DO UPDATE SET
    current_amount = EXCLUDED.current_amount,
    potential_saving = EXCLUDED.potential_saving,
    documents_count = EXCLUDED.documents_count;

  -- AI 인사이트 (풍성하게) - 동적 날짜 사용
  INSERT INTO ai_insights (user_id, type, category, title, description, potential_saving, current_amount, threshold, action, deadline, priority) VALUES
    (p_user_id, 'critical', 'pension', '연금저축 한도 달성 임박!', '현재 연금저축 320만원. 80만원 추가 납입 시 연간 세액공제 48만원 → 60만원으로 증가', 120000, 3200000, 4000000, '연금저축 추가 납입하기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'high'),
    (p_user_id, 'opportunity', 'irp', 'IRP 계좌 미개설 상태', 'IRP 계좌 개설 후 연 300만원 추가 납입 시 최대 49.5만원 세액공제 가능', 495000, 0, 3000000, 'IRP 계좌 개설하기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'high'),
    (p_user_id, 'warning', 'card', '신용카드 공제 최적화 필요', '현재 신용카드 비중 77%. 체크카드로 전환 시 공제율 15%→30%로 증가하여 추가 절세 가능', 450000, NULL, NULL, '카드 사용 전략 보기', NULL, 'high'),
    (p_user_id, 'achievement', 'housing', '월세 공제 100% 달성!', '월세 납부 증빙 12건 자동 수집 완료. 최대 공제액(750만원) 달성', 0, 9600000, 7500000, '증빙 서류 확인', NULL, 'low'),
    (p_user_id, 'opportunity', 'education', '교육비 공제 여유 있음', '교육비 공제 한도(300만원) 중 28% 미사용. 자격증/어학 강의 수강 시 추가 공제 가능', 127500, 2150000, 3000000, '교육비 활용 팁 보기', (DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE, 'medium'),
    (p_user_id, 'info', 'donation', '기부금 공제 현황', '올해 기부금 85만원 사용. 추가 기부 시 15% 세액공제 가능 (한도: 소득의 30%)', 0, 850000, NULL, '기부처 추천 보기', NULL, 'low')
  ON CONFLICT DO NOTHING;

  -- 알림 센터
  INSERT INTO notification_center (user_id, type, title, message, timestamp_text, priority, is_read) VALUES
    (p_user_id, 'ai_insight', '연금저축 납입 마감 임박', '12월 31일까지 80만원 추가 납입하면 12만원 추가 절세!', '방금 전', 'high', FALSE),
    (p_user_id, 'ai_insight', 'IRP 계좌 개설 추천', 'IRP 계좌 개설하고 최대 49.5만원 절세하세요', '5분 전', 'high', FALSE),
    (p_user_id, 'document', '의료비 영수증 3건 자동 수집', '삼성병원 진료비 영수증이 자동으로 정리되었습니다', '30분 전', 'medium', FALSE),
    (p_user_id, 'deadline', '연말정산 D-40', '공제 항목 점검하고 절세 기회 놓치지 마세요', '1시간 전', 'medium', TRUE),
    (p_user_id, 'achievement', '레벨 15 달성!', '축하합니다! 750 포인트를 획득했습니다', '2시간 전', 'low', TRUE),
    (p_user_id, 'system', '11월 지출 리포트 생성', '이번 달 지출 분석 리포트가 준비되었습니다', '3시간 전', 'medium', TRUE)
  ON CONFLICT DO NOTHING;

  -- 알림 (notifications 테이블)
  INSERT INTO notifications (user_id, type, title, message, icon, priority) VALUES
    (p_user_id, 'savings', '커피 절약 팁!', 'KB국민카드 커피전문점 10% 할인 혜택 활용하세요', '☕', 'high'),
    (p_user_id, 'alert', '식비 예산 85% 도달', '이번 달 식비가 예산의 85%에 도달했습니다', '🍴', 'medium'),
    (p_user_id, 'tax', '연말정산 예상 환급액', '예상 환급액 약 127만원! 공제 항목 더 확인해보세요', '📋', 'high'),
    (p_user_id, 'tip', '체크카드 사용 추천', '신용카드 공제 한도 초과! 체크카드로 전환하세요', '💳', 'medium')
  ON CONFLICT DO NOTHING;

  -- 문서 폴더 (풍성하게) - 동적 날짜 사용
  INSERT INTO document_folders (user_id, folder_type, folder_name, document_count, last_updated) VALUES
    -- 연말정산
    (p_user_id, 'yearEnd', '의료비', 18, CURRENT_DATE),
    (p_user_id, 'yearEnd', '교육비', 12, CURRENT_DATE - INTERVAL '2 days'),
    (p_user_id, 'yearEnd', '기부금', 5, CURRENT_DATE - INTERVAL '7 days'),
    (p_user_id, 'yearEnd', '신용카드', 67, CURRENT_DATE),
    (p_user_id, 'yearEnd', '체크카드', 56, CURRENT_DATE),
    (p_user_id, 'yearEnd', '월세', 12, CURRENT_DATE - INTERVAL '21 days'),
    (p_user_id, 'yearEnd', '보험료', 12, CURRENT_DATE - INTERVAL '12 days'),
    (p_user_id, 'yearEnd', '연금저축', 12, CURRENT_DATE - INTERVAL '7 days'),
    -- 종합소득세
    (p_user_id, 'comprehensiveTax', '사업소득', 24, CURRENT_DATE),
    (p_user_id, 'comprehensiveTax', '경비증빙', 45, CURRENT_DATE),
    (p_user_id, 'comprehensiveTax', '매입세액', 18, CURRENT_DATE - INTERVAL '2 days'),
    (p_user_id, 'comprehensiveTax', '인건비', 12, CURRENT_DATE - INTERVAL '7 days'),
    -- 부가가치세
    (p_user_id, 'vat', '매출', 36, CURRENT_DATE),
    (p_user_id, 'vat', '매입', 42, CURRENT_DATE),
    (p_user_id, 'vat', '세금계산서', 28, CURRENT_DATE - INTERVAL '2 days')
  ON CONFLICT (user_id, folder_type, folder_name) DO UPDATE SET
    document_count = EXCLUDED.document_count,
    last_updated = EXCLUDED.last_updated;

  -- 개인 세금 데이터 (현실적인 연봉 5000만원 기준) - 동적 연도 사용
  INSERT INTO individual_tax_data (user_id, year, month, actual_tax, predicted_tax, expense) VALUES
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 285000, 285000, 1650000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 2, 285000, 285000, 1420000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 3, 285000, 285000, 1890000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 285000, 285000, 1560000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 5, 285000, 285000, 2100000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 6, 285000, 285000, 1780000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 285000, 285000, 1920000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 8, 285000, 285000, 1650000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 9, 285000, 285000, 2340000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 285000, 285000, 1980000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 11, 0, 285000, 1850000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 0, 285000, 2200000)
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    actual_tax = EXCLUDED.actual_tax,
    predicted_tax = EXCLUDED.predicted_tax,
    expense = EXCLUDED.expense;

  -- 사업자 세금 데이터 (연매출 1.5억 기준) - 동적 연도 사용
  INSERT INTO business_tax_data (user_id, year, month, actual_tax, predicted_tax, income, expense, vat) VALUES
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 1, 980000, 980000, 12500000, 6200000, 620000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 2, 1050000, 1050000, 13200000, 6500000, 650000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 3, 1120000, 1120000, 14500000, 7200000, 720000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 4, 890000, 890000, 11800000, 5800000, 580000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 5, 1200000, 1200000, 15200000, 7500000, 750000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 6, 1080000, 1080000, 13800000, 6800000, 680000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 7, 1150000, 1150000, 14200000, 7000000, 700000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 8, 1250000, 1250000, 15800000, 7800000, 780000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 9, 1180000, 1180000, 14800000, 7300000, 730000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 10, 1320000, 1320000, 16500000, 8200000, 820000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 11, 0, 1280000, 16000000, 7900000, 790000),
    (p_user_id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 0, 1350000, 17000000, 8500000, 850000)
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    actual_tax = EXCLUDED.actual_tax,
    predicted_tax = EXCLUDED.predicted_tax,
    income = EXCLUDED.income,
    expense = EXCLUDED.expense,
    vat = EXCLUDED.vat;

  -- 사용자 챌린지 진행상황 (더 다양하게)
  INSERT INTO user_challenges (user_id, challenge_id, progress, status)
  SELECT p_user_id, c.id,
    CASE
      WHEN c.title = '식비 20% 절감' THEN 78
      WHEN c.title = '영수증 30개 등록' THEN 28
      WHEN c.title = '예산 준수 완벽왕' THEN 92
      WHEN c.title = '커뮤니티 활동가' THEN 9
      WHEN c.title = '첫 영수증 등록' THEN 1
      WHEN c.title = '7일 연속 출석' THEN 7
      WHEN c.title = '예산 첫 설정' THEN 1
      WHEN c.title = '절약 마스터' THEN 385000
      WHEN c.title = '공제 탐험가' THEN 3
      WHEN c.title = '세금 건강 90점' THEN 87
      ELSE 0
    END,
    CASE
      WHEN c.title IN ('첫 영수증 등록', '7일 연속 출석', '예산 첫 설정', '공제 탐험가') THEN 'completed'
      ELSE 'active'
    END
  FROM challenges c
  ON CONFLICT (user_id, challenge_id) DO UPDATE SET progress = EXCLUDED.progress, status = EXCLUDED.status;

  -- 출석 기록 (최근 14일, 일부 누락)
  INSERT INTO attendance (user_id, date, points_earned) VALUES
    (p_user_id, CURRENT_DATE - INTERVAL '13 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '12 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '11 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '10 days', 50),
    (p_user_id, CURRENT_DATE - INTERVAL '9 days', 50),
    -- 8일 전 누락 (연속 출석 끊김)
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
    (p_user_id, '스타벅스 아메리카노', 500, 'delivered'),
    (p_user_id, '주간 미션 완료 보상', -300, 'delivered'),
    (p_user_id, '7일 연속 출석 보상', -350, 'delivered'),
    (p_user_id, '예산 준수 챌린지 보상', -500, 'delivered'),
    (p_user_id, 'GS25 5천원권', 450, 'pending')
  ON CONFLICT DO NOTHING;

  -- 사용자 프로필 업데이트 (풍성한 데이터)
  UPDATE profiles SET
    name = '김머니',
    level = 15,
    current_exp = 3250,
    exp_to_next_level = 4000,
    badges = ARRAY['절약왕', '세금마스터', '챌린지러', '출석왕', '리뷰어', '공제탐험가', '예산달인'],
    points = 4850,
    rank = 89,
    streak = 7,
    total_saved = 2850000,
    tax_health_score = 87,
    is_premium = TRUE,
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
SELECT 'FINA_R 풍성한 시드 데이터 준비 완료! seed_user_data(user_id) 함수로 사용자별 데이터를 삽입하세요.' as message;
