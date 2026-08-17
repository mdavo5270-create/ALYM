import { FormEvent, useState } from 'react';
import { AlymLogo, MylaMark } from '../components/Logo';
import { Button, Input, Panel } from '../components/ui';
import { useGame } from '../store/gameStore';

export function Splash() {
  return (
    <div className="stage-bg flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-10 h-px w-16 bg-[var(--brass)]" />
      <AlymLogo size={72} />
      <h1 className="type-display mt-8 text-5xl text-[var(--ink)]">ALYM</h1>
      <p className="mt-3 max-w-xs text-center text-[12px] leading-relaxed text-[var(--ink-dim)]">
        Athletic League Youth Manager
      </p>
      <div className="mt-12">
        <MylaMark />
      </div>
    </div>
  );
}

export function Title() {
  const { setScreen, setAuthMode } = useGame();
  return (
    <div className="stage-bg flex min-h-screen flex-col justify-center px-6 py-12">
<div className="animate-enter mx-auto w-full max-w-lg pt-10">
        <div className="flex items-center gap-3">
          <AlymLogo size={40} />
          <div>
            <div className="type-display text-2xl text-[var(--ink)]">ALYM</div>
            <MylaMark />
          </div>
        </div>

        <p className="mt-10 max-w-sm text-[15px] leading-[1.55] text-[var(--ink-dim)]">
          Gère un club. Prends des décisions. Laisse une trace.
          <span className="mt-2 block text-[var(--ink)]">Pas un tableau de bord — une carrière.</span>
        </p>

        <div className="mt-10 space-y-3">
          <button
            type="button"
            className="panel-hero group w-full p-5 pl-6 text-left transition hover:border-[var(--brass)]"
            onClick={() => {
              setAuthMode('register');
              setScreen('auth');
            }}
          >
            <div className="label-caps">Nouveau</div>
            <div className="type-display mt-1 text-xl text-[var(--ink)]">Ouvrir une carrière</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-dim)]">
              Profil manager, club, défis Live, marché des coachs.
            </p>
          </button>

          <button
            type="button"
            className="panel group w-full p-5 text-left transition hover:border-[var(--ink-faint)]"
            onClick={() => {
              setAuthMode('login');
              setScreen('auth');
            }}
          >
            <div className="label-caps">Reprendre</div>
            <div className="type-display mt-1 text-xl text-[var(--ink)]">Sauvegarde existante</div>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-dim)]">
              Retrouver le fil de saison et la chronique du club.
            </p>
          </button>
        </div>

        <p className="mt-12 text-[11px] tracking-[0.12em] text-[var(--ink-faint)]">
          STUDIO LA MYLA · 2026 · BUILD 0d1357+
        </p>
      </div>
    </div>
  );
}

