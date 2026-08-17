import jwt from 'jsonwebtoken';
const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';
export function signToken(payload) {
    return jwt.sign(payload, secret(), { expiresIn: '7d' });
}
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    try {
        const token = header.slice(7);
        req.user = jwt.verify(token, secret());
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token invalide' });
    }
}
