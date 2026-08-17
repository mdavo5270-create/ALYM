const TACTICAL_VISIONS = [
  { id: "standard", name: "Standard", desc: "\xC9quilibre construction / solidit\xE9" },
  { id: "possession", name: "Possession", desc: "Close support, contr\xF4le du tempo" },
  { id: "high_press", name: "High Pressing", desc: "Pressing haut, r\xE9cup\xE9ration rapide" },
  { id: "counter", name: "Counter Attack", desc: "Bloc bas, transitions verticales" },
  { id: "wing_play", name: "Wing Play", desc: "Largeur et centres" },
  { id: "park_bus", name: "Park The Bus", desc: "D\xE9fense profonde, minimalisme" }
];
function defaultBoardObjectives(wins = 0, budget = 2e5) {
  return [
    { code: "wins", label: "Remporter 10 matchs", target: 10, current: wins, weight: 40 },
    { code: "budget", label: "Rester solvable (> \xA350k)", target: 5e4, current: budget, weight: 25 },
    { code: "squad", label: "Maintenir 14 joueurs min.", target: 14, current: 14, weight: 15 },
    { code: "youth", label: "Promouvoir 1 jeune", target: 1, current: 0, weight: 20 }
  ];
}
function computeJobSecurity(objectives, form) {
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
function rollUnexpectedEvent(rng = Math.random) {
  if (rng() > 0.35) return null;
  const pool = [
    {
      id: "injury_star",
      category: "player",
      title: "Blessure d\u2019un titulaire",
      body: "Un joueur cl\xE9 ressent une douleur \xE0 l\u2019entra\xEEnement. Le staff m\xE9dical demande une d\xE9cision.",
      choices: [
        { id: "rest", label: "Le reposer 2 matchs", effect: "morale_up" },
        { id: "force", label: "Le forcer \xE0 jouer", effect: "risk_injury" },
        { id: "medical", label: "Investir en soins (+\xA35k)", effect: "pay_5k" }
      ]
    },
    {
      id: "board_funds",
      category: "board",
      title: "Injection de fonds",
      body: "Le board propose une enveloppe exceptionnelle si tu promets le top 6.",
      choices: [
        { id: "accept", label: "Accepter (+\xA340k, objectif durci)", effect: "bonus_40k" },
        { id: "refuse", label: "Refuser (ind\xE9pendance)", effect: "none" }
      ]
    },
    {
      id: "fans_pressure",
      category: "fans",
      title: "Pression des supporters",
      body: "Les tribunes r\xE9clament plus de spectacle. Les m\xE9dias amplifient la critique.",
      choices: [
        { id: "attack", label: "Passer en High Pressing", effect: "vision_press" },
        { id: "ignore", label: "Ignorer et tenir le plan", effect: "job_down" },
        { id: "pr", label: "Conf\xE9rence apaisante", effect: "morale_up" }
      ]
    },
    {
      id: "media_rumor",
      category: "media",
      title: "Rumeur de mercato",
      body: "Un journal annonce l\u2019int\xE9r\xEAt d\u2019un grand club pour ton meilleur joueur.",
      choices: [
        { id: "sell", label: "\xC9couter les offres", effect: "open_sell" },
        { id: "block", label: "Bloquer tout d\xE9part", effect: "morale_mixed" }
      ]
    }
  ];
  return pool[Math.floor(rng() * pool.length)];
}
const FIRST = ["Yanis", "Hugo", "Amine", "L\xE9o", "Noa", "Ilyes", "Sacha", "Eden", "Rayan", "Ma\xEBl"];
const LAST = ["Moreau", "Petit", "Garcia", "Bernard", "Roux", "Faure", "Garnier", "Chevalier"];
function generateYouthProspect(nation = "France") {
  const name = `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`;
  const positions = ["GK", "DF", "MF", "FW"];
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
    potential: pot
  };
}
export {
  TACTICAL_VISIONS,
  computeJobSecurity,
  defaultBoardObjectives,
  generateYouthProspect,
  rollUnexpectedEvent
};
