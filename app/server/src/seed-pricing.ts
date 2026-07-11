// Idempotent pricing seed — safe to run against production Neon.
// Creates the pricing_versions table (via initSchema) and inserts the default
// published pricing version ONLY if no published version exists yet.
// Never modifies or deletes existing versions.

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const { initSchema, query } = await import('./db.js');
  const { generateId } = await import('./utils/id.js');
  const { DEFAULT_PRICING_CONFIG, DEFAULT_VERSION_NAME } = await import('./pricing/defaults.js');

  await initSchema();
  console.log('Schema ready (pricing_versions ensured).');

  const { rows } = await query("SELECT id, name FROM pricing_versions WHERE status = 'published' LIMIT 1");
  if (rows.length > 0) {
    console.log(`A published pricing version already exists ("${rows[0].name}"). Nothing changed.`);
    return;
  }

  const id = generateId('pv');
  await query(
    "INSERT INTO pricing_versions (id, name, status, config, published_at) VALUES ($1, $2, 'published', $3, CURRENT_TIMESTAMP::text)",
    [id, DEFAULT_VERSION_NAME, JSON.stringify(DEFAULT_PRICING_CONFIG)]
  );
  console.log(`Seeded default published pricing version: "${DEFAULT_VERSION_NAME}" (${id})`);
}

main().catch((err) => {
  console.error('Pricing seed failed:', err);
  process.exit(1);
});
