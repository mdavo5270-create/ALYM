import { FormEvent, useState } from 'react';
import { AlymLogo, MylaMark } from '../components/Logo';
import { Button, Input, Panel } from '../components/ui';
import { useGame } from '../store/gameStore';

export function Splash() {
  return (
    <div className="stage-bg flex min-h-screen flex-col items-center justify-center px-6">
      <AlymLogo size={80} />
      <h1 className="mt-8 text-4xl font-semibold tracking-[0.28em] text-mist-50">ALYM</h1>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-mist-400">
        Athletic League Youth Manager
      </p>
      <div className="mt-10">
        <MylaMark />
      </div>
    </div>
  );
}

export function Title() {
  const { setScreen, setAuthMode } = useGame();
  return (
    <div className="stage-bg flex min-h-screen flex-col items-center justify-center px-6">
      <div className="animate-enter w-full max-w-lg text-center">
        <AlymLogo size={72} className="mx-auto" />
        <h1 className="mt-6 text-5xl font-semibold tracking-[0.18em] text-mist-50">ALYM</h1>
        <p className="mt-3 text-sm text-mist-400">Carrière manager · Monde vivant</p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="panel-hero group p-5 text-left transition hover:border-brass-500/40"
            onClick={() => {
              setAuthMode('register');
              setScreen('auth');
            }}
          >
            <div className="label-caps text-brass-300">Nouveau</div>
            <div className="mt-2 text-lg font-semibold text-mist-50 group-hover:text-brass-300">Carrière</div>
            <p className="mt-1 text-xs text-mist-400">Créer un compte et prendre un club</p>
          </button>
          <button
            type="button"
            className="panel group p-5 text-left transition hover:border-white/15"
            onClick={() => {
              setAuthMode('login');
              setScreen('auth');
            }}
          >
            <div className="label-caps">Continuer</div>
            <div className="mt-2 text-lg font-semibold text-mist-50">Sauvegarde</div>
            <p className="mt-1 text-xs text-mist-400">Reprendre une carrière existante</p>
          </button>
        </div>

        <div className="mt-14">
          <MylaMark />
        </div>
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
        <div className="mb-6 flex items-center gap-3">
          <AlymLogo size={44} />
          <div>
            <div className="text-lg font-semibold text-mist-50">
              {authMode === 'register' ? 'Créer un profil manager' : 'Connexion'}
            </div>
            <MylaMark />
          </div>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
          {authMode === 'register' && (
            <Input placeholder="Nom d'affichage (optionnel)" value={username} onChange={(e) => setUsername(e.target.value)} />
          )}
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type="password"
            required
            minLength={6}
            placeholder="Mot de passe (6+ caractères)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-signal-bad">{error}</p>}
          <Button className="w-full py-2.5" disabled={loading} type="submit">
            {loading ? '…' : authMode === 'register' ? 'Créer le profil' : 'Entrer en carrière'}
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-xs text-mist-400">
          <button type="button" className="hover:text-mist-200" onClick={() => setScreen('title')}>
            Retour
          </button>
          <button
            type="button"
            className="hover:text-mist-200"
            onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
          >
            {authMode === 'register' ? 'Déjà un compte ?' : 'Créer un profil'}
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
        <div className="label-caps text-brass-300">Création de club</div>
        <h1 className="mt-2 text-xl font-semibold text-mist-50">Prendre les rênes</h1>
        <p className="mt-1 text-sm text-mist-400">Nom, nation — le reste se construit en saison.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input required minLength={2} placeholder="Nom du club" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Nation" value={nation} onChange={(e) => setNation(e.target.value)} />
          {error && <p className="text-sm text-signal-bad">{error}</p>}
          <Button className="w-full py-2.5" disabled={loading} type="submit">
            {loading ? '…' : 'Lancer la carrière'}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
