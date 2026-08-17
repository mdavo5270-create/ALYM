import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  const transactions = await prisma.transaction.findMany({
    where: { teamId },
    orderBy: { transactionDate: 'desc' },
    take: 30,
  });

  const weeklySalaries = team.players.reduce((s, p) => s + p.salary, 0);
  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  res.json({
    budget: team.budget,
    gold: team.goldBalance,
    weeklySalaries,
    income,
    expenses,
    transactions,
  });
});

export default router;
