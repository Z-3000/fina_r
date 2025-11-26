import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../constants/colors';

const typeConfig = {
  success: {
    background: COLORS.success.main,
    color: COLORS.success.text,
    Icon: CheckCircle,
  },
  error: {
    background: COLORS.error.main,
    color: '#FFFFFF',
    Icon: AlertCircle,
  },
  info: {
    background: COLORS.info.main,
    color: COLORS.info.text,
    Icon: Info,
  },
  warning: {
    background: COLORS.warning.main,
    color: COLORS.warning.text,
    Icon: AlertTriangle,
  },
};

export default function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map((t) => {
        const config = typeConfig[t.type] || typeConfig.info;
        const IconComponent = config.Icon;

        return (
          <div
            key={t.id}
            style={{
              ...toastStyle,
              background: config.background,
              color: config.color,
            }}
          >
            <IconComponent size={18} style={{ flexShrink: 0 }} />
            <span style={messageStyle}>{t.message}</span>
            <button
              onClick={() => onClose(t.id)}
              style={{
                ...closeButtonStyle,
                color: config.color,
              }}
              aria-label="닫기"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  top: 16,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 9999,
  pointerEvents: 'none',
};

const toastStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 16px',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  minWidth: 280,
  maxWidth: 400,
  pointerEvents: 'auto',
  animation: 'slideIn 0.2s ease-out',
};

const messageStyle = {
  flex: 1,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.4,
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.8,
  transition: 'opacity 0.2s',
  flexShrink: 0,
};
