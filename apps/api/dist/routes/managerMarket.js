import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ensureManagerMarketSeed, tickManagerMarket } from "../lib/managerMarket.js";
const router = Router({ mergeParams: true });
router.use(requireAuth);
router.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureManagerMarketSeed();
  const clubs = await prisma.aiClub.findMany({
    include: { manager: true },
    orderBy: { reputation: "desc" }
  });
  const freeAgents = await prisma.aiManager.findMany({
    where: { status: { in: ["free", "interim"] } },
    orderBy: { reputation: "desc" }
  });
  const events = await prisma.managerMarketEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 25
  });
  res.json({
    clubs: clubs.map((c) => ({
      id: c.id,
      name: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      leagueTier: c.leagueTier,
      jobSecurity: c.jobSecurity,
      record: `${c.wins}V ${c.draws}N ${c.losses}D`,
      manager: c.manager ? {
        name: c.manager.name,
        nation: c.manager.nation,
        reputation: c.manager.reputation,
        status: c.manager.status,
        preferredVision: c.manager.preferredVision,
        seasonsAtClub: c.manager.seasonsAtClub
      } : null
    })),
    freeAgents: freeAgents.map((m) => ({
      id: m.id,
      name: m.name,
      nation: m.nation,
      reputation: m.reputation,
      status: m.status,
      preferredVision: m.preferredVision
    })),
    events
  });
});
router.post("/tick", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const result = await tickManagerMarket(teamId);
  res.json(result);
});
router.get("/jobs", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  await ensureManagerMarketSeed();
  const clubs = await prisma.aiClub.findMany({ include: { manager: true }, orderBy: { reputation: "desc" } });
  const playerRep = Math.min(90, 40 + team.wins * 3 + Math.floor(team.budget / 5e4));
  const vision = team.tacticalVision || "standard";
  const jobs = clubs.map((c) => {
    const vacant = !c.manager || c.manager.status === "interim";
    const shaky = (c.jobSecurity ?? 50) < 40;
    if (!vacant && !shaky) return null;
    const visionFit = c.tacticalVision === vision ? 25 : 10;
    const repFit = 20 - Math.min(20, Math.abs(playerRep - c.reputation) / 3);
    const urgency = vacant ? 20 : shaky ? 12 : 0;
    const score = Math.round(visionFit + repFit + urgency + (100 - (c.jobSecurity ?? 50)) * 0.15);
    return {
      clubId: c.id,
      clubName: c.name,
      nation: c.nation,
      reputation: c.reputation,
      tacticalVision: c.tacticalVision,
      jobSecurity: c.jobSecurity,
      status: vacant ? "vacant" : "under_pressure",
      managerName: c.manager?.name ?? null,
      compatibility: Math.max(5, Math.min(99, score)),
      likelihood: score >= 55 ? "\xE9lev\xE9e" : score >= 40 ? "moyenne" : "faible"
    };
  }).filter(Boolean).sort((a, b) => b.compatibility - a.compatibility).slice(0, 12);
  res.json({
    playerReputation: playerRep,
    tacticalVision: vision,
    jobs
  });
});
router.post("/jobs/:clubId/apply", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const clubId = Number(req.params.clubId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const club = await prisma.aiClub.findUnique({ where: { id: clubId }, include: { manager: true } });
  if (!club) return res.status(404).json({ error: "Club introuvable" });
  const playerRep = Math.min(90, 40 + team.wins * 3 + Math.floor(team.budget / 5e4));
  const vision = team.tacticalVision || "standard";
  const vacant = !club.manager || club.manager.status === "interim";
  const shaky = (club.jobSecurity ?? 50) < 40;
  if (!vacant && !shaky) {
    return res.status(400).json({ error: "Ce poste n\u2019est pas ouvert actuellement" });
  }
  const visionFit = club.tacticalVision === vision ? 25 : 10;
  const repFit = 20 - Math.min(20, Math.abs(playerRep - club.reputation) / 3);
  const score = visionFit + repFit + (vacant ? 20 : 12);
  const accepted = score >= 42 && Math.random() < 0.55 + score / 200;
  await prisma.message.create({
    data: {
      teamId,
      sender: "MANAGER MARKET",
      title: accepted ? `Candidature accept\xE9e \u2014 ${club.name}` : `Candidature refus\xE9e \u2014 ${club.name}`,
      content: accepted ? `Le conseil de ${club.name} retient votre profil (compatibilit\xE9 ${Math.round(score)}). Suite narrative en carri\xE8re avanc\xE9e.` : `${club.name} privil\xE9gie un autre profil pour le moment (score ${Math.round(score)}).`
    }
  });
  await prisma.managerMarketEvent.create({
    data: {
      type: accepted ? "application_accepted" : "application_rejected",
      clubName: club.name,
      managerName: team.name,
      detail: `score ${Math.round(score)} \xB7 teamId ${teamId}`
    }
  });
  res.json({
    ok: true,
    accepted,
    clubName: club.name,
    score: Math.round(score),
    note: accepted ? "Profil retenu" : "Profil non retenu"
  });
});
var managerMarket_default = router;
export {
  managerMarket_default as default
};
