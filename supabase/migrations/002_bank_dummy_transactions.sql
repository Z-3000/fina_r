-- =============================================
-- 금융사별 더미 거래내역 테이블
-- 2024 통계 기반 현실적인 금액 적용
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

-- RLS 정책: 모든 사용자가 조회 가능
ALTER TABLE bank_dummy_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view dummy transactions"
ON bank_dummy_transactions FOR SELECT USING (true);

-- =============================================
-- 초기 더미 데이터 삽입 (2024 통계 기반 현실적 금액)
-- 커피: 5,000~6,500원
-- 편의점: 5,000~12,000원
-- 마트/식료품: 40,000~80,000원
-- 외식/배달: 15,000~30,000원
-- 교통(택시): 10,000~20,000원
-- 영화: 14,000~16,000원
-- 통신비: 50,000~65,000원
-- 월세: 50~80만원 (서울 원룸 기준)
-- =============================================

-- 신한카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('신한카드', '스타벅스 강남점', '식비', 6500, 1),
('신한카드', '쿠팡', '쇼핑', 35000, 2),
('신한카드', 'GS25 역삼점', '편의점', 8500, 3),
('신한카드', '배달의민족', '식비', 22000, 4),
('신한카드', '카카오T 택시', '교통', 15500, 5);

-- 국민카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('국민카드', '이마트 성수점', '식료품', 67000, 1),
('국민카드', '올리브영', '생활용품', 28000, 2),
('국민카드', '맘스터치', '식비', 8500, 3),
('국민카드', '지하철 교통카드', '교통', 2800, 4),
('국민카드', '다이소', '생활용품', 12500, 5);

-- 삼성카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('삼성카드', '요기요', '식비', 24500, 1),
('삼성카드', '넷플릭스', '문화/여가', 17000, 2),
('삼성카드', 'KT 통신비', '통신', 52000, 3),
('삼성카드', '쏘카', '교통', 28000, 4),
('삼성카드', '교보문고', '도서/교육', 18500, 5);

-- 현대카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('현대카드', '홈플러스', '식료품', 72000, 1),
('현대카드', '무신사', '의류', 45000, 2),
('현대카드', '이디야커피', '식비', 4500, 3),
('현대카드', '유튜브 프리미엄', '문화/여가', 14900, 4),
('현대카드', 'SK주유소', '교통', 65000, 5);

-- 롯데카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('롯데카드', '롯데마트', '식료품', 58000, 1),
('롯데카드', '11번가', '쇼핑', 42000, 2),
('롯데카드', 'CGV', '문화/여가', 15000, 3),
('롯데카드', '버거킹', '식비', 9800, 4);

-- 하나카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('하나카드', '코스트코', '식료품', 85000, 1),
('하나카드', '지그재그', '의류', 38000, 2),
('하나카드', '웨이브', '문화/여가', 7900, 3),
('하나카드', 'LG U+', '통신', 48000, 4);

-- 우리카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('우리카드', '하이마트', '쇼핑', 89000, 1),
('우리카드', '쿠팡이츠', '식비', 28000, 2),
('우리카드', '메가박스', '문화/여가', 14000, 3);

-- BC카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('BC카드', '마켓컬리', '식료품', 52000, 1),
('BC카드', '도미노피자', '식비', 25000, 2),
('BC카드', '알라딘', '도서/교육', 19500, 3);

-- NH카드
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('NH카드', '하나로마트', '식료품', 48000, 1),
('NH카드', 'CU편의점', '편의점', 6500, 2),
('NH카드', '농협주유소', '교통', 62000, 3);

-- 국민은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('국민은행', '월세이체', '주거', 600000, 1),
('국민은행', '관리비', '주거', 120000, 2),
('국민은행', '보험료', '금융', 85000, 3),
('국민은행', '인터넷요금', '통신', 28000, 4);

-- 신한은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('신한은행', '급여입금', '수입', -3300000, 1),
('신한은행', '적금이체', '저축', 300000, 2),
('신한은행', '전기요금', '주거', 35000, 3),
('신한은행', '국민연금', '금융', 150000, 4);

-- 하나은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('하나은행', '영어학원', '도서/교육', 180000, 1),
('하나은행', '헬스장', '건강', 65000, 2),
('하나은행', '병원 진료', '의료', 35000, 3),
('하나은행', '약국', '의료', 8500, 4);

-- 우리은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('우리은행', '대출이자', '금융', 185000, 1),
('우리은행', '카드대금', '금융', 380000, 2),
('우리은행', '가스요금', '주거', 25000, 3);

-- NH농협은행
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('NH농협은행', '적금이체', '저축', 200000, 1),
('NH농협은행', '농산물직거래', '식료품', 32000, 2),
('NH농협은행', '보험료', '금융', 65000, 3);

-- 카카오뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('카카오뱅크', '이체', '기타', 100000, 1),
('카카오뱅크', '26주적금', '저축', 50000, 2),
('카카오뱅크', '카카오페이', '쇼핑', 18000, 3);

-- 토스뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('토스뱅크', '토스페이', '쇼핑', 22000, 1),
('토스뱅크', '목표저금', '저축', 100000, 2),
('토스뱅크', '친구송금', '기타', 50000, 3);

-- 케이뱅크
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('케이뱅크', '자유적금', '저축', 150000, 1),
('케이뱅크', '체크카드결제', '쇼핑', 28000, 2);

-- =============================================
-- 기본 거래내역 (매칭 안 되는 금융사용)
-- =============================================
INSERT INTO bank_dummy_transactions (bank_name, merchant, category, amount, sort_order) VALUES
('기본', '편의점', '편의점', 7500, 1),
('기본', '카페', '식비', 5500, 2),
('기본', '마트', '식료품', 45000, 3),
('기본', '온라인쇼핑', '쇼핑', 32000, 4),
('기본', '대중교통', '교통', 2800, 5);

-- 완료 메시지
SELECT '금융사별 더미 거래내역 테이블 생성 완료 (2024 통계 기반)!' as message;
