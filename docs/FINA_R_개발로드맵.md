# FINA_R 개발 로드맵

> 개인/소상공인을 위한 스마트 세금 관리 앱
> 최종 업데이트: 2025-11-25 v3.5 (세금예측 실제 로직 연동 및 UI 개선)

---

## 전체 진행률

```
Phase 1 (MVP)     ████████████████████ 100%  ✅ 완료
Phase 2 (핵심)    ████████████████████ 100%  ✅ 완료
Phase 3 (고급)    ██████████░░░░░░░░░░  50%  🔄 진행중
Phase 4 (확장)    ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ 대기
```

---

## Phase 1: MVP (최소 기능 제품) ✅ 완료

### 목표
기본적인 로그인, 영수증 등록, 예산 관리, 세금 계산 기능 구현

### 완료된 기능

| 기능 | 파일 | 상태 | 설명 |
|------|------|:----:|------|
| Supabase 설정 | `src/lib/supabase.js` | ✅ | 클라이언트 초기화, 환경변수 설정 |
| DB 스키마 | `supabase/schema.sql` | ✅ | 13개 테이블, RLS 정책, 트리거 |
| 추가 테이블 | `supabase/migrations/001_additional_tables.sql` | ✅ | 11개 추가 테이블 (리워드, 미션, 이벤트 등) |
| 시드 데이터 | `supabase/seed.sql` | ✅ | 더미 데이터 및 사용자별 시딩 함수 |
| 이메일 인증 | `src/services/supabaseApi.js` | ✅ | 회원가입, 로그인, 로그아웃 |
| 카카오 OAuth | `src/services/supabaseApi.js` | ✅ | 소셜 로그인 연동 |
| OCR 영수증 인식 | `src/services/ocrService.js` | ✅ | Tesseract.js 한/영 인식 |
| 세금 계산기 | `src/services/taxCalculator.js` | ✅ | 소득세, 부가세, 공제 계산 |
| API 서비스 | `src/services/supabaseApi.js` | ✅ | 전체 CRUD 연동 (12개 API 모듈) |
| 로그인 화면 | `src/App.jsx` | ✅ | 인증 전 로그인/회원가입 폼 표시 |

### 기술 스택
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **OCR**: Tesseract.js
- **Auth**: 이메일/비밀번호 + 카카오 OAuth
- **Charts**: Recharts

---

## Phase 2: 핵심 기능 강화 ✅ 완료

### 목표
대시보드 시각화, 예산 분석, 챌린지 시스템 완성

### 완료된 기능

| 기능 | 우선순위 | 난이도 | 상태 | 구현 내용 |
|------|:--------:|:------:|:----:|----------|
| 대시보드 차트 (Recharts) | 높음 | 중 | ✅ | AreaChart, BarChart, LineChart, PieChart, RadialBarChart |
| 월별 지출 분석 리포트 | 높음 | 중 | ✅ | 최근 6개월 지출 추이 AreaChart |
| 카테고리별 예산 vs 실제 비교 | 높음 | 낮음 | ✅ | 수평 막대 차트 + 절약/초과 요약 카드 |
| 챌린지 진행 상황 트래킹 | 중간 | 중 | ✅ | 파이 차트 + 통계 카드 (진행중/완료/평균진행률/획득포인트) |
| 배지 획득 시스템 | 중간 | 낮음 | ✅ | 12개 배지 갤러리 (획득/미획득 분류, 툴팁) |
| 공제 항목 자동 추천 | 높음 | 높음 | ✅ | AI 기반 맞춤형 공제 추천 (의료비/교육비/주거비/연금) |
| 세금 건강 점수 대시보드 | 중간 | 중 | ✅ | 게이지 차트 + 6개월 추이 + 상세 항목 + 개선 제안 |
| 알림/푸시 기능 | 중간 | 중 | ⏳ | Phase 3로 이동 |

### 설치된 라이브러리
```bash
npm install recharts       # ✅ 차트 라이브러리
npm install date-fns       # ✅ 날짜 처리
npm install react-hot-toast # ✅ 토스트 알림
```

### 주요 구현 상세

