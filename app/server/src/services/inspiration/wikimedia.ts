/**
 * Wikimedia Commons adapter for public-domain and CC-licensed tattoo images.
 * No API key required. Respects rate limits.
 */

import { generateId } from '../../utils/id.js';
import type { InspirationImage } from '../../types.js';

const API_BASE = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'InkedUp-Scraper/1.0 (hello@inkedup.id)';

const COMMERCIAL_LICENSES = new Set([
  'cc0',
  'cc-zero',
  'cc0-1.0',
  'pdm',
  'cc-by-1.0',
  'cc-by-2.0',
  'cc-by-2.5',
  'cc-by-3.0',
  'cc-by-4.0',
  'cc-by-sa-1.0',
  'cc-by-sa-2.0',
  'cc-by-sa-2.5',
  'cc-by-sa-3.0',
  'cc-by-sa-4.0',
]);

interface WikimediaSearchResult {
  ns: number;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  timestamp: string;
}

interface WikimediaImageInfo {
  size: number;
  width: number;
  height: number;
  thumburl?: string;
  thumbwidth?: number;
  thumbheight?: number;
  url: string;
  descriptionurl: string;
  descriptionshorturl: string;
  mime?: string;
  extmetadata?: Record<string, { value: string; source?: string; hidden?: string }>;
}

