# LIVE-CRAWL — Baseline Findings

Date: 2026-07-17 | Scope: Live crawl of https://www.inkedup.id/ — sitemap, all discoverable routes, host canonicalization, soft-404/variant handling, internal links, image assets, search-index visibility | Method: `curl` (HTTP/2, `-w` timing/status fields), `kimi_fetch_v2`, `FetchURL`, `WebSearch`, `kimi_search_v2`, read-only repo inspection (`app/vercel.json`, `app/src/App.tsx`, `app/src/hooks/useSEO.ts`, `app/src/components/Navbar.tsx`, `app/src/components/Footer.tsx`, `app/public/sitemap.xml`, `app/public/robots.txt`). Time anchor: 2026-07-17 11:42–11:55 WITA (UTC+8), verified via `date`.

## Evidence collected (commands/URLs/files inspected, with key outputs)

**Date anchor**
- `date '+%Y-%m-%dT%H:%M:%S%z (%Z)'` → `2026-07-17T11:42:42+0800 (WITA)`

**robots.txt**
- `curl https://www.inkedup.id/robots.txt` → 200. Body: `User-agent: * / Allow: / / Disallow: /admin / Disallow: /artist/dashboard / Disallow: /login` + `Sitemap: https://inkedup.id/sitemap.xml` (Sitemap line uses **non-www** host).

**Sitemaps**
- `curl -i https://www.inkedup.id/sitemap.xml` → `HTTP/2 200`, `content-type: application/xml`, 1,761 bytes, `x-vercel-cache: HIT`. Body = `<urlset>` with **21 URLs, ALL on `https://inkedup.id/…` (non-www)**: `/`, `/artists`, `/studios`, `/locations`, `/locations/{canggu,seminyak,kuta,uluwatu,ubud,sanur,nusa-dua,jimbaran}` (8 location pages), `/inspiration`, `/pricing`, `/how-it-works`, `/safety`, `/faq`, `/contact`, `/studio/apply`, `/privacy`, `/terms`. Priority only — **no `<lastmod>`, no `<changefreq>`**.
- `curl -i https://inkedup.id/sitemap.xml` → `HTTP/2 308`, `location: https://www.inkedup.id/sitemap.xml` (non-www sitemap redirects to www).
- Repo source is a static file: `app/public/sitemap.xml` (hard-coded non-www `<loc>` values).

**Host canonicalization (homepage, `curl -L -w` + hop-by-hop `-sI`)**
- `http://inkedup.id/` → 308 → `https://inkedup.id/` → 308 → `https://www.inkedup.id/` (final 200, **2 hops**)
- `https://inkedup.id/` → 308 → `https://www.inkedup.id/` (final 200, **1 hop**)
- `http://www.inkedup.id/` → 308 → `https://www.inkedup.id/` (final 200, **1 hop**)
- `https://www.inkedup.id/` → **200, 0 hops** ⇒ effective canonical host = `https://www.inkedup.id/`
- `https://inkedup.id/artists` → 1 hop → `https://www.inkedup.id/artists` (host-level redirect applies to deep URLs too)

**Homepage raw HTML** (`curl https://www.inkedup.id/` → 200, 3,511 bytes, saved to /tmp and read in full)
- `<title>InkedUp — Premium Mobile Tattoo Concierge, Bali</title>`
- meta description present ("Bali's premier mobile tattoo concierge…")
- `<link rel="canonical" href="https://inkedup.id/" />` ← **non-www**
- `og:url` / `og:image` / `twitter:image` all use `https://inkedup.id/…` (non-www)
- JSON-LD `TattooParlor` present in raw HTML (`"url": "https://inkedup.id/"`, `legalName: "InkedUp Bali"`, `telephone: "+62-812-3456-7890"`, `areaServed`: Canggu/Seminyak/Kuta/Uluwatu/Ubud/Sanur — 6 areas)
- **No meta robots tag; no x-robots-tag header** (checked `curl -sI`)
- Body = `<div id="root"></div>` only: **no H1, no text content, zero `<a href>` internal links in raw HTML**
- Response headers: HSTS `max-age=63072000`, served from Vercel SIN edge, `age: 2192` (cached), no `x-robots-tag`

