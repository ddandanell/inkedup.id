import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { ALL_TABLES, SCHEMA_STATEMENTS } from './schema.js';

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    client = neon(url);
  }
  return client;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const rows = (await getClient().query(text, params)) as T[];
  return { rows, rowCount: rows.length };
}

let schemaReady: Promise<void> | null = null;

export function initSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        await query(statement);
      }
    })();
  }
  return schemaReady;
}

export async function resetDatabase(): Promise<void> {
  for (const table of ALL_TABLES) {
    await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }
  schemaReady = null;
  await initSchema();
}
