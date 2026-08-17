/**
 * ALYM Chronicle Mode — le club comme récit
 * Chaque décision / match / crise devient une ligne d'histoire.
 */
import { prisma } from './prisma.js';

export type ChronicleType =
  | 'kickoff'
  | 'match'
  | 'event'
  | 'transfer'
  | 'board'
  | 'youth'
  | 'market'
  | 'challenge'
  | 'season';

export type ChronicleTone = 'triumph' | 'setback' | 'tension' | 'hope' | 'neutral' | 'turning';

export type ChronicleEntryDto = {
  id: string;
  season: number;
  week: number;
  type: string;
  tone: string;
  headline: string;
  body: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

async function weekForTeam(teamId: number): Promise<{ season: number; week: number }> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { wins: true, draws: true, losses: true },
  });
  const played = (team?.wins ?? 0) + (team?.draws ?? 0) + (team?.losses ?? 0);
  return { season: 1, week: Math.max(1, played) };
}

export async function writeChronicle(
  teamId: number,
  data: {
    type: ChronicleType;
    tone?: ChronicleTone;
    headline: string;
    body: string;
    meta?: Record<string, unknown>;
    season?: number;
    week?: number;
  }
): Promise<ChronicleEntryDto> {
  const { season, week } = data.season != null && data.week != null
    ? { season: data.season, week: data.week }
    : await weekForTeam(teamId);

  const row = await prisma.chronicleEntry.create({
    data: {
      teamId,
      season,
      week,
      type: data.type,
      tone: data.tone ?? 'neutral',
      headline: data.headline.slice(0, 160),
      body: data.body.slice(0, 800),
      metaJson: data.meta ? JSON.stringify(data.meta) : null,
    },
  });

  return {
    id: row.id,
    season: row.season,
    week: row.week,
    type: row.type,
    tone: row.tone,
    headline: row.headline,
    body: row.body,
    meta: row.metaJson ? (JSON.parse(row.metaJson) as Record<string, unknown>) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listChronicle(
  teamId: number,
  opts?: { season?: number; limit?: number }
): Promise<ChronicleEntryDto[]> {
  const rows = await prisma.chronicleEntry.findMany({
    where: {
      teamId,
      ...(opts?.season != null ? { season: opts.season } : {}),
    },
    orderBy: [{ season: 'desc' }, { week: 'desc' }, { createdAt: 'desc' }],
    take: opts?.limit ?? 40,
  });

  return rows.map((row) => ({
    id: row.id,
    season: row.season,
    week: row.week,
    type: row.type,
    tone: row.tone,
    headline: row.headline,
    body: row.body,
    meta: row.metaJson ? (JSON.parse(row.metaJson) as Record<string, unknown>) : null,
    createdAt: row.createdAt.toISOString(),
  }));
}

/** Compilation fin de saison — les 12 faits marquants */
export async function seasonReview(teamId: number, season = 1) {
  const entries = await listChronicle(teamId, { season, limit: 100 });
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;

  const scored = entries.map((e) => {
    let score = 1;
    if (e.tone === 'triumph' || e.tone === 'turning') score += 3;
    if (e.tone === 'setback' || e.tone === 'tension') score += 2;
    if (e.type === 'match' && e.tone === 'triumph') score += 1;
    if (e.type === 'event') score += 1;
    return { ...e, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const highlights = scored.slice(0, 12);

  const played = team.wins + team.draws + team.losses;
  const narrative =
    team.wins >= team.losses + 2
      ? `Saison ${season} : ${team.name} a imposé son rythme (${team.wins}V-${team.draws}N-${team.losses}D). Le conseil retient une ligne claire.`
      : team.losses > team.wins
        ? `Saison ${season} : le chemin a été rude pour ${team.name}. ${team.losses} défaites ont pesé — mais le récit n’est pas fini.`
        : `Saison ${season} : équilibre fragile pour ${team.name}. ${played} matchs, autant de décisions qui restent dans la mémoire du club.`;

  return {
    season,
    teamName: team.name,
    record: { wins: team.wins, draws: team.draws, losses: team.losses, played },
    jobSecurity: team.jobSecurity,
    tacticalVision: team.tacticalVision,
    narrative,
    highlights,
    totalEntries: entries.length,
  };
}

/** Templates narratifs post-match */
export function matchChronicleText(
  teamName: string,
  opponent: string,
  homeScore: number,
  awayScore: number,
  result: 'W' | 'D' | 'L'
): { tone: ChronicleTone; headline: string; body: string } {
  if (result === 'W') {
    return {
      tone: 'triumph',
      headline: `Victoire ${homeScore}–${awayScore} face à ${opponent}`,
      body: `${teamName} s’impose. Le vestiaire respire ; le conseil note les trois points. La semaine s’écrit en vert.`,
    };
  }
  if (result === 'D') {
    return {
      tone: 'neutral',
      headline: `Nul ${homeScore}–${awayScore} contre ${opponent}`,
      body: `Partage des points. Ni sacre ni crise — mais le fil de la saison s’allonge sans soulager la pression.`,
    };
  }
  return {
    tone: 'setback',
    headline: `Défaite ${homeScore}–${awayScore} contre ${opponent}`,
    body: `${teamName} plie. Les questions remontent plus vite que les jambes. Le prochain match ne sera pas seulement sportif.`,
  };
}
