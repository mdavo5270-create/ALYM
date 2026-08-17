/** Navigation ALYM — structure desktop type FM26 (top nav + domaines + sous-menus) */

export type MainSpace = 'central' | 'squad' | 'match' | 'market' | 'live' | 'more';

export type MoreSection =
  | 'scouting'
  | 'academy'
  | 'club'
  | 'finance'
  | 'staff'
  | 'calendar'
  | 'competitions'
  | 'analytics'
  | 'manager'
  | 'world'
  | 'settings'
  | 'board'
  | 'news'
  | 'tactics'
  | 'training'
  | 'legends'
  | 'shop'
  | 'achievements'
  | 'chronicle';

export type SquadSub = 'overview' | 'players' | 'depth' | 'tactics' | 'development' | 'contracts';
export type MarketSub = 'overview' | 'search' | 'targets' | 'negotiations' | 'loans' | 'history' | 'mgr';
export type MatchSub = 'preview' | 'live' | 'post' | 'tactics';
export type LiveSub = 'for_you' | 'active' | 'completed' | 'catalog';
export type CentralSub = 'home' | 'tasks' | 'inbox' | 'activity';

export type DrawerKind =
  | 'player'
  | 'message'
  | 'event'
  | 'contract'
  | 'offer'
  | 'scout_report'
  | null;

export type TaskPriority = 'urgent' | 'action' | 'important' | 'fyi';

export type ManagerTask = {
  id: string;
  label: string;
  priority: TaskPriority;
  done: boolean;
  space: MainSpace;
  sub?: string;
  more?: MoreSection;
  playerId?: number;
};

/** Top primary domains — FM26 style (desktop-first) */
export const TOP_NAV: {
  id: string;
  label: string;
  space?: MainSpace;
  more?: MoreSection;
  sub?: string;
}[] = [
  { id: 'central', label: 'Portal', space: 'central' },
  { id: 'squad', label: 'Squad', space: 'squad', sub: 'players' },
  { id: 'match', label: 'Match', space: 'match', sub: 'preview' },
  { id: 'recruitment', label: 'Recruitment', space: 'market', sub: 'search' },
  { id: 'tactics', label: 'Tactics', space: 'more', more: 'tactics' },
  { id: 'club', label: 'Club', space: 'more', more: 'board' },
  { id: 'career', label: 'Career', space: 'live' },
];

/** Quick bookmarks — personalisable (defaults) */
export const DEFAULT_BOOKMARKS: {
  id: string;
  label: string;
  space: MainSpace;
  sub?: string;
  more?: MoreSection;
}[] = [
  { id: 'bm-squad', label: 'Squad', space: 'squad', sub: 'players' },
  { id: 'bm-tactics', label: 'Tactics', space: 'more', more: 'tactics' },
  { id: 'bm-training', label: 'Training', space: 'more', more: 'training' },
  { id: 'bm-transfers', label: 'Transfers', space: 'market', sub: 'search' },
  { id: 'bm-scouting', label: 'Scouting', space: 'more', more: 'academy' },
  { id: 'bm-calendar', label: 'Calendar', space: 'more', more: 'calendar' },
];

/** Legacy bottom nav — mobile only fallback */
export const MAIN_NAV: { id: MainSpace; label: string; icon: string }[] = [
  { id: 'central', label: 'Portal', icon: '⌂' },
  { id: 'squad', label: 'Squad', icon: '☰' },
  { id: 'match', label: 'Match', icon: '▶' },
  { id: 'market', label: 'Market', icon: '⇄' },
  { id: 'live', label: 'Career', icon: '◉' },
  { id: 'more', label: 'More', icon: '•••' },
];

export const MORE_SECTIONS: { id: MoreSection; label: string; group: string }[] = [
  { id: 'board', label: 'Board', group: 'Club' },
  { id: 'finance', label: 'Finances', group: 'Club' },
  { id: 'club', label: 'Club view', group: 'Club' },
  { id: 'staff', label: 'Staff', group: 'Club' },
  { id: 'tactics', label: 'Tactics', group: 'Pitch' },
  { id: 'training', label: 'Training', group: 'Pitch' },
  { id: 'academy', label: 'Academy', group: 'Recruitment' },
  { id: 'scouting', label: 'Scouting', group: 'Recruitment' },
  { id: 'legends', label: 'Legends', group: 'Recruitment' },
  { id: 'news', label: 'Inbox', group: 'World' },
  { id: 'chronicle', label: 'Chronicle', group: 'World' },
  { id: 'calendar', label: 'Calendar', group: 'World' },
  { id: 'competitions', label: 'Competitions', group: 'World' },
  { id: 'world', label: 'World football', group: 'World' },
  { id: 'analytics', label: 'Analytics', group: 'Analysis' },
  { id: 'manager', label: 'Manager Market', group: 'Analysis' },
  { id: 'shop', label: 'Shop', group: 'Account' },
  { id: 'achievements', label: 'Achievements', group: 'Account' },
  { id: 'settings', label: 'Settings', group: 'Account' },
];

export const SQUAD_SUBS: { id: SquadSub; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'players', label: 'Players' },
  { id: 'depth', label: 'Depth' },
  { id: 'development', label: 'Development' },
  { id: 'contracts', label: 'Contracts' },
];

export const MARKET_SUBS: { id: MarketSub; label: string }[] = [
  { id: 'overview', label: 'Hub' },
  { id: 'search', label: 'Search' },
  { id: 'targets', label: 'Targets' },
  { id: 'negotiations', label: 'Negotiations' },
  { id: 'loans', label: 'Loans' },
  { id: 'history', label: 'History' },
  { id: 'mgr', label: 'Coaches' },
];

export const MATCH_SUBS: { id: MatchSub; label: string }[] = [
  { id: 'preview', label: 'Pre-match' },
  { id: 'live', label: 'Match' },
  { id: 'post', label: 'Post-match' },
  { id: 'tactics', label: 'Tactics' },
];

export const LIVE_SUBS: { id: LiveSub; label: string }[] = [
  { id: 'for_you', label: 'For you' },
  { id: 'active', label: 'Active' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'completed', label: 'Completed' },
];
