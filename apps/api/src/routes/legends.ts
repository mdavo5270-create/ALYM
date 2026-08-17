import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { LEGENDS } from '../lib/legends.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { achievements: true, players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  const codes = new Set(team.achievements.map((a) => a.achievementCode));
  const hasChallengeWin = codes.has('challenge_won') || team.wins >= 3;

  const list = LEGENDS.map((l) => {
    const unlocked =
      l.unlock === 'challenge_won'
        ? hasChallengeWin
        : codes.has(l.unlock) || (l.unlock === 'first_win' && team.wins >= 1);
    const owned = team.players.some((p) => p.isLegend && p.name === l.name);
    return { ...l, unlocked, owned };
  });

  res.json({ legends: list });
});

router.post('/recruit/:code', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const code = (req.params as Record<string, string>).code;
  const legend = LEGENDS.find((l) => l.code === code);
  if (!legend) return res.status(404).json({ error: 'Légende introuvable' });

  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { achievements: true, players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  if (team.players.length >= 16) return res.status(400).json({ error: 'Effectif plein' });
  if (team.players.some((p) => p.isLegend && p.name === legend.name)) {
    return res.status(400).json({ error: 'Déjà dans l’effectif' });
  }

  const codes = new Set(team.achievements.map((a) => a.achievementCode));
  const unlocked =
    legend.unlock === 'challenge_won'
      ? team.wins >= 3 || codes.has('challenge_won')
      : codes.has(legend.unlock) || (legend.unlock === 'first_win' && team.wins >= 1);
  if (!unlocked) return res.status(403).json({ error: 'Légende non débloquée' });

  const cost = 80000;
  if (team.budget < cost) return res.status(400).json({ error: 'Budget insuffisant (£80,000)' });

  const s = legend.stats;
  const player = await prisma.player.create({
    data: {
      teamId,
      name: legend.name,
      position: legend.position,
      nation: legend.nation,
      salary: legend.salary,
      speed: s.speed,
      dribble: s.dribble,
      shot: s.shot,
      pass: s.pass,
      defense: s.defense,
      physique: s.physique,
      potential: 95,
      isLegend: true,
      isYouth: false,
      contractUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    },
  });

  await prisma.team.update({ where: { id: teamId }, data: { budget: team.budget - cost } });
  await prisma.transaction.create({
    data: {
      teamId,
      type: 'legend_in',
      amount: -cost,
      reason: `Recrutement légende ${legend.name}`,
    },
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: 'ICONS & HEROES',
      title: 'Légende engagée',
      content: `${legend.name} rejoint le club pour £${cost.toLocaleString()}.`,
    },
  });

  res.status(201).json({ player });
});

export default router;
