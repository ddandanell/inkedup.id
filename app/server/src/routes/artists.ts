import { Router } from 'express';
import { db } from '../db.js';
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
    rating: (row.rating as number) ?? 0,
    review_count: (row.review_count as number) ?? 0,
    portfolio_images: parseJson<string[]>(row.portfolio_images, []),
    availability: parseJson<string[]>(row.availability, []),
    pricing: parseJson<{ small: number; medium: number; large: number }>(row.pricing, { small: 0, medium: 0, large: 0 }),
    status: row.status as Artist['status'],
    years_of_experience: (row.years_of_experience as number) ?? 0,
    languages: parseJson<string[]>(row.languages, []),
    instagram: row.instagram as string | undefined,
    studio_id: row.studio_id as string | undefined,
    tier: (row.tier as Artist['tier']) ?? 'basic',
    commission_rate: (row.commission_rate as number) ?? 0.1,
    user_id: row.user_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// Unfiltered list (all statuses) is admin-only. Public pages use GET /active.
router.get('/', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM artists ORDER BY display_name').all() as Record<string, unknown>[];
    res.json(rows.map(rowToArtist));
  } catch (err) {
    next(err);
  }
});

router.get('/active', (_req, res, next) => {
  try {
    const rows = db.prepare("SELECT * FROM artists WHERE status = 'active' ORDER BY display_name").all() as Record<string, unknown>[];
    res.json(rows.map(rowToArtist));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM artists WHERE slug = ?').get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    res.json(rowToArtist(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Artist>;
    const id = generateId('artist');
    const slug = body.slug || body.display_name?.toLowerCase().replace(/\s+/g, '-') || id;
    db.prepare(
      `INSERT INTO artists (
        id, slug, first_name, last_name, display_name, photo, bio, specialties, styles, location,
        rating, review_count, portfolio_images, availability, pricing, status, years_of_experience,
        languages, instagram, studio_id, tier, commission_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
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
      body.commission_rate ?? 0.1
    );
    const row = db.prepare('SELECT * FROM artists WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToArtist(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }
    const body = req.body as Partial<Artist>;
    const fields: string[] = [];
    const values: unknown[] = [];
    const jsonFields: (keyof Artist)[] = ['specialties', 'styles', 'portfolio_images', 'availability', 'pricing', 'languages'];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      if (jsonFields.includes(key as keyof Artist)) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) {
      res.json(rowToArtist(existing));
      return;
    }
    values.push(req.params.id);
    db.prepare(`UPDATE artists SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
    const row = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToArtist(row));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    db.prepare('DELETE FROM artists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
