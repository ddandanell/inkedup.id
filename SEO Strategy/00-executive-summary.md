# 00 — Executive Summary: InkedUp SEO Baseline Audit

**Site:** https://www.inkedup.id/ — InkedUp, premium tattoo booking & concierge platform, Bali
**Audit date:** 2026-07-17 (WITA, UTC+8) · **Method:** 8 parallel audit lanes (repo architecture, live crawl, technical/performance, content & trust, keyword research, 2× competitor SERP analysis, brand entity). Evidence: `SEO Strategy/_raw/01–08`. **No website changes were made — this was a read-only baseline pass.**

---

## 1. Overall verdict

InkedUp is a well-built **web application** but a **pre-search website**. The application layer is healthy (HTTPS valid, HTTP/2 + Brotli, TTFB ~0.19–0.25 s, clean security-header baseline), yet the site is currently **invisible and partly untrustworthy to search engines** for structural reasons — not effort reasons. Three systemic problems dominate everything else:

1. **Architectural invisibility.** The site is a pure client-rendered React SPA: every URL returns the same byte-identical 3,511-byte empty shell (verified by MD5 across 14 sampled URLs). Titles, meta descriptions, H1s, body content, and internal links exist **only after JavaScript execution**. Combined with a sitemap that points at the wrong (redirecting) host and contains no artist/studio pages, Google currently has no reliable crawl path and no content to index. Third-party `site:` checks return **zero indexed URLs** — to be confirmed in Search Console.
2. **A trust layer that contradicts E-E-A-T.** The production database serves **demo seed data presented as verified fact**: 8 fictional artists with 4.7–4.9 ratings and "65–154 reviews", "Based on 98 client reviews" with zero written reviews, "500+ Bookings Completed" against a live API showing 3 bookings (0 completed), invented testimonials, and shared stock portfolio photos credited to multiple artists — all badged "Verified Artist" while `verified_at` is null. Every CTA funnels to a **placeholder WhatsApp number (6281234567890)**. If indexed as-is, this is exactly the class of unsupported claim Google's spam/helpful-content systems and manual reviewers penalize — and it converts no one, because the number is dead.
3. **An unowned, contested brand.** "Inked Up Tattoo Parlour" (Jl. Petitenget — inside InkedUp's own service area) is an established studio with a 66K-follower Instagram, a confirmed Google Business Profile, and press citations. InkedUp owns **0% of its branded SERP** today; a public GitHub repo (`ddandanell/inkedup.id`) is a top result for the exact-domain query. Without entity consolidation ("InkedUp Bali", Organization schema, GBP, consistent profiles), even navigational demand leaks to the namesake.

**The opportunity is equally clear.** The concierge / mobile / in-villa tattoo category is **genuinely unclaimed** in every observed SERP — the only two real providers are SEO-weak (a one-page site titled "Home"; an artist ranking with a blog post). No competitor owns "tattoo concierge". Location SERPs outside Canggu/Seminyak are soft (Sanur has zero dedicated tattoo sites; Japanese-style has no specialist page). A technically sound, trust-first platform can win these clusters without fighting the entrenched studio homepages head-on.

## 2. Baseline snapshot (2026-07-17)

| Metric | Value | Source / status |
|---|---|---|
| URLs discovered (inventory) | 40 (incl. test variants) | `01-url-inventory.csv` |
| URLs in XML sitemap | 21 — all non-www (redirecting) host | `_raw/02` |
| Indexable URLs (clean) | **0** — all routes return identical shell; per-route metadata client-only | `_raw/01`, `_raw/02` |
| URLs indexed in Google | 0 found via third-party checks | **UNVERIFIED — needs GSC** |
| Soft-404s | Sitewide: any nonexistent URL → HTTP 200 shell | `_raw/02` (e.g. `/this-page-should-not-exist-xyz`) |
| Canonical host | **Conflicting**: redirects force `www`; sitemap/robots/static head/JSON-LD say non-www | `_raw/02`, `app/index.html` |
| Artist/studio profiles in sitemap | 0 of ~16 | `_raw/01`, `_raw/02` |
| Analytics / GSC / GTM / Bing | None found anywhere | `_raw/01`, `_raw/03` |
| Conversion tracking | None (booking, WhatsApp, forms fire no events) | `_raw/01` |
| Core Web Vitals (LCP/INP/CLS) | Unmeasured — needs PSI/CrUX | `_raw/03` (PSI URLs provided) |
| Initial JS+CSS (br) | ~319 KB; entry JS 602,547 B raw; recharts 424 KB preloaded on every page | `_raw/03` |
| Homepage image payload | ~4.28 MB JPEG; hero 571 KB; 0/37 images with srcset, 0 WebP | `_raw/03` |
| Favicon set | Only 16 px .ico + apple-touch-icon; no SVG/32/192/512/manifest | `_raw/03` |
| Google Business Profile | None findable for InkedUp; competitor's confirmed | `_raw/08` |

## 3. Top issues by priority

| # | Priority | Issue | Evidence |
|---|---|---|---|
| 1 | **P0** | Dead conversion funnel: every CTA → placeholder WhatsApp `6281234567890`; contact form is a mailto to a placeholder inbox | `_raw/04`, `business.ts` TODOs |
| 2 | **P0** | Zero search-index presence incl. branded queries (needs GSC confirmation) | `_raw/02`, `_raw/06`, `_raw/08` |
| 3 | **P0** | Severe brand collision: "Inked Up Tattoo Parlour" (Petitenget) owns the name in search/social/maps | `_raw/08` |
| 4 | **P1** | Pure CSR SPA: byte-identical 3.5 KB shell on every route; content/links/metadata JS-only | `_raw/01`, `_raw/02` |
| 5 | **P1** | Canonical host conflict (www redirects vs non-www sitemap/robots/canonical/JSON-LD) | `_raw/02`, `_raw/03` |
| 6 | **P1** | Sitewide soft-404 architecture (Vercel catch-all; NotFound client-only) | `_raw/01`, `_raw/02` |
| 7 | **P1** | Fabricated trust data live: seed ratings/reviews/"500+ bookings"/testimonials/stock portfolios presented as verified | `_raw/04`, `08-trust-gap-analysis.md` |
| 8 | **P1** | Production JSON-LD carries placeholder identity (phone, TODO legalName, 6 vs 8 areas) | `app/index.html:31–62`, `_raw/01` |
| 9 | **P1** | No analytics, GSC, or conversion measurement of any kind | `_raw/01`, `_raw/03` |
| 10 | **P1** | Artist/studio profiles: no per-route metadata, absent from sitemap, noindex-worthy thin-but-live | `_raw/01` |
| 11 | **P2** | Performance: 602 KB entry JS, 424 KB recharts preloaded site-wide, 4.28 MB unoptimized images, `max-age=0` image caching | `_raw/03` |
| 12 | **P2** | Location pages are substantive (~500 words, unique FAQs — **not** doorway pages) but H1s all say "Mobile Tattoo Artist in X", missing head terms; Legian/Denpasar missing | `_raw/05`, `_raw/04` |
| 13 | **P2** | Footer "Areas" links all point to `/locations`, never to location pages | `Footer.tsx:25-28`, `07-internal-link-map.csv` |
| 14 | **P2** | No style pages (competitors rank with style architecture); no price transparency (SERP rewards it) | `_raw/05`, `_raw/06` |
| 15 | **P2** | Favicon set incomplete → weak brand SERP appearance | `_raw/03` |

## 4. Quick wins (high impact, low risk — most need one owner decision each)

1. Pick the canonical host (evidence supports **www** — that's where redirects already land) and align sitemap, robots.txt, static head canonical, og:url, and JSON-LD. *(owner confirms, then ~1 hour of code)*
2. Replace the placeholder WhatsApp number everywhere incl. JSON-LD — the single highest-value edit on the site. *(owner provides number)*
3. Verify Search Console + submit corrected sitemap; install GA4 conversion events. *(owner accounts)*
4. Strip or honestly re-label fabricated metrics (ratings, review counts, "500+ bookings", testimonials) before requesting indexing — trust cleanup precedes traffic.
5. Fix footer "Areas" links to point to real location pages; add artist/studio URLs to the sitemap.
6. Ship the full favicon/app-icon set + `site.webmanifest`.

## 5. Strategic direction (agreed by evidence, needs owner sign-off)

- **Positioning:** one approved statement — a *booking platform & concierge connecting clients with independently verified Bali tattoo artists and studios, incl. in-villa service where hygiene/legality standards are met*. Not a studio; not "we employ/certify everyone". Current pages contradict each other (studio-only marketplace vs "90% goes to your artist").
- **Brand:** standardize on **"InkedUp Bali"** everywhere (titles, schema, GBP as Service-Area Business, socials) to disambiguate from Inked Up Tattoo Parlour and the UK namesakes; run a PDKI/DGIP trademark check (owner/legal).
- **Architecture:** keep the marketplace skeleton (locations × styles × verified artists/studios × pricing × safety × booking intent) — but **publish nothing without verified data**. Location pages are already good; retarget H1s to local head terms. Build style pages only where roster proof exists. Own the mobile/villa category with a hygiene-documented hub — no competitor has one.
- **Rendering:** the CSR shell is the deepest technical constraint. Pragmatic path: prerender/SSG the public routes (Vite SSG or react-router SSR) or at minimum static per-route metadata + prerendered HTML for indexable pages; keep the app shell for booking/admin. This is the largest engineering item and gates durable indexation.

## 6. What was NOT done

- No website code, content, or configuration was modified (read-only baseline per the operating rules).
- No deployment, no Search Console changes, no recrawl requests (no access; premature until trust cleanup).
- Core Web Vitals, rendered DOM, and JS-injected schema remain **UNVERIFIED** — require browser tooling (PSI, Rich Results Test, GSC URL Inspection); exact URLs listed in `02-technical-audit.md`.

## 7. Document map

| File | Contents |
|---|---|
| `01-url-inventory.csv` | 40 URLs: status, redirects, titles, canonicals, indexability, sitemap membership |
| `02-technical-audit.md` | Full technical findings w/ evidence + fixes + P0–P3 |
| `03-content-inventory.csv` | 18 pages: purpose, wordcount, H1, claims, trust gaps, demo content flags |
| `04-keyword-map.csv` | 52 keyword rows × 8 intent clusters w/ proposed URLs/titles/priorities + cannibalization flags |
| `05-competitor-analysis.md` | Core + local/style SERP landscape, ranking bar, incumbent weaknesses, differentiation |
| `06-structured-data-map.md` | Current schema audit + target per-template schema architecture |
| `07-internal-link-map.csv` | 111 mapped links + orphan/gap flags |
| `08-trust-gap-analysis.md` | Unsupported-claims register, brand-collision risk, trust system checklist |
| `09-analytics-baseline.md` | Measurement baseline (all UNVERIFIED), GSC/GA4 setup, conversion-event spec, dashboard |
| `10-implementation-backlog.md` | Prioritized P0–P3 backlog + 30-day plan |
| `OWNER-VERIFICATION-REQUESTS.md` | Consolidated information the owner must supply |
| `CHANGELOG.md` | What was inspected/created/verified, per session |
| `_raw/01–08` | Lane-level evidence (commands, outputs, citations) |
