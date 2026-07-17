# SEO Changelog — InkedUp (inkedup.id)

Format: per work session — what was inspected, changed, tested, verified. Website code/content changes are marked **[SITE]**; documentation-only work is marked **[DOCS]**. Verification states: VERIFIED (live result confirmed) / LOCAL (verified in code or via curl, not yet deployed) / PENDING.

---

## Session 2026-07-17 (WITA) — Baseline audit & documentation package

### Inspected (read-only; no website modifications)

- **[DOCS] Live crawl of https://www.inkedup.id/** — all four http/https × www/non-www combinations, 21 sitemap URLs, 14 sampled routes (byte-identical 3,511-byte SPA shells, MD5-verified), trailing-slash/uppercase variants, nonexistent-URL probes (all HTTP 200 → sitewide soft-404), robots.txt, sitemap.xml, internal links, image URLs. Evidence: `_raw/02-live-crawl.md`.
- **[DOCS] Full repository read** — `/Users/openclaw/Downloads/tatooo2/app` (React 19 + Vite SPA, Express API as Vercel function, Neon Postgres): routes, `useSEO` metadata handling, static JSON-LD (`app/index.html:31-62`), sitemap/robots static files, `vercel.json` rewrites/headers, `business.ts` placeholder identity, `seed.ts`/`mockData.ts` demo data, absence of any analytics/GSC code. Evidence: `_raw/01-repo-architecture.md`.
- **[DOCS] Technical/performance probes** — response headers, TTFB (0.19–0.25 s, 3-run samples), Brotli/gzip, page weight (entry JS 602,547 B raw; recharts 424 KB preloaded site-wide; ~4.28 MB homepage JPEGs), favicon set (incomplete), OG tags, security headers (no CSP), image caching (`max-age=0`). Evidence: `_raw/03-tech-performance.md`.
- **[DOCS] Content & trust audit** — all public pages (via source verified against the deployed bundle + live API): fabricated metrics register, placeholder WhatsApp funnel, pricing contradictions, business-model contradictions, E-E-A-T gaps; positive finding: 8 location pages are unique/substantive (~500 words, not doorway pages). Evidence: `_raw/04-content-trust.md`.
- **[DOCS] Keyword research** — 52 keyword rows across 8 intent clusters with SERP-type evidence, proposed URLs/titles/priorities, 6 cannibalization risks mapped. Evidence: `_raw/05-keyword-research.md`.
- **[DOCS] Competitor SERP analysis** — 6 core commercial/safety queries + 11 location/style/service queries; ranking bar, incumbent weaknesses, differentiation opportunities; inkedup.id absent from every observed SERP. Evidence: `_raw/06`, `_raw/07`.
- **[DOCS] Brand-entity audit** — confirmed severe name collision (Inked Up Tattoo Parlour, Petitenget; 66K IG; confirmed GBP; press), zero branded-SERP ownership, public source repo in branded results, trademark-check requirement. Evidence: `_raw/08-brand-entity.md`.

### Created (documentation only — no [SITE] changes this session)

- `SEO Strategy/PLAN.md` — orchestrator execution plan
- `SEO Strategy/_raw/01–08` — lane evidence files (commands, outputs, citations)
- `SEO Strategy/00-executive-summary.md` — verdict, baseline snapshot, top issues, strategy
- `SEO Strategy/01-url-inventory.csv` — 40 URL rows (status/redirects/titles/canonicals/indexability)
- `SEO Strategy/02-technical-audit.md` — full technical findings with evidence + fixes + P0–P3
- `SEO Strategy/03-content-inventory.csv` — 18 page rows (purpose/wordcount/claims/trust gaps)
- `SEO Strategy/04-keyword-map.csv` — 52 keyword rows × 16 columns incl. cannibalization flags
- `SEO Strategy/05-competitor-analysis.md` — core + local/style competitive landscape
- `SEO Strategy/06-structured-data-map.md` — current schema audit + target schema architecture
- `SEO Strategy/07-internal-link-map.csv` — 111 mapped links + gap flags
- `SEO Strategy/08-trust-gap-analysis.md` — unsupported-claims register + trust system checklist
- `SEO Strategy/09-analytics-baseline.md` — measurement baseline (all UNVERIFIED), setup + event spec
- `SEO Strategy/10-implementation-backlog.md` — P0–P3 backlog + 30-day plan
- `SEO Strategy/OWNER-VERIFICATION-REQUESTS.md` — owner information requests (O-1 … O-7)

### Tested / verified

