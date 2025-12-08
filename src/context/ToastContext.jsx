import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import ToastContainer from '../components/common/ToastContainer';

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    setToasts((t) => {
      // 동일 메시지 중복 방지
      if (t.some((item) => item.message === message && item.type === type)) {
        return t;
      }
      const id = ++idSeq;
      setTimeout(() => remove(id), duration);
      return [...t, { id, type, message }];
    });
  }, [remove]);

  const api = useMemo(() => ({
    success: (msg) => push('success', msg),
    error: (msg) => push('error', msg),
    info: (msg) => push('info', msg),
    warning: (msg) => push('warning', msg),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}

export default ToastContext;
