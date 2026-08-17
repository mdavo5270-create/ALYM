import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { CHALLENGES, getChallenge } from '../lib/challenges.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
const PLANS = [
    { id: 'balanced', name: 'Équilibré', focus: 'all' },
    { id: 'attacking', name: 'Offensif', focus: 'shot' },
    { id: 'defensive', name: 'Défensif', focus: 'defense' },
    { id: 'technical', name: 'Technique', focus: 'dribble' },
    { id: 'physical', name: 'Physique', focus: 'physique' },
];
async function owned(userId, teamId) {
    return prisma.team.findFirst({ where: { id: teamId, userId }, include: { players: true } });
}
router.get('/challenges', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const active = team.challengeId ? getChallenge(team.challengeId) : null;
    res.json({
        catalog: CHALLENGES,
        active: active
            ? {
                ...active,
                progress: {
                    wins: team.challengeWins,
                    matches: team.challengeMatches,
                    streak: team.challengeStreak,
                    youth: team.challengeYouth,
                },
            }
            : null,
    });
});
router.post('/challenges/start', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const parsed = z.object({ challengeId: z.string() }).safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'challengeId requis' });
    const def = getChallenge(parsed.data.challengeId);
    if (!def)
        return res.status(404).json({ error: 'Défi introuvable' });
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    if (team.challengeId)
        return res.status(400).json({ error: 'Un défi est déjà actif' });
    await prisma.team.update({
        where: { id: teamId },
        data: {
            challengeId: def.id,
            challengeWins: 0,
            challengeMatches: 0,
            challengeStreak: 0,
            challengeYouth: 0,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MANAGER LIVE',
            title: `Défi : ${def.title}`,
            content: `${def.description} Récompense : ${def.rewardGold} Or + £${def.rewardBudget.toLocaleString()}.`,
        },
    });
    res.json({ ok: true, challenge: def });
});
router.post('/challenges/abandon', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    await prisma.team.update({
        where: { id: teamId },
        data: {
            challengeId: null,
            challengeWins: 0,
            challengeMatches: 0,
            challengeStreak: 0,
            challengeYouth: 0,
        },
    });
    res.json({ ok: true });
});
router.get('/training', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    res.json({
        plans: PLANS,
        players: team.players.map((p) => ({
            id: p.id,
            name: p.name,
            position: p.position,
            trainingPlan: p.trainingPlan,
            onLoan: p.onLoan,
            isYouth: p.isYouth,
        })),
    });
});
router.post('/training/:playerId', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerId = Number(req.params.playerId);
    const parsed = z
        .object({ plan: z.enum(['balanced', 'attacking', 'defensive', 'technical', 'physical']) })
        .safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Plan invalide' });
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
    if (!player)
        return res.status(404).json({ error: 'Joueur introuvable' });
    await prisma.player.update({
        where: { id: playerId },
        data: { trainingPlan: parsed.data.plan },
    });
    res.json({ ok: true, plan: parsed.data.plan });
});
/** Apply small training gains after a match session */
export async function applyTrainingGains(teamId) {
    const players = await prisma.player.findMany({ where: { teamId, onLoan: false } });
    for (const p of players) {
        const bump = {};
        if (p.trainingPlan === 'attacking')
            bump.shot = Math.min(99, p.shot + 1);
        else if (p.trainingPlan === 'defensive')
            bump.defense = Math.min(99, p.defense + 1);
        else if (p.trainingPlan === 'technical')
            bump.dribble = Math.min(99, p.dribble + 1);
        else if (p.trainingPlan === 'physical')
            bump.physique = Math.min(99, p.physique + 1);
        else {
            // balanced: slight random
            const keys = ['speed', 'pass'];
            const k = keys[Math.floor(Math.random() * keys.length)];
            bump[k] = Math.min(99, p[k] + 1);
        }
        if (Object.keys(bump).length) {
            await prisma.player.update({ where: { id: p.id }, data: bump });
        }
    }
}
router.post('/loan/:playerId', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerId = Number(req.params.playerId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
    if (!player)
        return res.status(404).json({ error: 'Joueur introuvable' });
    if (player.onLoan)
        return res.status(400).json({ error: 'Déjà en prêt' });
    const active = team.players.filter((p) => !p.onLoan && !p.isYouth);
    if (active.length <= 11) {
        return res.status(400).json({ error: 'Garde au moins 11 joueurs disponibles' });
    }
    await prisma.player.update({ where: { id: playerId }, data: { onLoan: true } });
    const fee = Math.round(player.salary * 4);
    await prisma.team.update({ where: { id: teamId }, data: { budget: team.budget + fee } });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'loan_out',
            amount: fee,
            reason: `Prêt ${player.name}`,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: 'Joueur prêté',
            content: `${player.name} part en prêt. Indemnité £${fee.toLocaleString()}.`,
        },
    });
    res.json({ ok: true, fee });
});
router.post('/loan/:playerId/recall', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerId = Number(req.params.playerId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const player = await prisma.player.findFirst({ where: { id: playerId, teamId, onLoan: true } });
    if (!player)
        return res.status(404).json({ error: 'Prêt introuvable' });
    await prisma.player.update({ where: { id: playerId }, data: { onLoan: false } });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: 'Fin de prêt',
            content: `${player.name} revient au club.`,
        },
    });
    res.json({ ok: true });
});
export default router;
