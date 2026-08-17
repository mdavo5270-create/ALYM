import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

async function assertTeam(userId: number, teamId: number) {
  return prisma.team.findFirst({ where: { id: teamId, userId } });
}

router.get('/', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await assertTeam(req.user!.userId, teamId);
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  const filter = req.query.filter as string | undefined;
  const where: { teamId: number; read?: boolean } = { teamId };
  if (filter === 'unread') where.read = false;
  if (filter === 'read') where.read = true;

  const messages = await prisma.message.findMany({
    where,
    orderBy: { messageDate: 'desc' },
  });
  res.json({ messages });
});

router.patch('/:messageId/read', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const messageId = Number(req.params.messageId);
  const team = await assertTeam(req.user!.userId, teamId);
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  const message = await prisma.message.updateMany({
    where: { id: messageId, teamId },
    data: { read: true },
  });
  if (message.count === 0) return res.status(404).json({ error: 'Message introuvable' });
  res.json({ ok: true });
});

export default router;
