-- =============================================
-- 금융사별 더미 거래내역 테이블
-- 개발자가 Supabase 대시보드에서 쉽게 관리 가능
-- =============================================

-- 1. 금융사별 더미 거래내역 템플릿 테이블
CREATE TABLE IF NOT EXISTS bank_dummy_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,           -- 금융사 이름 (신한카드, 국민은행 등)
  merchant TEXT NOT NULL,            -- 가맹점명
  category TEXT NOT NULL,            -- 카테고리 (식비, 쇼핑, 교통 등)
  amount INTEGER NOT NULL,           -- 금액 (양수: 지출, 음수: 수입)
  description TEXT,                  -- 설명 (선택)
  is_active BOOLEAN DEFAULT TRUE,    -- 활성화 여부
  sort_order INTEGER DEFAULT 0,      -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가 (은행명으로 빠르게 검색)
CREATE INDEX IF NOT EXISTS idx_bank_dummy_transactions_bank
ON bank_dummy_transactions(bank_name);

-- RLS 정책: 모든 사용자가 조회 가능 (관리자만 수정 가능하게 하려면 별도 설정)
ALTER TABLE bank_dummy_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dummy transactions"
ON bank_dummy_transactions FOR SELECT USING (true);

-- =============================================
-- 초기 더미 데이터 삽입
-- =============================================

-- 신한카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('신한카드', '스타벅스 강남점', '식비', 6500, 1),
('신한카드', '쿠팡', '쇼핑', 45000, 2),
('신한카드', 'GS25 역삼점', '식비', 3200, 3),
('신한카드', '네이버페이', '쇼핑', 28000, 4),
('신한카드', '카카오택시', '교통', 12500, 5);

-- 국민카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('국민카드', '이마트 성수점', '식비', 87000, 1),
('국민카드', '올리브영', '쇼핑', 32000, 2),
('국민카드', '맥도날드', '식비', 8900, 3),
('국민카드', '서울메트로', '교통', 1500, 4),
('국민카드', '다이소', '쇼핑', 15000, 5);

-- 삼성카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('삼성카드', '배달의민족', '식비', 24000, 1),
('삼성카드', '넷플릭스', '문화', 17000, 2),
('삼성카드', 'SKT', '통신', 65000, 3),
('삼성카드', '쏘카', '교통', 35000, 4),
('삼성카드', 'YES24', '문화', 18000, 5);

-- 현대카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('현대카드', '코스트코', '식비', 156000, 1),
('현대카드', '나이키', '쇼핑', 129000, 2),
('현대카드', '애플스토어', '쇼핑', 99000, 3),
('현대카드', '멜론', '문화', 10900, 4),
('현대카드', '주유소', '교통', 70000, 5);

-- 롯데카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('롯데카드', '롯데마트', '식비', 95000, 1),
('롯데카드', '롯데백화점', '쇼핑', 180000, 2),
('롯데카드', 'CGV', '문화', 15000, 3),
('롯데카드', '롯데리아', '식비', 9800, 4);

-- 하나카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('하나카드', '홈플러스', '식비', 72000, 1),
('하나카드', '무신사', '쇼핑', 89000, 2),
('하나카드', '왓챠', '문화', 12900, 3),
('하나카드', 'KT', '통신', 55000, 4);

-- 우리카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('우리카드', '신세계백화점', '쇼핑', 250000, 1),
('우리카드', '요기요', '식비', 32000, 2),
('우리카드', '메가박스', '문화', 14000, 3);

-- BC카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('BC카드', '11번가', '쇼핑', 67000, 1),
('BC카드', '도미노피자', '식비', 29000, 2),
('BC카드', '교보문고', '문화', 23000, 3);

-- NH카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('NH카드', '하나로마트', '식비', 58000, 1),
('NH카드', 'CU', '식비', 4500, 2),
('NH카드', '농협주유소', '교통', 65000, 3);

-- 국민은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('국민은행', '월세이체', '주거', 600000, 1),
('국민은행', '관리비', '주거', 150000, 2),
('국민은행', '보험료', '금융', 120000, 3),
('국민은행', '인터넷요금', '통신', 33000, 4);

-- 신한은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('신한은행', '급여입금', '수입', -3500000, 1),
('신한은행', '적금이체', '저축', 500000, 2),
('신한은행', '공과금', '주거', 85000, 3),
('신한은행', '국민연금', '금융', 200000, 4);

-- 하나은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('하나은행', '학원비', '교육', 200000, 1),
('하나은행', '헬스장', '건강', 90000, 2),
('하나은행', '병원비', '의료', 35000, 3),
('하나은행', '약국', '의료', 12000, 4);

-- 우리은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('우리은행', '대출이자', '금융', 230000, 1),
('우리은행', '카드대금', '금융', 450000, 2),
('우리은행', '이체수수료', '금융', 500, 3);

-- NH농협은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('NH농협은행', '적금이체', '저축', 300000, 1),
('NH농협은행', '농산물직거래', '식비', 45000, 2),
('NH농협은행', '농협보험', '금융', 80000, 3);

-- 카카오뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('카카오뱅크', '용돈이체', '기타', 200000, 1),
('카카오뱅크', '정기적금', '저축', 100000, 2),
('카카오뱅크', '카카오페이', '쇼핑', 15000, 3);

-- 토스뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('토스뱅크', '토스페이', '쇼핑', 25000, 1),
('토스뱅크', '목표저금', '저축', 50000, 2),
('토스뱅크', '송금', '기타', 100000, 3);

-- 케이뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('케이뱅크', '자유적금', '저축', 200000, 1),
('케이뱅크', '체크카드결제', '쇼핑', 35000, 2);

-- =============================================
-- 기본 거래내역 (매칭 안 되는 금융사용)
-- =============================================
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('기본', '편의점', '식비', 5000, 1),
('기본', '카페', '식비', 4500, 2),
('기본', '마트', '식비', 35000, 3),
('기본', '온라인쇼핑', '쇼핑', 25000, 4),
('기본', '대중교통', '교통', 3000, 5);

-- 완료 메시지
SELECT '금융사별 더미 거래내역 테이블 생성 및 데이터 삽입 완료!' as message;
