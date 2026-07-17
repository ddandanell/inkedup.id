/**
 * Openverse adapter for legally licensed tattoo inspiration images.
 * Openverse indexes 800M+ Creative Commons and public-domain media.
 * https://api.openverse.org/v1/images/
 */

import { generateId } from '../../utils/id.js';
import type { InspirationImage } from '../../types.js';

const API_BASE = 'https://api.openverse.org/v1/images';

// Licenses that allow commercial display and adaptation on InkedUp.
const COMMERCIAL_LICENSES = ['cc0', 'pdm', 'by', 'by-sa'];

export interface OpenverseResult {
  id: string;
  title?: string;
  foreign_landing_url: string;
  url: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_version?: string;
  license_url?: string;
  tags: { name: string; accuracy?: number | null; unstable__provider?: string }[];
  thumbnail?: string;
  attribution?: string;
  source?: string;
  provider?: string;
}

export interface OpenverseSearchOptions {
  query: string;
  page?: number;
  pageSize?: number;
  license?: string[];
}

export interface OpenversePage {
  results: InspirationImage[];
  total: number;
  hasMore: boolean;
  nextPage: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeStyleName(raw: string): string {
  const map: Record<string, string> = {
    'fine line': 'Fine Line',
    'fineline': 'Fine Line',
    'blackwork': 'Blackwork',
    'black work': 'Blackwork',
    'traditional': 'Traditional',
    'japanese': 'Japanese',
    'irezumi': 'Japanese',
    'watercolor': 'Watercolor',
    'minimalist': 'Minimalist',
    'geometric': 'Geometric',
    'realism': 'Realism',
    'realistic': 'Realism',
    'floral': 'Floral',
    'script': 'Script',
    'lettering': 'Script',
    'tribal': 'Tribal',
    'neo traditional': 'Neo Traditional',
    'neotraditional': 'Neo Traditional',
    'dotwork': 'Dotwork',
    'linework': 'Linework',
    'hand poke': 'Hand Poke',
    'stick and poke': 'Hand Poke',
    'balinese': 'Balinese',
    'mandala': 'Mandala',
  };
  const key = raw.toLowerCase().trim();
  return map[key] || raw.replace(/^\w/, (c) => c.toUpperCase());
}

function inferStyles(query: string, tags: string[]): string[] {
  const styles = new Set<string>();
  const tokens = [query, ...tags].join(' ').toLowerCase();

  const styleKeywords: Record<string, string[]> = {
    'Fine Line': ['fine line', 'fineline'],
    'Blackwork': ['blackwork', 'black work'],
    'Traditional': ['traditional tattoo', 'old school', 'oldschool'],
    'Japanese': ['japanese', 'irezumi'],
    'Watercolor': ['watercolor', 'water colour'],
    'Minimalist': ['minimalist', 'minimal'],
    'Geometric': ['geometric'],
    'Realism': ['realism', 'realistic', 'portrait tattoo'],
    'Floral': ['floral', 'flower tattoo', 'botanical'],
    'Script': ['script', 'lettering', 'quote tattoo'],
    'Tribal': ['tribal'],
    'Neo Traditional': ['neo traditional', 'neotraditional'],
    'Dotwork': ['dotwork', 'dot work', 'stipple'],
    'Linework': ['linework', 'line work'],
    'Hand Poke': ['hand poke', 'stick and poke'],
    'Balinese': ['balinese', 'bali tattoo'],
    'Mandala': ['mandala'],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some((k) => tokens.includes(k))) styles.add(style);
  }

  if (styles.size === 0) styles.add('Tattoo');
  return Array.from(styles);
}

function inferPlacement(query: string, tags: string[], title?: string): string | undefined {
  const tokens = [query, ...tags, title || ''].join(' ').toLowerCase();
  const placements: Record<string, string[]> = {
    Sleeve: ['sleeve', 'full sleeve', 'half sleeve'],
    Forearm: ['forearm'],
    Arm: ['arm tattoo'],
    Back: ['back tattoo'],
    Chest: ['chest tattoo'],
    Leg: ['leg tattoo'],
    Thigh: ['thigh tattoo'],
    Calf: ['calf tattoo'],
    Shoulder: ['shoulder tattoo'],
    Wrist: ['wrist tattoo'],
    Hand: ['hand tattoo'],
    Neck: ['neck tattoo'],
    Ribs: ['rib tattoo', 'ribs'],
    Ankle: ['ankle tattoo'],
  };
  for (const [placement, keywords] of Object.entries(placements)) {
    if (keywords.some((k) => tokens.includes(k))) return placement;
  }
  return undefined;
}

function mapOpenverseResult(raw: OpenverseResult, query: string): InspirationImage {
  const tags = (raw.tags || []).map((t) => t.name).filter(Boolean);
  const styles = inferStyles(query, tags);
  const placement = inferPlacement(query, tags, raw.title);
  const license = raw.license?.toLowerCase() || 'unknown';

  return {
    id: generateId('insp'),
    source: 'openverse',
    source_id: raw.id,
    source_url: raw.foreign_landing_url,
    image_url: raw.url,
    thumbnail_url: raw.thumbnail,
    title: raw.title || `${styles[0] || 'Tattoo'} inspiration`,
    creator: raw.creator,
    creator_url: raw.creator_url,
    license: `${license}${raw.license_version ? ` ${raw.license_version}` : ''}`,
    license_url: raw.license_url,
    tags,
    styles,
    placement,
    status: 'pending',
    is_featured: 0,
    attribution_required: 1,
  };
}

export async function searchOpenverse(options: OpenverseSearchOptions): Promise<OpenversePage> {
  const { query, page = 1, pageSize = 50, license = COMMERCIAL_LICENSES } = options;

  const params = new URLSearchParams({
    q: query,
    page: String(page),
    page_size: String(Math.min(pageSize, 100)),
    license: license.join(','),
  });

  const res = await fetch(`${API_BASE}/?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Openverse API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    results?: OpenverseResult[];
    result_count?: number;
    page_count?: number;
  };

  const results = (data.results || []).map((r) => mapOpenverseResult(r, query));
  const total = data.result_count || 0;
  const hasMore = page < (data.page_count || 1);

  return { results, total, hasMore, nextPage: page + 1 };
}

export async function fetchAllOpenverse(
  query: string,
  maxPages = 10,
  onPage?: (page: number, count: number, total: number) => void
): Promise<InspirationImage[]> {
  const all: InspirationImage[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    const data = await searchOpenverse({ query, page, pageSize: 50 });
    all.push(...data.results);
    hasMore = data.hasMore;
    page = data.nextPage;
    onPage?.(page - 1, data.results.length, data.total);

    // Respectful rate limiting.
    if (hasMore) await sleep(250);
  }

  return all;
}
