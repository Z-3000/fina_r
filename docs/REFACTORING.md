# FINA_R 리팩토링 기록

이 문서는 FINA_R 프로젝트의 리팩토링 진행 내역을 날짜별로 기록합니다.

---

## 📊 현재 상태 요약 (2025-11-30 최종)

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| App.jsx | 6,621줄 | 5,025줄 | -24% |
| supabaseApi.js | 1,254줄 (단일) | 12개 모듈 | 분리 완료 |
| taxCalculator.js | services/ | calculators/ | 이동 완료 |
| 모달 컴포넌트 | App.jsx 내장 | 12개 분리 | 분리 완료 |
| **CLAUDE.md** | **장황한 형식** | **간결한 Bullet 스타일** | **최적화 완료** |
| **useModals 훅** | **없음** | **생성 완료** | **적용 대기** |
| **ARCHITECTURE.md** | **없음** | **생성 완료** | **Mermaid 차트** |

### ✅ 완료된 Phase
- **Phase 1**: 유틸리티/상수/모달 8개 분리
- **Phase 2**: 추가 모달 4개 분리 (ReceiptModal, AccountLinkModal, DetailsModal, TaxSimulatorModal)
- **Phase 3**: API 모듈 분리 (`src/services/api/`)
- **Phase 4**: taxCalculator 폴더 이동 (`src/services/calculators/`)
- **즉시 처리**: DetailsModal/QuestionModal 핸들러 연결 ✅
- **즉시 처리**: 백업 파일 제거 (`supabaseApi.js.bak`) ✅
- **준비 완료**: useModals 훅 생성 (`src/hooks/useModals.js`) ✅
- **문서화**: ARCHITECTURE.md 생성 (Mermaid 차트) ✅

### ⏳ 다음 작업 (우선순위순)
1. **App.jsx에 useModals 적용** - 모달 상태 15개 → 훅 1개 (준비 완료, 적용 대기)
2. **Phase 5**: taxCalculator 세부 모듈화 (사용자 검토 후 진행)
3. **Phase 6**: Custom Hooks 추출 (영수증/예산 - 의존성 복잡)
4. **Phase 7**: 잔여 View 컴포넌트화

---

## 🔄 연속성 가이드 (다음 세션용)

> 이 섹션은 다음 개발 세션에서 빠르게 컨텍스트를 파악할 수 있도록 작성됨

### 현재 진행 상황

| 작업 | 상태 | 파일 | 비고 |
|------|------|------|------|
| useModals 훅 | ✅ 생성 완료 | `src/hooks/useModals.js` | **App.jsx 적용 대기** |
| ARCHITECTURE.md | ✅ 생성 완료 | `docs/ARCHITECTURE.md` | Mermaid 차트 포함 |
| DetailsModal 연결 | ✅ 완료 | `BenefitsView.jsx`, `App.jsx` | - |
| QuestionModal 연결 | ✅ 완료 | `App.jsx` 헤더 | MessageCircle 아이콘 |
| 백업 파일 제거 | ✅ 완료 | `supabaseApi.js.bak` 삭제됨 | - |

### ⚠️ 중요: useModals 적용 시 주의사항

`useModals` 훅은 생성되었지만 **아직 App.jsx에 적용되지 않음**.

**적용 시 단계:**
1. App.jsx 상단에 훅 import
2. 15개 useState → useModals() 호출로 교체
3. 기존 변수명 그대로 사용 가능 (호환 별칭 제공됨)

**적용 보류 이유:**
- 사용자가 안전성 우선 요청
- 영수증 핸들러 등 복잡한 의존성 확인 필요
- 점진적 적용 권장

### ⚠️ 영수증/예산 훅 분리 시 의존성

```
handleAddReceipt() 내부 상태 업데이트:
├── receipts (영수증 목록)
├── dailyMissions (미션 진행도)
├── challenges (챌린지 상태)
├── userProfile (포인트/경험치)
└── showReceiptModal (모달)

→ 단순 분리 불가, Context 또는 신중한 설계 필요
```

### 다음 세션 권장 작업

