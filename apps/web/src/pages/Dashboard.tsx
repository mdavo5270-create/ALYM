import { useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  PageHeader,
  Panel,
  PosBadge,
  ProgressBar,
  Rating,
  StatCard,
  money,
} from '../components/ui';
import { useGame } from '../store/gameStore';

function Home() {
  const { team, messages, lastMatch, switchTab, board } = useGame();
  const unread = messages.filter((m) => !m.read).slice(0, 3);
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
  const sec = team?.jobSecurity ?? board?.jobSecurity ?? 70;

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Bureau" subtitle="Vue d’ensemble du club et prochaines décisions" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="label-caps">Prochain match</div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold text-mist-50">Adversaire tiré au sort</div>
              <p className="mt-1 text-sm text-mist-400">Simulation rapide · prime selon le résultat</p>
            </div>
            <Button onClick={() => switchTab('match')}>Préparer / jouer</Button>
          </div>
          {lastMatch && (
            <div className="mt-5 rounded-lg border border-ink-600 bg-ink-950/50 px-4 py-3">
              <div className="label-caps">Dernier résultat</div>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="text-lg font-semibold text-mist-50">
                  {lastMatch.homeScore} — {lastMatch.awayScore}
                </span>
                <span className="text-sm text-mist-400">vs {lastMatch.opponent}</span>
                <Badge tone={lastMatch.result === 'W' ? 'good' : lastMatch.result === 'D' ? 'warn' : 'bad'}>
                  {lastMatch.result === 'W' ? 'Victoire' : lastMatch.result === 'D' ? 'Nul' : 'Défaite'}
                </Badge>
                <span className="data-num text-sm text-brass-300">+{money(lastMatch.prize)}</span>
              </div>
            </div>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="label-caps">Confiance du conseil</div>
          <div className="mt-3 text-3xl font-semibold data-num text-mist-50">{sec}%</div>
          <div className="mt-3">
            <ProgressBar value={sec} tone={sec < 35 ? 'bad' : sec < 55 ? 'brass' : 'good'} />
          </div>
          <p className="mt-3 text-xs text-mist-400">Les mauvais résultats et objectifs non tenus pèsent sur votre poste.</p>
          <Button variant="secondary" className="mt-4 w-full" onClick={() => switchTab('board')}>
            Voir le conseil
          </Button>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Matchs" value={played} />
        <StatCard label="Victoires" value={team?.wins ?? 0} tone="good" />
        <StatCard label="Budget" value={money(team?.budget ?? 0)} tone="brass" />
        <StatCard label="Effectif" value={team?._count?.players ?? '—'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-caps">Courrier récent</div>
            <button type="button" className="text-xs text-brass-300 hover:text-brass-400" onClick={() => switchTab('messages')}>
              Tout voir
            </button>
          </div>
          {unread.length === 0 ? (
            <p className="text-sm text-mist-400">Aucun message non lu.</p>
          ) : (
            <ul className="space-y-2">
              {unread.map((m) => (
                <li key={m.id} className="rounded-lg border border-ink-700 bg-ink-950/40 px-3 py-2">
                  <div className="text-sm font-medium text-mist-100">{m.title}</div>
                  <div className="text-xs text-mist-400">{m.sender}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="label-caps mb-3">Raccourcis</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['squad', 'Effectif'],
                ['tactics', 'Tactique'],
                ['market', 'Mercato'],
                ['youth', 'Académie'],
                ['live', 'Défis'],
                ['budget', 'Finances'],
              ] as const
            ).map(([id, label]) => (
              <Button key={id} variant="secondary" onClick={() => switchTab(id)}>
                {label}
              </Button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Match() {
  const { playMatch, loading, lastMatch, error, activeEvent, resolveEvent, challengeNote } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title="Match Center"
        subtitle="Simulation du prochain match"
        actions={
          <Button disabled={loading} onClick={() => playMatch()}>
            {loading ? 'Simulation…' : 'Simuler le match'}
          </Button>
        }
      />
      {error && <p className="text-sm text-signal-bad">{error}</p>}
      {challengeNote && (
        <Panel className="border-brass-500/30 p-4 text-sm text-mist-200">{challengeNote}</Panel>
      )}
      {lastMatch ? (
        <Panel className="p-8 text-center">
          <div className="label-caps">Résultat</div>
          <div className="mt-2 text-sm text-mist-400">vs {lastMatch.opponent}</div>
          <div className="mt-4 text-5xl font-semibold tracking-tight data-num text-mist-50">
            {lastMatch.homeScore}
            <span className="mx-3 text-mist-500">—</span>
            {lastMatch.awayScore}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Badge tone={lastMatch.result === 'W' ? 'good' : lastMatch.result === 'D' ? 'warn' : 'bad'}>
              {lastMatch.result === 'W' ? 'Victoire' : lastMatch.result === 'D' ? 'Nul' : 'Défaite'}
            </Badge>
            <Badge tone="brass">{money(lastMatch.prize)}</Badge>
          </div>
        </Panel>
      ) : (
        <EmptyState title="Aucun match joué" body="Lancez une simulation pour obtenir un résultat et faire avancer la carrière." />
      )}

      <Modal open={!!activeEvent} title={activeEvent?.title ?? 'Événement'} onClose={() => {}}>
        {activeEvent && (
          <div className="space-y-4">
            <p className="text-sm text-mist-300">{activeEvent.body}</p>
            <div className="label-caps">{activeEvent.category}</div>
            <div className="flex flex-col gap-2">
              {activeEvent.choices.map((c) => (
                <Button key={c.id} variant="secondary" disabled={loading} onClick={() => resolveEvent(c)}>
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Squad() {
  const { players, sellPlayer, loading, selectedPlayerId, setSelectedPlayerId } = useGame();
  const [filter, setFilter] = useState('ALL');
  const filtered = useMemo(
    () => players.filter((p) => (filter === 'ALL' ? true : p.position === filter)),
    [players, filter]
  );
  const selected = players.find((p) => p.id === selectedPlayerId) ?? null;

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Effectif" subtitle={`${players.length} joueurs`} />
      <div className="flex flex-wrap gap-2">
        {['ALL', 'GK', 'DF', 'MF', 'FW'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'Tous' : f}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-mist-400">
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium">Joueur</th>
                  <th className="px-4 py-3 font-medium">Nat</th>
                  <th className="px-4 py-3 font-medium">Salaire</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`table-row cursor-pointer ${selectedPlayerId === p.id ? 'bg-ink-800' : ''}`}
                    onClick={() => setSelectedPlayerId(p.id)}
                  >
                    <td className="px-4 py-2.5">
                      <PosBadge pos={p.position} />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-mist-100">
                      {p.name}
                      {p.isYouth && <span className="ml-2 text-[10px] text-brass-300">JEUNE</span>}
                      {p.onLoan && <span className="ml-2 text-[10px] text-mist-400">PRÊT</span>}
                    </td>
                    <td className="px-4 py-2.5 text-mist-400">{p.nation ?? '—'}</td>
                    <td className="px-4 py-2.5 data-num text-mist-300">{money(p.salary)}</td>
                    <td className="px-4 py-2.5">
                      <Rating value={p.rating ?? 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <PosBadge pos={selected.position} />
                  <h2 className="text-lg font-semibold text-mist-50">{selected.name}</h2>
                </div>
                <p className="mt-1 text-sm text-mist-400">{selected.nation ?? '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Note" value={selected.rating ?? '—'} />
                <StatCard label="Potentiel" value={selected.potential ?? '—'} tone="brass" />
              </div>
              <div>
                <div className="label-caps">Salaire</div>
                <div className="mt-1 data-num text-mist-100">{money(selected.salary)}</div>
              </div>
              {!selected.isYouth && (
                <Button variant="danger" disabled={loading} onClick={() => sellPlayer(selected.id)}>
                  Vendre
                </Button>
              )}
            </div>
          ) : (
            <EmptyState title="Sélectionnez un joueur" body="Cliquez une ligne pour afficher le détail." />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Tactics() {
  const { board, team, setVision, loading } = useGame();
  const visions = board?.visions ?? [];
  const current = team?.tacticalVision ?? board?.tacticalVision ?? 'standard';

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Tactique" subtitle="Vision de jeu du club" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="relative flex min-h-[280px] items-center justify-center overflow-hidden p-6">
          <div className="absolute inset-4 rounded-panel border border-ink-600 bg-gradient-to-b from-ink-800 to-ink-950" />
          <div className="absolute inset-x-10 top-1/2 h-px bg-ink-600" />
          <div className="absolute left-1/2 top-8 bottom-8 w-px bg-ink-600" />
          <div className="relative text-center">
            <div className="label-caps">Vision active</div>
            <div className="mt-2 text-2xl font-semibold capitalize text-mist-50">{current.replace('_', ' ')}</div>
          </div>
        </Panel>
        <div className="grid gap-2 sm:grid-cols-2">
          {visions.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={loading}
              onClick={() => setVision(v.id)}
              className={`rounded-panel border p-4 text-left transition ${
                current === v.id
                  ? 'border-brass-500/50 bg-brass-500/10'
                  : 'border-ink-600 bg-ink-900 hover:border-mist-400/30'
              }`}
            >
              <div className="text-sm font-semibold text-mist-50">{v.name}</div>
              <div className="mt-1 text-xs text-mist-400">{v.desc}</div>
            </button>
          ))}
          {visions.length === 0 && (
            <EmptyState title="Chargez le conseil" body="Ouvrez d’abord l’onglet Conseil ou rechargez." />
          )}
        </div>
      </div>
    </div>
  );
}

function Board() {
  const { board, team } = useGame();
  const sec = board?.jobSecurity ?? team?.jobSecurity ?? 0;
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Conseil d’administration" subtitle="Objectifs et sécurité d’emploi" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <div className="label-caps">Sécurité du poste</div>
          <div className="mt-2 text-4xl font-semibold data-num text-mist-50">{sec}%</div>
          <div className="mt-4">
            <ProgressBar value={sec} tone={sec < 35 ? 'bad' : 'good'} />
          </div>
        </Panel>
        <Panel className="p-5 lg:col-span-2">
          <div className="label-caps mb-3">Objectifs</div>
          <div className="space-y-3">
            {(board?.objectives ?? []).map((o) => (
              <div key={o.code}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-mist-200">{o.label}</span>
                  <span className="data-num text-mist-400">
                    {o.current}/{o.target}
                  </span>
                </div>
                <ProgressBar value={o.current} max={Math.max(o.target, 1)} />
              </div>
            ))}
            {!board?.objectives?.length && <p className="text-sm text-mist-400">Aucun objectif chargé.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Market() {
  const { listings, buyListing, loading, team, error } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Mercato" subtitle={`Budget disponible ${money(team?.budget ?? 0)}`} />
      {error && <p className="text-sm text-signal-bad">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((l, i) => (
          <Panel key={l.tempId ?? `${l.name}-${i}`} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <PosBadge pos={l.position} />
                  <span className="font-semibold text-mist-50">{l.name}</span>
                </div>
                <div className="mt-1 text-xs text-mist-400">{l.nation ?? '—'}</div>
              </div>
              <Rating value={l.rating} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="data-num text-brass-300">{money(l.price)}</span>
              <span className="text-xs text-mist-400">Pot. {l.potential}</span>
            </div>
            <Button className="mt-3 w-full" disabled={loading} onClick={() => buyListing(l)}>
              Recruter
            </Button>
          </Panel>
        ))}
      </div>
      {!listings.length && <EmptyState title="Aucun listing" body="Revenez plus tard ou rechargez l’onglet." />}
    </div>
  );
}

function Youth() {
  const { youth, scoutYouth, promote, loading, error } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title="Académie"
        subtitle="Détection et promotion de jeunes"
        actions={
          <Button disabled={loading} onClick={() => scoutYouth()}>
            Scout (£8k)
          </Button>
        }
      />
      {error && <p className="text-sm text-signal-bad">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {youth.map((p) => (
          <Panel key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <PosBadge pos={p.position} />
                <span className="font-medium text-mist-50">{p.name}</span>
              </div>
              <div className="mt-1 text-xs text-mist-400">
                Note {p.rating ?? '—'} · Pot. {p.potential ?? '—'}
              </div>
            </div>
            <Button variant="secondary" disabled={loading} onClick={() => promote(p.id)}>
              Promouvoir
            </Button>
          </Panel>
        ))}
      </div>
      {!youth.length && <EmptyState title="Aucun prospect" body="Lancez un scout pour détecter un jeune." />}
    </div>
  );
}

function Live() {
  const { challenges, startChallenge, abandonChallenge, loading } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Manager Live" subtitle="Défis à durée limitée" />
      {challenges?.active && (
        <Panel className="border-brass-500/30 p-5">
          <div className="label-caps">Défi actif</div>
          <div className="mt-1 text-lg font-semibold text-mist-50">{challenges.active.title}</div>
          <p className="mt-1 text-sm text-mist-400">{challenges.active.description}</p>
          <Button variant="danger" className="mt-4" disabled={loading} onClick={() => abandonChallenge()}>
            Abandonner
          </Button>
        </Panel>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {(challenges?.catalog ?? []).map((c) => (
          <Panel key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-mist-50">{c.title}</div>
              <Badge>{c.difficulty}</Badge>
            </div>
            <p className="mt-2 text-sm text-mist-400">{c.description}</p>
            <div className="mt-3 text-xs text-mist-400">
              Récompense · {c.rewardGold} Or · {money(c.rewardBudget)}
            </div>
            <Button className="mt-3" disabled={loading || !!challenges?.active} onClick={() => startChallenge(c.id)}>
              Lancer
            </Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Training() {
  const { training, setTraining, loanPlayer, recallLoan, loading } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Entraînement & prêts" subtitle="Plans individuels" />
      <div className="flex flex-wrap gap-2">
        {(training?.plans ?? []).map((p) => (
          <Badge key={p.id} tone="brass">
            {p.name}
          </Badge>
        ))}
      </div>
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-mist-400">
                <th className="px-4 py-3">Joueur</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(training?.players ?? []).map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-2.5">
                    <PosBadge pos={p.position} /> <span className="ml-2 text-mist-100">{p.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      className="field max-w-[160px] py-1.5"
                      value={p.trainingPlan}
                      disabled={loading || p.onLoan}
                      onChange={(e) => setTraining(p.id, e.target.value)}
                    >
                      {(training?.plans ?? []).map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.onLoan ? (
                      <Button variant="secondary" disabled={loading} onClick={() => recallLoan(p.id)}>
                        Rappeler
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled={loading || p.isYouth} onClick={() => loanPlayer(p.id)}>
                        Prêter
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Messages() {
  const { messages, markRead } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Courrier" subtitle="Messages du club et du marché" />
      <div className="space-y-2">
        {messages.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => !m.read && markRead(m.id)}
            className={`panel w-full p-4 text-left transition hover:border-mist-400/20 ${!m.read ? 'border-brass-500/30' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-mist-50">{m.title}</div>
              {!m.read && <Badge tone="brass">Nouveau</Badge>}
            </div>
            <div className="mt-1 text-xs text-mist-400">
              {m.sender} · {new Date(m.messageDate).toLocaleString('fr-FR')}
            </div>
            <p className="mt-2 text-sm text-mist-300">{m.content}</p>
          </button>
        ))}
        {!messages.length && <EmptyState title="Boîte vide" />}
      </div>
    </div>
  );
}

function Budget() {
  const { budgetInfo } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Finances" subtitle="Trésorerie et mouvements" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Solde" value={money(budgetInfo?.budget ?? 0)} tone="brass" />
        <StatCard label="Or" value={budgetInfo?.gold ?? 0} />
        <StatCard label="Salaires / sem." value={money(budgetInfo?.weeklySalaries ?? 0)} />
        <StatCard label="Dépenses listées" value={money(budgetInfo?.expenses ?? 0)} tone="bad" />
      </div>
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-mist-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {(budgetInfo?.transactions ?? []).map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="px-4 py-2.5 text-mist-400">{new Date(t.transactionDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2.5">{t.type}</td>
                  <td className="px-4 py-2.5 text-mist-300">{t.reason ?? '—'}</td>
                  <td className={`px-4 py-2.5 data-num ${t.amount >= 0 ? 'text-signal-good' : 'text-signal-bad'}`}>
                    {money(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Shop() {
  const { shopItems, buyShop, loading, team } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Boutique" subtitle={`Solde Or · ${team?.goldBalance ?? 0}`} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shopItems.map((item) => (
          <Panel key={item.id} className="p-4">
            <div className="font-semibold text-mist-50">{item.name}</div>
            <p className="mt-1 text-sm text-mist-400">{item.effect}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="data-num text-brass-300">{item.price} Or</span>
              <Button disabled={loading} onClick={() => buyShop(item.id)}>
                Acheter
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Legends() {
  const { legends, recruitLegend, loading } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Légendes" subtitle="ICONs & Heroes" />
      <div className="grid gap-3 md:grid-cols-3">
        {legends.map((l) => (
          <Panel key={l.code} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-mist-50">{l.name}</div>
              <PosBadge pos={l.position} />
            </div>
            <p className="mt-1 text-xs text-mist-400">{l.nation} · {l.unlock}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {l.owned && <Badge tone="good">Dans l’effectif</Badge>}
              {!l.unlocked && <Badge tone="warn">Verrouillé</Badge>}
              {l.unlocked && !l.owned && <Badge tone="brass">Disponible</Badge>}
            </div>
            {l.unlocked && !l.owned && (
              <Button className="mt-3 w-full" disabled={loading} onClick={() => recruitLegend(l.code)}>
                Recruter · {money(l.salary)}
              </Button>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

function MgrMarket() {
  const { mgrMarket } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Marché des coaches" subtitle="Mouvements IA entre clubs" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="p-4 xl:col-span-2">
          <div className="label-caps mb-3">Clubs</div>
          <div className="space-y-2">
            {(mgrMarket?.clubs ?? []).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-700 px-3 py-2">
                <div>
                  <div className="font-medium text-mist-50">{c.name}</div>
                  <div className="text-xs text-mist-400">
                    {c.manager ? `${c.manager.name} · ${c.manager.status}` : 'Poste vacant'} · {c.tacticalVision}
                  </div>
                </div>
                <div className="text-right">
                  <div className="data-num text-sm text-mist-200">{c.jobSecurity}%</div>
                  <div className="text-[10px] text-mist-500">{c.record}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="label-caps mb-2">Agents libres</div>
            <ul className="space-y-1 text-sm">
              {(mgrMarket?.freeAgents ?? []).map((m) => (
                <li key={m.id} className="text-mist-200">
                  {m.name} <span className="text-mist-500">· rep {m.reputation}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-4">
            <div className="label-caps mb-2">Fil d’actu</div>
            <ul className="space-y-2 text-xs text-mist-300">
              {(mgrMarket?.events ?? []).slice(0, 12).map((e) => (
                <li key={e.id}>
                  <span className="text-brass-300">{e.type}</span> · {e.clubName}
                  {e.managerName ? ` · ${e.managerName}` : ''}
                  {e.detail ? ` · ${e.detail}` : ''}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Achievements() {
  const { achievements } = useGame();
  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Succès" />
      <div className="grid gap-3 md:grid-cols-2">
        {achievements.map((a) => (
          <Panel key={a.code} className={`p-4 ${a.unlocked ? 'border-brass-500/30' : 'opacity-70'}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-mist-50">{a.name}</div>
              <Badge tone={a.unlocked ? 'brass' : 'neutral'}>{a.unlocked ? 'Débloqué' : 'Verrouillé'}</Badge>
            </div>
            <p className="mt-1 text-sm text-mist-400">{a.description}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

const VIEWS: Record<string, () => JSX.Element> = {
  home: Home,
  match: Match,
  squad: Squad,
  tactics: Tactics,
  board: Board,
  market: Market,
  youth: Youth,
  live: Live,
  training: Training,
  messages: Messages,
  budget: Budget,
  shop: Shop,
  legends: Legends,
  mgrmarket: MgrMarket,
  achievements: Achievements,
};

export function Dashboard() {
  const tab = useGame((s) => s.tab);
  const View = VIEWS[tab] ?? Home;
  return (
    <AppShell>
      <View />
    </AppShell>
  );
}
