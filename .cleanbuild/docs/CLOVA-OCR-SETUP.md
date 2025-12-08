# CLOVA OCR + OpenAI GPT 설정 가이드

이 프로젝트는 **네이버 CLOVA OCR**과 **OpenAI GPT-4o-mini**를 활용하여 영수증을 자동으로 인식하고 파싱합니다.

## 🏗️ 아키텍처

```
영수증 이미지
    ↓
[Supabase Edge Function: clova-ocr]
    ├─ 1. CLOVA OCR API로 텍스트 추출
    ├─ 2. GPT-4o-mini로 스마트 파싱 (우선순위)
    └─ 3. 실패 시 Raw 데이터 반환
    ↓
[클라이언트]
    ├─ GPT 파싱 결과 수신 → 사용
    └─ Raw 데이터 수신 → 자체 OcrEngine으로 폴백 파싱
```

## 🔑 환경 변수 설정

### 1. Supabase Edge Function 환경 변수

Supabase Dashboard 또는 CLI로 다음 환경 변수를 설정하세요:

#### **필수 변수**

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `CLOVA_OCR_API_URL` | 네이버 CLOVA OCR API URL | `https://...apigw.ntruss.com/...` |
| `CLOVA_OCR_SECRET_KEY` | CLOVA OCR Secret Key | `your-secret-key` |

#### **선택 변수** (GPT 파싱 사용 시)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-proj-...` |

> [!IMPORTANT]
> `OPENAI_API_KEY`가 설정되지 않으면 자동으로 자체 파서로 폴백됩니다. 기능은 정상 작동하나 정확도가 낮아질 수 있습니다.

### 2. 환경 변수 설정 방법

#### **Supabase Dashboard 사용**

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Edge Functions** → **clova-ocr** 선택
3. **Settings** → **Secrets** 탭
4. 각 변수 추가:
   - Name: `CLOVA_OCR_API_URL` / Value: `your-url`
   - Name: `CLOVA_OCR_SECRET_KEY` / Value: `your-key`
   - Name: `OPENAI_API_KEY` / Value: `sk-...`
5. **Save** 클릭

#### **Supabase CLI 사용**

```bash
# 환경 변수 설정
supabase secrets set CLOVA_OCR_API_URL=https://...
supabase secrets set CLOVA_OCR_SECRET_KEY=your-secret-key
supabase secrets set OPENAI_API_KEY=sk-proj-...

# 확인
supabase secrets list
```

## 🚀 배포

### Edge Function 배포

```bash
# 로그인 (처음 한 번만)
supabase login

# 프로젝트 연결 (처음 한 번만)
supabase link --project-ref your-project-id

# Edge Function 배포
supabase functions deploy clova-ocr
```

배포 후 즉시 반영되며, 재배포 없이 환경 변수만 변경 가능합니다.

## 🧪 로컬 테스트

### 1. 환경 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```env
# CLOVA OCR (필수)
CLOVA_OCR_API_URL=https://...apigw.ntruss.com/...
CLOVA_OCR_SECRET_KEY=your-secret-key

# OpenAI (선택)
OPENAI_API_KEY=sk-proj-...
```

### 2. Supabase CLI로 로컬 실행

```bash
# Edge Function 로컬 서버 시작
supabase functions serve clova-ocr --env-file .env.local

# 테스트 요청 (PowerShell)
$base64Image = [Convert]::ToBase64String([IO.File]::ReadAllBytes("receipt.jpg"))
Invoke-RestMethod `
  -Uri "http://localhost:54321/functions/v1/clova-ocr" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{imageBase64=$base64Image; imageFormat="jpg"} | ConvertTo-Json)
```

## 🔐 API 키 발급 방법

### CLOVA OCR

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 접속
2. **AI·NAVER API** → **CLOVA OCR** 선택
3. **Application 등록** → API 키 발급
4. **Invoke URL**과 **Secret Key** 복사

### OpenAI

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. **API Keys** → **Create new secret key**
3. 키 복사 (한 번만 표시됨)
4. GPT-4o-mini 사용 권한 확인

## ❓ 문제 해결

### Q: GPT 파싱이 작동하지 않아요
A: `OPENAI_API_KEY`가 Supabase Secrets에 올바르게 설정되었는지 확인하세요.

```bash
supabase secrets list
```

### Q: CLOVA OCR API 오류가 발생해요
A: Secret Key와 API URL이 정확한지 확인하세요. Edge Function 로그를 확인할 수 있습니다:

```bash
supabase functions logs clova-ocr
```

### Q: 환경 변수를 변경했는데 적용이 안 돼요
A: Secrets 변경은 즉시 반영됩니다. Edge Function 재배포는 필요 없습니다.

### Q: 로컬 테스트가 안 돼요
A: `.env.local` 파일 경로와 내용을 확인하고, Supabase CLI가 최신 버전인지 확인하세요:

```bash
supabase --version
supabase update
```

## 📊 파싱 우선순위

1. **GPT-4o-mini** (OPENAI_API_KEY 설정 시) - 가장 정확
2. **자체 OcrEngine** (폴백) - 기본 파싱

GPT가 실패하거나 API 키가 없어도 서비스는 정상 작동합니다.
