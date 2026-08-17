const API = '/api';

function getToken() {
  return localStorage.getItem('alym_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('alym_token', token);
  else localStorage.removeItem('alym_token');
}

function extractError(data: unknown, status: number): string {
  if (!data || typeof data !== 'object') return `Erreur ${status}`;
  const d = data as Record<string, unknown>;
  const err = d.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const field = (err as { fieldErrors?: Record<string, string[]> }).fieldErrors;
    if (field) {
      const first = Object.values(field).flat()[0];
      if (first) return first;
    }
  }
  if (typeof d.message === 'string') return d.message;
  return `Erreur ${status}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractError(data, res.status));
  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; username?: string }) =>
    request<{ token: string; user: { id: number; email: string; username: string | null } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(body) }
    ),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: { id: number; email: string; username: string | null } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(body) }
    ),
  me: () =>
    request<{ user: { id: number; email: string; username: string | null; teams: { id: number; name: string }[] } }>(
      '/auth/me'
    ),
  teams: () => request<{ teams: Team[] }>('/teams'),
  createTeam: (body: { name: string; nation?: string; stadiumName?: string; badgeDesign?: number }) =>
    request<{ team: Team }>('/teams', { method: 'POST', body: JSON.stringify(body) }),
  getTeam: (id: number) => request<{ team: TeamDetail }>(`/teams/${id}`),
  messages: (teamId: number) => request<{ messages: GameMessage[] }>(`/teams/${teamId}/messages`),
  markRead: (teamId: number, messageId: number) =>
    request<{ ok: boolean }>(`/teams/${teamId}/messages/${messageId}/read`, { method: 'PATCH' }),
  players: (teamId: number) => request<{ players: Player[] }>(`/teams/${teamId}/players`),
  matchPreview: (teamId: number) =>
    request<{
      homeName: string;
      opponent: string;
      competition: string;
      venue: string;
      kickoffLabel: string;
      availablePlayers: number;
      formHint: string;
      tacticalVision: string;
      strength: { attack: number; midfield: number; defense: number; gk: number };
    }>(`/teams/${teamId}/matches/preview`),
  playMatch: (teamId: number) =>
    request<{
      match: {
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
      team: { wins: number; draws: number; losses: number; budget: number; goldBalance?: number };
      event: GameEvent | null;
      challenge: { status: string; title: string; note: string } | null;
      marketHeadlines?: string[];
    }>(`/teams/${teamId}/matches/play`, { method: 'POST' }),
  shop: (teamId: number) => request<{ gold: number; items: ShopItem[] }>(`/teams/${teamId}/shop`),
  buy: (teamId: number, itemId: string) =>
    request<{ ok: boolean; gold: number; budget: number }>(`/teams/${teamId}/shop/buy`, {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),
  achievements: (teamId: number) =>
    request<{ achievements: Achievement[] }>(`/teams/${teamId}/achievements`),
  budget: (teamId: number) => request<BudgetInfo>(`/teams/${teamId}/budget`),
  board: (teamId: number) => request<BoardInfo>(`/teams/${teamId}/career/board`),
  setTactics: (teamId: number, vision: string) =>
    request<{ ok: boolean; tacticalVision: string }>(`/teams/${teamId}/career/tactics`, {
      method: 'POST',
      body: JSON.stringify({ vision }),
    }),
  resolveEvent: (teamId: number, body: { eventId: string; choiceId: string; effect?: string }) =>
    request<{
      ok: boolean;
      budget: number;
      jobSecurity: number;
      tacticalVision: string;
      note: string;
    }>(`/teams/${teamId}/career/event/resolve`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  events: (teamId: number, status?: string) =>
    request<{
      events: CareerEventRecord[];
      pending: CareerEventRecord | null;
      legacy: GameEvent | null;
      counts: { pending: number; resolved: number };
    }>(`/teams/${teamId}/events${status ? `?status=${status}` : ''}`),
  resolveCareerEvent: (teamId: number, eventId: string, choiceId: string) =>
    request<{
      ok: boolean;
      event: CareerEventRecord;
      result: { note: string; budget: number; jobSecurity: number; tacticalVision: string };
      team: { budget: number; jobSecurity: number; tacticalVision: string };
      nextPending: CareerEventRecord | null;
      legacy: GameEvent | null;
    }>(`/teams/${teamId}/events/${eventId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ choiceId }),
    }),
  youth: (teamId: number) => request<{ youth: Player[]; count: number }>(`/teams/${teamId}/career/youth`),
  scoutYouth: (teamId: number) =>
    request<{ player: Player; potential: number }>(`/teams/${teamId}/career/youth/scout`, {
      method: 'POST',
    }),
  promoteYouth: (teamId: number, playerId: number) =>
    request<{ ok: boolean }>(`/teams/${teamId}/career/youth/promote/${playerId}`, { method: 'POST' }),
  market: (teamId: number) =>
    request<{ listings: MarketListing[]; budget: number }>(`/teams/${teamId}/career/market`),
  marketBuy: (teamId: number, listing: MarketListing) =>
    request<{ player: Player }>(`/teams/${teamId}/career/market/buy`, {
      method: 'POST',
      body: JSON.stringify(listing),
    }),
  marketSell: (teamId: number, playerId: number) =>
    request<{ ok: boolean; fee: number }>(`/teams/${teamId}/career/market/sell/${playerId}`, {
      method: 'POST',
    }),
  challenges: (teamId: number) => request<ChallengesResponse>(`/teams/${teamId}/live/challenges`),
  startChallenge: (teamId: number, challengeId: string) =>
    request<{ ok: boolean }>(`/teams/${teamId}/live/challenges/start`, {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    }),
  abandonChallenge: (teamId: number) =>
    request<{ ok: boolean }>(`/teams/${teamId}/live/challenges/abandon`, { method: 'POST' }),
  training: (teamId: number) => request<TrainingInfo>(`/teams/${teamId}/live/training`),
  setTraining: (teamId: number, playerId: number, plan: string) =>
    request<{ ok: boolean }>(`/teams/${teamId}/live/training/${playerId}`, {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
  loan: (teamId: number, playerId: number) =>
    request<{ ok: boolean; fee: number }>(`/teams/${teamId}/live/loan/${playerId}`, { method: 'POST' }),
  recallLoan: (teamId: number, playerId: number) =>
    request<{ ok: boolean }>(`/teams/${teamId}/live/loan/${playerId}/recall`, { method: 'POST' }),
  legends: (teamId: number) => request<{ legends: Legend[] }>(`/teams/${teamId}/legends`),
  recruitLegend: (teamId: number, code: string) =>
    request<{ player: Player }>(`/teams/${teamId}/legends/recruit/${code}`, { method: 'POST' }),
  managerMarket: (teamId: number) =>
    request<ManagerMarketData>(`/teams/${teamId}/manager-market`),
  managerJobs: (teamId: number) =>
    request<{
      playerReputation: number;
      tacticalVision: string;
      jobs: ManagerJob[];
    }>(`/teams/${teamId}/manager-market/jobs`),
  applyJob: (teamId: number, clubId: number) =>
    request<{ ok: boolean; accepted: boolean; clubName: string; score: number; note: string }>(
      `/teams/${teamId}/manager-market/jobs/${clubId}/apply`,
      { method: 'POST' }
    ),
};

export type Team = {
  id: number;
  name: string;
  nation: string | null;
  budget: number;
  goldBalance: number;
  wins: number;
  draws: number;
  losses: number;
  jobSecurity?: number;
  tacticalVision?: string;
  _count?: { players: number; messages: number };
};

export type TeamDetail = Team & { players: Player[]; messages: GameMessage[] };

export type GameMessage = {
  id: number;
  sender: string;
  title: string;
  content: string;
  read: boolean;
  messageDate: string;
};

export type Player = {
  id: number;
  name: string;
  position: string;
  nation: string | null;
  salary: number;
  rating?: number;
  potential?: number;
  isYouth?: boolean;
  onLoan?: boolean;
  trainingPlan?: string;
  speed?: number;
  dribble?: number;
  shot?: number;
  pass?: number;
  defense?: number;
  physique?: number;
  contractUntil?: string | null;
  isLegend?: boolean;
};

export type ShopItem = { id: string; name: string; price: number; effect: string };

export type Achievement = {
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type BudgetInfo = {
  budget: number;
  gold: number;
  weeklySalaries: number;
  income: number;
  expenses: number;
  transactions: { id: number; type: string; amount: number; reason: string | null; transactionDate: string }[];
};

export type BoardInfo = {
  jobSecurity: number;
  tacticalVision: string;
  objectives: { code: string; label: string; target: number; current: number; weight: number }[];
  visions: { id: string; name: string; desc: string }[];
};

export type GameEvent = {
  id: string;
  category: string;
  title: string;
  body: string;
  choices: { id: string; label: string; effect: string }[];
  type?: string;
  priority?: string;
};

export type CareerEventRecord = {
  id: string;
  type: string;
  priority: string;
  title: string;
  body: string;
  context: Record<string, unknown>;
  options: { id: string; label: string; effects: string[] }[];
  status: string;
  choiceId?: string | null;
  consequenceNote?: string | null;
  createdAt: string;
  expiresAt?: string | null;
};

export type MarketListing = {
  tempId?: string;
  name: string;
  position: string;
  nation?: string;
  salary: number;
  speed: number;
  dribble: number;
  shot: number;
  pass: number;
  defense: number;
  physique: number;
  potential: number;
  rating: number;
  price: number;
};

export type ChallengeDef = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  goalType: string;
  goalTarget: number;
  matchesLimit: number;
  rewardGold: number;
  rewardBudget: number;
  restriction?: string;
  parameters?: { transfers?: string; youth?: string; tactics?: string; focus?: string };
  progress?: { wins: number; matches: number; streak: number; youth: number };
};

export type ChallengesResponse = {
  catalog: ChallengeDef[];
  active: ChallengeDef | null;
};

export type TrainingInfo = {
  plans: { id: string; name: string; focus: string }[];
  players: { id: number; name: string; position: string; trainingPlan: string; onLoan: boolean; isYouth: boolean }[];
};


export type Legend = {
  code: string;
  name: string;
  position: string;
  nation: string;
  stats: { speed: number; dribble: number; shot: number; pass: number; defense: number; physique: number };
  salary: number;
  unlock: string;
  unlocked: boolean;
  owned: boolean;
};


export type ManagerJob = {
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

export type MatchTimelineEvent = {
  minute: number;
  type: string;
  side: string;
  label: string;
};

export type ManagerMarketData = {
  clubs: {
    id: number;
    name: string;
    nation: string | null;
    reputation: number;
    tacticalVision: string;
    leagueTier: number;
    jobSecurity: number;
    record: string;
    manager: {
      name: string;
      nation: string | null;
      reputation: number;
      status: string;
      preferredVision: string;
      seasonsAtClub: number;
    } | null;
  }[];
  freeAgents: {
    id: number;
    name: string;
    nation: string | null;
    reputation: number;
    status: string;
    preferredVision: string;
  }[];
  events: {
    id: number;
    type: string;
    clubName: string;
    managerName: string | null;
    detail: string | null;
    createdAt: string;
  }[];
};
