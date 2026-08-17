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
  playMatch: (teamId: number) =>
    request<{
      match: { opponent: string; homeScore: number; awayScore: number; result: string; prize: number };
      team: { wins: number; draws: number; losses: number; budget: number; goldBalance?: number };
      event: GameEvent | null;
      challenge: { status: string; title: string; note: string } | null;
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
  resolveEvent: (teamId: number, body: { eventId: string; choiceId: string; effect: string }) =>
    request<{ ok: boolean; budget: number; jobSecurity: number; tacticalVision: string; note: string }>(
      `/teams/${teamId}/career/event/resolve`,
      { method: 'POST', body: JSON.stringify(body) }
    ),
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
