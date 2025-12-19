import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || '✅',
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #86efac',
    },
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    duration: options?.duration || 4000,
    icon: options?.icon || '❌',
    style: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fca5a5',
    },
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || 'ℹ️',
    style: {
      background: '#dbeafe',
      color: '#1e40af',
      border: '1px solid #93c5fd',
    },
  });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast(message, {
    duration: options?.duration || 3000,
    icon: options?.icon || '⚠️',
    style: {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde047',
    },
  });
};

export const showActionToast = (
  message: string,
  actionLabel: string,
  onAction: () => void,
  options?: ToastOptions
) => {
  const toastId = toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>{message}</span>
        <button
          onClick={() => {
            onAction();
            toast.dismiss(t.id);
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
        >
          {actionLabel}
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          ✕
        </button>
      </div>
    ),
    {
      duration: options?.duration || 5000,
      style: {
        background: '#fff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
      },
    }
  );

  return toastId;
};
