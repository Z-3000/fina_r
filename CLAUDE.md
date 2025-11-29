# CLAUDE.md

한국형 스마트 세금/재무 관리 플랫폼 (영수증 OCR, 예산 추적, 세금 계산, 게이미피케이션)

## Tech Stack

| Category | Stack |
|----------|-------|
| Frontend | React 18.2, Vite 5.0, Tailwind CSS 3.4 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Charts | Recharts 2.10 |
| Icons | Lucide React 0.303 |
| OCR | Tesseract.js 6.0 |
| Export | jsPDF 3.0, xlsx 0.18 |
| Date | date-fns 4.1 |

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
├── App.jsx                 # 메인 앱 (UI 로직 중심)
├── components/
│   ├── views/              # 페이지별 뷰 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   └── modals/             # 모달 컴포넌트
├── services/
│   ├── api/                # API 모듈 (리팩토링 중)
│   ├── calculators/        # 세금 계산 로직
│   ├── ocr/                # OCR 파싱 시스템
│   ├── ocrService.js       # Tesseract OCR
│   └── exportService.jsx   # PDF/Excel 내보내기
├── constants/
│   ├── colors.js           # 디자인 색상 (SSOT)
│   ├── charts.js           # 차트 설정
│   └── businessTaxConstants.js
├── context/                # React Context (Auth, Toast)
├── hooks/                  # Custom Hooks
├── lib/supabase.js         # Supabase 클라이언트
└── utils/                  # 유틸리티 함수
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

### Import Order
1. React/외부 라이브러리
2. 내부 컴포넌트
3. 서비스/유틸리티
4. 상수/스타일

### UI/UX
- 언어: 한국어
- 숫자 포맷: `toLocaleString('ko-KR')` + 원
- Toast: `react-hot-toast` + `ToastContext`

## Design System

`src/constants/colors.js` (Tailwind 연동):
| Color | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| Primary (Navy) | `#003262` | 브랜드, 신뢰 | `text-primary` |
| Secondary (Mint) | `#00FFBF` | 성공, 수입 | `bg-secondary` |
| Tertiary (Cyan) | `#0FFFFF` | 정보, 강조 | `text-tertiary` |
| Accent (Peach) | `#FFC591` | 경고, 리워드 | `bg-accent` |

## Database

### Key Tables
`profiles`, `receipts`, `budgets`, `linked_accounts`, `challenges`, `user_challenges`, `deduction_tracker`, `individual_tax_data`, `business_tax_data`, `attendance`, `rewards`, `missions`

### Notes
- 모든 테이블에 RLS 활성화
- `profiles.id` → `auth.users` 참조
- 마이그레이션: `supabase/migrations/` (001, 002, ...)

## Key Modules

### Tax Calculator (`services/calculators/`)
- 2025 한국 세법 기반
- 개인: 소득세, 근로소득공제, 신용카드공제 (3단계 한도)
- 사업자: 종합소득세, 부가세 (일반/간이)

### API Modules (`services/api/`)
`authAPI`, `receiptsAPI`, `budgetsAPI`, `accountsAPI`, `challengesAPI`, `deductionAPI`, `taxAPI`, `gamificationAPI` 등

## Deployment

- Platform: Vercel
- Config: `vercel.json`
- Output: `dist/`
