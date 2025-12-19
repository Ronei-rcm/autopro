interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({ size = 'md', color = '#f97316', fullScreen = false }: LoadingSpinnerProps) => {
  const sizeMap = {
    sm: '20px',
    md: '40px',
    lg: '60px',
  };

  const spinnerSize = sizeMap[size];

  const spinner = (
    <div
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
      aria-label="Carregando"
      role="status"
    />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
