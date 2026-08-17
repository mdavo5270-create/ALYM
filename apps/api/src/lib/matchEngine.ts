type TeamStrength = { attack: number; midfield: number; defense: number; gk: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function poisson(lambda: number) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function strengthFromPlayers(
  players: {
    position: string;
    speed: number;
    dribble: number;
    shot: number;
    pass: number;
    defense: number;
    physique: number;
  }[]
): TeamStrength {
  if (players.length === 0) return { attack: 50, midfield: 50, defense: 50, gk: 50 };

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 50);

  const gk = players.filter((p) => p.position === 'GK');
  const df = players.filter((p) => p.position === 'DF');
  const mf = players.filter((p) => p.position === 'MF');
  const fw = players.filter((p) => p.position === 'FW');

  return {
    gk: avg(gk.map((p) => (p.defense + p.physique + p.speed) / 3)),
    defense: avg(df.map((p) => (p.defense + p.physique + p.pass) / 3)),
    midfield: avg(mf.map((p) => (p.pass + p.dribble + p.speed) / 3)),
    attack: avg(fw.map((p) => (p.shot + p.dribble + p.speed) / 3)),
  };
}

export type MatchEvent = {
  minute: number;
  type: 'goal' | 'yellow' | 'sub' | 'chance';
  side: 'home' | 'away';
  label: string;
};

function buildTimeline(
  homeScore: number,
  awayScore: number,
  homeName: string,
  awayName: string
): MatchEvent[] {
  const events: MatchEvent[] = [];
  for (let i = 0; i < homeScore; i++) {
    events.push({
      minute: 8 + Math.floor(Math.random() * 80),
      type: 'goal',
      side: 'home',
      label: `But — ${homeName}`,
    });
  }
  for (let i = 0; i < awayScore; i++) {
    events.push({
      minute: 8 + Math.floor(Math.random() * 80),
      type: 'goal',
      side: 'away',
      label: `But — ${awayName}`,
    });
  }
  const extras = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < extras; i++) {
    const types: MatchEvent['type'][] = ['yellow', 'sub', 'chance'];
    const type = types[Math.floor(Math.random() * types.length)];
    const side = Math.random() > 0.5 ? 'home' : 'away';
    const labels = {
      yellow: 'Carton jaune',
      sub: 'Remplacement',
      chance: 'Occasion nette',
    };
    events.push({
      minute: 10 + Math.floor(Math.random() * 75),
      type,
      side,
      label: labels[type],
    });
  }
  return events.sort((a, b) => a.minute - b.minute);
}

export function simulateMatch(home: TeamStrength, away: TeamStrength, homeBonus = 1.08) {
  const homeAtt = ((home.attack + home.midfield) / 2) * homeBonus;
  const awayAtt = (away.attack + away.midfield) / 2;
  const homeDef = (home.defense + home.gk) / 2;
  const awayDef = (away.defense + away.gk) / 2;

  const homeLambda = clamp((homeAtt / Math.max(awayDef, 30)) * 1.35, 0.3, 4.2);
  const awayLambda = clamp((awayAtt / Math.max(homeDef, 30)) * 1.15, 0.2, 3.8);

  const homeScore = poisson(homeLambda);
  const awayScore = poisson(awayLambda);

  let result: 'W' | 'D' | 'L' = 'D';
  if (homeScore > awayScore) result = 'W';
  if (homeScore < awayScore) result = 'L';

  const prize = result === 'W' ? 25000 : result === 'D' ? 10000 : 4000;

  const possessionHome = clamp(
    Math.round(48 + (home.midfield - away.midfield) * 0.6 + (Math.random() * 8 - 4)),
    35,
    68
  );

  return {
    homeScore,
    awayScore,
    result,
    prize,
    homeLambda,
    awayLambda,
    stats: {
      possessionHome,
      possessionAway: 100 - possessionHome,
      shotsHome: homeScore + 2 + Math.floor(Math.random() * 6),
      shotsAway: awayScore + 1 + Math.floor(Math.random() * 5),
      shotsOnHome: homeScore + Math.floor(Math.random() * 3),
      shotsOnAway: awayScore + Math.floor(Math.random() * 2),
    },
  };
}

export function withTimeline(
  sim: ReturnType<typeof simulateMatch>,
  homeName: string,
  awayName: string
) {
  return {
    ...sim,
    timeline: buildTimeline(sim.homeScore, sim.awayScore, homeName, awayName),
  };
}

export function randomOpponentName() {
  const names = [
    'Rosenborg',
    'Bodø/Glimt',
    'Molde FK',
    'Brann',
    'Viking FK',
    'Strømsgodset',
    'Odd BK',
    'Tromsø IL',
    'Haugesund',
    'Sandefjord',
    'FC Victoria',
    'Olympique Nord',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

export function randomOpponentStrength(): TeamStrength {
  const base = 55 + Math.random() * 20;
  return {
    attack: base + Math.random() * 10,
    midfield: base + Math.random() * 10,
    defense: base + Math.random() * 10,
    gk: base + Math.random() * 8,
  };
}
