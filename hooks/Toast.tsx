import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <div className="flex items-center gap-3 bg-[#18181b] border border-white/10 text-white px-5 py-3 rounded-full shadow-2xl shadow-black/50 backdrop-blur-md">
        {type === 'success' ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : (
          <XCircle size={18} className="text-red-400" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};