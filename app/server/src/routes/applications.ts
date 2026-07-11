import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import { parseJson } from '../utils/dbHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Application } from '../types.js';

const router = Router();

function rowToApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    studio_name: row.studio_name as string,
    artist_name: (row.artist_name as string | undefined) || undefined,
    owner_name: (row.owner_name as string | undefined) || undefined,
    number_of_artists: row.number_of_artists == null ? undefined : Number(row.number_of_artists),
    email: row.email as string,
    whatsapp_number: row.whatsapp_number as string,
    portfolio_url: row.portfolio_url as string | undefined,
    bio: row.bio as string | undefined,
    specialties: parseJson<string[]>(row.specialties, []),
    styles: parseJson<string[]>(row.styles, []),
    location: row.location as string,
    years_of_experience: Number(row.years_of_experience) || 0,
    languages: parseJson<string[]>(row.languages, []),
    instagram: row.instagram as string | undefined,
    status: row.status as Application['status'],
    submitted_at: row.submitted_at as string,
    reviewed_at: row.reviewed_at as string | undefined,
    review_notes: row.review_notes as string | undefined,
    decided_at: row.decided_at as string | undefined,
  };
}

router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM applications ORDER BY submitted_at DESC');
    res.json(rows.map(rowToApplication));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json(rowToApplication(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<Application>;
    if (!body.studio_name || !body.studio_name.trim()) {
      res.status(400).json({ error: 'Studio name is required' });
      return;
    }
    const id = generateId('app');
    await query(
      `INSERT INTO applications (
        id, studio_name, artist_name, owner_name, number_of_artists, email, whatsapp_number, portfolio_url, bio, specialties, styles,
        location, years_of_experience, languages, instagram, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        body.studio_name,
        body.artist_name || body.owner_name || null,
        body.owner_name || null,
        body.number_of_artists ?? null,
        body.email || '',
        body.whatsapp_number || '',
        body.portfolio_url || null,
        body.bio || null,
        JSON.stringify(body.specialties || []),
        JSON.stringify(body.styles || []),
        body.location || '',
        body.years_of_experience || 0,
        JSON.stringify(body.languages || []),
        body.instagram || null,
        'pending',
      ]
    );
    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [id]);
    res.status(201).json(rowToApplication(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/approve', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: appRows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    const appRow = appRows[0];
    if (!appRow) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    const application = rowToApplication(appRow);
    if (application.status !== 'pending') {
      res.status(400).json({ error: 'Application already decided' });
      return;
    }

    const studioId = generateId('studio');
    await query(
      'INSERT INTO studios (id, name, email, whatsapp_number, location, status, artist_ids, instagram, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        studioId,
        application.studio_name,
        application.email,
        application.whatsapp_number,
        application.location,
        'active',
        '[]',
        application.instagram || null,
        application.bio || null,
      ]
    );

    const leadName = application.owner_name || application.artist_name || application.studio_name;
    const artistId = generateId('artist');
    const slug = leadName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || generateId('artist');
    const names = leadName.split(' ').filter(Boolean);
    await query(
      `INSERT INTO artists (
        id, slug, first_name, last_name, display_name, photo, bio, specialties, styles, location,
        rating, review_count, portfolio_images, availability, pricing, status, years_of_experience,
        languages, instagram, studio_id, tier, commission_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        artistId,
        slug,
        names[0] || leadName,
        names.slice(1).join(' ') || '',
        leadName,
        '/artist-1.jpg',
        application.bio || '',
        JSON.stringify(application.specialties),
        JSON.stringify(application.styles),
        application.location,
        0,
        0,
        '[]',
        JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
        JSON.stringify({ small: 800000, medium: 1600000, large: 3200000 }),
        'active',
        application.years_of_experience,
        JSON.stringify(application.languages),
        application.instagram || null,
        studioId,
        'basic',
        0.10,
      ]
    );

    await query('UPDATE studios SET artist_ids = $1 WHERE id = $2', [JSON.stringify([artistId]), studioId]);
    await query(
      "UPDATE applications SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP::text, decided_at = CURRENT_TIMESTAMP::text WHERE id = $1",
      [req.params.id]
    );

    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    res.json({ application: rowToApplication(rows[0]), studioId, artistId });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/reject', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { review_notes } = req.body as { review_notes?: string };
    await query(
      "UPDATE applications SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP::text, decided_at = CURRENT_TIMESTAMP::text, review_notes = $1 WHERE id = $2",
      [review_notes || null, req.params.id]
    );
    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    res.json(rowToApplication(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    const body = req.body as Partial<Application>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    const jsonFields: (keyof Application)[] = ['specialties', 'styles', 'languages'];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(jsonFields.includes(key as keyof Application) ? JSON.stringify(value) : value);
    }
    if (setClauses.length === 0) {
      res.json(rowToApplication(existing));
      return;
    }
    values.push(req.params.id);
    await query(`UPDATE applications SET ${setClauses.join(', ')} WHERE id = $${i}`, values);
    const { rows } = await query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    res.json(rowToApplication(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
