# CLAUDE.md

한국형 스마트 세금/재무 관리 플랫폼 (영수증 OCR, 예산 추적, 세금 계산, 게이미피케이션)

## Project Status

| 항목 | 상태 |
|------|------|
| Phase | Phase 3 (50%) - MVP 완료, 고급 기능 개발 중 |
| Deploy | Production (Vercel) |
| Version | v3.8 (2025-11-28) |

### Current Focus
- 코드 리팩토링: App.jsx 6,621줄 → 5,025줄 (-24%)
- API 모듈화: `services/api/` 12개 모듈 분리 완료
- 세금 계산기: `services/calculators/` 이동 완료

### Known Issues
- App.jsx 여전히 과대 (5,025줄) → Custom Hooks 추출 필요
- taxCalculator.js 모듈화 필요 (1,927줄)

## Tech Stack

```
Frontend   : React 18.2 + Vite 5.0 + Tailwind CSS 3.4
Backend    : Supabase (PostgreSQL + Auth + Edge Functions)
Charts     : Recharts 2.10
Icons      : Lucide React 0.303
OCR        : Tesseract.js 6.0
Export     : jsPDF 3.0 + xlsx 0.18
Date       : date-fns 4.1
```

## Commands

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (Vite)
npm run dev:full     # 개발 서버 + Mock API (port 3001)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run preview      # 빌드 미리보기
```

## Environment

`.env` 필수:
```
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<key>
```

## Project Structure

```
src/
├── App.jsx                     # 메인 앱 (5,025줄)
├── main.jsx                    # 엔트리 (ToastProvider)
├── index.css                   # 전역 스타일
│
├── components/
│   ├── views/                  # 페이지별 뷰 (6개)
│   │   ├── DashboardView.jsx
│   │   ├── BudgetView.jsx
│   │   ├── TaxPredictionView.jsx
│   │   ├── ReceiptsView.jsx
│   │   ├── BenefitsView.jsx
│   │   └── ChallengesView.jsx
│   ├── modals/                 # 모달 컴포넌트 (12개)
│   │   ├── TaxSimulatorModal.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── PDFReportModal.jsx
│   │   └── ...
│   └── common/
│       └── ToastContainer.jsx
│
├── services/
│   ├── api/                    # API 모듈 (12개)
│   │   ├── index.js            # re-export
│   │   ├── apiClient.js        # Supabase 클라이언트 + 에러 핸들링
│   │   ├── auth.js             # authAPI
│   │   ├── receipts.js         # receiptsAPI
│   │   ├── budgets.js          # budgetsAPI
│   │   ├── tax.js              # taxAPI, deductionAPI
│   │   ├── challenges.js       # challengesAPI, missionsAPI
│   │   ├── rewards.js          # rewardsAPI, gamificationAPI
│   │   └── ...
│   ├── calculators/            # 세금 계산 로직
│   │   ├── index.js
│   │   └── taxCalculator.js    # 2025 한국 세법 기반
│   ├── ocr/                    # OCR 파싱 시스템
│   │   ├── core/               # OcrEngine, BaseParser
│   │   ├── parsers/            # Amount, Date, Merchant, Category
│   │   └── utils/              # FuzzyMatcher, Geometry
│   ├── ocrService.js           # Tesseract.js OCR
│   ├── exportService.jsx       # PDF/Excel 내보내기
│   └── insightGenerator.js     # 규칙 기반 AI 인사이트
│
├── constants/
│   ├── colors.js               # 디자인 색상 (SSOT)
│   ├── charts.js               # 차트 색상 팔레트
│   └── businessTaxConstants.js # 사업자 세금 상수
│
├── context/
│   ├── AuthContext.jsx         # 인증 Context
│   ├── ToastContext.jsx        # Toast 상태관리
│   └── AppContext.jsx          # 앱 전역 Context
│
├── hooks/
│   ├── useAuth.js              # 인증 로직 훅
│   └── useChallengesData.js    # Challenges 지연 로드
│
├── utils/
│   ├── formatting.js           # 금액 포맷팅
│   └── apiWrapper.js           # API 래퍼
│
└── lib/
    └── supabase.js             # Supabase 클라이언트
