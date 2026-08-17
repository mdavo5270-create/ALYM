import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  strengthFromPlayers,
  simulateMatch,
  randomOpponentName,
  randomOpponentStrength,
} from '../lib/matchEngine.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.post('/play', async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  if (team.players.length < 11) {
    return res.status(400).json({ error: 'Il faut au moins 11 joueurs' });
  }

  const home = strengthFromPlayers(team.players);
  const awayName = randomOpponentName();
  const away = randomOpponentStrength();
  const sim = simulateMatch(home, away);

  const wins = team.wins + (sim.result === 'W' ? 1 : 0);
  const draws = team.draws + (sim.result === 'D' ? 1 : 0);
  const losses = team.losses + (sim.result === 'L' ? 1 : 0);
  const newBudget = team.budget + sim.prize;

  await prisma.team.update({
    where: { id: teamId },
    data: { wins, draws, losses, budget: newBudget },
  });

  await prisma.transaction.create({
    data: {
      teamId,
      type: 'match_prize',
      amount: sim.prize,
      reason: `Match vs ${awayName} (${sim.homeScore}-${sim.awayScore})`,
    },
  });

  const resultLabel =
    sim.result === 'W' ? 'Victoire' : sim.result === 'D' ? 'Match nul' : 'Défaite';

  await prisma.message.create({
    data: {
      teamId,
      sender: 'REPORTING MATCH',
      title: `${resultLabel} ${sim.homeScore}-${sim.awayScore} vs ${awayName}`,
      content: `Votre équipe a ${resultLabel.toLowerCase()} contre ${awayName}. Prime : £${sim.prize.toLocaleString()}.`,
    },
  });

  // Achievements
  if (sim.result === 'W') {
    const hasFirst = await prisma.achievement.findFirst({
      where: { teamId, achievementCode: 'first_win' },
    });
    if (!hasFirst) {
      await prisma.achievement.create({
        data: { teamId, achievementCode: 'first_win' },
      });
      await prisma.message.create({
        data: {
          teamId,
          sender: 'SUCCÈS',
          title: 'First Blood',
          content: 'Succès débloqué : première victoire !',
        },
      });
    }
    if (wins >= 5) {
      const hasRoll = await prisma.achievement.findFirst({
        where: { teamId, achievementCode: 'five_wins' },
      });
      if (!hasRoll) {
        await prisma.achievement.create({
          data: { teamId, achievementCode: 'five_wins' },
        });
      }
    }
  }

  res.json({
    match: {
      opponent: awayName,
      homeScore: sim.homeScore,
      awayScore: sim.awayScore,
      result: sim.result,
      prize: sim.prize,
    },
    team: { wins, draws, losses, budget: newBudget },
  });
});

export default router;