#### 1. 예산 관리 (BudgetView)
- **월별 지출 추이**: AreaChart로 최근 6개월 지출 vs 예산 시각화
- **예산 vs 실제 비교**: 수평 BarChart로 카테고리별 비교
- **요약 카드**: 절약 항목, 초과 항목, 예산 달성률
- **예산 슬라이더**: 카테고리별 예산 설정 + 사용률 표시

#### 2. 챌린지 시스템 (ChallengesView)
- **진행 현황 차트**: 파이 차트로 완료/진행중 시각화
- **통계 대시보드**: 진행중, 완료, 평균 진행률, 총 획득 포인트
- **배지 갤러리**: 12개 배지 (시작, 출석, 절약, 챌린지, 세금, 공제, 특별, 커뮤니티)

#### 3. 세금 건강 점수 (DashboardView)
- **게이지 차트**: RadialBarChart로 현재 점수 표시
- **추이 차트**: LineChart로 6개월 점수 변화
- **상세 항목**: 세금 리스크, 증빙 완성도, 환급 가능성, 절세 여력 (v3.3 개선)
- **개선 제안**: 점수 향상을 위한 구체적인 액션 아이템
- **v3.3 NEW**: 캐시노트 방식 참고하여 규칙 기반 점수 산출 로직 적용

#### 4. AI 공제 추천
- **맞춤형 추천**: 현재 공제 사용량 기반 추천
- **항목별 추천**: 의료비, 교육비, 주거비, 연금저축/IRP
- **예상 절세 금액**: 각 항목별 추가 절세 가능 금액 표시

---

## Phase 3: 고급 기능 🔄 진행중

### 목표
AI 인사이트, 자동화, 외부 API 연동

### 구현 상태

| 기능 | 우선순위 | 난이도 | 비용 | 상태 | 구현 내용 |
|------|:--------:|:------:|:----:|:----:|----------|
| PDF 리포트 생성 | 중간 | 중 | 무료 | ✅ | jsPDF + jspdf-autotable (3종 리포트) |
| 엑셀 내보내기 | 중간 | 낮음 | 무료 | ✅ | xlsx + file-saver (4종 내보내기) |
| 연말정산 시뮬레이터 | 높음 | 중 | 무료 | ✅ | 소득세/공제 계산 UI + 결과 분석 |
| **DB 전체 백업 (CSV)** | 중간 | 중 | 무료 | ✅ | Supabase MCP 25개 테이블 CSV 내보내기 |
| **Vercel 배포** | 높음 | 중 | 무료 | ✅ | Vite 빌드 설정, vercel.json 구성 |
| AI 지출 패턴 분석 | 높음 | 높음 | 유료 | ⏳ | |
| 절세 전략 추천 (GPT 연동) | 높음 | 높음 | 유료 | ⏳ | |
| 은행 계좌 연동 (Plaid/Codat) | 중간 | 높음 | 유료 | ⏳ | |
| 카드사 자동 연동 | 낮음 | 높음 | 유료 | ⏳ | |
| 푸시 알림 (FCM) | 중간 | 중 | 무료 | ⏳ |

### 설치된 라이브러리 (Phase 3)
```bash
npm install jspdf           # ✅ PDF 생성
npm install jspdf-autotable # ✅ PDF 테이블 포맷팅
npm install xlsx            # ✅ 엑셀 파일 생성
npm install file-saver      # ✅ 파일 다운로드 처리
```

### 주요 구현 상세

#### 1. PDF 리포트 생성 (exportService.jsx)
- **월별 지출 리포트**: 지출 내역 테이블 + 요약 통계
- **연말정산 리포트**: 소득/공제/세액 상세 계산 결과
- **세금 건강 리포트**: 건강 점수 + 공제 현황 + 개선 제안
- **안정성 강화**: jsPDF + jspdf-autotable 사용 (영문 출력으로 폰트 이슈 해결)
- **참고**: @react-pdf/renderer 시도 후 폰트 로딩 이슈로 jsPDF로 롤백

#### 2. 엑셀 내보내기 (exportService.jsx)
- **거래내역 내보내기**: 날짜, 금액, 카테고리, 결제수단
- **예산 현황 내보내기**: 카테고리별 예산 vs 실제 비교
- **세금 데이터 내보내기**: 소득/공제 상세 내역
- **전체 데이터 내보내기**: 다중 시트 통합 엑셀
- **Null 안전성**: taxResult, deductionTracker 등 null 체크 강화

