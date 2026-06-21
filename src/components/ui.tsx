import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-dark-700 tracking-tight">{label}</label>}
      <input
        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-dark-900 placeholder-dark-700/30 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all duration-150 shadow-card ${
          error ? 'border-red-300 focus:ring-red-300/40' : 'border-dark-200/60 hover:border-dark-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-dark-700/50">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-dark-700 tracking-tight">{label}</label>}
      <textarea
        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-dark-900 placeholder-dark-700/30 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 resize-none transition-all duration-150 shadow-card ${
          error ? 'border-red-300' : 'border-dark-200/60 hover:border-dark-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-dark-700/50">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-dark-700 tracking-tight">{label}</label>}
      <select
        className={`w-full px-3.5 py-2.5 text-sm bg-white border border-dark-200/60 rounded-xl text-dark-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-all shadow-card ${className}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'blue' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'blue', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  const variants = {
    primary:   'bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-lg disabled:opacity-50',
    blue:      'bg-brand-600 text-white hover:bg-brand-700 shadow-blue hover:shadow-blue-lg disabled:opacity-50',
    secondary: 'bg-dark-100 text-dark-800 hover:bg-dark-200 disabled:opacity-40',
    ghost:     'bg-transparent text-dark-700 hover:bg-dark-100 disabled:opacity-40',
    danger:    'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
  };
  const sizes = {
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-sm gap-2',
  };
  return (
    <button
      className={`inline-flex items-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-dark-200/50 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function BlueCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-brand-600 rounded-2xl text-white ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    gray:   'bg-dark-100 text-dark-700',
    blue:   'bg-brand-50 text-brand-700 border border-brand-100',
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
    red:    'bg-red-50 text-red-600 border border-red-100',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-bold text-dark-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-dark-700/60 mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function Divider() {
  return <hr className="border-dark-200/40 my-6" />;
}

export function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="bg-brand-600 rounded-2xl p-5 text-white">
      <div className="text-3xl font-extrabold leading-none mb-1">{value}</div>
      <div className="text-sm font-semibold text-blue-100">{label}</div>
      {sub && <div className="text-xs text-blue-200/70 mt-0.5">{sub}</div>}
    </div>
  );
}

export function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  label?: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = React.useState('');

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) onAdd(val);
      setInput('');
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-dark-700 tracking-tight">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-dark-200/60 rounded-xl bg-white min-h-[44px] focus-within:ring-2 focus-within:ring-brand-500/40 focus-within:border-brand-400 transition-all shadow-card">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 text-xs px-2.5 py-1 rounded-lg font-medium">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="text-brand-400 hover:text-brand-600 ml-0.5 font-bold leading-none">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tags.length === 0 ? (placeholder ?? 'Type and press Enter') : ''}
          className="flex-1 min-w-[100px] text-xs outline-none text-dark-900 bg-transparent"
        />
      </div>
    </div>
  );
}

export function BulletListInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const handleChange = (i: number, val: string) => {
    const next = [...items]; next[i] = val; onChange(next);
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = [...items]; next.splice(i + 1, 0, ''); onChange(next);
    }
    if (e.key === 'Backspace' && items[i] === '' && items.length > 1) {
      e.preventDefault();
      onChange(items.filter((_, idx) => idx !== i));
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-dark-700 tracking-tight">{label}</label>}
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-brand-400 font-bold text-sm flex-shrink-0">•</span>
            <input
              value={item}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              placeholder={placeholder ?? 'Add bullet point…'}
              className="flex-1 px-3 py-2 text-sm border border-dark-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 text-dark-900 bg-white shadow-card transition-all"
            />
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 mt-1">
          + Add bullet
        </button>
      </div>
    </div>
  );
}
