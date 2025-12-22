import { TextareaHTMLAttributes, forwardRef } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente de textarea responsivo otimizado para mobile e desktop
 */
export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ label, error, helperText, className = '', style: containerStyle, ...props }, ref) => {
    const { isMobile } = useResponsive();

    return (
      <div style={{ marginBottom: '1rem', ...containerStyle }}>
        {label && (
          <label
            htmlFor={props.id}
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              fontWeight: '600',
              color: error ? '#ef4444' : '#1e293b',
            }}
          >
            {label}
            {props.required && (
              <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          {...props}
          style={{
            width: '100%',
            padding: isMobile ? '0.875rem' : '0.75rem',
            fontSize: isMobile ? '16px' : '0.9rem', // 16px previne zoom no iOS
            border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s',
            backgroundColor: props.disabled ? '#f8fafc' : 'white',
            color: props.disabled ? '#64748b' : '#1e293b',
            resize: 'vertical',
            minHeight: isMobile ? '100px' : '80px',
            fontFamily: 'inherit',
            lineHeight: '1.5',
          }}
          className={className}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#f97316';
            e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)'}`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        />
        {error && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

