import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: 'bg-primary hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface border border-border-darker rounded-[16px] w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${variant === 'danger' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-text-p text-[18px] font-bold">{title}</h3>
          </div>
          
          <p className="text-text-s text-[14px] leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-text-p font-semibold bg-bg-custom border border-border-darker hover:bg-surface transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 rounded-[8px] text-text-p font-semibold transition-all shadow-lg active:scale-95 ${variantColors[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-s hover:text-text-p transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
