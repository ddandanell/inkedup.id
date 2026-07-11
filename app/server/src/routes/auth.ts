import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { User } from '../types.js';

const router = Router();

router.post('/register', (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    // Public registration always creates a customer. Admin/artist roles are
    // assigned by an existing admin — never trusted from the request body.
    const role = 'customer';
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const hash = bcrypt.hashSync(password, 10);
    const id = generateId('user');
    db.prepare(
      'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, phone || null, hash, role);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
    res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const { id, name, email, role, phone } = req.user!;
  res.json({ id, name, email, role, phone });
});

router.get('/users', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

export default router;
