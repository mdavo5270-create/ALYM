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
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--ink-dim)]">{subtitle}</p>}
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
      ? 'text-[var(--alym-rise)]'
      : tone === 'warn'
        ? 'text-signal-warn'
        : tone === 'bad'
          ? 'text-[var(--alym-fall)]'
          : tone === 'brass'
            ? 'text-[var(--alym-flare)]'
            : 'text-white';
  return (
    <div className="panel-soft p-4">
      <div className="label-caps">{label}</div>
      <div className={`mt-2 text-2xl font-semibold data-num ${toneCls}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--ink-dim)]">{hint}</div>}
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
    neutral: 'bg-white/10 text-[var(--ink)]',
    good: 'bg-[var(--alym-rise)]/15 text-[var(--alym-rise)]',
    warn: 'bg-amber-500/15 text-amber-300',
    bad: 'bg-[var(--alym-fall)]/15 text-[var(--alym-fall)]',
    brass: 'bg-[var(--alym-flare)]/15 text-[var(--alym-flare)]',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'brass',
  className = '',
}: {
  value: number;
  max?: number;
  tone?: 'brass' | 'good' | 'bad';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar =
    tone === 'good' ? 'bg-[var(--alym-rise)]' : tone === 'bad' ? 'bg-[var(--alym-fall)]' : 'bg-[var(--alym-flare)]';
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
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
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="panel relative z-10 w-full max-w-md animate-enter p-5 shadow-lift">
        {(title || onClose) && (
          <div className="mb-4 flex items-start justify-between gap-3">
            {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : <span />}
            {onClose && (
              <button type="button" className="btn-ghost px-2 py-1 text-[var(--ink-dim)]" onClick={onClose} aria-label="Fermer">
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Rating({ value }: { value: number }) {
  const tone = value >= 80 ? 'text-amber-300' : value >= 70 ? 'text-slate-100' : 'text-[var(--ink-dim)]';
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
      <p className="text-sm font-medium text-slate-200">{title}</p>
      {body && <p className="mt-1 max-w-sm text-xs text-[var(--ink-dim)]">{body}</p>}
    </div>
  );
}

export function money(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}
