import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/** Message unique login/register — anti-énumération d'emails */
const AUTH_FAIL = 'Email ou mot de passe incorrect';

const registerSchema = z.object({
  email: z.string().email().max(254).transform((e) => e.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Mot de passe : 8 caractères minimum')
    .max(128)
    .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), {
      message: 'Mot de passe : au moins une lettre et un chiffre',
    }),
  username: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Identifiant invalide')
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(254).transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    // Ne pas détailler le schéma en prod au-delà du premier message métier
    const msg = parsed.error.errors[0]?.message || 'Données invalides';
    return res.status(400).json({ error: msg });
  }
  const { email, password, username } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await sleep(200 + Math.floor(Math.random() * 200));
    return res.status(409).json({ error: 'Impossible de créer ce compte' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username: username ?? email.split('@')[0].slice(0, 30),
    },
  });

  // MVP : pas d'email confirmation obligatoire (flag futur EMAIL_VERIFY=1)
  // Si EMAIL_VERIFY=1, on ne renvoie pas de token tant que non vérifié.
  if (process.env.EMAIL_VERIFY === '1') {
    return res.status(201).json({
      ok: true,
      message: 'Compte créé. Vérifie ton email avant de te connecter.',
      userId: user.id,
    });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: AUTH_FAIL });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Timing roughly constant: toujours un compare si possible
  const hash = user?.passwordHash ?? '$2a$12$invalidhashinvalidhashinvalidho';
  const ok = await bcrypt.compare(password, hash);
  if (!user?.passwordHash || !ok) {
    await sleep(100 + Math.floor(Math.random() * 150));
    return res.status(401).json({ error: AUTH_FAIL });
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      username: true,
      teams: { select: { id: true, name: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ user });
});

export default router;
