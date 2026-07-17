# TECH-PERFORMANCE — Baseline Findings
Date: 2026-07-17 | Scope: Technical / performance / HTTP-header audit of https://www.inkedup.id/ (headers, timing, page weight, favicons, social meta, images, third-party, mixed content) | Method: `curl` (headers, `-w` timing, size) against the live site; read-only inspection of `app/index.html`, `app/dist/`, `app/vercel.json`, `app/vite.config.ts`, `app/src/**`; `sips`/`file` for image dimensions; no repo modifications, no build/dev servers run.

Anchor time established via `date`: 2026-07-17T11:42:02+0800 (WITA). All live requests hit Vercel edge `sin1` (Singapore) from the owner's machine.

## Evidence collected (commands/URLs/files inspected, with key outputs)

**Response headers** — `curl -sS -D - -o /dev/null -H 'Accept-Encoding: gzip, br' <url>`:
- `https://www.inkedup.id/` → HTTP/2 200, `cache-control: public, max-age=0, must-revalidate`, `content-encoding: br`, `etag: W/"ee33bf…"`, `last-modified` present, `strict-transport-security: max-age=63072000`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: geolocation=(), microphone=(), camera=()`, `server: Vercel`, `x-vercel-cache: HIT`, `access-control-allow-origin: *`, `content-disposition: inline`. **No `content-security-policy`, no `x-frame-options`.**
- `/sitemap.xml` → 200 `application/xml`, br, HIT. `/robots.txt` → 200 `text/plain`, 126 B, HIT.
- `/locations/canggu` (deep route) → 200 `text/html`, **identical etag to `/`** (SPA shell rewrite), `x-vercel-cache: MISS` on first hit.
- `/hero-slide-1.jpg` → 200 `image/jpeg`, `content-length: 231612`, **`cache-control: public, max-age=0, must-revalidate`** (no long-lived caching on images), HIT.
- `/assets/index-CeMNiPoi.js` → 200, **`cache-control: public, max-age=31536000, immutable`**, br (from `vercel.json` `/assets/*` rule). Same for `/assets/index-CCcx8c9t.css`.
- Redirects: `https://inkedup.id/` → **308 → https://www.inkedup.id/**; `http://www.inkedup.id/` → 308 → https. `https://www.inkedup.id/this-page-does-not-exist-xyz` → **200 text/html, 3,511 B (soft-404)**.
- gzip fallback verified: `Accept-Encoding: gzip` on main JS → `content-encoding: gzip`, 164,802 B.

**Timing** — `curl -w`, 3 runs each (WITA ~11:43):
- `/`: TTFB 0.238 / 0.247 / 0.198 s → min 0.198, avg 0.228; total ≈ TTFB (1,279 B br shell).
- `/hero-slide-1.jpg`: TTFB 0.238 / 0.187 / 0.215 s → min 0.187, avg 0.213; total 0.358 / 0.343 / 0.351 s → min 0.343, avg 0.351.

**Page weight** — measured from `app/dist/` (raw) + live `curl` (Brotli-compressed):
- HTML shell: 3,511 B raw / 1,279 B br.
- Initial JS (all loaded on every page per `dist/index.html`): `index-CeMNiPoi.js` 602,547 B raw / 165,520 B br; `charts-wFw_0wyN.js` 424,243 B raw / 112,104 B br; `motion-Ddj-jVmO.js` 139,806 B raw / 48,935 B br → **1,166,596 B raw (~1.11 MB) / 326,559 B br (~319 KB)**.
- CSS: `index-CCcx8c9t.css` 137,190 B raw / 26,250 B br.
- Homepage-referenced images (grep of `src/pages/Home.tsx` + `src/components/HeroSlideshow.tsx`, sizes via `stat`): **26 JPEG files, 4,482,856 B (~4.28 MB)**. Site-wide image library in `dist/`: 37 JPG/PNG files, 6,206,623 B (~5.92 MB); only WebP files are 6 small body-area images in `dist/areas/` (~62 KB total). Largest: `hero-bg.jpg` 571,798 B (2752×1536), `location-nusa-dua.jpg` 316,227 B, `hero-slide-4.jpg` 273,583 B, `process-step-3.jpg` 261,351 B.
- Fonts: Google Fonts only (`fonts.googleapis.com/css2` — Cormorant Garamond 4 weights + DM Sans 4 weights + JetBrains Mono 2 weights, `display=swap`); local icon font `lg-*.woff/ttf` ~9.6 KB.

**Repo evidence**:
- `dist/index.html:63-66` — entry `<script type="module" src="/assets/index-CeMNiPoi.js">` + **`<link rel="modulepreload">` for both `motion-*.js` and `charts-*.js`**.
- `dist/assets/index-CeMNiPoi.js` contains static `import{r as Xx,R as Px}from"./charts-wFw_0wyN.js"` (grep) → recharts chunk is in the entry's static import graph.
- `src/App.tsx:5-20` — all ~16 public pages eagerly imported; only Booking/LocationPage/StudioApply/Artist/Admin pages are `lazy()` (`src/App.tsx:23-33`). `vite.config.ts:28-31` — `manualChunks: { motion, charts }`.
- recharts imported only by `src/pages/AdminDashboard.tsx`, `src/pages/AdminCommissions.tsx`, and unused `src/components/ui/chart.tsx`.
- `<img>` audit (Python regex over `src/**/*.tsx`): **37 total; loading=lazy 15; srcset/srcSet 0; width/height attrs 7; alt present 37 (16 empty `alt=""`)**; 0 `<img>` reference `.webp`. `decoding=` on 6; `fetchPriority` only in `HeroSlideshow.tsx:83` (first slide `high`, rest `lazy`/`auto` — good).
- Third-party URLs in `src` + `index.html`: `fonts.googleapis.com`, `fonts.gstatic.com`, `wa.me`, `instagram.com`, `tiktok.com`, `schema.org`, `www.google.com/maps/search` (external link, Locations.tsx:285), `your-website.com` (form placeholder, ArtistProfileBuilder.tsx:747). **No GA4/GTM/Meta Pixel/Hotjar/Clarity/Sentry/Posthog anywhere** (domain inventory + targeted grep).
- Mixed content: live HTML contains zero `http://` references; `grep -rn 'http://' src` (excluding w3.org) → none.
- `vercel.json:11-25` — sets `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` site-wide and immutable cache for `/assets/*` only. `access-control-allow-origin: *` is **not** set in repo config → platform-level default.
- `sips`/`file`: `favicon.ico` = **single 16×16 icon only**; `apple-touch-icon.png` = 180×180 ✓; `og-image.jpg` = 1376×768 JPEG; `logo-mark.png` = 256×256.

