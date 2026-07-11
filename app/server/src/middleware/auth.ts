import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import type { User } from '../types.js';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  if (!secret || secret === 'inkedup-local-dev-secret-change-me') {
    if (isProd) {
      throw new Error('JWT_SECRET must be set to a strong random value in production');
    }
    return 'inkedup-local-dev-secret-change-me';
  }
  return secret;
})();

export interface AuthRequest extends Request {
  user?: User;
}

export function signToken(user: Pick<User, 'id' | 'role' | 'email' | 'name'>): string {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; role: string; email: string; name: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string; name: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = verifyToken(header.slice(7));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as User | undefined;
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