#### 3. 연말정산 시뮬레이터 (App.jsx)
- **입력 항목**: 연소득, 부양가족, 배우자, 의료비, 교육비, 연금, IRP, 기부금
- **실시간 계산**: taxCalculator.js 연동
- **결과 표시**: 산출세액, 결정세액, 실효세율, 예상 환급액
- **헤더 버튼**: 빠른 접근용 "연말정산" 버튼

### 외부 API 옵션

| 서비스 | 용도 | 무료 티어 | 비고 |
|--------|------|----------|------|
| OpenAI GPT-4 | AI 분석/추천 | $5 크레딧 | 추천 |
| Anthropic Claude | AI 분석/추천 | 유료만 | 고품질 |
| 국세청 홈택스 API | 세금 데이터 | 무료 | 인증 복잡 |
| Plaid | 계좌 연동 | 100건/월 무료 | 해외 은행만 |
| Codat | 회계 연동 | 제한적 무료 | SME 특화 |

---

## Phase 4: 확장 및 수익화 ⏳ 대기

### 목표
프리미엄 기능, 다중 플랫폼, 수익 모델 구축

### 구현 예정 기능

| 기능 | 우선순위 | 예상 난이도 | 상태 |
|------|:--------:|:----------:|:----:|
| 프리미엄 구독 (Stripe) | 높음 | 중 | ⏳ |
| 세무사 연결 마켓플레이스 | 중간 | 높음 | ⏳ |
| 모바일 앱 (React Native) | 높음 | 높음 | ⏳ |
| 다국어 지원 (i18n) | 낮음 | 낮음 | ⏳ |
| 팀/가족 계정 공유 | 중간 | 중 | ⏳ |
| API 제공 (개발자용) | 낮음 | 중 | ⏳ |

### 수익 모델 옵션
1. **프리미엄 구독**: 월 9,900원 / 년 99,000원
2. **광고 기반**: 무료 사용자에게 광고 노출
3. **세무사 연결 수수료**: 거래당 수수료
4. **데이터 분석 리포트**: 유료 상세 분석

---

## 프로젝트 구조

```
fina_r/
├── src/
│   ├── components/         # UI 컴포넌트
│   ├── lib/
│   │   └── supabase.js     # ✅ Supabase 클라이언트
│   ├── services/
│   │   ├── supabaseApi.js  # ✅ API 서비스 (18개 모듈)
│   │   ├── ocrService.js   # ✅ OCR 서비스 (Tesseract.js)
│   │   ├── taxCalculator.js # ✅ 세금 계산기
│   │   └── exportService.jsx # ✅ PDF/Excel 내보내기 (jsPDF + xlsx)
│   ├── App.jsx             # ✅ 메인 앱 (연말정산 시뮬레이터 포함)
│   └── main.jsx
├── supabase/
│   ├── schema.sql          # ✅ 기본 DB 스키마
│   ├── migrations/
│   │   ├── 001_additional_tables.sql  # ✅ 추가 테이블 (11개)
│   │   └── 002_bank_dummy_transactions.sql  # ✅ 금융사별 더미 거래내역
│   └── seed.sql            # ✅ 시드 데이터
├── .env                    # ✅ 환경변수
└── package.json
```

---

## 데이터베이스 테이블

### 기본 테이블 (Phase 1)

| 테이블 | 용도 | RLS |
|--------|------|:---:|
| `profiles` | 사용자 프로필 | ✅ |
| `receipts` | 영수증/거래내역 | ✅ |
| `linked_accounts` | 연결된 계좌 | ✅ |
| `budgets` | 카테고리별 예산 | ✅ |
| `challenges` | 챌린지 목록 | ✅ |
| `user_challenges` | 사용자별 진행상황 | ✅ |
| `deduction_tracker` | 공제 항목 추적 | ✅ |
| `ai_insights` | AI 인사이트 | ✅ |
| `notifications` | 알림 | ✅ |
| `attendance` | 출석 기록 | ✅ |
| `reward_history` | 리워드 내역 | ✅ |
| `individual_tax_data` | 개인 세금 데이터 | ✅ |
| `business_tax_data` | 사업자 세금 데이터 | ✅ |