1. **안전한 선택**: useModals만 App.jsx에 적용 (독립적, 위험 없음)
2. **신중한 선택**: taxCalculator 로직 검토 후 모듈화 계획 구체화
3. **도전적 선택**: 영수증/예산 훅 분리 (의존성 분석 선행 필요)

### 참고 문서

- `docs/ARCHITECTURE.md` - 전체 코드 구조 Mermaid 차트
- `docs/FINA_R_개발로드맵.md` - 프로젝트 로드맵
- `CLAUDE.md` - 프로젝트 지침 (최적화됨)

---

## 2025-11-30 (훅 추출 준비)

### 목표
- 공용 유틸/훅 분리 준비
- App.jsx 점진적 리팩토링 기반 마련

### 수행 내역

#### 1. useModals 훅 생성
**파일**: `src/hooks/useModals.js` (신규)

15개 모달 상태를 통합 관리하는 훅:
```javascript
const {
  modals,              // { receipt: false, premium: false, ... }
  openModal,           // (name, data?) => void
  closeModal,          // (name) => void

  // 기존 호환 별칭
  showReceiptModal,    // boolean
  setShowReceiptModal, // (v) => void
  ...
} = useModals();
```

**통합된 상태 (15개):**
- receipt, premium, details, reward, accountLink
- value, auth, docSpace, pdfReport, taxSimulator
- aiInsight, settings, question, transactionDetail, budgetLimit

#### 2. 아키텍처 문서 생성
**파일**: `docs/ARCHITECTURE.md` (신규)

Mermaid 차트 포함:
- 전체 폴더 구조
- App.jsx 의존성 맵
- 데이터 흐름
- 세금 계산 흐름
- API 모듈 구조
- 리팩토링 로드맵

#### 3. 의존성 분석 결과

**영수증/예산 훅 분리 시 복잡한 의존성:**
```
handleAddReceipt() 내부에서 업데이트하는 상태:
├── receipts (영수증)
├── dailyMissions (미션)
├── challenges (챌린지)
├── userProfile (포인트/경험치)
└── showReceiptModal (모달)
```

→ 즉시 분리 시 위험, 점진적 분리 필요

### 생성된 파일

| 파일 | 줄 수 | 용도 |
|------|-------|------|
| `src/hooks/useModals.js` | ~200줄 | 모달 상태 통합 관리 |
| `docs/ARCHITECTURE.md` | ~300줄 | 코드 구조 시각화 |

### 다음 단계

1. **App.jsx에 useModals 적용** - 모달 상태 15개 → 훅 1개
2. **의존성 정리** - 영수증/예산 핸들러 내 상태 업데이트 분리
3. **점진적 훅 추출** - 정리 후 useReceiptManagement 등 추출

---

## 2025-11-30 (즉시 처리 리팩토링)

### 목표
- 코드-문서 불일치 해소 (DetailsModal/QuestionModal 핸들러 연결)
- 불필요한 백업 파일 정리

### 수행 내역

#### 1. 백업 파일 제거
```bash
# 삭제된 파일
src/services/supabaseApi.js.bak
```
- git 추적 상태 확인 후 삭제
- 향후 import 혼란 방지

#### 2. DetailsModal 버튼 연결

**수정된 파일:**

| 파일 | 변경 내용 |
|------|----------|
| `src/App.jsx` | BenefitsView에 `onOpenDetailsModal`, `onOpenQuestionModal` props 전달 |
| `src/components/views/BenefitsView.jsx` | props 수신 및 버튼 onClick 연결 |

**BenefitsView 도움말 카드 버튼 연결:**
- 전문가 상담 → `onOpenDetailsModal('experts')`
- 금융상품 추천 → `onOpenDetailsModal('products')`
- 커뮤니티 → `onOpenDetailsModal('community')`
- 질문하기 → `onOpenQuestionModal()`

#### 3. QuestionModal 독립 접근 경로 추가

**수정된 파일:** `src/App.jsx`

**헤더에 질문하기 버튼 추가:**
```jsx
{/* 질문하기 버튼 */}
<button
  onClick={() => setShowQuestionModal(true)}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
  title="질문하기"
>
  <MessageCircle className="w-5 h-5" />
</button>
```

