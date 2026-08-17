import type { ReactNode } from 'react';
import type { Player } from '../lib/api';
import { money } from './ui';

export type PlayerCardVariant = 'compact' | 'standard' | 'detailed' | 'match' | 'transfer' | 'scout';

/** Rareté OVR — classes skill cartes-joueurs-rarete (forme + couleur) */
function ovrTone(r: number) {
  if (r >= 86) return 'ovr-legend';
  if (r >= 78) return 'ovr-elite';
  if (r >= 68) return 'ovr-pro';
  return 'ovr-common';
}

export function OvrBadge({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const s =
    size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-[15px]';
  return (
    <span
      className={`inline-flex ${s} items-center justify-center border font-bold data-num ${ovrTone(rating)}`}
    >
      {rating}
    </span>
  );
}

export function PosChip({ pos }: { pos: string }) {
  const map: Record<string, string> = {
    GK: 'bg-amber-500/15 text-amber-200',
    DF: 'bg-[var(--brass)]/15 text-[var(--brass)]',
    MF: 'bg-[var(--ok)]/15 text-[var(--ok)]',
    FW: 'bg-[var(--signal)]/15 text-rose-200',
  };
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        map[pos] ?? 'bg-white/10 text-slate-300'
      }`}
    >
      {pos}
    </span>
  );
}

/** Dense management row — primary language for Squad / Market (FC Squad Hub inspired) */
export function PlayerRow({
  player,
  selected,
  onClick,
  showValue = true,
  showFitness = true,
  showContract = true,
  rightSlot,
}: {
  player: Player;
  selected?: boolean;
  onClick?: () => void;
  showValue?: boolean;
  showFitness?: boolean;
  showContract?: boolean;
  rightSlot?: ReactNode;
}) {
  const rating = player.rating ?? 65;
  const value = (player.rating ?? 60) * 12000;
  const fitness = player.physique ?? 80;
  const contractYear = player.contractUntil ? String(player.contractUntil).slice(0, 4) : '2028';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`player-row group flex w-full items-center gap-3 border-b border-[var(--rule)] px-3 py-2.5 text-left transition hover:bg-[var(--panel-2)] ${
        selected
          ? 'bg-[var(--panel-2)] border-l-2 border-l-[var(--brass)]'
          : 'border-l-2 border-l-transparent'
      }`}
    >
      <span
        className={`data-num inline-flex h-9 w-9 shrink-0 items-center justify-center border text-[14px] font-semibold ${ovrTone(
          rating
        )}`}
      >
        {rating}
      </span>
      <span className="w-8 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-dim)]">
        {player.position}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium text-[var(--ink)]">{player.name}</span>
          {player.isLegend && <span className="label-caps text-[var(--brass)]">Légende</span>}
          {player.isYouth && <span className="label-caps text-[var(--ink-dim)]">Jeune</span>}
          {player.onLoan && <span className="label-caps text-[var(--signal)]">Prêt</span>}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--ink-dim)]">
          {player.nation ?? '—'} · pot. {player.potential ?? '—'}
        </div>
      </div>
      {showValue && (
        <span className="data-num hidden w-16 shrink-0 text-right text-[12px] text-[var(--ink-dim)] sm:block">
          {money(value)}
        </span>
      )}
      {showFitness && (
        <span
          className={`hidden w-12 shrink-0 text-right text-[12px] data-num sm:block ${
            fitness >= 85 ? 'text-[var(--ok)]' : fitness >= 60 ? 'text-amber-200' : 'text-[var(--signal)]'
          }`}
        >
          {fitness}%
        </span>
      )}
      {showContract && (
        <span className="hidden w-12 shrink-0 text-right text-[11px] text-[var(--ink-faint)] sm:block">
          {contractYear}
        </span>
      )}
      {rightSlot}
    </button>
  );
}

export function PlayerListHeader({
  showValue = true,
  showFitness = true,
  showContract = true,
}: {
  showValue?: boolean;
  showFitness?: boolean;
  showContract?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--rule)] bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
      <span className="w-9 shrink-0 text-center">OVR</span>
      <span className="w-8 shrink-0">Pos</span>
      <span className="flex-1">Player</span>
      {showValue && <span className="hidden w-16 shrink-0 text-right sm:block">Value</span>}
      {showFitness && <span className="hidden w-12 shrink-0 text-right sm:block">Form</span>}
      {showContract && <span className="hidden w-14 shrink-0 text-right sm:block">Contract</span>}
    </div>
  );
}


export function PlayerCard({
  player,
  variant = 'standard',
  selected,
  onClick,
}: {
  player: Player;
  variant?: PlayerCardVariant;
  selected?: boolean;
  onClick?: () => void;
}) {
  const rating = player.rating ?? 65;
  const base =
    'w-full text-left transition border border-[var(--rule)] bg-[var(--panel)] hover:border-[var(--ink-faint)] active:scale-[0.99]';
  const sel = selected ? 'ring-1 ring-[var(--brass)]/50 border-[var(--brass)]/40' : '';

  if (variant === 'compact') {
    return (
      <button type="button" onClick={onClick} className={`${base} ${sel} flex items-center gap-3 px-3 py-2`}>
        <OvrBadge rating={rating} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-[var(--ink)]">{player.name}</div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--ink-dim)]">
            <PosChip pos={player.position} />
            <span>{player.nation ?? '—'}</span>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'transfer' || variant === 'scout') {
    return (
      <button type="button" onClick={onClick} className={`${base} ${sel} p-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[15px] font-semibold text-[var(--ink)]">{player.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--ink-dim)]">
              <PosChip pos={player.position} />
              <span>Pot. {player.potential ?? '—'}</span>
              {player.nation && <span>{player.nation}</span>}
            </div>
          </div>
          <OvrBadge rating={rating} />
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-[var(--ink-dim)]">
          <span>Salaire {money(player.salary)}</span>
          <span className="data-num text-[var(--brass)]">{money((player.rating ?? 60) * 12000)}</span>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${sel} p-3`}>
      <div className="flex items-center gap-3">
        <OvrBadge rating={rating} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[var(--ink)]">{player.name}</span>
            {player.isLegend && <span className="text-[10px] text-[var(--brass)]">LÉGENDE</span>}
            {player.isYouth && <span className="text-[10px] text-[var(--ink-dim)]">JEUNE</span>}
            {player.onLoan && <span className="text-[10px] text-[var(--signal)]">PRÊT</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--ink-dim)]">
            <PosChip pos={player.position} />
            <span>{player.nation ?? '—'}</span>
            <span className="data-num">{money(player.salary)}/sem</span>
          </div>
        </div>
      </div>
      {variant === 'detailed' && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--rule)] pt-2 text-center text-[11px]">
          {[
            ['VIT', player.speed],
            ['DRI', player.dribble],
            ['TIR', player.shot],
            ['PAS', player.pass],
            ['DEF', player.defense],
            ['PHY', player.physique],
          ].map(([k, v]) => (
            <div key={String(k)} className="bg-black/25 py-1">
              <div className="text-[9px] uppercase text-[var(--ink-dim)]">{k}</div>
              <div className="data-num font-semibold text-[var(--ink)]">{v ?? '—'}</div>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
