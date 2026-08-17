import { FormEvent, useState } from 'react';
import { AlymLogo, MylaMark } from '../components/Logo';
import { Button, Input, Panel } from '../components/ui';
import { useGame } from '../store/gameStore';

export function Splash() {
  return (
    <div className="stage-bg flex min-h-screen flex-col items-center justify-center px-6">
      <AlymLogo size={88} />
      <h1 className="mt-8 text-4xl font-semibold tracking-[0.28em] text-white">ALYM</h1>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
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
      <div className="animate-enter w-full max-w-2xl text-center">
        <AlymLogo size={72} className="mx-auto" />
        <h1 className="mt-6 text-5xl font-semibold tracking-[0.18em] text-white">ALYM</h1>
        <p className="mt-3 text-sm text-slate-400">Carrière manager · Monde vivant</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="panel-hero group border-sky-400/30 p-6 text-left transition hover:border-sky-400/60"
            onClick={() => {
              setAuthMode('register');
              setScreen('auth');
            }}
          >
            <div className="label-caps text-sky-300">Nouveau</div>
            <div className="mt-2 text-xl font-semibold text-white group-hover:text-sky-200">Carrière Live</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Créer un profil manager, prendre un club, défis et Manager Market.
            </p>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-sky-400">Commencer →</div>
          </button>
          <button
            type="button"
            className="panel group p-6 text-left transition hover:border-white/20"
            onClick={() => {
              setAuthMode('login');
              setScreen('auth');
            }}
          >
            <div className="label-caps">Continuer</div>
            <div className="mt-2 text-xl font-semibold text-white">Sauvegarde</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Reprendre une carrière existante et le fil de saison.
            </p>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Charger →</div>
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
            <div className="text-lg font-semibold text-white">
              {authMode === 'register' ? 'Profil manager' : 'Connexion carrière'}
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
            minLength={8}
            placeholder="Mot de passe (8+ · lettre + chiffre)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button className="w-full py-2.5" disabled={loading} type="submit">
            {loading ? '…' : authMode === 'register' ? 'Créer le profil' : 'Entrer en carrière'}
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <button type="button" className="hover:text-slate-200" onClick={() => setScreen('title')}>
            Retour
          </button>
          <button
            type="button"
            className="hover:text-slate-200"
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
      <div className="animate-enter w-full max-w-lg">
        <div className="mb-4 text-center">
          <div className="label-caps text-sky-300">Création de club</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Choisir votre club</h1>
          <p className="mt-1 text-sm text-slate-400">Identité, nation — le reste se construit en saison.</p>
        </div>
        <Panel className="p-6">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input required minLength={2} placeholder="Nom du club" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Nation" value={nation} onChange={(e) => setNation(e.target.value)} />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { l: 'Fanbase', v: 'Moyenne' },
                { l: 'Jeunes', v: 'Correct' },
                { l: 'Finances', v: 'Stable' },
              ].map((x) => (
                <div key={x.l} className="rounded-md border border-white/5 bg-black/20 px-2 py-2 text-center">
                  <div className="label-caps">{x.l}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-200">{x.v}</div>
                </div>
              ))}
            </div>
            <Button className="w-full py-2.5" disabled={loading} type="submit">
              {loading ? '…' : 'Prendre le poste'}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
