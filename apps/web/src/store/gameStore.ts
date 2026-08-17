import { create } from 'zustand';
import {
  api,
  setToken,
  type Team,
  type Player,
  type GameMessage,
  type BoardInfo,
  type BudgetInfo,
  type MarketListing,
  type ChallengesResponse,
  type TrainingInfo,
  type Legend,
  type ManagerMarketData,
  type Achievement,
  type ShopItem,
  type GameEvent,
  type TransferNego,
  type ChronicleEntry,
  type SeasonReview,
} from '../lib/api';

import type { DrawerKind, MainSpace, MoreSection } from './nav';

export type Screen = 'splash' | 'title' | 'auth' | 'create-team' | 'dashboard';
/** @deprecated use space — kept for loadTabData mapping */
export type Tab =
  | 'home'
  | 'match'
  | 'board'
  | 'tactics'
  | 'squad'
  | 'market'
  | 'youth'
  | 'live'
  | 'training'
  | 'messages'
  | 'budget'
  | 'shop'
  | 'legends'
  | 'mgrmarket'
  | 'achievements';

export type { MainSpace, MoreSection, DrawerKind };

type LastMatch = {
  opponent: string;
  homeName?: string;
  homeScore: number;
  awayScore: number;
  result: string;
  prize: number;
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnHome: number;
    shotsOnAway: number;
  };
  timeline?: { minute: number; type: string; side: string; label: string }[];
  venue?: string;
  competition?: string;
};

type MatchPreview = {
  homeName: string;
  opponent: string;
  competition: string;
  venue: string;
  kickoffLabel: string;
  availablePlayers: number;
  formHint: string;
  tacticalVision: string;
  strength: { attack: number; midfield: number; defense: number; gk: number };
};

type ManagerJob = {
  clubId: number;
  clubName: string;
  nation: string | null;
  reputation: number;
  tacticalVision: string;
  jobSecurity: number;
  status: string;
  managerName: string | null;
  compatibility: number;
  likelihood: string;
};


type State = {
  screen: Screen;
  tab: Tab;
  space: MainSpace;
  spaceSub: string;
  moreSection: MoreSection | null;
  drawer: DrawerKind;
  searchOpen: boolean;
  searchQuery: string;
  authMode: 'login' | 'register';
  userLabel: string;
  error: string;
  loading: boolean;
  team: Team | null;
  players: Player[];
  messages: GameMessage[];
  board: BoardInfo | null;
  budgetInfo: BudgetInfo | null;
  listings: MarketListing[];
  youth: Player[];
  challenges: ChallengesResponse | null;
  training: TrainingInfo | null;
  legends: Legend[];
  mgrMarket: ManagerMarketData | null;
  achievements: Achievement[];
  shopItems: ShopItem[];
  lastMatch: LastMatch | null;
  matchPreview: MatchPreview | null;
  activeEvent: GameEvent | null;
  challengeNote: string | null;
  selectedPlayerId: number | null;
  managerJobs: ManagerJob[];
  marketHeadlines: string[];
  leagueTable: { rank: number; teamName: string; isPlayer: boolean; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; gd: number; points: number; form: string }[] | null;
  staffCatalog: { role: string; name: string; rating: number; salary: number; specialty: string; cost: number; hired: boolean }[];
  staffMembers: { id: number; role: string; name: string; rating: number; salary: number; specialty: string | null }[];
  negotiations: TransferNego[];
  chronicle: ChronicleEntry[];
  seasonReview: SeasonReview | null;

  setScreen: (s: Screen) => void;
  setTab: (t: Tab) => void;
  setAuthMode: (m: 'login' | 'register') => void;
  setError: (e: string) => void;
  setSelectedPlayerId: (id: number | null) => void;
  setDrawer: (d: DrawerKind) => void;
  setSearchOpen: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSpaceSub: (sub: string) => void;
  goSpace: (space: MainSpace, sub?: string) => void;
  goMore: (section: MoreSection) => void;
  logout: () => void;

  bootstrap: () => Promise<void>;
  loadTeamData: (teamId: number) => Promise<void>;
  loadTabData: (tab: Tab) => Promise<void>;
  switchTab: (tab: Tab) => void;
  auth: (email: string, password: string, username?: string) => Promise<void>;
  createTeam: (name: string, nation: string) => Promise<void>;
  playMatch: () => Promise<void>;
  resolveEvent: (choice: { id: string; effect: string }) => Promise<void>;
  setVision: (vision: string) => Promise<void>;
  scoutYouth: () => Promise<void>;
  promote: (playerId: number) => Promise<void>;
  buyListing: (listing: MarketListing) => Promise<void>;
  sellPlayer: (playerId: number) => Promise<void>;
  startChallenge: (id: string) => Promise<void>;
  abandonChallenge: () => Promise<void>;
  setTraining: (playerId: number, plan: string) => Promise<void>;
  loanPlayer: (playerId: number) => Promise<void>;
  recallLoan: (playerId: number) => Promise<void>;
  recruitLegend: (code: string) => Promise<void>;
  buyShop: (itemId: string) => Promise<void>;
  markRead: (messageId: number) => Promise<void>;
  loadMatchPreview: () => Promise<void>;
  loadManagerJobs: () => Promise<void>;
  applyJob: (clubId: number) => Promise<void>;
  hireStaff: (role: string) => Promise<void>;
  fireStaff: (id: number) => Promise<void>;
  openNego: (listing: MarketListing, offerAmount: number) => Promise<void>;
  respondNego: (id: string, action: string, raiseAmount?: number) => Promise<void>;
  completeNego: (id: string) => Promise<void>;
  loadChronicle: () => Promise<void>;
};

