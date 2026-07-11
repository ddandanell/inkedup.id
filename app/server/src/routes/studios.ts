import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import { parseJson } from '../utils/dbHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Studio } from '../types.js';

const router = Router();

function rowToStudio(row: Record<string, unknown>): Studio {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    whatsapp_number: row.whatsapp_number as string,
    location: row.location as string,
    address: row.address as string | undefined,
    status: row.status as Studio['status'],
    artist_ids: parseJson<string[]>(row.artist_ids, []),
    instagram: row.instagram as string | undefined,
    bio: row.bio as string | undefined,
    logo_url: row.logo_url as string | undefined,
    verified_at: row.verified_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// Unfiltered list (all statuses) is admin-only. Public pages use GET /active.
router.get('/', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM studios ORDER BY name').all() as Record<string, unknown>[];
    res.json(rows.map(rowToStudio));
  } catch (err) {
    next(err);
  }
});

router.get('/active', (_req, res, next) => {
  try {
    const rows = db.prepare("SELECT * FROM studios WHERE status = 'active' ORDER BY name").all() as Record<string, unknown>[];
    res.json(rows.map(rowToStudio));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM studios WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Studio not found' });
      return;
    }
    res.json(rowToStudio(row));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/artists', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM artists WHERE studio_id = ?').all(req.params.id) as Record<string, unknown>[];
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Studio>;
    const id = generateId('studio');
    db.prepare(
      'INSERT INTO studios (id, name, email, whatsapp_number, location, address, status, artist_ids, instagram, bio, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      body.name || '',
      body.email || '',
      body.whatsapp_number || '',
      body.location || '',
      body.address || null,
      body.status || 'pending',
      JSON.stringify(body.artist_ids || []),
      body.instagram || null,
      body.bio || null,
      body.logo_url || null
    );
    const row = db.prepare('SELECT * FROM studios WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToStudio(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM studios WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Studio not found' });
      return;
    }
    const body = req.body as Partial<Studio>;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      if (key === 'artist_ids') {
        fields.push('artist_ids = ?');
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) {
      res.json(rowToStudio(existing));
      return;
    }
    values.push(req.params.id);
    db.prepare(`UPDATE studios SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
    const row = db.prepare('SELECT * FROM studios WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToStudio(row));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    db.prepare('DELETE FROM studios WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
