import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Location } from '../types.js';

const router = Router();

function rowToLocation(row: Record<string, unknown>): Location {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    zone: (row.zone as number) ?? 1,
    call_out_fee: (row.call_out_fee as number) ?? 0,
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    description: row.description as string | undefined,
    priority: (row.priority as number) ?? 0,
    published: (row.published as number) ?? 1,
  };
}

router.get('/', (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM locations WHERE published = 1 ORDER BY priority DESC, name').all() as Record<string, unknown>[];
    res.json(rows.map(rowToLocation));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM locations WHERE slug = ?').get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(rowToLocation(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Location>;
    const id = generateId('loc');
    db.prepare(
      'INSERT INTO locations (id, name, slug, zone, call_out_fee, latitude, longitude, description, priority, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      body.name || '',
      body.slug || '',
      body.zone || 1,
      body.call_out_fee ?? 0,
      body.latitude || null,
      body.longitude || null,
      body.description || null,
      body.priority || 0,
      body.published ?? 1
    );
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToLocation(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    const body = req.body as Partial<Location>;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) {
      res.json(rowToLocation(existing));
      return;
    }
    values.push(req.params.id);
    db.prepare(`UPDATE locations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToLocation(row));
  } catch (err) {
    next(err);
  }
});

export default router;
