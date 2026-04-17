import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle style={{ color: 'var(--primary)' }} size={20} />,
    error: <AlertCircle style={{ color: '#EF4444' }} size={20} />,
    info: <Info style={{ color: 'var(--primary)' }} size={20} />,
    warning: <Bell style={{ color: '#F59E0B' }} size={20} />,
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ 
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '380px', width: '100%'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)', borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.1)',
              animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div style={{ flexShrink: 0 }}>{icons[toast.type] || icons.info}</div>
            <p style={{ flex: 1, margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ padding: '0.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '6px' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

