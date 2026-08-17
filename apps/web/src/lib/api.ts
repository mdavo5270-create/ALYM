const API = '/api';

function getToken() {
  return localStorage.getItem('alym_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('alym_token', token);
  else localStorage.removeItem('alym_token');
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
  if (!res.ok) {
    throw new Error(data.error || data.message || `Erreur ${res.status}`);
  }
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
  _count?: { players: number; messages: number };
};

export type TeamDetail = Team & {
  players: unknown[];
  messages: { id: number; sender: string; title: string; content: string; read: boolean }[];
};
