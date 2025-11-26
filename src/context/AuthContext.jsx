import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext(null);

/**
 * AuthProvider - 인증 상태를 전역으로 제공
 *
 * 사용법:
 * 1. App을 AuthProvider로 감싸기
 * 2. 하위 컴포넌트에서 useAuthContext() 사용
 */
export function AuthProvider({ children, onAuthSuccess, onLogout }) {
  const auth = useAuth({ onAuthSuccess, onLogout });

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext - AuthContext에서 인증 정보 가져오기
 *
 * 반환값:
 * - isAuthenticated: 로그인 여부
 * - currentUser: 현재 사용자
 * - isLoading: 초기 세션 체크 중
 * - handleEmailLogin, handleEmailSignup, handleLogout 등
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
