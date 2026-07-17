import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const ORIGIN = 'https://www.inkedup.id';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/artists', priority: '0.9', changefreq: 'weekly' },
  { path: '/studios', priority: '0.9', changefreq: 'weekly' },
  { path: '/locations', priority: '0.8', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { path: '/safety', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/inspiration', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

const LOCATION_SLUGS = [
  'canggu',
  'seminyak',
  'kuta',
  'uluwatu',
  'ubud',
  'sanur',
  'nusa-dua',
  'jimbaran',
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(loc: string, priority: string, changefreq: string, lastmod: string): string {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

router.get('/', async (_req, res, next) => {
  try {
    const lastmod = new Date().toISOString().split('T')[0];

    // Include artist/studio profile URLs only when they are verified.
    // Currently the production roster is seed/mock data (verified_at is null),
    // so these queries will return zero profile URLs until real data is loaded.
    const [{ rows: artistRows }, { rows: studioRows }] = await Promise.all([
      query(
        "SELECT slug FROM artists WHERE status = 'active' AND COALESCE(bio, '') <> '' AND COALESCE(photo, '') <> '' ORDER BY display_name"
      ),
      query(
        "SELECT id FROM studios WHERE status = 'active' AND verified_at IS NOT NULL ORDER BY name"
      ),
    ]);

    const urls: string[] = [];

    for (const route of STATIC_ROUTES) {
      urls.push(buildUrl(`${ORIGIN}${route.path}`, route.priority, route.changefreq, lastmod));
    }

    for (const slug of LOCATION_SLUGS) {
      urls.push(buildUrl(`${ORIGIN}/locations/${slug}`, '0.8', 'weekly', lastmod));
    }

    for (const row of artistRows) {
      const slug = row.slug as string;
      urls.push(buildUrl(`${ORIGIN}/artists/${slug}`, '0.6', 'weekly', lastmod));
    }

    for (const row of studioRows) {
      const id = row.id as string;
      urls.push(buildUrl(`${ORIGIN}/studios/${id}`, '0.6', 'weekly', lastmod));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;