**접근 경로:**
- 헤더: MessageCircle 아이콘 버튼 (항상 표시)
- BenefitsView: "질문하기" 버튼
- DetailsModal (community 타입): "질문하기" 버튼

### 결과
- 빌드 검증 완료 (`npm run build` 성공)
- DetailsModal 3가지 타입 모두 접근 가능
- QuestionModal 헤더에서 직접 접근 가능

---

## 2025-11-30 (CLAUDE.md 최적화)

### 목표
- Claude Code 지침 파일(CLAUDE.md) 최적화
- 토큰 효율성 개선 및 최신 프로젝트 상태 반영

### 수행 내역

#### 1. CLAUDE.md 전체 재구성

**개선 원칙 (베스트 프랙티스 적용)**

| 구분 | Before | After |
|------|--------|-------|
| 형식 | 장황한 테이블/서술 | 간결한 Bullet/코드블록 |
| 프로젝트 상태 | 구버전 정보 | v3.8, Phase 3 (50%) |
| 파일 구조 | 일부 누락 | 전체 구조 반영 (API 12개, 모달 12개, OCR 시스템) |
| 개발 가이드 | 없음 | 에러 핸들링, 지연 로드 패턴 추가 |

#### 2. 추가된 섹션

| 섹션 | 내용 |
|------|------|
| Current Focus | 리팩토링 진행률 (App.jsx -24%) |
| Known Issues | DetailsModal 핸들러 미연결, 백업 파일 정리 |
| Development Guidelines | 에러 핸들링 패턴, 지연 로드 패턴 |
| Reference Docs | docs 폴더 문서 링크 |

#### 3. 토큰 효율성 개선

| 항목 | Before | After |
|------|--------|-------|
| Tech Stack | 테이블 형식 | 코드블록 한 줄씩 |
| Project Structure | 설명 포함 | 순수 트리 구조 |
| API Modules | 개별 테이블 | 한 줄 나열 |

### 결과

- CLAUDE.md 약 240줄 (최적화된 구조)
- 프로젝트 현재 상태 정확히 반영
- 향후 개발자/AI가 프로젝트 이해에 필요한 핵심 정보만 포함

---

## 2025-11-28 (Phase 1)

### 목표
- 리스크가 낮은 리팩토링부터 시작하여 코드 품질 개선
- App.jsx의 거대한 크기(6,621줄) 축소
- 코드 중복 제거 및 모듈화

### 수행 내역

#### 1. 유틸리티 함수 분리
**파일**: `src/utils/formatting.js` (신규 생성)

| 함수 | 설명 |
|------|------|
| `formatAmount()` | 금액 포맷팅 (천단위 콤마) |
| `handleNumberFocus()` | 숫자 입력 필드 포커스 처리 |
| `handleNumberBlur()` | 숫자 입력 필드 블러 처리 |
| `formatKRW()` | 한국 원화 형식 포맷팅 |

**효과**: App.jsx와 DashboardView.jsx에서 중복 코드 제거

---

#### 2. 상수 추출
**파일**: `src/constants/charts.js` (신규 생성)

| 상수 | 설명 |
|------|------|
| `CHART_COLORS` | 차트 기본 색상 (green, red, danger 등) |
| `UNIQUE_CHART_COLORS` | 파이 차트용 고유 색상 팔레트 |

**효과**: 4개 파일(App.jsx, DashboardView.jsx, BudgetView.jsx, TaxPredictionView.jsx)에서 중복 정의 제거

---

#### 3. Modal 컴포넌트 분리
**폴더**: `src/components/modals/` (신규 생성)

