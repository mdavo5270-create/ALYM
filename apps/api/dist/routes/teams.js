import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { seedStarterPlayers } from "../lib/seedPlayers.js";
import { ensureLeagueForTeam } from "../lib/league.js";
const router = Router();
const createSchema = z.object({
  name: z.string().min(2, "Nom d\u2019\xE9quipe : 2 caract\xE8res minimum").max(40),
  nation: z.string().min(2).max(40).optional(),
  stadiumName: z.string().min(2).max(60).optional(),
  badgeDesign: z.number().int().min(0).max(20).optional()
});
function firstZodError(error) {
  const field = error.flatten().fieldErrors;
  const first = Object.values(field).flat()[0];
  return first || "Donn\xE9es invalides";
}
router.use(requireAuth);
router.get("/", async (req, res) => {
  const teams = await prisma.team.findMany({
    where: { userId: req.user.userId },
    include: {
      _count: { select: { players: true, messages: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ teams });
});
router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: firstZodError(parsed.error) });
  }
  const existing = await prisma.team.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ error: "Ce nom d\u2019\xE9quipe existe d\xE9j\xE0" });
  }
  const nation = parsed.data.nation ?? "France";
  const team = await prisma.team.create({
    data: {
      userId: req.user.userId,
      name: parsed.data.name,
      nation,
      stadiumName: parsed.data.stadiumName ?? `Stade ${parsed.data.name}`,
      badgeDesign: parsed.data.badgeDesign ?? 0,
      budget: 2e5,
      goldBalance: 500
    }
  });
  await seedStarterPlayers(team.id, nation);
  await ensureLeagueForTeam(team.id, team.name);
  try {
    const { writeChronicle } = await import("../lib/chronicle.js");
    await writeChronicle(team.id, {
      type: "kickoff",
      tone: "hope",
      season: 1,
      week: 1,
      headline: `Chapitre 1 \u2014 ${team.name}`,
      body: `La direction confie les cl\xE9s. Budget serr\xE9, effectif \xE0 forger, Super Ligue en ligne de mire. Tout ce qui suivra s\u2019\xE9crira ici.`,
      meta: { nation }
    });
  } catch (e) {
    console.error("chronicle kickoff failed", e);
  }
  await prisma.message.create({
    data: {
      teamId: team.id,
      sender: "DIRECTION DU CLUB",
      title: "Bienvenue",
      content: `Bienvenue \xE0 ${team.name} ! Budget \xA3200,000. Un effectif de 14 joueurs vous attend.`
    }
  });
  await prisma.message.create({
    data: {
      teamId: team.id,
      sender: "SERVICE DES FINANCES",
      title: "Budget de saison",
      content: "Votre budget de saison a \xE9t\xE9 cr\xE9dit\xE9. Bonne gestion."
    }
  });
  const full = await prisma.team.findUnique({
    where: { id: team.id },
    include: { _count: { select: { players: true, messages: true } } }
  });
  res.status(201).json({ team: full });
});
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const team = await prisma.team.findFirst({
    where: { id, userId: req.user.userId },
    include: {
      players: true,
      messages: { orderBy: { messageDate: "desc" }, take: 20 },
      _count: { select: { players: true, messages: true } }
    }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  res.json({ team });
});
var teams_default = router;
export {
  teams_default as default
};