### 추가 테이블 (마이그레이션)

| 테이블 | 용도 | RLS |
|--------|------|:---:|
| `rewards` | 리워드 상품 목록 | ✅ |
| `missions` | 미션 템플릿 | ✅ |
| `user_missions` | 사용자별 미션 진행 | ✅ |
| `events` | 이벤트 목록 | ✅ |
| `user_events` | 사용자별 이벤트 진행 | ✅ |
| `available_banks` | 은행/카드사 목록 | ✅ |
| `document_folders` | 문서 공간 | ✅ |
| `community_posts` | 커뮤니티 게시물 | ✅ |
| `tax_experts` | 세금 전문가 | ✅ |
| `financial_products` | 금융 상품 | ✅ |
| `notification_center` | 상세 알림 센터 | ✅ |
| `bank_dummy_transactions` | 금융사별 더미 거래내역 | ✅ |

---

## 실행 방법

```bash
# 개발 서버 실행
cd C:\git\fina_r
npm run dev

# 빌드
npm run build

# JSON Server (더미 데이터용)
npm run server

# 전체 실행 (dev + server)
npm run dev:full
```

---

## 환경 변수 (.env)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_KAKAO_JS_KEY=your_kakao_js_key
VITE_KAKAO_REST_KEY=your_kakao_rest_key
```

> ⚠️ 실제 키는 `.env` 파일에만 저장하고 절대 커밋하지 마세요.

---

## 다음 단계 추천

### 완료된 항목 (Phase 3) ✅
1. ~~**PDF 리포트 생성**~~ - jsPDF + jspdf-autotable 사용 ✅
2. ~~**엑셀 내보내기**~~ - xlsx + file-saver 사용 ✅
3. ~~**연말정산 시뮬레이터**~~ - taxCalculator.js 연동 ✅
4. ~~**DB 전체 백업**~~ - Supabase MCP로 25개 테이블 CSV 내보내기 ✅
5. ~~**Vercel 배포**~~ - Vite 빌드 + vercel.json 구성 완료 ✅

### 즉시 시작 가능 (Phase 3 나머지)
1. **푸시 알림 (FCM)** - Firebase Cloud Messaging 설정

### 준비 필요 (Phase 3 고급)
1. **OpenAI API 키 발급** → AI 지출 패턴 분석
2. **절세 전략 추천 연동** → GPT API 연동
3. **홈택스 API 검토** → 세금 데이터 연동

### Phase 4 준비 사항
1. **Stripe 계정 생성** → 프리미엄 구독 결제
2. **React Native 환경 설정** → 모바일 앱 개발

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2025-11-21 | 1.0 | Phase 1 완료 - MVP 기능 구현 |
| 2025-11-22 | 2.0 | Phase 2 완료 - 핵심 기능 강화 |
| 2025-11-22 | 2.5 | Phase 3 시작 - PDF/Excel 내보내기, 연말정산 시뮬레이터 구현 (38%) |
| 2025-11-22 | 2.6 | 시드 데이터 정리 - 동적 날짜/연도, 스키마 일치, 버그 수정 |
| 2025-11-23 | 2.7 | Phase 3 진행률 검증 - exportService.js(500줄) 완료 확인, 연말정산 시뮬레이터 구현 확인 |
| 2025-11-23 | 2.8 | 금융사별 더미 거래내역 테이블 분리 |
| 2025-11-23 | 2.9 | Supabase 전체 데이터 CSV 백업 - 25개 테이블 (receipts 199건) → Desktop/fina_r_DB/ |
| 2025-11-23 | 3.0 | Vercel 배포 완료 - Vite 빌드 설정, vercel.json 구성, 프로덕션 배포 |
| 2025-11-24 | 3.1 | OCR/PDF 서비스 안정화 - OCR: Tesseract.js 전환, PDF: jsPDF 롤백(@react-pdf/renderer 폰트 이슈), Excel: null 안전성 강화, exportService.js→jsx 변경 |
| 2025-11-24 | 3.2 | 더미 데이터 현실화 - 2024 통계 기반 현실적인 금액 적용 (db.json, seed.sql, bank_dummy_transactions.sql) |
| 2025-11-25 | 3.3 | Tax Health Score 세부 점수 로직 개선 - 캐시노트 방식 참고하여 규칙 기반 산출 (세금 리스크, 증빙 완성도, 환급 가능성, 절세 여력) |
| 2025-11-25 | 3.4 | 디자인 시스템 색상 업데이트 - Flat Design 팔레트 적용 (Dark Amethyst, Neon Ice, Gold, Spring Green) |
| 2025-11-25 | **3.5** | **세금예측 실제 로직 연동 및 UI 개선** - 세금예측 탭 실제 계산 로직 연동, 사업 현금흐름 차트 개선, 금액 오른쪽 정렬 통일 |

---

## 세금예측 실제 로직 연동 및 UI 개선 (2025-11-25) 🆕

### 세금예측 탭 실제 계산 로직 연동

기존 DB 더미 데이터 대신 실제 세금 계산 로직(`taxCalculator.js`)을 연동하여 사용자의 영수증/소득 데이터 기반으로 월별 세금을 예측합니다.

#### 구현 내용 (`calculatedTaxData` useMemo)

| 항목 | 설명 |
|------|------|
| 월별 소득 패턴 | 한국 직장인 기준 (1월 성과급 +15%, 6월 상여 +10%, 12월 연말 보너스 +20%) |
| 영수증 그룹화 | 월별/카테고리별 자동 분류 |
| 공제 적용 세금 | `calculateIndividualTax()` 또는 `calculateBusinessTax()` 사용 |
| 공제 미적용 세금 | 비교용 (절감액 계산) |
| 누적 세금 | 월별 누적 합계 |

#### 월별 세금 차트 개선 (복합형)

| 요소 | 설명 |
|------|------|
| 막대 (Bar) | 실제 납부 세금 (1~현재월) + 예상 세금 (현재월+1~12월) |
| 라인 (Line) | 누적 세금 추이 |
| 점선 (Dashed) | 공제 미적용 시 세금 (비교용) |
| 기준선 (ReferenceLine) | 현재 월 표시 |

### 사업 현금 흐름 차트 개선

| 변경 전 | 변경 후 |
|---------|---------|
| 수입/지출 두 막대 (촘촘함) | 순이익(수입-지출) 단일 막대 |
| CHART_COLORS.green/red | 테마 색상 (Navy 흑자, Peach 적자) |
| 기본 Legend | 커스텀 범례 + 0선 기준선 |

### 금액 오른쪽 정렬 통일

앱 전체에서 금액/숫자 표시를 오른쪽 정렬로 통일했습니다.

| 영역 | 적용 |
|------|------|
| 대시보드 요약 카드 | 예상 환급액, 공제 가능 총액, D-day |
| 지출 요약 카드 | 총 지출, 절감액, 배지, 포인트 |
| 계좌 카드 | 월 지출, 거래 건수 |
| 거래 목록 | 금액, VAT |
| 세금예측 요약 카드 | 납부 완료, 예상 납부, 연간 총 예상, 절감액 |
| 연말정산 시뮬레이터 | 모든 결과 금액 |

**적용 클래스**: `text-right tabular-nums`

### 기타 UI 개선

- 예상 환급액 소수점 제거 (`Math.round()` 적용)
- 사업자 데이터에 `noDeductionTax`, `savings` 필드 추가
- 사업자도 "경비공제 미적용" 라인 차트에 표시

---

## 디자인 시스템 색상 업데이트 (2025-11-25)

### 배경
기존 기본 Tailwind 색상에서 브랜드 아이덴티티를 강화하기 위한 커스텀 색상 팔레트로 전환했습니다.
Flat Design 원칙에 따라 그라디언트 최소화, 적당한 라운딩, 최소한의 그림자를 적용했습니다.

### 새로운 색상 팔레트

| 색상명 | HEX | 용도 |
|--------|-----|------|
| **Dark Amethyst** | `#360F56` | 주요 텍스트, 헤더, 다크모드 배경 |
| **Neon Ice** | `#50FFEE` | 특정 탭 테마, 상태 표시, 설정 |
| **Gold** | `#FFD700` | 가장 중요한 CTA, 강조 아이콘 (남발 금지) |
| **Spring Green** | `#00FF7F` | 긍정/성공 상태, 수입/자산 관리 |
| **Azure Blue** | `#0066FF` | 확인 버튼, 링크, 활성화 상태 |

