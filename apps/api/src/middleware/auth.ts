import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthPayload = { userId: number; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

/** Sessions qui expirent — défaut 24h prod, 7j dev */
export function signToken(payload: AuthPayload): string {
  const expiresIn =
    process.env.JWT_EXPIRES_IN ||
    (process.env.NODE_ENV === 'production' ? '24h' : '7d');
  return jwt.sign(payload, secret(), { expiresIn } as jwt.SignOptions);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, secret()) as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
