import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

/**
 * Componente de modal responsivo que se adapta a diferentes tamanhos de tela
 */
export const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ResponsiveModalProps) => {
  const { isMobile } = useResponsive();

  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tamanhos para desktop
  const sizeMap: Record<string, string> = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    full: '100%',
  };

  const modalWidth = isMobile ? '100%' : sizeMap[size];
  const modalHeight = isMobile ? '100vh' : 'auto';
  const modalMaxHeight = isMobile ? '100vh' : '90vh';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? 0 : '1rem',
        animation: 'fadeIn 0.2s ease-in-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '16px 16px 0 0' : '12px',
          padding: isMobile ? '1rem' : '2rem',
          width: modalWidth,
          height: modalHeight,
          maxHeight: modalMaxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: isMobile ? 'slideInUp 0.3s ease-out' : 'fadeInUp 0.2s ease-out',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: title ? '1rem' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                  e.currentTarget.style.color = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#64748b';
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onTouchEnd={(e) => {
                  setTimeout(() => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }, 200);
                }}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

