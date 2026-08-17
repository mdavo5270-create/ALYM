import { FormEvent, useState } from 'react';
import { AlymLogo, MylaMark } from '../components/Logo';
import { Button, Input, Panel } from '../components/ui';
import { useGame } from '../store/gameStore';

export function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6">
      <AlymLogo size={72} />
      <h1 className="mt-6 text-3xl font-semibold tracking-[0.2em] text-mist-50">ALYM</h1>
      <div className="mt-3">
        <MylaMark />
      </div>
    </div>
  );
}

export function Title() {
  const { setScreen, setAuthMode } = useGame();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6">
      <div className="animate-enter w-full max-w-md text-center">
        <AlymLogo size={64} className="mx-auto" />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-mist-50">ALYM</h1>
        <p className="mt-2 text-sm text-mist-400">Gestion de club · Carrière manager</p>
        <div className="mt-10 space-y-3">
          <Button
            className="w-full py-3"
            onClick={() => {
              setAuthMode('register');
              setScreen('auth');
            }}
          >
            Nouveau jeu
          </Button>
          <Button
            variant="secondary"
            className="w-full py-3"
            onClick={() => {
              setAuthMode('login');
              setScreen('auth');
            }}
          >
            Continuer
          </Button>
        </div>
        <div className="mt-12">
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
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <Panel className="animate-enter w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <AlymLogo size={40} />
          <div>
            <div className="text-lg font-semibold text-mist-50">{authMode === 'register' ? 'Créer un compte' : 'Connexion'}</div>
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
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? '…' : authMode === 'register' ? 'Créer' : 'Entrer'}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-xs text-mist-400">
          <button type="button" className="hover:text-mist-200" onClick={() => setScreen('title')}>
            Retour
          </button>
          <button
            type="button"
            className="hover:text-mist-200"
            onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
          >
            {authMode === 'register' ? 'Déjà un compte ?' : 'Créer un compte'}
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
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <Panel className="animate-enter w-full max-w-md p-6">
        <h1 className="text-lg font-semibold text-mist-50">Créer votre club</h1>
        <p className="mt-1 text-sm text-mist-400">Un nom, une nation — le reste se construit en jeu.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input required minLength={2} placeholder="Nom du club" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Nation" value={nation} onChange={(e) => setNation(e.target.value)} />
          {error && <p className="text-sm text-signal-bad">{error}</p>}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? '…' : 'Prendre les rênes'}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