**Route sweep (14 sitemap URLs + extra routes; `curl -w` status/bytes, md5 comparison)**
- All of `/artists /studios /locations /locations/canggu /locations/ubud /inspiration /pricing /how-it-works /safety /faq /contact /studio/apply /privacy /terms` → **200, exactly 3,511 bytes each, MD5 `ee33bf7fb608edc4b35a9129d90edf97` — byte-identical to the homepage shell**
- Also byte-identical 200 shells: `/admin`, `/login`, `/artist/dashboard`, `/booking/test-slug`, `/price-calculator`, `/artist/apply`, `/artist/profile`, `/artists/some-artist-slug`, `/studios/1`
- Cause (repo evidence): `app/vercel.json` lines 7–10 — rewrite `"/((?!api/).*)" → "/index.html"` (catch-all SPA fallback, always 200)

**URL variants**
- `https://www.inkedup.id/locations/` (trailing slash) → **200, 0 redirects**, identical 3,511 B shell
- `https://www.inkedup.id/Locations` (uppercase) → **200, 0 redirects**, identical shell
- `https://www.inkedup.id/this-page-should-not-exist-xyz` → **200**, identical shell (soft-404)

**Rendered-DOM attempts**
- `kimi_fetch_v2 https://www.inkedup.id/` → returned only the `<title>` text (no rendered content)
- `FetchURL https://www.inkedup.id/` → **ERROR**: "Failed to extract meaningful content from the page. The page may require JavaScript to render."
- ⇒ No tool available in this pass renders JS; rendered nav/footer could not be extracted. Link targets were instead enumerated from repo components (read-only):
  - `Navbar.tsx` lines 7–17: `/artists`, `/studios`, `/inspiration`, `/locations`, `/how-it-works`, `/pricing`, `/safety`, `/studio/apply`
  - `Footer.tsx` lines 13–28: same set + `/faq`, `/privacy`, `/terms`; **"Areas" links (Canggu, Seminyak, Uluwatu, Ubud) all point to `/locations` — not to `/locations/<slug>`**
  - All enumerated targets verified 200 (see route sweep). No broken nav/footer targets found.

**Repo evidence on per-page SEO**
- `app/src/hooks/useSEO.ts` (88 lines, read in full): client-side hook sets `document.title`, meta description, og/twitter tags, canonical (`window.location.origin + path`), and injects JSON-LD per page — all **post-render only, invisible in raw HTML**. Pages confirmed calling it with per-page data (grep): Home `/`, Artists `/artists`, Studios `/studios`, Locations `/locations`, Inspiration `/inspiration`, Pricing `/pricing`, HowItWorks `/how-it-works`, Safety `/safety`, FAQ `/faq`, Contact `/contact`, Privacy `/privacy`, Terms `/terms`.
- `app/src/App.tsx` lines 48–94: routes include dynamic `/artists/:slug`, `/studios/:id`, `/locations/:slug`, `/booking/:slug`; catch-all `*` renders a `<NotFound/>` component **client-side only** (HTTP status stays 200). `/price-calculator` and `/artist/apply` are client-side `<Navigate>` redirects to `/pricing` and `/studio/apply`.
- Grep for `google-site-verification` / GSC verification file across `app/`: **no matches** (only unrelated package-lock hashes).

**Image/asset checks (`curl -o /dev/null -w`, all on www host)**
- All 200: `og-image.jpg` (132,596 B), `hero-slide-1..4.jpg` (216–274 KB each), `artist-1.jpg`, `location-canggu.jpg`, `tattoo-work-1.jpg`, `logo-mark.png`, `safety-setup.jpg`, `about-studio.jpg`, `process-step-1.jpg`, `testimonial-1.jpg`, `favicon.ico` (661 B), `apple-touch-icon.png` (11,095 B). No broken image URLs found.

