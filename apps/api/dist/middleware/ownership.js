import { prisma } from "../lib/prisma.js";
async function requireTeamOwner(req, res, next) {
  const teamId = Number(req.params.teamId);
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return res.status(400).json({ error: "\xC9quipe invalide" });
  }
  if (!req.user?.userId) {
    return res.status(401).json({ error: "Non authentifi\xE9" });
  }
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    select: { id: true }
  });
  if (!team) {
    return res.status(404).json({ error: "\xC9quipe introuvable" });
  }
  req.teamId = teamId;
  next();
}
export {
  requireTeamOwner
};