| 파일 | 줄 수 | 설명 |
|------|-------|------|
| `AIInsightModal.jsx` | 56줄 | AI 세무사 인사이트 모달 |
| `PremiumModal.jsx` | 130줄 | 프리미엄 플랜 안내 모달 |
| `RewardModal.jsx` | 42줄 | 리워드 교환 완료 모달 |
| `QuestionModal.jsx` | 68줄 | 질문하기 모달 |
| `ValueModal.jsx` | 128줄 | 금융 연동 가치 설명 모달 |
| `SettingsModal.jsx` | 228줄 | 설정 모달 (사용자 유형/세금 정보) |
| `DocSpaceModal.jsx` | 53줄 | 도큐스페이스 모달 |
| `PDFReportModal.jsx` | 156줄 | PDF/Excel 내보내기 모달 |
| `index.js` | 14줄 | Re-export 파일 |

**총 분리된 모달**: 8개

---

### 결과 요약

#### App.jsx 줄 수 변화
```
Before: 6,621줄
After:  5,920줄
감소:   -701줄 (-10.6%)
```

#### 생성된 파일 구조
```
src/
├── utils/
│   └── formatting.js          (신규)
├── constants/
│   └── charts.js              (신규)
└── components/modals/
    ├── index.js               (신규)
    ├── AIInsightModal.jsx     (신규)
    ├── PremiumModal.jsx       (신규)
    ├── RewardModal.jsx        (신규)
    ├── QuestionModal.jsx      (신규)
    ├── ValueModal.jsx         (신규)
    ├── SettingsModal.jsx      (신규)
    ├── DocSpaceModal.jsx      (신규)
    └── PDFReportModal.jsx     (신규)
```

#### 중복 코드 제거
- `formatAmount()`: 2개 파일 → 1개 파일
- `CHART_COLORS`: 4개 파일 → 1개 파일

---

### 빌드 검증
- 모든 변경 후 `npm run build` 성공 확인
- 번들 크기: ~1,748KB (변동 미미)

---

## 2025-11-28 (Phase 2)

### 목표
- 남은 4개 모달 컴포넌트 분리 완료
- App.jsx 크기 추가 축소

### 수행 내역

#### 1. 추가 Modal 컴포넌트 분리
**폴더**: `src/components/modals/`

| 파일 | 줄 수 | 설명 |
|------|-------|------|
| `ReceiptModal.jsx` | 94줄 | 영수증 추가 모달 |
| `AccountLinkModal.jsx` | 71줄 | 금융 계좌 연동 모달 |
| `DetailsModal.jsx` | 153줄 | 상세 정보 모달 (전문가/금융상품/커뮤니티) |
| `TaxSimulatorModal.jsx` | 688줄 | 연말정산 시뮬레이터 모달 |

**총 분리된 모달**: 12개 (Phase 1: 8개 + Phase 2: 4개)

---

### 결과 요약

#### App.jsx 줄 수 변화
```
Phase 1 After: 5,920줄
Phase 2 After: 5,030줄
감소:          -890줄 (-15.0%)

전체 감소 (원본 6,621줄 대비):
총 감소:       -1,591줄 (-24.0%)
```

#### 생성된 파일 구조 (Phase 2 추가분)
```
src/components/modals/
├── ReceiptModal.jsx       (신규)
├── AccountLinkModal.jsx   (신규)
├── DetailsModal.jsx       (신규)
├── TaxSimulatorModal.jsx  (신규)
└── index.js               (업데이트 - 4개 모달 추가)
```

---

### 남은 작업 (향후 Phase 예정)

#### ~~supabaseApi.js 분리 (1,254줄)~~ ✅ Phase 3 완료

#### ~~taxCalculator.js 이동 (1,927줄)~~ ✅ Phase 4 완료

#### Custom Hooks 추가
- `useTaxData()`, `useTransactionData()` 등

---

### 빌드 검증
- 모든 변경 후 `npm run build` 성공 확인
- 번들 크기: ~1,749KB (변동 미미)

---

## 2025-11-28 (Phase 3)

### 목표
- supabaseApi.js (1,254줄) 모듈 분리
- 도메인별 API 파일 구조화
- 유지보수성 및 가독성 향상

### 수행 내역

#### 1. API 모듈 구조 신설
**폴더**: `src/services/api/` (신규 생성)