**Search-index visibility (2026-07-17)**
- `WebSearch "site:inkedup.id"` → tool error "No search results were found"; `WebSearch "site:www.inkedup.id"` → same (1 retry each, then stopped per retry limit)
- `kimi_search_v2 "site:inkedup.id"` → HTTP 404 error from backend
- `WebSearch "\"InkedUp — Premium Mobile Tattoo Concierge, Bali\""` (exact title) → 0 inkedup.id results (only third-party tattoo sites)
- `WebSearch "\"inkedup.id\""` → 0 inkedup.id results (only a Dribbble designer named "InkedUp", inkedupsouthampton.com, etc.)
- `kimi_search_v2 "InkedUp Bali tattoo concierge inkedup.id"` → 0 inkedup.id results (only unrelated "Inked Up Tattoo Parlour" listings on tattoo.guide, tattooswizard.com)
- `kimi_fetch_v2 https://www.bing.com/search?q=site%3Ainkedup.id` → returned irrelevant Zhihu results (tool failure for this purpose — recorded as evidence, not retried further)
- ⇒ **No inkedup.id URL surfaced in any accessible search index in this pass. Actual Google/Bing coverage UNVERIFIED** (these backends are not Google).

## Findings (numbered; each: finding, evidence, SEO impact, recommended fix, priority P0–P3)

1. **Canonical host conflict across the entire SEO stack.**
   Evidence: redirects force `www` (all non-www URLs 308 → www), but the sitemap's 21 `<loc>` entries, the robots.txt `Sitemap:` line, the raw-HTML `<link rel="canonical">`, `og:url`, and the JSON-LD `url` all use `https://inkedup.id/` (non-www). Homepage raw HTML line 9: canonical = `https://inkedup.id/`, which itself 308-redirects.
   SEO impact: Google is told the canonical URLs are URLs that permanently redirect. Per Google canonicalization docs, canonical signals should point to the final canonical URL; mixed signals force Google to pick a canonical itself and can split/consolidate signals unpredictably. Sitemaps should list only final canonical URLs.
   Recommended fix: pick ONE host (redirects already enforce `www`), then regenerate sitemap `<loc>` values, robots.txt Sitemap line, index.html canonical/og/JSON-LD, and `business.ts` URL constants to that host.
   **Priority: P1**

2. **Every route serves a byte-identical SPA shell: same title, same meta description, same canonical (homepage URL) in raw HTML for all 21+ URLs.**
   Evidence: md5 `ee33bf7fb608edc4b35a9129d90edf97` for homepage + all 14 sampled sitemap URLs; raw shell line 9 canonical is always `https://inkedup.id/`. Per-page metadata only exists after JS execution (`useSEO.ts`).
   SEO impact: before/without rendering, all pages are exact duplicates that canonicalize to the homepage. Google's indexer does render JS, but rendering is deferred and can fail; served HTML carries zero page-level differentiation (Google docs: "make sure content is accessible in the initial HTML whenever possible").
   Recommended fix: SSR/SSG or at minimum per-route prerendered head tags (title, description, self-canonical, H1). Verify with GSC URL Inspection "View crawled page".
   **Priority: P1**

3. **Sitewide soft-404: any nonexistent URL returns HTTP 200 with the SPA shell.**
   Evidence: `/this-page-should-not-exist-xyz` → 200 (3,511 B); also `/booking/test-slug`, `/artists/some-artist-slug`, `/studios/1` → 200 shells. Cause: `app/vercel.json` catch-all rewrite; the React `<NotFound/>` (App.tsx line 94) renders client-side only.
   SEO impact: unlimited duplicate "soft-404" URLs crawlable; Google Search Console will flag "Soft 404" and waste crawl budget; fake artist/booking URLs are indistinguishable from real ones pre-render.
   Recommended fix: server-side 404 for unknown routes (e.g., Vercel middleware/edge function checking a route manifest), or render the NotFound state with a real 404 status. For invalid `:slug` params, the API/edge layer should return 404.
   **Priority: P1**

