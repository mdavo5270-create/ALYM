import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PlayerCard, OvrBadge, PosChip, PlayerRow, PlayerListHeader } from '../components/PlayerCard';
import {
  ArenaPanel,
  AttrBar,
  BigStat,
  ClubCrest,
  ConditionRow,
  HonourGrid,
  LevelTile,
  MetricTile,
  StartCta,
  StatBlock,
  StripCard,
  TaskRow,
} from '../components/patterns';
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
              ? 'border-[var(--brass)] text-[var(--brass)]'
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

  const technical = [
    ['Dribble', p.dribble ?? 50],
    ['Tir', p.shot ?? 50],
    ['Passe', p.pass ?? 50],
  ] as const;
  const physical = [
    ['Vitesse', p.speed ?? 50],
    ['Physique', p.physique ?? 50],
    ['Défense', p.defense ?? 50],
  ] as const;
  const ovr = p.rating ?? 65;
  const pot = p.potential ?? ovr;

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(null)}>
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-[var(--rule)] bg-[var(--paper)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header profile — FC player card language */}
        <div className="border-b border-[var(--rule)] bg-[var(--panel)] p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="label-caps text-[var(--brass)]">Fiche joueur</div>
            <button type="button" className="text-[12px] text-[var(--ink-dim)] hover:text-[var(--ink)]" onClick={() => setDrawer(null)}>
              Fermer ✕
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 flex-col items-center justify-center border border-[var(--brass)]/50 bg-black/30">
              <div className="data-num text-3xl font-bold text-[var(--ink)]">{ovr}</div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--ink-faint)]">OVR</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="type-display text-2xl tracking-tight text-[var(--ink)]">{p.name}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <PosChip pos={p.position} />
                <span className="text-[12px] text-[var(--ink-dim)]">{p.nation ?? '—'}</span>
                {p.isYouth && <span className="rounded-sm bg-[var(--brass)]/15 px-1.5 py-0.5 text-[10px] text-[var(--brass)]">JEUNE</span>}
              </div>
              <div className="mt-2 flex gap-4 text-[12px]">
                <span className="text-[var(--ink-dim)]">POT <strong className="data-num text-[var(--ink)]">{pot}</strong></span>
                <span className="text-[var(--ink-dim)]">Âge <strong className="data-num text-[var(--ink)]">{(p as { age?: number }).age ?? '—'}</strong></span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="panel-soft px-2 py-2 text-center">
              <div className="data-num text-lg text-[var(--ink)]">{money((p.rating ?? 60) * 12000)}</div>
              <div className="label-caps">Valeur</div>
            </div>
            <div className="panel-soft px-2 py-2 text-center">
              <div className="data-num text-lg text-[var(--brass)]">{money(p.salary)}</div>
              <div className="label-caps">Salaire/sem</div>
            </div>
            <div className="panel-soft px-2 py-2 text-center">
              <div className="data-num text-lg text-[var(--ink)]">{p.contractUntil ? String(p.contractUntil).slice(0, 4) : '2028'}</div>
              <div className="label-caps">Contrat</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <div className="mb-3 label-caps text-[var(--brass)]">Technique</div>
            <div className="space-y-2.5">
              {technical.map(([l, v]) => (
                <AttrBar key={l} label={l} value={v} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 label-caps text-[var(--brass)]">Physique / Défense</div>
            <div className="space-y-2.5">
              {physical.map(([l, v]) => (
                <AttrBar key={l} label={l} value={v} />
              ))}
            </div>
          </div>
          <div className="panel p-3">
            <div className="label-caps text-[var(--ink-dim)]">Forme · Moral · Fitness</div>
            <div className="mt-2 flex gap-4">
              <div className="data-num text-xl text-[var(--ok)]">{p.physique ?? 80}%</div>
              <div className="text-[12px] text-[var(--ink-dim)] self-end">Condition physique estimée</div>
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
              Mettre sur le marché
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CENTRAL ─── */

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
    activeEvent,
    resolveEvent,
    loading,
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
        id: 'event',
        label: activeEvent ? `Décision : ${activeEvent.title}` : 'Aucun événement urgent',
        priority: activeEvent ? 'urgent' : 'fyi',
        done: !activeEvent,
        space: 'match',
        sub: 'preview',
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
    [unread.length, sec, challenges, activeEvent]
  );

  const runTask = (t: ManagerTask) => {
    if (t.space === 'more' && t.more) goMore(t.more);
    else goSpace(t.space, t.sub);
  };

  const priorityColor: Record<string, string> = {
    urgent: 'text-red-400',
    action: 'text-amber-300',
    important: 'text-[var(--brass)]',
    fyi: 'text-[var(--muted)]',
  };

  return (
    <div className="animate-enter space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-display text-[26px] tracking-tight text-[var(--ink)] sm:text-[30px]">
            Bureau
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">
            Command Center · priorités · prochain match · confiance
          </p>
        </div>
        <div className="label-caps text-[var(--brass)]">Saison 1 · J{Math.max(1, played + 1)}</div>
      </div>

      {activeEvent && (
        <div className="border border-amber-500/35 bg-amber-500/10 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            {activeEvent.priority ?? activeEvent.category} · décision requise
          </div>
          <div className="mt-1 type-display text-xl text-[var(--ink)]">{activeEvent.title}</div>
          <p className="mt-1 text-[13px] text-[var(--ink-dim)]">{activeEvent.body}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {activeEvent.choices.map((c) => (
              <Button key={c.id} disabled={loading} onClick={() => resolveEvent(c)}>
                {c.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* FC26 club identity + next match */}
      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.4fr_0.9fr]">
        <div className="panel flex flex-col items-center justify-center p-5">
          <ClubCrest name={team?.name ?? 'Club'} nation={team?.nation} stars={3} size="md" />
          <div className="mt-3 w-full border-t border-[var(--rule)] pt-3 text-center">
            <div className="data-num text-lg text-[var(--brass)]">{team ? money(team.budget) : '—'}</div>
            <div className="label-caps">Budget</div>
          </div>
        </div>

        <ArenaPanel className="p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]">
            {matchPreview?.competition ?? 'Super Ligue'} · {matchPreview?.kickoffLabel ?? 'Prochain match'}
          </div>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="text-right">
              <div className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">{team?.name ?? 'Vous'}</div>
              <div className="text-[11px] text-[var(--ink-faint)]">Domicile</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brass)]/40 bg-[var(--brass)]/10 text-[12px] font-bold text-[var(--brass)]">
              VS
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
                {matchPreview?.opponent ?? 'Adversaire'}
              </div>
              <div className="text-[11px] text-[var(--ink-faint)]">{matchPreview?.venue ?? 'Extérieur'}</div>
            </div>
          </div>
          {lastMatch && (
            <div className="mt-4 flex items-center justify-between border-t border-[var(--rule)] pt-3 text-[13px]">
              <span className="text-[var(--ink-dim)]">Dernier résultat</span>
              <span className="data-num font-semibold text-[var(--ink)]">
                {lastMatch.homeScore}–{lastMatch.awayScore}{' '}
                <Badge tone={lastMatch.result === 'W' ? 'good' : lastMatch.result === 'D' ? 'warn' : 'bad'}>
                  {lastMatch.result}
                </Badge>
              </span>
            </div>
          )}
          <div className="mt-4">
            <StartCta onClick={() => goSpace('match', 'preview')}>Préparer le match</StartCta>
          </div>
        </ArenaPanel>

        <div className="space-y-3">
          <div className="panel p-4">
            <div className="label-caps text-[var(--ink-dim)]">Confiance conseil</div>
            <BigStat value={`${sec}%`} label="Job security" size="lg" tone={sec >= 55 ? 'good' : 'bad'} />
            <ProgressBar value={sec} className="mt-3" />
            <button type="button" className="mt-3 text-[12px] text-[var(--brass)]" onClick={() => goMore('board')}>
              Objectifs ›
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <LevelTile label="Forme équipe" level={sec >= 60 ? 'Bonne' : 'Fragile'} tone={sec >= 60 ? 'high' : 'low'} />
          </div>
        </div>
      </div>

      {/* Level tiles row */}
      <div className="grid grid-cols-3 gap-2">
        <LevelTile
          label="Base fans"
          level={(team?.wins ?? 0) >= 3 ? 'Élevée' : 'Moyenne'}
          tone={(team?.wins ?? 0) >= 3 ? 'high' : 'mid'}
        />
        <LevelTile label="Centre formation" level="Standard" tone="mid" />
        <LevelTile
          label="Stabilité financière"
          level={(team?.budget ?? 0) > 2_000_000 ? 'Élevée' : 'Sous pression'}
          tone={(team?.budget ?? 0) > 2_000_000 ? 'high' : 'low'}
        />
      </div>

      {/* Task list — primary FC Manager Live language */}
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2.5">
          <span className="label-caps text-[var(--brass)]">Priorités manager</span>
          <span className="text-[11px] text-[var(--ink-faint)]">{tasks.filter((t) => !t.done).length} ouvertes</span>
        </div>
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            label={t.label}
            priority={t.priority}
            done={t.done}
            onClick={() => runTask(t)}
          />
        ))}
      </div>

      <StatBlock
        items={[
          { label: 'Victoires', value: team?.wins ?? 0 },
          { label: 'Nuls', value: team?.draws ?? 0 },
          { label: 'Défaites', value: team?.losses ?? 0 },
          { label: 'Budget', value: team ? money(team.budget) : '—', accent: true },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2.5">
            <span className="text-[14px] font-semibold text-[var(--ink)]">Courrier</span>
            <button type="button" className="text-[12px] text-[var(--brass)]" onClick={() => goMore('news')}>
              Inbox ›
            </button>
          </div>
          {unread.slice(0, 4).map((m) => (
            <button
              key={m.id}
              type="button"
              className="flex w-full flex-col border-b border-[var(--rule)] px-3 py-2.5 text-left hover:bg-[var(--panel-2)]"
              onClick={() => {
                markRead(m.id);
                goMore('news');
              }}
            >
              <div className="text-[13px] font-medium text-[var(--ink)]">{m.title}</div>
              <div className="truncate text-[11px] text-[var(--ink-dim)]">{m.sender}</div>
            </button>
          ))}
          {!unread.length && <p className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">Aucun message non lu</p>}
        </div>
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2.5">
            <span className="text-[14px] font-semibold text-[var(--ink)]">Monde</span>
            <button type="button" className="text-[12px] text-[var(--brass)]" onClick={() => goMore('manager')}>
              Market ›
            </button>
          </div>
          {(marketHeadlines ?? []).slice(0, 4).map((h, i) => (
            <div key={i} className="border-b border-[var(--rule)] px-3 py-2.5 text-[13px] text-[var(--ink-dim)] last:border-0">
              {h}
            </div>
          ))}
          {!(marketHeadlines ?? []).length && (
            <p className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">Jouez un match pour faire bouger le Manager Market</p>
          )}
        </div>
      </div>

      <ChronicleFeed preview />
    </div>
  );
}


function toneClass(tone: string) {
  if (tone === 'triumph') return 'border-l-emerald-400';
  if (tone === 'setback') return 'border-l-rose-400';
  if (tone === 'tension') return 'border-l-amber-400';
  if (tone === 'hope') return 'border-l-[var(--brass)]';
  if (tone === 'turning') return 'border-l-violet-400';
  return 'border-l-white/25';
}

function ChronicleFeed({ preview }: { preview?: boolean }) {
  const { chronicle, goMore, loadChronicle, seasonReview } = useGame();
  const entries = preview ? chronicle.slice(0, 5) : chronicle;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-white">Chronique</div>
          <div className="text-[11px] text-[var(--muted)]">Le club comme récit · signature ALYM</div>
        </div>
        {preview ? (
          <button type="button" className="text-[12px] text-[var(--brass)]" onClick={() => goMore('chronicle')}>
            Toute la saison ›
          </button>
        ) : (
          <button type="button" className="text-[12px] text-[var(--brass)]" onClick={() => loadChronicle()}>
            Actualiser
          </button>
        )}
      </div>
      {!preview && seasonReview && (
        <div className="mb-4 rounded-xl border border-white/8 bg-black/30 p-3">
          <div className="text-[11px] uppercase tracking-wide text-[var(--brass)]/80">La saison dont on se souvient</div>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">{seasonReview.narrative}</p>
          <div className="mt-2 data-num text-[12px] text-white/45">
            {seasonReview.record.wins}V · {seasonReview.record.draws}N · {seasonReview.record.losses}D ·{' '}
            {seasonReview.totalEntries} faits
          </div>
        </div>
      )}
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className={`border-l-2 pl-3 ${toneClass(e.tone)}`}>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-white/40">
              <span>
                S{e.season} · Sem. {e.week}
              </span>
              <span>·</span>
              <span>{e.type}</span>
            </div>
            <div className="mt-0.5 text-[14px] font-semibold text-white">{e.headline}</div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">{e.body}</p>
          </div>
        ))}
        {!entries.length && (
          <p className="text-[13px] text-[var(--muted)]">
            Le récit démarre à la création du club. Chaque match et chaque décision s’y ajoutent.
          </p>
        )}
      </div>
    </Card>
  );
}

