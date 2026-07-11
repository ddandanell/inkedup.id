import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { User } from '../types.js';

const router = Router();

function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    // Public registration always creates a customer. Admin/artist roles are
    // assigned by an existing admin — never trusted from the request body.
    const role = 'customer';
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const hash = bcrypt.hashSync(password, 10);
    const id = generateId('user');
    await query(
      'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, email, phone || null, hash, role]
    );
    const { rows } = await query<User>('SELECT * FROM users WHERE id = $1', [id]);
    const user = rows[0];
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const { id, name, email, role, phone } = req.user!;
  res.json({ id, name, email, role, phone });
});

router.get('/users', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
