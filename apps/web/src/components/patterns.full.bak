/**
 * ALYM visual patterns — extracted from FC 26 Career UX structure
 * (hierarchy / density / selection / metric tiles), original ALYM branding.
 */
import { ReactNode } from 'react';

/** Gradient status tile — Fanbase / Youth / Finance pattern */
export function MetricTile({
  label,
  value,
  tone = 'blue',
  className = '',
}: {
  label: string;
  value: string;
  tone?: 'orange' | 'blue' | 'green' | 'purple' | 'red';
  className?: string;
}) {
  const bg =
    tone === 'orange'
      ? 'from-orange-600/90 to-orange-900/80'
      : tone === 'green'
        ? 'from-emerald-600/90 to-emerald-900/80'
        : tone === 'purple'
          ? 'from-violet-600/90 to-violet-900/80'
          : tone === 'red'
            ? 'from-rose-600/90 to-rose-900/80'
            : 'from-sky-600/90 to-sky-900/80';
  return (
    <div
      className={`flex min-h-[88px] flex-col justify-between rounded-xl bg-gradient-to-br ${bg} p-3 shadow-lg ${className}`}
    >
      <div className="text-[11px] font-medium uppercase tracking-wide text-white/80">{label}</div>
      <div className="text-[18px] font-bold leading-tight text-white sm:text-[20px]">{value}</div>
    </div>
  );
}

/** Large primary number with small caption (OVR, founded year, budget) */
export function BigStat({
  value,
  label,
  size = 'lg',
  tone = 'white',
}: {
  value: ReactNode;
  label: string;
  size?: 'md' | 'lg' | 'xl';
  tone?: 'white' | 'sky' | 'brass' | 'good' | 'bad';
}) {
  const num =
    size === 'xl' ? 'text-4xl sm:text-5xl' : size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl';
  const color =
    tone === 'sky'
      ? 'text-sky-300'
      : tone === 'brass'
        ? 'text-amber-300'
        : tone === 'good'
          ? 'text-emerald-400'
          : tone === 'bad'
            ? 'text-rose-400'
            : 'text-white';
  return (
    <div className="text-center">
      <div className={`data-num font-bold tracking-tight ${num} ${color}`}>{value}</div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/45">{label}</div>
    </div>
  );
}

/** Horizontal challenge / content strip card */
export function StripCard({
  title,
  subtitle,
  badge,
  active,
  completed,
  onClick,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  active?: boolean;
  completed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-[100px] w-[148px] shrink-0 overflow-hidden rounded-xl border text-left transition ${
        active
          ? 'border-sky-400/70 ring-1 ring-sky-400/40'
          : completed
            ? 'border-emerald-500/40'
            : 'border-white/10 hover:border-white/25'
      } bg-gradient-to-t from-black/80 via-[#0c1524] to-[#152038]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(56,120,200,0.25),transparent_55%)]" />
      {completed && (
        <span className="absolute right-1.5 top-1.5 rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
          Fait
        </span>
      )}
      {badge && !completed && (
        <span className="absolute left-1.5 top-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/80">
          {badge}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <div className="truncate text-[13px] font-semibold text-white">{title}</div>
        {subtitle && <div className="truncate text-[10px] text-white/55">{subtitle}</div>}
      </div>
    </button>
  );
}

/** Cyan selection frame — club / list selection language */
export function SelectFrame({
  selected,
  children,
  className = '',
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 bg-[#0a0e16]/90 p-4 text-left transition ${
        selected ? 'border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]' : 'border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** Immersive panel with soft stadium glow */
export function ArenaPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
      style={{
        background:
          'linear-gradient(160deg, rgba(12,28,48,0.85) 0%, rgba(8,10,16,0.95) 45%, rgba(6,8,12,1) 100%)',
      }}
    >
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Primary CTA pill — Start Job pattern */
export function StartCta({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:bg-sky-400 disabled:opacity-45"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">▶</span>
      {children}
    </button>
  );
}

/** Restriction / condition row */
export function ConditionRow({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-[12px] text-white/70">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Honour / trophy counter block */
export function HonourGrid({
  items,
}: {
  items: { label: string; value: string | number; icon?: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-black/35 px-2 py-3 text-center">
          {it.icon && <div className="mb-1 text-lg">{it.icon}</div>}
          <div className="data-num text-xl font-bold text-white">{it.value}</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wide text-white/45">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