4. **Duplicate URL variants return 200 without normalization.**
   Evidence: `/locations/` (trailing slash) and `/Locations` (uppercase) → 200, 0 redirects, identical shell.
   SEO impact: duplicate-URL crawling; with client-side canonicals this is partly mitigated post-render, but raw HTML gives no distinguishing signal.
   Recommended fix: 308-normalize trailing-slash and case variants to the canonical path at the edge (Vercel `cleanUrls`/middleware), in addition to self-canonicals.
   **Priority: P2**

5. **Sitemap incomplete and static.**
   Evidence: `app/public/sitemap.xml` — 21 hard-coded URLs; dynamic routes that exist in the app (`/artists/:slug`, `/studios/:id` per App.tsx lines 53–55) have no sitemap entries; no `<lastmod>`; non-www hosts per Finding 1.
   SEO impact: reduced discoverability of artist/studio detail pages (the pages most likely to rank for artist-name queries); no freshness signals.
   Recommended fix: generate sitemap at build/deploy time from the database (all public artist/studio slugs + static pages), correct host, add `<lastmod>`.
   **Priority: P2**

6. **No crawlable content or internal links in raw HTML — discovery is 100% JS-dependent.**
   Evidence: homepage body = `<div id="root"></div>`; zero `<a href>` in raw HTML; `FetchURL` failed with "page may require JavaScript to render"; `kimi_fetch_v2` extracted only the title.
   SEO impact: Google must render every page before it can follow a single internal link or see any content/H1. Non-Google crawlers (Bing is weaker at JS, social/AI crawlers) may see an empty site. Sitemap becomes the only discovery path — which is currently broken per Findings 1/5.
   Recommended fix: same as Finding 2 (SSR/prerender); ensure key nav links render in initial HTML.
   **Priority: P2**

7. **Footer "Areas" links don't link to the location pages.**
   Evidence: `Footer.tsx` lines 25–28 — Canggu/Seminyak/Uluwatu/Ubud all `href: '/locations'`. Sitemap has 8 individual location URLs.
   SEO impact: location pages (core "tattoo canggu"-type landing pages) get no footer internal links; only reachable via the JS-rendered Locations index — weakest possible internal-link graph exactly where local SEO value lives.
   Recommended fix: point each area link to `/locations/<slug>`.
   **Priority: P2**

8. **Disallowed utility routes return 200 SPA shells.**
   Evidence: `/admin`, `/login`, `/artist/dashboard` → 200, 3,511 B shell (identical MD5). robots.txt disallows them.
   SEO impact: blocked-from-crawling + 200 = classic "Indexed, though blocked by robots.txt" GSC entries; client-side noindex (if any) can never be seen because crawling is disallowed. Also `/artist/profile` (account page, App.tsx line 83) is NOT disallowed and also returns a 200 shell.
   Recommended fix: serve real 404/401 for admin/auth routes, or allow crawling + `noindex`. Decide whether `/artist/profile` should be disallowed too.
   **Priority: P2**

9. **JSON-LD TattooParlor present in raw HTML (good) but with data-quality issues.**
   Evidence: raw HTML lines 31–62 — `"url": "https://inkedup.id/"` (wrong host, Finding 1); `areaServed` lists 6 areas (Canggu, Seminyak, Kuta, Uluwatu, Ubud, Sanur) while the sitemap has 8 location pages (Nusa Dua, Jimbaran missing); `contactPoint.telephone: "+62-812-3456-7890"` — sequential-digit pattern consistent with a placeholder.
   SEO impact: business-identity signals inconsistent with site structure; a fake phone in structured data is a trust/E-E-A-T liability. Note: per-page JS-injected JSON-LD (useSEO.ts) is curl-invisible and needs Rich Results Test.
   Recommended fix: align url host, areaServed with the 8 locations, verify phone/legalName with owner; validate rendered JSON-LD in Rich Results Test.
   **Priority: P2** (rises to P1 if the phone/identity data is confirmed fake — see OWNER-VERIFY)

