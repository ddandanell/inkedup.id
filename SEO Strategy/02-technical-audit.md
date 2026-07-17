# 02 — TECHNICAL SEO AUDIT — InkedUp (https://www.inkedup.id/)

**Date:** 2026-07-17 (WITA) · **Role:** DOC-WRITER-B (technical baseline compilation)
**Scope:** Crawlability, indexation, canonicalization, rendering, metadata, performance, images, security headers, icons, mobile/a11y basics for the InkedUp React 19 + Vite SPA + Express/Neon stack.
**Method:** Compilation of existing audit evidence only — no re-research. Every claim cites a raw findings file plus the underlying command output or repo `file:line`.

**Evidence legend (cited throughout as R1/R2/R3/R8):**

| Code | Evidence file | Lane |
|---|---|---|
| R1 | `SEO Strategy/_raw/01-repo-architecture.md` | Repo architecture + live HTTP probes |
| R2 | `SEO Strategy/_raw/02-live-crawl.md` | Live crawl, sitemap/robots, host canonicalization, URL inventory |
| R3 | `SEO Strategy/_raw/03-tech-performance.md` | Headers, timing, page weight, images, favicons, third-party |
| R8 | `SEO Strategy/_raw/08-brand-entity.md` | Canonical-host + JSON-LD identity evidence (only) |

**Out of lane (referenced, not re-audited):** brand-SERP ownership and the "Inked Up Tattoo Parlour" name collision (R8 findings 1–2, rated P0 there); content/trust, keyword, and competitor lanes (other `_raw` files).

---

## A. Issue summary table (all issues)

Impact: High / Med / Low. Priority P0–P3 as assigned in the evidence files (cross-file priority conflicts are footnoted).

