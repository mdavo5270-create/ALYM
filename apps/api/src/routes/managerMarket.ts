import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { ensureManagerMarketSeed, tickManagerMarket } from '../lib/managerMarket.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  await ensureManagerMarketSeed();

  const clubs = await prisma.aiClub.findMany({
    include: { manager: true },
    orderBy: { reputation: 'desc' },
  });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ['free', 'interim'] } },
    orderBy: { reputation: 'desc' },
  });
  const events = await prisma.managerMarketEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 25,
  });

  res.json({
    clubs: clubs.map((c) => ({
      id: c.id,
      name: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      leagueTier: c.leagueTier,
      jobSecurity: c.jobSecurity,
      record: `${c.wins}V ${c.draws}N ${c.losses}D`,
      manager: c.manager
        ? {
            name: c.manager.name,
            nation: c.manager.nation,
            reputation: c.manager.reputation,
            status: c.manager.status,
            preferredVision: c.manager.preferredVision,
            seasonsAtClub: c.manager.seasonsAtClub,
          }
        : null,
    })),
    freeAgents: freeAgents.map((m) => ({
      id: m.id,
      name: m.name,
      nation: m.nation,
      reputation: m.reputation,
      status: m.status,
      preferredVision: m.preferredVision,
    })),
    events,
  });
});

/** Manual tick for testing */
router.post('/tick', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  const result = await tickManagerMarket(teamId);
  res.json(result);
});

export default router;
