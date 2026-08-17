import { ReactNode, useState } from 'react';
import { AlymLogo } from '../Logo';
import { useGame, type Tab } from '../../store/gameStore';
import { money } from '../ui';
import { MODULES, SCREEN_COUNT, type ModuleId } from '../../lib/screens';
import { ModuleExplorer } from '../../modules/ModuleExplorer';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Effectif', icon: '☰' },
  { id: 'match', label: 'Match', icon: '▶' },
  { id: 'live', label: 'Live', icon: '◉' },
  { id: 'mgrmarket', label: 'Market', icon: '◎' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { tab, switchTab, team, userLabel, messages, logout } = useGame();
  const [modulesOpen, setModulesOpen] = useState(false);
  const [explore, setExplore] = useState<ModuleId | null>(null);
  const unread = messages.filter((m) => !m.read).length;

  if (explore) {
    return (
      <ModuleExplorer
        moduleId={explore}
        onBack={() => setExplore(null)}
      />
    );
  }

  return (
    <div className="ios-screen flex min-h-screen flex-col">
      <header className="ios-nav px-4 pb-2 pt-3">
        <div className="flex items-center gap-3">
          <AlymLogo size={30} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[17px] font-semibold">{team?.name ?? 'ALYM'}</div>
            <div className="truncate text-[12px] text-[var(--ios-secondary)]">
              {team?.nation ?? 'Carrière'} · Sécurité {team?.jobSecurity ?? 70}%
            </div>
          </div>
          <button type="button" className="ios-btn-plain text-[15px]" onClick={() => setModulesOpen(true)}>
            Modules
          </button>
          <button type="button" className="ios-btn-plain text-[15px]" onClick={logout} title={userLabel}>
            Quitter
          </button>
        </div>
        <div className="mt-2 flex gap-4 text-[12px] text-[var(--ios-secondary)]">
          <span>
            Budget <strong className="text-white data-num">{team ? money(team.budget) : '—'}</strong>
          </span>
          <span>
            Bilan{' '}
            <strong className="text-white data-num">
              {team ? `${team.wins}V ${team.draws}N ${team.losses}D` : '—'}
            </strong>
          </span>
          {unread > 0 && (
            <span className="text-[var(--ios-blue)]">
              Courrier <strong>{unread}</strong>
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>

      <nav className="ios-tabbar">
        <div className="flex items-stretch justify-around px-1 pt-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`ios-tab ${tab === t.id ? 'ios-tab-active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              <span className="text-[18px] leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
          <button type="button" className="ios-tab" onClick={() => setModulesOpen(true)}>
            <span className="text-[18px] leading-none">•••</span>
            <span>Tout</span>
          </button>
        </div>
      </nav>

      {modulesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm" onClick={() => setModulesOpen(false)}>
          <div
            className="mt-auto max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--ios-elevated)] p-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--ios-fill)]" />
            <div className="mb-1 text-[20px] font-bold">Tous les modules</div>
            <p className="mb-4 text-[13px] text-[var(--ios-secondary)]">
              {SCREEN_COUNT} écrans Manager Career · navigation iOS
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="ios-card flex flex-col items-center gap-2 p-3 text-center active:opacity-80"
                  onClick={() => {
                    setModulesOpen(false);
                    // Map module to existing tabs when possible
                    const map: Partial<Record<ModuleId, Tab>> = {
                      central: 'home',
                      live: 'live',
                      squad: 'squad',
                      player: 'squad',
                      tactics: 'tactics',
                      match_live: 'match',
                      match_preview: 'match',
                      match_end: 'match',
                      transfers: 'market',
                      youth: 'youth',
                      mgrmarket: 'mgrmarket',
                      board: 'board',
                      finance: 'budget',
                      news: 'messages',
                      premium: 'achievements',
                    };
                    const t = map[m.id];
                    if (t) switchTab(t);
                    setExplore(m.id);
                  }}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[12px] font-semibold leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
            <button type="button" className="ios-btn ios-btn-secondary mt-4 w-full" onClick={() => setModulesOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