export interface WikimediaPage {
  results: InspirationImage[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
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
    'old school': 'Traditional',
    'japanese': 'Japanese',
    'irezumi': 'Japanese',
    'watercolor': 'Watercolor',
    'minimalist': 'Minimalist',
    'minimal': 'Minimalist',
    'geometric': 'Geometric',
    'realism': 'Realism',
    'realistic': 'Realism',
    'floral': 'Floral',
    'flower': 'Floral',
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

function inferStyles(query: string, categories: string[], title?: string): string[] {
  const styles = new Set<string>();
  const tokens = [query, title || '', ...categories].join(' ').toLowerCase();

  const styleKeywords: Record<string, string[]> = {
    'Fine Line': ['fine line', 'fineline'],
    'Blackwork': ['blackwork', 'black work'],
    'Traditional': ['traditional tattoo', 'old school', 'oldschool'],
    'Japanese': ['japanese tattoo', 'irezumi'],
    'Watercolor': ['watercolor tattoo', 'water colour tattoo'],
    'Minimalist': ['minimalist tattoo', 'minimal tattoo'],
    'Geometric': ['geometric tattoo'],
    'Realism': ['realism tattoo', 'realistic tattoo', 'portrait tattoo'],
    'Floral': ['floral tattoo', 'flower tattoo', 'botanical tattoo'],
    'Script': ['script tattoo', 'lettering tattoo', 'quote tattoo'],
    'Tribal': ['tribal tattoo'],
    'Neo Traditional': ['neo traditional tattoo', 'neotraditional tattoo'],
    'Dotwork': ['dotwork tattoo', 'dot work tattoo', 'stipple tattoo'],
    'Linework': ['linework tattoo', 'line work tattoo'],
    'Hand Poke': ['hand poke tattoo', 'stick and poke tattoo'],
    'Balinese': ['balinese tattoo', 'bali tattoo'],
    'Mandala': ['mandala tattoo'],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some((k) => tokens.includes(k))) styles.add(style);
  }

  if (styles.size === 0) styles.add('Tattoo');
  return Array.from(styles);
}

function inferPlacement(query: string, categories: string[], title?: string): string | undefined {
  const tokens = [query, title || '', ...categories].join(' ').toLowerCase();
  const placements: Record<string, string[]> = {
    Sleeve: ['sleeve tattoo', 'full sleeve', 'half sleeve'],
    Forearm: ['forearm tattoo'],
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
    Ribs: ['rib tattoo', 'ribs tattoo'],
    Ankle: ['ankle tattoo'],
    Foot: ['foot tattoo'],
    Face: ['face tattoo'],
  };
  for (const [placement, keywords] of Object.entries(placements)) {
    if (keywords.some((k) => tokens.includes(k))) return placement;
  }
  return undefined;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseLicense(licenseShortName?: string, licenseUrl?: string, licenseTemplate?: string): { license: string; licenseUrl?: string; attributionRequired: number } {
  const raw = (licenseTemplate || licenseShortName || 'unknown').toLowerCase().trim();

  if (raw.includes('cc0') || raw.includes('cc-zero') || raw.includes('public domain') || raw.includes('pdm')) {
    return { license: 'CC0 / Public Domain', licenseUrl: licenseUrl || 'https://creativecommons.org/publicdomain/zero/1.0/', attributionRequired: 0 };
  }
  if (raw.includes('cc-by-sa')) {
    return { license: licenseShortName || 'CC BY-SA', licenseUrl, attributionRequired: 1 };
  }
  if (raw.includes('cc-by')) {
    return { license: licenseShortName || 'CC BY', licenseUrl, attributionRequired: 1 };
  }
  return { license: licenseShortName || raw, licenseUrl, attributionRequired: 1 };
}

function isCommerciallyUsable(licenseTemplate?: string, licenseShortName?: string): boolean {
  const raw = (licenseTemplate || licenseShortName || '').toLowerCase();
  return COMMERCIAL_LICENSES.has(raw) || Array.from(COMMERCIAL_LICENSES).some((l) => raw.includes(l));
}

function mapWikimediaResult(
  search: WikimediaSearchResult,
  info: WikimediaImageInfo | undefined,
  query: string
): InspirationImage | null {
  if (!info) return null;

  const meta = info.extmetadata || {};
  const title = cleanHtml(meta.ObjectName?.value || search.title.replace(/^File:/, '').replace(/\.[^.]+$/, ''));
  const categories = (meta.Categories?.value || '').split('|').map((c) => c.trim()).filter(Boolean);
  const artistHtml = meta.Artist?.value || '';
  const creator = cleanHtml(artistHtml) || undefined;
  const creatorUrlMatch = artistHtml.match(/href="([^"]+)"/);
  const creatorUrl = creatorUrlMatch
    ? (creatorUrlMatch[1].startsWith('//') ? `https:${creatorUrlMatch[1]}` : creatorUrlMatch[1])
    : undefined;

  const { license, licenseUrl, attributionRequired } = parseLicense(
    meta.LicenseShortName?.value,
    meta.LicenseUrl?.value,
    meta.License?.value
  );

  if (!isCommerciallyUsable(meta.License?.value, meta.LicenseShortName?.value)) {
    return null;
  }

  const tags = categories
    .filter((c) => c.toLowerCase().includes('tattoo'))
    .slice(0, 10);

  return {
    id: generateId('insp'),
    source: 'wikimedia',
    source_id: String(search.pageid),
    source_url: info.descriptionurl,
    image_url: info.url,
    thumbnail_url: info.thumburl || info.url,
    title,
    creator,
    creator_url: creatorUrl,
    license,
    license_url: licenseUrl,
    tags,
    styles: inferStyles(query, categories, title),
    placement: inferPlacement(query, categories, title),
    status: 'pending',
    is_featured: 0,
    attribution_required: attributionRequired,
  };
}

export async function searchWikimedia(options: {
  query: string;
  offset?: number;
  limit?: number;
}): Promise<WikimediaPage> {
  const { query, offset = 0, limit = 50 } = options;

  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    format: 'json',
    origin: '*',
    sroffset: String(offset),
    srlimit: String(Math.min(limit, 50)),
  });

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Wikimedia search error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    query?: { search?: WikimediaSearchResult[] };
    querysearchinfo?: { totalhits?: number };
    continue?: { sroffset?: number };
    error?: { info?: string };
  };

  if (data.error) {
    throw new Error(`Wikimedia API error: ${data.error.info || 'unknown'}`);
  }

  const searchResults = data.query?.search || [];
  const total = data.querysearchinfo?.totalhits || searchResults.length;
  const hasMore = Boolean(data.continue?.sroffset);
  const nextOffset = data.continue?.sroffset || offset + searchResults.length;

  if (searchResults.length === 0) {
    return { results: [], total, hasMore: false, nextOffset: offset };
  }

  await sleep(300);

  // Batch fetch imageinfo for all search results.
  const titles = searchResults.map((s) => s.title).join('|');
  const infoParams = new URLSearchParams({
    action: 'query',
    titles,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  });

  const infoRes = await fetch(`${API_BASE}?${infoParams.toString()}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });

  if (!infoRes.ok) {
    throw new Error(`Wikimedia imageinfo error: ${infoRes.status} ${infoRes.statusText}`);
  }

  const infoData = (await infoRes.json()) as {
    query?: { pages?: Record<string, { pageid?: number; imageinfo?: WikimediaImageInfo[] }> };
  };

  const pages = infoData.query?.pages || {};
  const infoByPageId = new Map<number, WikimediaImageInfo>();
  for (const page of Object.values(pages)) {
    if (page.pageid && page.imageinfo?.[0]) {
      infoByPageId.set(page.pageid, page.imageinfo[0]);
    }
  }

  const results = searchResults
    .map((s) => mapWikimediaResult(s, infoByPageId.get(s.pageid), query))
    .filter((img): img is InspirationImage => img !== null);

  return { results, total, hasMore, nextOffset };
}

export async function fetchAllWikimedia(
  query: string,
  maxResults = 500,
  onBatch?: (batch: number, count: number, total: number) => void
): Promise<InspirationImage[]> {
  const all: InspirationImage[] = [];
  let offset = 0;
  let hasMore = true;
  let batch = 0;

  while (hasMore && all.length < maxResults) {
    const data = await searchWikimedia({ query, offset, limit: 50 });
    all.push(...data.results);
    hasMore = data.hasMore && data.results.length > 0;
    offset = data.nextOffset;
    batch++;
    onBatch?.(batch, data.results.length, data.total);

    if (hasMore && all.length < maxResults) await sleep(500);
  }

  return all.slice(0, maxResults);
}