| 파일 | 줄 수 | 내용 |
|------|-------|------|
| `apiClient.js` | 45줄 | supabase 인스턴스 + 에러 핸들링 유틸 |
| `auth.js` | 82줄 | authAPI (로그인/회원가입/OAuth) |
| `receipts.js` | 89줄 | receiptsAPI (영수증 CRUD/통계) |
| `budgets.js` | 111줄 | budgetsAPI (예산 관리) |
| `accounts.js` | 58줄 | accountsAPI, banksAPI (금융 연동) |
| `tax.js` | 162줄 | taxAPI, deductionAPI (세금/공제) |
| `challenges.js` | 189줄 | challengesAPI, missionsAPI, attendanceAPI |
| `rewards.js` | 127줄 | rewardsAPI, rewardsProductAPI, leaderboardAPI, gamificationAPI |
| `insights.js` | 67줄 | insightsAPI (AI 인사이트) |
| `notifications.js` | 72줄 | notificationsAPI, notificationCenterAPI |
| `community.js` | 64줄 | communityAPI, expertsAPI, productsAPI |
| `misc.js` | 167줄 | eventsAPI, documentFoldersAPI, bankDummyTransactionsAPI, autoTransactionsAPI |
| `index.js` | 32줄 | 전체 API re-export |

**총**: 12개 모듈, 1,265줄

---

#### 2. Import 경로 치환
**수정된 파일**:
- `src/App.jsx` - `'./services/supabaseApi'` → `'./services/api'`
- `src/hooks/useAuth.js` - `'../services/supabaseApi'` → `'../services/api'`
- `src/hooks/useChallengesData.js` - `'../services/supabaseApi'` → `'../services/api'`

---

#### 3. 기존 파일 백업
- `supabaseApi.js` → `supabaseApi.js.bak` (참조용 보관)

---

### 결과 요약

#### 파일 구조 변화
```
src/services/
├── api/                       (신규)
│   ├── index.js
│   ├── apiClient.js
│   ├── auth.js
│   ├── receipts.js
│   ├── budgets.js
│   ├── accounts.js
│   ├── tax.js
│   ├── challenges.js
│   ├── rewards.js
│   ├── insights.js
│   ├── notifications.js
│   ├── community.js
│   └── misc.js
├── supabaseApi.js.bak         (백업)
├── taxCalculator.js
├── ocrService.js
└── exportService.jsx
```

#### 개선 효과
- **단일 책임**: 각 API 모듈이 하나의 도메인만 담당
- **가독성**: 1,254줄 단일 파일 → 12개 모듈 (평균 ~105줄)
- **유지보수**: 관련 API 수정 시 해당 파일만 수정

---

### 빌드 검증
- `npm run build` 성공 확인
- 번들 크기: ~1,749KB (변동 없음)

---

## 2025-11-28 (Phase 4)

### 목표
- taxCalculator.js (1,927줄) 폴더 구조화
- 향후 세부 분리를 위한 기반 마련

### 수행 내역

#### 1. calculators/ 폴더 생성
**구조**:
```
src/services/calculators/
├── index.js           (6줄)  - re-export
└── taxCalculator.js   (1,927줄) - 기존 파일 이동
```

#### 2. Import 경로 치환
**수정된 파일**:
- `src/App.jsx` - `'./services/taxCalculator'` → `'./services/calculators'`
- `src/components/views/TaxPredictionView.jsx` - `'../../services/taxCalculator'` → `'../../services/calculators'`
- `src/services/api/tax.js` - `'../taxCalculator'` → `'../calculators'`

### 결과 요약
- 로직 변경 없이 폴더 구조만 변경 (최소 리스크)
- 향후 세부 분리 시 `calculators/` 내부에서 모듈화 가능
- 빌드 검증 완료

---

## 버그 수정 (2025-11-28)

### PDF 생성 불일치 버그 수정
- **문제**: 연말정산 PDF 생성 시 시뮬레이터의 새 필드(교육비/기부금/보험료/주택공제/신용카드/월세)가 누락되어 UI와 PDF 결과 불일치
- **해결**: `taxSimulatorResult`를 직접 재사용하도록 수정
- **파일**: `src/App.jsx:1279-1290`

