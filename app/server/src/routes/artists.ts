import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import { parseJson } from '../utils/dbHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Artist } from '../types.js';

const router = Router();

function rowToArtist(row: Record<string, unknown>): Artist {
  return {
    id: row.id as string,
    slug: row.slug as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    display_name: row.display_name as string,
    photo: row.photo as string | undefined,
    bio: row.bio as string | undefined,
    specialties: parseJson<string[]>(row.specialties, []),
    styles: parseJson<string[]>(row.styles, []),
    location: row.location as string,
    rating: Number(row.rating) || 0,
    review_count: Number(row.review_count) || 0,
    portfolio_images: parseJson<string[]>(row.portfolio_images, []),
    availability: parseJson<string[]>(row.availability, []),
    pricing: parseJson<{ small: number; medium: number; large: number }>(row.pricing, { small: 0, medium: 0, large: 0 }),
    status: row.status as Artist['status'],
    years_of_experience: Number(row.years_of_experience) || 0,
    languages: parseJson<string[]>(row.languages, []),
    instagram: row.instagram as string | undefined,
    studio_id: row.studio_id as string | undefined,
    tier: (row.tier as Artist['tier']) ?? 'basic',
    commission_rate: Number(row.commission_rate) || 0.1,
    user_id: row.user_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// Unfiltered list (all statuses) is admin-only. Public pages use GET /active.
router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM artists ORDER BY display_name');
    res.json(rows.map(rowToArtist));
  } catch (err) {
    next(err);
  }
});

router.get('/active', async (_req, res, next) => {
  try {
    const { rows } = await query("SELECT * FROM artists WHERE status = 'active' ORDER BY display_name");
    res.json(rows.map(rowToArtist));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM artists WHERE slug = $1', [req.params.slug]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json(rowToArtist(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Artist>;
    const id = generateId('artist');
    const slug = body.slug || body.display_name?.toLowerCase().replace(/\s+/g, '-') || id;
    await query(
      `INSERT INTO artists (
        id, slug, first_name, last_name, display_name, photo, bio, specialties, styles, location,
        rating, review_count, portfolio_images, availability, pricing, status, years_of_experience,
        languages, instagram, studio_id, tier, commission_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        id,
        slug,
        body.first_name || '',
        body.last_name || '',
        body.display_name || '',
        body.photo || null,
        body.bio || null,
        JSON.stringify(body.specialties || []),
        JSON.stringify(body.styles || []),
        body.location || '',
        body.rating || 0,
        body.review_count || 0,
        JSON.stringify(body.portfolio_images || []),
        JSON.stringify(body.availability || []),
        JSON.stringify(body.pricing || { small: 0, medium: 0, large: 0 }),
        body.status || 'pending',
        body.years_of_experience || 0,
        JSON.stringify(body.languages || []),
        body.instagram || null,
        body.studio_id || null,
        body.tier || 'basic',
        body.commission_rate ?? 0.1,
      ]
    );
    const { rows } = await query('SELECT * FROM artists WHERE id = $1', [id]);
    res.status(201).json(rowToArtist(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    const body = req.body as Partial<Artist>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const jsonFields: (keyof Artist)[] = ['specialties', 'styles', 'portfolio_images', 'availability', 'pricing', 'languages'];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(jsonFields.includes(key as keyof Artist) ? JSON.stringify(value) : value);
    }
    if (setClauses.length === 0) {
      res.json(rowToArtist(existing));
      return;
    }
    values.push(req.params.id);
    await query(
      `UPDATE artists SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP::text WHERE id = $${i}`,
      values
    );
    const { rows } = await query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
    res.json(rowToArtist(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    await query('DELETE FROM artists WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
