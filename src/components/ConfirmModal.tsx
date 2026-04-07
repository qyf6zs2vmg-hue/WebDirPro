import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className={cn(variant === 'danger' ? "text-red-500" : "text-blue-500")} size={20} />
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-foreground rounded-full hover:bg-input">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 bg-input text-foreground font-bold rounded-xl hover:bg-border transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "flex-1 py-2.5 text-white font-bold rounded-xl transition-colors shadow-lg",
              variant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
