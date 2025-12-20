import { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  initialSignature?: string;
}

function SignaturePad({ onSave, onCancel, initialSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Se houver assinatura inicial, desenhar
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }

    let isDrawingNow = false;

    // Eventos de mouse
    const startDrawing = (e: MouseEvent) => {
      isDrawingNow = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawingNow) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
      setHasSignature(true);
    };

    const stopDrawing = () => {
      isDrawingNow = false;
    };

    // Eventos de touch (mobile)
    const startDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingNow = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      ctx.beginPath();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const drawTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingNow) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
      setHasSignature(true);
    };

    const stopDrawingTouch = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingNow = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawingTouch);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawingTouch);
      canvas.removeEventListener('touchmove', drawTouch);
      canvas.removeEventListener('touchend', stopDrawingTouch);
    };
  }, [initialSignature]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signature = canvas.toDataURL('image/png');
    onSave(signature);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          backgroundColor: 'white',
          position: 'relative',
          width: '100%',
          height: '200px',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={clear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
          }}
        >
          <RotateCcw size={16} />
          Limpar
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasSignature}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: hasSignature ? '#10b981' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: hasSignature ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}
          >
            Salvar Assinatura
          </button>
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
        Assine no campo acima usando o mouse ou o dedo (em dispositivos touch)
      </p>
    </div>
  );
}

export default SignaturePad;
