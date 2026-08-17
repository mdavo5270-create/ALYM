/**
 * ALYM patterns — langage FC Career Mode (densité, big numbers, level tiles).
 * Zéro grille de cards clones. Surfaces, rows, blocs de données.
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

/** FC26-style level tile (VERY HIGH / LOW / HIGH) */
export function LevelTile({
  label,
  level,
  tone = 'mid',
}: {
  label: string;
  level: string;
  tone?: 'high' | 'mid' | 'low';
}) {
  const bg =
    tone === 'high'
      ? 'bg-gradient-to-br from-amber-600/85 to-orange-900/95'
      : tone === 'mid'
        ? 'bg-gradient-to-br from-slate-600/75 to-slate-900/95'
        : 'bg-gradient-to-br from-sky-700/75 to-blue-950/95';
  return (
    <div className={`flex min-h-[76px] flex-col justify-between rounded-sm p-3 ${bg}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/65">{label}</div>
      <div className="text-[14px] font-bold uppercase tracking-wide text-white sm:text-[15px]">{level}</div>
    </div>
  );
}

/** Attribute bar — technical / physical / mental */
export function AttrBar({ label, value, max = 99 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const tone =
    value >= 80 ? 'bg-[var(--ok)]' : value >= 70 ? 'bg-[var(--brass)]' : value >= 60 ? 'bg-amber-500' : 'bg-[var(--ink-faint)]';
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 shrink-0 text-[11px] text-[var(--ink-dim)]">{label}</div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="data-num w-7 text-right text-[13px] font-semibold text-[var(--ink)]">{value}</div>
    </div>
  );
}

export function StatBlock({
  items,
}: {
  items: { label: string; value: string | number; accent?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="bg-[var(--panel)] px-3 py-3">
          <div className="label-caps text-[var(--ink-dim)]">{it.label}</div>
          <div
            className={`data-num mt-1 text-xl font-medium ${
              it.accent ? 'text-[var(--brass)]' : 'text-[var(--ink)]'
            }`}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskRow({
  label,
  priority,
  done,
  onClick,
}: {
  label: string;
  priority: 'urgent' | 'action' | 'important' | 'fyi';
  done?: boolean;
  onClick?: () => void;
}) {
  const dot =
    priority === 'urgent'
      ? 'bg-[var(--signal)]'
      : priority === 'action'
        ? 'bg-amber-400'
        : priority === 'important'
          ? 'bg-[var(--brass)]'
          : 'bg-[var(--ink-faint)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-[var(--rule)] px-3 py-2.5 text-left transition hover:bg-[var(--panel-2)] ${
        done ? 'opacity-45' : ''
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span className={`flex-1 text-[13px] ${done ? 'line-through text-[var(--ink-dim)]' : 'text-[var(--ink)]'}`}>
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">{priority}</span>
    </button>
  );
}

export function ClubCrest({
  name,
  nation,
  stars = 3,
  size = 'md',
}: {
  name: string;
  nation?: string;
  stars?: number;
  size?: 'md' | 'lg';
}) {
  const box = size === 'lg' ? 'h-24 w-24 text-3xl' : 'h-14 w-14 text-xl';
  return (
    <div className="flex flex-col items-center text-center">
      {nation && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-dim)]">
          {nation}
        </div>
      )}
      <div
        className={`flex ${box} items-center justify-center rounded-full border-2 border-[var(--brass)]/45 bg-black/35 font-bold text-[var(--brass)]`}
      >
        {(name?.[0] || 'A').toUpperCase()}
      </div>
      <div className="type-display mt-2 text-lg tracking-tight text-[var(--ink)] sm:text-xl">{name}</div>
      <div className="mt-1 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-[11px] ${i < stars ? 'text-[var(--brass)]' : 'text-[var(--ink-faint)]'}`}>
            ★
          </span>
        ))}
      </div>
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
