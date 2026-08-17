import { ReactNode, useState } from 'react';
import { AlymLogo, MylaMark } from '../Logo';
import { useGame, type Tab } from '../../store/gameStore';
import { money } from '../ui';

const NAV: { group: string; items: { id: Tab; label: string }[] }[] = [
  {
    group: 'Home',
    items: [
      { id: 'home', label: 'Central' },
      { id: 'messages', label: 'Courrier' },
      { id: 'live', label: 'Manager Live' },
    ],
  },
  {
    group: 'Team',
    items: [
      { id: 'squad', label: 'Effectif' },
      { id: 'tactics', label: 'Tactique' },
      { id: 'training', label: 'Développement' },
      { id: 'youth', label: 'Académie' },
    ],
  },
  {
    group: 'Match',
    items: [{ id: 'match', label: 'Match Center' }],
  },
  {
    group: 'Transfers',
    items: [
      { id: 'market', label: 'Mercato' },
      { id: 'legends', label: 'Légendes' },
    ],
  },
  {
    group: 'Club',
    items: [
      { id: 'board', label: 'Conseil' },
      { id: 'budget', label: 'Finances' },
      { id: 'shop', label: 'Boutique' },
      { id: 'achievements', label: 'Succès' },
    ],
  },
  {
    group: 'World',
    items: [{ id: 'mgrmarket', label: 'Manager Market' }],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tab, switchTab, team, userLabel, messages, logout } = useGame();
  const [open, setOpen] = useState(false);
  const unread = messages.filter((m) => !m.read).length;
  const sec = team?.jobSecurity ?? 70;

  function go(id: Tab) {
    switchTab(id);
    setOpen(false);
  }

  const side = (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0f14]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4">
        <AlymLogo size={36} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-[0.12em] text-mist-50">ALYM</div>
          <MylaMark />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="label-caps mb-1.5 px-3 opacity-70">{g.group}</div>
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
                      <span className="rounded bg-brass-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brass-300">
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

      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-2 px-1">
          <div className="label-caps mb-1">Sécurité poste</div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full ${sec < 35 ? 'bg-signal-bad' : sec < 55 ? 'bg-brass-400' : 'bg-signal-good'}`}
              style={{ width: `${Math.min(100, sec)}%` }}
            />
          </div>
        </div>
        <div className="truncate px-1 text-xs text-mist-400">{userLabel}</div>
        <button type="button" className="btn-ghost mt-1 w-full justify-start px-2 py-1.5 text-xs" onClick={logout}>
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-[#080a0e]">
      <div className="hidden lg:flex">{side}</div>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative z-10 h-full">{side}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/[0.06] bg-[#080a0e]/90 px-4 py-3 backdrop-blur-md">
          <button type="button" className="btn-ghost px-2 py-1 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-mist-50">{team?.name ?? '—'}</div>
            <div className="text-[11px] text-mist-400">
              {team?.nation ?? '—'} · {team?.tacticalVision ?? 'standard'}
            </div>
          </div>
          <div className="hidden items-stretch gap-0 sm:flex">
            {[
              { label: 'Budget', value: team ? money(team.budget) : '—', tone: 'text-mist-100' },
              { label: 'Or', value: String(team?.goldBalance ?? 0), tone: 'text-brass-300' },
              {
                label: 'Bilan',
                value: team ? `${team.wins}V ${team.draws}N ${team.losses}D` : '—',
                tone: 'text-mist-100',
              },
            ].map((s) => (
              <div key={s.label} className="border-l border-white/[0.06] px-4 text-right">
                <div className="label-caps">{s.label}</div>
                <div className={`data-num text-sm font-semibold ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
