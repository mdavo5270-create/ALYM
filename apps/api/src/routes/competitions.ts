import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureLeagueForTeam, getTable } from '../lib/league.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/table', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({ where: { id: teamId, userId: req.user!.userId } });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  await ensureLeagueForTeam(teamId, team.name);
  const table = await getTable(1);
  const me = table.find((r) => r.playerTeamId === teamId);

  res.json({
    competition: 'Super Ligue',
    season: 1,
    table,
    myRank: me?.rank ?? null,
    myRow: me ?? null,
  });
});

router.get('/overview', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({ where: { id: teamId, userId: req.user!.userId } });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  await ensureLeagueForTeam(teamId, team.name);
  const table = await getTable(1);
  res.json({
    competitions: [
      {
        id: 'super_ligue_1',
        name: 'Super Ligue',
        type: 'league',
        season: 1,
        teams: table.length,
        leader: table[0]?.teamName ?? '—',
        myRank: table.find((r) => r.playerTeamId === teamId)?.rank ?? null,
      },
    ],
  });
});

export default router;