function MoreChronicle() {
  const { loadChronicle } = useGame();
  useEffect(() => {
    loadChronicle().catch(console.error);
  }, [loadChronicle]);

  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Chronique" sub="Gère. Décide. Laisse une trace." />
      <ChronicleFeed />
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
    selectedPlayerId,
  } = useGame();
  const sub = (SQUAD_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'players') as string;

  const byPos = useMemo(() => {
    const order = ['GK', 'DF', 'MF', 'FW'];
    const g: Record<string, Player[]> = { GK: [], DF: [], MF: [], FW: [] };
    for (const p of players) {
      (g[p.position] ?? (g[p.position] = [])).push(p);
    }
    return order.map((pos) => ({
      pos,
      list: (g[pos] ?? []).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    }));
  }, [players]);

  const sorted = useMemo(
    () => [...players].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    [players]
  );

  const openPlayer = (id: number) => {
    setSelectedPlayerId(id);
    setDrawer('player');
  };

  return (
    <div className="animate-enter">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-display text-[26px] tracking-tight text-[var(--ink)] sm:text-[30px]">
            Effectif
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">
            {players.length} joueurs · {team?.name ?? 'Club'} · densité Squad Hub
          </p>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[var(--ink-dim)]">
          <span>
            <span className="data-num text-[var(--ink)]">
              {players.filter((p) => (p.rating ?? 0) >= 75).length}
            </span>{' '}
            élites
          </span>
          <span className="text-[var(--rule)]">|</span>
          <span>
            <span className="data-num text-[var(--ink)]">
              {players.filter((p) => p.isYouth).length}
            </span>{' '}
            jeunes
          </span>
        </div>
      </div>

      <SubNav items={SQUAD_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'overview' || sub === 'depth') && (
        <div className="space-y-5">
          {byPos.map(({ pos, list }) => (
            <div key={pos}>
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <PosChip pos={pos} />
                <span className="text-[12px] text-[var(--ink-dim)]">{list.length}</span>
              </div>
              <div className="panel overflow-hidden">
                <PlayerListHeader />
                {list.map((p) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    selected={selectedPlayerId === p.id}
                    onClick={() => openPlayer(p.id)}
                  />
                ))}
                {!list.length && (
                  <div className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">
                    Aucun joueur à ce poste.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(sub === 'players' || sub === 'development' || sub === 'contracts') && (
        <div className="panel overflow-hidden">
          <PlayerListHeader
            showValue={sub !== 'development'}
            showFitness={sub !== 'contracts'}
            showContract={sub === 'contracts' || sub === 'players'}
          />
          {sorted.map((p) => (
            <PlayerRow
              key={p.id}
              player={p}
              selected={selectedPlayerId === p.id}
              onClick={() => openPlayer(p.id)}
              showValue={sub !== 'development'}
              showFitness={sub !== 'contracts'}
              showContract={sub === 'contracts' || sub === 'players'}
            />
          ))}
          {!players.length && (
            <div className="px-3 py-8 text-center text-[13px] text-[var(--ink-dim)]">
              Aucun joueur — créez une équipe pour commencer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ─── TACTICS (pitch workspace) ─── */

const FORMATIONS = [
  { id: '4-3-3', label: '4-3-3', slots: ['GK','LB','CB','CB','RB','CM','CM','CM','LW','ST','RW'] },
  { id: '4-2-3-1', label: '4-2-3-1', slots: ['GK','LB','CB','CB','RB','CDM','CDM','LAM','CAM','RAM','ST'] },
  { id: '3-5-2', label: '3-5-2', slots: ['GK','CB','CB','CB','LWB','CM','CM','CM','RWB','ST','ST'] },
  { id: '4-4-2', label: '4-4-2', slots: ['GK','LB','CB','CB','RB','LM','CM','CM','RM','ST','ST'] },
] as const;

const VISIONS = [
  { id: 'tiki_taka', label: 'Possession', desc: 'Construction basse, presses haut' },
  { id: 'gegenpress', label: 'Gegenpress', desc: 'Récupération immédiate' },
  { id: 'counter', label: 'Contre-attaque', desc: 'Blocs bas, transitions rapides' },
  { id: 'park_bus', label: 'Bloc bas', desc: 'Défense compacte, peu de risques' },
  { id: 'standard', label: 'Équilibré', desc: 'Approche polyvalente' },
] as const;

/** Positions normalisées sur un terrain vertical (0–100) */
function pitchCoords(formationId: string): { x: number; y: number; role: string }[] {
  const map: Record<string, { x: number; y: number; role: string }[]> = {
    '4-3-3': [
      { x: 50, y: 92, role: 'GK' },
      { x: 18, y: 72, role: 'LB' }, { x: 38, y: 75, role: 'CB' }, { x: 62, y: 75, role: 'CB' }, { x: 82, y: 72, role: 'RB' },
      { x: 30, y: 52, role: 'CM' }, { x: 50, y: 48, role: 'CM' }, { x: 70, y: 52, role: 'CM' },
      { x: 18, y: 22, role: 'LW' }, { x: 50, y: 14, role: 'ST' }, { x: 82, y: 22, role: 'RW' },
    ],
    '4-2-3-1': [
      { x: 50, y: 92, role: 'GK' },
      { x: 18, y: 72, role: 'LB' }, { x: 38, y: 75, role: 'CB' }, { x: 62, y: 75, role: 'CB' }, { x: 82, y: 72, role: 'RB' },
      { x: 35, y: 55, role: 'CDM' }, { x: 65, y: 55, role: 'CDM' },
      { x: 18, y: 32, role: 'LAM' }, { x: 50, y: 28, role: 'CAM' }, { x: 82, y: 32, role: 'RAM' },
      { x: 50, y: 12, role: 'ST' },
    ],
    '3-5-2': [
      { x: 50, y: 92, role: 'GK' },
      { x: 28, y: 74, role: 'CB' }, { x: 50, y: 78, role: 'CB' }, { x: 72, y: 74, role: 'CB' },
      { x: 12, y: 48, role: 'LWB' }, { x: 32, y: 50, role: 'CM' }, { x: 50, y: 46, role: 'CM' }, { x: 68, y: 50, role: 'CM' }, { x: 88, y: 48, role: 'RWB' },
      { x: 38, y: 16, role: 'ST' }, { x: 62, y: 16, role: 'ST' },
    ],
    '4-4-2': [
      { x: 50, y: 92, role: 'GK' },
      { x: 18, y: 72, role: 'LB' }, { x: 38, y: 75, role: 'CB' }, { x: 62, y: 75, role: 'CB' }, { x: 82, y: 72, role: 'RB' },
      { x: 15, y: 45, role: 'LM' }, { x: 38, y: 48, role: 'CM' }, { x: 62, y: 48, role: 'CM' }, { x: 85, y: 45, role: 'RM' },
      { x: 38, y: 16, role: 'ST' }, { x: 62, y: 16, role: 'ST' },
    ],
  };
  return map[formationId] ?? map['4-3-3'];
}

function TacticsInline() {
  const { team, players, setVision, loading } = useGame();
  const [formation, setFormation] = useState<string>('4-3-3');
  const vision = team?.tacticalVision ?? 'standard';
  const coords = pitchCoords(formation);
  const sorted = [...players].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // Assign best available by rough position family
  const assigned = coords.map((c, i) => {
    const family = c.role === 'GK' ? 'GK' : ['CB','LB','RB','LWB','RWB'].includes(c.role) ? 'DF' : ['ST','LW','RW','CF'].includes(c.role) ? 'FW' : 'MF';
    const pool = sorted.filter((p) => p.position === family || (family === 'FW' && p.position === 'FW'));
    const p = pool[i % Math.max(1, pool.length)] ?? sorted[i] ?? null;
    return { ...c, player: p };
  });

  return (
    <div className="animate-enter space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-display text-[26px] text-[var(--ink)]">Tactique</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Terrain · formation · vision · instructions</p>
        </div>
        <div className="label-caps text-[var(--brass)]">Vision : {vision}</div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        {/* PITCH */}
        <div className="panel relative overflow-hidden p-3">
          <div
            className="relative mx-auto aspect-[2/3] w-full max-w-md rounded-sm border border-[var(--ok)]/30"
            style={{
              background:
                'linear-gradient(180deg, #1a3d28 0%, #153222 40%, #1a3d28 60%, #153222 100%)',
            }}
          >
            {/* pitch lines */}
            <div className="pointer-events-none absolute inset-[6%] border border-white/20" />
            <div className="pointer-events-none absolute left-[6%] right-[6%] top-1/2 h-px bg-white/20" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="pointer-events-none absolute left-[25%] right-[25%] top-[6%] h-[12%] border border-white/15 border-b-0" />
            <div className="pointer-events-none absolute bottom-[6%] left-[25%] right-[25%] h-[12%] border border-white/15 border-t-0" />

            {assigned.map((s, i) => (
              <div
                key={`${s.role}-${i}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brass)]/60 bg-black/55 text-[11px] font-bold text-[var(--ink)] shadow">
                  {s.player?.rating ?? '—'}
                </div>
                <div className="mt-0.5 max-w-[64px] truncate text-center text-[9px] font-medium text-white/90">
                  {s.player?.name?.split(' ').slice(-1)[0] ?? s.role}
                </div>
                <div className="text-[8px] uppercase text-white/45">{s.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="space-y-3">
          <div className="panel p-4">
            <div className="label-caps text-[var(--brass)]">Formation</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FORMATIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormation(f.id)}
                  className={`border px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                    formation === f.id
                      ? 'border-[var(--brass)] bg-[var(--brass)]/15 text-[var(--brass)]'
                      : 'border-[var(--rule)] text-[var(--ink)] hover:border-[var(--ink-faint)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-[var(--rule)] px-3 py-2.5 label-caps text-[var(--brass)]">Vision tactique</div>
            {VISIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={loading}
                onClick={() => setVision(v.id)}
                className={`flex w-full flex-col border-b border-[var(--rule)] px-3 py-2.5 text-left transition hover:bg-[var(--panel-2)] ${
                  vision === v.id ? 'bg-[var(--brass)]/10' : ''
                }`}
              >
                <span className={`text-[13px] font-semibold ${vision === v.id ? 'text-[var(--brass)]' : 'text-[var(--ink)]'}`}>
                  {v.label}
                </span>
                <span className="text-[11px] text-[var(--ink-dim)]">{v.desc}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <LevelTile label="Build-up" level="Court" tone="mid" />
            <LevelTile label="Pressing" level={vision === 'gegenpress' ? 'Très haut' : 'Moyen'} tone={vision === 'gegenpress' ? 'high' : 'mid'} />
            <LevelTile label="Largeur" level="Équilibrée" tone="mid" />
          </div>
        </div>
      </div>
    </div>
  );
}


function MatchHub() {
  const {
    spaceSub,
    setSpaceSub,
    matchPreview,
    lastMatch,
    playMatch,
    loading,
    team,
    challengeNote,
  } = useGame();
  const sub = (MATCH_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'preview') as string;
  const showScore = lastMatch && (sub === 'live' || sub === 'post');

  return (
    <div className="animate-enter space-y-4">
      <div className="mb-1">
        <h1 className="type-display text-[26px] tracking-tight text-[var(--ink)] sm:text-[30px]">Match Center</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Expérience immersive · preview · live · post-match</p>
      </div>
      <SubNav items={MATCH_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'preview' || sub === 'live' || sub === 'post') && (
        <ArenaPanel className="p-6">
          <div className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]/85">
            {matchPreview?.competition ?? 'Super Ligue'} · {matchPreview?.venue ?? 'Domicile'}
          </div>
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{team?.name ?? 'Vous'}</div>
              <div className="mt-1 text-[11px] text-white/40">DOM</div>
            </div>
            <div className="px-2 text-center">
              {showScore ? (
                <div className="data-num text-5xl font-bold tracking-tight text-white sm:text-6xl">
                  {lastMatch!.homeScore}
                  <span className="mx-1 text-white/30">–</span>
                  {lastMatch!.awayScore}
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--brass)]/50 bg-[var(--brass)]/10 text-sm font-bold text-[var(--brass)]">
                  VS
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {matchPreview?.opponent ?? lastMatch?.opponent ?? 'Adversaire'}
              </div>
              <div className="mt-1 text-[11px] text-white/40">EXT</div>
            </div>
          </div>

          {matchPreview && sub === 'preview' && (
            <div className="mt-8 grid grid-cols-4 gap-2">
              {(
                [
                  ['ATT', matchPreview.strength.attack],
                  ['MIL', matchPreview.strength.midfield],
                  ['DEF', matchPreview.strength.defense],
                  ['GB', matchPreview.strength.gk],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-black/35 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">{k}</div>
                  <div className="data-num mt-1 text-xl font-bold text-white">{v}</div>
                </div>
              ))}
            </div>
          )}

          {sub !== 'post' && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <StartCta disabled={loading} onClick={() => playMatch()}>
                {loading ? 'Simulation…' : 'Simuler le match'}
              </StartCta>
              {challengeNote && <p className="text-[12px] text-amber-200">{challengeNote}</p>}
            </div>
          )}

          {sub === 'post' && lastMatch && (
            <div className="mt-6 text-center text-[14px] text-white/55">
              Prime match <span className="data-num font-semibold text-amber-200">{money(lastMatch.prize)}</span>
            </div>
          )}
        </ArenaPanel>
      )}

      {lastMatch?.stats && (sub === 'live' || sub === 'post') && (
        <Card className="p-4">
          <div className="mb-3 text-[14px] font-semibold text-white">Statistiques</div>
          <div className="space-y-3 text-[13px]">
            {[
              ['Possession', lastMatch.stats.possessionHome, lastMatch.stats.possessionAway, true],
              ['Tirs', lastMatch.stats.shotsHome, lastMatch.stats.shotsAway, false],
              ['Cadrés', lastMatch.stats.shotsOnHome, lastMatch.stats.shotsOnAway, false],
            ].map(([label, a, b, pct]) => (
              <div key={String(label)}>
                <div className="mb-1 grid grid-cols-3 text-[12px]">
                  <span className="data-num text-right font-semibold text-white">
                    {a}
                    {pct ? '%' : ''}
                  </span>
                  <span className="text-center text-white/45">{label}</span>
                  <span className="data-num font-semibold text-white">
                    {b}
                    {pct ? '%' : ''}
                  </span>
                </div>
                <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="bg-[var(--brass)]"
                    style={{ width: `${pct ? a : Math.min(100, (Number(a) / Math.max(1, Number(a) + Number(b))) * 100)}%` }}
                  />
                  <div className="flex-1 bg-white/15" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {lastMatch?.timeline && lastMatch.timeline.length > 0 && (sub === 'live' || sub === 'post') && (
        <Card className="p-4">
          <div className="mb-2 text-[14px] font-semibold text-white">Timeline</div>
          <ul className="space-y-2">
            {lastMatch.timeline.map((e, i) => (
              <li key={i} className="flex gap-3 border-b border-white/5 py-2 text-[13px] last:border-0">
                <span className="data-num w-10 shrink-0 font-semibold text-[var(--brass)]">{e.minute}'</span>
                <span className="text-white">{e.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {sub === 'tactics' && <TacticsInline />}
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
  const [selected, setSelected] = useState<number | null>(null);
  const selectedListing = selected != null ? listings[selected] : null;

  return (
    <div className="animate-enter space-y-4">
      <div>
        <h1 className="type-display text-[26px] text-[var(--ink)]">Transfer Market</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">
          Recherche · cibles · négociation · confirmation
        </p>
      </div>
      <SubNav items={MARKET_SUBS} active={sub} onChange={setSpaceSub} />

      {(sub === 'overview' || sub === 'search' || sub === 'targets') && (
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-2">
              <span className="label-caps text-[var(--brass)]">{listings.length} joueurs listés</span>
              <span className="text-[11px] text-[var(--ink-faint)]">Trier par prix</span>
            </div>
            <div className="grid grid-cols-[40px_40px_1fr_72px_72px] gap-2 border-b border-[var(--rule)] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
              <span>OVR</span>
              <span>Pos</span>
              <span>Nom</span>
              <span className="text-right">Pot</span>
              <span className="text-right">Prix</span>
            </div>
            {listings.map((l, idx) => (
              <button
                key={l.tempId ?? `${l.name}-${idx}`}
                type="button"
                onClick={() => setSelected(idx)}
                className={`grid w-full grid-cols-[40px_40px_1fr_72px_72px] items-center gap-2 border-b border-[var(--rule)] px-3 py-2.5 text-left transition hover:bg-[var(--panel-2)] ${
                  selected === idx ? 'bg-[var(--panel-2)] border-l-2 border-l-[var(--brass)]' : 'border-l-2 border-l-transparent'
                }`}
              >
                <span className="data-num text-[14px] font-semibold text-[var(--ink)]">{l.rating}</span>
                <span className="text-[11px] font-semibold text-[var(--brass)]">{l.position}</span>
                <span className="truncate text-[13px] font-medium text-[var(--ink)]">{l.name}</span>
                <span className="data-num text-right text-[12px] text-[var(--ink-dim)]">{l.potential}</span>
                <span className="data-num text-right text-[12px] text-[var(--brass)]">{money(l.price)}</span>
              </button>
            ))}
            {!listings.length && (
              <p className="px-3 py-6 text-[13px] text-[var(--ink-dim)]">Aucun listing — jouez un match ou rafraîchissez le marché.</p>
            )}
          </div>

          <div className="panel p-4">
            {selectedListing ? (
              <>
                <div className="label-caps text-[var(--brass)]">Cible sélectionnée</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-col items-center justify-center border border-[var(--brass)]/40 bg-black/30">
                    <div className="data-num text-2xl font-bold text-[var(--ink)]">{selectedListing.rating}</div>
                    <div className="text-[8px] text-[var(--ink-faint)]">OVR</div>
                  </div>
                  <div>
                    <div className="type-display text-xl text-[var(--ink)]">{selectedListing.name}</div>
                    <div className="text-[12px] text-[var(--ink-dim)]">
                      {selectedListing.position} · POT {selectedListing.potential}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="panel-soft p-3">
                    <div className="label-caps">Prix demandé</div>
                    <div className="data-num mt-1 text-lg text-[var(--brass)]">{money(selectedListing.price)}</div>
                  </div>
                  <div className="panel-soft p-3">
                    <div className="label-caps">Offre suggérée</div>
                    <div className="data-num mt-1 text-lg text-[var(--ink)]">
                      {money(Math.round(selectedListing.price * 0.9))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    disabled={loading}
                    onClick={() =>
                      useGame.getState().openNego(selectedListing, Math.round(selectedListing.price * 0.9))
                    }
                  >
                    Ouvrir négociation
                  </Button>
                  <Button disabled={loading} onClick={() => buyListing(selectedListing)}>
                    Achat immédiat
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                <div className="label-caps text-[var(--ink-faint)]">Master / Detail</div>
                <p className="mt-2 max-w-[200px] text-[13px] text-[var(--ink-dim)]">
                  Sélectionnez un joueur dans la liste pour afficher le détail et négocier.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {sub === 'loans' && (
        <div className="panel overflow-hidden">
          <PlayerListHeader showValue showFitness={false} showContract={false} />
          {players
            .filter((p) => !p.isLegend)
            .map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                showFitness={false}
                onClick={() => (p.onLoan ? null : sellPlayer(p.id))}
              />
            ))}
        </div>
      )}

      {sub === 'negotiations' && <NegotiationsPanel />}

      {sub === 'jobs' && (
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--rule)] px-3 py-2 label-caps text-[var(--brass)]">Postes ouverts</div>
          {(managerJobs ?? []).map((j, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[var(--rule)] px-3 py-3">
              <div>
                <div className="text-[14px] font-medium text-[var(--ink)]">{(j as { club?: string }).club ?? 'Club'}</div>
                <div className="text-[12px] text-[var(--ink-dim)]">{(j as { role?: string }).role ?? 'Manager'}</div>
              </div>
              <Button disabled={loading} onClick={() => applyJob((j as { clubId?: number; id?: number }).clubId ?? (j as { id?: number }).id ?? 0)}>
                Postuler
              </Button>
            </div>
          ))}
          {!(managerJobs ?? []).length && (
            <p className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">Aucun poste — consultez le Manager Market.</p>
          )}
          <button type="button" className="px-3 py-3 text-[12px] text-[var(--brass)]" onClick={() => goMore('manager')}>
            Ouvrir Manager Market ›
          </button>
        </div>
      )}
    </div>
  );
}

function LiveHub() {
  const { spaceSub, setSpaceSub, challenges, startChallenge, abandonChallenge, loading } = useGame();
  const sub = (LIVE_SUBS.find((s) => s.id === spaceSub) ? spaceSub : 'for_you') as string;
  const catalog = challenges?.catalog ?? [];
  const active = challenges?.active;
  const focus = catalog[0] ?? active;

  const conditions: string[] = [];
  if (focus) {
    if (focus.goalTarget) conditions.push(`Objectif : ${focus.goalTarget} victoire(s)`);
    if (focus.matchesLimit) conditions.push(`Limite : ${focus.matchesLimit} matchs`);
    if ((focus as { focus?: string }).focus) conditions.push(`Focus : ${(focus as { focus?: string }).focus}`);
    conditions.push('Récompenses Or + budget en cas de réussite');
  }

  return (
    <div className="animate-enter space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="type-display text-[26px] text-[var(--ink)]">Manager Live</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Défis · réputation · objectifs live</p>
        </div>
      </div>
      <SubNav items={LIVE_SUBS} active={sub} onChange={setSpaceSub} />

      {/* Hero detail — FC26 challenge focus pattern */}
      {(sub === 'for_you' || sub === 'catalog' || (sub === 'active' && active)) && focus && (
        <ArenaPanel className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/55">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/80">Défi</span>
                <span>{active && focus.id === active.id ? 'En cours' : 'Disponible'}</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {focus.title}
              </h2>
              <p className="mt-2 max-w-xl text-[14px] text-white/60">{focus.description}</p>
              <div className="mt-4">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  Conditions
                </div>
                <ConditionRow items={conditions} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {active && focus.id === active.id ? (
                  <Button variant="danger" disabled={loading} onClick={() => abandonChallenge()}>
                    Abandonner
                  </Button>
                ) : (
                  <StartCta disabled={loading || !!active} onClick={() => startChallenge(focus.id)}>
                    Lancer le défi
                  </StartCta>
                )}
              </div>
            </div>
            <div className="w-full max-w-[160px] rounded-xl border border-white/10 bg-black/40 p-3 text-center">
              <div className="text-[10px] uppercase text-white/45">Récompense</div>
              <div className="mt-2 text-3xl">🏅</div>
              <div className="mt-1 text-[12px] font-semibold text-amber-200">Or + budget</div>
              {active && focus.id === active.id && (
                <div className="mt-3 space-y-1 text-[11px] text-white/60">
                  <div>
                    V {active.progress?.wins ?? 0}/{active.goalTarget ?? '—'}
                  </div>
                  <div>
                    M {active.progress?.matches ?? 0}/{active.matchesLimit ?? '—'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ArenaPanel>
      )}

      {sub === 'active' && !active && (
        <EmptyState title="Aucun défi actif" body="Choisissez-en un dans Pour vous ou Catalogue." />
      )}

      {/* Horizontal strip — FC26 challenge carousel */}
      {(sub === 'for_you' || sub === 'catalog') && (
        <div>
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-white/40">
            Catalogue
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {catalog.map((c) => (
              <StripCard
                key={c.id}
                title={c.title}
                subtitle={c.description?.slice(0, 42)}
                badge="Défi"
                active={active?.id === c.id}
                completed={false}
                onClick={() => !active && startChallenge(c.id)}
              />
            ))}
          </div>
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
      <div>
        <h1 className="type-display text-[26px] text-[var(--ink)]">Conseil d\'administration</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Attentes · confiance · objectifs saison</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="panel p-5">
          <div className="label-caps text-[var(--ink-dim)]">Confiance</div>
          <BigStat value={`${sec}%`} label="Job security" size="xl" tone={sec >= 55 ? 'good' : 'bad'} />
          <ProgressBar value={sec} className="mt-4" />
        </div>
        <div className="panel p-5">
          <div className="label-caps text-[var(--ink-dim)]">Attentes du conseil</div>
          <div className="mt-3 text-[15px] font-semibold uppercase tracking-wide text-[var(--ink)]">
            {(board?.objectives?.[0] as { title?: string } | undefined)?.title
              ?? 'Stabiliser le club et viser le milieu de tableau'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <LevelTile label="Pression" level={sec < 40 ? 'Très haute' : sec < 60 ? 'Modérée' : 'Faible'} tone={sec < 40 ? 'high' : 'mid'} />
        <LevelTile label="Ambition" level="Promotion" tone="high" />
        <LevelTile label="Patience" level={sec >= 60 ? 'Élevée' : 'Limitée'} tone={sec >= 60 ? 'high' : 'low'} />
      </div>
      <div className="panel overflow-hidden">
        <div className="border-b border-[var(--rule)] px-3 py-2.5 label-caps text-[var(--brass)]">Objectifs</div>
        {(board?.objectives ?? []).map((o, i) => (
          <div key={i} className="border-b border-[var(--rule)] px-3 py-3 last:border-0">
            <div className="text-[14px] font-medium text-[var(--ink)]">{(o as { title?: string }).title ?? String(o)}</div>
            <div className="mt-1 text-[12px] text-[var(--ink-dim)]">{(o as { description?: string }).description ?? ''}</div>
          </div>
        ))}
        {!(board?.objectives ?? []).length && (
          <p className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">Objectifs en cours de définition</p>
        )}
      </div>
    </div>
  );
}

function MoreFinance() {
  const { team, budget } = useGame() as ReturnType<typeof useGame> & { budget?: { income?: number; wages?: number; transferIn?: number; transferOut?: number } };
  return (
    <div className="animate-enter space-y-4">
      <div>
        <h1 className="type-display text-[26px] text-[var(--ink)]">Finance</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Budget · salaires · flux mercato</p>
      </div>
      <StatBlock
        items={[
          { label: 'Budget dispo', value: team ? money(team.budget) : '—', accent: true },
          { label: 'Masse salariale', value: budget?.wages != null ? money(budget.wages) : '—' },
          { label: 'Recettes', value: budget?.income != null ? money(budget.income) : '—' },
          { label: 'Or', value: team?.goldBalance ?? 0 },
        ]}
      />
      <div className="grid grid-cols-3 gap-2">
        <LevelTile
          label="Santé financière"
          level={(team?.budget ?? 0) > 3_000_000 ? 'Solide' : (team?.budget ?? 0) > 1_000_000 ? 'Stable' : 'Tendue'}
          tone={(team?.budget ?? 0) > 3_000_000 ? 'high' : (team?.budget ?? 0) > 1_000_000 ? 'mid' : 'low'}
        />
        <LevelTile label="Fair-play" level="OK" tone="mid" />
        <LevelTile label="Dette" level="Aucune" tone="high" />
      </div>
      <div className="panel p-4">
        <div className="label-caps text-[var(--ink-dim)]">Vision trésorerie</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-dim)]">
          Les flux de transfert et salaires impactent le budget en temps réel. Chaque recrutement
          doit être justifié par le plan de jeu et les attentes du conseil.
        </p>
      </div>
    </div>
  );
}

function MoreNews() {
  const { messages, markRead, marketHeadlines } = useGame();
  const unread = messages.filter((m) => !m.read);
  const lead = unread[0] ?? messages[0];
  const rest = messages.filter((m) => m.id !== lead?.id);

  return (
    <div className="animate-enter space-y-4">
      <div>
        <h1 className="type-display text-[26px] text-[var(--ink)]">Newsroom</h1>
        <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Courrier · actus · mercato · monde</p>
      </div>

      {lead && (
        <button
          type="button"
          onClick={() => markRead(lead.id)}
          className="panel w-full border-[var(--brass)]/30 p-5 text-left transition hover:border-[var(--brass)]/50"
        >
          <div className="flex items-center gap-2">
            <span className="label-caps text-[var(--brass)]">À la une</span>
            {!lead.read && <Badge tone="brass">Nouveau</Badge>}
          </div>
          <div className="type-display mt-2 text-2xl text-[var(--ink)]">{lead.title}</div>
          <div className="mt-1 text-[12px] text-[var(--ink-dim)]">{lead.sender}</div>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-dim)]">{lead.content}</p>
        </button>
      )}

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--rule)] px-3 py-2 label-caps text-[var(--brass)]">Inbox</div>
          {rest.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => markRead(m.id)}
              className={`flex w-full flex-col border-b border-[var(--rule)] px-3 py-3 text-left hover:bg-[var(--panel-2)] ${
                !m.read ? 'bg-[var(--brass)]/5' : ''
              }`}
            >
              <div className="flex justify-between gap-2">
                <span className="text-[13px] font-medium text-[var(--ink)]">{m.title}</span>
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--brass)]" />}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--ink-dim)]">{m.sender}</div>
            </button>
          ))}
          {!messages.length && (
            <p className="px-3 py-6 text-[13px] text-[var(--ink-dim)]">Boîte vide — les événements alimentent l’inbox.</p>
          )}
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--rule)] px-3 py-2 label-caps text-[var(--brass)]">Fil monde</div>
          {(marketHeadlines ?? []).map((h, i) => (
            <div key={i} className="border-b border-[var(--rule)] px-3 py-2.5 text-[13px] text-[var(--ink-dim)] last:border-0">
              {h}
            </div>
          ))}
          {!(marketHeadlines ?? []).length && (
            <p className="px-3 py-4 text-[13px] text-[var(--ink-dim)]">Pas encore de fil — jouez un match.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MoreAcademy() {
  const { youth, scoutYouth, promote, loading } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-display text-[26px] text-[var(--ink)]">Académie</h1>
          <p className="mt-0.5 text-[13px] text-[var(--ink-dim)]">Prospects · potentiel · promotion</p>
        </div>
        <Button disabled={loading} onClick={() => scoutYouth()}>
          Scout (£8k)
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <LevelTile label="Prospects" level={String(youth.length)} tone="mid" />
        <LevelTile label="Prêts promo" level={String(youth.filter((p) => (p.potential ?? 0) >= 80).length)} tone="high" />
        <LevelTile label="Confiance scout" level="Moyenne" tone="mid" />
      </div>
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[40px_40px_1fr_56px_80px] gap-2 border-b border-[var(--rule)] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
          <span>OVR</span>
          <span>Pos</span>
          <span>Prospect</span>
          <span className="text-right">POT</span>
          <span className="text-right">Action</span>
        </div>
        {youth.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[40px_40px_1fr_56px_80px] items-center gap-2 border-b border-[var(--rule)] px-3 py-2.5"
          >
            <span className="data-num text-[14px] font-semibold text-[var(--ink)]">{p.rating ?? 55}</span>
            <span className="text-[11px] font-semibold text-[var(--brass)]">{p.position}</span>
            <span className="truncate text-[13px] text-[var(--ink)]">{p.name}</span>
            <span className="data-num text-right text-[12px] text-[var(--ok)]">{p.potential ?? '—'}</span>
            <Button className="justify-self-end" disabled={loading} onClick={() => promote(p.id)}>
              Promo
            </Button>
          </div>
        ))}
        {!youth.length && (
          <p className="px-3 py-6 text-[13px] text-[var(--ink-dim)]">Aucun prospect — lancez un scout.</p>
        )}
      </div>
    </div>
  );
}

function MoreTraining() {
  const { training, players, setTraining, loading } = useGame();
  const plans = training?.plans ?? [
    { id: 'balanced', name: 'Équilibré', focus: 'all' },
    { id: 'attacking', name: 'Offensif', focus: 'shot' },
    { id: 'defensive', name: 'Défensif', focus: 'defense' },
    { id: 'technical', name: 'Technique', focus: 'dribble' },
    { id: 'physical', name: 'Physique', focus: 'physique' },
  ];
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Entraînement" sub="Plans individuels · gains après match" />
      <div className="grid gap-2 sm:grid-cols-2">
        {players.filter((p) => !p.onLoan).map((p) => (
          <Card key={p.id} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-[12px] text-[var(--muted)]">{p.position} · plan {p.trainingPlan ?? 'balanced'}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {plans.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setTraining(p.id, pl.id)}
                  className={`rounded-lg px-2 py-1 text-[11px] ${
                    (p.trainingPlan ?? 'balanced') === pl.id
                      ? 'bg-[var(--brass)]/20 text-[var(--brass)]'
                      : 'bg-white/5 text-[var(--muted)]'
                  }`}
                >
                  {pl.name}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MoreLegends() {
  const { legends, recruitLegend, loading, team } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Légendes" sub="ICONs & Heroes · £80k" />
      <div className="grid gap-3 sm:grid-cols-2">
        {(legends ?? []).map((l) => (
          <Card key={l.code} className={`p-4 ${l.owned ? 'border-emerald-500/30' : ''}`}>
            <div className="flex justify-between gap-2">
              <div>
                <div className="font-bold text-white">{l.name}</div>
                <div className="text-[12px] text-[var(--muted)]">{l.position} · {l.nation}</div>
              </div>
              <Badge tone={l.owned ? 'good' : l.unlocked ? 'brass' : 'neutral'}>
                {l.owned ? 'Recruté' : l.unlocked ? 'Dispo' : 'Verrouillé'}
              </Badge>
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">Déblocage : {l.unlock}</p>
            <Button
              className="mt-3"
              disabled={loading || !l.unlocked || l.owned || (team?.budget ?? 0) < 80000}
              onClick={() => recruitLegend(l.code)}
            >
              Recruter · £80,000
            </Button>
          </Card>
        ))}
      </div>
      {!(legends ?? []).length && <EmptyState title="Chargement…" body="Ouvre cet onglet après connexion." />}
    </div>
  );
}

function MoreShop() {
  const { shopItems, buyShop, loading, team } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Boutique" sub={`Or disponible : ${team?.goldBalance ?? 0}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(shopItems ?? []).map((it) => (
          <Card key={it.id} className="p-4">
            <div className="font-semibold text-white">{it.name}</div>
            <div className="mt-1 text-[12px] text-[var(--muted)]">{it.effect}</div>
            <Button className="mt-3" disabled={loading || (team?.goldBalance ?? 0) < it.price} onClick={() => buyShop(it.id)}>
              Acheter · {it.price} Or
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MoreAchievements() {
  const { achievements } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Succès" />
      <div className="grid gap-2 sm:grid-cols-2">
        {(achievements ?? []).map((a) => (
          <Card key={a.code} className={`p-3 ${a.unlocked ? 'border-[var(--brass)]/30' : 'opacity-70'}`}>
            <div className="flex justify-between">
              <span className="font-semibold text-white">{a.name}</span>
              <Badge tone={a.unlocked ? 'brass' : 'neutral'}>{a.unlocked ? 'OK' : '—'}</Badge>
            </div>
            <p className="mt-1 text-[12px] text-[var(--muted)]">{a.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MoreCalendar() {
  const { team, lastMatch, matchPreview } = useGame();
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const j = played + i;
    const isMatch = i % 3 === 0;
    return { j, isMatch, label: isMatch ? (i === 0 ? matchPreview?.opponent ?? 'Adversaire' : 'Journée') : 'Entraînement' };
  });
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Calendrier" sub={`Saison 1 · J${played + 1}`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {days.map((d) => (
          <Card key={d.j} className={`p-3 ${d.isMatch ? 'border-[var(--brass)]/25' : ''}`}>
            <div className="text-[11px] text-[var(--muted)]">J{d.j + 1}</div>
            <div className="text-[13px] font-medium text-white">{d.label}</div>
          </Card>
        ))}
      </div>
      {lastMatch && (
        <p className="text-[12px] text-[var(--muted)]">
          Dernier : {lastMatch.homeScore}-{lastMatch.awayScore} vs {lastMatch.opponent}
        </p>
      )}
    </div>
  );
}


function NegotiationsPanel() {
  const { negotiations, respondNego, completeNego, loading } = useGame();
  if (!negotiations?.length) {
    return (
      <div className="panel p-8 text-center">
        <div className="label-caps text-[var(--ink-faint)]">Négociations</div>
        <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
          Depuis Recherche, sélectionnez un joueur puis « Ouvrir négociation ».
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {negotiations.map((n) => (
        <div key={n.id} className="panel overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--rule)] bg-[var(--panel-2)] px-4 py-3">
            <div>
              <div className="type-display text-lg text-[var(--ink)]">{n.playerName}</div>
              <div className="mt-0.5 text-[12px] text-[var(--ink-dim)]">{n.position} · étape {n.step}</div>
            </div>
            <Badge tone={n.status === 'agreed' || n.status === 'completed' ? 'good' : n.status === 'rejected' ? 'bad' : 'warn'}>
              {n.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-4">
            <div className="bg-[var(--panel)] px-3 py-3">
              <div className="label-caps">Votre offre</div>
              <div className="data-num mt-1 text-lg text-[var(--ink)]">{money(n.offerAmount)}</div>
            </div>
            <div className="bg-[var(--panel)] px-3 py-3">
              <div className="label-caps">Contre-offre</div>
              <div className="data-num mt-1 text-lg text-[var(--brass)]">
                {n.counterAmount ? money(n.counterAmount) : '—'}
              </div>
            </div>
            <div className="bg-[var(--panel)] px-3 py-3">
              <div className="label-caps">Statut</div>
              <div className="mt-1 text-[13px] font-semibold uppercase text-[var(--ink)]">{n.status}</div>
            </div>
            <div className="bg-[var(--panel)] px-3 py-3">
              <div className="label-caps">Étape</div>
              <div className="data-num mt-1 text-lg text-[var(--ink)]">{n.step}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {n.status === 'countered' && (
              <>
                <Button disabled={loading} onClick={() => respondNego(n.id, 'accept_counter')}>
                  Accepter contre-offre
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => respondNego(n.id, 'raise', Math.round((n.counterAmount || n.offerAmount) * 1.05))}
                >
                  Surenchérir +5%
                </Button>
                <Button disabled={loading} onClick={() => respondNego(n.id, 'walk_away')}>
                  Abandonner
                </Button>
              </>
            )}
            {n.status === 'agreed' && (
              <Button disabled={loading} onClick={() => completeNego(n.id)}>
                Finaliser le transfert
              </Button>
            )}
            {n.status === 'pending' && (
              <span className="text-[13px] text-[var(--ink-dim)]">En attente de réponse du club…</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MoreStaff() {
  const { staffCatalog, staffMembers, hireStaff, fireStaff, loading, team } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Staff" sub="Recrutement · salaires hebdo" />
      <div className="grid gap-3 sm:grid-cols-2">
        {(staffCatalog ?? []).map((c) => (
          <Card key={c.role} className="p-4">
            <div className="font-semibold text-white">{c.name}</div>
            <div className="text-[12px] text-[var(--muted)]">
              {c.specialty} · note {c.rating} · £{c.salary}/sem
            </div>
            {c.hired ? (
              <Badge tone="good">En poste</Badge>
            ) : (
              <Button
                className="mt-3"
                disabled={loading || (team?.budget ?? 0) < c.cost}
                onClick={() => hireStaff(c.role)}
              >
                Embaucher · £{c.cost.toLocaleString('fr-FR')}
              </Button>
            )}
          </Card>
        ))}
      </div>
      {(staffMembers ?? []).length > 0 && (
        <Card className="p-4">
          <div className="mb-2 text-[14px] font-semibold text-white">Effectif staff</div>
          {staffMembers.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b border-white/5 py-2 text-[13px]">
              <span className="text-white">
                {s.name} <span className="text-[var(--muted)]">· {s.role}</span>
              </span>
              <Button disabled={loading} onClick={() => fireStaff(s.id)}>
                Licencier
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function MoreCompetitions() {
  const { leagueTable, team } = useGame();
  return (
    <div className="animate-enter space-y-4">
      <SectionTitle title="Super Ligue" sub="Classement réel de saison" />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_repeat(5,2rem)] gap-1 border-b border-white/10 px-3 py-2 text-[10px] uppercase text-[var(--muted)]">
          <span>#</span>
          <span>Club</span>
          <span className="text-center">J</span>
          <span className="text-center">V</span>
          <span className="text-center">N</span>
          <span className="text-center">D</span>
          <span className="text-center">Pts</span>
        </div>
        {(leagueTable ?? []).map((r) => (
          <div
            key={r.teamName}
            className={`grid grid-cols-[2rem_1fr_repeat(5,2rem)] gap-1 px-3 py-2 text-[13px] ${
              r.isPlayer ? 'bg-[var(--brass)]/10 font-semibold text-[var(--ink)]' : 'text-white'
            }`}
          >
            <span className="data-num text-[var(--muted)]">{r.rank}</span>
            <span className="truncate">{r.teamName}</span>
            <span className="data-num text-center">{r.played}</span>
            <span className="data-num text-center">{r.wins}</span>
            <span className="data-num text-center">{r.draws}</span>
            <span className="data-num text-center">{r.losses}</span>
            <span className="data-num text-center font-bold">{r.points}</span>
          </div>
        ))}
        {!(leagueTable ?? []).length && (
          <p className="p-4 text-[13px] text-[var(--muted)]">Joue un match pour peupler le classement.</p>
        )}
      </Card>
      {team && (
        <p className="text-[12px] text-[var(--muted)]">
          Bilan club : {team.wins}V {team.draws}N {team.losses}D
        </p>
      )}
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
      return <MoreTraining />;
    case 'manager':
    case 'world':
      return (
        <div className="animate-enter">
          <SectionTitle title="Manager Market" sub="Mouvements · postes · fil d’actu" />
          <MarketHub />
        </div>
      );
    case 'legends':
      return <MoreLegends />;
    case 'shop':
      return <MoreShop />;
    case 'achievements':
      return <MoreAchievements />;
    case 'calendar':
      return <MoreCalendar />;
    case 'competitions':
      return <MoreCompetitions />;
    case 'chronicle':
      return <MoreChronicle />;
    case 'analytics':
      return <MoreGeneric title="Analytics" body="Tendances équipe / joueurs — mêmes stats match." />;
    case 'staff':
      return <MoreStaff />;
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

  const activeEvent = useGame((s) => s.activeEvent);
  const resolveEvent = useGame((s) => s.resolveEvent);
  const loading = useGame((s) => s.loading);

  return (
    <AppShell>
      {body}
      <PlayerDrawer />
      {activeEvent && (
        <Modal open onClose={() => {}}>
          <div className="text-[11px] uppercase text-amber-300">
            {activeEvent.priority ?? activeEvent.category} · événement
          </div>
          <div className="mt-1 text-lg font-bold text-white">{activeEvent.title}</div>
          <p className="mt-2 text-[14px] text-[var(--muted)]">{activeEvent.body}</p>
          <div className="mt-4 space-y-2">
            {activeEvent.choices.map((c) => (
              <Button key={c.id} className="w-full" disabled={loading} onClick={() => resolveEvent(c)}>
                {c.label}
              </Button>
            ))}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
