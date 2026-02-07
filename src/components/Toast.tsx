import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
}

/**
 * Toast component untuk feedback aksi (copy link, dll)
 */
export const Toast: React.FC<ToastProps> = ({ message, isVisible, onHide, duration = 2500 }) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onHide]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl animate-reveal"
      role="status"
      aria-live="polite"
    >
      <Check size={20} className="text-green-400 shrink-0" />
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};
