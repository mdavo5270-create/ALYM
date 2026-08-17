import { ReactNode, useMemo, useState } from 'react';
import { AlymLogo } from '../Logo';
import { useGame } from '../../store/gameStore';
import { money } from '../ui';
import {
  TOP_NAV,
  DEFAULT_BOOKMARKS,
  MAIN_NAV,
  MORE_SECTIONS,
  type MainSpace,
  type MoreSection,
} from '../../store/nav';

const BM_KEY = 'alym_bookmarks';

type Bm = (typeof DEFAULT_BOOKMARKS)[number];

function loadBookmarks(): Bm[] {
  try {
    const raw = localStorage.getItem(BM_KEY);
    if (!raw) return DEFAULT_BOOKMARKS;
    const parsed = JSON.parse(raw) as Bm[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {}
  return DEFAULT_BOOKMARKS;
}

function saveBookmarks(list: Bm[]) {
  try {
    localStorage.setItem(BM_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * AppShell FM26-inspired — desktop-first
 * Top domain nav + context strip + bookmarks + workspace
 * Bottom tabs only on mobile as fallback
 */
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
    matchPreview,
  } = useGame();
  const [moreOpen, setMoreOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bm[]>(() =>
    typeof window !== 'undefined' ? loadBookmarks() : DEFAULT_BOOKMARKS
  );
  const unread = messages.filter((m) => !m.read).length;
  const season = '2026/27';
  const week = useMemo(() => {
    const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
    return `J${Math.max(1, played + 1)}`;
  }, [team]);
  const boardPct = team?.jobSecurity ?? 70;

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

  function isTopActive(item: (typeof TOP_NAV)[0]) {
    if (item.space === 'more' && item.more) {
      return space === 'more' && moreSection === item.more;
    }
    if (item.space === 'market') return space === 'market';
    if (item.space === 'live') return space === 'live';
    return space === item.space;
  }

  function navigateTop(item: (typeof TOP_NAV)[0]) {
    setMoreOpen(false);
    if (item.space === 'more' && item.more) goMore(item.more);
    else if (item.space) goSpace(item.space, item.sub);
  }

  function navigateBookmark(b: (typeof DEFAULT_BOOKMARKS)[0]) {
    setMoreOpen(false);
    if (b.more) goMore(b.more);
    else goSpace(b.space, b.sub);
  }

  return (
    <div className="alym-shell flex min-h-screen flex-col bg-[var(--paper)]">
      {/* ═══ TOP BAR — identity + global context (always visible) ═══ */}
      <header className="shell-desktop-top sticky top-0 z-50 border-b border-[var(--rule)] bg-[var(--paper)]/97 backdrop-blur-md">
        {/* Row 1: brand · context · actions */}
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-3 py-2 sm:px-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <AlymLogo size={26} />
            <span className="type-display hidden text-[15px] tracking-tight text-[var(--ink)] sm:inline">
              ALYM
            </span>
          </div>

          {/* Persistent career context */}
          <div className="hidden min-w-0 flex-1 items-center gap-x-3 gap-y-0.5 overflow-x-auto text-[12px] md:flex">
            <span className="truncate font-semibold text-[var(--ink)]">{team?.name ?? 'Club'}</span>
            <span className="text-[var(--ink-faint)]">|</span>
            <span className="text-[var(--ink-dim)]">{season}</span>
            <span className="text-[var(--ink-faint)]">|</span>
            <span className="text-[var(--ink-dim)]">{week}</span>
            <span className="text-[var(--ink-faint)]">|</span>
            <span className="data-num text-[var(--brass)]">{team ? money(team.budget) : '—'}</span>
            <span className="text-[var(--ink-faint)]">|</span>
            <span className={boardPct < 50 ? 'text-[var(--signal)]' : 'text-[var(--ink-dim)]'}>
              Board {boardPct}%
            </span>
            {matchPreview && (
              <>
                <span className="text-[var(--ink-faint)]">|</span>
                <span className="text-[var(--ink-dim)]">
                  Next <strong className="text-[var(--ink)]">{matchPreview.opponent}</strong>
                </span>
              </>
            )}
          </div>

          {/* Mobile compact context */}
          <div className="min-w-0 flex-1 truncate text-[12px] text-[var(--ink-dim)] md:hidden">
            <span className="font-semibold text-[var(--ink)]">{team?.name ?? 'ALYM'}</span>
            <span className="mx-1.5 text-[var(--ink-faint)]">·</span>
            <span className="data-num text-[var(--brass)]">{team ? money(team.budget) : '—'}</span>
          </div>

          <button
            type="button"
            className="shell-icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            title="Search world"
          >
            ⌕
          </button>
          <button
            type="button"
            className="shell-icon-btn relative"
            onClick={() => goMore('news')}
            aria-label="Inbox"
          >
            ✉
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brass)] px-1 text-[10px] font-bold text-black">
                {unread}
              </span>
            )}
          </button>
          <button type="button" className="shell-text-btn hidden sm:inline-flex" onClick={logout} title={userLabel}>
            Quit
          </button>
        </div>

        {/* Row 2: primary domain navigation (desktop) */}
        <nav className="hidden border-t border-[var(--rule)] md:block">
          <div className="mx-auto flex max-w-[1400px] items-stretch gap-0 px-3 sm:px-5">
            {TOP_NAV.map((item) => {
              const active = isTopActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTop(item)}
                  className={`relative px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition ${
                    active
                      ? 'text-[var(--brass)]'
                      : 'text-[var(--ink-dim)] hover:text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[var(--brass)]" />
                  )}
                </button>
              );
            })}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                setMoreOpen((v) => !v);
                if (!moreOpen) goSpace('more');
              }}
              className={`px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                space === 'more' && !TOP_NAV.some((t) => t.more === moreSection)
                  ? 'text-[var(--brass)]'
                  : 'text-[var(--ink-dim)] hover:text-[var(--ink)]'
              }`}
            >
              More
            </button>
          </div>
        </nav>

        {/* Row 3: bookmarks / quick access */}
        <div className="hidden border-t border-[var(--rule)] bg-black/25 md:block">
          <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-5">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              ★
            </span>
            {bookmarks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigateBookmark(b)}
                className="shrink-0 rounded-sm px-2.5 py-1 text-[11px] text-[var(--ink-dim)] transition hover:bg-white/5 hover:text-[var(--ink)]"
              >
                {b.label}
              </button>
            ))}
            <button
              type="button"
              className="ml-auto shrink-0 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--ink-faint)] hover:text-[var(--ink-dim)]"
              title="Reset bookmarks"
              onClick={() => {
                setBookmarks(DEFAULT_BOOKMARKS);
                saveBookmarks(DEFAULT_BOOKMARKS);
              }}
            >
              Reset ★
            </button>
          </div>
        </div>
      </header>

      {/* More panel (desktop overlay list) */}
      {moreOpen && space === 'more' && (
        <div className="border-b border-[var(--rule)] bg-[var(--panel)]">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-4 sm:grid-cols-2 md:grid-cols-4">
            {groups.map(([group, items]) => (
              <div key={group}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  {group}
                </div>
                <ul className="space-y-0.5">
                  {items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          goMore(s.id);
                          setMoreOpen(false);
                        }}
                        className={`w-full px-2 py-1.5 text-left text-[13px] transition hover:bg-white/5 ${
                          moreSection === s.id ? 'text-[var(--brass)]' : 'text-[var(--ink-dim)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 overflow-y-auto px-3 pb-20 pt-4 sm:px-5 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav only */}
      <nav className="shell-tabbar md:hidden">
        <div className="mx-auto flex max-w-6xl items-stretch justify-around px-1 pt-1">
          {MAIN_NAV.map((t) => {
            const active = space === t.id || (t.id === 'more' && moreOpen);
            return (
              <button
                key={t.id}
                type="button"
                className={`shell-tab ${active ? 'shell-tab-active' : ''}`}
                onClick={() => {
                  if (t.id === 'more') {
                    setMoreOpen(true);
                    goSpace('more');
                  } else {
                    setMoreOpen(false);
                    goSpace(t.id);
                  }
                }}
              >
                <span className="text-[14px] leading-none">{t.icon}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Global search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 pt-[12vh] backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl border border-[var(--rule)] bg-[var(--panel)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3">
              <span className="text-[var(--ink-faint)]">⌕</span>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players, clubs, news, transfers…"
                className="flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
              />
              <button type="button" className="text-[12px] text-[var(--ink-dim)]" onClick={() => setSearchOpen(false)}>
                Esc
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {searchResults.length > 0 && (
                <div className="border-b border-[var(--rule)] px-3 py-2">
                  <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                    Players
                  </div>
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-white/5"
                      onClick={() => {
                        setSelectedPlayerId(p.id);
                        setDrawer('player');
                        setSearchOpen(false);
                        goSpace('squad', 'players');
                      }}
                    >
                      <span className="data-num w-8 text-[13px] font-semibold text-[var(--brass)]">{p.rating}</span>
                      <span className="text-[13px] text-[var(--ink)]">{p.name}</span>
                      <span className="text-[11px] text-[var(--ink-dim)]">{p.position}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2">
                <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                  Go to
                </div>
                {[
                  { label: 'Portal', fn: () => goSpace('central') },
                  { label: 'Squad', fn: () => goSpace('squad', 'players') },
                  { label: 'Transfer Market', fn: () => goSpace('market', 'search') },
                  { label: 'Tactics', fn: () => goMore('tactics') },
                  { label: 'Inbox', fn: () => goMore('news') },
                  { label: 'Board', fn: () => goMore('board') },
                ].map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    className="flex w-full px-2 py-2 text-left text-[13px] text-[var(--ink-dim)] hover:bg-white/5 hover:text-[var(--ink)]"
                    onClick={() => {
                      a.fn();
                      setSearchOpen(false);
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {!searchQuery.trim() && (
                <p className="px-4 py-3 text-[12px] text-[var(--ink-faint)]">
                  Type a player name or jump to a domain.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
