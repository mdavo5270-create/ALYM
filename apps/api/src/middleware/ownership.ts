import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * Vérifie côté serveur que le teamId appartient à l'utilisateur authentifié.
 * À utiliser après requireAuth sur toutes les routes /teams/:teamId/*
 */
export async function requireTeamOwner(req: Request, res: Response, next: NextFunction) {
  const teamId = Number((req.params as Record<string, string>).teamId);
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return res.status(400).json({ error: 'Équipe invalide' });
  }
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const team = await prisma.team.findFirst({
    where: { id: teamId, userId: req.user.userId },
    select: { id: true },
  });
  if (!team) {
    return res.status(404).json({ error: 'Équipe introuvable' });
  }
  (req as Request & { teamId?: number }).teamId = teamId;
  next();
}
