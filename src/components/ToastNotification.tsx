

import React from 'react';
import { Toast } from '../types';

interface ToastNotificationProps {
  toasts: Toast[];
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="flex items-center gap-3 bg-text-primary text-bg-primary font-bold p-3 rounded-lg shadow-2xl animate-toast"
        >
          {toast.icon && <span className="text-xl">{toast.icon}</span>}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;