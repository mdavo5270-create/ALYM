import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAuth } from '../middleware/auth.js';
const router = Router();
const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Mot de passe : 6 caractères minimum'),
    username: z.string().min(2).max(30).optional(),
});
const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});
function firstZodError(error) {
    const field = error.flatten().fieldErrors;
    const first = Object.values(field).flat()[0];
    return first || 'Données invalides';
}
router.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: firstZodError(parsed.error) });
    }
    const { email, password, username } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, passwordHash, username: username ?? email.split('@')[0] },
    });
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
    });
});
router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: firstZodError(parsed.error) });
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
    });
});
router.get('/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, username: true, teams: { select: { id: true, name: true } } },
    });
    if (!user)
        return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user });
});
export default router;
