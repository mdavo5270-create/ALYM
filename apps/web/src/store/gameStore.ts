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
} from '../lib/api';

export type Screen = 'splash' | 'title' | 'auth' | 'create-team' | 'dashboard';
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

type LastMatch = {
  opponent: string;
  homeScore: number;
  awayScore: number;
  result: string;
  prize: number;
};

type State = {
  screen: Screen;
  tab: Tab;
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
  activeEvent: GameEvent | null;
  challengeNote: string | null;
  selectedPlayerId: number | null;

  setScreen: (s: Screen) => void;
  setTab: (t: Tab) => void;
  setAuthMode: (m: 'login' | 'register') => void;
  setError: (e: string) => void;
  setSelectedPlayerId: (id: number | null) => void;
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
};

export const useGame = create<State>((set, get) => ({
  screen: 'splash',
  tab: 'home',
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
  activeEvent: null,
  challengeNote: null,
  selectedPlayerId: null,

  setScreen: (screen) => set({ screen }),
  setTab: (tab) => set({ tab }),
  setAuthMode: (authMode) => set({ authMode }),
  setError: (error) => set({ error }),
  setSelectedPlayerId: (selectedPlayerId) => set({ selectedPlayerId }),
  logout: () => {
    setToken(null);
    set({
      screen: 'title',
      team: null,
      players: [],
      messages: [],
      userLabel: '',
      tab: 'home',
    });
  },

  loadTeamData: async (teamId) => {
    const [t, m, p] = await Promise.all([
      api.getTeam(teamId),
      api.messages(teamId),
      api.players(teamId),
    ]);
    set({ team: t.team, messages: m.messages, players: p.players });
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
      if (tab === 'mgrmarket') set({ mgrMarket: await api.managerMarket(team.id) });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erreur chargement' });
    }
  },

  switchTab: (tab) => {
    set({ tab, error: '' });
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
      });
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
}));
