# FINA_R - 스마트 세금 & 재무 관리 플랫폼

## 프로젝트 개요

**FINA_R**은 개인 및 사업자를 위한 종합 재무 관리 플랫폼입니다. 영수증 관리, 예산 추적, 세금 계산, 연말정산 지원 등 다양한 기능을 제공하며, 게이미피케이션 요소를 통해 사용자의 재무 관리 습관 형성을 돕습니다.

### 주요 특징
- OCR 기반 영수증 자동 인식
- 한국 세법 기반 정확한 세금 계산
- 실시간 예산 추적 및 알림
- 게이미피케이션 (챌린지, 미션, 리워드)
- PDF/Excel 리포트 내보내기

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.2.0 | UI 라이브러리 |
| Vite | 5.0.8 | 빌드 도구 |
| Tailwind CSS | 3.4.0 | 스타일링 |
| Recharts | 2.10.4 | 데이터 시각화 |
| Lucide React | 0.303.0 | 아이콘 |

### Backend & Database
| 기술 | 용도 |
|------|------|
| Supabase | 백엔드 서비스 (인증, DB, API) |
| PostgreSQL | 데이터베이스 (Supabase 제공) |

### 주요 라이브러리
| 라이브러리 | 용도 |
|------------|------|
| Tesseract.js | 영수증 OCR 처리 |
| jsPDF | PDF 리포트 생성 |
| xlsx | Excel 파일 내보내기 |
| date-fns | 날짜 처리 |
| react-hot-toast | 알림 토스트 |

### 배포
- **플랫폼**: Vercel
- **빌드 출력**: `dist/`

---

## 프로젝트 구조

```
fina_r/
├── src/
│   ├── App.jsx              # 메인 애플리케이션 컴포넌트
│   ├── main.jsx             # 엔트리 포인트 (ToastProvider 포함)
│   ├── index.css            # 전역 스타일
│   ├── components/
│   │   ├── views/           # View 컴포넌트
│   │   │   ├── DashboardView.jsx
│   │   │   ├── BudgetView.jsx
│   │   │   ├── TaxPredictionView.jsx
│   │   │   ├── ReceiptsView.jsx
│   │   │   ├── BenefitsView.jsx
│   │   │   └── ChallengesView.jsx
│   │   └── common/
│   │       └── ToastContainer.jsx  # Toast UI
│   ├── context/
│   │   ├── ToastContext.jsx   # Toast 상태 관리
│   │   └── AuthContext.jsx    # 인증 Context
│   ├── hooks/
│   │   ├── useAuth.js         # 인증 로직 훅
│   │   └── useChallengesData.js # Challenges 지연 로드
│   ├── utils/
│   │   └── apiWrapper.js      # API 래퍼 유틸리티
│   ├── constants/
│   │   └── colors.js          # 색상 시스템
│   ├── lib/
│   │   └── supabase.js        # Supabase 클라이언트 설정
│   └── services/
│       ├── supabaseApi.js     # Supabase API 서비스
│       ├── taxCalculator.js   # 세금 계산 로직
│       ├── ocrService.js      # OCR 영수증 처리
│       └── exportService.jsx  # PDF/Excel 내보내기
├── supabase/                  # Supabase 설정/마이그레이션
├── public/                    # 정적 파일
├── dist/                      # 빌드 출력
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json                # Vercel 배포 설정
```

---

## 핵심 기능

### 1. 영수증 관리
- **OCR 스캔**: Tesseract.js를 사용한 영수증 이미지 텍스트 추출
- **자동 카테고리 분류**: 키워드 기반 지출 카테고리 자동 분류
- **수동 입력**: 직접 영수증 정보 입력
- **거래 내역 조회**: 날짜/카테고리/금융사별 필터링

**지원 카테고리**: 식비, 편의점, 마트/식료품, 생활용품, 교통, 문화/여가, 도서/교육, 의료, 쇼핑, 기타

### 2. 예산 관리
- 카테고리별 월별 예산 설정
- 실시간 예산 소진율 추적
- 예산 초과 알림

### 3. 세금 계산 (taxCalculator.js)

#### 개인 (근로소득자)
- 2024년 기준 소득세율표 적용
- 근로소득공제 계산
- 인적공제 (본인, 배우자, 부양가족)
- 특별공제 (보험료, 의료비, 교육비, 기부금, 연금저축)
- 세액공제 계산
- 지방소득세 (소득세의 10%)

#### 사업자
- 종합소득세 계산
- 부가가치세 계산 (일반/간이과세자)
- 분기별 예상 세금

**세율 구간 (2024년 기준)**:
| 과세표준 | 세율 | 누진공제 |
|----------|------|----------|
| ~1,400만원 | 6% | - |
| ~5,000만원 | 15% | 126만원 |
| ~8,800만원 | 24% | 576만원 |
| ~1.5억원 | 35% | 1,544만원 |
| ~3억원 | 38% | 1,994만원 |
| ~5억원 | 40% | 2,594만원 |
| ~10억원 | 42% | 3,594만원 |
| 10억원~ | 45% | 6,594만원 |

### 4. 연말정산 지원
- 공제 항목별 현황 추적
- Tax Health Score (세금 건강 점수)
- 예상 환급액/추가납부액 계산
- AI 기반 절세 인사이트

### 5. 게이미피케이션

#### 챌린지
- 절약 챌린지, 영수증 수집 등
- 난이도별 리워드 차등 지급

