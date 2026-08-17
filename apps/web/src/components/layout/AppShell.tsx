import { ReactNode, useState } from 'react';
import { AlymLogo, MylaMark } from '../Logo';
import { useGame, type Tab } from '../../store/gameStore';
import { money } from '../ui';

const NAV: { group: string; items: { id: Tab; label: string }[] }[] = [
  {
    group: 'Direction',
    items: [
      { id: 'home', label: 'Bureau' },
      { id: 'match', label: 'Match' },
      { id: 'board', label: 'Conseil' },
      { id: 'tactics', label: 'Tactique' },
    ],
  },
  {
    group: 'Club',
    items: [
      { id: 'squad', label: 'Effectif' },
      { id: 'training', label: 'Entraînement' },
      { id: 'youth', label: 'Académie' },
    ],
  },
  {
    group: 'Carrière',
    items: [
      { id: 'market', label: 'Mercato' },
      { id: 'live', label: 'Défis' },
      { id: 'legends', label: 'Légendes' },
      { id: 'mgrmarket', label: 'Marché coaches' },
    ],
  },
  {
    group: 'Opérations',
    items: [
      { id: 'messages', label: 'Courrier' },
      { id: 'budget', label: 'Finances' },
      { id: 'shop', label: 'Boutique' },
      { id: 'achievements', label: 'Succès' },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tab, switchTab, team, userLabel, messages, logout } = useGame();
  const [open, setOpen] = useState(false);
  const unread = messages.filter((m) => !m.read).length;

  function go(id: Tab) {
    switchTab(id);
    setOpen(false);
  }

  const side = (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-ink-700/80 bg-ink-900">
      <div className="flex items-center gap-3 border-b border-ink-700/80 px-4 py-4">
        <AlymLogo size={36} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-wide text-mist-50">ALYM</div>
          <MylaMark />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="label-caps mb-1.5 px-3">{g.group}</div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.id)}
                    className={`nav-item ${active ? 'nav-item-active' : ''}`}
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'messages' && unread > 0 && (
                      <span className="rounded-md bg-brass-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brass-300">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-700/80 p-3">
        <div className="truncate text-xs text-mist-400">{userLabel}</div>
        <button type="button" className="btn-ghost mt-1 w-full justify-start px-2 py-1.5 text-xs" onClick={logout}>
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-ink-950">
      <div className="hidden lg:flex">{side}</div>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-10 h-full">{side}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink-700/80 bg-ink-950/90 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            className="btn-ghost px-2 py-1 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-mist-50">{team?.name ?? '—'}</div>
            <div className="text-[11px] text-mist-400">
              {team?.nation ?? '—'} · Vision {team?.tacticalVision ?? 'standard'}
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <div className="text-right">
              <div className="label-caps">Budget</div>
              <div className="data-num text-sm text-mist-100">{team ? money(team.budget) : '—'}</div>
            </div>
            <div className="text-right">
              <div className="label-caps">Or</div>
              <div className="data-num text-sm text-brass-300">{team?.goldBalance ?? 0}</div>
            </div>
            <div className="text-right">
              <div className="label-caps">Bilan</div>
              <div className="data-num text-sm text-mist-100">
                {team ? `${team.wins}V · ${team.draws}N · ${team.losses}D` : '—'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