### 탭별 테마 색상

| 탭 | 색상 | 용도 |
|----|------|------|
| 홈/대시보드 | Azure Blue | 기본 정보 표시 |
| 지출/예산 | Dark Amethyst | 지출 관리 |
| 수입/자산 | Spring Green | 긍정적 지표 |
| 설정/기타 | Neon Ice | 보조 기능 |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/App.css` | CSS 변수 정의 (`--theme-primary` 등), Tailwind 유틸리티 오버라이드 |
| `tailwind.config.js` | 커스텀 색상 팔레트, 시맨틱 색상, 타이포그래피 설정 |
| `src/App.jsx` | 컴포넌트에 새 색상 클래스 적용 |

### CSS 변수 체계

```css
:root {
  --theme-primary: #360f56;    /* Dark Amethyst */
  --theme-secondary: #50ffee;  /* Neon Ice */
  --theme-accent: #ffd700;     /* Gold */
  --theme-positive: #00ff7f;   /* Spring Green */
  --theme-soft: rgba(54, 15, 86, 0.08);
}
```

---

## Tax Health Score 세부 점수 로직 개선 (2025-11-25)

### 배경
기존 Tax Health Score 세부 항목(세금 리스크, 증빙 완성도, 환급 가능성, 절세 여력)이 단순히 전체 점수에 상수를 더하거나 빼는 방식으로 하드코딩되어 있었습니다. 캐시노트의 택스 스코어 산출 방식을 참고하여 **규칙 기반 + 정규화 + 업종 보정** 로직으로 개선했습니다.

### 참고한 캐시노트 방식

| 단계 | 내용 |
|------|------|
| 1단계 | 데이터 수집/정규화 (z-score 기반 이상점수) |
| 2단계 | 국세청 룰 기반 이상징후 점수 계산 |
| 3단계 | 머신러닝 모델로 위험확률 산출 (우리는 규칙 기반으로 대체) |
| 4단계 | 업종/규모 보정값 적용 |

### 구현된 4가지 세부 점수

#### 1. 세금 리스크 (Tax Risk Score) - 100점 만점
> 높을수록 리스크 낮음 (안전)

| 규칙 | 감점 | 조건 |
|------|------|------|
| 증빙 누락 | -10점/카테고리 (최대 -30) | 50만원당 증빙 1개 미만 (국세청 권장) |
| 공제 한도 초과 | -10점/항목 (최대 -20) | current > max |
| 업종 평균 이탈 | 최대 -15 | 공제율이 업종 평균 대비 50%+ 차이 |
| 미검증 거래 | -15 | 검증 안 된 거래 존재 |
| 마감일 임박 | -5~-10 | 30일 이내 & 증빙 미비 |
| **보정** | +5 | 저소득자 (연 3천만원 미만) |

#### 2. 증빙 완성도 (Documentation Score) - 100점 만점
> 카테고리별 필요 서류 대비 실제 업로드 비율

```
점수 = (업로드된 서류 / 필요 서류) × 80
     + 기본서류 보너스 (10)
     + OCR 검증 보너스 (10)

