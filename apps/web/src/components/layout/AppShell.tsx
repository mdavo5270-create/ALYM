import { ReactNode, useState } from 'react';
import { AlymLogo } from '../Logo';
import { useGame, type Tab } from '../../store/gameStore';
import { money } from '../ui';

const PRIMARY: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Central' },
  { id: 'live', label: 'Live' },
  { id: 'squad', label: 'Effectif' },
  { id: 'tactics', label: 'Tactique' },
  { id: 'match', label: 'Match' },
  { id: 'market', label: 'Mercato' },
  { id: 'mgrmarket', label: 'Manager Market' },
  { id: 'board', label: 'Club' },
];

const MORE: { id: Tab; label: string }[] = [
  { id: 'messages', label: 'Courrier' },
  { id: 'training', label: 'Développement' },
  { id: 'youth', label: 'Académie' },
  { id: 'legends', label: 'Légendes' },
  { id: 'budget', label: 'Finances' },
  { id: 'shop', label: 'Boutique' },
  { id: 'achievements', label: 'Succès' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tab, switchTab, team, userLabel, messages, logout } = useGame();
  const [moreOpen, setMoreOpen] = useState(false);
  const unread = messages.filter((m) => !m.read).length;
  const sec = team?.jobSecurity ?? 70;
  const primaryIds = PRIMARY.map((p) => p.id);
  const moreActive = MORE.some((m) => m.id === tab);

  return (
    <div className="career-bg flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#070b12]/92 backdrop-blur-md">
        <div className="flex items-center gap-3 px-3 py-2 sm:px-5">
          <div className="flex items-center gap-2.5">
            <AlymLogo size={32} />
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-semibold tracking-[0.14em] text-white">ALYM</div>
              <div className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">LA MYLA</div>
            </div>
          </div>

          <div className="mx-2 hidden h-8 w-px bg-white/10 md:block" />

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{team?.name ?? '—'}</div>
            <div className="truncate text-[11px] text-slate-400">
              {team?.nation ?? '—'} · {team?.tacticalVision ?? 'standard'} · Sécurité {sec}%
            </div>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right">
              <div className="label-caps">Budget</div>
              <div className="data-num text-sm font-semibold text-amber-300">{team ? money(team.budget) : '—'}</div>
            </div>
            <div className="text-right">
              <div className="label-caps">Bilan</div>
              <div className="data-num text-sm font-semibold text-white">
                {team ? `${team.wins}V ${team.draws}N ${team.losses}D` : '—'}
              </div>
            </div>
          </div>

          <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={logout} title={userLabel}>
            Quitter
          </button>
        </div>

        {/* Level-1 tabs */}
        <nav className="flex items-stretch gap-0 overflow-x-auto px-1 sm:px-3">
          {PRIMARY.map((item) => {
            const active = tab === item.id || (item.id === 'board' && ['board', 'budget', 'shop', 'achievements'].includes(tab));
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  switchTab(item.id);
                  setMoreOpen(false);
                }}
                className={`top-tab whitespace-nowrap ${active && primaryIds.includes(tab) || (item.id === 'board' && ['board','budget','shop','achievements'].includes(tab)) ? 'top-tab-active' : ''}`}
              >
                {item.label}
                {item.id === 'home' && unread > 0 && (
                  <span className="ml-1.5 rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">{unread}</span>
                )}
              </button>
            );
          })}
          <div className="relative">
            <button
              type="button"
              className={`top-tab whitespace-nowrap ${moreActive ? 'top-tab-active' : ''}`}
              onClick={() => setMoreOpen((v) => !v)}
            >
              Plus
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-40 mt-1 min-w-[180px] rounded-lg border border-white/10 bg-[#0d1420] py-1 shadow-xl">
                {MORE.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5 ${tab === m.id ? 'text-sky-300' : 'text-slate-200'}`}
                    onClick={() => {
                      switchTab(m.id);
                      setMoreOpen(false);
                    }}
                  >
                    {m.label}
                    {m.id === 'messages' && unread > 0 && (
                      <span className="rounded bg-sky-500/20 px-1.5 text-[10px] font-bold text-sky-300">{unread}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">{children}</main>

      {/* Bottom contextual bar */}
      <footer className="sticky bottom-0 z-20 flex items-center justify-between border-t border-white/[0.07] bg-[#070b12]/95 px-3 py-2 backdrop-blur sm:px-5">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="hidden sm:inline">ALYM</span>
          <span className="text-slate-600">·</span>
          <span>Carrière manager</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => switchTab('messages')}>
            Courrier{unread ? ` (${unread})` : ''}
          </button>
          <button type="button" className="btn-primary py-1.5 text-xs" onClick={() => switchTab('match')}>
            Match Center
          </button>
        </div>
      </footer>
    </div>
  );
}
