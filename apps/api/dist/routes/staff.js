import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router({ mergeParams: true });
router.use(requireAuth);
const CATALOG = [
  { role: "assistant", name: "Adjoint tactique", rating: 72, salary: 1800, specialty: "Tactique", cost: 12e3 },
  { role: "scout", name: "Scout senior", rating: 70, salary: 1500, specialty: "D\xE9tection", cost: 1e4 },
  { role: "medical", name: "M\xE9decin du sport", rating: 74, salary: 2e3, specialty: "R\xE9cup\xE9ration", cost: 14e3 },
  { role: "fitness", name: "Pr\xE9pa physique", rating: 68, salary: 1300, specialty: "Condition", cost: 9e3 },
  { role: "analyst", name: "Analyste vid\xE9o", rating: 66, salary: 1100, specialty: "Data", cost: 8e3 },
  { role: "youth", name: "Resp. acad\xE9mie", rating: 71, salary: 1600, specialty: "Jeunes", cost: 11e3 }
];
async function owned(userId, teamId) {
  return prisma.team.findFirst({ where: { id: teamId, userId } });
}
router.get("/", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const staff = await prisma.staffMember.findMany({
    where: { teamId },
    orderBy: { hiredAt: "desc" }
  });
  res.json({
    staff,
    catalog: CATALOG.map((c) => ({
      ...c,
      hired: staff.some((s) => s.role === c.role)
    })),
    weeklyStaffCost: staff.reduce((s, x) => s + x.salary, 0)
  });
});
router.post("/hire", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const parsed = z.object({ role: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "role requis" });
  const def = CATALOG.find((c) => c.role === parsed.data.role);
  if (!def) return res.status(404).json({ error: "Profil staff inconnu" });
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const already = await prisma.staffMember.findFirst({ where: { teamId, role: def.role } });
  if (already) return res.status(400).json({ error: "Poste d\xE9j\xE0 pourvu" });
  if (team.budget < def.cost) return res.status(400).json({ error: "Budget insuffisant" });
  const member = await prisma.staffMember.create({
    data: {
      teamId,
      role: def.role,
      name: def.name,
      rating: def.rating,
      salary: def.salary,
      specialty: def.specialty
    }
  });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - def.cost }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "staff_hire",
      amount: -def.cost,
      reason: `Recrutement staff : ${def.name}`
    }
  });
  await prisma.message.create({
    data: {
      teamId,
      sender: "DIRECTION RH",
      title: "Nouveau staff",
      content: `${def.name} rejoint le club (${def.specialty}). Co\xFBt signature \xA3${def.cost.toLocaleString()}.`
    }
  });
  if (def.role === "medical" || def.role === "assistant") {
    await prisma.team.update({
      where: { id: teamId },
      data: { jobSecurity: Math.min(99, team.jobSecurity + 2) }
    });
  }
  res.status(201).json({ member, budget: team.budget - def.cost });
});
router.post("/fire/:staffId", async (req, res) => {
  const teamId = Number(req.params.teamId);
  const staffId = Number(req.params.staffId);
  const team = await owned(req.user.userId, teamId);
  if (!team) return res.status(404).json({ error: "\xC9quipe introuvable" });
  const member = await prisma.staffMember.findFirst({ where: { id: staffId, teamId } });
  if (!member) return res.status(404).json({ error: "Staff introuvable" });
  const severance = Math.round(member.salary * 4);
  if (team.budget < severance) return res.status(400).json({ error: `Indemnit\xE9 \xA3${severance} requise` });
  await prisma.staffMember.delete({ where: { id: staffId } });
  await prisma.team.update({
    where: { id: teamId },
    data: { budget: team.budget - severance, jobSecurity: Math.max(5, team.jobSecurity - 1) }
  });
  await prisma.transaction.create({
    data: {
      teamId,
      type: "staff_fire",
      amount: -severance,
      reason: `Licenciement ${member.name}`
    }
  });
  res.json({ ok: true, severance, budget: team.budget - severance });
});
var staff_default = router;
export {
  staff_default as default
};
