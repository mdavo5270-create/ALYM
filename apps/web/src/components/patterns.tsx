/**
 * Patterns ALYM — éditorial, filets, mono. Zéro glow / gradient SaaS.
 */
import { ReactNode } from 'react';

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
  const accent =
    tone === 'orange'
      ? 'border-l-[#c47a3a]'
      : tone === 'green'
        ? 'border-l-[var(--ok)]'
        : tone === 'purple'
          ? 'border-l-[#8a7aa8]'
          : tone === 'red'
            ? 'border-l-[var(--signal)]'
            : 'border-l-[var(--brass)]';
  return (
    <div
      className={`panel-soft flex min-h-[84px] flex-col justify-between border-l-2 p-3 ${accent} ${className}`}
    >
      <div className="label-caps">{label}</div>
      <div className="data-num text-[18px] font-medium leading-tight text-[var(--ink)] sm:text-[20px]">
        {value}
      </div>
    </div>
  );
}

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
    tone === 'sky' || tone === 'brass'
      ? 'text-[var(--brass)]'
      : tone === 'good'
        ? 'text-[var(--ok)]'
        : tone === 'bad'
          ? 'text-[var(--signal)]'
          : 'text-[var(--ink)]';
  return (
    <div>
      <div className={`data-num font-medium tracking-tight ${num} ${color}`}>{value}</div>
      <div className="mt-1 label-caps">{label}</div>
    </div>
  );
}

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
      className={`panel flex h-[100px] w-[148px] shrink-0 flex-col justify-between p-3 text-left transition ${
        active ? 'border-[var(--brass)]' : ''
      } ${completed ? 'opacity-50' : ''}`}
    >
      {badge && <span className="label-caps text-[var(--brass)]">{badge}</span>}
      <div>
        <div className="line-clamp-2 text-[13px] font-medium text-[var(--ink)]">{title}</div>
        {subtitle && <div className="mt-1 text-[11px] text-[var(--ink-dim)]">{subtitle}</div>}
      </div>
    </button>
  );
}

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
      className={`panel p-4 text-left transition ${
        selected ? 'border-[var(--brass)]' : 'hover:border-[var(--ink-faint)]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function ArenaPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`panel relative overflow-hidden border-l-2 border-l-[var(--brass)] ${className}`}>
      <div className="relative">{children}</div>
    </div>
  );
}

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
    <button type="button" disabled={disabled} onClick={onClick} className="btn-primary w-full sm:w-auto">
      {children}
    </button>
  );
}

export function ConditionRow({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--ink-dim)]">
          <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--brass)]" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function HonourGrid({
  items,
}: {
  items: { label: string; value: string | number; icon?: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="panel-soft px-2 py-3 text-center">
          <div className="data-num text-xl font-medium text-[var(--ink)]">{it.value}</div>
          <div className="mt-1 label-caps">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ChallengeStrip({
  challenges,
}: {
  challenges: { id: string; title: string; status?: string }[];
}) {
  if (!challenges?.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {challenges.map((c) => (
        <div key={c.id} className="panel-soft min-w-[160px] shrink-0 p-3">
          <div className="label-caps">{c.status ?? 'Live'}</div>
          <div className="mt-1 text-[13px] font-medium text-[var(--ink)]">{c.title}</div>
        </div>
      ))}
    </div>
  );
}