10. **Social/OG URLs use the redirecting non-www host.**
    Evidence: raw HTML lines 16–17, 21: `og:url`, `og:image`, `twitter:image` = `https://inkedup.id/…` (1 extra redirect hop for every scraper fetch).
    SEO impact: minor; some scrapers handle redirects inconsistently.
    Recommended fix: fold into Finding 1 host cleanup.
    **Priority: P3**

11. **`http://inkedup.id/` needs 2 redirect hops to reach the canonical host.**
    Evidence: hop-by-hop trace above.
    SEO impact: negligible crawl-budget/latency waste on one entry variant.
    Recommended fix: flatten to a single 308 (http-non-www → https-www) at the edge.
    **Priority: P3**

12. **No evidence of search-index presence; no GSC verification found.**
    Evidence: all `site:`/exact-title/brand queries above returned zero inkedup.id URLs; repo grep for `google-site-verification` → no matches; homepage head has no verification meta.
    SEO impact: if the site is genuinely not indexed (plausible for a new site), everything else is moot until indexing happens; without GSC there is no way to monitor coverage, soft-404s, or canonical selection.
    Recommended fix: owner to confirm GSC/Bing Webmaster Tools verification, submit the corrected sitemap, request indexing for key pages. Treat as verification task, not a code defect.
    **Priority: P1 (owner action)**

13. **Positive confirmations (pass):** HTTPS enforced with HSTS; single canonical host at the redirect layer; robots.txt syntactically valid and fetchable; sitemap fetchable on the canonical host; all 15 checked images/assets return 200; JSON-LD parseable and of a specific type (`TattooParlor`); responses edge-cached from SIN (low latency for Bali). No P0 defects found — site is up, crawlable, and not blocked at the robots layer.

## Data tables

**Master URL inventory** (feeds `01-url-inventory.csv`). "title" / "canonical" values are from raw served HTML; identical on every route because of Finding 2. "indexable?" = allowed by robots.txt AND no noindex observed.

