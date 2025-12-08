# Edge Function 수동 배포 가이드

Supabase CLI 없이 Edge Function을 배포하는 방법입니다.

## 1. Supabase Dashboard 접속

1. [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Edge Functions** 클릭

## 2. clova-ocr 함수 찾기

- 기존에 `clova-ocr` 함수가 있으면 클릭
- 없으면 **Create a new function** → 이름: `clova-ocr`

## 3. 코드 업데이트

**다음 파일 내용을 복사하여 붙여넣기:**

파일 경로: `c:\git\fina_r\supabase\functions\clova-ocr\index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * GPT-4o-mini로 OCR 텍스트 파싱
 */
async function parseWithGpt(ocrRawText: string, openaiApiKey: string) {
  try {
    const client = new OpenAI({ apiKey: openaiApiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 영수증 OCR 텍스트를 구조화하는 전문가입니다. 
다음 규칙을 따르세요:
1. 상호명은 가장 상단에 있는 가게 이름입니다
2. 금액은 "합계", "총액", "결제금액" 등의 최종 결제 금액입니다
3. 날짜는 YYYY-MM-DD 형식으로 반환합니다
4. 카테고리는 다음 중 하나: 식비, 편의점, 마트/식료품, 생활용품, 교통, 문화/여가, 도서/교육, 의료, 쇼핑, 통신, 기타
5. items는 구매한 상품 목록입니다 (있는 경우만)

JSON만 반환하고 다른 설명은 하지 마세요.`
        },
        {
          role: "user",
          content: `다음 영수증 텍스트를 파싱해주세요:\n\n${ocrRawText}\n\nJSON 형식:\n{\n  "merchant": "상호명",\n  "amount": 숫자,\n  "date": "YYYY-MM-DD",\n  "category": "카테고리",\n  "items": [{"name": "상품명", "price": 가격, "qty": 수량}]\n}`
        }
      ],
      temperature: 0,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content?.trim() || '';

    // JSON 추출 (```json ... ``` 형식일 수 있음)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonText);

    return {
      success: true,
      data: {
        merchant: parsed.merchant || '',
        amount: parsed.amount || 0,
        date: parsed.date || new Date().toISOString().split('T')[0],
        category: parsed.category || '기타',
        items: parsed.items || [],
        confidence: 1.0,
        source: 'gpt-4o-mini'
      }
    };
  } catch (error) {
    console.error('[GPT-PARSER] Parsing failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

Deno.serve(async (req: Request) => {
  console.log('[CLOVA-OCR] Request received:', req.method);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageBase64, imageFormat = 'jpg' } = body;

    console.log('[CLOVA-OCR] Image format:', imageFormat);
    console.log('[CLOVA-OCR] Image data length:', imageBase64?.length || 0);

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: '이미지 데이터가 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 환경변수에서 CLOVA OCR API 키 가져오기
    const CLOVA_OCR_API_URL = Deno.env.get('CLOVA_OCR_API_URL');
    const CLOVA_OCR_SECRET_KEY = Deno.env.get('CLOVA_OCR_SECRET_KEY');

    console.log('[CLOVA-OCR] API URL exists:', !!CLOVA_OCR_API_URL);
    console.log('[CLOVA-OCR] Secret Key exists:', !!CLOVA_OCR_SECRET_KEY);

    if (!CLOVA_OCR_API_URL || !CLOVA_OCR_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'CLOVA OCR API 설정이 필요합니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CLOVA OCR API 호출
    const requestBody = {
      version: 'V2',
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
      images: [
        {
          format: imageFormat,
          name: 'receipt',
          data: imageBase64,
        },
      ],
    };

    console.log('[CLOVA-OCR] Calling CLOVA API...');
    const startTime = Date.now();

    const response = await fetch(CLOVA_OCR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': CLOVA_OCR_SECRET_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[CLOVA-OCR] API response: ${response.status} (${elapsed}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CLOVA-OCR] API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'OCR 처리 실패', details: errorText, status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ocrResult = await response.json();
    console.log('[CLOVA-OCR] OCR result received');

    // GPT 파싱 시도 (OpenAI API 키가 있는 경우)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (OPENAI_API_KEY) {
      console.log('[GPT-PARSER] Attempting GPT parsing...');
      
      // Raw 텍스트 추출
      const fields = ocrResult.images?.[0]?.fields || [];
      const rawText = fields.map((f: any) => f.inferText).join('\n');
      
      const gptResult = await parseWithGpt(rawText, OPENAI_API_KEY);
      
      if (gptResult.success) {
        console.log('[GPT-PARSER] Success! Returning parsed data');
        return new Response(
          JSON.stringify({
            success: true,
            data: gptResult.data,
            parsed: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.warn('[GPT-PARSER] Failed, falling back to raw CLOVA data:', gptResult.error);
      }
    } else {
      console.log('[GPT-PARSER] OpenAI API key not set, returning raw CLOVA data');
    }

    // GPT 실패 또는 API 키 없음 → Raw CLOVA 데이터 반환 (클라이언트에서 폴백 파서 사용)
    return new Response(
      JSON.stringify(ocrResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[CLOVA-OCR] Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## 4. 환경 변수 설정

**Settings** → **Secrets** 탭에서 다음 변수들이 **모두** 설정되어 있는지 확인:

- `CLOVA_OCR_API_URL` ✅
- `CLOVA_OCR_SECRET_KEY` ✅
- `OPENAI_API_KEY` ✅ (개인 키 입력!)

## 5. Deploy 버튼 클릭

코드를 붙여넣고 **Deploy** 버튼을 클릭합니다.

## 6. 테스트

앱을 새로고침하고 영수증을 다시 업로드해보세요!
