import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(2).max(40),
  nation: z.string().min(2).max(40).optional(),
  stadiumName: z.string().min(2).max(60).optional(),
  badgeDesign: z.number().int().min(0).max(20).optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { userId: req.user!.userId },
    include: {
      _count: { select: { players: true, messages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ teams });
});

router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.team.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ error: 'Ce nom d’équipe existe déjà' });
  }

  const team = await prisma.team.create({
    data: {
      userId: req.user!.userId,
      name: parsed.data.name,
      nation: parsed.data.nation ?? 'France',
      stadiumName: parsed.data.stadiumName ?? `Stade ${parsed.data.name}`,
      badgeDesign: parsed.data.badgeDesign ?? 0,
      budget: 200000,
      goldBalance: 250,
    },
  });

  // Message de bienvenue
  await prisma.message.create({
    data: {
      teamId: team.id,
      sender: 'DIRECTION DU CLUB',
      title: 'Bienvenue',
      content: `Bienvenue à ${team.name} ! Votre budget de saison est de £200,000. Bonne chance.`,
    },
  });

  res.status(201).json({ team });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findFirst({
    where: { id, userId: req.user!.userId },
    include: {
      players: true,
      messages: { orderBy: { messageDate: 'desc' }, take: 20 },
      _count: { select: { players: true } },
    },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  res.json({ team });
});

export default router;