| URL | status | redirects-to | title (raw HTML) | meta-description-present? | canonical (raw HTML) | indexable? | in-sitemap? | notes |
|---|---|---|---|---|---|---|---|---|
| https://www.inkedup.id/ | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes | https://inkedup.id/ | yes | yes (as https://inkedup.id/) | SPA shell, 3,511 B; H1 absent pre-render |
| https://www.inkedup.id/artists | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical sitewide) | https://inkedup.id/ | yes | yes (non-www) | byte-identical shell (MD5 ee33bf…) |
| https://www.inkedup.id/studios | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell |
| https://www.inkedup.id/locations | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell |
| https://www.inkedup.id/locations/canggu | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell |
| https://www.inkedup.id/locations/seminyak | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (inferred from sweep pattern; sampled URLs all identical) |
| https://www.inkedup.id/locations/kuta | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (same inference) |
| https://www.inkedup.id/locations/uluwatu | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (same inference) |
| https://www.inkedup.id/locations/ubud | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/locations/sanur | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (same inference) |
| https://www.inkedup.id/locations/nusa-dua | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (same inference) |
| https://www.inkedup.id/locations/jimbaran | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (same inference) |
| https://www.inkedup.id/inspiration | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/pricing | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/how-it-works | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/safety | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/faq | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/contact | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/studio/apply | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/privacy | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://www.inkedup.id/terms | 200 | — | InkedUp — Premium Mobile Tattoo Concierge, Bali | yes (identical) | https://inkedup.id/ | yes | yes (non-www) | identical shell (directly tested) |
| https://inkedup.id/ | 308 | https://www.inkedup.id/ (1 hop) | n/a (redirect) | n/a | n/a | no (redirect) | n/a | non-www root |
| http://inkedup.id/ | 308 | https://inkedup.id/ → https://www.inkedup.id/ (2 hops) | n/a | n/a | n/a | no (redirect) | n/a | 2-hop chain, flatten (P3) |
| http://www.inkedup.id/ | 308 | https://www.inkedup.id/ (1 hop) | n/a | n/a | n/a | no (redirect) | n/a | ok |
| https://inkedup.id/artists | 308 | https://www.inkedup.id/artists (1 hop) | n/a | n/a | n/a | no (redirect) | n/a | sitemap lists THIS form — every sitemap URL redirects (Finding 1) |
| https://www.inkedup.id/locations/ | 200 | — (no redirect) | same as homepage | yes | https://inkedup.id/ | yes (duplicate) | no | trailing-slash duplicate (Finding 4) |
| https://www.inkedup.id/Locations | 200 | — (no redirect) | same as homepage | yes | https://inkedup.id/ | yes (duplicate) | no | uppercase duplicate (Finding 4) |
| https://www.inkedup.id/this-page-should-not-exist-xyz | 200 | — | same as homepage | yes | https://inkedup.id/ | yes (should be 404) | no | SOFT-404 (Finding 3) |
| https://www.inkedup.id/booking/test-slug | 200 | — | same as homepage | yes | https://inkedup.id/ | yes (should be 404 for invalid slug) | no | dynamic booking route; rendered state unverified |
| https://www.inkedup.id/artists/some-artist-slug | 200 | — | same as homepage | yes | https://inkedup.id/ | yes (should be 404 for invalid slug) | no | dynamic artist route; NOT in sitemap (Finding 5) |
| https://www.inkedup.id/studios/1 | 200 | — | same as homepage | yes | https://inkedup.id/ | yes | no | dynamic studio route; NOT in sitemap |
| https://www.inkedup.id/price-calculator | 200 | — | same as homepage | yes | https://inkedup.id/ | yes | no | client-side redirect to /pricing (App.tsx:60) — invisible pre-render |
| https://www.inkedup.id/artist/apply | 200 | — | same as homepage | yes | https://inkedup.id/ | yes | no | client-side redirect to /studio/apply (App.tsx:79) |
| https://www.inkedup.id/artist/profile | 200 | — | same as homepage | yes | https://inkedup.id/ | yes (account page; consider disallow) | no | not disallowed in robots.txt (Finding 8) |
| https://www.inkedup.id/admin | 200 | — | same as homepage | yes | https://inkedup.id/ | blocked by robots.txt | no | returns 200 shell despite Disallow (Finding 8) |
| https://www.inkedup.id/login | 200 | — | same as homepage | yes | https://inkedup.id/ | blocked by robots.txt | no | 200 shell despite Disallow |
| https://www.inkedup.id/artist/dashboard | 200 | — | same as homepage | yes | https://inkedup.id/ | blocked by robots.txt | no | 200 shell despite Disallow |
| https://www.inkedup.id/robots.txt | 200 | — | n/a | n/a | n/a | n/a | n/a | valid; Sitemap line points to non-www (Finding 1) |
| https://www.inkedup.id/sitemap.xml | 200 | — | n/a | n/a | n/a | n/a | n/a | 21 URLs, all non-www locs, no lastmod |
| https://inkedup.id/sitemap.xml | 308 | https://www.inkedup.id/sitemap.xml | n/a | n/a | n/a | n/a | n/a | ok that it redirects; problem is the URLs INSIDE it |

**Image/asset status (all on www host, 2026-07-17)**

| Asset | status | bytes |
|---|---|---|
| /og-image.jpg | 200 | 132,596 |
| /hero-slide-1.jpg | 200 | 231,612 |
| /hero-slide-2.jpg | 200 | 230,471 |
| /hero-slide-3.jpg | 200 | 216,435 |
| /hero-slide-4.jpg | 200 | 273,583 |
| /artist-1.jpg | 200 | 93,135 |
| /location-canggu.jpg | 200 | 229,392 |
| /tattoo-work-1.jpg | 200 | 121,643 |
| /logo-mark.png | 200 | 23,424 |
| /safety-setup.jpg | 200 | 136,901 |
| /about-studio.jpg | 200 | 221,470 |
| /process-step-1.jpg | 200 | 130,253 |
| /testimonial-1.jpg | 200 | 184,298 |
| /favicon.ico | 200 | 661 |
| /apple-touch-icon.png | 200 | 11,095 |

