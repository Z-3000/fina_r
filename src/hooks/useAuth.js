import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, onAuthStateChange } from '../lib/supabase';
import { authAPI } from '../services/supabaseApi';
import { useToast } from '../context/ToastContext';

/**
 * 인증 관련 상태와 함수를 관리하는 훅
 * - 로그인/로그아웃/회원가입
 * - 세션 관리
 * - 인증 상태 추적
 */
export function useAuth(options = {}) {
  const { onAuthSuccess, onLogout } = options;
  const toast = useToast();

  // 콜백을 ref로 저장하여 useEffect 의존성 문제 방지
  const onAuthSuccessRef = useRef(onAuthSuccess);
  const onLogoutRef = useRef(onLogout);

  // 콜백이 변경되면 ref 업데이트
  useEffect(() => {
    onAuthSuccessRef.current = onAuthSuccess;
    onLogoutRef.current = onLogout;
  });

  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 세션 체크 중

  // 폼 상태
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 세션 체크 + 인증 상태 변화 구독
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        onAuthSuccessRef.current?.(session.user);
      }
      setIsLoading(false);
    });

    // 인증 상태 변화 리스너
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        onAuthSuccessRef.current?.(session.user);
        clearForm();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        onLogoutRef.current?.();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // 의존성 제거 - ref를 통해 최신 콜백 사용

  // 폼 초기화
  const clearForm = useCallback(() => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError('');
  }, []);

  // 이메일 로그인
  const handleEmailLogin = useCallback(async () => {
    if (!authEmail || !authPassword) {
      setAuthError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setAuthError('');
    setIsSubmitting(true);
    try {
      await authAPI.signIn(authEmail, authPassword);
      // onAuthStateChange에서 처리됨
    } catch (error) {
      setAuthError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [authEmail, authPassword]);

  // 이메일 회원가입
  const handleEmailSignup = useCallback(async () => {
    if (!authEmail || !authPassword) {
      setAuthError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setAuthError('');
    setIsSubmitting(true);
    try {
      await authAPI.signUp(authEmail, authPassword, authName);
      setAuthError('가입 확인 이메일을 확인해주세요.');
      clearForm();
    } catch (error) {
      setAuthError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [authEmail, authPassword, authName, clearForm]);

  // 카카오 로그인
  const handleKakaoLogin = useCallback(async () => {
    setAuthError('');
    try {
      await authAPI.signInWithKakao();
    } catch (error) {
      setAuthError(error.message || '카카오 로그인에 실패했습니다.');
    }
  }, []);

  // 로그아웃
  const handleLogout = useCallback(async () => {
    try {
      await authAPI.signOut();
      toast.info('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast.error('로그아웃에 실패했습니다.');
    }
  }, [toast]);

  return {
    // 인증 상태
    isAuthenticated,
    currentUser,
    isLoading, // 초기 세션 체크 중
    isSubmitting, // 로그인/회원가입 진행 중

    // 폼 상태
    authMode,
    setAuthMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authName,
    setAuthName,
    authError,
    setAuthError,

    // 액션
    handleEmailLogin,
    handleEmailSignup,
    handleKakaoLogin,
    handleLogout,
    clearForm,
  };
}

export default useAuth;
