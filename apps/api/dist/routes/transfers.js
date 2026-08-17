import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router({ mergeParams: true });
router.use(requireAuth);
async function owned(userId, teamId) {
    return prisma.team.findFirst({ where: { id: teamId, userId }, include: { players: true } });
}
function pushHistory(json, entry) {
    try {
        const arr = JSON.parse(json || '[]');
        arr.push({ ...entry, at: new Date().toISOString() });
        return JSON.stringify(arr);
    }
    catch {
        return JSON.stringify([{ ...entry, at: new Date().toISOString() }]);
    }
}
/** Liste des négociations */
router.get('/negotiations', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const rows = await prisma.transferNegotiation.findMany({
        where: { teamId },
        orderBy: { updatedAt: 'desc' },
        take: 30,
    });
    res.json({ negotiations: rows });
});
/** Étape 1 : ouvrir une offre */
router.post('/negotiations', async (req, res) => {
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
        rating: z.number().optional(),
        price: z.number().positive(),
        offerAmount: z.number().positive(),
        wageOffer: z.number().positive().optional(),
        contractYears: z.number().int().min(1).max(5).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Offre invalide' });
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    if (team.players.length >= 16)
        return res.status(400).json({ error: 'Effectif plein' });
    if (team.budget < parsed.data.offerAmount) {
        return res.status(400).json({ error: 'Budget insuffisant pour cette offre' });
    }
    const rating = parsed.data.rating ??
        Math.round((parsed.data.speed +
            parsed.data.dribble +
            parsed.data.shot +
            parsed.data.pass +
            parsed.data.defense +
            parsed.data.physique) /
            6);
    const ask = parsed.data.price;
    const offer = parsed.data.offerAmount;
    const ratio = offer / ask;
    let status = 'offered';
    let counterAmount = null;
    let step = 1;
    let note = '';
    if (ratio >= 0.95) {
        status = 'agreed';
        step = 3;
        note = 'Offre acceptée immédiatement.';
    }
    else if (ratio >= 0.75) {
        status = 'countered';
        counterAmount = Math.round(ask * (0.88 + Math.random() * 0.1));
        step = 2;
        note = `Contre-offre à £${counterAmount.toLocaleString()}.`;
    }
    else {
        status = 'rejected';
        step = 2;
        note = 'Offre jugée trop basse — négociations rompues.';
    }
    const row = await prisma.transferNegotiation.create({
        data: {
            teamId,
            playerName: parsed.data.name,
            position: parsed.data.position,
            rating,
            listingJson: JSON.stringify(parsed.data),
            status,
            offerAmount: offer,
            counterAmount,
            wageOffer: parsed.data.wageOffer ?? parsed.data.salary,
            contractYears: parsed.data.contractYears ?? 2,
            step,
            historyJson: pushHistory('[]', { type: 'offer', amount: offer, note }),
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: `Négociation : ${parsed.data.name}`,
            content: note,
        },
    });
    res.status(201).json({ negotiation: row, note });
});
/** Étape 2 : répondre à une contre-offre */
router.post('/negotiations/:id/respond', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const id = req.params.id;
    const parsed = z
        .object({
        action: z.enum(['accept_counter', 'raise', 'walk_away']),
        raiseAmount: z.number().positive().optional(),
    })
        .safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Action invalide' });
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const nego = await prisma.transferNegotiation.findFirst({ where: { id, teamId } });
    if (!nego)
        return res.status(404).json({ error: 'Négociation introuvable' });
    if (!['offered', 'countered'].includes(nego.status)) {
        return res.status(400).json({ error: 'Négociation déjà close' });
    }
    let status = nego.status;
    let offerAmount = nego.offerAmount;
    let counterAmount = nego.counterAmount;
    let step = nego.step + 1;
    let historyJson = nego.historyJson;
    let note = '';
    if (parsed.data.action === 'walk_away') {
        status = 'cancelled';
        note = 'Tu as quitté la table des négociations.';
        historyJson = pushHistory(historyJson, { type: 'walk_away', note });
    }
    else if (parsed.data.action === 'accept_counter') {
        if (!counterAmount)
            return res.status(400).json({ error: 'Pas de contre-offre' });
        status = 'agreed';
        offerAmount = counterAmount;
        note = `Accord à £${counterAmount.toLocaleString()}.`;
        historyJson = pushHistory(historyJson, { type: 'accept_counter', amount: counterAmount, note });
    }
    else {
        const raise = parsed.data.raiseAmount;
        if (!raise)
            return res.status(400).json({ error: 'raiseAmount requis' });
        if (team.budget < raise)
            return res.status(400).json({ error: 'Budget insuffisant' });
        offerAmount = raise;
        const listing = JSON.parse(nego.listingJson);
        const ratio = raise / listing.price;
        if (ratio >= 0.9) {
            status = 'agreed';
            note = 'Nouvelle offre acceptée.';
            historyJson = pushHistory(historyJson, { type: 'raise_accepted', amount: raise, note });
        }
        else if (ratio >= 0.7) {
            status = 'countered';
            counterAmount = Math.round(listing.price * 0.92);
            note = `Dernière contre-offre £${counterAmount.toLocaleString()}.`;
            historyJson = pushHistory(historyJson, { type: 'raise_counter', amount: raise, counter: counterAmount, note });
        }
        else {
            status = 'rejected';
            note = 'Club adverse refuse de négocier plus bas.';
            historyJson = pushHistory(historyJson, { type: 'raise_rejected', amount: raise, note });
        }
    }
    const updated = await prisma.transferNegotiation.update({
        where: { id },
        data: { status, offerAmount, counterAmount, step, historyJson },
    });
    res.json({ negotiation: updated, note });
});
/** Étape 3 : finaliser le transfert (après agreed) */
router.post('/negotiations/:id/complete', async (req, res) => {
    const teamId = Number(req.params.teamId);
    const id = req.params.id;
    const team = await owned(req.user.userId, teamId);
    if (!team)
        return res.status(404).json({ error: 'Équipe introuvable' });
    const nego = await prisma.transferNegotiation.findFirst({ where: { id, teamId } });
    if (!nego)
        return res.status(404).json({ error: 'Négociation introuvable' });
    if (nego.status !== 'agreed')
        return res.status(400).json({ error: 'Pas d’accord signé' });
    if (team.players.length >= 16)
        return res.status(400).json({ error: 'Effectif plein' });
    if (team.budget < nego.offerAmount)
        return res.status(400).json({ error: 'Budget insuffisant' });
    const listing = JSON.parse(nego.listingJson);
    const player = await prisma.player.create({
        data: {
            teamId,
            name: listing.name,
            position: listing.position,
            nation: listing.nation ?? 'International',
            salary: nego.wageOffer ?? listing.salary,
            speed: listing.speed,
            dribble: listing.dribble,
            shot: listing.shot,
            pass: listing.pass,
            defense: listing.defense,
            physique: listing.physique,
            potential: listing.potential ?? 75,
            contractUntil: new Date(Date.now() + (nego.contractYears || 2) * 365 * 24 * 3600 * 1000),
        },
    });
    await prisma.team.update({
        where: { id: teamId },
        data: { budget: team.budget - nego.offerAmount },
    });
    await prisma.transaction.create({
        data: {
            teamId,
            type: 'transfer_in',
            amount: -nego.offerAmount,
            reason: `Transfert ${listing.name}`,
        },
    });
    await prisma.transferNegotiation.update({
        where: { id },
        data: {
            status: 'completed',
            step: nego.step + 1,
            historyJson: pushHistory(nego.historyJson, { type: 'completed', amount: nego.offerAmount }),
        },
    });
    await prisma.message.create({
        data: {
            teamId,
            sender: 'MERCATO',
            title: 'Transfert conclu',
            content: `${listing.name} signe pour £${nego.offerAmount.toLocaleString()} · ${nego.contractYears} ans.`,
        },
    });
    res.json({ ok: true, player, budget: team.budget - nego.offerAmount });
});
export default router;