**Favicon/social probes** — `curl -o /dev/null -w` status/content-type/size:
- `/favicon.ico` → 200 `image/vnd.microsoft.icon` 661 B. `/apple-touch-icon.png` → 200 `image/png` 11,095 B. `/og-image.jpg` → 200 `image/jpeg` 132,596 B (also 200 on non-www after redirect).
- `/favicon.svg`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/android-chrome-192x192.png`, `/android-chrome-512x512.png`, `/site.webmanifest` → **all 200 `text/html` 3,511 B (missing; soft-404 masks them)**. Not present in `app/public/` or `app/dist/` either.
- `index.html:23-24` references only `/favicon.ico` and `/apple-touch-icon.png`.
- OG/Twitter tags present in raw HTML (`index.html:12-21`): og:site_name, og:type, og:title, og:description, og:url, og:image; twitter:card=summary_large_image, twitter:title/description/image. **All point to non-www `https://inkedup.id/…`** which 308-redirects to www. No `og:image:width/height/alt`.

## Findings (numbered; each: finding, evidence, SEO impact, recommended fix, priority P0–P3)

1. **Soft-404 on every unknown path.** `https://www.inkedup.id/this-page-does-not-exist-xyz` returns 200 + the 3,511 B SPA shell; same shell (identical etag) serves `/`, `/locations/canggu`, and even missing static files (`/favicon.svg`, `/site.webmanifest`). Impact: unlimited crawl space, GSC "Soft 404" coverage errors, polluted indexation signals, and missing-asset detection is masked (all 200). Fix: configure Vercel routing so file-like paths (`*.*`) are not rewritten to `/index.html` and return real 404s; serve a 404 status for unmatched routes (e.g., filesystem-first routing + SPA fallback limited to extensionless paths). **P1**

