import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import { calculatePrice } from '../pricing/calculator.js';
import { DEFAULT_PRICING_CONFIG } from '../pricing/defaults.js';
import type { PricingConfig, PricingVersionRow } from '../pricing/types.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

function rowSummary(row: PricingVersionRow) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
  };
}

// GET /api/admin/pricing/versions — list all versions (without config payload).
router.get('/versions', async (_req, res, next) => {
  try {
    const { rows } = await query<PricingVersionRow>(
      'SELECT * FROM pricing_versions ORDER BY created_at DESC'
    );
    res.json(rows.map(rowSummary));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/pricing/versions/:id — full version incl. config.
router.get('/versions/:id', async (req, res, next) => {
  try {
    const { rows } = await query<PricingVersionRow>('SELECT * FROM pricing_versions WHERE id = $1', [
      req.params.id,
    ]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    res.json({ ...rowSummary(row), config: JSON.parse(row.config) as PricingConfig });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pricing/versions — create a draft.
// Body: { name, fromVersionId? } — copies that version's config, else the
// published one, else the built-in defaults.
router.post('/versions', async (req, res, next) => {
  try {
    const body = req.body as { name?: string; fromVersionId?: string };
    let sourceConfig: string | null = null;
    if (body.fromVersionId) {
      const { rows } = await query<PricingVersionRow>(
        'SELECT config FROM pricing_versions WHERE id = $1',
        [body.fromVersionId]
      );
      sourceConfig = rows[0]?.config ?? null;
    }
    if (!sourceConfig) {
      const { rows } = await query<PricingVersionRow>(
        "SELECT config FROM pricing_versions WHERE status = 'published' LIMIT 1"
      );
      sourceConfig = rows[0]?.config ?? null;
    }
    const id = generateId('pv');
    await query(
      'INSERT INTO pricing_versions (id, name, status, config) VALUES ($1, $2, $3, $4)',
      [id, body.name?.trim() || 'Untitled draft', 'draft', sourceConfig || JSON.stringify(DEFAULT_PRICING_CONFIG)]
    );
    const { rows } = await query<PricingVersionRow>('SELECT * FROM pricing_versions WHERE id = $1', [id]);
    res.status(201).json({ ...rowSummary(rows[0]), config: JSON.parse(rows[0].config) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/pricing/versions/:id — update a draft's name and/or config.
router.put('/versions/:id', async (req, res, next) => {
  try {
    const { rows } = await query<PricingVersionRow>('SELECT * FROM pricing_versions WHERE id = $1', [
      req.params.id,
    ]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    if (row.status !== 'draft') {
      res.status(409).json({ error: 'Only draft versions can be edited.' });
      return;
    }
    const body = req.body as { name?: string; config?: PricingConfig };
    const name = body.name?.trim() || row.name;
    const config = body.config ? JSON.stringify(body.config) : row.config;
    await query(
      "UPDATE pricing_versions SET name = $1, config = $2, updated_at = CURRENT_TIMESTAMP::text WHERE id = $3",
      [name, config, req.params.id]
    );
    const { rows: updated } = await query<PricingVersionRow>(
      'SELECT * FROM pricing_versions WHERE id = $1',
      [req.params.id]
    );
    res.json({ ...rowSummary(updated[0]), config: JSON.parse(updated[0].config) });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pricing/versions/:id/publish — archive the current published
// version and publish this one. Only affects NEW calculator views.
router.post('/versions/:id/publish', async (req, res, next) => {
  try {
    const { rows } = await query<PricingVersionRow>('SELECT * FROM pricing_versions WHERE id = $1', [
      req.params.id,
    ]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    await query("UPDATE pricing_versions SET status = 'archived' WHERE status = 'published'");
    await query(
      "UPDATE pricing_versions SET status = 'published', published_at = CURRENT_TIMESTAMP::text, updated_at = CURRENT_TIMESTAMP::text WHERE id = $1",
      [req.params.id]
    );
    const { rows: updated } = await query<PricingVersionRow>(
      'SELECT * FROM pricing_versions WHERE id = $1',
      [req.params.id]
    );
    res.json({ ...rowSummary(updated[0]), config: JSON.parse(updated[0].config) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/pricing/versions/:id — remove a draft (published/archived
// are kept for the audit trail).
router.delete('/versions/:id', async (req, res, next) => {
  try {
    const { rows } = await query<PricingVersionRow>('SELECT * FROM pricing_versions WHERE id = $1', [
      req.params.id,
    ]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }
    if (row.status !== 'draft') {
      res.status(409).json({ error: 'Only draft versions can be deleted.' });
      return;
    }
    await query('DELETE FROM pricing_versions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pricing/calculate — test a config (draft, unsaved) against
// the real engine. Body: { config, input: CalcInput }.
router.post('/calculate', async (req, res, next) => {
  try {
    const body = req.body as { config?: PricingConfig; input?: Record<string, unknown> };
    if (!body.config || !body.input) {
      res.status(400).json({ error: 'config and input are required' });
      return;
    }
    const input = body.input;
    const result = calculatePrice(
      {
        bodyAreaId: String(input.bodyAreaId || ''),
        widthCm: Number(input.widthCm),
        heightCm: Number(input.heightCm),
        styleId: String(input.styleId || ''),
        detailLevelId: String(input.detailLevelId || ''),
        colourOptionId: String(input.colourOptionId || ''),
        conditionId: String(input.conditionId || ''),
        transportFee: Number(input.transportFee) || 0,
      },
      body.config
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