export function Auth() {
  const { authMode, setAuthMode, auth, loading, error, setScreen } = useGame();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await auth(email, password, username);
  }

  return (
    <div className="stage-bg flex min-h-screen items-center justify-center px-4">
      <Panel className="animate-enter w-full max-w-md p-7">
        <div className="mb-6 flex items-center gap-3 border-b border-[var(--rule)] pb-5">
          <AlymLogo size={40} />
          <div>
            <div className="type-display text-lg text-[var(--ink)]">
              {authMode === 'register' ? 'Nouveau profil' : 'Connexion'}
            </div>
            <MylaMark />
          </div>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
          {authMode === 'register' && (
            <Input
              placeholder="Nom d'affichage (optionnel)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Mot de passe (8+ · lettre + chiffre)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
          <Button className="w-full py-2.5" disabled={loading} type="submit">
            {loading ? '…' : authMode === 'register' ? 'Créer le profil' : 'Entrer en carrière'}
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-xs text-[var(--ink-faint)]">
          <button type="button" className="hover:text-[var(--ink)]" onClick={() => setScreen('title')}>
            Retour
          </button>
          <button
            type="button"
            className="hover:text-[var(--ink)]"
            onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
          >
            {authMode === 'register' ? 'Déjà un compte' : 'Créer un profil'}
          </button>
        </div>
      </Panel>
    </div>
  );
}

/** FC26 club-select composition — crest + kit + big stats + board + level tiles */
function LevelTile({ label, level, tone }: { label: string; level: string; tone: 'high' | 'mid' | 'low' }) {
  const bg =
    tone === 'high'
      ? 'bg-gradient-to-br from-amber-600/80 to-orange-800/90'
      : tone === 'mid'
        ? 'bg-gradient-to-br from-slate-600/70 to-slate-800/90'
        : 'bg-gradient-to-br from-sky-700/70 to-blue-900/90';
  return (
    <div className={`flex min-h-[72px] flex-col justify-between rounded-sm p-3 ${bg}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">{label}</div>
      <div className="text-[15px] font-bold uppercase tracking-wide text-white">{level}</div>
    </div>
  );
}

export function CreateTeam() {
  const { createTeam, loading, error } = useGame();
  const [name, setName] = useState('');
  const [nation, setNation] = useState('France');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await createTeam(name, nation);
  }

  const displayName = name.trim() || 'VOTRE CLUB';
  const founded = 2026;

  return (
    <div className="stage-bg relative min-h-screen overflow-hidden px-3 py-6 sm:px-6 sm:py-10">
      {/* subtle pitch grid like FC */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-5xl animate-enter">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="label-caps text-[var(--brass)]">Chapitre 1 · Identité club</div>
            <h1 className="type-display mt-1 text-2xl text-[var(--ink)] sm:text-3xl">Choisir votre club</h1>
          </div>
          <div className="hidden text-right text-[11px] text-[var(--ink-faint)] sm:block">
            Composition inspirée Career Mode
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1.05fr_1.35fr]">
          {/* LEFT — Crest card (FC26 style) */}
          <div className="panel flex flex-col border-[var(--brass)]/40 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--ok)] text-[10px] text-[var(--ok)]">
                ✓
              </span>
              <span className="text-[12px] font-medium text-[var(--ink)]">Équipe masculine</span>
            </div>
            <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-dim)]">
              {nation || 'Nation'}
            </div>
            <div className="mt-4 flex flex-1 flex-col items-center justify-center py-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[var(--brass)]/50 bg-black/40 text-4xl font-bold text-[var(--brass)] shadow-[0_0_40px_rgba(196,160,80,0.12)]">
                {(displayName[0] || 'A').toUpperCase()}
              </div>
              <div className="type-display mt-5 text-center text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                {displayName}
              </div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="text-[14px] text-[var(--brass)]">
                    ★
                  </span>
                ))}
                {[4, 5].map((i) => (
                  <span key={i} className="text-[14px] text-[var(--ink-faint)]">
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--rule)] pt-4 text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
              Ligue · Division 1
            </div>
          </div>

          {/* RIGHT — Stats grid like FC26 */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Kit + Stadium */}
            <div className="panel p-4">
              <div className="label-caps text-[var(--ink-dim)]">Maillot domicile</div>
              <div className="mt-4 flex items-center justify-center py-4">
                <div className="relative h-28 w-20 rounded-sm border border-[var(--rule)] bg-gradient-to-b from-white/90 to-white/70 shadow-lg">
                  <div className="absolute inset-x-0 top-6 h-px bg-black/10" />
                  <div className="absolute inset-x-2 top-10 text-center text-[8px] font-bold text-black/40">
                    {displayName.slice(0, 8)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center text-[11px] text-[var(--ink-dim)]">HOME KIT</div>
            </div>

            <div className="panel flex flex-col p-4">
              <div className="label-caps text-[var(--ink-dim)]">Fondé</div>
              <div className="data-num mt-2 text-4xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl">
                {founded}
              </div>
              <div className="mt-auto border-t border-[var(--rule)] pt-3">
                <div className="label-caps text-[var(--ink-dim)]">Stade</div>
                <div className="mt-1 text-[14px] font-semibold text-[var(--ink)]">
                  {name.trim() ? `${name.trim()} Arena` : 'Nouveau stade'}
                </div>
              </div>
            </div>

            {/* Honour numbers */}
            <div className="panel grid grid-cols-3 gap-2 p-4 sm:col-span-2">
              {[
                { v: '0', l: 'Ligues' },
                { v: '0', l: 'Coupes' },
                { v: '0', l: 'Europe' },
              ].map((h) => (
                <div key={h.l} className="text-center">
                  <div className="data-num text-2xl font-medium text-[var(--ink)] sm:text-3xl">{h.v}</div>
                  <div className="mt-1 label-caps">{h.l}</div>
                </div>
              ))}
            </div>

            {/* Worth + Budget */}
            <div className="panel grid grid-cols-2 gap-4 p-4 sm:col-span-2">
              <div>
                <div className="label-caps text-[var(--ink-dim)]">Valeur club</div>
                <div className="data-num mt-1 text-xl font-medium text-[var(--ink)]">€12.4M</div>
              </div>
              <div>
                <div className="label-caps text-[var(--ink-dim)]">Budget transfert</div>
                <div className="data-num mt-1 text-xl font-medium text-[var(--brass)]">€2.8M</div>
              </div>
            </div>

            {/* Board expectations */}
            <div className="panel p-4 sm:col-span-2">
              <div className="label-caps text-[var(--ink-dim)]">Attentes du conseil</div>
              <div className="mt-2 text-[14px] font-semibold uppercase tracking-wide text-[var(--ink)]">
                Stabiliser le club et viser le milieu de tableau
              </div>
            </div>

            {/* Level tiles — FC26 style */}
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <LevelTile label="Base fans" level="Moyenne" tone="mid" />
              <LevelTile label="Centre formation" level="Bas" tone="low" />
              <LevelTile label="Stabilité financière" level="Élevée" tone="high" />
            </div>

            {/* Inputs integrated */}
            <div className="panel space-y-3 p-4 sm:col-span-2">
              <div className="label-caps text-[var(--brass)]">Identité</div>
              <Input
                required
                minLength={2}
                placeholder="Nom du club"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input placeholder="Nation" value={nation} onChange={(e) => setNation(e.target.value)} />
              {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
              <Button className="w-full py-3 text-[15px]" disabled={loading} type="submit">
                {loading ? '…' : 'Entrer sur le banc'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