**Search-visibility probes (2026-07-17)**

| Query | Tool | Result |
|---|---|---|
| site:inkedup.id | WebSearch | error: "No search results were found" |
| site:www.inkedup.id | WebSearch | error: "No search results were found" |
| site:inkedup.id | kimi_search_v2 | HTTP 404 backend error |
| "InkedUp — Premium Mobile Tattoo Concierge, Bali" | WebSearch | 0 inkedup.id results |
| "inkedup.id" | WebSearch | 0 inkedup.id results (third-party only) |
| InkedUp Bali tattoo concierge inkedup.id | kimi_search_v2 | 0 inkedup.id results (third-party only) |
| bing.com/search?q=site:inkedup.id | kimi_fetch_v2 | irrelevant Zhihu results (tool failure) |

## OWNER-VERIFY (facts/claims/access that only the business owner can confirm)

1. **Intended canonical host** — infra enforces `https://www.inkedup.id/` but sitemap/canonical/OG/JSON-LD all say `https://inkedup.id/`. Which is the official one?
2. **Google Search Console / Bing Webmaster Tools** — is either property verified (no verification meta/file found in repo)? If yes, export: Pages (index coverage), Sitemaps status, canonical selections, any "Soft 404" / "Indexed, though blocked" reports.
3. **Actual Google index state** — run `site:inkedup.id` and `site:www.inkedup.id` in a real Google session; accessible search tools in this pass showed zero presence.
4. **Business identity data** — is `+62-812-3456-7890` (in JSON-LD contactPoint) a real working number? Sequential digits look like a placeholder. Also confirm `legalName: "InkedUp Bali"` and the footer contact email sourced from `business.ts`.
5. **Social profiles** — do `instagram.com/inkedup.bali` and `tiktok.com/@inkedup.bali` (JSON-LD sameAs) exist and belong to the business?
6. **Artist/studio inventory** — how many real artist (`/artists/:slug`) and studio (`/studios/:id`) detail pages exist? These are absent from the sitemap; confirm they have unique, index-worthy content.
7. **Launch timeline** — is the site newly launched (explaining zero index presence) or has it been live for months (which would indicate an indexing problem)?

## UNVERIFIED / limitations of this pass

- **No JS rendering available.** curl, `kimi_fetch_v2`, and `FetchURL` all returned only the 3,511 B shell (`FetchURL` explicitly errored: "page may require JavaScript to render"). Per-page titles, descriptions, canonicals, H1s, content, and JS-injected JSON-LD (all set by `useSEO.ts` post-render) could NOT be verified. **Needs: GSC URL Inspection ("Test live URL" → rendered HTML), Rich Results Test, or a headless browser.**
- **Rendered navigation/footer** could not be extracted from the live DOM; link targets were enumerated from repo components (`Navbar.tsx`, `Footer.tsx`) and each verified 200. Broken-link status of the *rendered* page is therefore inferred, not observed.
- **Search-index coverage**: WebSearch/kimi_search are not Google; the Bing fetch attempt returned irrelevant results (tool failure). Zero-presence findings are directional only — UNVERIFIED for actual Google/Bing indices.
- **Dynamic route behavior** (`/booking/:slug`, `/artists/:slug`, `/studios/:id`): all return 200 shells; whether invalid slugs render a proper not-found state client-side is unverified.
- **SEO-invisible items by design of this role**: CWV/performance lab data, content quality/thinness of rendered pages, keyword targeting, analytics/booking-funnel tracking — covered by other audit roles.
- Locations `/locations/{seminyak,kuta,uluwatu,sanur,nusa-dua,jimbaran}` were not individually downloaded; their entries in the inventory table are inferred from the 14 directly sampled URLs all being byte-identical (catch-all rewrite). A 1-command follow-up can confirm.
