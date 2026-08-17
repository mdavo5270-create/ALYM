import { useMemo, useState } from 'react';
import { MODULES, screensByModule, type ModuleId, type ScreenDef, SCREEN_COUNT } from '../lib/screens';
import { useGame } from '../store/gameStore';
import { money } from '../components/ui';

function Ovr({ v }: { v: number }) {
  const cls = v >= 80 ? 'ovr-elite' : v >= 72 ? 'ovr-high' : v >= 64 ? 'ovr-mid' : 'ovr-low';
  return <span className={cls}>{v}</span>;
}

/** Renders any career screen with iOS chrome + contextual data when available */
export function ModuleExplorer({ moduleId, onBack }: { moduleId: ModuleId; onBack?: () => void }) {
  const screens = useMemo(() => screensByModule(moduleId), [moduleId]);
  const mod = MODULES.find((m) => m.id === moduleId);
  const [active, setActive] = useState<ScreenDef | null>(screens.find((s) => s.kind === 'screen') ?? screens[0] ?? null);
  const game = useGame();

  const title = active?.name ?? mod?.label ?? 'Module';

  return (
    <div className="ios-screen animate-enter">
      <div className="ios-nav px-4 pb-2 pt-3">
        <div className="mb-1 flex items-center justify-between">
          <button type="button" className="ios-btn-plain text-[17px]" onClick={onBack}>
            ‹ Modules
          </button>
          <span className="ios-caption">
            {screens.length} écrans · #{active?.id}
          </span>
        </div>
        <h1 className="ios-large-title">{mod?.label}</h1>
        <p className="ios-subhead mt-1">
          {SCREEN_COUNT} écrans carrière · style iOS
        </p>
        <div className="subtabs mt-3">
          {screens.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`subtab ${active?.id === s.id ? 'subtab-active' : ''}`}
              onClick={() => setActive(s)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 pb-28">
        <div className="ios-card p-4">
          <div className="ios-caption">Écran actif</div>
          <div className="ios-title mt-1">{title}</div>
          <p className="ios-subhead mt-1">
            Type · {active?.kind} · Module {moduleId} · ID {active?.id}
          </p>
        </div>

        <ScreenBody def={active} game={game} money={money} Ovr={Ovr} />

        <div className="ios-grouped">
          <div className="ios-row">
            <div className="flex-1">
              <div className="text-[15px] font-medium">Liste des écrans du module</div>
              <div className="ios-subhead">{screens.length} vues</div>
            </div>
          </div>
          {screens.map((s) => (
            <button key={s.id} type="button" className="ios-row w-full text-left" onClick={() => setActive(s)}>
              <span className="w-8 text-[13px] text-[var(--ios-tertiary)]">{s.id}</span>
              <div className="min-w-0 flex-1">
                <div className={`text-[15px] ${active?.id === s.id ? 'text-[var(--ios-blue)]' : ''}`}>{s.name}</div>
                <div className="ios-caption normal-case tracking-normal">{s.kind}</div>
              </div>
              <span className="text-[var(--ios-tertiary)]">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenBody({
  def,
  game,
  money,
  Ovr,
}: {
  def: ScreenDef | null;
  game: ReturnType<typeof useGame.getState>;
  money: (n: number) => string;
  Ovr: (p: { v: number }) => JSX.Element;
}) {
  if (!def) return null;
  const team = game.team;
  const players = game.players ?? [];
  const last = game.lastMatch;

  // Contextual rich bodies for key screens
  if (def.module === 'central' || def.key.includes('central') || def.id === 52 || def.id === 53) {
    return (
      <div className="space-y-3">
        <div className="panel-hero p-5">
          <div className="ios-caption text-[var(--ios-blue)]">Prochain match</div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="text-right">
              <div className="text-lg font-semibold">{team?.name ?? 'Club'}</div>
              <div className="ios-subhead">Domicile</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ios-fill)] text-sm font-bold text-[var(--ios-blue)]">
              VS
            </div>
            <div>
              <div className="text-lg font-semibold">{last?.opponent ?? 'Adversaire'}</div>
              <div className="ios-subhead">Extérieur</div>
            </div>
          </div>
          <button type="button" className="ios-btn ios-btn-primary mt-4 w-full" onClick={() => game.switchTab('match')}>
            Match Center
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'Sécurité', v: `${team?.jobSecurity ?? 70}%` },
            { l: 'Budget', v: money(team?.budget ?? 0) },
            { l: 'Bilan', v: team ? `${team.wins}V ${team.draws}N ${team.losses}D` : '—' },
          ].map((x) => (
            <div key={x.l} className="ios-card p-3 text-center">
              <div className="ios-caption">{x.l}</div>
              <div className="mt-1 data-num text-[15px] font-semibold">{x.v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (def.module === 'squad' || def.module === 'player') {
    return (
      <div className="ios-grouped">
        {players.slice(0, 12).map((p) => (
          <button
            key={p.id}
            type="button"
            className="ios-row w-full text-left"
            onClick={() => game.setSelectedPlayerId?.(p.id)}
          >
            <Ovr v={p.rating ?? 60} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">{p.name}</div>
              <div className="ios-subhead">
                {p.position} · {p.nation ?? '—'}
              </div>
            </div>
            <span className="data-num text-[13px] text-[var(--ios-secondary)]">{money(p.salary)}</span>
          </button>
        ))}
        {players.length === 0 && (
          <div className="ios-row">
            <span className="ios-subhead">Aucun joueur chargé</span>
          </div>
        )}
      </div>
    );
  }

  if (def.module === 'live') {
    const catalog = game.challenges?.catalog ?? [];
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {catalog.map((c) => (
          <div key={c.id} className="hub-tile w-[200px]">
            <div className="ios-chip ios-chip-blue">{c.difficulty}</div>
            <div className="mt-2 text-[15px] font-semibold">{c.title}</div>
            <p className="mt-1 line-clamp-3 text-[13px] text-[var(--ios-secondary)]">{c.description}</p>
            <button
              type="button"
              className="ios-btn ios-btn-primary mt-3 w-full text-[14px]"
              disabled={!!game.challenges?.active}
              onClick={() => game.startChallenge?.(c.id)}
            >
              Start Job
            </button>
          </div>
        ))}
        {catalog.length === 0 && <div className="ios-subhead p-2">Catalogue vide — chargez une carrière.</div>}
      </div>
    );
  }

  if (def.module === 'match_live' || def.module === 'match_preview' || def.module === 'match_end') {
    return (
      <div className="space-y-3">
        <div className="panel-hero p-5 text-center">
          <div className="ios-caption">Match Center</div>
          <div className="mt-2 text-2xl font-bold">
            {last ? `${last.homeScore} — ${last.awayScore}` : '— : —'}
          </div>
          <div className="ios-subhead mt-1">{last ? `${team?.name ?? 'Vous'} vs ${last.opponent}` : 'Aucun match récent'}</div>
          <button type="button" className="ios-btn ios-btn-primary mt-4 w-full" disabled={game.loading} onClick={() => game.playMatch?.()}>
            {game.loading ? 'Simulation…' : 'Simuler le match'}
          </button>
        </div>
        {last?.timeline && (
          <div className="ios-grouped">
            {last.timeline.slice(0, 8).map((e, i) => (
              <div key={i} className="ios-row">
                <span className="data-num w-10 text-[13px] text-[var(--ios-blue)]">{e.minute}'</span>
                <span className="text-[15px]">{e.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (def.module === 'mgrmarket') {
    const jobs = game.managerJobs ?? [];
    return (
      <div className="ios-grouped">
        {jobs.slice(0, 10).map((j) => (
          <div key={j.clubId} className="ios-row">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">{j.clubName}</div>
              <div className="ios-subhead">
                {j.nation} · Compat {j.compatibility}% · {j.likelihood}
              </div>
            </div>
            <button type="button" className="ios-btn-plain text-[14px]" onClick={() => game.applyJob?.(j.clubId)}>
              Postuler
            </button>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="ios-row">
            <span className="ios-subhead">Aucun poste — ouvrez Manager Market depuis le hub.</span>
          </div>
        )}
      </div>
    );
  }

  if (def.module === 'finance' || def.module === 'board') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: 'Budget transfert', v: money(team?.budget ?? 0) },
          { l: 'Sécurité poste', v: `${team?.jobSecurity ?? 70}%` },
          { l: 'Or', v: String(team?.goldBalance ?? 0) },
          { l: 'Vision', v: team?.tacticalVision ?? '—' },
        ].map((x) => (
          <div key={x.l} className="ios-card p-4">
            <div className="ios-caption">{x.l}</div>
            <div className="mt-2 data-num text-lg font-semibold">{x.v}</div>
          </div>
        ))}
      </div>
    );
  }

  // Generic structured body for all other screens
  return (
    <div className="ios-card p-4">
      <div className="ios-caption">Contenu structuré</div>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ios-secondary)]">
        Écran <strong className="text-white">{def.name}</strong> prêt dans l’architecture ALYM. Données liées au module «
        {def.module} » — interactions branchées quand l’API métier est disponible.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="ios-chip">iOS layout</span>
        <span className="ios-chip ios-chip-blue">{def.kind}</span>
        <span className="ios-chip">FC26 UX</span>
      </div>
    </div>
  );
}
