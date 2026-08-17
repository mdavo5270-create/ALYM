import { useEffect, useState } from 'react';
import {
  api,
  setToken,
  type Team,
  type GameMessage,
  type Player,
  type ShopItem,
  type Achievement,
  type BudgetInfo,
} from './lib/api';
import { AlymLogo, MylaMark } from './components/Logo';

type Screen = 'splash' | 'title' | 'auth' | 'create-team' | 'dashboard';
type Tab = 'home' | 'messages' | 'squad' | 'match' | 'budget' | 'shop' | 'achievements';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
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
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo | null>(null);
  const [lastMatch, setLastMatch] = useState<{
    opponent: string;
    homeScore: number;
    awayScore: number;
    result: string;
    prize: number;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setScreen((s) => (s === 'splash' ? 'title' : s)), 2200);
    return () => clearTimeout(t);
  }, []);

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

  async function loadTabData(teamId: number, t: Tab) {
    if (t === 'shop') {
      const s = await api.shop(teamId);
      setShopItems(s.items);
      setTeam((prev) => (prev ? { ...prev, goldBalance: s.gold } : prev));
    }
    if (t === 'achievements') {
      const a = await api.achievements(teamId);
      setAchievements(a.achievements);
    }
    if (t === 'budget') {
      const b = await api.budget(teamId);
      setBudgetInfo(b);
    }
    if (t === 'messages') {
      const m = await api.messages(teamId);
      setMessages(m.messages);
    }
    if (t === 'squad') {
      const p = await api.players(teamId);
      setPlayers(p.players);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    if (team) loadTabData(team.id, t).catch(console.error);
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
        } else setScreen('create-team');
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
      } else setScreen('create-team');
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

  async function playMatch() {
    if (!team) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.playMatch(team.id);
      setLastMatch(res.match);
      setTeam((prev) =>
        prev
          ? {
              ...prev,
              wins: res.team.wins,
              draws: res.team.draws,
              losses: res.team.losses,
              budget: res.team.budget,
            }
          : prev
      );
      const m = await api.messages(team.id);
      setMessages(m.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function buyItem(itemId: string) {
    if (!team) return;
    setLoading(true);
    try {
      const res = await api.buy(team.id, itemId);
      setTeam((prev) =>
        prev ? { ...prev, goldBalance: res.gold, budget: res.budget } : prev
      );
      const m = await api.messages(team.id);
      setMessages(m.messages);
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
    setScreen('title');
    setTab('home');
    setLastMatch(null);
  }

  if (screen === 'splash') {
    return (
      <div className="min-h-screen alym-title-bg text-white flex flex-col items-center justify-center gap-6">
        <AlymLogo size={140} className="alym-logo-anim" />
        <h1 className="text-5xl font-bold alym-title tracking-[0.2em]">ALYM</h1>
        <p className="text-xs text-gray-500 tracking-[0.35em] uppercase alym-fade-up-delay">
          Athletic League Youth Manager
        </p>
        <div className="mt-10 alym-fade-up-delay-2">
          <MylaMark />
        </div>
      </div>
    );
  }

  if (screen === 'title') {
    return (
      <div className="min-h-screen alym-title-bg text-white flex flex-col items-center justify-center gap-6 px-4">
        <AlymLogo size={120} className="alym-logo-anim alym-fade-up" />
        <div className="text-center alym-fade-up-delay">
          <h1 className="text-5xl font-bold alym-title tracking-[0.18em]">ALYM</h1>
          <p className="text-sm text-gray-400 mt-3 uppercase tracking-[0.28em]">
            Athletic League Youth Manager
          </p>
        </div>
        <div className="flex flex-col gap-3 w-64 alym-fade-up-delay-2">
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
        <div className="absolute bottom-8">
          <MylaMark />
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-alym-dark text-white flex flex-col items-center justify-center px-4">
        <AlymLogo size={64} className="mb-4 alym-logo-anim" />
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
            placeholder="Mot de passe (6+ caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-alym-gold text-black font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? '...' : mode === 'register' ? "S'inscrire" : 'Se connecter'}
          </button>
          <button type="button" onClick={() => setScreen('title')} className="text-gray-500 text-sm">
            Retour
          </button>
        </form>
        <div className="mt-10">
          <MylaMark />
        </div>
      </div>
    );
  }

  if (screen === 'create-team') {
    return (
      <div className="min-h-screen bg-alym-dark text-white flex flex-col items-center justify-center px-4">
        <AlymLogo size={56} className="mb-3" />
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
            className="bg-alym-gold text-black font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? '...' : "Créer l'équipe"}
          </button>
        </form>
      </div>
    );
  }

  const unread = messages.filter((m) => !m.read).length;
  const nav: { id: Tab; label: string }[] = [
    { id: 'home', label: 'Accueil' },
    { id: 'match', label: 'Match' },
    { id: 'messages', label: `Messages${unread ? ` (${unread})` : ''}` },
    { id: 'squad', label: 'Effectif' },
    { id: 'budget', label: 'Budget' },
    { id: 'shop', label: 'Boutique' },
    { id: 'achievements', label: 'Succès' },
  ];

  return (
    <div className="min-h-screen bg-alym-dark text-white flex">
      <aside className="w-52 bg-alym-surface border-r border-gray-800 p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <AlymLogo size={32} />
          <span className="text-alym-gold font-bold text-lg tracking-wide">ALYM</span>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => switchTab(n.id)}
              className={`text-left px-3 py-2 rounded-lg ${
                tab === n.id
                  ? 'bg-alym-gold/15 text-alym-gold font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <MylaMark />
          <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400">
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{team?.name}</h1>
            <p className="text-gray-500 text-sm">
              Saison 1 · {team?.nation} · {team?.wins ?? 0}V {team?.draws ?? 0}N {team?.losses ?? 0}D
            </p>
          </div>
          <div className="text-alym-gold font-semibold">
            £{Number(team?.budget ?? 0).toLocaleString()} · {team?.goldBalance ?? 0} Or
          </div>
        </header>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {tab === 'home' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: 'Jouer un match', d: 'Simuler', action: () => switchTab('match') },
              { t: 'Messages', d: String(unread), action: () => switchTab('messages') },
              { t: 'Effectif', d: `${players.length}/16`, action: () => switchTab('squad') },
              {
                t: 'Budget',
                d: `£${Number(team?.budget ?? 0).toLocaleString()}`,
                action: () => switchTab('budget'),
              },
            ].map((c) => (
              <button
                key={c.t}
                onClick={c.action}
                className="bg-alym-surface border border-gray-800 rounded-xl p-4 text-left hover:border-alym-gold/40"
              >
                <div className="text-alym-gold text-xs font-bold mb-2">{c.t}</div>
                <div className="text-xl font-semibold">{c.d}</div>
              </button>
            ))}
          </div>
        )}

        {tab === 'match' && (
          <div className="max-w-lg space-y-6">
            <h2 className="text-lg font-bold text-alym-gold">Préparation Match</h2>
            <p className="text-gray-400 text-sm">
              Effectif : {players.length} joueurs · Formation auto 4-3-3
            </p>
            <button
              onClick={playMatch}
              disabled={loading || players.length < 11}
              className="bg-alym-gold text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Simulation...' : 'SIMULER LE MATCH'}
            </button>
            {lastMatch && (
              <div className="bg-alym-surface border border-alym-gold/30 rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">Résultat</div>
                <div className="text-3xl font-bold">
                  {team?.name} {lastMatch.homeScore} – {lastMatch.awayScore} {lastMatch.opponent}
                </div>
                <div className="mt-3 text-alym-gold font-semibold">
                  {lastMatch.result === 'W'
                    ? 'Victoire'
                    : lastMatch.result === 'D'
                      ? 'Match nul'
                      : 'Défaite'}{' '}
                  · +£{lastMatch.prize.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-lg font-bold text-alym-gold mb-4">Messages</h2>
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
            <h2 className="text-lg font-bold text-alym-gold mb-4">Effectif ({players.length})</h2>
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
                  <tr key={p.id} className="border-b border-gray-900">
                    <td className="py-3 pr-4 text-alym-gold font-bold">{p.position}</td>
                    <td className="py-3 pr-4">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.nation}</td>
                    <td className="py-3 pr-4">£{Number(p.salary).toLocaleString()}</td>
                    <td className="py-3 text-alym-gold font-bold">{p.rating?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'budget' && budgetInfo && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-lg font-bold text-alym-gold">Budget</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-alym-surface rounded-xl p-4 border border-gray-800">
                <div className="text-xs text-gray-500">Solde</div>
                <div className="text-2xl font-bold text-alym-gold">
                  £{Number(budgetInfo.budget).toLocaleString()}
                </div>
              </div>
              <div className="bg-alym-surface rounded-xl p-4 border border-gray-800">
                <div className="text-xs text-gray-500">Salaires / sem.</div>
                <div className="text-2xl font-bold">
                  £{Number(budgetInfo.weeklySalaries).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Transactions récentes</h3>
              {budgetInfo.transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between py-2 border-b border-gray-900 text-sm"
                >
                  <span className="text-gray-400">{t.reason || t.type}</span>
                  <span className={t.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {t.amount >= 0 ? '+' : ''}£{Number(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'shop' && (
          <div>
            <h2 className="text-lg font-bold text-alym-gold mb-2">Boutique</h2>
            <p className="text-sm text-gray-400 mb-4">Or disponible : {team?.goldBalance ?? 0}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shopItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-alym-surface border border-gray-800 rounded-xl p-4 flex flex-col"
                >
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-alym-gold text-sm mt-2">{item.price} Or</div>
                  <button
                    onClick={() => buyItem(item.id)}
                    disabled={loading || (team?.goldBalance ?? 0) < item.price}
                    className="mt-4 bg-alym-gold text-black text-sm font-bold py-2 rounded-lg disabled:opacity-40"
                  >
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="max-w-xl space-y-3">
            <h2 className="text-lg font-bold text-alym-gold mb-4">Succès</h2>
            {achievements.map((a) => (
              <div
                key={a.code}
                className={`bg-alym-surface border rounded-xl p-4 flex justify-between items-center ${
                  a.unlocked ? 'border-alym-gold/40' : 'border-gray-800 opacity-60'
                }`}
              >
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-gray-400">{a.description}</div>
                </div>
                <div className="text-xs text-alym-gold">
                  {a.unlocked ? '✓ Débloqué' : 'Verrouillé'}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
