# FINA_R 코드 아키텍처

> 최종 업데이트: 2025-11-30
> 목적: 프로젝트 전체 구조 시각화 및 의존성 파악

---

## 1. 전체 폴더 구조

```mermaid
graph TD
    subgraph src["📁 src/"]
        APP[App.jsx<br/>5,025줄]
        MAIN[main.jsx]

        subgraph components["📁 components/"]
            subgraph views["📁 views/ (6개)"]
                DV[DashboardView]
                BV[BudgetView]
                TV[TaxPredictionView]
                RV[ReceiptsView]
                BEV[BenefitsView]
                CV[ChallengesView]
            end
            subgraph modals["📁 modals/ (12개)"]
                TSM[TaxSimulatorModal]
                SM[SettingsModal]
                PM[PDFReportModal]
                RM[ReceiptModal]
                OTHER[...8개 더]
            end
            subgraph common["📁 common/"]
                TC[ToastContainer]
            end
        end

        subgraph services["📁 services/"]
            subgraph api["📁 api/ (12개)"]
                AUTH[auth.js]
                RECEIPTS[receipts.js]
                BUDGETS[budgets.js]
                TAX[tax.js]
                APIC[apiClient.js]
                APIOTHER[...7개 더]
            end
            subgraph calculators["📁 calculators/"]
                TAXCALC[taxCalculator.js<br/>1,927줄]
            end
            subgraph ocr["📁 ocr/"]
                ENGINE[OcrEngine]
                PARSERS[Parsers]
            end
            OCR[ocrService.js]
            EXPORT[exportService.jsx]
            INSIGHT[insightGenerator.js]
        end

        subgraph context["📁 context/"]
            AUTHCTX[AuthContext]
            TOASTCTX[ToastContext]
            APPCTX[AppContext]
        end

        subgraph hooks["📁 hooks/"]
            USEAUTH[useAuth]
            USECHAL[useChallengesData]
        end

        subgraph constants["📁 constants/"]
            COLORS[colors.js]
            CHARTS[charts.js]
            BIZTAX[businessTaxConstants.js]
        end

        subgraph utils["📁 utils/"]
            FORMAT[formatting.js]
            APIWRAP[apiWrapper.js]
        end

        subgraph lib["📁 lib/"]
            SUPA[supabase.js]
        end
    end
```

---

## 2. App.jsx 의존성 맵

```mermaid
graph LR
    subgraph External["외부 라이브러리"]
        REACT[React]
        RECHARTS[Recharts]
        LUCIDE[Lucide Icons]
    end

    subgraph Core["핵심 서비스"]
        SUPA[supabase.js]
        API[services/api/*]
        CALC[taxCalculator.js]
        OCR[ocrService.js]
        INSIGHT[insightGenerator.js]
    end

    subgraph UI["UI 컴포넌트"]
        VIEWS[views/* 6개]
        MODALS[modals/* 12개]
    end

    subgraph State["상태 관리"]
        HOOKS[hooks/*]
        CONTEXT[context/*]
    end

    subgraph Utils["유틸리티"]
        FORMAT[formatting.js]
        COLORS[colors.js]
        CHARTS[charts.js]
    end

    APP((App.jsx<br/>5,025줄))

    External --> APP
    Core --> APP
    UI --> APP
    State --> APP
    Utils --> APP
```

---

## 3. 데이터 흐름

```mermaid
flowchart TD
    subgraph User["사용자 액션"]
        LOGIN[로그인]
        RECEIPT[영수증 등록]
        BUDGET[예산 설정]
        TAX[세금 조회]
    end

    subgraph App["App.jsx"]
        STATE[useState<br/>98개 훅]
        HANDLER[이벤트 핸들러]
        MEMO[useMemo 계산]
    end

    subgraph Services["서비스 레이어"]
        API[API 모듈]
        CALC[세금 계산기]
        OCRS[OCR 서비스]
    end

    subgraph Backend["Supabase"]
        AUTH[Auth]
        DB[(PostgreSQL)]
        STORAGE[Storage]
    end

    User --> App
    App <--> Services
    Services <--> Backend

    STATE --> HANDLER
    HANDLER --> API
    API --> DB
    DB --> STATE
    STATE --> MEMO
    MEMO --> UI[View 컴포넌트]
```

---

## 4. 세금 계산 흐름

