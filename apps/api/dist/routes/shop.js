import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
const CATALOG = [
    { id: 'stadium_2', name: 'Stade niv. 2', price: 200, effect: 'budget_bonus', value: 15000 },
    { id: 'training_ai', name: 'Formation IA', price: 120, effect: 'gold', value: 40 },
    { id: 'coach', name: 'Coach Expert', price: 150, effect: 'job_boost', value: 3 },
    { id: 'medical', name: 'Staff Médical', price: 100, effect: 'job_boost', value: 2 },
    { id: 'badge_skin', name: 'Skin écusson', price: 40, effect: 'cosmetic', value: 0 },
    { id: 'kit_custom', name: 'Maillot custom', price: 60, effect: 'cosmetic', value: 0 },
    { id: 'gold_pack', name: 'Pack Or +80', price: 50, effect: 'gold', value: 80 },
];
router.get('/', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await prisma.team.findFirst({
        where: { id: teamId, userId: req.user.userId },
    });
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    res.json({
        gold: team.goldBalance,
        items: CATALOG.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            effect: i.effect,
        })),
    });
});
router.post('/buy', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const parsed = z.object({ itemId: z.string() }).safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'itemId requis' });
    const item = CATALOG.find((i) => i.id === parsed.data.itemId);
    if (!item)
        return res.status(404).json({ error: 'Article introuvable' });
    const team = await prisma.team.findFirst({
        where: { id: teamId, userId: req.user.userId },
    });
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    if (team.goldBalance < item.price) {
        return res.status(400).json({ error: 'Or insuffisant' });
    }
    let budget = team.budget;
    let gold = team.goldBalance - item.price;
    let jobSecurity = team.jobSecurity;
    if (item.effect === 'budget_bonus')
        budget += item.value;
    if (item.effect === 'gold')
        gold += item.value;
    if (item.effect === 'job_boost')
        jobSecurity = Math.min(99, jobSecurity + item.value);
    await prisma.team.update({
        where: { id: teamId },
        data: { goldBalance: gold, budget, jobSecurity },
    });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'shop',
            amount: -item.price,
            reason: `Achat boutique: ${item.name}`,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'BOUTIQUE',
            title: 'Achat confirmé',
            content: `Vous avez acheté ${item.name} pour ${item.price} Or.`,
        },
    });
    res.json({ ok: true, gold, budget });
});
export default router;
