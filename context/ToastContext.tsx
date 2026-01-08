import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', position?: 'top' | 'bottom') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastPosition, setToastPosition] = useState<'top' | 'bottom'>('top');

  const showToast = (message: string, type?: 'success' | 'error' | 'info', position?: 'top' | 'bottom') => {
    setToastMessage(message);
    setToastType(type || 'info');
    setToastPosition(position || 'top');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Hide toast after 3 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && <Toast message={toastMessage} type={toastType} position={toastPosition} />}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