```mermaid
flowchart LR
    subgraph Input["입력"]
        INCOME[연소득]
        DEPEND[부양가족]
        DEDUCT[공제 내역]
        RECEIPT[영수증]
    end

    subgraph Calculator["taxCalculator.js (1,927줄)"]
        subgraph Constants["상수 (~200줄)"]
            BRACKET[세율표]
            LIMITS[공제한도]
        end

        subgraph Individual["개인세금 (~400줄)"]
            ITAX[calculateIndividualTax]
        end

        subgraph Business["사업자세금 (~300줄)"]
            BTAX[calculateBusinessTax]
            VAT[calculateVAT]
        end

        subgraph Deductions["공제계산 (~500줄)"]
            MED[의료비]
            EDU[교육비]
            CARD[신용카드]
        end

        subgraph Health["건강점수 (~400줄)"]
            RISK[세금리스크]
            DOC[증빙완성도]
            REFUND[환급가능성]
            SAVE[절세여력]
        end
    end

    subgraph Output["출력"]
        RESULT[세금 계산 결과]
        SCORE[건강 점수]
        INSIGHT[인사이트]
    end

    Input --> Calculator
    Calculator --> Output
```

---

## 5. 컴포넌트 계층

```mermaid
graph TD
    subgraph Root["루트"]
        MAIN[main.jsx]
    end

    subgraph Providers["프로바이더"]
        TOAST[ToastProvider]
    end

    subgraph MainApp["메인 앱"]
        APP[App.jsx]
    end

    subgraph Views["탭별 뷰"]
        DASH[DashboardView]
        BUDG[BudgetView]
        TAXP[TaxPredictionView]
        RECP[ReceiptsView]
        BENF[BenefitsView]
        CHAL[ChallengesView]
    end

    subgraph Modals["모달"]
        TAXSIM[TaxSimulatorModal]
        SETTING[SettingsModal]
        PDF[PDFReportModal]
        M_OTHER[...9개 더]
    end

    MAIN --> TOAST
    TOAST --> APP
    APP --> Views
    APP --> Modals
```

---

## 6. API 모듈 구조

```mermaid
graph TD
    subgraph API["services/api/"]
        INDEX[index.js<br/>re-export]
        CLIENT[apiClient.js<br/>Supabase + 에러처리]

        subgraph Domain["도메인별 모듈"]
            AUTH[auth.js]
            RECEIPTS[receipts.js]
            BUDGETS[budgets.js]
            TAX[tax.js]
            CHALLENGES[challenges.js]
            REWARDS[rewards.js]
            INSIGHTS[insights.js]
            NOTIF[notifications.js]
            COMMUNITY[community.js]
            ACCOUNTS[accounts.js]
            MISC[misc.js]
        end
    end

    subgraph Supabase["Supabase"]
        SB_AUTH[Auth]
        SB_DB[(Database)]
    end

    CLIENT --> Supabase
    Domain --> CLIENT
    INDEX --> Domain
```

---

## 7. 현재 이슈 및 개선 포인트

```mermaid
graph TD
    subgraph Issues["현재 이슈"]
        I1[App.jsx 5,025줄<br/>너무 큼]
        I2[taxCalculator 1,927줄<br/>모듈화 필요]
        I3[useState 98개<br/>관심사 분리 필요]
    end

    subgraph Solutions["개선 방향"]
        S1[Custom Hooks 추출<br/>useReceiptManagement<br/>useBudgetManagement]
        S2[taxCalculator 분리<br/>constants/<br/>individualTax.js<br/>businessTax.js]
        S3[Context 활용<br/>전역 상태 분리]
    end

    I1 --> S1
    I2 --> S2
    I3 --> S1
    I3 --> S3
```

---

## 8. 리팩토링 진행 상황

```mermaid
gantt
    title 리팩토링 로드맵
    dateFormat  YYYY-MM-DD
    section 완료
    백업 파일 제거           :done, 2025-11-30, 1d
    DetailsModal 연결        :done, 2025-11-30, 1d
    QuestionModal 연결       :done, 2025-11-30, 1d

    section 진행중
    공용 유틸 분리           :active, 2025-11-30, 1d
    App.jsx 훅 추출          :2025-11-30, 2d

    section 예정
    taxCalculator 모듈화     :2025-12-02, 2d
    View 컴포넌트화          :2025-12-04, 1d
    테스트 추가              :2025-12-05, 2d
```

---

## 9. 파일별 줄 수 현황

| 파일 | 줄 수 | 상태 |
|------|------:|------|
| App.jsx | 5,025 | ⚠️ 축소 필요 |
| taxCalculator.js | 1,927 | ⚠️ 모듈화 필요 |
| exportService.jsx | 533 | ✅ 적정 |
| insightGenerator.js | 316 | ✅ 적정 |
| ocrService.js | 181 | ✅ 적정 |

---

*Generated: 2025-11-30*
