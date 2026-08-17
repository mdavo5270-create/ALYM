import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
const DEFINITIONS = [
  { code: "first_win", name: "First Blood", description: "Premi\xE8re victoire" },
  { code: "five_wins", name: "On a Roll", description: "5 victoires au total" },
  { code: "wealthy", name: "Wealthy", description: "Budget > \xA3500,000" }
];
const router = Router({ mergeParams: true });
router.use(requireAuth);
router.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId }
  });
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  if (team.budget >= 5e5) {
    const has = await prisma.achievement.findFirst({
      where: { teamId, achievementCode: "wealthy" }
    });
    if (!has) {
      await prisma.achievement.create({
        data: { teamId, achievementCode: "wealthy" }
      });
    }
  }
  const unlocked = await prisma.achievement.findMany({ where: { teamId } });
  const codes = new Set(unlocked.map((a) => a.achievementCode));
  res.json({
    achievements: DEFINITIONS.map((d) => ({
      ...d,
      unlocked: codes.has(d.code),
      unlockedAt: unlocked.find((u) => u.achievementCode === d.code)?.unlockedAt ?? null
    }))
  });
});
var achievements_default = router;
export {
  achievements_default as default
};
