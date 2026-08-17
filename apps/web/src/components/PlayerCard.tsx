import type { Player } from '../lib/api';
import { money } from './ui';

export type PlayerCardVariant = 'compact' | 'standard' | 'detailed' | 'match' | 'transfer' | 'scout';

function ovrTone(r: number) {
  if (r >= 82) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  if (r >= 74) return 'text-sky-300 border-sky-500/40 bg-sky-500/10';
  if (r >= 66) return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
  return 'text-slate-300 border-white/10 bg-white/5';
}

export function OvrBadge({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm';
  return (
    <span className={`inline-flex ${s} items-center justify-center rounded-lg border font-bold data-num ${ovrTone(rating)}`}>
      {rating}
    </span>
  );
}

export function PosChip({ pos }: { pos: string }) {
  const map: Record<string, string> = {
    GK: 'bg-amber-500/15 text-amber-200',
    DF: 'bg-sky-500/15 text-sky-200',
    MF: 'bg-emerald-500/15 text-emerald-200',
    FW: 'bg-rose-500/15 text-rose-200',
  };
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[pos] ?? 'bg-white/10 text-slate-300'}`}>
      {pos}
    </span>
  );
}

/** Même identité visuelle partout — variantes de densité seulement */
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
    'w-full text-left transition border border-white/8 bg-[var(--surface)] hover:border-white/15 active:scale-[0.99]';
  const sel = selected ? 'ring-1 ring-sky-400/50 border-sky-400/30' : '';

  if (variant === 'compact') {
    return (
      <button type="button" onClick={onClick} className={`${base} ${sel} flex items-center gap-3 rounded-xl px-3 py-2`}>
        <OvrBadge rating={rating} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-white">{player.name}</div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <PosChip pos={player.position} />
            <span>{player.nation ?? '—'}</span>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'transfer' || variant === 'scout') {
    return (
      <button type="button" onClick={onClick} className={`${base} ${sel} rounded-xl p-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[15px] font-semibold text-white">{player.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
              <PosChip pos={player.position} />
              <span>Pot. {player.potential ?? '—'}</span>
              {player.nation && <span>{player.nation}</span>}
            </div>
          </div>
          <OvrBadge rating={rating} />
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-[var(--muted)]">
          <span>Salaire {money(player.salary)}</span>
          <span className="data-num text-amber-200/90">{money((player.rating ?? 60) * 12000)}</span>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${sel} rounded-xl p-3`}>
      <div className="flex items-center gap-3">
        <OvrBadge rating={rating} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-white">{player.name}</span>
            {player.isLegend && <span className="text-[10px] text-amber-300">LÉGENDE</span>}
            {player.isYouth && <span className="text-[10px] text-sky-300">JEUNE</span>}
            {player.onLoan && <span className="text-[10px] text-orange-300">PRÊT</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
            <PosChip pos={player.position} />
            <span>{player.nation ?? '—'}</span>
            <span className="data-num">{money(player.salary)}/sem</span>
          </div>
        </div>
      </div>
      {variant === 'detailed' && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-center text-[11px]">
          {[
            ['VIT', player.speed],
            ['DRI', player.dribble],
            ['TIR', player.shot],
            ['PAS', player.pass],
            ['DEF', player.defense],
            ['PHY', player.physique],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg bg-black/30 py-1">
              <div className="text-[9px] uppercase text-[var(--muted)]">{k}</div>
              <div className="data-num font-semibold text-white">{v ?? '—'}</div>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
