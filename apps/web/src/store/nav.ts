/** Navigation unifiée ALYM — 6 espaces principaux, sous-vues, drawers */

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
  | 'achievements';

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
  /** navigation target */
  space: MainSpace;
  sub?: string;
  more?: MoreSection;
  playerId?: number;
};

export const MAIN_NAV: { id: MainSpace; label: string; icon: string }[] = [
  { id: 'central', label: 'Central', icon: '⌂' },
  { id: 'squad', label: 'Effectif', icon: '☰' },
  { id: 'match', label: 'Match', icon: '▶' },
  { id: 'market', label: 'Market', icon: '⇄' },
  { id: 'live', label: 'Live', icon: '◉' },
  { id: 'more', label: 'Plus', icon: '•••' },
];

export const MORE_SECTIONS: { id: MoreSection; label: string; group: string }[] = [
  { id: 'board', label: 'Conseil', group: 'Club' },
  { id: 'finance', label: 'Finances', group: 'Club' },
  { id: 'club', label: 'Vue club', group: 'Club' },
  { id: 'staff', label: 'Staff', group: 'Club' },
  { id: 'tactics', label: 'Tactique', group: 'Terrain' },
  { id: 'training', label: 'Entraînement', group: 'Terrain' },
  { id: 'academy', label: 'Académie', group: 'Recrutement' },
  { id: 'scouting', label: 'Scouting', group: 'Recrutement' },
  { id: 'legends', label: 'Légendes', group: 'Recrutement' },
  { id: 'news', label: 'Courrier', group: 'Monde' },
  { id: 'calendar', label: 'Calendrier', group: 'Monde' },
  { id: 'competitions', label: 'Compétitions', group: 'Monde' },
  { id: 'world', label: 'Monde du foot', group: 'Monde' },
  { id: 'analytics', label: 'Analytics', group: 'Analyse' },
  { id: 'manager', label: 'Manager Market', group: 'Analyse' },
  { id: 'shop', label: 'Boutique', group: 'Compte' },
  { id: 'achievements', label: 'Succès', group: 'Compte' },
  { id: 'settings', label: 'Réglages', group: 'Compte' },
];

export const SQUAD_SUBS: { id: SquadSub; label: string }[] = [
  { id: 'overview', label: 'Vue' },
  { id: 'players', label: 'Joueurs' },
  { id: 'depth', label: 'Profondeur' },
  { id: 'development', label: 'Développement' },
  { id: 'contracts', label: 'Contrats' },
];

export const MARKET_SUBS: { id: MarketSub; label: string }[] = [
  { id: 'overview', label: 'Hub' },
  { id: 'search', label: 'Recherche' },
  { id: 'targets', label: 'Cibles' },
  { id: 'negotiations', label: 'Négos' },
  { id: 'loans', label: 'Prêts' },
  { id: 'history', label: 'Historique' },
  { id: 'mgr', label: 'Coachs' },
];

export const MATCH_SUBS: { id: MatchSub; label: string }[] = [
  { id: 'preview', label: 'Avant-match' },
  { id: 'live', label: 'Match' },
  { id: 'post', label: 'Après-match' },
  { id: 'tactics', label: 'Tactique' },
];

export const LIVE_SUBS: { id: LiveSub; label: string }[] = [
  { id: 'for_you', label: 'Pour vous' },
  { id: 'active', label: 'Actif' },
  { id: 'catalog', label: 'Catalogue' },
  { id: 'completed', label: 'Terminés' },
];
