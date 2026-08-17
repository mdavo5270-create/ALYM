import { useEffect, useState } from 'react';
import { api, setToken, type Team, type GameMessage, type Player } from './lib/api';

type Screen = 'title' | 'auth' | 'create-team' | 'dashboard';
type Tab = 'home' | 'messages' | 'squad';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [tab, setTab] = useState<Tab>('home');
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [teamName, setTeamName] = useState('');
  const [nation, setNation] = useState('France');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [userLabel, setUserLabel] = useState('');
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  async function loadTeamData(teamId: number) {
    const [t, m, p] = await Promise.all([
      api.getTeam(teamId),
      api.messages(teamId),
      api.players(teamId),
    ]);
    setTeam(t.team);
    setMessages(m.messages);
    setPlayers(p.players);
  }

  useEffect(() => {
    const token = localStorage.getItem('alym_token');
    if (!token) return;
    api
      .me()
      .then(async (r) => {
        setUserLabel(r.user.username || r.user.email);
        if (r.user.teams.length > 0) {
          await loadTeamData(r.user.teams[0].id);
          setScreen('dashboard');
        } else {
          setScreen('create-team');
        }
      })
      .catch(() => setToken(null));
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res =
        mode === 'register'
          ? await api.register({ email, password, username: username || undefined })
          : await api.login({ email, password });
      setToken(res.token);
      setUserLabel(res.user.username || res.user.email);
      const teams = await api.teams();
      if (teams.teams.length > 0) {
        await loadTeamData(teams.teams[0].id);
        setScreen('dashboard');
      } else {
        setScreen('create-team');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.createTeam({ name: teamName, nation });
      await loadTeamData(res.team.id);
      setScreen('dashboard');
      setTab('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(msg: GameMessage) {
    if (!team || msg.read) return;
    await api.markRead(team.id, msg.id);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
  }

  function logout() {
    setToken(null);
    setTeam(null);
    setMessages([]);
    setPlayers([]);
    setScreen('title');
    setTab('home');
  }

  if (screen === 'title') {
    return (
      <div className="min-h-screen bg-alym-dark text-white flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-alym-gold tracking-wide">ALYM</h1>
          <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest">
            Athletic League Youth Manager
          </p>
        </div>
        <div className="flex flex-col gap-3 w-64">
          <button
            onClick={() => {
              setMode('register');
              setScreen('auth');
            }}
            className="bg-alym-gold text-black font-bold py-3 rounded-lg hover:brightness-110 transition"
          >
            Nouveau Jeu
          </button>
          <button
            onClick={() => {
              setMode('login');
              setScreen('auth');
            }}
            className="border border-alym-gold text-alym-gold font-bold py-3 rounded-lg hover:bg-alym-gold/10 transition"
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-alym-dark text-white flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-alym-gold mb-6">
          {mode === 'register' ? 'Créer un compte' : 'Connexion'}
        </h2>
        <form onSubmit={handleAuth} className="w-full max-w-sm flex flex-col gap-3">
          {mode === 'register' && (
            <input
              className="bg-alym-surface border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-alym-gold"
              placeholder="Pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            type="email"
            required
            className="bg-alym-surface border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-alym-gold"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            className="bg-alym-surface border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-alym-gold"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-alym-gold text-black font-bold py-3 rounded-lg hover:brightness-110 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'register' ? "S'inscrire" : 'Se connecter'}
          </button>
          <button type="button" onClick={() => setScreen('title')} className="text-gray-500 text-sm mt-2">
            Retour
          </button>
        </form>
      </div>
    );
  }

  if (screen === 'create-team') {
    return (
      <div className="min-h-screen bg-alym-dark text-white flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-alym-gold mb-2">Créer une équipe</h2>
        <p className="text-gray-400 text-sm mb-6">Bienvenue {userLabel}</p>
        <form onSubmit={handleCreateTeam} className="w-full max-w-sm flex flex-col gap-3">
          <input
            required
            minLength={2}
            className="bg-alym-surface border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-alym-gold"
            placeholder="Nom de l'équipe"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <input
            className="bg-alym-surface border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-alym-gold"
            placeholder="Nation"
            value={nation}
            onChange={(e) => setNation(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-alym-gold text-black font-bold py-3 rounded-lg hover:brightness-110 disabled:opacity-50"
          >
            {loading ? '...' : "Créer l'équipe"}
          </button>
        </form>
      </div>
    );
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-alym-dark text-white flex">
      <aside className="w-52 bg-alym-surface border-r border-gray-800 p-4 flex flex-col shrink-0">
        <div className="text-alym-gold font-bold text-lg mb-8">ALYM</div>
        <nav className="flex flex-col gap-1 text-sm">
          {(
            [
              ['home', 'Accueil'],
              ['messages', `Messages${unread ? ` (${unread})` : ''}`],
              ['squad', 'Effectif'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`text-left px-3 py-2 rounded-lg ${
                tab === id ? 'bg-alym-gold/15 text-alym-gold font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto text-xs text-gray-600 hover:text-red-400">
          Déconnexion
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{team?.name ?? 'Équipe'}</h1>
            <p className="text-gray-500 text-sm">Saison 1 · Super Ligue · {team?.nation}</p>
          </div>
          <div className="text-alym-gold font-semibold">
            £{Number(team?.budget ?? 0).toLocaleString()} · {team?.goldBalance ?? 0} Or
          </div>
        </header>

        {tab === 'home' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: 'Messages', d: String(unread), action: () => setTab('messages') },
              { t: 'Effectif', d: `${players.length}/16`, action: () => setTab('squad') },
              {
                t: 'Bilan',
                d: `${team?.wins ?? 0}V ${team?.draws ?? 0}N ${team?.losses ?? 0}D`,
              },
              { t: 'Budget', d: `£${Number(team?.budget ?? 0).toLocaleString()}` },
            ].map((c) => (
              <button
                key={c.t}
                onClick={c.action}
                className="bg-alym-surface border border-gray-800 rounded-xl p-4 text-left hover:border-alym-gold/40 transition"
              >
                <div className="text-alym-gold text-xs font-bold mb-2">{c.t}</div>
                <div className="text-xl font-semibold">{c.d}</div>
              </button>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-lg font-bold text-alym-gold mb-4">Messages</h2>
            {messages.length === 0 && <p className="text-gray-500">Aucun message</p>}
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => openMessage(m)}
                className={`w-full text-left bg-alym-surface border rounded-xl p-4 ${
                  m.read ? 'border-gray-800 opacity-70' : 'border-alym-gold/50'
                }`}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{m.sender}</span>
                  {!m.read && <span className="text-alym-gold">Non lu</span>}
                </div>
                <div className="font-semibold">{m.title}</div>
                <p className="text-sm text-gray-400 mt-1">{m.content}</p>
              </button>
            ))}
          </div>
        )}

        {tab === 'squad' && (
          <div>
            <h2 className="text-lg font-bold text-alym-gold mb-4">
              Effectif ({players.length}/16)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-alym-gold text-left border-b border-gray-800">
                    <th className="py-2 pr-4">POS</th>
                    <th className="py-2 pr-4">Joueur</th>
                    <th className="py-2 pr-4">Nat</th>
                    <th className="py-2 pr-4">Salaire</th>
                    <th className="py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-b border-gray-900 hover:bg-alym-surface/50">
                      <td className="py-3 pr-4 text-alym-gold font-bold">{p.position}</td>
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{p.nation}</td>
                      <td className="py-3 pr-4">£{Number(p.salary).toLocaleString()}</td>
                      <td className="py-3 text-alym-gold font-bold">{p.rating.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