function spaceToTab(space: MainSpace, more?: MoreSection | null): Tab {
  if (space === 'central') return 'home';
  if (space === 'squad') return 'squad';
  if (space === 'match') return 'match';
  if (space === 'market') return 'market';
  if (space === 'live') return 'live';
  if (space === 'more' && more) {
    const map: Partial<Record<MoreSection, Tab>> = {
      board: 'board',
      finance: 'budget',
      tactics: 'tactics',
      training: 'training',
      academy: 'youth',
      scouting: 'youth',
      legends: 'legends',
      news: 'messages',
      manager: 'mgrmarket',
      shop: 'shop',
      achievements: 'achievements',
      club: 'board',
      staff: 'board',
      calendar: 'home',
      competitions: 'board',
      chronicle: 'home',
      world: 'mgrmarket',
      analytics: 'board',
      settings: 'home',
    };
    return map[more] ?? 'home';
  }
  return 'home';
}

export const useGame = create<State>((set, get) => ({
  screen: 'splash',
  tab: 'home',
  space: 'central',
  spaceSub: 'home',
  moreSection: null,
  drawer: null,
  searchOpen: false,
  searchQuery: '',
  authMode: 'register',
  userLabel: '',
  error: '',
  loading: false,
  team: null,
  players: [],
  messages: [],
  board: null,
  budgetInfo: null,
  listings: [],
  youth: [],
  challenges: null,
  training: null,
  legends: [],
  mgrMarket: null,
  achievements: [],
  shopItems: [],
  lastMatch: null,
  matchPreview: null,
  activeEvent: null,
  challengeNote: null,
  selectedPlayerId: null,
  managerJobs: [],
  marketHeadlines: [],
  leagueTable: null,
  staffCatalog: [],
  staffMembers: [],
  negotiations: [],
  chronicle: [],
  seasonReview: null,

  setScreen: (screen) => set({ screen }),
  setTab: (tab) => set({ tab }),
  setAuthMode: (authMode) => set({ authMode }),
  setError: (error) => set({ error }),
  setSelectedPlayerId: (selectedPlayerId) => set({ selectedPlayerId }),
  setDrawer: (drawer) => set({ drawer }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSpaceSub: (spaceSub) => set({ spaceSub }),
  goSpace: (space, sub) => {
    const tab = spaceToTab(space, null);
    set({
      space,
      spaceSub: sub ?? (space === 'central' ? 'home' : space === 'squad' ? 'players' : space === 'match' ? 'preview' : space === 'market' ? 'overview' : space === 'live' ? 'for_you' : 'home'),
      moreSection: null,
      tab,
      error: '',
      drawer: null,
    });
    get().loadTabData(tab).catch(console.error);
  },
  goMore: (section) => {
    const tab = spaceToTab('more', section);
    set({
      space: 'more',
      moreSection: section,
      spaceSub: section,
      tab,
      error: '',
      drawer: null,
    });
    get().loadTabData(tab).catch(console.error);
  },
  logout: () => {
    setToken(null);
    set({
      screen: 'title',
      team: null,
      players: [],
      messages: [],
      userLabel: '',
      tab: 'home',
      space: 'central',
      moreSection: null,
      drawer: null,
    });
  },

  loadTeamData: async (teamId) => {
    const [t, m, p, ch] = await Promise.all([
      api.getTeam(teamId),
      api.messages(teamId),
      api.players(teamId),
      api.chronicle(teamId, 25).catch(() => ({ entries: [] as ChronicleEntry[] })),
    ]);
    set({
      team: t.team,
      messages: m.messages,
      players: p.players,
      chronicle: ch.entries,
    });
  },

  loadChronicle: async () => {
    const team = get().team;
    if (!team) return;
    try {
      const [ch, rev] = await Promise.all([
        api.chronicle(team.id, 40),
        api.seasonReview(team.id, 1),
      ]);
      set({ chronicle: ch.entries, seasonReview: rev });
    } catch (e) {
      console.error(e);
    }
  },

  loadTabData: async (tab) => {
    const team = get().team;
    if (!team) return;
    try {
      if (tab === 'shop') {
        const s = await api.shop(team.id);
        set({
          shopItems: s.items,
          team: { ...team, goldBalance: s.gold },
        });
      }
      if (tab === 'achievements') set({ achievements: (await api.achievements(team.id)).achievements });
      if (tab === 'budget') set({ budgetInfo: await api.budget(team.id) });
      if (tab === 'messages') set({ messages: (await api.messages(team.id)).messages });
      if (tab === 'squad') set({ players: (await api.players(team.id)).players });
      if (tab === 'board' || tab === 'tactics') set({ board: await api.board(team.id) });
      if (tab === 'youth') set({ youth: (await api.youth(team.id)).youth });
      if (tab === 'market') {
        const m = await api.market(team.id);
        set({ listings: m.listings, team: { ...team, budget: m.budget } });
      }
      if (tab === 'live') set({ challenges: await api.challenges(team.id) });
      if (tab === 'training') set({ training: await api.training(team.id) });
      if (tab === 'legends') set({ legends: (await api.legends(team.id)).legends });
      if (tab === 'mgrmarket') {
        const [mm, jobs] = await Promise.all([api.managerMarket(team.id), api.managerJobs(team.id)]);
        set({ mgrMarket: mm, managerJobs: jobs.jobs });
      }
      if (tab === 'match') {
        try {
          set({ matchPreview: await api.matchPreview(team.id) });
        } catch {
          /* preview optionnel */
        }
      }
      if (tab === 'home') {
        try {
          const [ch, ev] = await Promise.all([
            api.challenges(team.id),
            api.events(team.id, 'pending'),
          ]);
          set({
            challenges: ch,
            activeEvent: ev.legacy ?? get().activeEvent,
            matchPreview: await api.matchPreview(team.id).catch(() => get().matchPreview),
          });
        } catch {
          /* ignore */
        }
      }

      try {
        if (tab === 'home' || tab === 'board') {
          const table = await api.leagueTable(team.id);
          set({ leagueTable: table.table });
        }
        if (tab === 'board') {
          const st = await api.staff(team.id);
          set({ staffCatalog: st.catalog, staffMembers: st.staff });
        }
        if (tab === 'market') {
          const n = await api.negotiations(team.id);
          set({ negotiations: n.negotiations });
        }
      } catch { /* optional modules */ }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur chargement' });
    }
  },

  switchTab: (tab) => {
    const spaceMap: Partial<Record<Tab, MainSpace>> = {
      home: 'central',
      squad: 'squad',
      match: 'match',
      market: 'market',
      live: 'live',
      board: 'more',
      tactics: 'more',
      youth: 'more',
      training: 'more',
      messages: 'more',
      budget: 'more',
      shop: 'more',
      legends: 'more',
      mgrmarket: 'more',
      achievements: 'more',
    };
    const moreMap: Partial<Record<Tab, MoreSection>> = {
      board: 'board',
      tactics: 'tactics',
      youth: 'academy',
      training: 'training',
      messages: 'news',
      budget: 'finance',
      shop: 'shop',
      legends: 'legends',
      mgrmarket: 'manager',
      achievements: 'achievements',
    };
    const space = spaceMap[tab] ?? 'central';
    set({
      tab,
      space,
      moreSection: space === 'more' ? moreMap[tab] ?? null : null,
      error: '',
    });
    get().loadTabData(tab).catch(console.error);
  },

  bootstrap: async () => {
    const token = localStorage.getItem('alym_token');
    if (!token) return;
    try {
      const r = await api.me();
      set({ userLabel: r.user.username || r.user.email });
      if (r.user.teams.length > 0) {
        await get().loadTeamData(r.user.teams[0].id);
        set({ screen: 'dashboard' });
      } else set({ screen: 'create-team' });
    } catch {
      setToken(null);
    }
  },

  auth: async (email, password, username) => {
    set({ loading: true, error: '' });
    try {
      const res =
        get().authMode === 'register'
          ? await api.register({ email, password, username: username || undefined })
          : await api.login({ email, password });
      setToken(res.token);
      set({ userLabel: res.user.username || res.user.email });
      const teams = await api.teams();
      if (teams.teams.length > 0) {
        await get().loadTeamData(teams.teams[0].id);
        set({ screen: 'dashboard' });
      } else set({ screen: 'create-team' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  createTeam: async (name, nation) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.createTeam({ name, nation });
      await get().loadTeamData(res.team.id);
      set({ screen: 'dashboard', tab: 'home' });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  playMatch: async () => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      const res = await api.playMatch(team.id);
      set({
        lastMatch: res.match,
        team: {
          ...team,
          wins: res.team.wins,
          draws: res.team.draws,
          losses: res.team.losses,
          budget: res.team.budget,
          goldBalance: typeof res.team.goldBalance === 'number' ? res.team.goldBalance : team.goldBalance,
        },
        messages: (await api.messages(team.id)).messages,
        activeEvent: res.event,
        challengeNote: res.challenge ? `${res.challenge.title}: ${res.challenge.note}` : null,
        marketHeadlines: res.marketHeadlines ?? [],
      });
      try {
        set({ matchPreview: await api.matchPreview(team.id) });
      } catch {
        /* ignore */
      }
      try {
        const ch = await api.chronicle(team.id, 25);
        set({ chronicle: ch.entries });
      } catch {
        /* ignore */
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  resolveEvent: async (choice) => {
    const { team, activeEvent } = get();
    if (!team || !activeEvent) return;
    set({ loading: true });
    try {
      // Prefer dedicated event engine endpoint (persisted cuid)
      try {
        const res = await api.resolveCareerEvent(team.id, activeEvent.id, choice.id);
        set({
          team: {
            ...team,
            budget: res.team.budget,
            jobSecurity: res.team.jobSecurity,
            tacticalVision: res.team.tacticalVision,
          },
          activeEvent: res.legacy,
          messages: (await api.messages(team.id)).messages,
          players: (await api.players(team.id)).players,
        });
        try {
          set({ chronicle: (await api.chronicle(team.id, 25)).entries });
        } catch {
          /* ignore */
        }
      } catch {
        const res = await api.resolveEvent(team.id, {
          eventId: activeEvent.id,
          choiceId: choice.id,
          effect: choice.effect,
        });
        set({
          team: {
            ...team,
            budget: res.budget,
            jobSecurity: res.jobSecurity,
            tacticalVision: res.tacticalVision,
          },
          activeEvent: null,
          messages: (await api.messages(team.id)).messages,
        });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  setVision: async (vision) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.setTactics(team.id, vision);
      set({
        board: await api.board(team.id),
        team: { ...team, tacticalVision: vision },
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  scoutYouth: async () => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.scoutYouth(team.id);
      set({ youth: (await api.youth(team.id)).youth });
      await get().loadTeamData(team.id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  promote: async (playerId) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.promoteYouth(team.id, playerId);
      set({
        youth: (await api.youth(team.id)).youth,
        players: (await api.players(team.id)).players,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  buyListing: async (listing) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.marketBuy(team.id, listing);
      const m = await api.market(team.id);
      set({
        listings: m.listings,
        team: { ...team, budget: m.budget },
        players: (await api.players(team.id)).players,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  sellPlayer: async (playerId) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.marketSell(team.id, playerId);
      await get().loadTeamData(team.id);
      const m = await api.market(team.id);
      set({ listings: m.listings, team: { ...get().team!, budget: m.budget } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  startChallenge: async (id) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.startChallenge(team.id, id);
      set({ challenges: await api.challenges(team.id) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  abandonChallenge: async () => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.abandonChallenge(team.id);
      set({ challenges: await api.challenges(team.id) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  setTraining: async (playerId, plan) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.setTraining(team.id, playerId, plan);
      set({ training: await api.training(team.id) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  loanPlayer: async (playerId) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.loan(team.id, playerId);
      set({
        training: await api.training(team.id),
        players: (await api.players(team.id)).players,
      });
      await get().loadTeamData(team.id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  recallLoan: async (playerId) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.recallLoan(team.id, playerId);
      set({
        training: await api.training(team.id),
        players: (await api.players(team.id)).players,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  recruitLegend: async (code) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      await api.recruitLegend(team.id, code);
      set({
        legends: (await api.legends(team.id)).legends,
        players: (await api.players(team.id)).players,
      });
      await get().loadTeamData(team.id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  buyShop: async (itemId) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true });
    try {
      const res = await api.buy(team.id, itemId);
      set({
        team: { ...team, goldBalance: res.gold, budget: res.budget },
        shopItems: (await api.shop(team.id)).items,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (messageId) => {
    const team = get().team;
    if (!team) return;
    try {
      await api.markRead(team.id, messageId);
      set({
        messages: get().messages.map((m) => (m.id === messageId ? { ...m, read: true } : m)),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur' });
    }
  },

  hireStaff: async (role) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      const res = await api.hireStaff(team.id, role);
      const st = await api.staff(team.id);
      set({
        staffCatalog: st.catalog,
        staffMembers: st.staff,
        team: { ...team, budget: res.budget },
        messages: (await api.messages(team.id)).messages,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },
  fireStaff: async (id) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      const res = await api.fireStaff(team.id, id);
      const st = await api.staff(team.id);
      set({ staffCatalog: st.catalog, staffMembers: st.staff, team: { ...team, budget: res.budget } });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },
  openNego: async (listing, offerAmount) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      await api.openNegotiation(team.id, { ...listing, offerAmount });
      set({
        negotiations: (await api.negotiations(team.id)).negotiations,
        messages: (await api.messages(team.id)).messages,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },
  respondNego: async (id, action, raiseAmount) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      await api.respondNegotiation(team.id, id, { action, raiseAmount });
      set({ negotiations: (await api.negotiations(team.id)).negotiations });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },
  completeNego: async (id) => {
    const team = get().team;
    if (!team) return;
    set({ loading: true, error: '' });
    try {
      const res = await api.completeNegotiation(team.id, id);
      set({
        team: { ...team, budget: res.budget },
        players: (await api.players(team.id)).players,
        negotiations: (await api.negotiations(team.id)).negotiations,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur' });
    } finally {
      set({ loading: false });
    }
  },

}));
