# 10 — Implementation Backlog & 30-Day Plan

**Date:** 2026-07-17 (WITA) · **Status legend:** TODO / BLOCKED-OWNER / READY (evidence complete, no owner input needed) · Priorities per the brief's P0–P3 model. Evidence citations refer to `SEO Strategy/_raw/01–08` and repo paths.

> **Gate rule:** nothing touching legal claims, health/hygiene claims, certifications, artist credentials, prices, reviews, or business ownership ships until the corresponding item in `OWNER-VERIFICATION-REQUESTS.md` is answered.

---

## A. Master backlog (priority order)

### P0 — unblock revenue & index existence

| ID | Task | Evidence | Affected files / URLs | Owner dep. | Status |
|---|---|---|---|---|---|
| P0-1 | Replace placeholder WhatsApp `6281234567890` with the real number in all CTAs, wa.me links, and JSON-LD `telephone` | `_raw/04`, `_raw/01` | `app/src/data/business.ts`, 3 hardcoded components, `app/index.html:31-62` | Real number | BLOCKED-OWNER |
| P0-2 | Decide canonical host (recommend **www** — redirects already land there); align sitemap `<loc>`s, robots.txt Sitemap line, static-head canonical, og:url, JSON-LD url | `_raw/02`, `_raw/03` | `app/public/sitemap.xml`, `app/public/robots.txt`, `app/index.html`, `useSEO.ts` | Host decision | BLOCKED-OWNER (1-word answer) |
| P0-3 | Confirm indexation status: verify GSC property, read Coverage/Pages report, confirm whether zero-index is real | `_raw/02`, `_raw/06` | GSC | GSC access | BLOCKED-OWNER |
| P0-4 | Brand-entity triage: claim/create GBP (Service-Area Business, name "InkedUp Bali"); claim/verify IG/TikTok handles; assess making GitHub repo `ddandanell/inkedup.id` private; start PDKI trademark check | `_raw/08` | GBP, socials, GitHub, PDKI | Owner accounts/legal | BLOCKED-OWNER |

### P1 — structural repair (code, mostly READY)

| ID | Task | Evidence | Affected files / URLs | Owner dep. | Status |
|---|---|---|---|---|---|
| P1-1 | Prerender/SSG public indexable routes (or equivalent SSR) so crawlers receive real HTML: content, H1, links, per-route title/meta/canonical | `_raw/01` (pure CSR, 3.5 KB identical shell), `_raw/02` | build pipeline (`vite.config.ts`, `App.tsx`), all public routes | none for static pages; DB content affects profiles | TODO — largest engineering item |
| P1-2 | Eliminate soft-404s: serve real HTTP 404 for unknown routes (edge middleware / server route) + keep client NotFound UI; add noindex until fixed | `_raw/01`, `_raw/02` | `vercel.json` catch-all, router | none | READY (design needed) |
| P1-3 | Remove/re-label all fabricated trust data before indexing: seed ratings & review counts, "500+ Bookings Completed", Sessions=reviewCount×2, hardcoded testimonials, shared stock portfolio, "Verified" badges on `verified_at: null` profiles | `_raw/04`, `08-trust-gap-analysis.md` | `mockData.ts`, `seed.ts`, profile/studio/apply components, Neon prod data | Which artists/studios are real | BLOCKED-OWNER (data truth) |
| P1-4 | Fix static JSON-LD identity: real phone/legalName or drop fields; align areaServed (6 vs 8); www url; add Organization+WebSite schema | `_raw/01`, `_raw/08`, `06-structured-data-map.md` | `app/index.html:31-62` | Real business facts | BLOCKED-OWNER |
| P1-5 | Per-route metadata for artist/studio profiles (currently inherit homepage title/canonical); add profiles to sitemap | `_raw/01` | `ArtistProfile.tsx`, `StudioProfile.tsx`, sitemap generation | none (code) but data truth gates indexing | READY (code) |
| P1-6 | Install measurement: GSC verification, GA4 (gtag or GTM), conversion events per `09-analytics-baseline.md` spec (whatsapp_click only after P0-1) | `_raw/01`, `_raw/03` | `app/index.html`, event hooks in CTAs/forms | GA4/GSC accounts | BLOCKED-OWNER |
| P1-7 | Sitemap rebuild: www host, include artist/studio/location/style URLs, add lastmod, dynamic generation from DB slugs; robots.txt add `/booking`, `/artist/profile` disallows | `_raw/01`, `_raw/02` | `app/public/sitemap.xml` → generated route, `robots.txt` | none | READY |
| P1-8 | Business-identity page set: real About, Contact (real form backend), Privacy/Terms expansion, verification-process page (defines "verified" honestly) | `_raw/04` (~200-word legal pages, no About/team) | new routes + content | Owner facts | BLOCKED-OWNER |
| P1-9 | Fix footer "Areas" links → individual location pages; add breadcrumbs site-wide | `Footer.tsx:25-28`, `07-internal-link-map.csv` | `Footer.tsx`, layout | none | READY |
| P1-10 | Resolve pricing contradictions (free call-out vs Rp 150.000 API fee; "From Rp 700.000" vs "not tiny walk-ins"); single source of truth | `_raw/04` | `/pricing`, Home/FAQ/Booking, `seed-pricing.ts` | Real pricing policy | BLOCKED-OWNER |

### P2 — competitiveness

