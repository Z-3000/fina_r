# FINA_R 하드코딩 데이터 DB화 계획

> 작성일: 2025-11-24 | 최종 업데이트: 2025-11-25 (v3.4)
> 목적: MVP 단계에서 DB로 관리해야 할 하드코딩 데이터 선별 및 마이그레이션 계획

---

## 1. 분석 결과 요약

### 1.1 DB화 대상 선별 결과

| 구분 | 항목 수 | 조치 | 우선순위 |
|------|--------|------|---------|
| **DB 마이그레이션 필요** | 3개 테이블 | ✅ 마이그레이션 완료 | 높음 |
| **하드코딩 → 로직 개선** | 1개 항목 | ✅ v3.3 완료 | 높음 |
| MVP 단계 유지 (하드코딩) | 4개 항목 | 유지 | - |
| UI/디자인 상수 | 6개 항목 | 유지 | - |

---

## 2. DB화 완료 항목 (마이그레이션 생성)

### 2.1 tax_settings (세금 설정 테이블)

**파일**: `supabase/migrations/004_master_data_tables.sql`

| 설정 유형 | 항목 수 | 내용 |
|----------|--------|------|
| income_bracket | 8개 | 2024년 소득세율표 (6%~45%) |
| earned_income_deduction | 5개 | 근로소득공제율 (70%~2%) |
| basic_deduction | 3개 | 기본공제 (본인/배우자/부양가족) |
| special_deduction_limit | 14개 | 특별공제 한도 (의료비/교육비/연금 등) |
| vat | 2개 | 부가세율, 간이과세 기준 |

