import { prisma } from './prisma.js';

const CLUB_SEED = [
  { name: 'Rosenborg BK', nation: 'Norway', reputation: 62, leagueTier: 1, vision: 'possession' },
  { name: 'Bodø/Glimt', nation: 'Norway', reputation: 68, leagueTier: 1, vision: 'high_press' },
  { name: 'Molde FK', nation: 'Norway', reputation: 60, leagueTier: 1, vision: 'counter' },
  { name: 'FC London', nation: 'England', reputation: 55, leagueTier: 2, vision: 'wing_play' },
  { name: 'Olympique Nord', nation: 'France', reputation: 58, leagueTier: 2, vision: 'standard' },
  { name: 'Racing Atlético', nation: 'Spain', reputation: 64, leagueTier: 1, vision: 'possession' },
  { name: 'SV Rhein', nation: 'Germany', reputation: 57, leagueTier: 2, vision: 'high_press' },
  { name: 'AS Porta', nation: 'Italy', reputation: 61, leagueTier: 1, vision: 'park_bus' },
  { name: 'Celtic Youth', nation: 'Scotland', reputation: 52, leagueTier: 2, vision: 'wing_play' },
  { name: 'Lisboa United', nation: 'Portugal', reputation: 59, leagueTier: 2, vision: 'counter' },
  { name: 'Bruges Academy', nation: 'Belgium', reputation: 54, leagueTier: 2, vision: 'standard' },
  { name: 'Dynamo Est', nation: 'Poland', reputation: 48, leagueTier: 3, vision: 'park_bus' },
];

const MANAGER_SEED = [
  { name: 'Kjetil Askild', nation: 'Norway', reputation: 65, preferredVision: 'high_press' },
  { name: 'Marco Vialli', nation: 'Italy', reputation: 70, preferredVision: 'possession' },
  { name: 'Hans Berger', nation: 'Germany', reputation: 58, preferredVision: 'counter' },
  { name: 'Pierre Moreau', nation: 'France', reputation: 55, preferredVision: 'standard' },
  { name: 'Luis Ortega', nation: 'Spain', reputation: 72, preferredVision: 'possession' },
  { name: 'Tom Bradley', nation: 'England', reputation: 50, preferredVision: 'wing_play' },
  { name: 'Erik Nilsen', nation: 'Norway', reputation: 60, preferredVision: 'high_press' },
  { name: 'Giulia Rossi', nation: 'Italy', reputation: 48, preferredVision: 'park_bus' },
  { name: 'Jan Kowalski', nation: 'Poland', reputation: 42, preferredVision: 'standard' },
  { name: 'Sofia Mendes', nation: 'Portugal', reputation: 53, preferredVision: 'counter' },
  { name: 'Owen Clarke', nation: 'Scotland', reputation: 47, preferredVision: 'wing_play' },
  { name: 'Amine Benali', nation: 'France', reputation: 44, preferredVision: 'high_press' },
  { name: 'Interim Coach A', nation: 'International', reputation: 30, preferredVision: 'standard' },
  { name: 'Interim Coach B', nation: 'International', reputation: 28, preferredVision: 'park_bus' },
  { name: 'Free Agent X', nation: 'Brazil', reputation: 56, preferredVision: 'wing_play' },
];

/** Vision compatibility matrix */
const VISION_COMPAT: Record<string, string[]> = {
  possession: ['possession', 'standard', 'wing_play'],
  high_press: ['high_press', 'wing_play', 'standard'],
  counter: ['counter', 'park_bus', 'standard'],
  park_bus: ['park_bus', 'counter'],
  wing_play: ['wing_play', 'possession', 'high_press'],
  standard: ['standard', 'possession', 'counter', 'wing_play'],
};

const CRISIS_VISIONS = new Set(['park_bus', 'counter', 'standard']);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roll() {
  return Math.random();
}

function visionFitScore(clubVision: string, managerVision: string): number {
  if (clubVision === managerVision) return 100;
  const compat = VISION_COMPAT[clubVision] || [];
  if (compat.includes(managerVision)) return 65;
  return 20;
}

type ClubRow = {
  id: number;
  name: string;
  nation: string | null;
  reputation: number;
  tacticalVision: string;
  leagueTier: number;
  jobSecurity: number;
};

type MgrRow = {
  id: number;
  name: string;
  nation: string | null;
  reputation: number;
  preferredVision: string;
  status: string;
  seasonsAtClub: number;
};

/**
 * Score v2 — features calibrées + coût implicite
 * S = 0.28 repFit + 0.22 visionFit + 0.15 formNeed
 *   + 0.12 tierFit + 0.10 availability + 0.08 nationFit
 *   + 0.05 stability - 0.10 costPenalty
 */