### gamificationAPI 누락 메서드 수정
- **문제**: `gamificationAPI.checkAttendance()`와 `gamificationAPI.exchangeReward()` 메서드가 정의되지 않아 런타임 에러 발생
- **원인**: 기존 supabaseApi.js에도 없던 메서드 (기존 버그)
- **해결**: `gamificationAPI`에 wrapper 메서드 추가
  - `checkAttendance` → `attendanceAPI.checkIn` 위임
  - `exchangeReward` → `rewardsAPI.exchange` 위임
- **파일**: `src/services/api/rewards.js:101-107`

---

## 향후 개발 예정 TODO

### 🔴 즉시 처리 필요 (코드-문서 불일치)

#### DetailsModal/QuestionModal 핸들러 연결
- **현재 상태**: 모달 UI는 완성, 열기 핸들러 미연결
- **문제**: `showDetailsModal`, `detailsModalType`, `showQuestionModal` 상태가 true로 설정되는 코드 없음
- **필요 작업**: BenefitsView 등에 onClick 이벤트 연결

**연결 예시**:
```jsx
// BenefitsView.jsx 또는 App.jsx에서
<button onClick={() => {
  setDetailsModalType('experts');  // 'experts' | 'products' | 'community'
  setShowDetailsModal(true);
}}>
  전문가 더보기
</button>
```

**관련 상태 변수 (App.jsx)**:
- `showDetailsModal` (line 130)
- `detailsModalType` (line 156)
- `showQuestionModal` (line 161)

---

### 🟡 정리 작업

#### 백업 파일 제거
- **파일**: `src/services/supabaseApi.js.bak`
- **상태**: Phase 3에서 백업용으로 보관됨
- **권장**: git history 확인 후 삭제 (향후 import 혼란 방지)

```bash
# 확인 후 실행
rm src/services/supabaseApi.js.bak
```

---

## 향후 리팩토링 로드맵

### Phase 5: taxCalculator 세부 모듈화 (권장)
현재 `calculators/taxCalculator.js` (1,927줄)는 경로 이동만 완료된 상태.

**세부 분리 계획**:
```
src/services/calculators/
├── index.js                  - re-export
├── constants/
│   └── taxBrackets.js        - 세율표, 공제한도 상수
├── individualTax.js          - 개인 소득세 계산
├── businessTax.js            - 사업자/VAT 계산
├── deductions.js             - 공제 계산 (의료비/교육비/신용카드 등)
└── healthScore.js            - 세금 건강점수 계산
```

**품질 보강**:
- 각 함수에 JSDoc 입출력 타입 명시
- 스냅샷 테스트 추가 (개인/사업자 최소 2개)
- 회귀 방지용 테스트 케이스

---

### Phase 6: Custom Hooks 추출
App.jsx (5,025줄) 축소를 위한 핵심 작업.

| Hook | 역할 | 예상 감소 |
|------|------|----------|
| `useReceiptManagement` | 영수증 CRUD + 모달 상태 | ~300줄 |
| `useBudgetManagement` | 예산 CRUD + 상한 모달 | ~200줄 |
| `useDashboardData` | 대시보드 집계 계산 | ~150줄 |

**위치**: `src/hooks/`

---

### Phase 7: 잔여 View 섹션 컴포넌트화
App.jsx 내 인라인 렌더링 섹션을 독립 컴포넌트로 분리.

---

### 정리 작업

#### 백업 파일 제거
- `src/services/supabaseApi.js.bak` - git history 확인 후 삭제 권장
- 향후 혼란 방지

#### DetailsModal/QuestionModal 핸들러 연결 (우선)
- 코드-문서 불일치 해소
- BenefitsView 등에 onClick 연결 필요
- 상세 내용은 "향후 개발 예정 TODO" 섹션 참조

---

## 리팩토링 원칙

1. **점진적 개선**: 작은 승리를 빠르게 쌓기
2. **안전 우선**: 의존성 낮은 것부터 분리
3. **빌드 검증**: 매 단계 후 빌드 테스트
4. **문서화**: 변경 내역 기록 유지
