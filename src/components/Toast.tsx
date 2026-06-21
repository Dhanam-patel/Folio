import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Toast() {
  const { toast, clearToast } = useApp();
  if (!toast) return null;

  const styles = {
    success: 'bg-dark-900 border-emerald-500/30 text-white',
    error:   'bg-dark-900 border-red-500/30 text-white',
    info:    'bg-dark-900 border-brand-500/30 text-white',
  };
  const iconStyles = {
    success: 'text-emerald-400',
    error:   'text-red-400',
    info:    'text-brand-400',
  };
  const icons = {
    success: <CheckCircle size={15} />,
    error:   <XCircle size={15} />,
    info:    <Info size={15} />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${styles[toast.type]}`}>
        <span className={iconStyles[toast.type]}>{icons[toast.type]}</span>
        <span className="text-white/90">{toast.text}</span>
        <button onClick={clearToast} className="ml-1 text-white/40 hover:text-white/80 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
