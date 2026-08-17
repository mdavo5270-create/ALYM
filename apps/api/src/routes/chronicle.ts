import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listChronicle, seasonReview } from '../lib/chronicle.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

function teamIdParam(req: { params: Record<string, string | undefined> }) {
  return Number(req.params.teamId);
}

router.get('/', async (req, res) => {
  const teamId = teamIdParam(req);
  const season = req.query.season ? Number(req.query.season) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 40;
  const entries = await listChronicle(teamId, { season, limit });
  res.json({ entries });
});

router.get('/season-review', async (req, res) => {
  const teamId = teamIdParam(req);
  const season = req.query.season ? Number(req.query.season) : 1;
  const review = await seasonReview(teamId, season);
  if (!review) return res.status(404).json({ error: 'Équipe introuvable' });
  res.json(review);
});

export default router;
