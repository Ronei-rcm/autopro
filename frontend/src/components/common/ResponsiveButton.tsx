import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Componente de botão responsivo otimizado para mobile e desktop
 */
export const ResponsiveButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ResponsiveButtonProps) => {
  const { isMobile } = useResponsive();

  const variantStyles = {
    primary: {
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      hoverBg: '#ea580c',
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      hoverBg: '#e2e8f0',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      hoverBg: '#dc2626',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#64748b',
      border: 'none',
      hoverBg: '#f8fafc',
    },
  };

  const sizeStyles = {
    sm: {
      padding: isMobile ? '0.625rem 1rem' : '0.5rem 0.75rem',
      fontSize: isMobile ? '0.9rem' : '0.875rem',
      minHeight: '36px',
    },
    md: {
      padding: isMobile ? '0.875rem 1.5rem' : '0.75rem 1.5rem',
      fontSize: isMobile ? '1rem' : '0.9rem',
      minHeight: '44px', // Touch-friendly
    },
    lg: {
      padding: isMobile ? '1rem 2rem' : '0.875rem 2rem',
      fontSize: isMobile ? '1.125rem' : '1rem',
      minHeight: '48px',
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: '600',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled || loading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...currentSize,
        backgroundColor: currentVariant.backgroundColor,
        color: currentVariant.color,
        border: currentVariant.border,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && !isMobile) {
          e.currentTarget.style.backgroundColor = currentVariant.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && !isMobile) {
          e.currentTarget.style.backgroundColor = currentVariant.backgroundColor;
        }
      }}
      onTouchStart={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onTouchEnd={(e) => {
        setTimeout(() => {
          e.currentTarget.style.opacity = disabled || loading ? '0.6' : '1';
          e.currentTarget.style.transform = 'scale(1)';
        }, 150);
      }}
    >
      {loading ? (
        <>
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