| ID | Task | Evidence | Affected | Owner dep. | Status |
|---|---|---|---|---|---|
| P2-1 | Retarget location-page H1s/titles to local head terms ("Tattoo Studio Canggu" style), keep mobile angle as differentiator; add Legian & Denpasar pages (unique content, same quality bar) | `_raw/05`, `_raw/04` | 8 location pages + 2 new | none | READY |
| P2-2 | Performance: code-split recharts to admin chunks only; route-level lazy loading for public pages; image pipeline (WebP/AVIF, srcset, width/height, lazy below fold, immutable caching for `/images`) | `_raw/03` (602 KB entry, 424 KB recharts, 4.28 MB images, max-age=0) | `vite.config.ts`, `App.tsx`, image components, `vercel.json` headers | none | READY |
| P2-3 | Favicon/app-icon set: SVG, 32/48 px, 192/512 PNG, `site.webmanifest`; update index.html links | `_raw/03` | `app/public/`, `app/index.html` | none | READY |
| P2-4 | Style-page templates (fine-line, japanese, cover-up first — strongest SERP evidence, softest competition) — publish only with real roster/portfolio proof per style | `_raw/05`, `_raw/07` | new `/tattoo-styles/*` | Roster proof | BLOCKED-OWNER (content) |
| P2-5 | Mobile/villa hub page with hygiene protocol dossier, travel-fee table, service limitations — category is unclaimed | `_raw/05`, `_raw/07` | new `/mobile-tattoo-bali/` | Hygiene proof | BLOCKED-OWNER |
| P2-6 | Pricing transparency on `/pricing` with real ranges (benchmarks: small IDR 500K–1.5M, hourly 800K–3M) — do NOT create a second price page (cannibalization) | `_raw/05`, `_raw/06` | `/pricing` | Real prices | BLOCKED-OWNER |
| P2-7 | OG/Twitter per-route images + tags once prerender lands; social sharing verification | `_raw/03` | metadata layer | none | READY (after P1-1) |
| P2-8 | Security headers: add CSP + frame-ancestors; HSTS `includeSubDomains; preload` after subdomains audited | `_raw/03` | `vercel.json` | none | READY |
| P2-9 | Decision-support content: safety/aftercare-in-tropics, how-to-choose, deposit/cancellation guides with named authors + review dates | `_raw/05`, `_raw/06` | new `/journal` or `/guides` | Medical review for health content | BLOCKED-OWNER |

### P3 — growth (Month 2+)

| ID | Task | Evidence | Status |
|---|---|---|---|
| P3-1 | "Tattoo concierge" positioning page ownership (term unclaimed in all SERPs) | `_raw/05` | TODO |
| P3-2 | Original linkable asset: Bali tattoo price report / safety checklist / style visual guide | `_raw/06` | TODO |
| P3-3 | Listicle/directory outreach (Finns, Bali Buddies, besttattooartistbali) once trust layer is real | `_raw/06`, `_raw/07` | TODO |
| P3-4 | Reviews engine: verifiable review collection + compliant markup only when real data exists | `_raw/06` (review proof is table stakes) | TODO |
| P3-5 | Indonesian-language content evaluation ("tato canggu" SERPs unexplored) | `_raw/05` UNVERIFIED | TODO |
| P3-6 | Artist/studio comparison + size/price interactive tools | brief | TODO |

---

## B. 30-day plan (Month 1 — foundation & repair)

**Week 1 — Baseline closure & owner inputs (this week)**
- [DONE] Full audit + baseline docs (this package).
- Owner answers `OWNER-VERIFICATION-REQUESTS.md` (P0 items first: real WhatsApp, canonical host, GSC access, GBP).
- Create GSC + GA4 + Bing properties; verify; submit nothing yet.
- Record true indexation baseline from GSC.

**Week 2 — Technical repair (code, deploy to production after local build+render checks)**
- P0-2 canonical alignment; P1-7 sitemap rebuild + robots update; P2-3 favicons; P1-9 footer/breadcrumbs; P2-8 headers; P2-2 performance batch 1 (recharts split, image cache headers).
- P1-2 soft-404 fix; P1-5 profile metadata + sitemap inclusion.
- P1-3 trust-data cleanup (code side; data per owner answers).
- Validate: build passes, rendered HTML shows per-route titles/H1, Rich Results Test on JSON-LD, no console errors, changelog updated per deploy.

**Week 3 — Rendering & identity**
- P1-1 prerender/SSG implementation for public routes (spike → rollout).
- P1-4 JSON-LD identity fix + Organization/WebSite schema; P1-6 analytics events live.
- P1-8 identity pages (About/Contact/verification process) with owner facts.
- Request indexing for homepage + core pages in GSC after deploy verified.

**Week 4 — Commercial core & measurement**
- P2-1 location H1 retargeting (+ Legian/Denpasar if content ready); P2-6 pricing transparency (if owner supplied); P2-5 mobile/villa hub (if hygiene proof supplied).
- Full regression test; PSI runs on /, /locations/canggu, /booking; CWV baseline recorded.
- Week-4 report: indexation movement, query impressions, WhatsApp clicks, technical error counts vs baseline.

**Month 2–3 (preview):** style pages with roster proof → verified artist/studio profile completion → decision-support content → first linkable asset → partnership/listicle outreach. Expand only what Search Console shows earning impressions; consolidate or noindex what doesn't.

---

## C. Definition of done (per item)

Live URL checked after deploy · title/meta/H1 unique & matching visible content · canonical correct · status code correct · sitemap inclusion intentional · schema validates · CTA works & fires event · mobile layout verified · no placeholder/unverified claim · evidence appended to `CHANGELOG.md`.
