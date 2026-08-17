import { useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PlayerCard, OvrBadge, PosChip } from '../components/PlayerCard';
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  ProgressBar,
  money,
} from '../components/ui';
import { useGame } from '../store/gameStore';
import {
  SQUAD_SUBS,
  MARKET_SUBS,
  MATCH_SUBS,
  LIVE_SUBS,
  type ManagerTask,
} from '../store/nav';
import type { Player } from '../lib/api';

/* ─── Shared chrome ─── */

function SubNav({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-white/8 pb-px">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
            active === it.id
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-[var(--muted)] hover:text-white'
          }`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[32px]">{title}</h1>
      {sub && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-[var(--surface)] ${className}`}>{children}</div>
  );
}

/* ─── Player drawer (shared object) ─── */

function PlayerDrawer() {
  const {
    drawer,
    setDrawer,
    selectedPlayerId,
    players,
    sellPlayer,
    setTraining,
    loanPlayer,
    recallLoan,
    loading,
  } = useGame();
  const p = players.find((x) => x.id === selectedPlayerId);
  if (drawer !== 'player' || !p) return null;

  const attrs: [string, number | undefined][] = [
    ['Vitesse', p.speed],
    ['Dribble', p.dribble],
    ['Tir', p.shot],
    ['Passe', p.pass],
    ['Défense', p.defense],
    ['Physique', p.physique],
  ];

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(null)}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[var(--elevated)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/8 p-4">
          <OvrBadge rating={p.rating ?? 65} />
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-bold text-white">{p.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
              <PosChip pos={p.position} />
              <span>{p.nation ?? '—'}</span>
              <span>Pot. {p.potential ?? '—'}</span>
            </div>
          </div>
          <button type="button" className="text-sky-400" onClick={() => setDrawer(null)}>
            Fermer
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="p-3">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Contrat</div>
            <div className="mt-1 flex justify-between text-[14px]">
              <span>{money(p.salary)}/sem</span>
              <span className="text-[var(--muted)]">{p.contractUntil ? p.contractUntil.slice(0, 10) : '—'}</span>
            </div>
          </Card>
          <div>
            <div className="mb-2 text-[13px] font-semibold text-white">Attributs</div>
            <div className="space-y-2">
              {attrs.map(([label, v]) => (
                <div key={label}>
                  <div className="mb-0.5 flex justify-between text-[12px]">
                    <span className="text-[var(--muted)]">{label}</span>
                    <span className="data-num text-white">{v ?? '—'}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-sky-500/80" style={{ width: `${v ?? 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={loading} onClick={() => setTraining(p.id, 'balanced')}>
              Entraîner
            </Button>
            {p.onLoan ? (
              <Button disabled={loading} onClick={() => recallLoan(p.id)}>
                Rappeler
              </Button>
            ) : (
              <Button disabled={loading} onClick={() => loanPlayer(p.id)}>
                Prêter
              </Button>
            )}
            <Button className="col-span-2" disabled={loading || !!p.isLegend} onClick={() => sellPlayer(p.id)}>
              Vendre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CENTRAL ─── */

function CentralHub() {
  const {
    team,
    messages,
    lastMatch,
    board,
    challenges,
    marketHeadlines,
    matchPreview,
    goSpace,
    goMore,
    markRead,
    spaceSub,
    setSpaceSub,
  } = useGame();
  const unread = messages.filter((m) => !m.read);
  const sec = team?.jobSecurity ?? board?.jobSecurity ?? 70;
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);

  const tasks: ManagerTask[] = useMemo(
    () => [
      {
        id: 'match',
        label: 'Préparer le prochain match',
        priority: 'urgent',
        done: false,
        space: 'match',
        sub: 'preview',
      },
      {
        id: 'mail',
        label: unread.length ? `Traiter ${unread.length} message(s)` : 'Courrier à jour',
        priority: unread.length ? 'action' : 'fyi',
        done: !unread.length,
        space: 'more',
        more: 'news',
      },
      {
        id: 'board',
        label: sec < 50 ? 'Stabiliser la confiance du conseil' : 'Objectifs conseil',
        priority: sec < 50 ? 'urgent' : 'important',
        done: sec >= 55,
        space: 'more',
        more: 'board',
      },
      {
        id: 'live',
        label: challenges?.active ? `Défi : ${challenges.active.title}` : 'Choisir un défi Manager Live',
        priority: 'important',
        done: !!challenges?.active,
        space: 'live',
      },
      {
        id: 'squad',
        label: 'Revue d’effectif',
        priority: 'fyi',
        done: false,
        space: 'squad',
        sub: 'overview',
      },
    ],
    [unread.length, sec, challenges]
  );

  const runTask = (t: ManagerTask) => {
    if (t.space === 'more' && t.more) goMore(t.more);
    else goSpace(t.space, t.sub);
  };

  const priorityColor: Record<string, string> = {
    urgent: 'text-red-400',
    action: 'text-amber-300',
    important: 'text-sky-300',
    fyi: 'text-[var(--muted)]',
  };

  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Central" sub="Cockpit manager · même club · même saison" />

      {/* Hero next match */}
      <Card className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90">
          {matchPreview?.competition ?? 'Championnat'} · {matchPreview?.kickoffLabel ?? 'Prochain match'}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-white sm:text-xl">{team?.name ?? 'Vous'}</div>
            <div className="text-[11px] text-[var(--muted)]">Domicile</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xs font-bold text-sky-300">
            VS
          </div>
          <div>
            <div className="text-lg font-bold text-white sm:text-xl">{matchPreview?.opponent ?? 'Adversaire'}</div>
            <div className="text-[11px] text-[var(--muted)]">{matchPreview?.venue ?? 'Extérieur'}</div>
          </div>
        </div>
        {lastMatch && (
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[13px]">
            <span className="text-[var(--muted)]">Dernier résultat</span>
            <span className="data-num font-semibold text-white">
              {lastMatch.homeScore}–{lastMatch.awayScore}{' '}
              <Badge tone={lastMatch.result === 'W' ? 'good' : lastMatch.result === 'D' ? 'warn' : 'bad'}>
                {lastMatch.result}
              </Badge>
            </span>
          </div>
        )}
        <Button className="mt-4 w-full sm:w-auto" onClick={() => goSpace('match', 'preview')}>
          Préparer le match
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tasks */}
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[15px] font-semibold text-white">Tâches manager</div>
            <button type="button" className="text-[12px] text-sky-400" onClick={() => setSpaceSub(spaceSub === 'tasks' ? 'home' : 'tasks')}>
              Voir tout
            </button>
          </div>
          <ul className="divide-y divide-white/6">
            {tasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => runTask(t)}
                  className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.03]"
                >
                  <span className={`text-[10px] font-bold uppercase ${priorityColor[t.priority]}`}>
                    {t.priority === 'urgent' ? 'URG' : t.priority === 'action' ? 'ACT' : t.priority === 'important' ? 'IMP' : 'FYI'}
                  </span>
                  <span className={`flex-1 text-[14px] ${t.done ? 'text-[var(--muted)] line-through' : 'text-white'}`}>
                    {t.label}
                  </span>
                  <span className="text-[var(--muted)]">›</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Board + form */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Confiance conseil</div>
            <div className="mt-1 data-num text-2xl font-bold text-white">{sec}%</div>
            <ProgressBar value={sec} className="mt-2" />
            <button type="button" className="mt-3 text-[12px] text-sky-400" onClick={() => goMore('board')}>
              Objectifs ›
            </button>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Bilan</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="data-num text-lg font-bold text-emerald-400">{team?.wins ?? 0}</div>
                <div className="text-[10px] text-[var(--muted)]">V</div>
              </div>
              <div>
                <div className="data-num text-lg font-bold text-amber-300">{team?.draws ?? 0}</div>
                <div className="text-[10px] text-[var(--muted)]">N</div>
              </div>
              <div>
                <div className="data-num text-lg font-bold text-red-400">{team?.losses ?? 0}</div>
                <div className="text-[10px] text-[var(--muted)]">D</div>
              </div>
            </div>
            <div className="mt-2 text-center text-[12px] text-[var(--muted)]">{played} matchs joués</div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 flex justify-between">
            <span className="text-[15px] font-semibold text-white">Courrier</span>
            <button type="button" className="text-[12px] text-sky-400" onClick={() => goMore('news')}>
              Inbox ›
            </button>
          </div>
          {unread.slice(0, 3).map((m) => (
            <button
              key={m.id}
              type="button"
              className="mb-2 block w-full rounded-xl bg-white/5 px-3 py-2 text-left hover:bg-white/8"
              onClick={() => {
                markRead(m.id);
                goMore('news');
              }}
            >
              <div className="text-[13px] font-medium text-white">{m.title}</div>
              <div className="truncate text-[11px] text-[var(--muted)]">{m.sender}</div>
            </button>
          ))}
          {!unread.length && <p className="text-[13px] text-[var(--muted)]">Aucun message non lu</p>}
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex justify-between">
            <span className="text-[15px] font-semibold text-white">Monde</span>
            <button type="button" className="text-[12px] text-sky-400" onClick={() => goMore('manager')}>
              Market ›
            </button>
          </div>
          {(marketHeadlines ?? []).slice(0, 4).map((h, i) => (
            <div key={i} className="border-b border-white/5 py-2 text-[13px] text-[var(--muted)] last:border-0">
              {h}
            </div>
          ))}
          {!(marketHeadlines ?? []).length && (
            <p className="text-[13px] text-[var(--muted)]">Jouez un match pour faire bouger le Manager Market</p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ─── SQUAD ─── */

function SquadHub() {
  const {
    players,
    spaceSub,
    setSpaceSub,
    setSelectedPlayerId,
    setDrawer,
    team,
  } = useGame();
  const sub = (SQUAD_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'players') as string;

  const byPos = useMemo(() => {
    const order = ['GK', 'DF', 'MF', 'FW'];
    const g: Record<string, Player[]> = { GK: [], DF: [], MF: [], FW: [] };
    for (const p of players) {
      (g[p.position] ?? (g[p.position] = [])).push(p);
    }
    return order.map((pos) => ({ pos, list: g[pos] ?? [] }));
  }, [players]);

  const openPlayer = (id: number) => {
    setSelectedPlayerId(id);
    setDrawer('player');
  };

  return (
    <div className="animate-enter">
      <SectionTitle title="Effectif" sub={`${players.length} joueurs · ${team?.name ?? ''}`} />
      <SubNav items={SQUAD_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'overview' || sub === 'depth') && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {byPos.map(({ pos, list }) => (
            <Card key={pos} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <PosChip pos={pos} />
                <span className="text-[12px] text-[var(--muted)]">{list.length}</span>
              </div>
              <div className="space-y-1">
                {list.slice(0, 5).map((p) => (
                  <PlayerCard key={p.id} player={p} variant="compact" onClick={() => openPlayer(p.id)} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {(sub === 'players' || sub === 'development' || sub === 'contracts') && (
        <div className="grid gap-2 sm:grid-cols-2">
          {players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              variant={sub === 'development' ? 'detailed' : 'standard'}
              onClick={() => openPlayer(p.id)}
            />
          ))}
          {!players.length && <EmptyState title="Aucun joueur" body="Créez une équipe pour commencer." />}
        </div>
      )}
    </div>
  );
}

/* ─── MATCH ─── */

function MatchHub() {
  const {
    spaceSub,
    setSpaceSub,
    matchPreview,
    lastMatch,
    playMatch,
    loading,
    activeEvent,
    resolveEvent,
    team,
    challengeNote,
  } = useGame();
  const sub = (MATCH_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'preview') as string;

  return (
    <div className="animate-enter">
      <SectionTitle title="Match Center" sub="Événement · pas un simple dashboard" />
      <SubNav items={MATCH_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'preview' || sub === 'live') && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-b from-sky-950/40 to-transparent p-6">
              <div className="text-center text-[11px] uppercase tracking-wider text-sky-300/80">
                {matchPreview?.competition ?? 'Championnat'} · {matchPreview?.venue ?? 'Domicile'}
              </div>
              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{team?.name ?? 'Vous'}</div>
                </div>
                <div className="text-center">
                  {lastMatch && sub === 'live' ? (
                    <div className="data-num text-3xl font-bold text-white">
                      {lastMatch.homeScore}–{lastMatch.awayScore}
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-sky-300">VS</div>
                  )}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{matchPreview?.opponent ?? lastMatch?.opponent ?? 'Adversaire'}</div>
                </div>
              </div>
              {matchPreview && (
                <div className="mt-6 grid grid-cols-4 gap-2 text-center text-[12px]">
                  {(['attack', 'midfield', 'defense', 'gk'] as const).map((k) => (
                    <div key={k} className="rounded-lg bg-black/30 py-2">
                      <div className="text-[10px] uppercase text-[var(--muted)]">{k}</div>
                      <div className="data-num font-semibold text-white">{matchPreview.strength[k]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-white/8 p-4">
              <Button className="w-full" disabled={loading} onClick={() => playMatch()}>
                {loading ? 'Simulation…' : 'Simuler le match'}
              </Button>
              {challengeNote && <p className="mt-2 text-center text-[12px] text-amber-200">{challengeNote}</p>}
            </div>
          </Card>

          {lastMatch?.stats && (
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-white">Statistiques</div>
              <div className="mt-3 space-y-2 text-[13px]">
                {[
                  ['Possession', `${lastMatch.stats.possessionHome}%`, `${lastMatch.stats.possessionAway}%`],
                  ['Tirs', String(lastMatch.stats.shotsHome), String(lastMatch.stats.shotsAway)],
                  ['Cadrés', String(lastMatch.stats.shotsOnHome), String(lastMatch.stats.shotsOnAway)],
                ].map(([label, a, b]) => (
                  <div key={String(label)} className="grid grid-cols-3 gap-2">
                    <span className="data-num text-right text-white">{a}</span>
                    <span className="text-center text-[var(--muted)]">{label}</span>
                    <span className="data-num text-white">{b}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lastMatch?.timeline && lastMatch.timeline.length > 0 && (
            <Card className="p-4">
              <div className="text-[14px] font-semibold text-white">Timeline</div>
              <ul className="mt-2 space-y-2">
                {lastMatch.timeline.map((e, i) => (
                  <li key={i} className="flex gap-3 text-[13px]">
                    <span className="data-num w-8 text-[var(--muted)]">{e.minute}'</span>
                    <span className="text-white">{e.label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {sub === 'post' && (
        <Card className="p-6 text-center">
          {lastMatch ? (
            <>
              <div className="text-[11px] uppercase text-[var(--muted)]">Résultat final</div>
              <div className="mt-2 data-num text-4xl font-bold text-white">
                {lastMatch.homeScore}–{lastMatch.awayScore}
              </div>
              <div className="mt-2 text-[14px] text-[var(--muted)]">
                vs {lastMatch.opponent} · Prime {money(lastMatch.prize)}
              </div>
            </>
          ) : (
            <EmptyState title="Pas encore de match" body="Simulez depuis l’onglet Avant-match." />
          )}
        </Card>
      )}

      {sub === 'tactics' && <TacticsInline />}

      {activeEvent && (
        <Modal open onClose={() => {}}>
          <div className="text-[11px] uppercase text-amber-300">{activeEvent.category}</div>
          <div className="mt-1 text-lg font-bold text-white">{activeEvent.title}</div>
          <p className="mt-2 text-[14px] text-[var(--muted)]">{activeEvent.body}</p>
          <div className="mt-4 space-y-2">
            {activeEvent.choices.map((c) => (
              <Button key={c.id} className="w-full" onClick={() => resolveEvent(c)}>
                {c.label}
              </Button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function TacticsInline() {
  const { board, setVision, loading, team } = useGame();
  const visions = board?.visions ?? [
    { id: 'standard', name: 'Équilibré', desc: 'Approche polyvalente' },
    { id: 'possession', name: 'Possession', desc: 'Contrôle du ballon' },
    { id: 'high_press', name: 'Pressing', desc: 'Intensité haute' },
    { id: 'counter', name: 'Contre', desc: 'Transitions rapides' },
    { id: 'wing_play', name: 'Ailes', desc: 'Largeur offensive' },
    { id: 'park_bus', name: 'Bloc bas', desc: 'Solidité défensive' },
  ];
  const current = team?.tacticalVision ?? board?.tacticalVision ?? 'standard';

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {visions.map((v) => (
        <button
          key={v.id}
          type="button"
          disabled={loading}
          onClick={() => setVision(v.id)}
          className={`rounded-2xl border p-4 text-left transition ${
            current === v.id ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/8 bg-[var(--surface)] hover:border-white/15'
          }`}
        >
          <div className="font-semibold text-white">{v.name}</div>
          <div className="mt-1 text-[12px] text-[var(--muted)]">{v.desc}</div>
        </button>
      ))}
    </div>
  );
}

/* ─── MARKET ─── */

function MarketHub() {
  const {
    spaceSub,
    setSpaceSub,
    listings,
    buyListing,
    loading,
    players,
    sellPlayer,
    managerJobs,
    applyJob,
    mgrMarket,
    goMore,
  } = useGame();
  const sub = (MARKET_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'overview') as string;

  return (
    <div className="animate-enter">
      <SectionTitle title="Mercato" sub="Parcours continu · recherche → offre → confirmation" />
      <SubNav items={MARKET_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'overview' || sub === 'search' || sub === 'targets') && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {listings.map((l, idx) => (
              <Card key={l.tempId ?? `${l.name}-${idx}`} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-white">{l.name}</div>
                    <div className="mt-1 text-[12px] text-[var(--muted)]">
                      {l.position} · OVR {l.rating} · Pot. {l.potential}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="data-num text-amber-200">{money(l.price)}</div>
                    <Button className="mt-2" disabled={loading} onClick={() => buyListing(l)}>
                      Offre
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {!listings.length && <EmptyState title="Aucun listing" body="Revenez après un match ou un refresh marché." />}
        </div>
      )}

      {sub === 'loans' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {players
            .filter((p) => !p.isLegend)
            .map((p) => (
              <PlayerCard key={p.id} player={p} variant="transfer" onClick={() => (p.onLoan ? null : sellPlayer(p.id))} />
            ))}
        </div>
      )}

      {sub === 'history' && (
        <EmptyState title="Historique mercato" body="Les transferts de la saison apparaîtront ici." />
      )}

      {sub === 'negotiations' && (
        <EmptyState title="Négociations" body="Lancez une offre depuis Recherche pour ouvrir une négo." />
      )}

      {sub === 'mgr' && (
        <div className="space-y-3">
          <button type="button" className="text-[13px] text-sky-400" onClick={() => goMore('manager')}>
            Ouvrir Manager Market complet ›
          </button>
          {(managerJobs ?? []).slice(0, 6).map((j) => (
            <Card key={j.clubId} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium text-white">{j.clubName}</div>
                <div className="text-[12px] text-[var(--muted)]">
                  {j.compatibility}% compat · {j.status}
                </div>
              </div>
              <Button disabled={loading} onClick={() => applyJob(j.clubId)}>
                Candidater
              </Button>
            </Card>
          ))}
          {mgrMarket && (
            <p className="text-[12px] text-[var(--muted)]">
              {mgrMarket.clubs?.length ?? 0} clubs IA · {mgrMarket.freeAgents?.length ?? 0} agents libres
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── LIVE ─── */

function LiveHub() {
  const { spaceSub, setSpaceSub, challenges, startChallenge, abandonChallenge, loading } = useGame();
  const sub = (LIVE_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'for_you') as string;
  const catalog = challenges?.catalog ?? [];
  const active = challenges?.active;

  return (
    <div className="animate-enter">
      <SectionTitle title="Manager Live" sub="Défis paramétrés · sessions courtes" />
      <SubNav items={LIVE_SUBS} active={sub} onChange={setSpaceSub} />

      {sub === 'active' && active && (
        <Card className="p-5">
          <Badge tone="brass">En cours</Badge>
          <div className="mt-2 text-xl font-bold text-white">{active.title}</div>
          <p className="mt-1 text-[13px] text-[var(--muted)]">{active.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-xl bg-black/30 p-3">
              <div className="text-[var(--muted)]">Objectif</div>
              <div className="data-num text-lg font-bold text-white">
                {active.progress?.wins ?? 0}/{active.goalTarget ?? '—'}
              </div>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <div className="text-[var(--muted)]">Matchs</div>
              <div className="data-num text-lg font-bold text-white">
                {active.progress?.matches ?? 0}/{active.matchesLimit ?? '—'}
              </div>
            </div>
          </div>
          <Button className="mt-4" disabled={loading} onClick={() => abandonChallenge()}>
            Abandonner
          </Button>
        </Card>
      )}
      {sub === 'active' && !active && <EmptyState title="Aucun défi actif" body="Choisissez-en un dans Catalogue." />}

      {(sub === 'for_you' || sub === 'catalog') && (
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog.map((c) => (
            <Card key={c.id} className="flex flex-col p-4">
              <div className="text-[15px] font-semibold text-white">{c.title}</div>
              <p className="mt-1 flex-1 text-[12px] text-[var(--muted)]">{c.description}</p>
              <Button className="mt-3" disabled={loading || !!active} onClick={() => startChallenge(c.id)}>
                Lancer
              </Button>
            </Card>
          ))}
        </div>
      )}

      {sub === 'completed' && <EmptyState title="Historique" body="Les défis terminés s’afficheront ici." />}
    </div>
  );
}

/* ─── MORE sections ─── */

function MoreBoard() {
  const { board, team } = useGame();
  const sec = team?.jobSecurity ?? board?.jobSecurity ?? 70;
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Conseil" sub="Objectifs · confiance · sécurité d’emploi" />
      <Card className="p-4">
        <div className="text-[11px] uppercase text-[var(--muted)]">Job security</div>
        <div className="data-num text-3xl font-bold text-white">{sec}%</div>
        <ProgressBar value={sec} className="mt-2" />
      </Card>
      <div className="space-y-2">
        {(board?.objectives ?? []).map((o) => (
          <Card key={o.code} className="p-3">
            <div className="flex justify-between text-[14px]">
              <span className="text-white">{o.label}</span>
              <span className="data-num text-[var(--muted)]">
                {o.current}/{o.target}
              </span>
            </div>
            <ProgressBar value={Math.min(100, (o.current / Math.max(1, o.target)) * 100)} className="mt-2" />
          </Card>
        ))}
      </div>
      <div className="pt-2">
        <div className="mb-2 text-[14px] font-semibold text-white">Vision tactique</div>
        <TacticsInline />
      </div>
    </div>
  );
}

function MoreFinance() {
  const { budgetInfo, team } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Finances" sub="Budget · salaires · flux" />
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-[var(--muted)]">Budget</div>
          <div className="data-num text-xl font-bold text-amber-200">{money(budgetInfo?.budget ?? team?.budget ?? 0)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-[var(--muted)]">Salaires / sem</div>
          <div className="data-num text-xl font-bold text-white">{money(budgetInfo?.weeklySalaries ?? 0)}</div>
        </Card>
      </div>
      <Card className="p-4">
        <div className="mb-2 text-[14px] font-semibold text-white">Transactions</div>
        <ul className="max-h-64 space-y-2 overflow-y-auto text-[13px]">
          {(budgetInfo?.transactions ?? []).slice(0, 20).map((t) => (
            <li key={t.id} className="flex justify-between border-b border-white/5 py-1">
              <span className="text-[var(--muted)]">{t.reason ?? t.type}</span>
              <span className={`data-num ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{money(t.amount)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function MoreNews() {
  const { messages, markRead } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Courrier" sub="Inbox · décisions · actus club" />
      <div className="space-y-2">
        {messages.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => markRead(m.id)}
            className={`w-full rounded-2xl border p-4 text-left ${
              m.read ? 'border-white/5 bg-white/[0.02]' : 'border-sky-500/20 bg-sky-500/5'
            }`}
          >
            <div className="flex justify-between gap-2">
              <span className="font-semibold text-white">{m.title}</span>
              {!m.read && <Badge tone="brass">Nouveau</Badge>}
            </div>
            <div className="mt-1 text-[12px] text-[var(--muted)]">{m.sender}</div>
            <p className="mt-2 text-[13px] text-[var(--muted)]">{m.content}</p>
          </button>
        ))}
        {!messages.length && <EmptyState title="Boîte vide" body="Les événements et le market alimentent l’inbox." />}
      </div>
    </div>
  );
}

function MoreAcademy() {
  const { youth, scoutYouth, promote, loading } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Académie" sub="Jeunes · scout · promotion" />
      <Button disabled={loading} onClick={() => scoutYouth()}>
        Scout (£8k)
      </Button>
      <div className="grid gap-2 sm:grid-cols-2">
        {youth.map((p) => (
          <Card key={p.id} className="p-3">
            <PlayerCard player={p} variant="standard" />
            <Button className="mt-2 w-full" disabled={loading} onClick={() => promote(p.id)}>
              Promouvoir
            </Button>
          </Card>
        ))}
      </div>
      {!youth.length && <EmptyState title="Aucun prospect" body="Lancez un scout pour détecter un jeune." />}
    </div>
  );
}

function MoreGeneric({ title, body }: { title: string; body: string }) {
  return (
    <div className="animate-enter">
      <SectionTitle title={title} />
      <Card className="p-6">
        <p className="text-[14px] text-[var(--muted)]">{body}</p>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Même shell · mêmes données carrière · module relié au registre 625 (sous-vues / drawers).
        </p>
      </Card>
    </div>
  );
}

function MoreRouter() {
  const more = useGame((s) => s.moreSection);
  switch (more) {
    case 'board':
    case 'club':
      return <MoreBoard />;
    case 'finance':
      return <MoreFinance />;
    case 'news':
      return <MoreNews />;
    case 'academy':
    case 'scouting':
      return <MoreAcademy />;
    case 'tactics':
      return (
        <div className="animate-enter">
          <SectionTitle title="Tactique" sub="Workspace · vision d’équipe" />
          <TacticsInline />
        </div>
      );
    case 'training':
      return <MoreGeneric title="Entraînement" body="Plans par joueur — ouvrez un joueur depuis l’Effectif." />;
    case 'manager':
    case 'world':
      return (
        <div className="animate-enter">
          <SectionTitle title="Manager Market" sub="Mouvements · postes · fil d’actu" />
          <MarketHub />
        </div>
      );
    case 'legends':
      return <MoreGeneric title="Légendes" body="ICONs & Heroes — déblocage par objectifs de carrière." />;
    case 'shop':
      return <MoreGeneric title="Boutique" body="Améliorations Or — branché API shop." />;
    case 'achievements':
      return <MoreGeneric title="Succès" body="Succès de carrière partagés sur le même compte." />;
    case 'calendar':
      return <MoreGeneric title="Calendrier" body="Journée · saison · fenêtres mercato (structure prête)." />;
    case 'competitions':
      return <MoreGeneric title="Compétitions" body="Classement · fixtures — données ligue à peupler." />;
    case 'analytics':
      return <MoreGeneric title="Analytics" body="Tendances équipe / joueurs — mêmes stats match." />;
    case 'staff':
      return <MoreGeneric title="Staff" body="Entraîneurs · scouts · médical (extension staff hub)." />;
    case 'settings':
      return <MoreGeneric title="Réglages" body="Compte · notifications · accessibilité." />;
    default:
      return <MoreGeneric title="Plus" body="Choisissez une section dans le menu Plus." />;
  }
}

/* ─── Root ─── */

export function Dashboard() {
  const space = useGame((s) => s.space);

  let body: React.ReactNode;
  if (space === 'central') body = <CentralHub />;
  else if (space === 'squad') body = <SquadHub />;
  else if (space === 'match') body = <MatchHub />;
  else if (space === 'market') body = <MarketHub />;
  else if (space === 'live') body = <LiveHub />;
  else body = <MoreRouter />;

  return (
    <AppShell>
      {body}
      <PlayerDrawer />
    </AppShell>
  );
}
