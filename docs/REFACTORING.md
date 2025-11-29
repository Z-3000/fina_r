# FINA_R 리팩토링 기록

이 문서는 FINA_R 프로젝트의 리팩토링 진행 내역을 날짜별로 기록합니다.

---

## 📊 현재 상태 요약 (2025-11-28)

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| App.jsx | 6,621줄 | 5,025줄 | -24% |
| supabaseApi.js | 1,254줄 (단일) | 12개 모듈 | 분리 완료 |
| taxCalculator.js | services/ | calculators/ | 이동 완료 |
| 모달 컴포넌트 | App.jsx 내장 | 12개 분리 | 분리 완료 |

### ✅ 완료된 Phase
- **Phase 1**: 유틸리티/상수/모달 8개 분리
- **Phase 2**: 추가 모달 4개 분리 (ReceiptModal, AccountLinkModal, DetailsModal, TaxSimulatorModal)
- **Phase 3**: API 모듈 분리 (`src/services/api/`)
- **Phase 4**: taxCalculator 폴더 이동 (`src/services/calculators/`)

### ⏳ 다음 작업 (우선순위순)
1. **DetailsModal/QuestionModal 핸들러 연결** - 코드-문서 불일치 해소
2. **백업 파일 제거** - `supabaseApi.js.bak`
3. **Phase 5**: taxCalculator 세부 모듈화
4. **Phase 6**: Custom Hooks 추출
5. **Phase 7**: 잔여 View 컴포넌트화

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