export function recruitmentScore(club: ClubRow, manager: MgrRow): number {
  const repFit = 100 - Math.abs(manager.reputation - club.reputation);

  const visionFit = visionFitScore(club.tacticalVision, manager.preferredVision);

  // Club en crise préfère profils stabilisateurs
  let formNeed = 50;
  if (club.jobSecurity < 40) {
    formNeed = CRISIS_VISIONS.has(manager.preferredVision) ? 90 : 35;
    if (manager.reputation >= 55) formNeed += 8;
  } else if (club.jobSecurity > 75) {
    formNeed = manager.preferredVision === 'high_press' || manager.preferredVision === 'possession' ? 80 : 55;
  }

  // Coach trop fort pour un petit club = moins de fit (ambition)
  const tierTarget = club.leagueTier === 1 ? 62 : club.leagueTier === 2 ? 50 : 40;
  const tierFit = 100 - Math.min(40, Math.abs(manager.reputation - tierTarget));

  const availability =
    manager.status === 'free' ? 100 : manager.status === 'interim' ? 70 : 40;

  const nationFit =
    manager.nation && club.nation && manager.nation === club.nation
      ? 90
      : manager.nation === 'International'
        ? 55
        : 45;

  // Fidélité passée (si déjà employé longtemps ailleurs = stable)
  const stability = clamp(manager.seasonsAtClub * 12, 0, 60) + 40;

  // Coût implicite : coach bien au-dessus du niveau club
  const overqualified = Math.max(0, manager.reputation - club.reputation - 8);
  const costPenalty = clamp(overqualified * 3, 0, 80);

  const S =
    0.28 * repFit +
    0.22 * visionFit +
    0.15 * formNeed +
    0.12 * tierFit +
    0.1 * availability +
    0.08 * nationFit +
    0.05 * stability -
    0.1 * costPenalty;

  return S;
}

/** Soft-max sampling — temperature basse = plus déterministe */
function softMaxPick<T extends { score: number }>(items: T[], temperature = 0.35): T | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];
  const maxS = Math.max(...items.map((i) => i.score));
  const weights = items.map((i) => Math.exp((i.score - maxS) / (12 * temperature)));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = roll() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Matching global greedy multi-clubs avec soft-max local top-k */
function matchClubsToManagers(
  clubs: ClubRow[],
  managers: MgrRow[],
  minScore = 38
): { clubId: number; managerId: number; score: number }[] {
  type Pair = { clubId: number; managerId: number; score: number; clubName: string; mgrName: string };
  const pairs: Pair[] = [];

  for (const c of clubs) {
    for (const m of managers) {
      const score = recruitmentScore(c, m);
      if (score >= minScore) {
        pairs.push({
          clubId: c.id,
          managerId: m.id,
          score,
          clubName: c.name,
          mgrName: m.name,
        });
      }
    }
  }

  // Trier par score décroissant pour ordre de priorité marché
  pairs.sort((a, b) => b.score - a.score);

  const usedClubs = new Set<number>();
  const usedMgrs = new Set<number>();
  const assignments: { clubId: number; managerId: number; score: number }[] = [];

  // Pour chaque club encore libre, prendre top-5 candidats libres via soft-max
  const clubOrder = [...new Set(pairs.map((p) => p.clubId))];
  for (const clubId of clubOrder) {
    if (usedClubs.has(clubId)) continue;
    const candidates = pairs
      .filter((p) => p.clubId === clubId && !usedMgrs.has(p.managerId))
      .slice(0, 5);
    if (candidates.length === 0) continue;

    const pick = softMaxPick(candidates, 0.35);
    if (!pick) continue;

    usedClubs.add(pick.clubId);
    usedMgrs.add(pick.managerId);
    assignments.push({
      clubId: pick.clubId,
      managerId: pick.managerId,
      score: pick.score,
    });
  }

  return assignments;
}

export async function ensureManagerMarketSeed() {
  const count = await prisma.aiClub.count();
  if (count > 0) return;

  const managers = [];
  for (const m of MANAGER_SEED) {
    managers.push(
      await prisma.aiManager.create({
        data: {
          name: m.name,
          nation: m.nation,
          reputation: m.reputation,
          preferredVision: m.preferredVision,
          status: 'free',
        },
      })
    );
  }

  for (let i = 0; i < CLUB_SEED.length; i++) {
    const c = CLUB_SEED[i];
    const mgr = managers[i] ?? null;
    await prisma.aiClub.create({
      data: {
        name: c.name,
        nation: c.nation,
        reputation: c.reputation,
        leagueTier: c.leagueTier,
        tacticalVision: c.vision,
        jobSecurity: 55 + Math.floor(Math.random() * 30),
        managerId: mgr?.id,
      },
    });
    if (mgr) {
      await prisma.aiManager.update({
        where: { id: mgr.id },
        data: { status: 'employed', seasonsAtClub: 1 + Math.floor(Math.random() * 3) },
      });
    }
  }
}

async function logEvent(type: string, clubName: string, managerName?: string, detail?: string) {
  await prisma.managerMarketEvent.create({
    data: { type, clubName, managerName, detail },
  });
}

