'use client';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

export function Toast({ message, icon, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      animation: 'toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
    }}>
      <div style={{
        background: 'white',
        border: '1.5px solid #FFD84D',
        borderRadius: '999px',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        fontSize: '14px',
        fontWeight: 500,
        color: '#374151',
        whiteSpace: 'nowrap',
      }}>
        {icon && (
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#FFF9E6', border: '1.5px solid #FFD84D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </span>
        )}
        {message}
      </div>
    </div>
  );
}
