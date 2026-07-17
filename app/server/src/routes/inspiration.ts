import { Router } from 'express';
import { query } from '../db.js';
import { parseJson } from '../utils/dbHelpers.js';
import type { InspirationImage } from '../types.js';

const router = Router();

function rowToInspirationImage(row: Record<string, unknown>): InspirationImage {
  return {
    id: row.id as string,
    source: row.source as InspirationImage['source'],
    source_id: row.source_id as string | undefined,
    source_url: row.source_url as string,
    image_url: row.image_url as string,
    thumbnail_url: row.thumbnail_url as string | undefined,
    title: row.title as string | undefined,
    creator: row.creator as string | undefined,
    creator_url: row.creator_url as string | undefined,
    license: row.license as string,
    license_url: row.license_url as string | undefined,
    tags: parseJson<string[]>(row.tags, []),
    styles: parseJson<string[]>(row.styles, []),
    placement: row.placement as string | undefined,
    status: row.status as InspirationImage['status'],
    is_featured: Number(row.is_featured) || 0,
    attribution_required: Number(row.attribution_required) || 1,
    scraped_at: row.scraped_at as string | undefined,
    created_at: row.created_at as string | undefined,
  };
}

// Public: list approved inspiration images with optional filtering.
router.get('/', async (req, res, next) => {
  try {
    const { style, q, limit = '100', offset = '0' } = req.query as Record<string, string>;

    const conditions = ["status = 'approved'"];
    const values: unknown[] = [];
    let i = 1;

    if (style) {
      conditions.push(`styles::jsonb @> $${i++}::jsonb`);
      values.push(JSON.stringify([style]));
    }

    if (q) {
      conditions.push(`(title ILIKE $${i++} OR creator ILIKE $${i++} OR tags::jsonb::text ILIKE $${i++})`);
      const like = `%${q}%`;
      values.push(like, like, like);
    }

    const where = conditions.join(' AND ');
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM inspiration_images WHERE ${where}`,
      values
    );

    const { rows } = await query(
      `SELECT * FROM inspiration_images WHERE ${where} ORDER BY is_featured DESC, created_at DESC LIMIT $${i++} OFFSET $${i++}`,
      [...values, Number(limit), Number(offset)]
    );

    res.json({
      data: rows.map(rowToInspirationImage),
      total: countResult.rows[0].count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    next(err);
  }
});

// Public: list distinct styles present in approved images.
router.get('/styles', async (_req, res, next) => {
  try {
    const { rows } = await query<{ style: string; count: number }>(
      "SELECT jsonb_array_elements_text(styles::jsonb) as style, COUNT(*)::int as count FROM inspiration_images WHERE status = 'approved' GROUP BY style ORDER BY count DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
