import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgType = {
    success: 'bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-400/20',
    error: 'bg-red-600 dark:bg-red-700 text-white border-red-400/20',
    info: 'bg-blue-600 dark:bg-blue-700 text-white border-blue-400/20'
  };
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border glass transition-all duration-300 ${bgType[type]}`}>
      {icons[type]}
      <p className="text-sm font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
