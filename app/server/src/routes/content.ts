import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { ContentPage } from '../types.js';

const router = Router();

function rowToContentPage(row: Record<string, unknown>): ContentPage {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    meta_description: row.meta_description as string | undefined,
    body: row.body as string | undefined,
    page_type: row.page_type as ContentPage['page_type'],
    schema_json: row.schema_json as string | undefined,
    published: Number(row.published) || 0,
    updated_at: row.updated_at as string,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM content_pages WHERE published = 1 ORDER BY title');
    res.json(rows.map(rowToContentPage));
  } catch (err) {
    next(err);
  }
});

router.get('/all', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM content_pages ORDER BY title');
    res.json(rows.map(rowToContentPage));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM content_pages WHERE slug = $1', [req.params.slug]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(rowToContentPage(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<ContentPage>;
    const id = generateId('page');
    await query(
      'INSERT INTO content_pages (id, slug, title, meta_description, body, page_type, schema_json, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        id,
        body.slug || '',
        body.title || '',
        body.meta_description || null,
        body.body || null,
        body.page_type || 'general',
        body.schema_json || null,
        body.published ?? 1,
      ]
    );
    const { rows } = await query('SELECT * FROM content_pages WHERE id = $1', [id]);
    res.status(201).json(rowToContentPage(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM content_pages WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const body = req.body as Partial<ContentPage>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(value);
    }
    if (setClauses.length === 0) {
      res.json(rowToContentPage(existing));
      return;
    }
    values.push(req.params.id);
    await query(
      `UPDATE content_pages SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP::text WHERE id = $${i}`,
      values
    );
    const { rows } = await query('SELECT * FROM content_pages WHERE id = $1', [req.params.id]);
    res.json(rowToContentPage(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
