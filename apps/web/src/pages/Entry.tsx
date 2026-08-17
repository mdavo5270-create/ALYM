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
      <div className="animate-enter mx-auto w-full max-w-lg">
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
          STUDIO LA MYLA · 2026
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

export function CreateTeam() {
  const { createTeam, loading, error } = useGame();
  const [name, setName] = useState('');
  const [nation, setNation] = useState('France');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await createTeam(name, nation);
  }

  return (
    <div className="stage-bg flex min-h-screen items-center justify-center px-4">
      <Panel className="animate-enter w-full max-w-md p-7">
        <div className="mb-2 label-caps">Chapitre 1</div>
        <h1 className="type-display text-2xl text-[var(--ink)]">Nommer le club</h1>
        <p className="mt-2 text-[13px] text-[var(--ink-dim)]">
          Ce nom ouvrira la chronique. Choisis quelque chose qui tient la distance.
        </p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input required minLength={2} placeholder="Nom du club" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Nation" value={nation} onChange={(e) => setNation(e.target.value)} />
          {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? '…' : 'Entrer sur le banc'}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