#### 미션
- **일일 미션**: 출석체크, 영수증 등록 등
- **주간 미션**: 예산 준수, 특정 카테고리 절약 등

#### 리워드
- 포인트 적립 시스템
- 기프티콘, 커피쿠폰 등 교환
- 레벨/랭킹 시스템

### 6. 금융 연동
- 은행/카드사 계좌 연결 (시뮬레이션)
- 자동 거래 내역 동기화 (더미 데이터)

### 7. 리포트 내보내기

#### PDF 리포트
- 월별 지출 리포트
- 연말정산 예상 리포트
- Tax Health 리포트

#### Excel 내보내기
- 거래 내역
- 예산 현황
- 세금 데이터
- 종합 데이터

### 8. 커뮤니티
- 세금/재무 관련 Q&A
- 세무 전문가 상담 연결

---

## 데이터베이스 구조 (Supabase)

### 주요 테이블

```
profiles              # 사용자 프로필 (레벨, 포인트, 뱃지 등)
receipts              # 영수증/거래 내역
budgets               # 예산 설정
linked_accounts       # 연결된 금융 계좌
challenges            # 챌린지 목록
user_challenges       # 사용자별 챌린지 진행상황
deduction_tracker     # 공제 항목 추적
ai_insights           # AI 인사이트
notifications         # 알림
attendance            # 출석체크
reward_history        # 리워드 교환 내역
individual_tax_data   # 개인 세금 데이터
business_tax_data     # 사업자 세금 데이터
rewards               # 리워드 상품
missions              # 미션 목록
user_missions         # 사용자별 미션 진행상황
events                # 이벤트
user_events           # 사용자별 이벤트 참여
available_banks       # 연동 가능 금융사 목록
document_folders      # 문서 폴더
community_posts       # 커뮤니티 게시물
tax_experts           # 세무 전문가
financial_products    # 금융 상품 추천
notification_center   # 알림 센터
```

### 테이블 관계
- 모든 사용자 관련 테이블은 `profiles.id`를 외래키로 참조
- `profiles`는 Supabase Auth의 `auth.users`와 연결
- Row Level Security (RLS) 활성화됨

---

## 인증 시스템

### 지원 방식
1. **이메일/비밀번호**: 일반 회원가입/로그인
2. **카카오 OAuth**: 소셜 로그인

### 인증 흐름
```
1. 사용자 회원가입 → auth.users 생성
2. 트리거 → profiles 테이블에 기본 프로필 생성
3. 로그인 시 세션 발급
4. 클라이언트에서 세션 토큰으로 API 호출
```

---

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 개발 서버 + JSON Server (목업 API)
npm run dev:full

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 환경 변수 (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## API 서비스 구조

### supabaseApi.js 모듈

| API 모듈 | 기능 |
|----------|------|
| `authAPI` | 인증 (회원가입, 로그인, 로그아웃) |
| `receiptsAPI` | 영수증 CRUD |
| `budgetsAPI` | 예산 관리 |
| `accountsAPI` | 금융 계좌 연동 |
| `challengesAPI` | 챌린지 관리 |
| `deductionAPI` | 공제 항목 추적 |
| `insightsAPI` | AI 인사이트 |
| `notificationsAPI` | 알림 |
| `attendanceAPI` | 출석체크 |
| `rewardsAPI` | 리워드 교환 |
| `taxAPI` | 세금 계산 |
| `missionsAPI` | 미션 관리 |
| `eventsAPI` | 이벤트 |
| `communityAPI` | 커뮤니티 |
| `leaderboardAPI` | 랭킹 |
| `gamificationAPI` | 게이미피케이션 통합 |

---

## 주요 화면 (탭)

1. **Dashboard**: 종합 대시보드, 지출 요약, 예산 현황
2. **Receipts**: 영수증 목록, OCR 스캔, 수동 입력
3. **Budget**: 카테고리별 예산 설정 및 현황
4. **Tax**: 세금 계산기, 연말정산 시뮬레이터
5. **Deductions**: 공제 항목 추적, Tax Health Score
6. **Gamification**: 챌린지, 미션, 리워드, 랭킹
7. **Community**: Q&A, 전문가 상담
8. **Reports**: PDF/Excel 리포트 생성

---

## 배포

### Vercel 배포 설정 (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "installCommand": "npm install",
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ]
}
```

### 배포 URL
- Production: `https://fina-r.vercel.app` (예상)

---

## 향후 개선 사항

### 기능 개선
- [ ] 실제 금융 API 연동 (오픈뱅킹)
- [ ] 실시간 환율/주가 연동
- [ ] 가계부 자동 분석 AI
- [ ] 모바일 앱 개발 (React Native)

### 기술 개선
- [ ] TypeScript 마이그레이션
- [ ] 테스트 코드 작성 (Jest, Cypress)
- [ ] 상태 관리 라이브러리 도입 (Zustand/Redux)
- [x] 컴포넌트 분리 및 모듈화 (v3.6 View 분리, v3.7 훅 분리)
- [x] Toast 에러 알림 시스템 (v3.7)
- [x] Custom Hooks 도입 (useAuth, useChallengesData)
- [ ] supabaseApi.js 도메인별 분리 (선택적)

### 보안 강화
- [ ] 민감 정보 암호화
- [ ] 2FA (이중 인증)
- [ ] API Rate Limiting

---

## 라이선스

Private Project - All Rights Reserved

---

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
