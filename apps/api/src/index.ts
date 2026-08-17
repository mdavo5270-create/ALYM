import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import messageRoutes from './routes/messages.js';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import shopRoutes from './routes/shop.js';
import achievementRoutes from './routes/achievements.js';
import budgetRoutes from './routes/budget.js';
import careerRoutes from './routes/career.js';
import liveRoutes from './routes/live.js';
import legendRoutes from './routes/legends.js';
import managerMarketRoutes from './routes/managerMarket.js';
import { rateLimit, securityHeaders, requireJwtSecret } from './middleware/security.js';

requireJwtSecret();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit(120, 60_000));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'alym', version: '0.7.0', studio: 'LA MYLA' });
});

app.use('/api/auth', rateLimit(20, 60_000), authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/teams/:teamId/messages', messageRoutes);
app.use('/api/teams/:teamId/players', playerRoutes);
app.use('/api/teams/:teamId/matches', matchRoutes);
app.use('/api/teams/:teamId/shop', shopRoutes);
app.use('/api/teams/:teamId/achievements', achievementRoutes);
app.use('/api/teams/:teamId/budget', budgetRoutes);
app.use('/api/teams/:teamId/career', careerRoutes);
app.use('/api/teams/:teamId/live', liveRoutes);
app.use('/api/teams/:teamId/legends', legendRoutes);
app.use('/api/teams/:teamId/manager-market', managerMarketRoutes);

app.get('/api', (_req, res) => {
  res.json({ name: 'ALYM API', version: '0.7.0', studio: 'LA MYLA' });
});

const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') return next();
  res.sendFile(path.join(webDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend not built' });
  });
});

app.listen(PORT, () => {
  console.log(`ALYM running on port ${PORT}`);
});
