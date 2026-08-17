import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getPendingEvent, listEvents, resolveCareerEvent, toLegacyUnexpectedShape, } from '../lib/eventEngine.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
async function getOwnedTeam(userId, teamId) {
    return prisma.team.findFirst({ where: { id: teamId, userId } });
}
router.get('/', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const events = await listEvents(teamId, status);
    const pending = await getPendingEvent(teamId);
    res.json({
        events,
        pending,
        legacy: toLegacyUnexpectedShape(pending),
        counts: {
            pending: events.filter((e) => e.status === 'pending').length,
            resolved: events.filter((e) => e.status === 'resolved').length,
        },
    });
});
router.get('/pending', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const pending = await getPendingEvent(teamId);
    res.json({ pending, legacy: toLegacyUnexpectedShape(pending) });
});
router.post('/:eventId/resolve', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const eventId = req.params.eventId;
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const parsed = z.object({ choiceId: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'choiceId requis' });
    try {
        const { event, result } = await resolveCareerEvent(teamId, eventId, parsed.data.choiceId);
        const next = await getPendingEvent(teamId);
        res.json({
            ok: true,
            event,
            result,
            team: {
                budget: result.budget,
                jobSecurity: result.jobSecurity,
                tacticalVision: result.tacticalVision,
            },
            nextPending: next,
            legacy: toLegacyUnexpectedShape(next),
        });
    }
    catch (e) {
        res.status(400).json({ error: e instanceof Error ? e.message : 'Erreur résolution' });
    }
});
export default router;