**출처 및 근거 명시:**
- 국세청 (https://www.nts.go.kr)
- 소득세법 제55조 (세율), 제47조 (근로소득공제), 제50조 (인적공제)
- 조세특례제한법 제86조의2 (연금저축/IRP), 제95조의2 (월세공제)

### 2.2 benefits_master (혜택 마스터 테이블)

| 카테고리 | 항목 수 | 예시 |
|----------|--------|------|
| tax (세금공제) | 3개 | 신용카드 소득공제, 월세 세액공제, 연금저축 |
| housing (주거) | 2개 | 청년전세자금대출, 청약저축 소득공제 |
| business (사업자) | 2개 | 노란우산공제, 간이과세 면제 |
| support (지원금) | 2개 | 근로장려금, 자녀장려금 |
| financial (금융) | 1개 | ISA계좌 비과세 |

### 2.3 deduction_items_master (공제 항목 마스터)

| 카테고리 | 항목 수 | 예시 |
|----------|--------|------|
| card | 1개 | 신용카드 소득공제 |
| medical | 1개 | 의료비 세액공제 |
| education | 1개 | 교육비 세액공제 |
| housing | 3개 | 주택자금, 월세, 청약저축 |
| pension | 2개 | 연금저축, 개인연금저축 |
| donation | 1개 | 기부금 세액공제 |
| insurance | 1개 | 보험료 세액공제 |

### 2.4 profiles 테이블 확장

추가된 컬럼:
- `annual_income` - 연소득
- `dependents` - 부양가족 수
- `has_spouse` - 배우자 유무
- `expected_revenue` - 사업자 예상 연매출
- `expected_expenses` - 사업자 예상 경비
- `is_simplified_tax` - 간이과세자 여부

---

## 2.5 하드코딩 → 로직 개선 완료 (v3.3) 🆕

### Tax Health Score 세부 점수

**이전 상태 (하드코딩)**

| 탭 | 항목 | 위치 | 이전 로직 | 문제점 |
|----|------|------|----------|--------|
| 대시보드 | 세금 리스크 | `App.jsx:1753` | `taxHealthScore + 7` | 실제 분석 아님 |
| 대시보드 | 증빙 완성도 | `App.jsx:1754` | `taxHealthScore - 13` | 실제 분석 아님 |
| 대시보드 | 환급 가능성 | `App.jsx:1755` | `taxHealthScore + 4` | 실제 분석 아님 |
| 대시보드 | 절세 여력 | `App.jsx:1756` | `taxHealthScore - 8` | 실제 분석 아님 |

**개선된 상태 (v3.3)**

| 항목 | 새 로직 | 산출 방식 |
|------|---------|----------|
| 세금 리스크 | `calculateTaxRiskScore()` | 규칙 기반 감점 (증빙 누락, 한도 초과, 업종 이탈 등) |
| 증빙 완성도 | `calculateDocumentationScore()` | 필요 서류 대비 업로드율 (50만원당 1개) |
| 환급 가능성 | `calculateRefundPotentialScore()` | 기납부세액 vs 예상결정세액 비교 |
| 절세 여력 | `calculateSavingsPotentialScore()` | 미사용 공제 한도 비율 |

**수정된 파일**

| 파일 | 변경 내용 |
|------|----------|
| `src/services/taxCalculator.js` | 4개 세부 점수 계산 함수 + 통합 함수 추가 (약 450줄) |
| `src/App.jsx` | import 추가, useMemo로 계산, 하드코딩 제거, 툴팁 추가 |

**참고한 방식**: 캐시노트 택스 스코어 (규칙 기반 + 정규화 + 업종 보정)

---

## 3. MVP 단계 유지 항목 (하드코딩 유지)

### 3.1 개발/테스트용 데이터

| 항목 | 파일 | 이유 |
|------|------|------|
| 계좌 연동 실패 폴백 | `App.jsx:891` | 데모/테스트용 |
| 더미 거래 생성 | `api.js:117` | 테스트용 |
| AI 인사이트 템플릿 | `api.js:457` | AI 연동 전 시뮬레이션 |
| db.json | `db.json` | JSON Server 테스트용 |

### 3.2 UI/디자인 상수

| 항목 | 파일 | 이유 |
|------|------|------|
| 차트 색상 팔레트 | `App.jsx:1207` | 디자인 상수 |
| 월 이름 배열 | `App.jsx:465` | 로케일 상수 |
| 혜택 카테고리 아이콘 | `App.jsx:3259` | UI 매핑 |
| 부가가치세율 10% | `taxCalculator.js:78` | 법정 세율 (변경 드묾) |
| OCR 패턴 | `ocrService.js:87` | 정규식 패턴 |
| **브랜드 색상 팔레트** | `App.css`, `tailwind.config.js` | 디자인 시스템 (v3.4) |

### 3.3 디자인 시스템 색상 (v3.4 NEW) 🆕

**CSS 변수로 관리 (`src/App.css`)**

| 변수명 | 색상 | HEX | 용도 |
|--------|------|-----|------|
| `--theme-primary` | Dark Amethyst | `#360F56` | 주요 텍스트, 헤더 |
| `--theme-secondary` | Neon Ice | `#50FFEE` | 상태 표시, 설정 탭 |
| `--theme-accent` | Gold | `#FFD700` | 중요 CTA, 강조 |
| `--theme-positive` | Spring Green | `#00FF7F` | 성공/긍정 상태 |

**Tailwind 확장 색상 (`tailwind.config.js`)**
- `brand`: 브랜드 색상 계열
- `primary`: 주요 액션 색상
- `secondary`: 보조 색상 (green, ice)
- `accent`: 강조 색상 (Gold)
- `tab`: 탭별 테마 색상 (home, budget, income, settings)
- `semantic`: 의미론적 색상 (success, warning, error, info)

---

## 4. 프론트엔드 수정 계획 (향후 작업)

### 4.1 supabaseApi.js 수정

```javascript
// 기존: 하드코딩된 공제 항목
const defaultDeductions = [...];

// 변경: DB에서 조회
export const deductionItemsAPI = {
  getAll: async () => {
    const { data } = await supabase
      .from('deduction_items_master')
      .select('*')
      .eq('is_active', true)
      .order('priority');
    return data;
  }
};
```

### 4.2 taxCalculator.js 수정

```javascript
// 기존: 하드코딩된 세율표
const INCOME_TAX_BRACKETS = [...];

// 변경: DB에서 조회 후 캐싱
let cachedTaxBrackets = null;

export const loadTaxSettings = async () => {
  const { data } = await supabase
    .from('tax_settings')
    .select('*')
    .eq('effective_year', new Date().getFullYear())
    .eq('is_active', true);

  cachedTaxBrackets = data.filter(d => d.setting_type === 'income_bracket');
  // ...
};
```

### 4.3 App.jsx 수정

```javascript
// 기존: 하드코딩된 benefitsData
const benefitsData = [...];

// 변경: DB에서 로드
const [benefitsData, setBenefitsData] = useState([]);

useEffect(() => {
  const loadBenefits = async () => {
    const { data } = await benefitsAPI.getAll();
    setBenefitsData(data);
  };
  loadBenefits();
}, []);
```

---

## 5. 마이그레이션 적용 방법

### 5.1 Supabase SQL Editor에서 실행

```sql
-- 1. 마이그레이션 파일 전체 실행
-- supabase/migrations/004_master_data_tables.sql 내용 복사 후 실행

-- 2. 결과 확인
SELECT COUNT(*) FROM tax_settings;        -- 약 32개 예상
SELECT COUNT(*) FROM benefits_master;     -- 10개 예상
SELECT COUNT(*) FROM deduction_items_master; -- 10개 예상
```

### 5.2 데이터 확인

```sql
-- 소득세율표 확인
SELECT setting_key, setting_value, source_article
FROM tax_settings
WHERE setting_type = 'income_bracket'
ORDER BY setting_key;

-- 혜택 목록 확인
SELECT title, category, amount, provider
FROM benefits_master
ORDER BY priority;
```

---

## 6. 향후 관리 방안

### 6.1 세법 개정 대응

1. **매년 12월**: 국세청 발표 확인
2. **변경 시**: `effective_year` 새 연도 데이터 추가
3. **이력 관리**: 기존 연도 데이터 유지 (is_active = false)

### 6.2 관리자 기능 (Phase 4)

- 세금 설정 관리 페이지
- 혜택 정보 CRUD
- 공제 항목 업데이트

---

## 7. 파일 목록

| 파일 | 설명 |
|------|------|
| `supabase/migrations/004_master_data_tables.sql` | 마이그레이션 SQL |
| `docs/하드코딩_DB화_계획.md` | 본 문서 |

---

*작성: 2025-11-24 | 최종 업데이트: 2025-11-25 | FINA_R MVP DB화 계획 v3.4*
