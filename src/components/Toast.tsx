import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300",
      type === 'success' ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-400" :
      type === 'error' ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-400" :
      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-400"
    )}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
};
