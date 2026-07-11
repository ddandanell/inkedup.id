import { Router } from 'express';
import { db } from '../db.js';
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
    published: (row.published as number) ?? 1,
    updated_at: row.updated_at as string,
  };
}

router.get('/', (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM content_pages WHERE published = 1 ORDER BY title').all() as Record<string, unknown>[];
    res.json(rows.map(rowToContentPage));
  } catch (err) {
    next(err);
  }
});

router.get('/all', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM content_pages ORDER BY title').all() as Record<string, unknown>[];
    res.json(rows.map(rowToContentPage));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM content_pages WHERE slug = ?').get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    res.json(rowToContentPage(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<ContentPage>;
    const id = generateId('page');
    db.prepare(
      'INSERT INTO content_pages (id, slug, title, meta_description, body, page_type, schema_json, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      body.slug || '',
      body.title || '',
      body.meta_description || null,
      body.body || null,
      body.page_type || 'general',
      body.schema_json || null,
      body.published ?? 1
    );
    const row = db.prepare('SELECT * FROM content_pages WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToContentPage(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM content_pages WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const body = req.body as Partial<ContentPage>;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) {
      res.json(rowToContentPage(existing));
      return;
    }
    values.push(req.params.id);
    db.prepare(`UPDATE content_pages SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
    const row = db.prepare('SELECT * FROM content_pages WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToContentPage(row));
  } catch (err) {
    next(err);
  }
});

export default router;
