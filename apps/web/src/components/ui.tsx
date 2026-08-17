import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`panel ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-mist-50 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mist-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'brass';
}) {
  const toneCls =
    tone === 'good'
      ? 'text-signal-good'
      : tone === 'warn'
        ? 'text-signal-warn'
        : tone === 'bad'
          ? 'text-signal-bad'
          : tone === 'brass'
            ? 'text-brass-400'
            : 'text-mist-50';
  return (
    <div className="panel-soft p-4">
      <div className="label-caps">{label}</div>
      <div className={`mt-2 text-2xl font-semibold data-num ${toneCls}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-mist-400">{hint}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'brass';
}) {
  const map = {
    neutral: 'bg-ink-700 text-mist-200',
    good: 'bg-signal-good/15 text-signal-good',
    warn: 'bg-signal-warn/15 text-signal-warn',
    bad: 'bg-signal-bad/15 text-signal-bad',
    brass: 'bg-brass-500/15 text-brass-300',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, max = 100, tone = 'brass' }: { value: number; max?: number; tone?: 'brass' | 'good' | 'bad' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar =
    tone === 'good' ? 'bg-signal-good' : tone === 'bad' ? 'bg-signal-bad' : 'bg-brass-400';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const v =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : variant === 'danger'
          ? 'btn-danger'
          : 'btn-ghost';
  return (
    <button className={`${v} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="field" {...props} />;
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="panel relative z-10 w-full max-w-md animate-enter p-5 shadow-lift">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-mist-50">{title}</h2>
          {onClose && (
            <button type="button" className="btn-ghost px-2 py-1 text-mist-400" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Rating({ value }: { value: number }) {
  const tone = value >= 80 ? 'text-brass-300' : value >= 70 ? 'text-mist-100' : 'text-mist-400';
  return <span className={`data-num font-semibold ${tone}`}>{value}</span>;
}

export function PosBadge({ pos }: { pos: string }) {
  const p = pos.toUpperCase();
  const tone =
    p === 'GK' ? 'brass' : p === 'DF' || p === 'CB' || p === 'FB' ? 'neutral' : p === 'FW' || p === 'ST' ? 'bad' : 'good';
  return <Badge tone={tone as 'neutral' | 'good' | 'bad' | 'brass'}>{p}</Badge>;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="panel-soft flex flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-sm font-medium text-mist-200">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs text-mist-400">{body}</p>}
    </div>
  );
}

export function money(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}