| # | Issue | Impact | Evidence (command / file:line) | Fix | Priority |
|---|---|---|---|---|---|
| 1 | Pure client-side rendering — zero SSR/SSG/prerender; all content, H1s, and internal links exist only after JS execution | High | R1 F1: `app/vite.config.ts:7-35` (no prerender plugin), `app/src/main.tsx:7-12` (`createRoot`), live probe — every URL returns the identical 3,511 B shell, body = `<div id="root"></div>` only (`app/index.html:65`); R2 F2/F6: MD5 `ee33bf7fb608edc4b35a9129d90edf97` identical on all 14 sampled routes, zero `<a href>` in raw HTML, FetchURL error "page may require JavaScript to render" | Prerender/SSR the ~20 public routes (react-router v7 framework mode, vite-plugin-ssr, or react-snap-style static generation); minimum: homepage + locations + artist/studio profiles | P1 (R1 marks "borderline P0") |
| 2 | Canonical host conflict: redirects force **www**, but static head / sitemap / robots / JSON-LD all declare **non-www** | High | R1 F2: `app/index.html:9` canonical `https://inkedup.id/`, `:16-17,:21` og:url/og:image/twitter:image non-www; `app/public/sitemap.xml:3-23` all non-www; `app/public/robots.txt:7` Sitemap non-www; curl `https://inkedup.id/` → `308 → https://www.inkedup.id/`; R2 F1 (full hop trace); R3 F2; R8 F8 | Pick ONE host (Vercel already enforces www); align `index.html` canonical/OG/JSON-LD, sitemap `<loc>`s, robots Sitemap line, `app/src/data/business.ts` URL constants, GBP/profile links | P1 |
| 3 | Soft-404 architecture: every nonexistent URL returns HTTP 200 with the SPA shell; real 404s impossible | High | R1 F3: `app/vercel.json:8-9` catch-all rewrite `/((?!api/).*) → /index.html`; curl `/this-page-does-not-exist-xyz` → 200; `app/src/App.tsx:94` catch-all → client-only `<NotFound/>`; R2 F3 (`/booking/test-slug`, `/artists/some-artist-slug`, `/studios/1` all 200 shells); R3 F1 (missing static files `/favicon.svg`, `/site.webmanifest` also return 200 HTML, masking absence) | With SSR/prerender return real 404 status; short-term: exclude file-like paths (`*.*`) from the SPA rewrite, add `noindex` to the NotFound render, 404 invalid `:slug` params at API/edge | P1 |
| 4 | Artist (`/artists/:slug` ×8) and studio (`/studios/:id` ×8) profiles have NO per-route metadata — inherit homepage title/description/canonical | High | R1 F4: Grep for `useSEO` across `app/src/pages/*.tsx` — absent in `ArtistProfile.tsx`, `StudioProfile.tsx`, `Booking.tsx`, `Login.tsx`, `StudioApply.tsx`, `NotFound.tsx`; routes `app/src/App.tsx:53-55`; R2 master URL inventory (`/artists/some-artist-slug`, `/studios/1` rows) | Call `useSEO` in ArtistProfile/StudioProfile with name-specific title/description/canonical + Person/TattooParlor JSON-LD (see `06-structured-data-map.md`) | P1 |
| 5 | Production serves demo/seed content (8 artists, 8 studios, invented 4.7–4.9 ratings, 65–154 review counts) as if real | High | R1 F5: `app/server/src/seed.ts:4` imports `mockData.ts`; live `GET /api/artists/active` / `/api/studios/active` return seed verbatim; `GET /api/stats` → `totalBookings:3, completedBookings:0`; `seed.ts:224-236` inserts 5 fabricated reviews; `seed.ts:238-242` preserves inflated counts | Replace with real artists/studios/reviews or strip ratings until real data exists; NEVER mark these up as AggregateRating (see `06-structured-data-map.md`) | P1 |
| 6 | Placeholder business identity surfaces publicly (phone `+62-812-3456-7890`, legalName TODO, unconfirmed socials/hours) | High | R1 F6/F11: `app/src/data/business.ts:3-24` (TODO on every value), `app/index.html:57` (placeholder phone in static JSON-LD), hardcoded `wa.me/6281234567890` at `Artists.tsx:494`, `ArtistDashboard.tsx:216`, `ArtistProfileBuilder.tsx:417`; R8 F3 + Table C ("FAKE — fix before anything else") | Fill verified values in `business.ts`, re-sync JSON-LD, remove the 3 hardcoded numbers; if a value is unconfirmed, REMOVE the field rather than publish a placeholder (R8 Rec 1) | P1 |
| 7 | No analytics, no Search Console verification, no conversion tracking anywhere | High | R1 F7: Grep for `googletagmanager|gtag|G-XXXXXXXX|GTM-|google-analytics|site-verification|dataLayer|fbq|clarity` across `app/**/*` → zero hits; `package.json` has no analytics deps; R2 F12 (no verification meta in head, zero index presence in accessible search tools); R3 F3 (no GA4/GTM/Meta Pixel/Hotjar/Clarity/Sentry/Posthog in domain inventory) | Install GSC (domain property) + GA4/GTM + Bing WMT + event tracking — full spec in `09-analytics-baseline.md` | P1 |
| 8 | Sitemap: static, incomplete (missing all 16 artist/studio URLs), non-www `<loc>`s, no `<lastmod>`, includes form page `/studio/apply` | Med | R1 F9: `app/public/sitemap.xml:3-23` — 21 hardcoded URLs; R2 F5 (sitemap fetch: 21 URLs, all non-www, priority only); R3 F15 (no lastmod) | Generate sitemap at build/deploy from DB (live artist/studio slugs + static pages), correct host, add `<lastmod>`; decide whether `/studio/apply` should rank (R1 OWNER-VERIFY #9) | P2 (lastmod sub-item P3) |
| 9 | robots.txt: Sitemap line points to redirecting non-www URL; disallowed routes (`/admin`, `/login`, `/artist/dashboard`) return 200 shells; `/booking`, `/artist/profile`, `/not-found` not disallowed | Med | R1 F8/F16: `app/public/robots.txt:1-7`; R2 F8 (curl `/admin`, `/login`, `/artist/dashboard` → 200, 3,511 B identical MD5; `/artist/profile` allowed, `App.tsx:83`) | Update Sitemap line to final host; serve real 404/401 for admin/auth routes OR allow crawling + `noindex` (Disallow + noindex is a classic conflict — R1 F16); decide `/booking` handling | P2 |
| 10 | Duplicate URL variants return 200 with no normalization (trailing slash `/locations/`, uppercase `/Locations`) | Med | R2 F4: both variants → 200, 0 redirects, identical 3,511 B shell | 308-normalize case/trailing-slash at the edge (Vercel `cleanUrls`/middleware) plus self-canonicals | P2 |
| 11 | Zero crawlable content or internal links in raw HTML — discovery 100% JS-dependent; sitemap is the only non-JS discovery path and is broken per #2/#8 | Med | R2 F6: homepage body = `<div id="root"></div>`, zero `<a href>`; `kimi_fetch_v2` extracted only `<title>`; FetchURL explicit JS-render error | Same as #1 (SSR/prerender); ensure key nav links exist in initial HTML | P2 |
| 12 | JS-injected JSON-LD and per-route metadata are render-dependent and unverifiable without a browser; FAQPage markup has near-zero rich-result eligibility since Google's Aug-2023 FAQ change | Med | R1 F10: `useSEO.ts:42-86` injects JSON-LD client-side; FAQ `FAQ.tsx:207-221`, LocationPage `LocationPage.tsx:100-134`; R2 F9 (curl-invisible) | Move critical metadata/schema into prerendered HTML; de-prioritize FAQPage schema; verify rendered DOM via Rich Results Test (URLs in §D) | P2 |
| 13 | recharts admin bundle (424,243 B raw / 112,104 B br) modulepreloaded on EVERY page; statically imported by the entry bundle though used only on lazy admin pages | Med | R3 F4: `app/dist/index.html:63-66` modulepreload of `charts-wFw_0wyN.js`; grep of entry `index-CeMNiPoi.js` shows static `import … from "./charts-wFw_0wyN.js"`; recharts imported only by `AdminDashboard.tsx`, `AdminCommissions.tsx`, unused `components/ui/chart.tsx`; `vite.config.ts:28-31` manualChunks | Remove static edge from entry graph, drop the modulepreload, load recharts only inside the lazy admin chunk | P2 |
| 14 | Entry JS 602,547 B raw (~588 KB); initial JS = 1,166,596 B raw / 326,559 B br (~319 KB) across 3 files; JS+CSS subtotal 1,303,786 B raw / 352,809 B br (~344 KB); all ~16 public pages eagerly imported | Med | R3 F5 + Table C: `dist/index.html` asset list, `src/App.tsx:5-20` eager imports (only Booking/LocationPage/StudioApply/Artist/Admin lazy, `App.tsx:23-33`) | Route-level `lazy()` for all non-home pages, trim vendor deps, drop framer-motion from the critical path | P2 |
| 15 | Heavy unoptimized images: 26 homepage-referenced JPEGs = 4,482,856 B (~4.28 MB); `hero-bg.jpg` 571,798 B (2752×1536); 0/37 `<img>` with srcset; 0/37 serve WebP; only 15/37 `loading="lazy"`; only 7/37 have width/height (CLS risk) | Med | R3 F6 + Table E (Python `<img>` audit of `src/**/*.tsx`); R1 F13 (`du -h app/dist/*`; hero slides 212–268 K each; hero slide 1 preloaded `index.html:25`) | Responsive srcset (640/1280/1920) in WebP/AVIF, compress heroes <200 KB, add width/height everywhere, lazy-load all below-fold images (keep LCP image eager — current `fetchpriority` pattern is correct, R3 positives) | P2 |
| 16 | Static images served `cache-control: public, max-age=0, must-revalidate` — ~5.9 MB image library revalidates every visit | Med | R3 F7: header dump on `/hero-slide-1.jpg` (200, HIT, revalidated); `vercel.json:20-25` immutable cache only for `/assets/*`; images live un-hashed at root | Move images under hashed/versioned paths or add a `vercel.json` header rule (`max-age=31536000, immutable` with content-hash filenames, or long `stale-while-revalidate`) | P2 |
| 17 | No Content-Security-Policy header; no X-Frame-Options / frame-ancestors | Med | R3 F9: verified absent on HTML, assets, sitemap header dumps; R1 F14 (`vercel.json:11-25` sets only XCTO/Referrer-Policy/Permissions-Policy) | Add CSP starting `default-src 'self'` + allowances for fonts.googleapis.com/fonts.gstatic.com, incl. `frame-ancestors 'self'`; optionally legacy `X-Frame-Options: SAMEORIGIN` | P2 (R1 rates CSP P3 — see contradictions note) |
| 18 | Incomplete favicon set: only 16×16 `favicon.ico` + 180×180 `apple-touch-icon.png`; `/favicon.svg`, 16/32 px PNGs, `/android-chrome-192x192.png`, `/android-chrome-512x512.png`, `/site.webmanifest` all missing (masked as soft-404 HTML) | Med | R3 F8 + Table D (live probes: all return 200 `text/html` 3,511 B); `app/index.html:23-24` references only the two existing icons; `sips`/`file`: favicon.ico = single 16×16 | Add SVG or 16/32/48 px ICO + PNG fallbacks, android-chrome 192/512, `site.webmanifest`; reference in `index.html` | P2 |
| 19 | Contact form is a `mailto:` hand-off with a cosmetic success state (no backend); conversion funnels unmeasured | Med | R1 F12: `app/src/pages/Contact.tsx:56-64`; booking flow is real (`Booking.tsx:186-190` → `store.addBookingLead` → `POST /api/bookings` → Neon); success screen nudges to WhatsApp (`Booking.tsx:337`) | Wire Contact to a real endpoint or remove in favor of WhatsApp-only; add event tracking (spec in `09-analytics-baseline.md`) | P2 |
| 20 | OG/Twitter meta incomplete: no `og:image:width/height/alt`; og:image is 1376×768 (standard 1200×630) and its URL 308-redirects (non-www) | Low | R3 F12: `app/index.html:12-21`; og-image.jpg probe 200, 132,596 B, 1376×768; R2 F10 | Final-host absolute image URL + dimension/alt meta (folds into #2 host cleanup) | P3 |
| 21 | HSTS present but weak: `max-age=63072000` without `includeSubDomains` or `preload` | Low | R3 F10 (header dumps); R1 evidence line 11 | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` once all subdomains confirmed HTTPS | P3 |
| 22 | `access-control-allow-origin: *` on every response incl. HTML (platform default, not in repo config) | Low | R3 F11 + Table A; `vercel.json` has no CORS rule | Scope CORS to the API routes that need it; verify Vercel project settings | P3 |
| 23 | Google Fonts: 3 families / 10 weights via one render-blocking stylesheet | Low | R3 F14: `app/index.html:26-28` (preconnect ✓, `display=swap` ✓) | Trim to ≤5 weights or self-host subset woff2 with immutable caching | P3 |
| 24 | `http://inkedup.id/` needs 2 redirect hops to reach the canonical host | Low | R2 F11 (hop-by-hop trace: http→https non-www→www) | Flatten to a single 308 at the edge | P3 |
| 25 | Indexability hygiene: `/booking/:slug` reachable without auth, no noindex, not disallowed; `/login` disallowed in robots (blocks any future noindex from being seen); `/price-calculator` + `/artist/apply` are client-side `<Navigate>` redirects serving 200 shells, not 301s | Low | R1 F16 + route map (`App.tsx:60,71,79`); R2 inventory rows | `noindex` booking/login/apply where appropriate; replace client-redirect legacy aliases with real 308s | P3 |
| 26 | Internal-linking gaps: footer "Locations" links (Canggu/Seminyak/Uluwatu/Ubud) all point to `/locations`, not the per-slug pages; navbar lacks FAQ/Contact links | Low | R1 F15: `Footer.tsx:24-29`, `Navbar.tsx:6-18`; R2 F7 (`Footer.tsx:25-28`) | Point each footer area link to `/locations/:slug`; consider FAQ/Contact in nav | P3 in R1 / **P2 in R2 — cross-file conflict, flagged** |
| 27 | 16/37 `<img>` have empty `alt=""` (some legitimately decorative heroes; gallery/work/artist images lose image-search traffic — a key tattoo discovery channel) | Low | R3 F13 + Table E; R1 F13 (alt pattern: good on `Locations.tsx:212`, `Inspiration.tsx:206`; empty on `HeroSlideshow.tsx:79`, `FAQ.tsx:230`, logos `Navbar.tsx:96`, `Footer.tsx:50`) | Descriptive alt (style, placement, artist) on content images; keep decorative `alt=""` on true backgrounds | P3 |
| 28 | Dead CMS surface: `content_pages` table seeded but never read by the frontend — all public copy hardcoded; content edits require a deploy | Low | R1 F17: `seed.ts:209-221`, `services/api.ts:93-94` (`getContentPage(s)`), Grep shows no page calls them | Wire it up or remove; document content-editing workflow; future CMS pages must not publish thin content | P3 |
| 29 | Static `TattooParlor` JSON-LD data-quality issues beyond the placeholder phone: `url` non-www, `areaServed` lists 6 areas vs 8 live location pages (Nusa Dua, Jimbaran missing), no geo/priceRange/street, `sameAs` profiles appear nonexistent | Med | R1 F11: `app/index.html:31-62`; R2 F9 (areaServed 6 vs sitemap 8); R8 F4 (sameAs → dead handles) | Align host + areaServed with the 8 locations; add geo/priceRange only when real; keep sameAs only for live verified profiles (see `06-structured-data-map.md`) | P2 (R2: rises to P1 if phone confirmed fake — R8 Table C already marks it FAKE) |

**No P0 technical defects were found in the technical lanes** — the site is up, HTTPS-valid, crawlable, and not blocked at the robots layer (R1 line 179 / R2 F13 / R3 line 79). Note: R8 assigns P0 to two *brand/entity* issues (0% branded-SERP ownership; name collision) outside this report's lane — see "Contradictions" in the writer's return summary.

---

## B. Detailed sections

### B.1 Crawlability & indexation

**robots.txt** — `app/public/robots.txt:1-7`, live `curl https://www.inkedup.id/robots.txt` → 200, 126 B (R1, R2):

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /artist/dashboard
Disallow: /login

Sitemap: https://inkedup.id/sitemap.xml
```

Issues:
- **Sitemap line points to the non-www host**, which 308-redirects (`curl -i https://inkedup.id/sitemap.xml` → `308 → https://www.inkedup.id/sitemap.xml`, R2). Low risk per R1 ("some crawlers' tolerance for redirected sitemap URLs varies") but inconsistent.
- **Disallowed routes return 200 shells** — `/admin`, `/login`, `/artist/dashboard` all serve the byte-identical 3,511 B SPA shell (R2 F8, MD5 `ee33bf…`). This is the classic setup for GSC "Indexed, though blocked by robots.txt" entries; any future client-side `noindex` on those routes can never be seen because crawling is disallowed (R1 F16). robots Disallow is belt-and-braces only — those routes are CSR-gated, not server-gated; the shell HTML is publicly served (R1 route-map note, line 212).
- **Coverage gaps**: `/booking` (booking funnel, thin/duplicate), `/artist/profile` (account page), `/not-found` are not disallowed and all return 200 (R1 F8/F16; R2 F8).

**Sitemap** — `app/public/sitemap.xml:3-23`, live `curl -i https://www.inkedup.id/sitemap.xml` → 200 `application/xml`, 1,761 B, `x-vercel-cache: HIT` (R2):
- 21 URLs: `/`, `/artists`, `/studios`, `/locations`, 8 × `/locations/:slug`, `/inspiration`, `/pricing`, `/how-it-works`, `/safety`, `/faq`, `/contact`, `/studio/apply`, `/privacy`, `/terms`.
- **Domain mismatch**: every `<loc>` is `https://inkedup.id/…` (non-www) — every sitemap URL redirects (R2 F1, inventory row for `https://inkedup.id/artists` → 1 hop).
- **Incomplete**: zero entries for the 8 `/artists/:slug` and 8 `/studios/:id` pages that exist in the app (`App.tsx:53-55`; live seed data confirms 8+8 via `GET /api/artists/active`, `/api/studios/active`, R1). These are the pages most likely to rank for artist-name queries (R2 F5).
- **No `<lastmod>`, no `<changefreq>`** — priority only (R2; R3 F15).
- Includes `/studio/apply` (a form page, priority 0.6) — whether it should rank is an owner decision (R1 F9, OWNER-VERIFY #9).
- Static file, copied verbatim to `dist/` by the Vite build (`diff app/public/sitemap.xml app/dist/sitemap.xml` → identical, R1) — cannot reflect live artist/studio slugs without regeneration.

**Indexation state**: accessible third-party search tools returned **zero inkedup.id URLs** for `site:` queries, exact-title, and brand queries (R2 search-visibility probes table: WebSearch `site:inkedup.id` → "No search results were found"; `kimi_search_v2` → HTTP 404 backend error; Bing fetch → tool failure). **Actual Google/Bing coverage is UNVERIFIED** — those backends are not Google (R2 F12, UNVERIFIED section). No GSC property is verified (see issue #7).

### B.2 Canonicalization

- **Redirect layer (correct):** all variants 308 to `https://www.inkedup.id/` — `http://inkedup.id/` → 2 hops; `https://inkedup.id/` and `http://www.inkedup.id/` → 1 hop; `https://www.inkedup.id/` → 200, 0 hops. Deep URLs inherit the host redirect (`https://inkedup.id/artists` → 1 hop → www). Effective canonical host = `https://www.inkedup.id/` (R2 host-canonicalization trace).
- **Declared layer (conflicts):** raw-HTML `<link rel="canonical" href="https://inkedup.id/">` (`app/index.html:9`), `og:url`/`og:image`/`twitter:image` non-www (`index.html:16-17,21`), sitemap `<loc>`s non-www (`public/sitemap.xml:3-23`), robots Sitemap line non-www (`public/robots.txt:7`), static JSON-LD `"url": "https://inkedup.id/"` (`index.html:37`) — all point to a host that permanently redirects. Per Google's canonicalization docs, canonical signals should point to the final canonical URL; mixed signals force Google to pick a canonical itself (R2 F1).
- **Post-hydration flip:** `useSEO.ts:5-6` builds canonicals from `window.location.origin` (www in production) — so the raw HTML and the rendered DOM **disagree about the canonical** on every page (R1 F2). Two conflicting canonical signals per page.
- **Duplicate path variants:** `/locations/` (trailing slash) and `/Locations` (uppercase) return 200 with no redirect or normalization (R2 F4).
- **Owner decision required:** intended permanent hostname (R1 OWNER-VERIFY #8; R2 OWNER-VERIFY #1; R8 OWNER-VERIFY #7). Redirects already enforce www; the fix is aligning every declared signal to whichever host is chosen.

### B.3 Rendering model

- **Pure CSR SPA.** `app/vite.config.ts:7-35` — plugins: `inspectAttr()`, `react()`; no SSR/prerender tooling. `app/src/main.tsx:7-12` — `createRoot` + `BrowserRouter`. `app/package.json` — no `react-helmet`, no SSR/prerender packages (R1 F1).
- **Identical byte-for-byte shell on every route:** all 14 sampled sitemap URLs + `/admin`, `/login`, `/artist/dashboard`, `/booking/test-slug`, `/price-calculator`, `/artist/apply`, `/artist/profile`, `/artists/some-artist-slug`, `/studios/1` return 200, exactly 3,511 B, MD5 `ee33bf7fb608edc4b35a9129d90edf97` (R2 route sweep). Cause: `app/vercel.json:8-9` catch-all rewrite `/((?!api/).*) → /index.html`.
- **JS-only content and links:** raw homepage body = `<div id="root"></div>`; no H1, no text, zero `<a href>` in raw HTML (R2). Non-rendering crawlers (most social/IM bots that don't read static OG, Bing partially, AI crawlers, link-preview scrapers) see an empty page (R1 F1).
- **Per-route metadata only post-hydration:** `app/src/hooks/useSEO.ts:42-86` sets title/description/OG/Twitter/canonical and injects JSON-LD inside `useEffect` — invisible in served HTML (R1 F10; R2 repo evidence). Render verification of every per-page value is UNVERIFIED (§D).
- **Mitigating positives:** static OG/Twitter tags in the shell mean social link previews work without rendering (R1 positives); Google Fonts + hero preload are correctly configured (`index.html:25-28`).

### B.4 Soft-404 architecture

- `vercel.json:8-9` rewrites every non-API path to `/index.html` with status 200. Live: `/this-page-does-not-exist-xyz`, `/this-page-should-not-exist-xyz`, `/booking/test-slug`, `/artists/some-artist-slug`, `/studios/1` → all 200 shells (R1 F3; R2 F3; R3 F1).
- The React `<NotFound/>` component (`App.tsx:94` catch-all) renders client-side only; HTTP status stays 200. Unknown location slugs client-side redirect to `/not-found` (`LocationPage.tsx:154`), which itself serves 200 via the same catch-all (R1 F3).
- **Collateral damage:** missing static files are masked — `/favicon.svg`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/android-chrome-*.png`, `/site.webmanifest` all return 200 `text/html` 3,511 B instead of 404 (R3 Table D). Missing-asset detection is impossible by HTTP status.
- Expected GSC symptom once verified: "Soft 404" coverage entries and crawl-budget waste on unlimited duplicate URLs (R2 F3).

### B.5 Metadata

- **Pre-render state (the defect):** every served URL carries the identical homepage title `InkedUp — Premium Mobile Tattoo Concierge, Bali`, the identical meta description, and the identical non-www homepage canonical (R2 master URL inventory — 21+ rows all identical). Before/without rendering, all pages are exact duplicates that canonicalize to the homepage (R2 F2).
- **Post-render mechanism:** `useSEO.ts:42-86` — well-built hook (sets full title, meta, OG/Twitter, canonical, optional JSON-LD; cleans up injected JSON-LD on unmount), but render-dependent and unevenly applied (R1 F10).
- **Coverage (Grep-verified, R1 F4/F10):** `useSEO` present on 13 of 19 public pages — Home, Artists, Studios, Locations, LocationPage, Pricing, FAQ, Safety, HowItWorks, Contact, Inspiration, Privacy, Terms. **Absent** on `ArtistProfile.tsx`, `StudioProfile.tsx`, `Booking.tsx`, `Login.tsx`, `StudioApply.tsx`, `NotFound.tsx` — i.e., all 16 artist/studio profile URLs (the site's most linkable, long-tail-valuable pages) present homepage metadata (R1 F4).
- **JSON-LD:** see `06-structured-data-map.md` for the full structured-data inventory and target architecture.

### B.6 Performance & Core Web Vitals

**Measured (curl, 2026-07-17 ~11:43 WITA, Vercel edge `sin1` Singapore, R3 Tables B/C):**

| Metric | Value | Verdict |
|---|---|---|
| TTFB `/` (3 runs) | min 0.198 s / avg 0.228 s | OK — healthy from region (R3 F-positives) |
| TTFB `/hero-slide-1.jpg` | min 0.187 s / avg 0.213 s | OK |
| HTML shell | 3,511 B raw / 1,279 B br | OK |
| Entry JS `index-CeMNiPoi.js` | 602,547 B raw / 165,520 B br | **>300 KB raw flag** |
| `charts-wFw_0wyN.js` (recharts, admin-only) | 424,243 B raw / 112,104 B br | **modulepreloaded on every page — wasted ~112 KB br** |
| `motion-Ddj-jVmO.js` (framer-motion) | 139,806 B raw / 48,935 B br | — |
| CSS `index-CCcx8c9t.css` | 137,190 B raw / 26,250 B br | — |
| **Initial JS total** | **1,166,596 B raw (~1.11 MB) / 326,559 B br (~319 KB)** | P2 |
| **Initial JS+CSS subtotal** | **1,303,786 B raw / 352,809 B br (~344 KB br)** | P2 |
| Homepage-referenced images | 26 JPEGs, 4,482,856 B (~4.28 MB) | P2 (see §B.7) |
| Indicative first-visit total | ~5.8 MB raw if all homepage images render | P2 |

- Brotli served (gzip fallback verified: main JS 164,802 B gzip); HTTP/2 confirmed; hashed `/assets/*` immutably cached (`max-age=31536000, immutable`); hero slide 1 preloaded with `fetchpriority="high"`, remaining slides lazy — correct LCP pattern (R3 positives).
- **Core Web Vitals (LCP / INP / CLS): cannot be measured without a real browser** — no lab or field CWV data exists in the evidence. CrUX field data is not expected for a new site (R3 UNVERIFIED). Lab estimates only: LCP payload is a 228–571 KB JPEG plus ~1.11 MB raw JS on Bali mobile networks (R1 F1, R3 F5/F6); CLS risk from 30/37 `<img>` lacking width/height (R3 Table E).
- **Prescribed tests (exact URLs from R3):**
  - Homepage PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2F`
  - Deep route PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Flocations%2Fcanggu`
  - Booking funnel PSI: `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Fbooking`
  - Rich Results Test (homepage JSON-LD): `https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.inkedup.id%2F`
  - CrUX field data: read the "Core Web Vitals" section of the same PSI runs once traffic exists.

### B.7 Images

- **Weight:** homepage references 26 JPEGs totaling 4,482,856 B (~4.28 MB) (grep of `src/pages/Home.tsx` + `src/components/HeroSlideshow.tsx`, sizes via `stat`, R3). Largest: `hero-bg.jpg` 571,798 B (2752×1536), `location-nusa-dua.jpg` 316,227 B, `hero-slide-4.jpg` 273,583 B, `process-step-3.jpg` 261,351 B. Site-wide library: 37 JPG/PNG files, 6,206,623 B (~5.92 MB) in `app/dist/` (R3; R1 counted 35 JPEGs via `du` — see contradictions note).
- **Format:** all photos JPEG/PNG; zero `<img>` serves WebP — the only WebP files on the site are 6 small body-area images in `dist/areas/*.webp` (~62 KB, used by `Pricing.tsx:84-89`) (R3 F6; R1 F13).
- **Responsive/lazy/dimensions (Python audit of 37 `<img>` tags in `src/**/*.tsx`, R3 Table E):** `srcset` **0/37** · `.webp` references **0/37** · `loading="lazy"` **15/37** (22 eager) · `width`+`height` **7/37** (CLS risk on the rest) · `alt` present 37/37 with **16 empty `alt=""`** · `fetchPriority` only in `HeroSlideshow.tsx:83` (first slide `high` — correct).
- **Caching:** un-hashed public JPEGs served `cache-control: public, max-age=0, must-revalidate` (header dump on `/hero-slide-1.jpg`, R3 F7) — repeat views revalidate ~5.9 MB of imagery.
- **Alt-text pattern:** good on location cards (`Locations.tsx:212`) and inspiration items (`Inspiration.tsx:206`); empty on hero/page-hero backgrounds (`HeroSlideshow.tsx:79`, `FAQ.tsx:230`, `Inspiration.tsx:99`) and logos (`Navbar.tsx:96`, `Footer.tsx:50`) — acceptable a11y-wise for decorative images but a missed image-search opportunity on work/artist photos (R1 F13; R3 F13).
- No broken image URLs: all 15 probed assets returned 200 (R2 asset table).

### B.8 Security headers

Live header dumps (`curl -sS -D -`, R3 Table A; R1 evidence line 11; `app/vercel.json:11-25`):

| Header | Status | Verdict |
|---|---|---|
| `strict-transport-security` | `max-age=63072000` — **no `includeSubDomains`, no `preload`** | Present but weak — P3 (R3 F10) |
| `content-security-policy` | **ABSENT** | P2 (R3 F9) |
| `x-frame-options` / `frame-ancestors` | **ABSENT** | P2 (R3 F9) — clickjacking protection relies on nothing |
| `x-content-type-options` | `nosniff` ✓ | Good |
| `referrer-policy` | `strict-origin-when-cross-origin` ✓ | Good |
| `permissions-policy` | `geolocation=(), microphone=(), camera=()` ✓ | Good |
| `access-control-allow-origin` | `*` on every response (platform default, not in repo config) | P3 (R3 F11) |
| `x-robots-tag` | Absent on all tested URLs | Neutral (no meta robots tag in HTML either, R2) |

Context: this is a booking platform collecting personal data — CSP is defense-in-depth worth having (R3 F9). Before writing a CSP, confirm planned third-party embeds (WhatsApp widget, Maps embed, review widgets) with the owner (R3 OWNER-VERIFY #6).

### B.9 Favicon & icons

- **Present:** `/favicon.ico` 200, 661 B — but a **single 16×16 icon** only (`file` output, R3); `/apple-touch-icon.png` 200, 11,095 B, 180×180 ✓. Referenced at `app/index.html:23-24`.
- **Missing (all confirmed live as soft-404 HTML, and absent from `app/public/` and `app/dist/`):** `/favicon.svg`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/android-chrome-192x192.png`, `/android-chrome-512x512.png`, `/site.webmanifest` (R3 F8 + Table D).
- Impact: Google SERP favicon may render blurry/missing (Google wants ≥48×48 multiples or SVG); poor Android/PWA icon experience (R3 F8).

### B.10 Mobile & accessibility basics

- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` present (`app/index.html:5`) ✓. `lang="en"` ✓ (`index.html:2`). `charset=UTF-8` ✓. `theme-color` ✓ (`index.html:8`). (R3 positives; R1 F18.)
- **Keyboard navigation, focus states, color contrast: UNVERIFIED** — require a real browser (e.g., Lighthouse accessibility audit within the PSI runs in §B.6, plus manual keyboard pass). No accessibility tooling was run in any evidence lane.
- **Touch/alt basics:** all 37 `<img>` have an `alt` attribute (16 empty — §B.7); decorative-empty pattern is acceptable but unreviewed in a rendered state.

### B.11 Mixed content

**None found.** Live HTML contains zero `http://` references; `grep -rn 'http://' src` (excluding w3.org) → none (R3 F-positives / evidence line 35). HTTPS enforced with HSTS; all probed assets served over HTTPS (R2).

### B.12 Hreflang / internationalization

- **Single-language site:** `lang="en"` (`app/index.html:2`); no `hreflang` annotations anywhere and none needed today — the site is English-only (R1 F18).
- **Future consideration:** the JSON-LD `contactPoint.availableLanguage` already advertises `["English", "Indonesian"]` (`index.html:59`), and the market (Bali) suggests an eventual Indonesian (`id`) content layer. If/when `id` pages ship, add reciprocal `hreflang` (`en`/`id`/`x-default`) in the prerendered head and per-language self-canonicals. Not a current defect.

---

## C. Cannot verify without browser / GSC (exact tools & URLs)

| Item | Why unverifiable now | Exact tool / URL |
|---|---|---|
| Rendered per-page titles, descriptions, canonicals, H1s, content, internal links | All set post-hydration by `useSEO.ts`; curl/`kimi_fetch_v2`/FetchURL see only the 3,511 B shell (R2 UNVERIFIED) | GSC URL Inspection ("Test live URL" → rendered HTML) — after verification; or any headless browser |
| JS-injected JSON-LD validity (BreadcrumbList/Service/FAQPage on `/locations/:slug`, FAQPage on `/faq`) | Injected client-side; curl-invisible (R1 F10; R2 F9) | Rich Results Test: `https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.inkedup.id%2Flocations%2Fcanggu` and `…%2Ffaq`; Schema.org validator `https://validator.schema.org/` on rendered DOM |
| Static TattooParlor JSON-LD rich-result eligibility | Present in raw HTML (parseable by curl) but rendering/eligibility unvalidated | `https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.inkedup.id%2F` (from R3) |
| LCP / INP / CLS (lab + field) | No browser in any lane; no CrUX data expected for a new site (R3 UNVERIFIED) | PSI runs (exact URLs in §B.6) + GSC Core Web Vitals report after verification |
| Keyboard navigation, focus states, contrast | No accessibility tooling run | Lighthouse accessibility audit (within the PSI runs §B.6) + manual keyboard pass |
| Actual Google/Bing index coverage; canonical host selection by Google | Accessible search tools are not Google (R2 F12) | GSC Pages report + `site:inkedup.id` / `site:www.inkedup.id` in a real Google session (R2 OWNER-VERIFY #3) |
| Soft-404 / "Indexed, though blocked" / duplicate-canonical coverage reports | Predicted by R2 F3/F8 but unobserved | GSC Pages (index coverage) after verification |
| Dynamic-route behavior for invalid slugs (`/booking/:slug`, `/artists/:slug`, `/studios/:id` rendered not-found states) | Client-side render states unobserved (R2 UNVERIFIED) | Headless browser pass |
| `/price-calculator`, `/artist/apply` live status behavior | Client-side `<Navigate>` only (`App.tsx:60,79`); serves 200 shell — verified in code, not live-tested for rendered redirect (R1 UNVERIFIED) | Headless browser / GSC URL Inspection |
| Rendered nav/footer broken-link status | Link targets enumerated from repo components, each verified 200 — inferred, not observed in rendered DOM (R2 UNVERIFIED) | Headless browser crawl (e.g., Screaming Frog with JS rendering) |
| RUM TTFB for Bali users | Timing measured from owner's machine via edge `sin1` Singapore (R3 UNVERIFIED) | GA4/RUM after `09-analytics-baseline.md` is implemented |
| Google Fonts woff2 payload | Varies by UA; not fetched (R3 UNVERIFIED) | Browser DevTools network panel |
| HTTP/3/QUIC | curl build without HTTP/3 (R3 UNVERIFIED) | Browser DevTools / `curl --http3` build |

---

## D. Positive confirmations (keep)

(R1 line 179; R2 F13; R3 positives)

- Non-www → www 308 redirect works at the host level for root and deep URLs; HTTPS enforced with HSTS; single canonical host at the redirect layer.
- robots.txt syntactically valid and fetchable; sitemap fetchable on the canonical host with correct content type; both edge-cached.
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` set site-wide; zero mixed content.
- Hashed `/assets/*` correctly immutable-cached; Brotli + gzip both served; HTTP/2; TTFB healthy (~0.19–0.25 s from region; edge SIN — low latency for Bali).
- Static OG/Twitter tags in the shell → social link previews work without rendering; `og-image.jpg` live (132,596 B).
- Hero LCP pattern correct: slide 1 preloaded + `fetchpriority="high"`, other slides lazy (`index.html:25`, `HeroSlideshow.tsx:81-83`).
- Code-splitting exists for heavy routes (`App.tsx:22-33`); admin/API list endpoints correctly auth-gated (401 verified live).
- Static `TattooParlor` JSON-LD in raw HTML is the *right delivery mechanism* (readable without rendering) — only its data is wrong (R1 F11).
- Per-location content in `locationContent.ts:26-328` is substantial, unique, non-doorway copy (R1 positives).

---

*Compiled from `_raw/01`, `_raw/02`, `_raw/03` (all lanes, 2026-07-17) and `_raw/08` (canonical-host + JSON-LD identity evidence only). No new live probes were run for this report; repo files re-read for citation precision: `app/index.html`, `app/vercel.json`, `app/public/robots.txt`, `app/public/sitemap.xml`, `app/src/hooks/useSEO.ts`.*