```

## Code Style

### Naming Convention
| Type | Convention | Example |
|------|------------|---------|
| 컴포넌트 | PascalCase | `DashboardView.jsx` |
| 함수/변수 | camelCase | `calculateTax()` |
| 상수 | UPPER_SNAKE_CASE | `TAX_BRACKETS` |
| 파일 | camelCase | `taxCalculator.js` |
| Hook | use + PascalCase | `useAuth.js` |
| API 모듈 | xxxAPI | `receiptsAPI` |

### Import Order
```javascript
// 1. React/외부 라이브러리
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// 2. 내부 컴포넌트
import { DashboardView } from './components/views';

// 3. 서비스/유틸리티
import { receiptsAPI } from './services/api';

// 4. 상수/스타일
import { COLORS } from './constants/colors';
```

### UI/UX 가이드라인
- 언어: 한국어
- 숫자 포맷: `toLocaleString('ko-KR')` + 원
- Toast: `ToastContext` + `react-hot-toast`
- 금액 정렬: `text-right tabular-nums`

## Design System

### Color Palette (`src/constants/colors.js`)
| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Primary (Navy) | `#003262` | 브랜드, 신뢰 | `text-primary` |
| Secondary (Mint) | `#00FFBF` | 성공, 수입 | `bg-secondary` |
| Tertiary (Cyan) | `#0FFFFF` | 정보, 강조 | `text-tertiary` |
| Accent (Peach) | `#FFC591` | 경고, 리워드 | `bg-accent` |

### Chart Colors (`src/constants/charts.js`)
- `CHART_COLORS`: 기본 차트 색상
- `UNIQUE_CHART_COLORS`: 파이 차트용 11가지 고유 색상

## Database

### Key Tables (25개)
- **Core**: `profiles`, `receipts`, `budgets`, `linked_accounts`
- **Tax**: `deduction_tracker`, `individual_tax_data`, `business_tax_data`
- **Gamification**: `challenges`, `user_challenges`, `attendance`, `rewards`, `missions`
- **Others**: `ai_insights`, `notifications`, `community_posts`, `tax_experts`

### Notes
- 모든 테이블에 RLS 활성화
- `profiles.id` → `auth.users` 참조
- 마이그레이션: `supabase/migrations/` (001~004)

## Key Modules

### Tax Calculator (`services/calculators/taxCalculator.js`)
- 2025 한국 세법 기반
- 개인: 소득세, 근로소득공제, 신용카드공제 (3단계 한도)
- 사업자: 종합소득세, 부가세 (일반/간이)
- Tax Health Score: 4가지 세부 점수 (규칙 기반)

### OCR System (`services/ocr/`)
- Tesseract.js 기반 한/영 인식
- 파서: Amount, Date, Merchant, Category, Item
- 자동 카테고리 분류 (FuzzyMatcher)

### API Modules (`services/api/`)
```
authAPI, receiptsAPI, budgetsAPI, accountsAPI,
taxAPI, deductionAPI, challengesAPI, missionsAPI,
rewardsAPI, gamificationAPI, insightsAPI, etc.
```

## Deployment

- Platform: Vercel
- URL: https://fina-r.vercel.app
- Config: `vercel.json`
- Output: `dist/`

## Development Guidelines

### 에러 핸들링
```javascript
// API 호출 시 에러 처리
const failedApis = [];
const withErrorHandling = (promise, name, fallback = []) =>
  promise.catch((error) => {
    failedApis.push(name);
    return fallback;
  });
```

### 지연 로드 패턴
- Challenges 탭: `useChallengesData` 훅으로 탭 선택 시 로드
- 초기 API 호출 최적화: 23개 → 16개

### 리팩토링 우선순위
1. DetailsModal/QuestionModal 핸들러 연결
2. 백업 파일 제거 (`supabaseApi.js.bak`)
3. taxCalculator 세부 모듈화
4. Custom Hooks 추출
5. 잔여 View 컴포넌트화

## Reference Docs

- `docs/FINA_R_개발로드맵.md` - 전체 개발 로드맵
- `docs/REFACTORING.md` - 리팩토링 기록
- `docs/FINA_R_팀원설명서.md` - 비개발자용 설명서
- `docs/하드코딩_DB화_계획.md` - DB 마이그레이션 계획
- `docs/세금계산_쉬운안내서.md` - 세금 계산 로직 설명
