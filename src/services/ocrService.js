/**
 * OCR 서비스
 * - 네이버 CLOVA OCR (Supabase Edge Function 경유)
 * - GPT-4o-mini를 사용한 스마트 파싱 (Edge Function에서 처리)
 */

import { supabase } from '../lib/supabase';
import { OcrEngine } from './ocr/core/OcrEngine';

/**
 * 이미지를 Base64로 변환
 */
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 이미지 포맷 추출
 */
const getImageFormat = (file) => {
  const type = file.type.toLowerCase();
  if (type.includes('png')) return 'png';
  if (type.includes('gif')) return 'gif';
  if (type.includes('bmp')) return 'bmp';
  if (type.includes('tiff')) return 'tiff';
  return 'jpg';
};

/**
 * CLOVA OCR로 영수증 인식 (Supabase Edge Function 경유)
 * Edge Function에서 GPT 파싱을 시도하고, 실패 시 raw 데이터 반환
 */
export const processWithClovaOcr = async (imageFile, onProgress) => {
  try {
    onProgress?.(10);

    const imageBase64 = await imageToBase64(imageFile);
    const imageFormat = getImageFormat(imageFile);

    onProgress?.(30);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\s/g, '');
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/\s/g, '');

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/clova-ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        imageBase64,
        imageFormat,
      }),
    });

    onProgress?.(60);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CLOVA OCR Edge Function 오류:', response.status, errorText);
      throw new Error(`Edge Function 오류: ${response.status}`);
    }

    const data = await response.json();

    onProgress?.(80);

    // Edge Function에서 GPT로 파싱된 데이터 (우선순위 1)
    if (data.success && data.parsed && data.data) {
      console.log('[OCR] GPT 파싱 결과 수신');
      onProgress?.(100);
      return data.data;
    }

    // 레거시 호환성: 이미 파싱된 데이터
    if (data.success && data.data) {
      onProgress?.(100);
      return {
        ...data.data,
        source: 'clova-legacy',
      };
    }

    // Raw CLOVA 응답 처리 (GPT 실패 또는 API 키 없음)
    if (!data.images || !data.images[0]) {
      console.error('Invalid OCR Response:', data);
      throw new Error(`OCR 응답 형식이 올바르지 않습니다.`);
    }

    const ocrImage = data.images[0];
    if (ocrImage.inferResult === 'FAILURE') {
      throw new Error('이미지 인식에 실패했습니다.');
    }

    console.log('[OCR] Raw CLOVA 데이터 → 자체 엔진으로 파싱');

    // 자체 파싱 엔진 사용 (폴백)
    const engine = new OcrEngine();
    const result = engine.process(ocrImage);

    onProgress?.(100);

    return result;

  } catch (error) {
    console.error('CLOVA OCR 처리 실패:', error);
    throw error;
  }
};

/**
 * 이미지 파일에서 영수증 정보 추출
 */
export const processReceiptImage = async (imageFile, onProgress) => {
  return await processWithClovaOcr(imageFile, onProgress);
};

/**
 * 이미지 미리보기 URL 생성
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 이미지 압축
 */
export const compressImage = async (file, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default {
  processReceiptImage,
  processWithClovaOcr,
  createImagePreview,
  compressImage,
};
