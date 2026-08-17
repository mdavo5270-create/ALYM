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
import eventRoutes from './routes/events.js';
import staffRoutes from './routes/staff.js';
import competitionRoutes from './routes/competitions.js';
import transferRoutes from './routes/transfers.js';
import chronicleRoutes from './routes/chronicle.js';
import { requireAuth } from './middleware/auth.js';
import { requireTeamOwner } from './middleware/ownership.js';
import {
  rateLimit,
  securityHeaders,
  requireJwtSecret,
  productionErrorHandler,
  rejectUploads,
  logInfo,
} from './middleware/security.js';

requireJwtSecret();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(rejectUploads);

const corsOrigin = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigin && corsOrigin.length ? corsOrigin : isProd ? false : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);

app.use(
  express.json({
    limit: '100kb',
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);
app.use(rateLimit(120, 60_000));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'alym',
    version: '1.0.1-secure',
    studio: 'LA MYLA',
    feature: 'chronicle',
  });
});

// Auth — rate limit strict (anti brute-force)
app.use('/api/auth', rateLimit(10, 60_000), authRoutes);

// Teams list/create (auth inside router)
app.use('/api/teams', teamRoutes);

// Toutes les routes club : JWT + ownership serveur
const teamScoped = [
  ['/api/teams/:teamId/messages', messageRoutes],
  ['/api/teams/:teamId/players', playerRoutes],
  ['/api/teams/:teamId/matches', matchRoutes],
  ['/api/teams/:teamId/shop', shopRoutes],
  ['/api/teams/:teamId/achievements', achievementRoutes],
  ['/api/teams/:teamId/budget', budgetRoutes],
  ['/api/teams/:teamId/career', careerRoutes],
  ['/api/teams/:teamId/live', liveRoutes],
  ['/api/teams/:teamId/legends', legendRoutes],
  ['/api/teams/:teamId/manager-market', managerMarketRoutes],
  ['/api/teams/:teamId/events', eventRoutes],
  ['/api/teams/:teamId/staff', staffRoutes],
  ['/api/teams/:teamId/competitions', competitionRoutes],
  ['/api/teams/:teamId/transfers', transferRoutes],
  ['/api/teams/:teamId/chronicle', chronicleRoutes],
] as const;

for (const [pathPrefix, routes] of teamScoped) {
  app.use(pathPrefix, requireAuth, requireTeamOwner, routes);
}

app.get('/api', (_req, res) => {
  res.json({ name: 'ALYM API', version: '1.0.1-secure', studio: 'LA MYLA' });
});

const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist, { maxAge: isProd ? '1h' : 0 }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') return next();
  res.sendFile(path.join(webDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend not built' });
  });
});

app.use(productionErrorHandler);

app.listen(PORT, () => {
  logInfo(`ALYM running on port ${PORT}`);
  const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl.replace(/\/$/, '')}/health`).catch(() => undefined);
    }, 8 * 60 * 1000);
  }
});