- VERIFIED (live, via curl): homepage 200 on www; non-www & http 308 → https www; sitemap 200 with non-www `<loc>`s; robots.txt reachable; placeholder number absent from raw HTML but present in JSON-LD/bundle; no mixed content; compression + HSTS active.
- VERIFIED (code): no GA4/GTM/GSC artifacts in repo; soft-404 behavior caused by `vercel.json` catch-all; artist/studio profiles lack per-route metadata.
- PENDING (needs browser/GSC): rendered DOM, JS-injected schema, Core Web Vitals, true Google index coverage — tools and exact URLs listed in `02-technical-audit.md`.

### Live URLs changed

**None.** Per the operating rules, the first pass was audit-only; all site changes await owner answers in `OWNER-VERIFICATION-REQUESTS.md` (fastest unblock: O-1.1, O-3.1, O-4.1, O-4.3, O-5.1).

### Problems still unresolved

1. Zero-index status unconfirmed (needs GSC — O-4.1). 2. Canonical host undecided (O-3.1). 3. Dead WhatsApp funnel (O-1.1). 4. Demo/fake trust data live in production (O-5.1, O-3.3). 5. CSR rendering blocks durable indexation (P1-1 engineering). 6. Brand collision + trademark status (O-7.1/O-7.2).

### Next five highest-impact actions

1. Owner answers the five unblock items → start Week-2 technical repair batch (canonical, sitemap, robots, favicons, footer, headers).
2. Strip/honestly re-label fabricated metrics (P1-3) before any indexing request.
3. Verify GSC + create GBP "InkedUp Bali" (P0-3, P0-4).
4. Prerender/SSG spike for public routes (P1-1) — the durable-indexation gate.
5. Replace placeholder WhatsApp everywhere + wire `whatsapp_click` tracking (P0-1, P1-6).

---

## Session 2026-07-17 (WITA, continued) — P0/P1 safe fixes implementation

Branch: `seo/p0-p1-safe-fixes` in `/Users/openclaw/Downloads/tatooo2`.
Owner input received: canonical host = **www.inkedup.id**; real WhatsApp number = **+62 811-2656-869**.

### Changed ([SITE])

- **[SITE] Replaced placeholder WhatsApp** — updated `business.ts` (`whatsapp` and `whatsappDisplay`), static JSON-LD `telephone` in `index.html`, and hardcoded `wa.me` links in `Home.tsx`, `Artists.tsx`, `ArtistDashboard.tsx`, `ArtistProfileBuilder.tsx`. Also updated admin seed phone in `server/src/seed.ts`. All other CTAs using `business.whatsapp` / `waLink()` now use the real number automatically.
- **[SITE] Canonical host alignment to `www.inkedup.id`** — updated `app/index.html` canonical, `og:url`, `og:image`, `twitter:image`, and static `TattooParlor` JSON-LD `url`. Updated `app/src/hooks/useSEO.ts` SSR/origin fallback to `https://www.inkedup.id`.
- **[SITE] Footer + internal links** — `Footer.tsx` "Areas" links now point to individual `/locations/:slug` pages (Canggu, Seminyak, Uluwatu, Ubud). `Home.tsx` location preview cards are now wrapped in `<Link>` to their location pages.
- **[SITE] Favicon + app-icon set** — shipped `favicon.svg`, `favicon-32x32.png`, `favicon-48x48.png`, multi-resolution `favicon.ico`, regenerated `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, and `site.webmanifest`; updated `index.html` head links.
- **[SITE] Performance code-splitting** — converted all non-home public routes in `App.tsx` to `React.lazy()`; removed the forced `recharts` manual chunk from `vite.config.ts` so recharts is only loaded on admin routes. Initial module-preload dropped from entry+recharts to entry+motion only; entry JS reduced from ~907 kB to ~487 kB uncompressed.
- **[SITE] `vercel.json` hardening + soft-404 fix** — replaced broad SPA catch-all with explicit route list, filesystem handler, real HTTP 404 for file-like missing assets (`*.*`) and unknown paths, added `404.html`. Added security headers: `Strict-Transport-Security` (includeSubDomains; preload), `Content-Security-Policy`, `X-Frame-Options: DENY`, plus image/extension long-lived `Cache-Control`.
- **[SITE] Profile per-route metadata** — added `useSEO` calls to `ArtistProfile.tsx` (Person schema + dynamic title/description/relative canonical) and `StudioProfile.tsx` (TattooParlor schema + dynamic title/description/relative canonical). Added optional `canonical` prop to `useSEO.ts`.
- **[SITE] Dynamic sitemap + robots.txt** — created `app/server/src/routes/sitemap.ts` endpoint `/api/sitemap.xml` returning XML with www `<loc>`s, `<lastmod>`, and changefreq/priority. Includes static public routes + 8 location pages; artist/studio profile URLs are queried from DB but only emitted when verified (active + bio/photo for artists; active + `verified_at IS NOT NULL` for studios), so currently zero profile URLs are emitted until real data is loaded. Added `/sitemap.xml` → `/api/sitemap.xml` rewrite in `vercel.json`. Updated `robots.txt` to `Sitemap: https://www.inkedup.id/api/sitemap.xml` and added `Disallow: /booking`, `Disallow: /artist/profile`. Deleted static `app/public/sitemap.xml`.

