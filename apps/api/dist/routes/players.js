import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
router.get('/', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await prisma.team.findFirst({
        where: { id: teamId, userId: req.user.userId },
    });
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const players = await prisma.player.findMany({
        where: { teamId },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    const withRating = players.map((p) => {
        const rating = Math.round(((p.speed + p.dribble + p.shot + p.pass + p.defense + p.physique) / 6) * 10) / 10;
        return { ...p, rating };
    });
    res.json({ players: withRating });
});
export default router;