필요 서류 = 공제금액 50만원당 1개 (국세청 권장 기준)
```

#### 3. 환급 가능성 (Refund Potential Score) - 100점 만점
> 기납부세액 대비 예상 결정세액 비교

```
점수 = 환급률 × 50 + 공제활용률 × 30 + 증빙점수 × 20
환급액 = 기납부세액 - 예상결정세액

* 기납부세액 미입력시 소득의 10%로 추정
```

#### 4. 절세 여력 (Savings Potential Score) - 100점 만점
> 아직 사용하지 않은 공제 한도 기반 (높을수록 절세 기회 많음)

```
점수 = (미사용 공제한도 / 전체 공제한도) × 100
     × 소득구간 보정 (저소득자 +10%)

* 한계세율 적용하여 실제 절세 가능 금액도 함께 계산
```

### 업종별 표준 지표 (국세청 기준 참고)

| 유형 | 평균 공제율 | 평균 증빙율 |
|------|------------|------------|
| 개인 근로소득자 | 15% | 70% |
| 프리랜서 | 25% | 60% |
| 일반 사업자 | 30% | 80% |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/services/taxCalculator.js` | 4개 세부 점수 계산 함수 추가 + 통합 함수 (`calculateDetailedTaxHealthScores`) |
| `src/App.jsx` | 하드코딩된 점수 제거, `calculateDetailedTaxHealthScores` 호출로 교체, 툴팁 추가 |