2. **Canonical/OG/sitemap host (non-www) conflicts with the live host (www).** `index.html:9` canonical = `https://inkedup.id/`, og:url/og:image/twitter:image = non-www, robots.txt `Sitemap:` and all 21 sitemap `<loc>` = non-www — but `https://inkedup.id/` 308-redirects to `https://www.inkedup.id/`. Canonical URLs must not redirect. Impact: diluted canonical signals, wasted crawl on redirects, social scrapers follow extra hops. Fix: pick one host (Vercel currently enforces www) and align canonical, og tags, sitemap, robots Sitemap line. **P1** (shared with crawl/metadata lanes)

3. **No analytics or conversion tracking installed.** No GA4/GTM/Meta Pixel/Hotjar/etc. in raw HTML, `dist/index.html`, or anywhere in `src/` (domain inventory + targeted grep). Impact: booking-funnel conversions unmeasurable; SEO/CRO decisions blind. Fix: install GA4 (+ consent mode) at minimum; track booking steps as events. **P1** (flag for owner confirmation — may be intentional pre-launch)

4. **recharts admin bundle (424 KB raw / 112 KB br) downloaded by every visitor on every page.** `dist/index.html:65` modulepreloads `charts-wFw_0wyN.js` and the entry bundle statically imports it (grep of entry bundle), although recharts is used only on lazy admin pages. Impact: ~112 KB br of wasted transfer + parse/compile on mobile connections for zero user benefit; hurts LCP/INP budgets. Fix: keep `charts` out of the entry graph (audit why a static edge exists — likely a shared dep hoisted into the manual chunk), drop the modulepreload, load recharts only inside the lazy admin chunk. **P2**

5. **Main entry JS 602,547 B raw (~588 KB) — over the 300 KB flag; all public pages bundled eagerly.** `src/App.tsx:5-20` statically imports Home, Artists, Locations, Studios, Pricing, FAQ, etc.; compressed initial JS = 319 KB br across 3 files. Impact: slow first load on Bali mobile networks; poor INP/LCP headroom. Fix: route-level `lazy()` for all non-home pages, trim vendor deps, consider dropping framer-motion from critical path. **P2**

6. **Heavy, unoptimized images: ~4.28 MB of JPEGs referenced by the homepage; no responsive variants.** 26 homepage-referenced JPEGs = 4,482,856 B; `hero-bg.jpg` 571,798 B (2752×1536) > 500 KB flag; all photos are JPEG/PNG — zero `<img>` with `srcset` (0/37), zero `<img>` serving WebP (only 6 small booking-flow `areas/*.webp` exist site-wide); only 15/37 `loading=lazy`; only 7/37 have width/height (CLS risk). Impact: multi-MB page weight, LCP dominated by hero JPEG, layout shifts. Fix: generate responsive srcset (e.g., 640/1280/1920) in WebP/AVIF, compress hero images (<200 KB), add width/height everywhere, lazy-load all below-fold images. **P2**

7. **Static images served with `cache-control: public, max-age=0, must-revalidate`.** Observed on `/hero-slide-1.jpg` (200, HIT, but revalidated every visit); `vercel.json` only gives immutable caching to `/assets/*`, while images live un-hashed at the root. Impact: repeat views re-download/revalidate ~5.9 MB image library; wastes edge and user bandwidth. Fix: move images under a hashed path or add a `vercel.json` header rule (e.g., `max-age=31536000, immutable` with content-hashed filenames, or a long `stale-while-revalidate`). **P2**

