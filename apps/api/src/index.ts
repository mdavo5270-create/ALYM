import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'alym-api', version: '0.1.0' });
});

app.get('/api', (_req, res) => {
  res.json({
    name: 'ALYM API',
    endpoints: {
      health: 'GET /health',
      auth: '/api/auth/*',
      teams: '/api/teams/*',
      players: '/api/players/*',
      leagues: '/api/leagues/*',
      matches: '/api/matches/*',
      shop: '/api/shop/*',
      messages: '/api/teams/:id/messages',
    },
  });
});

app.listen(PORT, () => {
  console.log(`ALYM API running on http://localhost:${PORT}`);
});
