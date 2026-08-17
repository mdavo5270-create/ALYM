import { prisma } from './prisma.js';

const CLUB_SEED = [
  { name: 'Rosenborg BK', nation: 'Norway', reputation: 62, leagueTier: 1, vision: 'possession' },
  { name: 'Bodø/Glimt', nation: 'Norway', reputation: 68, leagueTier: 1, vision: 'high_press' },
  { name: 'Molde FK', nation: 'Norway', reputation: 60, leagueTier: 1, vision: 'counter' },
  { name: 'FC Victoria', nation: 'England', reputation: 55, leagueTier: 2, vision: 'wing_play' },
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roll() {
  return Math.random();
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

/** Simulate one matchday for AI clubs then run market logic */
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

  // reload
  const clubs2 = await prisma.aiClub.findMany({ include: { manager: true } });

  // 2) Firings
  for (const club of clubs2) {
    if (!club.manager) continue;
    if (club.jobSecurity < 25 && club.manager.seasonsAtClub >= 1 && roll() < 0.55) {
      const mgrName = club.manager.name;
      await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: null, jobSecurity: 40 } });
      await prisma.aiManager.update({
        where: { id: club.manager.id },
        data: { status: 'free', seasonsAtClub: 0 },
      });
      await logEvent('fired', club.name, mgrName, `${mgrName} licencié (${club.jobSecurity}% sécu).`);
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

  // 4) Interims for vacant clubs
  const vacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  const interims = await prisma.aiManager.findMany({
    where: { OR: [{ status: 'free' }, { status: 'interim' }], reputation: { lte: 35 } },
  });
  for (const club of vacant) {
    if (roll() > 0.5) continue;
    const interim =
      interims.find((i) => i.status === 'free') ||
      (await prisma.aiManager.findFirst({ where: { status: 'free', reputation: { lte: 40 } } }));
    if (!interim) continue;
    await prisma.aiClub.update({ where: { id: club.id }, data: { managerId: interim.id } });
    await prisma.aiManager.update({
      where: { id: interim.id },
      data: { status: 'interim', seasonsAtClub: 0 },
    });
    await logEvent('interim', club.name, interim.name, `${interim.name} en intérim à ${club.name}.`);
    headlines.push(`Intérim : ${interim.name} → ${club.name}`);
  }

  // 5) Permanent hirings
  const stillVacant = await prisma.aiClub.findMany({ where: { managerId: null } });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ['free', 'interim'] }, reputation: { gte: 40 } },
    orderBy: { reputation: 'desc' },
  });

  for (const club of stillVacant) {
    if (freeAgents.length === 0) break;
    // compatibility score
    const ranked = freeAgents
      .map((m) => {
        const repFit = 100 - Math.abs(m.reputation - club.reputation);
        const visionFit = m.preferredVision === club.tacticalVision ? 100 : 40;
        const nationFit = m.nation === club.nation ? 80 : 50;
        const noise = Math.floor(roll() * 20);
        const score = 0.35 * repFit + 0.25 * visionFit + 0.2 * nationFit + 0.2 * noise;
        return { m, score };
      })
      .sort((a, b) => b.score - a.score);

    const pick = ranked[0];
    if (!pick || pick.score < 35) continue;

    await prisma.aiClub.update({
      where: { id: club.id },
      data: {
        managerId: pick.m.id,
        tacticalVision: pick.m.preferredVision,
        jobSecurity: 65,
      },
    });
    await prisma.aiManager.update({
      where: { id: pick.m.id },
      data: { status: 'employed', seasonsAtClub: 1 },
    });
    // remove from freeAgents pool
    const idx = freeAgents.findIndex((f) => f.id === pick.m.id);
    if (idx >= 0) freeAgents.splice(idx, 1);

    await logEvent(
      'hired',
      club.name,
      pick.m.name,
      `${pick.m.name} nommé à ${club.name} (${pick.m.preferredVision}).`
    );
    headlines.push(`${pick.m.name} signe à ${club.name}`);
  }

  // 6) Age seasons slightly
  await prisma.aiManager.updateMany({
    where: { status: 'employed' },
    data: { seasonsAtClub: { increment: 0 } }, // no-op placeholder
  });
  // increment seasons every ~8 ticks probabilistically
  if (roll() < 0.12) {
    const employed = await prisma.aiManager.findMany({ where: { status: 'employed' } });
    for (const m of employed) {
      await prisma.aiManager.update({
        where: { id: m.id },
        data: { seasonsAtClub: m.seasonsAtClub + 1 },
      });
    }
  }

  // Notify player (max 2 headlines)
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

  return { headlines };
}
