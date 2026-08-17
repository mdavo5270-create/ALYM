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
  const { team, messages, lastMatch, switchTab, board, challenges, marketHeadlines } = useGame();
  const unread = messages.filter((m) => !m.read).slice(0, 4);
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
  const sec = team?.jobSecurity ?? board?.jobSecurity ?? 70;
  const tasks = [
    { id: 'match', label: 'Préparer le prochain match', done: false },
    { id: 'messages', label: unread.length ? `Lire ${unread.length} message(s)` : 'Courrier à jour', done: !unread.length },
    { id: 'board', label: sec < 50 ? 'Stabiliser la confiance du conseil' : 'Objectifs conseil en ligne', done: sec >= 50 },
    { id: 'live', label: challenges?.active ? `Défi actif : ${challenges.active.title}` : 'Choisir un défi Manager Live', done: !!challenges?.active },
  ];

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Central" subtitle="Hub quotidien · Objectifs · Prochain match" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-hero p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brass-500/10 blur-3xl" />
          <div className="relative">
            <div className="label-caps text-sky-300">Prochain match · Championnat</div>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-semibold text-white sm:text-2xl">{team?.name ?? 'Vous'}</div>
                <div className="text-xs text-slate-400">Domicile</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 data-num text-sm font-bold text-sky-300">
                VS
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-white sm:text-2xl">
                  {lastMatch?.opponent ?? 'Adversaire'}
                </div>
                <div className="text-xs text-slate-400">Extérieur</div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Enjeu carrière · Préparation requise</p>
              <Button onClick={() => switchTab('match')}>Entrer Match Center</Button>
            </div>
          </div>
          {lastMatch && (
            <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-white/[0.06] bg-black/30 px-3 py-3">
                <div className="label-caps">Score</div>
                <div className="data-num mt-1 text-xl font-semibold text-white">
                  {lastMatch.homeScore} — {lastMatch.awayScore}
                </div>
              </div>
              <div className="rounded-md border border-white/[0.06] bg-black/30 px-3 py-3">
                <div className="label-caps">Résultat</div>
                <div className="mt-1 text-sm font-medium text-slate-100">
                  {lastMatch.result === 'W' ? 'Victoire' : lastMatch.result === 'D' ? 'Nul' : 'Défaite'}
                </div>
              </div>
              <div className="rounded-md border border-white/[0.06] bg-black/30 px-3 py-3">
                <div className="label-caps">Prime</div>
                <div className="data-num mt-1 text-lg font-semibold text-amber-300">{money(lastMatch.prize)}</div>
              </div>
            </div>
          )}
        </div>

        <Panel className="p-5">
          <div className="label-caps">Confiance du conseil</div>
          <div className="mt-3 text-3xl font-semibold data-num text-white">{sec}%</div>
          <div className="mt-3">
            <ProgressBar value={sec} tone={sec < 35 ? 'bad' : sec < 55 ? 'brass' : 'good'} />
          </div>
          <Button variant="secondary" className="mt-4 w-full" onClick={() => switchTab('board')}>
            Conseil
          </Button>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Matchs" value={played} />
        <StatCard label="Victoires" value={team?.wins ?? 0} tone="good" />
        <StatCard label="Budget" value={money(team?.budget ?? 0)} tone="brass" />
        <StatCard label="Effectif" value={team?._count?.players ?? '—'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <div className="label-caps mb-3">Tâches manager</div>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => switchTab(t.id as any)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-sm hover:border-sky-400/30"
                >
                  <span className={t.done ? 'text-slate-400' : 'text-slate-100'}>{t.label}</span>
                  <Badge tone={t.done ? 'good' : 'brass'}>{t.done ? 'OK' : 'À faire'}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-caps">Courrier</div>
            <button type="button" className="text-xs text-amber-300" onClick={() => switchTab('messages')}>
              Ouvrir
            </button>
          </div>
          {unread.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun non lu.</p>
          ) : (
            <ul className="space-y-2">
              {unread.map((m) => (
                <li key={m.id} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                  <div className="text-sm font-medium text-slate-100">{m.title}</div>
                  <div className="text-xs text-slate-400">{m.sender}</div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="label-caps mb-3">Monde / Market</div>
          {(marketHeadlines ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">Jouez un match pour faire tourner le Manager Market.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-300">
              {marketHeadlines.slice(0, 4).map((h, i) => (
                <li key={i} className="border-l-2 border-brass-500/40 pl-2">
                  {h}
                </li>
              ))}
            </ul>
          )}
          <Button variant="secondary" className="mt-4 w-full" onClick={() => switchTab('mgrmarket')}>
            Manager Market
          </Button>
        </Panel>
      </div>
    </div>
  );
}



function Match() {
  const { playMatch, loading, lastMatch, error, activeEvent, resolveEvent, challengeNote, matchPreview, loadMatchPreview } =
    useGame();

  return (
    <div className="animate-enter space-y-6">
      <PageHeader
        title="Match Center"
        subtitle="Preview · Simulation · Analyse"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" disabled={loading} onClick={() => loadMatchPreview()}>
              Actualiser preview
            </Button>
            <Button disabled={loading} onClick={() => playMatch()}>
              {loading ? 'Simulation…' : 'Simuler'}
            </Button>
          </div>
        }
      />
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {challengeNote && <Panel className="border-sky-500/30 p-4 text-sm text-slate-200">{challengeNote}</Panel>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="label-caps">Avant-match</div>
          {matchPreview ? (
            <div className="mt-3 space-y-3">
              <div className="text-xl font-semibold text-white">
                {matchPreview.homeName} <span className="text-white0">vs</span> {matchPreview.opponent}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge>{matchPreview.competition}</Badge>
                <Badge tone="brass">{matchPreview.venue}</Badge>
                <Badge tone="neutral">{matchPreview.kickoffLabel}</Badge>
              </div>
              <p className="text-sm text-slate-400">
                Effectif dispo {matchPreview.availablePlayers} · Forme {matchPreview.formHint} · Vision{' '}
                {matchPreview.tacticalVision}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(['attack', 'midfield', 'defense', 'gk'] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-white/10 px-2 py-2 text-center">
                    <div className="label-caps">{k}</div>
                    <div className="data-num text-sm text-slate-100">{matchPreview.strength[k]}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Ouvrez cet onglet pour charger la preview.</p>
          )}
        </Panel>

        <Panel className="p-5">
          <div className="label-caps">Après-match</div>
          {lastMatch ? (
            <div className="mt-3 space-y-4">
              <div className="text-center">
                <div className="text-sm text-slate-400">vs {lastMatch.opponent}</div>
                <div className="mt-2 text-4xl font-semibold data-num text-white">
                  {lastMatch.homeScore}
                  <span className="mx-2 text-white0">—</span>
                  {lastMatch.awayScore}
                </div>
                <div className="mt-2 flex justify-center gap-2">
                  <Badge tone={lastMatch.result === 'W' ? 'good' : lastMatch.result === 'D' ? 'warn' : 'bad'}>
                    {lastMatch.result === 'W' ? 'Victoire' : lastMatch.result === 'D' ? 'Nul' : 'Défaite'}
                  </Badge>
                  <Badge tone="brass">{money(lastMatch.prize)}</Badge>
                </div>
              </div>
              {lastMatch.stats && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="label-caps">Possession</div>
                    <div className="data-num text-slate-100">
                      {lastMatch.stats.possessionHome}% — {lastMatch.stats.possessionAway}%
                    </div>
                  </div>
                  <div>
                    <div className="label-caps">Tirs</div>
                    <div className="data-num text-slate-100">
                      {lastMatch.stats.shotsHome} — {lastMatch.stats.shotsAway}
                    </div>
                  </div>
                  <div>
                    <div className="label-caps">Cadrés</div>
                    <div className="data-num text-slate-100">
                      {lastMatch.stats.shotsOnHome} — {lastMatch.stats.shotsOnAway}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="Aucun résultat" body="Simulez pour remplir l’analyse post-match." />
          )}
        </Panel>
      </div>

      {lastMatch?.timeline && lastMatch.timeline.length > 0 && (
        <Panel className="p-5">
          <div className="label-caps mb-3">Timeline</div>
          <ul className="space-y-2">
            {lastMatch.timeline.map((e, i) => (
              <li key={i} className="flex items-center gap-3 border-b border-white/10/60 py-1.5 text-sm last:border-0">
                <span className="data-num w-10 text-slate-400">{e.minute}&apos;</span>
                <Badge tone={e.type === 'goal' ? 'good' : e.type === 'yellow' ? 'warn' : 'neutral'}>{e.type}</Badge>
                <span className="text-slate-200">{e.label}</span>
                <span className="ml-auto text-xs text-white0">{e.side}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal open={!!activeEvent} title={activeEvent?.title ?? 'Événement'}>
        {activeEvent && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">{activeEvent.body}</p>
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

  const attrs = selected
    ? [
        ['Vitesse', selected.speed],
        ['Dribble', selected.dribble],
        ['Tir', selected.shot],
        ['Passe', selected.pass],
        ['Défense', selected.defense],
        ['Physique', selected.physique],
      ]
    : [];

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Effectif" subtitle={`${players.length} joueurs — sélectionnez pour le profil`} />
      <div className="flex flex-wrap gap-2">
        {['ALL', 'GK', 'DF', 'MF', 'FW'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'Tous' : f}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <Panel className="overflow-hidden xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium">Joueur</th>
                  <th className="px-4 py-3 font-medium">OVR</th>
                  <th className="px-4 py-3 font-medium">Pot</th>
                  <th className="px-4 py-3 font-medium">Salaire</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`table-row cursor-pointer ${selectedPlayerId === p.id ? 'table-row-active' : ''}`}
                    onClick={() => setSelectedPlayerId(p.id)}
                  >
                    <td className="px-4 py-2.5">
                      <PosBadge pos={p.position} />
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-100">
                      {p.name}
                      {p.isYouth && <span className="ml-2 text-[10px] text-sky-300">JEUNE</span>}
                      {p.isLegend && <span className="ml-2 text-[10px] text-amber-300">LÉGENDE</span>}
                      {p.onLoan && <span className="ml-2 text-[10px] text-slate-400">PRÊT</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={(p.rating ?? 0) >= 80 ? 'ovr-elite' : (p.rating ?? 0) >= 72 ? 'ovr-high' : (p.rating ?? 0) >= 64 ? 'ovr-mid' : 'ovr-low'}>
                        {p.rating ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 data-num text-slate-300">{p.potential ?? '—'}</td>
                    <td className="px-4 py-2.5 data-num text-slate-300">{money(p.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5 xl:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <PosBadge pos={selected.position} />
                  <h2 className="text-xl font-semibold text-white">{selected.name}</h2>
                </div>
                <p className="mt-1 text-sm text-slate-400">{selected.nation ?? '—'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="OVR" value={selected.rating ?? '—'} />
                <StatCard label="Potentiel" value={selected.potential ?? '—'} tone="brass" />
                <StatCard label="Salaire" value={money(selected.salary)} />
              </div>
              <div>
                <div className="label-caps mb-2">Attributs</div>
                <div className="space-y-2">
                  {attrs.map(([label, val]) => (
                    <div key={String(label)}>
                      <div className="mb-0.5 flex justify-between text-xs text-slate-400">
                        <span>{label}</span>
                        <span className="data-num text-slate-200">{val ?? '—'}</span>
                      </div>
                      <ProgressBar value={Number(val ?? 0)} max={99} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Contrat :{' '}
                {selected.contractUntil
                  ? new Date(selected.contractUntil).toLocaleDateString('fr-FR')
                  : 'Non renseigné'}
              </div>
              {!selected.isYouth && (
                <Button variant="danger" disabled={loading} onClick={() => sellPlayer(selected.id)}>
                  Vendre
                </Button>
              )}
            </div>
          ) : (
            <EmptyState title="Profil joueur" body="Sélectionnez une ligne pour ouvrir le profil détaillé." />
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
          <div className="absolute inset-4 rounded-panel border border-white/10 bg-gradient-to-b from-ink-800 to-ink-950" />
          <div className="absolute inset-x-10 top-1/2 h-px bg-ink-600" />
          <div className="absolute left-1/2 top-8 bottom-8 w-px bg-ink-600" />
          <div className="relative text-center">
            <div className="label-caps">Vision active</div>
            <div className="mt-2 text-2xl font-semibold capitalize text-white">{current.replace('_', ' ')}</div>
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
                  : 'border-white/10 bg-[#0d1420] hover:border-sky-400/30'
              }`}
            >
              <div className="text-sm font-semibold text-white">{v.name}</div>
              <div className="mt-1 text-xs text-slate-400">{v.desc}</div>
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
          <div className="mt-2 text-4xl font-semibold data-num text-white">{sec}%</div>
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
                  <span className="text-slate-200">{o.label}</span>
                  <span className="data-num text-slate-400">
                    {o.current}/{o.target}
                  </span>
                </div>
                <ProgressBar value={o.current} max={Math.max(o.target, 1)} />
              </div>
            ))}
            {!board?.objectives?.length && <p className="text-sm text-slate-400">Aucun objectif chargé.</p>}
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
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((l, i) => (
          <Panel key={l.tempId ?? `${l.name}-${i}`} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <PosBadge pos={l.position} />
                  <span className="font-semibold text-white">{l.name}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{l.nation ?? '—'}</div>
              </div>
              <Rating value={l.rating} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="data-num text-amber-300">{money(l.price)}</span>
              <span className="text-xs text-slate-400">Pot. {l.potential}</span>
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
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {youth.map((p) => (
          <Panel key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <PosBadge pos={p.position} />
                <span className="font-medium text-white">{p.name}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
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
  const [tab, setTab] = useState<'active' | 'catalog' | 'done'>('catalog');
  const active = challenges?.active;

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Manager Live Hub" subtitle="Défis saisonniers · Objectifs · Récompenses" />

      <div className="subtabs">
        {(
          [
            ['active', 'Actif'],
            ['catalog', 'Pour vous'],
            ['done', 'Terminés'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`subtab ${tab === id ? 'subtab-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div>
          {active ? (
            <Panel className="border-sky-500/30 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="label-caps">Défi en cours</div>
                  <div className="mt-1 text-xl font-semibold text-white">{active.title}</div>
                  <p className="mt-1 text-sm text-slate-400">{active.description}</p>
                </div>
                <Badge tone="brass">{active.difficulty}</Badge>
              </div>
              {active.progress && (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <StatCard label="Victoires" value={active.progress.wins} />
                  <StatCard label="Matchs" value={`${active.progress.matches}/${active.matchesLimit}`} />
                  <StatCard label="Série" value={active.progress.streak} />
                  <StatCard label="Jeunes" value={active.progress.youth} />
                </div>
              )}
              {active.parameters && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {Object.entries(active.parameters).map(([k, v]) =>
                    v ? (
                      <Badge key={k} tone="neutral">
                        {k}: {v}
                      </Badge>
                    ) : null
                  )}
                </div>
              )}
              <Button variant="danger" className="mt-4" disabled={loading} onClick={() => abandonChallenge()}>
                Abandonner
              </Button>
            </Panel>
          ) : (
            <EmptyState title="Aucun défi actif" body="Choisissez un scénario dans le catalogue." />
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <div>
          <div className="label-caps mb-3 text-sky-300">Catalogue de défis</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(challenges?.catalog ?? []).map((c) => (
              <div key={c.id} className="hub-tile w-[220px] p-4">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500/80 to-indigo-500/40" />
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold leading-snug text-white">{c.title}</div>
                  <span className="chip-sky">{c.difficulty}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs text-slate-400">{c.description}</p>
                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  <div>Objectif {c.goalTarget} · {c.matchesLimit} matchs</div>
                  <div className="text-amber-300">{c.rewardGold} Or · {money(c.rewardBudget)}</div>
                </div>
                {c.parameters && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(c.parameters).map(([k, v]) =>
                      v ? (
                        <span key={k} className="chip-muted">{String(v)}</span>
                      ) : null
                    )}
                  </div>
                )}
                <Button className="mt-3 w-full" disabled={loading || !!active} onClick={() => startChallenge(c.id)}>
                  Start Job
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'done' && (
        <EmptyState
          title="Historique local"
          body="Les défis réussis apparaissent aussi dans le courrier MANAGER LIVE et les succès."
        />
      )}
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
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Joueur</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(training?.players ?? []).map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-2.5">
                    <PosBadge pos={p.position} /> <span className="ml-2 text-slate-100">{p.name}</span>
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
            className={`panel w-full p-4 text-left transition hover:border-mist-400/20 ${!m.read ? 'border-sky-500/30' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-white">{m.title}</div>
              {!m.read && <Badge tone="brass">Nouveau</Badge>}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {m.sender} · {new Date(m.messageDate).toLocaleString('fr-FR')}
            </div>
            <p className="mt-2 text-sm text-slate-300">{m.content}</p>
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
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {(budgetInfo?.transactions ?? []).map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="px-4 py-2.5 text-slate-400">{new Date(t.transactionDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2.5">{t.type}</td>
                  <td className="px-4 py-2.5 text-slate-300">{t.reason ?? '—'}</td>
                  <td className={`px-4 py-2.5 data-num ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
            <div className="font-semibold text-white">{item.name}</div>
            <p className="mt-1 text-sm text-slate-400">{item.effect}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="data-num text-amber-300">{item.price} Or</span>
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
              <div className="font-semibold text-white">{l.name}</div>
              <PosBadge pos={l.position} />
            </div>
            <p className="mt-1 text-xs text-slate-400">{l.nation} · {l.unlock}</p>
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
  const { mgrMarket, managerJobs, applyJob, loading, challengeNote } = useGame();
  const [sub, setSub] = useState<'clubs' | 'jobs' | 'feed'>('jobs');

  return (
    <div className="animate-enter space-y-6">
      <PageHeader title="Manager Market" subtitle="Mouvements IA · postes · candidatures" />
      {challengeNote && <Panel className="border-sky-500/30 p-3 text-sm text-slate-200">{challengeNote}</Panel>}

      <div className="subtabs">
        {(
          [
            ['jobs', 'Postes'],
            ['clubs', 'Clubs'],
            ['feed', 'Fil d’actu'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`subtab ${sub === id ? 'subtab-active' : ''}`}
            onClick={() => setSub(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === 'jobs' && (
        <div className="grid gap-3 md:grid-cols-2">
          {(managerJobs ?? []).map((j) => (
            <Panel key={j.clubId} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{j.clubName}</div>
                  <div className="text-xs text-slate-400">
                    {j.nation ?? '—'} · Vision {j.tacticalVision} · Rep {j.reputation}
                  </div>
                </div>
                <Badge tone={j.status === 'vacant' ? 'good' : 'warn'}>
                  {j.status === 'vacant' ? 'Vacant' : 'Sous pression'}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="data-num text-amber-300">{j.compatibility}% compat.</span>
                <Badge tone="brass">Chance {j.likelihood}</Badge>
                {j.managerName && <span className="text-xs text-white0">Coach : {j.managerName}</span>}
              </div>
              <Button className="mt-3" disabled={loading} onClick={() => applyJob(j.clubId)}>
                Candidater
              </Button>
            </Panel>
          ))}
          {!(managerJobs ?? []).length && (
            <EmptyState title="Aucun poste ouvert" body="Jouez des matchs pour faire bouger le marché." />
          )}
        </div>
      )}

      {sub === 'clubs' && (
        <Panel className="p-4">
          <div className="space-y-2">
            {(mgrMarket?.clubs ?? []).map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
              >
                <div>
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">
                    {c.manager ? `${c.manager.name} · ${c.manager.status}` : 'Poste vacant'} · {c.tacticalVision}
                  </div>
                </div>
                <div className="text-right">
                  <div className="data-num text-sm text-slate-200">{c.jobSecurity}%</div>
                  <div className="text-[10px] text-white0">{c.record}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {sub === 'feed' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-4">
            <div className="label-caps mb-2">Agents libres</div>
            <ul className="space-y-1 text-sm">
              {(mgrMarket?.freeAgents ?? []).map((m) => (
                <li key={m.id} className="text-slate-200">
                  {m.name} <span className="text-white0">· rep {m.reputation}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-4">
            <div className="label-caps mb-2">Événements</div>
            <ul className="space-y-2 text-xs text-slate-300">
              {(mgrMarket?.events ?? []).slice(0, 15).map((e) => (
                <li key={e.id}>
                  <span className="text-amber-300">{e.type}</span> · {e.clubName}
                  {e.managerName ? ` · ${e.managerName}` : ''}
                  {e.detail ? ` · ${e.detail}` : ''}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
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
          <Panel key={a.code} className={`p-4 ${a.unlocked ? 'border-sky-500/30' : 'opacity-70'}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{a.name}</div>
              <Badge tone={a.unlocked ? 'brass' : 'neutral'}>{a.unlocked ? 'Débloqué' : 'Verrouillé'}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">{a.description}</p>
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
