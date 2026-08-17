import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'alym-api', version: '0.1.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

app.get('/api', (_req, res) => {
  res.json({
    name: 'ALYM API',
    endpoints: {
      health: 'GET /health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      teams: 'GET|POST /api/teams',
      team: 'GET /api/teams/:id',
    },
  });
});

app.listen(PORT, () => {
  console.log(`ALYM API running on http://localhost:${PORT}`);
});
