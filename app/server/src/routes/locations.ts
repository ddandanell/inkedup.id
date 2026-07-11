import { Router } from 'express';
import { query } from '../db.js';
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
    zone: Number(row.zone) || 1,
    call_out_fee: Number(row.call_out_fee) || 0,
    latitude: row.latitude == null ? undefined : Number(row.latitude),
    longitude: row.longitude == null ? undefined : Number(row.longitude),
    description: row.description as string | undefined,
    priority: Number(row.priority) || 0,
    published: Number(row.published) || 0,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM locations WHERE published = 1 ORDER BY priority DESC, name');
    res.json(rows.map(rowToLocation));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM locations WHERE slug = $1', [req.params.slug]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(rowToLocation(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Location>;
    const id = generateId('loc');
    await query(
      'INSERT INTO locations (id, name, slug, zone, call_out_fee, latitude, longitude, description, priority, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        id,
        body.name || '',
        body.slug || '',
        body.zone || 1,
        body.call_out_fee ?? 0,
        body.latitude || null,
        body.longitude || null,
        body.description || null,
        body.priority || 0,
        body.published ?? 1,
      ]
    );
    const { rows } = await query('SELECT * FROM locations WHERE id = $1', [id]);
    res.status(201).json(rowToLocation(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM locations WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    const body = req.body as Partial<Location>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(value);
    }
    if (setClauses.length === 0) {
      res.json(rowToLocation(existing));
      return;
    }
    values.push(req.params.id);
    await query(`UPDATE locations SET ${setClauses.join(', ')} WHERE id = $${i}`, values);
    const { rows } = await query('SELECT * FROM locations WHERE id = $1', [req.params.id]);
    res.json(rowToLocation(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