export async function tickManagerMarket(playerTeamId?: number) {
  await ensureManagerMarketSeed();

  const clubs = await prisma.aiClub.findMany({ include: { manager: true } });
  const headlines: string[] = [];

  // 1) Simulate results → job security
  for (const club of clubs) {
    const r = roll();
    let result: 'W' | 'D' | 'L' = 'D';
    if (r < 0.38) result = 'W';
    else if (r > 0.68) result = 'L';

    let js = club.jobSecurity;
    let wins = club.wins;
    let draws = club.draws;
    let losses = club.losses;
    if (result === 'W') {
      wins += 1;
      js += club.leagueTier === 1 ? 3 : 4;
    } else if (result === 'D') {
      draws += 1;
      js += 1;
    } else {
      losses += 1;
      js -= club.leagueTier === 1 ? 7 : 5;
    }
    js = clamp(js, 5, 99);

    await prisma.aiClub.update({
      where: { id: club.id },
      data: { jobSecurity: js, wins, draws, losses },
    });
  }

  const clubs2 = await prisma.aiClub.findMany({ include: { manager: true } });

  // 2) Firings
  for (const club of clubs2) {
    if (!club.manager) continue;
    if (club.jobSecurity < 38 && club.manager.seasonsAtClub >= 1 && roll() < 0.42) {
      const mgrName = club.manager.name;
      await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: null, jobSecurity: 40 } });
      await prisma.aiManager.update({
        where: { id: club.manager.id },
        data: { status: 'free', seasonsAtClub: 0 },
      });
      await logEvent('fired', club.name, mgrName, `${mgrName} licencié (sécuité critique).`);
      headlines.push(`${mgrName} viré de ${club.name}`);
    }
  }

  // 3) Voluntary exits
  const clubs3 = await prisma.aiClub.findMany({ include: { manager: true } });
  for (const club of clubs3) {
    if (!club.manager) continue;
    const m = club.manager;
    if (m.seasonsAtClub >= 4 && m.reputation > club.reputation + 12 && roll() < 0.25) {
      await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: null } });
      await prisma.aiManager.update({
        where: { id: m.id },
        data: { status: 'free', seasonsAtClub: 0 },
      });
      await logEvent('left', club.name, m.name, `${m.name} quitte ${club.name} volontairement.`);
      headlines.push(`${m.name} quitte ${club.name}`);
    }
  }

  // 4) Interims for vacant (low-rep only, temporary)
  const vacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  for (const club of vacant) {
    if (roll() > 0.45) continue;
    const interim = await prisma.aiManager.findFirst({
      where: { status: 'free', reputation: { lte: 35 } },
      orderBy: { reputation: 'asc' },
    });
    if (!interim) continue;
    await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: interim.id } });
    await prisma.aiManager.update({
      where: { id: interim.id },
      data: { status: 'interim', seasonsAtClub: 0 },
    });
    await logEvent('interim', club.name, interim.name, `${interim.name} en intérim à ${club.name}.`);
    headlines.push(`Intérim : ${interim.name} → ${club.name}`);
  }

  // 5) Permanent hirings — score v2 + matching multi-clubs + soft-max
  const stillVacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ['free', 'interim'] }, reputation: { gte: 40 } },
  });

  const assignments = matchClubsToManagers(
    stillVacant.map((c) => ({
      id: c.id,
      name: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      leagueTier: c.leagueTier,
      jobSecurity: c.jobSecurity,
    })),
    freeAgents.map((m) => ({
      id: m.id,
      name: m.name,
      nation: m.nation,
      reputation: m.reputation,
      preferredVision: m.preferredVision,
      status: m.status,
      seasonsAtClub: m.seasonsAtClub,
    })),
    38
  );

  for (const a of assignments) {
    const club = stillVacant.find((c) => c.id === a.clubId)!;
    const mgr = freeAgents.find((m) => m.id === a.managerId)!;

    await prisma.aiClub.update({
      where: { id: club.id },
      data: {
        managerId: mgr.id,
        tacticalVision: mgr.preferredVision,
        jobSecurity: 65,
      },
    });
    await prisma.aiManager.update({
      where: { id: mgr.id },
      data: { status: 'employed', seasonsAtClub: 1 },
    });

    await logEvent(
      'hired',
      club.name,
      mgr.name,
      `${mgr.name} nommé à ${club.name} (score ${a.score.toFixed(1)}, ${mgr.preferredVision}).`
    );
    headlines.push(`${mgr.name} signe à ${club.name}`);
  }

  // 6) Age seasons occasionally
  if (roll() < 0.12) {
    const employed = await prisma.aiManager.findMany({ where: { status: 'employed' } });
    for (const m of employed) {
      await prisma.aiManager.update({
        where: { id: m.id },
        data: { seasonsAtClub: m.seasonsAtClub + 1 },
      });
    }
  }

  if (playerTeamId && headlines.length > 0) {
    const pick = headlines.slice(0, 2).join(' · ');
    await prisma.message.create({
      data: {
        teamId: playerTeamId,
        sender: 'MANAGER MARKET',
        title: 'Mouvements d’entraîneurs',
        content: pick,
      },
    });
  }

  // Toujours un signal monde si rien de majeur n'a bougé
  if (headlines.length === 0 && clubs.length) {
    const c = clubs[Math.floor(Math.random() * clubs.length)];
    const form = `${c.wins}V-${c.draws}N-${c.losses}D`;
    headlines.push(`${c.name} (${form}) · vision ${c.tacticalVision}`);
  }

  return { headlines, assignments: assignments.length };

}
