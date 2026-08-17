import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { TACTICAL_VISIONS, defaultBoardObjectives, computeJobSecurity, rollUnexpectedEvent, generateYouthProspect, } from '../lib/gameSystems.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
async function getOwnedTeam(userId, teamId) {
    return prisma.team.findFirst({
        where: { id: teamId, userId },
        include: { players: true, _count: { select: { players: true } } },
    });
}
router.get('/board', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const objectives = defaultBoardObjectives(team.wins, team.budget).map((o) => {
        if (o.code === 'squad')
            return { ...o, current: team.players.length };
        if (o.code === 'youth')
            return { ...o, current: team.youthPromoted };
        if (o.code === 'wins')
            return { ...o, current: team.wins };
        if (o.code === 'budget')
            return { ...o, current: team.budget };
        return o;
    });
    const jobSecurity = computeJobSecurity(objectives, {
        w: team.wins,
        d: team.draws,
        l: team.losses,
    });
    if (jobSecurity !== team.jobSecurity) {
        await prisma.team.update({ where: { id: teamId }, data: { jobSecurity } });
    }
    res.json({
        jobSecurity,
        tacticalVision: team.tacticalVision,
        objectives,
        visions: TACTICAL_VISIONS,
    });
});
router.post('/tactics', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const parsed = z
        .object({ vision: z.enum(['standard', 'possession', 'high_press', 'counter', 'wing_play', 'park_bus']) })
        .safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Vision tactique invalide' });
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    await prisma.team.update({
        where: { id: teamId },
        data: { tacticalVision: parsed.data.vision },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'STAFF TECHNIQUE',
            title: 'Nouvelle Tactical Vision',
            content: `Le club adopte la vision : ${parsed.data.vision}. Les entraînements s’adaptent.`,
        },
    });
    res.json({ ok: true, tacticalVision: parsed.data.vision });
});
router.post('/event/resolve', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const parsed = z
        .object({
        eventId: z.string(),
        choiceId: z.string(),
        effect: z.string().optional(),
    })
        .safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Choix invalide' });
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    // Nouveau moteur : eventId = cuid persisté
    try {
        const { resolveCareerEvent } = await import('../lib/eventEngine.js');
        const exists = await prisma.careerEvent.findFirst({
            where: { id: parsed.data.eventId, teamId },
        });
        if (exists) {
            const { event, result } = await resolveCareerEvent(teamId, parsed.data.eventId, parsed.data.choiceId);
            return res.json({
                ok: true,
                budget: result.budget,
                jobSecurity: result.jobSecurity,
                tacticalVision: result.tacticalVision,
                note: result.note,
                event,
            });
        }
    }
    catch (e) {
        if (e instanceof Error && e.message !== 'Événement introuvable') {
            return res.status(400).json({ error: e.message });
        }
    }
    // Legacy effects (anciens ids non persistés)
    let budget = team.budget;
    let jobSecurity = team.jobSecurity;
    let tacticalVision = team.tacticalVision;
    let note = 'Décision enregistrée.';
    const effect = parsed.data.effect ?? '';
    switch (effect) {
        case 'pay_5k':
            budget -= 5000;
            note = 'Soins médicaux : -£5,000.';
            break;
        case 'bonus_40k':
            budget += 40000;
            note = 'Injection board : +£40,000. Objectifs durcis.';
            break;
        case 'vision_press':
            tacticalVision = 'high_press';
            note = 'Passage en High Pressing.';
            break;
        case 'job_down':
            jobSecurity = Math.max(5, jobSecurity - 8);
            note = 'Le board note ton inflexibilité (-8 sécurité).';
            break;
        case 'morale_up':
            jobSecurity = Math.min(99, jobSecurity + 3);
            note = 'Communication positive (+3 sécurité).';
            break;
        default:
            note = 'Statu quo.';
    }
    await prisma.team.update({
        where: { id: teamId },
        data: { budget, jobSecurity, tacticalVision },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'UNEXPECTED EVENT',
            title: `Décision : ${parsed.data.eventId}`,
            content: note,
        },
    });
    if (effect === 'pay_5k' || effect === 'bonus_40k') {
        await prisma.transaction.create({
            data: {
                teamId,
                type: 'event',
                amount: effect === 'bonus_40k' ? 40000 : -5000,
                reason: note,
            },
        });
    }
    res.json({ ok: true, budget, jobSecurity, tacticalVision, note });
});
router.get('/youth', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const youth = team.players.filter((p) => p.isYouth);
    res.json({ youth, count: youth.length });
});
router.post('/youth/scout', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    if (team.budget < 8000)
        return res.status(400).json({ error: 'Budget insuffisant (£8,000 requis)' });
    if (team.players.length >= 16)
        return res.status(400).json({ error: 'Effectif plein (16 max)' });
    const prospect = generateYouthProspect(team.nation ?? 'France');
    const player = await prisma.player.create({
        data: {
            teamId,
            name: prospect.name,
            position: prospect.position,
            nation: prospect.nation,
            salary: prospect.salary,
            speed: prospect.speed,
            dribble: prospect.dribble,
            shot: prospect.shot,
            pass: prospect.pass,
            defense: prospect.defense,
            physique: prospect.physique,
            potential: prospect.potential,
            isYouth: true,
            contractUntil: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000),
        },
    });
    await prisma.team.update({
        where: { id: teamId },
        data: { budget: team.budget - 8000 },
    });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'youth_scout',
            amount: -8000,
            reason: `Scout académie : ${player.name}`,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'YOUTH ACADEMY',
            title: 'Nouveau prospect',
            content: `${player.name} (${player.position}) rejoint l’académie. Potentiel estimé : ${prospect.potential}.`,
        },
    });
    res.status(201).json({ player, potential: prospect.potential });
});
router.post('/youth/promote/:playerId', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerId = Number(req.params.playerId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const player = await prisma.player.findFirst({
        where: { id: playerId, teamId, isYouth: true },
    });
    if (!player)
        return res.status(404).json({ error: 'Prospect introuvable' });
    await prisma.player.update({
        where: { id: playerId },
        data: { isYouth: false },
    });
    await prisma.team.update({
        where: { id: teamId },
        data: { youthPromoted: team.youthPromoted + 1 },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'YOUTH ACADEMY',
            title: 'Promotion',
            content: `${player.name} intègre l’équipe première.`,
        },
    });
    res.json({ ok: true });
});
/** Liste marché : joueurs sans club générés à la volée + joueurs chers d'autres contexts */
router.get('/market', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    // Free agents generated for market browse (not persisted until bought)
    const listings = Array.from({ length: 8 }).map(() => {
        const p = generateYouthProspect();
        const rating = Math.round(((p.speed + p.dribble + p.shot + p.pass + p.defense + p.physique) / 6) * 10) / 10;
        const price = Math.round(15000 + rating * 8000 + p.potential * 200);
        return {
            tempId: `${p.name}-${p.position}-${price}`,
            ...p,
            rating,
            price,
        };
    });
    res.json({ listings, budget: team.budget });
});
router.post('/market/buy', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const schema = z.object({
        name: z.string(),
        position: z.string(),
        nation: z.string().optional(),
        salary: z.number(),
        speed: z.number(),
        dribble: z.number(),
        shot: z.number(),
        pass: z.number(),
        defense: z.number(),
        physique: z.number(),
        potential: z.number().optional(),
        price: z.number().positive(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Joueur invalide' });
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    if (team.players.length >= 16)
        return res.status(400).json({ error: 'Effectif plein' });
    if (team.budget < parsed.data.price)
        return res.status(400).json({ error: 'Budget insuffisant' });
    const p = parsed.data;
    const player = await prisma.player.create({
        data: {
            teamId,
            name: p.name,
            position: p.position,
            nation: p.nation ?? 'International',
            salary: p.salary,
            speed: p.speed,
            dribble: p.dribble,
            shot: p.shot,
            pass: p.pass,
            defense: p.defense,
            physique: p.physique,
            potential: p.potential ?? 75,
            isYouth: false,
            contractUntil: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000),
        },
    });
    await prisma.team.update({
        where: { id: teamId },
        data: { budget: team.budget - p.price },
    });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'transfer_in',
            amount: -p.price,
            reason: `Achat ${p.name}`,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: 'Transfert validé',
            content: `${p.name} signe pour £${p.price.toLocaleString()}. Contrat 2 ans.`,
        },
    });
    res.status(201).json({ player });
});
router.post('/market/sell/:playerId', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const playerId = Number(req.params.playerId);
    const team = await getOwnedTeam(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
    if (!player)
        return res.status(404).json({ error: 'Joueur introuvable' });
    if (team.players.length <= 11) {
        return res.status(400).json({ error: 'Il faut garder au moins 11 joueurs' });
    }
    const rating = (player.speed + player.dribble + player.shot + player.pass + player.defense + player.physique) / 6;
    const fee = Math.round(rating * 2200 + player.salary * 4);
    await prisma.player.delete({ where: { id: playerId } });
    await prisma.team.update({
        where: { id: teamId },
        data: { budget: team.budget + fee },
    });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'transfer_out',
            amount: fee,
            reason: `Vente ${player.name}`,
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: 'Joueur vendu',
            content: `${player.name} part pour £${fee.toLocaleString()}.`,
        },
    });
    res.json({ ok: true, fee });
});
export { rollUnexpectedEvent };
export default router;
