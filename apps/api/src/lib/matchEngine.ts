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

export function simulateMatch(
  home: TeamStrength,
  away: TeamStrength,
  homeBonus = 1.08
) {
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

  return { homeScore, awayScore, result, prize, homeLambda, awayLambda };
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
