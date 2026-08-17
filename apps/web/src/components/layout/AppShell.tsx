import { ReactNode, useMemo, useState } from 'react';
import { AlymLogo } from '../Logo';
import { useGame } from '../../store/gameStore';
import { money } from '../ui';
import {
  MAIN_NAV,
  MORE_SECTIONS,
  type MainSpace,
  type MoreSection,
} from '../../store/nav';

export function AppShell({ children }: { children: ReactNode }) {
  const {
    space,
    moreSection,
    team,
    userLabel,
    messages,
    logout,
    goSpace,
    goMore,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    players,
    setSelectedPlayerId,
    setDrawer,
  } = useGame();
  const [moreOpen, setMoreOpen] = useState(false);
  const unread = messages.filter((m) => !m.read).length;
  const season = 'Saison 1';
  const week = useMemo(() => {
    const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
    return `J${Math.max(1, played + 1)}`;
  }, [team]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return players
      .filter((p) => p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q))
      .slice(0, 8);
  }, [players, searchQuery]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof MORE_SECTIONS>();
    for (const s of MORE_SECTIONS) {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group)!.push(s);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="alym-shell flex min-h-screen flex-col">
      {/* Top context bar */}
      <header className="shell-top">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:px-4">
          <AlymLogo size={28} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold tracking-tight text-[var(--ink)]">
              {team?.name ?? 'ALYM'}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 truncate text-[11px] text-[var(--ink-dim)]">
              <span>{team?.nation ?? 'Carrière'}</span>
              <span className="text-[var(--rule)]">·</span>
              <span>{season}</span>
              <span className="text-[var(--rule)]">·</span>
              <span>{week}</span>
              <span className="text-[var(--rule)]">·</span>
              <span className={((team?.jobSecurity ?? 70) < 50 ? 'text-[var(--signal)]' : 'text-[var(--ink-dim)]')}>
                Conseil {team?.jobSecurity ?? 70}%
              </span>
              {team?.budget != null && (
                <>
                  <span className="text-[var(--rule)]">·</span>
                  <span className="data-num text-[var(--brass)]">{money(team.budget)}</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="shell-icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Recherche"
          >
            ⌕
          </button>
          <button
            type="button"
            className="shell-icon-btn relative"
            onClick={() => goMore('news')}
            aria-label="Notifications"
          >
            ✉
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          <div className="hidden text-right text-[11px] sm:block">
            <div className="data-num text-amber-200/90">{team ? money(team.budget) : '—'}</div>
            <div className="text-[var(--muted)]">
              {team ? `${team.wins}V ${team.draws}N ${team.losses}D` : '—'}
            </div>
          </div>
          <button type="button" className="shell-text-btn" onClick={logout} title={userLabel}>
            Quitter
          </button>
        </div>
        {/* Desktop secondary context strip */}
        <div className="hidden border-t border-white/5 bg-black/20 sm:block">
          <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-1.5 text-[12px] text-[var(--muted)]">
            <span>
              Budget <strong className="text-white data-num">{team ? money(team.budget) : '—'}</strong>
            </span>
            <span>
              Or <strong className="text-amber-200 data-num">{team?.goldBalance ?? 0}</strong>
            </span>
            <span>
              Vision <strong className="text-white">{team?.tacticalVision ?? 'standard'}</strong>
            </span>
            <span className="text-[var(--muted)]">LA MYLA · ALYM</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-3 pb-24 pt-3 sm:px-4">
        {children}
      </main>

      {/* Primary tab bar */}
      <nav className="shell-tabbar">
        <div className="mx-auto flex max-w-6xl items-stretch justify-around px-1 pt-1">
          {MAIN_NAV.map((t) => {
            const active = space === t.id || (t.id === 'more' && moreOpen);
            return (
              <button
                key={t.id}
                type="button"
                className={`shell-tab ${active ? 'shell-tab-active' : ''}`}
                onClick={() => {
                  if (t.id === 'more') setMoreOpen(true);
                  else {
                    setMoreOpen(false);
                    goSpace(t.id as MainSpace);
                  }
                }}
              >
                <span className="text-[17px] leading-none">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MORE sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="mt-auto max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[var(--elevated)] p-4 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-1 text-[20px] font-bold text-white">Plus</div>
            <p className="mb-4 text-[13px] text-[var(--muted)]">
              Club · Recrutement · Monde · Analyse — même carrière, mêmes données
            </p>
            {groups.map(([group, items]) => (
              <div key={group} className="mb-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {group}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`rounded-xl border px-3 py-3 text-left text-[14px] font-medium transition ${
                        moreSection === s.id && space === 'more'
                          ? 'border-sky-400/40 bg-sky-500/10 text-sky-100'
                          : 'border-white/8 bg-white/5 text-white hover:border-white/15'
                      }`}
                      onClick={() => {
                        setMoreOpen(false);
                        goMore(s.id as MoreSection);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global search */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-md" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto w-full max-w-lg px-4 pt-16" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Joueur, poste, club…"
              className="w-full rounded-2xl border border-white/15 bg-[var(--elevated)] px-4 py-3.5 text-[16px] text-white outline-none ring-sky-500/40 focus:ring-2"
            />
            <div className="mt-3 space-y-1">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-left hover:bg-white/10"
                  onClick={() => {
                    setSelectedPlayerId(p.id);
                    setDrawer('player');
                    setSearchOpen(false);
                    goSpace('squad');
                  }}
                >
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="text-[12px] text-[var(--muted)]">
                    {p.position} · OVR {p.rating ?? '—'}
                  </span>
                </button>
              ))}
              {searchQuery && !searchResults.length && (
                <div className="rounded-xl px-4 py-6 text-center text-[14px] text-[var(--muted)]">Aucun résultat</div>
              )}
            </div>
            <button type="button" className="mt-4 w-full py-3 text-[15px] text-sky-400" onClick={() => setSearchOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
