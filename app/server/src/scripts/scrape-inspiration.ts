#!/usr/bin/env node
/**
 * Legal tattoo inspiration scraper.
 *
 * Sources:
 * - Openverse (primary): CC0, PDM, CC BY, CC BY-SA images only.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx server/src/scripts/scrape-inspiration.ts --target=1000
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSchema, query } from '../db.js';
import { fetchAllWikimedia } from '../services/inspiration/wikimedia.js';
import { fetchAllPexels } from '../services/inspiration/pexels.js';
import type { InspirationImage } from '../types.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScrapeQuery {
  query: string;
  maxPages: number;
}

const SCRAPE_QUERIES: ScrapeQuery[] = [
  { query: 'tattoo', maxPages: 20 },
  { query: 'body art tattoo', maxPages: 15 },
  { query: 'fine line tattoo', maxPages: 10 },
  { query: 'blackwork tattoo', maxPages: 10 },
  { query: 'traditional tattoo', maxPages: 10 },
  { query: 'old school tattoo', maxPages: 10 },
  { query: 'japanese tattoo', maxPages: 10 },
  { query: 'irezumi tattoo', maxPages: 10 },
  { query: 'watercolor tattoo', maxPages: 10 },
  { query: 'minimalist tattoo', maxPages: 10 },
  { query: 'geometric tattoo', maxPages: 10 },
  { query: 'realism tattoo', maxPages: 10 },
  { query: 'floral tattoo', maxPages: 10 },
  { query: 'flower tattoo', maxPages: 10 },
  { query: 'script tattoo', maxPages: 10 },
  { query: 'lettering tattoo', maxPages: 10 },
  { query: 'tribal tattoo', maxPages: 10 },
  { query: 'maori tattoo', maxPages: 10 },
  { query: 'polynesian tattoo', maxPages: 10 },
  { query: 'neo traditional tattoo', maxPages: 10 },
  { query: 'dotwork tattoo', maxPages: 10 },
  { query: 'linework tattoo', maxPages: 10 },
  { query: 'hand poke tattoo', maxPages: 10 },
  { query: 'stick and poke tattoo', maxPages: 10 },
  { query: 'balinese tattoo', maxPages: 10 },
  { query: 'mandala tattoo', maxPages: 10 },
  { query: 'sacred geometry tattoo', maxPages: 10 },
  { query: 'sleeve tattoo', maxPages: 10 },
  { query: 'full sleeve tattoo', maxPages: 10 },
  { query: 'half sleeve tattoo', maxPages: 10 },
  { query: 'forearm tattoo', maxPages: 10 },
  { query: 'upper arm tattoo', maxPages: 10 },
  { query: 'back tattoo', maxPages: 10 },
  { query: 'chest tattoo', maxPages: 10 },
  { query: 'rib tattoo', maxPages: 10 },
  { query: 'side tattoo', maxPages: 10 },
  { query: 'thigh tattoo', maxPages: 10 },
  { query: 'leg tattoo', maxPages: 10 },
  { query: 'calf tattoo', maxPages: 10 },
  { query: 'ankle tattoo', maxPages: 10 },
  { query: 'foot tattoo', maxPages: 10 },
  { query: 'wrist tattoo', maxPages: 10 },
  { query: 'hand tattoo', maxPages: 10 },
  { query: 'finger tattoo', maxPages: 10 },
  { query: 'shoulder tattoo', maxPages: 10 },
  { query: 'neck tattoo', maxPages: 10 },
  { query: 'face tattoo', maxPages: 10 },
  { query: 'tattoo flash', maxPages: 10 },
  { query: 'tattoo stencil', maxPages: 10 },
  { query: 'tattoo convention', maxPages: 10 },
  { query: 'tattoo artist', maxPages: 10 },
  { query: 'tattoo shop', maxPages: 10 },
  { query: 'tattoo parlor', maxPages: 10 },
  { query: 'temporary tattoo', maxPages: 10 },
  { query: 'tattooed person', maxPages: 10 },
  { query: 'tattooed man', maxPages: 10 },
  { query: 'tattooed woman', maxPages: 10 },
  { query: 'sailor tattoo', maxPages: 10 },
  { query: 'lip tattoo', maxPages: 10 },
  { query: 'tattoo sketch', maxPages: 10 },
  { query: 'tattoo drawing', maxPages: 10 },
  { query: 'dragon tattoo', maxPages: 10 },
  { query: 'rose tattoo', maxPages: 10 },
  { query: 'skull tattoo', maxPages: 10 },
  { query: 'snake tattoo', maxPages: 10 },
  { query: 'wolf tattoo', maxPages: 10 },
  { query: 'lion tattoo', maxPages: 10 },
  { query: 'eagle tattoo', maxPages: 10 },
  { query: 'koi tattoo', maxPages: 10 },
  { query: 'phoenix tattoo', maxPages: 10 },
  { query: 'butterfly tattoo', maxPages: 10 },
  { query: 'angel tattoo', maxPages: 10 },
  { query: 'cross tattoo', maxPages: 10 },
  { query: 'star tattoo', maxPages: 10 },
  { query: 'heart tattoo', maxPages: 10 },
  { query: 'name tattoo', maxPages: 10 },
  { query: 'portrait tattoo', maxPages: 10 },
  { query: 'color tattoo', maxPages: 10 },
  { query: 'black and grey tattoo', maxPages: 10 },
  { query: 'black and gray tattoo', maxPages: 10 },
  { query: 'cover up tattoo', maxPages: 10 },
  { query: 'white ink tattoo', maxPages: 10 },
  { query: 'UV tattoo', maxPages: 10 },
  { query: '3d tattoo', maxPages: 10 },
  { query: 'biomechanical tattoo', maxPages: 10 },
  { query: 'new school tattoo', maxPages: 10 },
  { query: 'illustrative tattoo', maxPages: 10 },
  { query: 'trash polka tattoo', maxPages: 10 },
  { query: 'surrealism tattoo', maxPages: 10 },
  { query: 'memorial tattoo', maxPages: 10 },
  { query: 'religious tattoo', maxPages: 10 },
  { query: 'nautical tattoo', maxPages: 10 },
  { query: 'skull and roses tattoo', maxPages: 10 },
  { query: 'pin up tattoo', maxPages: 10 },
  { query: 'cartoon tattoo', maxPages: 10 },
  { query: 'anime tattoo', maxPages: 10 },
  { query: 'pet tattoo', maxPages: 10 },
  { query: 'cat tattoo', maxPages: 10 },
  { query: 'dog tattoo', maxPages: 10 },
  { query: 'bird tattoo', maxPages: 10 },
  { query: 'fish tattoo', maxPages: 10 },
  { query: 'tiger tattoo', maxPages: 10 },
  { query: 'bear tattoo', maxPages: 10 },
  { query: 'elephant tattoo', maxPages: 10 },
  { query: 'owl tattoo', maxPages: 10 },
  { query: 'tree tattoo', maxPages: 10 },
  { query: 'mountain tattoo', maxPages: 10 },
  { query: 'sun tattoo', maxPages: 10 },
  { query: 'moon tattoo', maxPages: 10 },
  { query: 'compass tattoo', maxPages: 10 },
  { query: 'anchor tattoo', maxPages: 10 },
  { query: 'feather tattoo', maxPages: 10 },
  { query: 'arrow tattoo', maxPages: 10 },
  { query: 'infinity tattoo', maxPages: 10 },
  { query: 'dreamcatcher tattoo', maxPages: 10 },
  { query: 'clock tattoo', maxPages: 10 },
  { query: 'key tattoo', maxPages: 10 },
  { query: 'lock tattoo', maxPages: 10 },
  { query: 'music tattoo', maxPages: 10 },
  { query: 'tatuaje', maxPages: 10 },
  { query: 'tatuajes', maxPages: 10 },
  { query: 'tatouage', maxPages: 10 },
  { query: 'tatuagem', maxPages: 10 },
  { query: 'tätowierung', maxPages: 10 },
  { query: 'tattoo model', maxPages: 10 },
  { query: 'tattooed model', maxPages: 10 },
  { query: 'tattoo photography', maxPages: 10 },
  { query: 'tattoo close up', maxPages: 10 },
];

function parseArgs(): { target: number; dryRun: boolean; source: string } {
  const args = process.argv.slice(2);
  let target = 1000;
  let dryRun = false;
  let source = 'wikimedia';

  for (const arg of args) {
    if (arg.startsWith('--target=')) target = Number(arg.split('=')[1]) || 1000;
    if (arg === '--dry-run') dryRun = true;
    if (arg.startsWith('--source=')) source = arg.split('=')[1];
  }

  return { target, dryRun, source };
}

function dedupeBySourceId(images: InspirationImage[]): InspirationImage[] {
  const seen = new Set<string>();
  return images.filter((img) => {
    const key = `${img.source}:${img.source_id || img.image_url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function existingSourceIds(source: string): Promise<Set<string>> {
  const { rows } = await query<{ source_id: string }>(
    'SELECT source_id FROM inspiration_images WHERE source = $1 AND source_id IS NOT NULL',
    [source]
  );
  return new Set(rows.map((r) => r.source_id));
}

async function insertImages(images: InspirationImage[]): Promise<number> {
  let inserted = 0;
  for (const img of images) {
    try {
      await query(
        `INSERT INTO inspiration_images (
          id, source, source_id, source_url, image_url, thumbnail_url, title, creator, creator_url,
          license, license_url, tags, styles, placement, status, is_featured, attribution_required, scraped_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP::text)
        ON CONFLICT (source, source_id) DO NOTHING`,
        [
          img.id,
          img.source,
          img.source_id || null,
          img.source_url,
          img.image_url,
          img.thumbnail_url || null,
          img.title || null,
          img.creator || null,
          img.creator_url || null,
          img.license,
          img.license_url || null,
          JSON.stringify(img.tags),
          JSON.stringify(img.styles),
          img.placement || null,
          img.status,
          img.is_featured,
          img.attribution_required,
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`Failed to insert ${img.id}:`, (err as Error).message);
    }
  }
  return inserted;
}

async function approvePending(): Promise<number> {
  const { rowCount } = await query("UPDATE inspiration_images SET status = 'approved' WHERE status = 'pending'");
  return rowCount;
}

async function main(): Promise<void> {
  const { target, dryRun, source } = parseArgs();

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log(`Starting inspiration scrape: target=${target}, source=${source}, dryRun=${dryRun}`);

  await initSchema();

  const existingIds = await existingSourceIds(source === 'all' ? 'wikimedia' : source);
  const allImages: InspirationImage[] = [];
  const countNew = () => dedupeBySourceId(allImages).filter((img) => !existingIds.has(img.source_id || '')).length;

  if (source === 'wikimedia' || source === 'all') {
    for (const { query: q, maxPages } of SCRAPE_QUERIES) {
      if (countNew() >= target) break;
      const remaining = target - countNew();
      const perQueryTarget = Math.min(maxPages * 50, Math.max(30, Math.ceil(remaining / Math.min(SCRAPE_QUERIES.length, 8))));
      console.log(`\nSearching Wikimedia Commons: "${q}" (need ~${remaining} more new)`);
      try {
        const images = await fetchAllWikimedia(q, perQueryTarget, (batch, count, total) => {
          console.log(`  batch ${batch}: +${count} (total available ${total})`);
        });
        allImages.push(...images);
        console.log(`  => collected ${images.length}, running total ${allImages.length}, new unique ${countNew()}`);
      } catch (err) {
        console.error(`  Wikimedia error for "${q}":`, (err as Error).message);
      }
    }
  }

  if (source === 'pexels' || source === 'all') {
    if (!process.env.PEXELS_API_KEY) {
      console.log('\nSkipping Pexels: PEXELS_API_KEY not set.');
    } else {
      for (const { query: q } of SCRAPE_QUERIES.slice(0, 20)) {
        if (countNew() >= target) break;
        const remaining = target - countNew();
        console.log(`\nSearching Pexels: "${q}" (need ~${remaining} more new)`);
        try {
          const images = await fetchAllPexels(q, Math.min(80, remaining + 20), (page, count, total) => {
            console.log(`  page ${page}: +${count} (total available ${total})`);
          });
          allImages.push(...images);
          console.log(`  => collected ${images.length}, new unique ${countNew()}`);
        } catch (err) {
          console.error(`  Pexels error for "${q}":`, (err as Error).message);
        }
      }
    }
  }

  const deduped = dedupeBySourceId(allImages);
  console.log(`\nCollected ${allImages.length} raw results, ${deduped.length} after dedupe.`);

  if (deduped.length === 0) {
    console.log('No images found.');
    return;
  }

  if (dryRun) {
    console.log('\nDry run — sample of results:');
    deduped.slice(0, 5).forEach((img) => {
      console.log(`  - ${img.title} | ${img.license} | ${img.styles.join(', ')} | ${img.image_url.slice(0, 60)}`);
    });
    return;
  }

  const newImages = deduped.filter((img) => !existingIds.has(img.source_id || ''));
  console.log(`Skipping ${deduped.length - newImages.length} already stored.`);

  const inserted = await insertImages(newImages);
  const approved = await approvePending();

  console.log(`\nInserted ${inserted} new images.`);
  console.log(`Auto-approved ${approved} images.`);
  console.log(`Total images in library now: ${(await query<{ count: number }>("SELECT COUNT(*)::int as count FROM inspiration_images")).rows[0].count}`);
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