8. **Incomplete favicon set.** Live + repo confirm only `favicon.ico` (**single 16×16** per `file`) and `apple-touch-icon.png` (180×180 ✓); `/favicon.svg`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/android-chrome-192x192.png`, `/android-chrome-512x512.png`, `/site.webmanifest` are all missing (masked as soft-404 HTML). Impact: Google SERP favicon may render blurry/missing (Google wants ≥48×48 multiples or SVG); poor Android/PWA icon experience. Fix: add 16/32/48 px ICO or SVG + PNG fallbacks, android-chrome 192/512, and a `site.webmanifest`; reference them in `index.html`. **P2**

9. **No Content-Security-Policy header; no X-Frame-Options / frame-ancestors.** Verified absent on HTML, assets, sitemap (all header dumps). Impact: no XSS defense-in-depth for a booking platform collecting personal data; clickjacking protection relies on nothing. Fix: add a CSP (start with `default-src 'self'` + allowances for fonts.googleapis.com/fonts.gstatic.com) including `frame-ancestors 'self'`; optionally legacy `X-Frame-Options: SAMEORIGIN`. **P2**

10. **HSTS present but weak: `max-age=63072000` without `includeSubDomains` or `preload`.** Header dumps. Impact: subdomains unprotected; not eligible for browser preload lists. Fix: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` once all subdomains are confirmed HTTPS. **P3**

11. **`access-control-allow-origin: *` on every response, including HTML.** All header dumps; not set in `vercel.json` (platform default). Impact: low — no credentialled API observed — but sloppy signal; any origin can read responses cross-origin. Fix: scope CORS to the API routes that actually need it. **P3**

12. **OG/Twitter meta present but incomplete.** Raw HTML has full og/twitter set (good), og:image returns 200 on both hosts (132,596 B, 1376×768 — acceptable, though standard is 1200×630); missing `og:image:width`, `og:image:height`, `og:image:alt`; og:image URL 308-redirects (non-www→www). Impact: some crawlers re-fetch after redirect; missing dimensions can delay large-image rendering in some surfaces. Fix: absolute final-host image URL + dimension/alt meta. **P3**

