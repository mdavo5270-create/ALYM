/** Simple in-memory rate limit (per IP). OK for MVP single instance. */
const hits = new Map();
export function rateLimit(max = 60, windowMs = 60_000) {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const row = hits.get(ip);
        if (!row || now > row.reset) {
            hits.set(ip, { count: 1, reset: now + windowMs });
            return next();
        }
        row.count += 1;
        if (row.count > max) {
            return res.status(429).json({ error: 'Trop de requêtes, réessaie plus tard' });
        }
        next();
    };
}
export function securityHeaders(_req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-XSS-Protection', '0');
    next();
}
export function requireJwtSecret() {
    const s = process.env.JWT_SECRET;
    if (!s || s.length < 24 || s.includes('change-me') || s.includes('dev-secret')) {
        if (process.env.NODE_ENV === 'production') {
            console.error('FATAL: JWT_SECRET manquant ou trop faible en production');
            process.exit(1);
        }
        console.warn('WARNING: JWT_SECRET faible — OK en dev uniquement');
    }
}
