import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  strengthFromPlayers,
  simulateMatch,
  withTimeline,
  randomOpponentName,
  randomOpponentStrength,
} from '../lib/matchEngine.js';
import { rollUnexpectedEvent } from '../lib/gameSystems.js';
import { getChallenge } from '../lib/challenges.js';
import { applyTrainingGains } from './live.js';
import { tickManagerMarket } from '../lib/managerMarket.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);


router.get('/preview', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });
  const available = team.players.filter((p) => !p.onLoan);
  const opponent = randomOpponentName();
  const home = strengthFromPlayers(available);
  res.json({
    homeName: team.name,
    opponent,
    competition: 'Championnat',
    venue: 'Domicile',
    kickoffLabel: 'Prochaine journée',
    availablePlayers: available.length,
    formHint: `${team.wins}V · ${team.draws}N · ${team.losses}D`,
    tacticalVision: team.tacticalVision,
    strength: {
      attack: Math.round(home.attack),
      midfield: Math.round(home.midfield),
      defense: Math.round(home.defense),
      gk: Math.round(home.gk),
    },
  });
});

router.post('/play', async (req, res) => {
  const teamId = Number((req.params as Record<string, string>).teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user!.userId },
    include: { players: true },
  });
  if (!team) return res.status(404).json({ error: 'Équipe introuvable' });

  const available = team.players.filter((p) => !p.onLoan);
  if (available.length < 11) {
    return res.status(400).json({ error: 'Il faut au moins 11 joueurs disponibles (hors prêt)' });
  }

  const home = strengthFromPlayers(available);
  const awayName = randomOpponentName();
  const away = randomOpponentStrength();
  const raw = simulateMatch(home, away);
  const sim = withTimeline(raw, team.name, awayName);

  const wins = team.wins + (sim.result === 'W' ? 1 : 0);
  const draws = team.draws + (sim.result === 'D' ? 1 : 0);
  const losses = team.losses + (sim.result === 'L' ? 1 : 0);
  let newBudget = team.budget + sim.prize;
  let goldBalance = team.goldBalance;

  let challengeId = team.challengeId;
  let challengeWins = team.challengeWins;
  let challengeMatches = team.challengeMatches;
  let challengeStreak = team.challengeStreak;
  let challengeYouth = team.challengeYouth;
  let challengeResult: null | { status: 'won' | 'failed' | 'ongoing'; title: string; note: string } =
    null;

  if (challengeId) {
    const def = getChallenge(challengeId);
    challengeMatches += 1;
    if (sim.result === 'W') {
      challengeWins += 1;
      challengeStreak += 1;
    } else if (sim.result === 'L') {
      challengeStreak = 0;
    } else {
      challengeStreak += 1;
    }

    if (def) {
      let completed = false;
      let failed = false;
      if (def.goalType === 'wins' && challengeWins >= def.goalTarget) completed = true;
      if (def.goalType === 'no_loss_streak' && challengeStreak >= def.goalTarget) completed = true;
      if (def.goalType === 'youth' && challengeYouth >= def.goalTarget) completed = true;
      if (def.goalType === 'budget' && newBudget >= def.goalTarget) completed = true;
      if (challengeMatches >= def.matchesLimit && !completed) failed = true;

      if (completed) {
        newBudget += def.rewardBudget;
        goldBalance += def.rewardGold;
        challengeResult = {
          status: 'won',
          title: def.title,
          note: `Défi réussi ! +${def.rewardGold} Or + £${def.rewardBudget.toLocaleString()}`,
        };
        await prisma.message.create({
          data: {
            teamId,
            sender: 'MANAGER LIVE',
            title: `Défi réussi : ${def.title}`,
            content: challengeResult.note,
          },
        });
        await prisma.transaction.create({
          data: {
            teamId,
            type: 'challenge_reward',
            amount: def.rewardBudget,
            reason: `Récompense ${def.title}`,
          },
        });
        const hasCW = await prisma.achievement.findFirst({
          where: { teamId, achievementCode: 'challenge_won' },
        });
        if (!hasCW) {
          await prisma.achievement.create({
            data: { teamId, achievementCode: 'challenge_won' },
          });
        }
        challengeId = null;
        challengeWins = 0;
        challengeMatches = 0;
        challengeStreak = 0;
        challengeYouth = 0;
      } else if (failed) {
        challengeResult = {
          status: 'failed',
          title: def.title,
          note: 'Défi échoué — limite de matchs atteinte.',
        };
        await prisma.message.create({
          data: {
            teamId,
            sender: 'MANAGER LIVE',
            title: `Défi échoué : ${def.title}`,
            content: challengeResult.note,
          },
        });
        challengeId = null;
        challengeWins = 0;
        challengeMatches = 0;
        challengeStreak = 0;
        challengeYouth = 0;
      } else {
        challengeResult = {
          status: 'ongoing',
          title: def.title,
          note: `Progression ${challengeMatches}/${def.matchesLimit}`,
        };
      }
    }
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      wins,
      draws,
      losses,
      budget: newBudget,
      goldBalance,
      challengeId,
      challengeWins,
      challengeMatches,
      challengeStreak,
      challengeYouth,
    },
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
      content: `Prime : £${sim.prize.toLocaleString()}.`,
    },
  });

  if (sim.result === 'W') {
    const hasFirst = await prisma.achievement.findFirst({
      where: { teamId, achievementCode: 'first_win' },
    });
    if (!hasFirst) {
      await prisma.achievement.create({ data: { teamId, achievementCode: 'first_win' } });
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
        await prisma.achievement.create({ data: { teamId, achievementCode: 'five_wins' } });
      }
    }
  }

  await applyTrainingGains(teamId);

  // Manager Market AI world tick
  let marketHeadlines: string[] = [];
  try {
    const market = await tickManagerMarket(teamId);
    marketHeadlines = market.headlines;
  } catch (e) {
    console.error('manager market tick failed', e);
  }

  const event = rollUnexpectedEvent();

  res.json({
    match: {
      opponent: awayName,
      homeName: team.name,
      homeScore: sim.homeScore,
      awayScore: sim.awayScore,
      result: sim.result,
      prize: sim.prize,
      stats: sim.stats,
      timeline: sim.timeline,
      venue: 'Domicile',
      competition: 'Championnat',
    },
    preview: {
      opponent: awayName,
      competition: 'Championnat',
      venue: 'Domicile',
      importance: sim.result === 'W' ? 'élevée' : 'normale',
    },
    team: { wins, draws, losses, budget: newBudget, goldBalance },
    event,
    challenge: challengeResult,
    marketHeadlines,
  });
});

export default router;