13. **16 of 37 `<img>` have empty `alt=""`; 0 use srcset (see #6).** Python audit of `src/**/*.tsx`. Some are legitimately decorative (hero backgrounds with `aria-hidden`), but gallery/work/artist images (e.g., tattoo-work-*, artist-*) with empty or generic alt lose image-search traffic — a key discovery channel for tattoo styles. Fix: descriptive alt for content images (style, placement, artist). **P3** (alt strategy shared with content lane)

14. **Google Fonts: 3 families / 10 weights via one render-blocking stylesheet.** `index.html:26-28` (preconnect present ✓, `display=swap` ✓). Impact: each weight = one woff2 fetch; 10 weights is heavy for a luxury-minimal design. Fix: trim to ≤5 weights or self-host subset woff2 with immutable caching. **P3**

15. **`sitemap.xml` has no `<lastmod>` values.** Fetched sitemap: 21 `<url>` entries with `<loc>`+`<priority>` only. Impact: weaker recrawl hints. Fix: add `<lastmod>` per URL. **P3** (shared with crawl lane)

**Positive confirmations (no issue):** Brotli + gzip both served (content-encoding br; gzip fallback 164,802 B on main JS); HTTP/2; hashed `/assets/*` correctly immutable-cached; `viewport` (`width=device-width, initial-scale=1.0`), `lang="en"`, `charset=UTF-8` all present (`index.html:2-5`); theme-color present; hero image preloaded with `fetchpriority="high"` (`index.html:25` + `HeroSlideshow.tsx:81-83` — first slide eager/high, others lazy — correct pattern); `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` set site-wide; zero mixed content (`http://`) in live HTML or `src`; TTFB healthy (~0.19–0.25 s from region); sitemap/robots served with correct content types.

**No P0 issues found in this lane** — site is available, HTTPS-valid, and serving content.

## Data tables

**Table A — Response headers by URL** (all fetched 2026-07-17 ~03:43 UTC; `curl -D -`, Accept-Encoding: gzip, br)

| URL | Status / Type | Cache-Control | ETag / Last-Mod | Encoding | HSTS | CSP | XCTO | XFO / frame-ancestors | Referrer-Policy | Permissions-Policy | x-vercel-cache |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 200 text/html | public, max-age=0, must-revalidate | ✓ / ✓ | br | max-age=63072000 | **absent** | nosniff | **absent** | strict-origin-when-cross-origin | geo/mic/cam=() | HIT (age 1739) |
| `/sitemap.xml` | 200 application/xml | public, max-age=0, must-revalidate | ✓ / ✓ | br | same | absent | nosniff | absent | same | same | HIT |
| `/robots.txt` | 200 text/plain | public, max-age=0, must-revalidate | ✓ / ✓ | — (126 B) | same | absent | nosniff | absent | same | same | HIT |
| `/locations/canggu` | 200 text/html (SPA shell) | public, max-age=0, must-revalidate | ✓ / ✓ | br | same | absent | nosniff | absent | same | same | MISS→(then HIT) |
| `/hero-slide-1.jpg` | 200 image/jpeg (231,612 B) | **public, max-age=0, must-revalidate** | ✓ / ✓ | — | same | absent | nosniff | absent | same | same | HIT |
| `/assets/index-CeMNiPoi.js` | 200 application/javascript | **public, max-age=31536000, immutable** | ✓ / ✓ | br | same | absent | nosniff | absent | same | same | HIT |
| `/assets/index-CCcx8c9t.css` | 200 text/css | public, max-age=31536000, immutable | ✓ / ✓ | br | same | absent | nosniff | absent | same | same | HIT |

All responses also carry `access-control-allow-origin: *`, `content-disposition: inline`, `server: Vercel`. No `X-Robots-Tag` on any tested URL.

**Table B — Timing (3 runs, `curl -w`, from owner's machine, edge sin1)**

| Target | TTFB min | TTFB avg | Total min | Total avg | Size |
|---|---|---|---|---|---|
| `/` (HTML) | 0.198 s | 0.228 s | 0.198 s | 0.228 s | 1,279 B (br) |
| `/hero-slide-1.jpg` | 0.187 s | 0.213 s | 0.343 s | 0.351 s | 231,612 B |

**Table C — Initial page weight (homepage, per `dist/index.html` + repo)**

| Resource | Raw bytes | Brotli bytes | Flag |
|---|---|---|---|
| HTML shell | 3,511 | 1,279 | — |
| `index-CeMNiPoi.js` (entry) | 602,547 | 165,520 | **>300 KB raw** |
| `charts-wFw_0wyN.js` (recharts, admin-only) | 424,243 | 112,104 | **>300 KB raw; preloaded sitewide** |
| `motion-Ddj-jVmO.js` (framer-motion) | 139,806 | 48,935 | — |
| `index-CCcx8c9t.css` | 137,190 | 26,250 | — |
| **JS+CSS subtotal** | **1,303,786** | **352,809** | |
| Homepage-referenced images (26 JPEG) | 4,482,856 | n/a (JPEG) | hero-bg.jpg 571,798 **>500 KB** |
| Google Fonts (3 families, 10 weights) | external | — | UNVERIFIED woff2 total |
| **Indicative first-visit total** | **~5.8 MB raw** (if all homepage images render) | | |

Site-wide image library: 37 JPG/PNG, 6,206,623 B. Only WebP on site: 6 files in `/areas/*.webp` (~62 KB, booking flow).

**Table D — Favicon set probe (live)**

| Path | Status | Content-Type | Size | Verdict |
|---|---|---|---|---|
| `/favicon.ico` | 200 | image/vnd.microsoft.icon | 661 B | exists — single 16×16 only |
| `/apple-touch-icon.png` | 200 | image/png | 11,095 B | exists — 180×180 ✓ |
| `/favicon.svg` | 200 | text/html | 3,511 B | **missing (soft-404)** |
| `/favicon-16x16.png` | 200 | text/html | 3,511 B | **missing (soft-404)** |
| `/favicon-32x32.png` | 200 | text/html | 3,511 B | **missing (soft-404)** |
| `/android-chrome-192x192.png` | 200 | text/html | 3,511 B | **missing (soft-404)** |
| `/android-chrome-512x512.png` | 200 | text/html | 3,511 B | **missing (soft-404)** |
| `/site.webmanifest` | 200 | text/html | 3,511 B | **missing (soft-404)** |

`index.html:23-24` references only `/favicon.ico` (`sizes="any"`) and `/apple-touch-icon.png`.

**Table E — `<img>` attribute audit (37 tags in `src/**/*.tsx`)**

| Attribute | Count | Note |
|---|---|---|
| `loading="lazy"` | 15/37 | 22 eager |
| `srcset`/`srcSet` | **0/37** | no responsive images |
| `width` + `height` | 7/37 | CLS risk on the rest |
| `alt` present | 37/37 | 16 empty `alt=""` |
| `.webp` references | 0/37 | photos all JPEG/PNG |

## OWNER-VERIFY (facts/claims/access that only the business owner can confirm)

1. **Intended canonical host**: Vercel currently 308-redirects apex → www, but canonical/OG/sitemap all say non-www. Which host is canonical in the Vercel domain settings / Search Console property (domain property vs URL-prefix)?
2. **Analytics**: is the absence of GA4/GTM/any tracking intentional (pre-launch), or was it lost in a refactor? Is there a plan for booking-funnel conversion events?
3. Is Google Search Console verified, and for which property (www / non-www / domain)? Any existing "Soft 404" or duplicate-without-canonical coverage reports?
4. Are the current image files the final production masters, or placeholders pending compression? Is a CDN/image-optimization pipeline (e.g., Vercel Image Optimization, currently unused — images are raw files in `public/`) acceptable to enable?
5. `src/data/business.ts:16,23-24` contains `TODO` comments on email/Instagram/TikTok — are the social URLs in the JSON-LD `sameAs` final? (JSON-LD also hardcodes a phone number — other lanes to verify.)
6. Any third-party embeds planned (WhatsApp chat widget, Google Maps embed, review widgets) that a CSP must whitelist?
7. Is the admin area (`/admin`, recharts dashboards) ever intended to be reachable/indexed, or should it be noindexed at the server level in addition to robots.txt?

## UNVERIFIED / limitations of this pass

- **Cannot be measured without a real browser**: LCP, INP, CLS, rendered total page weight, actual lazy-load execution, JS parse/execute time, font-swap behavior, above-the-fold render. Prescribed lab tests (run in Chrome/Lighthouse):
  - Homepage PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2F`
  - Deep route PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Flocations%2Fcanggu`
  - Booking funnel PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Fbooking`
  - CrUX field data (if sufficient traffic): check the "Core Web Vitals" section of the same PSI runs; no field data is expected for a new site — UNVERIFIED.
  - The static `TattooParlor` JSON-LD **is present in raw HTML** (`index.html:31-62`), so it does not require a JS render — but validate rendering of rich results at `https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.inkedup.id%2F`.
- Timing measured from the owner's machine (edge `sin1`, Singapore); Bali-user latency will differ. RUM data needed for real-user TTFB.
- Exact Google Fonts woff2 payload not fetched (varies by UA); treated as external/UNVERIFIED.
- Whether Googlebot's rendered DOM differs from the raw shell (client-side rendering of all routes) — requires GSC URL Inspection / a headless render; covered by crawl lane.
- HTTP/3/QUIC status not tested (curl build without HTTP/3); HTTP/2 confirmed.
- `access-control-allow-origin: *` attributed to Vercel platform default (not found in repo config) — UNVERIFIED against Vercel project settings.
- Compression of image bytes themselves (JPEG quality levels) not analyzed — byte-size and pixel-dimension analysis only.