### Not changed (owner-blocked)

- Placeholder email, legalName, social handles, opening hours in `business.ts` and JSON-LD.
- Fabricated ratings/reviews/bookings/testimonials and "Verified" badges — awaiting owner data verification (O-5.1, O-3.3).
- Pricing contradictions — awaiting real pricing policy (O-5.4).
- Prerender/SSG — remains the largest engineering item (P1-1).
- GSC/GA4/GBP setup — awaiting owner accounts/access (O-4.1, O-4.2, O-4.3).
- Image optimization (WebP/AVIF/srcset) — not implemented in this batch.

### Tested / verified

- LOCAL (build): `npm run build` passes; Vite emits 58 chunks; no TypeScript errors introduced by these changes.
- LOCAL (server): started Express API locally and verified `/api/sitemap.xml` returns well-formed XML with `https://www.inkedup.id/` URLs and `Content-Type: application/xml`.
- LOCAL (curl): `robots.txt` content updated; static `sitemap.xml` removed.
- PENDING (live deploy): header changes, 404 behavior, and dynamic sitemap can only be verified after Vercel deploy.
- PENDING (owner): GSC access, GBP, verified artist/studio data, prerender/SSG decision.

### Live URLs changed

None deployed yet; changes are on branch `seo/p0-p1-safe-fixes`. Deploy via merge to `main` + Vercel build.

### Problems still unresolved

1. Dead WhatsApp funnel (awaiting O-1.1).
2. CSR-only rendering still prevents durable indexation (P1-1).
3. Fabricated trust data still live (awaiting O-5.1/O-3.3).
4. Zero confirmed Google indexation (awaiting O-4.1 GSC).
5. Brand collision + GBP absence (awaiting O-4.3/O-7.x).

### Next five highest-impact actions

1. Owner provides real WhatsApp number → replace across CTAs, wa.me links, `business.ts`, JSON-LD (P0-1).
2. Owner answers artist/studio reality + verification process → clean trust data and allow profile URLs in sitemap (P1-3, P1-5).
3. Deploy this branch and verify headers, 404s, dynamic sitemap, favicons live.
4. Spike prerender/SSG for public routes (P1-1).
5. Verify GSC property + submit corrected sitemap after deploy (P0-3).

### Post-deploy fix

- **[SITE] `vercel.json` routing/header delivery fix** — converted the standalone `headers` array into route-based headers with `"continue": true` so CSP, HSTS (`includeSubDomains; preload`), `X-Frame-Options`, and other security headers are actually emitted. Changed `/sitemap.xml` from a rewrite to a 308 redirect to `/api/sitemap.xml` so the path works despite Vercel's file-like 404 rule.

### Live verification (after deploy to https://www.inkedup.id/)

- VERIFIED: homepage canonical + all OG/Twitter/image URLs use `https://www.inkedup.id/`.
- VERIFIED: response headers include `Content-Security-Policy`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- VERIFIED: `https://www.inkedup.id/robots.txt` points to `https://www.inkedup.id/api/sitemap.xml` and disallows `/booking`, `/artist/profile`.
- VERIFIED: `https://www.inkedup.id/sitemap.xml` returns HTTP 308 → `/api/sitemap.xml`; sitemap contains 28 URLs on `www.inkedup.id` with `<lastmod>`.
- VERIFIED: unknown paths (`/nonexistent-page-xyz`) and missing file-like paths (`/missing.js`) return HTTP 404 with the branded `404.html`.
- VERIFIED: `/favicon.svg` returns 200 with `Cache-Control: public, max-age=31536000, immutable`.
- VERIFIED: production JS bundle contains the new WhatsApp number `628112656869`.
- PENDING: GSC verification + sitemap submission; Core Web Vitals measurement; rendered schema validation; GBP creation.
