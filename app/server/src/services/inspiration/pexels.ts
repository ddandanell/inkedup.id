/**
 * Pexels adapter for tattoo inspiration images.
 * Requires PEXELS_API_KEY in environment.
 * Pexels license: free for commercial use without attribution.
 * https://www.pexels.com/api/
 */

import { generateId } from '../../utils/id.js';
import type { InspirationImage } from '../../types.js';

const API_BASE = 'https://api.pexels.com/v1/search';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt?: string;
}

export interface PexelsPage {
  results: InspirationImage[];
  total: number;
  hasMore: boolean;
  nextPage: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inferStyles(query: string, alt?: string): string[] {
  const styles = new Set<string>();
  const tokens = `${query} ${alt || ''}`.toLowerCase();

  const map: Record<string, string[]> = {
    'Fine Line': ['fine line'],
    Blackwork: ['blackwork'],
    Traditional: ['traditional', 'old school'],
    Japanese: ['japanese', 'irezumi'],
    Watercolor: ['watercolor'],
    Minimalist: ['minimalist', 'minimal'],
    Geometric: ['geometric'],
    Realism: ['realism', 'realistic', 'portrait'],
    Floral: ['floral', 'flower'],
    Script: ['script', 'lettering'],
    Tribal: ['tribal'],
  };

  for (const [style, keywords] of Object.entries(map)) {
    if (keywords.some((k) => tokens.includes(k))) styles.add(style);
  }

  if (styles.size === 0) styles.add('Tattoo');
  return Array.from(styles);
}

function mapPexelsPhoto(photo: PexelsPhoto, query: string): InspirationImage {
  return {
    id: generateId('insp'),
    source: 'pexels',
    source_id: String(photo.id),
    source_url: photo.url,
    image_url: photo.src.large2x || photo.src.large || photo.src.original,
    thumbnail_url: photo.src.medium || photo.src.small,
    title: photo.alt || `${inferStyles(query, photo.alt)[0]} inspiration`,
    creator: photo.photographer,
    creator_url: photo.photographer_url,
    license: 'Pexels License',
    license_url: 'https://www.pexels.com/license/',
    tags: [],
    styles: inferStyles(query, photo.alt),
    placement: undefined,
    status: 'pending',
    is_featured: 0,
    attribution_required: 0,
  };
}

export async function searchPexels(options: {
  query: string;
  page?: number;
  perPage?: number;
  apiKey?: string;
}): Promise<PexelsPage> {
  const { query, page = 1, perPage = 80, apiKey = process.env.PEXELS_API_KEY } = options;

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not set');
  }

  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(Math.min(perPage, 80)),
  });

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: { Authorization: apiKey, Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    photos?: PexelsPhoto[];
    total_results?: number;
    page?: number;
    per_page?: number;
  };

  const photos = data.photos || [];
  const total = data.total_results || 0;
  const hasMore = photos.length > 0 && page * (data.per_page || perPage) < total;

  return {
    results: photos.map((p) => mapPexelsPhoto(p, query)),
    total,
    hasMore,
    nextPage: page + 1,
  };
}

export async function fetchAllPexels(
  query: string,
  maxResults = 500,
  onPage?: (page: number, count: number, total: number) => void
): Promise<InspirationImage[]> {
  const all: InspirationImage[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && all.length < maxResults) {
    const data = await searchPexels({ query, page, perPage: 80 });
    all.push(...data.results);
    hasMore = data.hasMore;
    page = data.nextPage;
    onPage?.(page - 1, data.results.length, data.total);

    if (hasMore && all.length < maxResults) await sleep(350);
  }

  return all.slice(0, maxResults);
}