### 주요 변경점 (이전 → 이후)

```javascript
// 이전: 하드코딩
{ name: '세금 리스크', score: taxHealthScore + 7 }
{ name: '증빙 완성도', score: taxHealthScore - 13 }
{ name: '환급 가능성', score: taxHealthScore + 4 }
{ name: '절세 여력', score: taxHealthScore - 8 }

// 이후: 규칙 기반 계산
{ name: '세금 리스크', score: detailedTaxHealthScores.taxRisk.score }
{ name: '증빙 완성도', score: detailedTaxHealthScores.documentation.score }
{ name: '환급 가능성', score: detailedTaxHealthScores.refundPotential.score }
{ name: '절세 여력', score: detailedTaxHealthScores.savingsPotential.score }
```

---

## 더미 데이터 현실화 (2025-11-24)

### 배경
기존 더미 데이터의 금액이 너무 극단적이거나 비현실적이어서 차트나 표가 부자연스러웠습니다.
웹 검색을 통해 2024년 실제 통계를 수집하고 이를 반영하여 더미 데이터를 현실화했습니다.

### 참고한 통계 출처

| 출처 | 내용 | URL |
|------|------|-----|
| 통계청 가계동향조사 2024 | 가구당 월평균 지출 289만원, 카테고리별 비율 | [korea.kr](https://www.korea.kr/news/policyNewsView.do?newsId=156676437) |
| Hypebeast 한국 근로자 임금 | 평균 월급 353~373만원 | [hypebeast.kr](https://hypebeast.kr/2024/2/the-average-salary-of-korean-workers) |
| KCCI 소상공인 매출 현황 | 월 평균 매출 1,224만원, 연 순이익 2,500만원 | [kcci.kr](https://www.kcci.kr/notification/?bmode=view&idx=100767279) |
| 한국경제인협회 자영업자 조사 | 자영업자 평균 수익 구조 | [fki.or.kr](https://www.fki.or.kr) |

### 적용된 2024 통계 기준

#### 직장인 기준
| 항목 | 기준값 | 설명 |
|------|--------|------|
| 평균 월급 | 333~373만원 | 한국 근로자 평균 |
| 연봉 기준 | 4,000만원 | 시뮬레이션 기준값 |
| 월 실수령액 | 약 285만원 | 세후 기준 |
| 월 원천징수 | 약 18.5만원 | 소득세+지방소득세 |
| 월 평균 지출 | 289만원 | 2인 이상 가구 기준 |

#### 소상공인 기준
| 항목 | 기준값 | 설명 |
|------|--------|------|
| 월 평균 매출 | 1,000~1,300만원 | 소규모 사업장 |
| 경비율 | 약 70% | 업종별 평균 |
| 연 순이익 | 약 2,500만원 | 자영업자 평균 |
| 월 순수익 | 200~400만원 | 매출-경비 |

#### 카테고리별 월 평균 지출 (2024 통계청)
| 카테고리 | 금액 | 비중 |
|----------|------|------|
| 음식/외식 | 45.5만원 | 15.5% |
| 식료품 | 41.2만원 | 14.3% |
| 교통 | 32.2만원 | 11.6% |
| 의료/건강 | 26.8만원 | 9.2% |
| 문화/여가 | 21.5만원 | 7.4% |
| 교육 | 18.1만원 | 6.3% |
| 통신 | 12.6만원 | 4.4% |
| 주거/수도/광열 | 15.6만원 | 5.4% |

#### 현실적인 거래 금액 기준
| 항목 | 금액 범위 | 적용 예시 |
|------|----------|----------|
| 커피 | 5,000~6,500원 | 스타벅스, 이디야 |
| 편의점 | 5,000~12,000원 | GS25, CU |
| 마트/식료품 | 40,000~80,000원 | 이마트, 홈플러스 |
| 배달/외식 | 15,000~30,000원 | 배달의민족, 요기요 |
| 택시 | 10,000~20,000원 | 카카오T |
| 영화 | 14,000~16,000원 | CGV, 메가박스 |
| 통신비 | 48,000~65,000원 | KT, LG U+ |
| 월세 | 50~80만원 | 서울 원룸 기준 |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `db.json` | 전체 더미 데이터 금액 현실화 (예산, 거래내역, 세금 데이터) |
| `supabase/seed.sql` | 개인/사업자 세금 데이터, 예산, 영수증 금액 현실화 |
| `supabase/migrations/002_bank_dummy_transactions.sql` | 금융사별 거래 금액 현실화 |

### 주요 변경 예시

#### 예산 설정 (이전 → 이후)
```
식비:      300,000원 → 450,000원
식료품:    250,000원 → 400,000원
교통:      150,000원 → 320,000원
의료:      100,000원 → 250,000원
문화/여가:  80,000원 → 200,000원
```

#### 개인 세금 데이터 (이전 → 이후)
```
월 지출:    1,200,000원 → 2,480,000원
월 세금:      150,000원 →   185,000원
연봉 기준:  3,600만원 → 4,000만원
```

#### 사업자 세금 데이터 (이전 → 이후)
```
월 매출:    8,500,000원 → 10,000,000~13,500,000원
경비율:          60% →            70%
부가세:      300,000원 →     700,000~1,000,000원
```

---

## 시드 데이터 수정 내역 (2025-11-22)

### 수정된 버그

| 파일 | 문제 | 해결 |
|------|------|------|
| `App.jsx:1595` | `account.monthlySpent.toLocaleString()` undefined 에러 | `(account.monthlySpent \|\| 0).toLocaleString()` |
| `App.jsx:1599` | `account.transactionCount` undefined | `account.transactionCount \|\| 0` |
| `App.jsx:1711-1712` | `transaction.amount/tax` undefined | null 체크 추가 |
| `seed.sql` | `reward_history` 컬럼명 오류 (`reward_type` → `reward_name`) | 스키마와 일치하도록 수정 |

### 동적 날짜/연도 적용

기존 하드코딩된 날짜를 `CURRENT_DATE` 기준으로 변경하여 시드 데이터가 항상 최신 상태로 유지됨

| 항목 | 이전 (하드코딩) | 수정 후 (동적) |
|------|----------------|----------------|
| 영수증 날짜 | `'2025-11-22'` | `CURRENT_DATE - INTERVAL 'N days'` |
| 예산 월 | `'2025-11'` | `TO_CHAR(CURRENT_DATE, 'YYYY-MM')` |
| 이벤트 마감일 | `'2025-11-30'` | `TO_CHAR(CURRENT_DATE + INTERVAL...)` |
| 세금 데이터 연도 | `2025` | `EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER` |
| 공제 추적 연도 | `2025` | `EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER` |
| 문서 폴더 날짜 | `'2025-11-22'` | `CURRENT_DATE` |
| AI 인사이트 마감일 | `'2025-12-31'` | `DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year - 1 day'` |

### 시드 데이터 적용 방법

```sql
-- 1. Supabase SQL Editor에서 seed.sql 전체 실행 (공용 데이터 삽입)

-- 2. 특정 사용자에게 더미 데이터 삽입
SELECT seed_user_data('사용자-UUID-여기에-입력');

-- 예시:
SELECT seed_user_data('49d3468c-f19d-4d4e-84fe-c37fbab4be6b');
```

---

## 참고 링크

- [Supabase Dashboard](https://supabase.com/dashboard)
- [카카오 개발자 콘솔](https://developers.kakao.com)
- [Tesseract.js 문서](https://tesseract.projectnaptha.com/)
- [Recharts 문서](https://recharts.org/)
- [jsPDF 문서](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- [SheetJS (xlsx) 문서](https://docs.sheetjs.com/)
- [한국 소득세율표](https://www.nts.go.kr)

---

*Generated by Claude Code - 2025-11-25 (v3.5)*
