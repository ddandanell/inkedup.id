import { Router } from 'express';
import { query } from '../db.js';
import { calculatePrice } from '../pricing/calculator.js';
import { getPublishedPricing } from '../pricing/versionResolver.js';

const router = Router();

interface TransportLocation {
  id: string;
  name: string;
  slug: string;
  zone: number;
  fee: number;
}

async function getTransportLocations(): Promise<TransportLocation[]> {
  const { rows } = await query(
    'SELECT id, name, slug, zone, call_out_fee FROM locations WHERE published = 1 ORDER BY priority DESC, name'
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    zone: Number(r.zone) || 1,
    fee: Number(r.call_out_fee) || 0,
  }));
}

async function resolveTransportFee(locationId?: string): Promise<number> {
  if (!locationId) return 0;
  const { rows } = await query('SELECT call_out_fee FROM locations WHERE id = $1', [locationId]);
  return rows[0] ? Number(rows[0].call_out_fee) || 0 : 0;
}

// GET /api/pricing — published config + transport zones for the calculator.
router.get('/', async (_req, res, next) => {
  try {
    const published = await getPublishedPricing();
    if (!published) {
      res.status(503).json({ error: 'Pricing is not configured yet.' });
      return;
    }
    const transport = await getTransportLocations();
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      version: { id: published.id, name: published.name, publishedAt: published.publishedAt },
      config: published.config,
      transport,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/pricing/calculate — server-authoritative price for a selection.
router.post('/calculate', async (req, res, next) => {
  try {
    const published = await getPublishedPricing();
    if (!published) {
      res.status(503).json({ error: 'Pricing is not configured yet.' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const transportFee = await resolveTransportFee(body.locationId as string | undefined);
    const result = calculatePrice(
      {
        bodyAreaId: String(body.bodyAreaId || ''),
        widthCm: Number(body.widthCm),
        heightCm: Number(body.heightCm),
        styleId: String(body.styleId || ''),
        detailLevelId: String(body.detailLevelId || ''),
        colourOptionId: String(body.colourOptionId || ''),
        conditionId: String(body.conditionId || ''),
        transportFee,
      },
      published.config
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
