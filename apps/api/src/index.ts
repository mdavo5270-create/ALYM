import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import messageRoutes from './routes/messages.js';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import shopRoutes from './routes/shop.js';
import achievementRoutes from './routes/achievements.js';
import budgetRoutes from './routes/budget.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'alym-api', version: '0.2.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/teams/:teamId/messages', messageRoutes);
app.use('/api/teams/:teamId/players', playerRoutes);
app.use('/api/teams/:teamId/matches', matchRoutes);
app.use('/api/teams/:teamId/shop', shopRoutes);
app.use('/api/teams/:teamId/achievements', achievementRoutes);
app.use('/api/teams/:teamId/budget', budgetRoutes);

app.get('/api', (_req, res) => {
  res.json({
    name: 'ALYM API',
    version: '0.2.0',
    endpoints: [
      'POST /api/auth/register|login',
      'GET /api/auth/me',
      'GET|POST /api/teams',
      'GET /api/teams/:id',
      'GET /api/teams/:teamId/messages',
      'GET /api/teams/:teamId/players',
      'POST /api/teams/:teamId/matches/play',
      'GET|POST /api/teams/:teamId/shop',
      'GET /api/teams/:teamId/achievements',
      'GET /api/teams/:teamId/budget',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`ALYM API running on http://localhost:${PORT}`);
});
