import { Router } from 'express';
import { query } from '../db.js';
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
router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM studios ORDER BY name');
    res.json(rows.map(rowToStudio));
  } catch (err) {
    next(err);
  }
});

router.get('/active', async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM studios WHERE status = 'active' ORDER BY name");
    res.json(rows.map(rowToStudio));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM studios WHERE id = $1', [req.params.id]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Studio not found' });
      return;
    }
    res.json(rowToStudio(row));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/artists', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM artists WHERE studio_id = $1', [req.params.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Studio>;
    const id = generateId('studio');
    await query(
      'INSERT INTO studios (id, name, email, whatsapp_number, location, address, status, artist_ids, instagram, bio, logo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
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
        body.logo_url || null,
      ]
    );
    const { rows } = await query('SELECT * FROM studios WHERE id = $1', [id]);
    res.status(201).json(rowToStudio(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM studios WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Studio not found' });
      return;
    }
    const body = req.body as Partial<Studio>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(key === 'artist_ids' ? JSON.stringify(value) : value);
    }
    if (setClauses.length === 0) {
      res.json(rowToStudio(existing));
      return;
    }
    values.push(req.params.id);
    await query(
      `UPDATE studios SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP::text WHERE id = $${i}`,
      values
    );
    const { rows } = await query('SELECT * FROM studios WHERE id = $1', [req.params.id]);
    res.json(rowToStudio(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    await query('DELETE FROM studios WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
