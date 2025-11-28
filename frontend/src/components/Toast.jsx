import { useEffect } from 'preact/hooks';
import { CheckCircle, XCircle, Info } from 'lucide-preact';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div class={`toast toast-${type}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
