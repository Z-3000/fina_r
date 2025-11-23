import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 공백 및 줄바꿈 문자 모두 제거 (내부 공백 포함)
const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.replace(/\s/g, '') : '';
const supabaseAnonKey = rawSupabaseAnonKey ? rawSupabaseAnonKey.replace(/\s/g, '') : '';

// 디버깅 로그 (문제 해결 후에는 제거 가능하지만, 안전을 위해 남겨둠)
if (rawSupabaseUrl && rawSupabaseUrl !== supabaseUrl) {
  console.warn('⚠️ Supabase URL에서 공백을 제거했습니다.');
}
if (rawSupabaseAnonKey && rawSupabaseAnonKey !== supabaseAnonKey) {
  console.warn('⚠️ Supabase Key에서 공백/줄바꿈을 제거했습니다.');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// 현재 사용자 가져오기
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    return null;
  }
  return user;
};

// 세션 가져오기
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('세션 가져오기 실패:', error);
    return null;
  }
  return session;
};

export default supabase;
