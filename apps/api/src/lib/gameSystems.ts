/** Systèmes inspirés FC 26 Manager — LA MYLA */

export const TACTICAL_VISIONS = [
  { id: 'standard', name: 'Standard', desc: 'Équilibre construction / solidité' },
  { id: 'possession', name: 'Possession', desc: 'Close support, contrôle du tempo' },
  { id: 'high_press', name: 'High Pressing', desc: 'Pressing haut, récupération rapide' },
  { id: 'counter', name: 'Counter Attack', desc: 'Bloc bas, transitions verticales' },
  { id: 'wing_play', name: 'Wing Play', desc: 'Largeur et centres' },
  { id: 'park_bus', name: 'Park The Bus', desc: 'Défense profonde, minimalisme' },
] as const;

export type TacticalVisionId = (typeof TACTICAL_VISIONS)[number]['id'];

export type BoardObjective = {
  code: string;
  label: string;
  target: number;
  current: number;
  weight: number; // impact job security
};

export function defaultBoardObjectives(wins = 0, budget = 200000): BoardObjective[] {
  return [
    { code: 'wins', label: 'Remporter 10 matchs', target: 10, current: wins, weight: 40 },
    { code: 'budget', label: 'Rester solvable (> £50k)', target: 50000, current: budget, weight: 25 },
    { code: 'squad', label: 'Maintenir 14 joueurs min.', target: 14, current: 14, weight: 15 },
    { code: 'youth', label: 'Promouvoir 1 jeune', target: 1, current: 0, weight: 20 },
  ];
}

export function computeJobSecurity(objectives: BoardObjective[], form: { w: number; d: number; l: number }) {
  let score = 55;
  for (const o of objectives) {
    const ratio = o.target === 0 ? 1 : Math.min(1, o.current / o.target);
    score += (ratio - 0.5) * o.weight * 0.4;
  }
  const played = form.w + form.d + form.l;
  if (played > 0) {
    const winRate = form.w / played;
    score += (winRate - 0.4) * 30;
  }
  return Math.max(5, Math.min(99, Math.round(score)));
}

export type UnexpectedEvent = {
  id: string;
  category: 'player' | 'board' | 'fans' | 'media';
  title: string;
  body: string;
  choices: { id: string; label: string; effect: string }[];
};

export function rollUnexpectedEvent(rng = Math.random): UnexpectedEvent | null {
  if (rng() > 0.35) return null; // ~35% chance after a match
  const pool: UnexpectedEvent[] = [
    {
      id: 'injury_star',
      category: 'player',
      title: 'Blessure d’un titulaire',
      body: 'Un joueur clé ressent une douleur à l’entraînement. Le staff médical demande une décision.',
      choices: [
        { id: 'rest', label: 'Le reposer 2 matchs', effect: 'morale_up' },
        { id: 'force', label: 'Le forcer à jouer', effect: 'risk_injury' },
        { id: 'medical', label: 'Investir en soins (+£5k)', effect: 'pay_5k' },
      ],
    },
    {
      id: 'board_funds',
      category: 'board',
      title: 'Injection de fonds',
      body: 'Le board propose une enveloppe exceptionnelle si tu promets le top 6.',
      choices: [
        { id: 'accept', label: 'Accepter (+£40k, objectif durci)', effect: 'bonus_40k' },
        { id: 'refuse', label: 'Refuser (indépendance)', effect: 'none' },
      ],
    },
    {
      id: 'fans_pressure',
      category: 'fans',
      title: 'Pression des supporters',
      body: 'Les tribunes réclament plus de spectacle. Les médias amplifient la critique.',
      choices: [
        { id: 'attack', label: 'Passer en High Pressing', effect: 'vision_press' },
        { id: 'ignore', label: 'Ignorer et tenir le plan', effect: 'job_down' },
        { id: 'pr', label: 'Conférence apaisante', effect: 'morale_up' },
      ],
    },
    {
      id: 'media_rumor',
      category: 'media',
      title: 'Rumeur de mercato',
      body: 'Un journal annonce l’intérêt d’un grand club pour ton meilleur joueur.',
      choices: [
        { id: 'sell', label: 'Écouter les offres', effect: 'open_sell' },
        { id: 'block', label: 'Bloquer tout départ', effect: 'morale_mixed' },
      ],
    },
  ];
  return pool[Math.floor(rng() * pool.length)];
}

const FIRST = ['Yanis', 'Hugo', 'Amine', 'Léo', 'Noa', 'Ilyes', 'Sacha', 'Eden', 'Rayan', 'Maël'];
const LAST = ['Moreau', 'Petit', 'Garcia', 'Bernard', 'Roux', 'Faure', 'Garnier', 'Chevalier'];

export function generateYouthProspect(nation = 'France') {
  const name = `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`;
  const positions = ['GK', 'DF', 'MF', 'FW'] as const;
  const position = positions[Math.floor(Math.random() * positions.length)];
  const pot = 65 + Math.floor(Math.random() * 25);
  const base = 45 + Math.floor(Math.random() * 15);
  return {
    name,
    position,
    nation,
    salary: 1500 + Math.floor(Math.random() * 2500),
    speed: base + Math.floor(Math.random() * 15),
    dribble: base + Math.floor(Math.random() * 15),
    shot: base + Math.floor(Math.random() * 12),
    pass: base + Math.floor(Math.random() * 15),
    defense: base + Math.floor(Math.random() * 15),
    physique: base + Math.floor(Math.random() * 12),
    potential: pot,
  };
}
