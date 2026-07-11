// Resolves the currently published pricing version from Neon.
// The config is stored as JSON-in-TEXT (project convention for this driver).

import { query } from '../db.js';
import type { PricingConfig, PricingVersionRow } from './types.js';

export interface PublishedPricing {
  id: string;
  name: string;
  publishedAt: string | null;
  config: PricingConfig;
}

export async function getPublishedPricing(): Promise<PublishedPricing | null> {
  const { rows } = await query<PricingVersionRow>(
    "SELECT * FROM pricing_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1"
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    publishedAt: row.published_at,
    config: JSON.parse(row.config) as PricingConfig,
  };
}
