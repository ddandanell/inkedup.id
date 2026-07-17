# REPO-ARCHITECTURE — Baseline Findings
Date: 2026-07-17 | Scope: SEO-relevant technical architecture of the InkedUp repo (`app/`) + live-site verification | Method: repo file inspection (Read/Grep), `curl` against https://www.inkedup.id/ and its public API, diff of `public/` vs `dist/`

## Evidence collected (commands/URLs/files inspected, with key outputs)

**Live-site HTTP probes (curl, 2026-07-17 ~03:46 UTC / 11:46 WITA):**
- `curl -s -o /dev/null -w ... -L https://www.inkedup.id/` → `200 text/html 3511B` (SPA shell).
- `https://www.inkedup.id/artists`, `/locations/canggu`, and **`/this-page-does-not-exist-xyz` all return `200` with the identical 3511-byte shell** → SPA fallback, no server-side 404.
- `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" https://inkedup.id/` → **`308 -> https://www.inkedup.id/`** (non-www redirects to www).
- `https://inkedup.id/sitemap.xml` → `308 -> https://www.inkedup.id/sitemap.xml` (the URL declared in robots.txt redirects).
- Response headers on `/` (www): `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: geolocation=(), microphone=(), camera=()`, `strict-transport-security: max-age=63072000`, `server: Vercel`, `x-vercel-cache: HIT`, `cache-control: public, max-age=0, must-revalidate`. **No CSP.**
- `https://www.inkedup.id/robots.txt` → `200 text/plain 126B`; `https://www.inkedup.id/sitemap.xml` → `200 application/xml 1761B`.
- `og-image.jpg` → 200 (132,596B); `favicon.ico` → 200; `apple-touch-icon.png` → 200; `artist-1.jpg` → 200.
- `GET /api/health` → `200 {"status":"ok"}`.
- `GET /api/artists` and `/api/studios` → **`401 {"error":"Unauthorized"}`** (admin-only by design, `server/src/routes/artists.ts:42`).
- `GET /api/artists/active` → 200, returns the **seed/demo artists verbatim from `src/data/mockData.ts`** (Ayu Dewi id "2", Juna Wijaya id "8", … rating 4.9, review_count 98/154…).
- `GET /api/studios/active` → 200, returns the **8 mock studios from `mockData.ts`** ("Anggraini Realism Studio", "Dewi Fine Line Studio"…).
- `GET /api/stats` → `{"totalArtists":8,"totalBookings":3,...,"completedBookings":0}` — matches the 8 mock artists and 3 mock bookings in the seed.
- `GET /api/locations` → 200, 8 seeded locations with zones/call-out fees.
- `diff app/public/sitemap.xml app/dist/sitemap.xml` → identical; same for robots.txt (static files copied by Vite build).

**Repo files inspected (all under `/Users/openclaw/Downloads/tatooo2`):**
- `app/index.html` (68 lines), `app/dist/index.html` (71 lines — same shell + hashed assets `/assets/index-CeMNiPoi.js` 592K, `/assets/charts-wFw_0wyN.js` 416K, `/assets/motion-Ddj-jVmO.js` 140K, CSS 136K)
- `app/vercel.json` (27 lines), `app/vite.config.ts` (35 lines — no SSR/prerender plugin; plugins: `inspectAttr()`, `react()`)
- `app/src/main.tsx` (`createRoot` + `BrowserRouter` — pure CSR), `app/src/App.tsx` (full route table, lines 48–95)
- `app/src/hooks/useSEO.ts` (88 lines — only metadata mechanism in the app)
- Per-page `useSEO` usage verified by Grep across `app/src/pages/*.tsx`
- `app/public/robots.txt`, `app/public/sitemap.xml` (static)
- `app/src/data/business.ts` (35 lines), `app/src/data/mockData.ts` (300 lines), `app/src/data/locationContent.ts` (328 lines), `app/src/data/store.ts`, `app/src/services/api.ts` (247 lines)
- `app/server/src/app.ts` (Express route mounting), `app/server/src/routes/artists.ts`, `app/server/src/seed.ts` (252 lines)
- `app/src/components/{Navbar,Footer,Layout,WhatsAppButton,HeroSlideshow}.tsx`
- `app/src/pages/{Home,Artists,ArtistProfile,Studios,StudioProfile,Locations,LocationPage,Pricing,FAQ,Safety,HowItWorks,Contact,Inspiration,Booking,NotFound,Login,StudioApply}.tsx`
- `app/package.json` (dependency audit — **no `react-helmet`, no SSR/prerender tooling, no analytics packages**)
- Image inventory via `du -h app/dist/*` (35 JPEGs 136–560K; `areas/*.webp` 6 files)

**Architecture map (file:line index):**
| Concern | Location |
|---|---|
| SPA entry / static head | `app/index.html:1-68`; built copy `app/dist/index.html:1-71` |
| Route table | `app/src/App.tsx:48-95` |
| Per-route metadata hook | `app/src/hooks/useSEO.ts:42-86` |
| SPA fallback + headers | `app/vercel.json:7-26` |
| robots.txt (static) | `app/public/robots.txt:1-7` |
| sitemap.xml (static) | `app/public/sitemap.xml:3-23` |
| Business facts | `app/src/data/business.ts:7-25`; `waLink()` `:30-33` |
| Static TattooParlor JSON-LD | `app/index.html:31-62` |
| Per-page JSON-LD (FAQ, Service, Breadcrumb) | `app/src/pages/FAQ.tsx:207-221`; `app/src/pages/LocationPage.tsx:100-142` |
| API base + endpoints | `app/src/services/api.ts:1,49-101` |
| Express app / serverless wrap | `app/server/src/app.ts:61-72`; `app/api/index.ts:1-6` |
| Seed (demo content source) | `app/server/src/seed.ts:4,33-38,79-130,224-242`; `app/src/data/mockData.ts:3-300` |
| Booking conversion flow | `app/src/pages/Booking.tsx:186-190` → `store.addBookingLead` → `api.post('/bookings')` (`services/api.ts:68`) |
| Contact "form" | `app/src/pages/Contact.tsx:56-64` (mailto hand-off, no backend) |
| WhatsApp links | `business.ts:30-33`, `components/WhatsAppButton.tsx:18`, hardcoded `wa.me/6281234567890` at `Artists.tsx:494`, `ArtistDashboard.tsx:216`, `ArtistProfileBuilder.tsx:417` |

## Findings (numbered; finding — evidence — impact — fix — priority)

1. **Pure client-side rendering; zero SSR/SSG/prerender.**
   Evidence: `vite.config.ts:7-35` (only `@vitejs/plugin-react`, no prerender plugin); `main.tsx:7-12` (`createRoot`); live probe — every URL returns the identical 3511-byte shell whose `<body>` contains only `<div id="root"></div>` (`index.html:65`, `dist/index.html:69`). All page copy, all H1s, all internal links exist only after JS execution.
   SEO impact: Googlebot must render JS to see any content (delayed/deferred indexing, wasted crawl budget on a JS-heavy bundle: 592K main + 416K charts + 140K motion). Non-rendering crawlers (most social/IM bots except those reading static OG, Bing partially, AI crawlers, link-preview scrapers) see an empty page. This is the site's single biggest architectural SEO risk.
   Fix: prerender the ~20 public routes (react-router v7 supports SSR/SSG via its framework mode; alternatives: `vite-plugin-ssr`/react-snap-style static generation at build, or Vercel ISR-style SSR). At minimum, prerender homepage + locations + artist/studio profiles.
   **Priority: P1 (borderline P0 — content is invisible without JS execution).**

2. **Canonical/OG host mismatch: static head hardcodes non-www `https://inkedup.id`, but the live site 308-redirects non-www → www.**
   Evidence: `index.html:9` (`<link rel="canonical" href="https://inkedup.id/">`), `:16-17`,`:21` (og:url/og:image/twitter:image non-www); sitemap `<loc>` entries all non-www (`public/sitemap.xml:3-23`); robots.txt:7 Sitemap line non-www; curl: `https://inkedup.id/` → `308 -> https://www.inkedup.id/`. `useSEO.ts:5-6` uses `window.location.origin`, so post-hydration canonical flips to www — meaning raw HTML and rendered DOM disagree.
   SEO impact: canonical URLs declared in HTML and sitemap all point to a redirecting host; Google must reconcile two hosts and two conflicting canonical signals (raw HTML vs rendered). Risks wrong-host indexing and canonical consolidation failures.
   Fix: pick one host (www is what Vercel serves), update `index.html` canonical/OG, sitemap `<loc>`s, and robots.txt Sitemap line to match.
   **Priority: P1.**

3. **SPA fallback returns HTTP 200 for every URL — soft-404 factory; real 404s impossible.**
   Evidence: `vercel.json:8-9` rewrites `/((?!api/).*) → /index.html`; live probe `GET /this-page-does-not-exist-xyz` → `200` with the shell; 404 UI is client-only (`App.tsx:94` catch-all → `NotFound.tsx`); unknown location slugs client-side redirect to `/not-found` (`LocationPage.tsx:154`), which itself serves 200 (it isn't even a declared route — it hits the same catch-all).
   SEO impact: Google indexes soft-404s slowly and may waste crawl budget; broken/removed URLs never return a true 404/410; typosquat URLs can enter the index.
   Fix: with prerendering/SSR, return real 404 status; at minimum add `<meta name="robots" content="noindex">` on the NotFound render and avoid `/not-found` client redirects.
   **Priority: P1.**

4. **`/artists/:slug` and `/studios/:id` pages have NO per-route metadata at all.**
   Evidence: Grep for `useSEO` across `app/src/pages/*.tsx` — present in Home, Artists, Studios, Locations, LocationPage, Pricing, FAQ, Safety, HowItWorks, Contact, Inspiration, Privacy, Terms; **absent in `ArtistProfile.tsx`, `StudioProfile.tsx`, `Booking.tsx`, `Login.tsx`, `StudioApply.tsx`, `NotFound.tsx`**. These pages inherit the static shell's homepage title/description and the non-www homepage canonical.
   SEO impact: 8 artist + 8 studio URLs (the site's most linkable, long-tail-valuable pages) all present identical homepage title/description/canonical → duplicate-metadata consolidation; if Google indexes them before render, they canonicalize to the homepage and drop out.
   Fix: call `useSEO` in ArtistProfile/StudioProfile with name-specific title/description/canonical + `Person`/`TattooParlor` JSON-LD.
   **Priority: P1.**

5. **Production database serves demo/seed content as if it were real.**
   Evidence: `server/src/seed.ts:4` imports `mockArtists, mockStudios, mockBookings, mockApplications` from `src/data/mockData.ts`; live `GET /api/artists/active` returns exactly those artists (Ayu Dewi, Kadek Surya, Yuki Tanaka, Marcus Putra, Leina Kahale, Rio Santana, Maya Anggraini, Juna Wijaya) with invented ratings (4.7–4.9) and review counts (65–154) (`mockData.ts:15-16,37-38,…`); `GET /api/studios/active` returns the 8 mock studios; `GET /api/stats` returns `totalBookings:3, completedBookings:0`; seed also inserts 5 fabricated 4–5★ reviews (`seed.ts:224-236`) and deliberately preserves inflated `rating/review_count` ("must not clobber the brand's stated counts (e.g. 127 -> 1)", `seed.ts:238-242`).
   SEO impact: unsupported trust claims (E-E-A-T risk) — "Verified Artists", star ratings, and review counts shown sitewide are placeholders; if marked up as `AggregateRating` schema later, this would violate Google's review-snippet policies and could draw manual actions.
   Fix: replace with real artists/studios/reviews or strip ratings until real data exists.
   **Priority: P1.**

6. **Business identity is placeholder throughout, and it surfaces publicly.**
   Evidence: `business.ts:3-24` — every value carries a `TODO` comment: WhatsApp `6281234567890` (:12), display `+62 812-3456-7890` (:14), email `hello@inkedup.id` (:16), hours unconfirmed (:18), legalName "InkedUp Bali" placeholder (:9), social handles TODO (:23-24). Same placeholder phone is in the static JSON-LD (`index.html:57`). Three components bypass `business.ts` and hardcode `wa.me/6281234567890` (`Artists.tsx:494`, `ArtistDashboard.tsx:216`, `ArtistProfileBuilder.tsx:417`).
   SEO impact: NAP (name/address/phone) consistency is foundational for local SEO; a placeholder phone in schema + footer + wa.me links makes LocalBusiness data unusable and breaks the primary conversion path.
   Fix: fill real values in `business.ts`, re-sync JSON-LD, remove the 3 hardcoded numbers.
   **Priority: P1.**

7. **No analytics, no Search Console verification, no conversion tracking anywhere.**
   Evidence: Grep for `googletagmanager|gtag|G-XXXXXXXX|GTM-|google-analytics|site-verification|dataLayer|fbq|clarity` across `app/**/*.{ts,tsx,html,json}` → zero hits; `package.json` has no analytics deps; booking submit (`Booking.tsx:186-190`) and all WhatsApp CTAs fire no events.
   SEO impact: cannot measure organic performance, attribute bookings to search, or verify GSC; per this audit's priority model an analytics/conversion-tracking failure is P0–P1.
   Fix: install GA4 (or Plausible), GSC DNS/meta verification, and event tracking on booking submit + wa.me clicks.
   **Priority: P1 (booking/analytics failure class).**

8. **robots.txt issues (static file).**
   Evidence: `public/robots.txt:1-7`. `Sitemap:` line points to `https://inkedup.id/sitemap.xml` which 308-redirects to www. Disallow covers `/admin`, `/artist/dashboard`, `/login` but not `/artist/profile` (profile builder), `/booking` (booking funnel pages), or `/not-found`.
   SEO impact: minor crawl-signal inconsistency (redirected sitemap URL); booking URLs technically crawlable/indexable despite being funnel pages with duplicate/thin content.
   Fix: update Sitemap URL to the www host; consider `Disallow: /booking` + noindex handling.
   **Priority: P2.**

9. **Sitemap is static, incomplete, and non-www.**
   Evidence: `public/sitemap.xml:3-23` — 21 URLs; covers static pages + 8 location pages; **missing all `/artists/:slug` and `/studios/:id` URLs**; includes `/studio/apply` (a form page); no `<lastmod>`; all `<loc>` non-www (redirect).
   SEO impact: profile pages must be discovered purely by crawl (harder under CSR); host mismatch as in #2.
   Fix: generate dynamically (or at build) including live artist/studio slugs, correct host, add lastmod.
   **Priority: P2.**

10. **Per-page SEO hook exists and is well-built — but is render-dependent and unevenly applied.**
    Evidence: `useSEO.ts:42-86` sets title/description/OG/Twitter/canonical and injects JSON-LD client-side (cleanup on unmount). Applied to 13 of 19 public pages (see #4 for gaps). FAQ page injects `FAQPage` schema (`FAQ.tsx:207-221`); LocationPage injects `BreadcrumbList` + `Service` + `FAQPage` (`LocationPage.tsx:100-134`).
    SEO impact: titles/descriptions only exist after JS render; social crawlers reading only raw HTML always see homepage OG (no per-page previews). JSON-LD injected at runtime — **needs browser-render verification (Rich Results Test), not visible to curl**. Note: Google shows FAQ rich results only for government/health sites since Aug 2023, so the FAQPage markup has near-zero SERP benefit.
    Fix: keep hook for CSR polish but move critical metadata into prerendered HTML; drop or de-prioritize FAQPage schema.
    **Priority: P2.**

11. **Static `TattooParlor` JSON-LD in raw HTML contains placeholder data.**
    Evidence: `index.html:31-62` (verbatim in `dist/index.html:31-62`): `@type: TattooParlor`, telephone `+62-812-3456-7890` (placeholder), legalName "InkedUp Bali" (TODO), address only `addressLocality: "Canggu, Bali"` (no street/geo), `areaServed` 6 areas, hours 08:00–20:00, `sameAs` Instagram/TikTok (unconfirmed handles). Comment at :30 says "keep in sync with src/data/business.ts" — it is in sync, and both are placeholders.
    SEO impact: a LocalBusiness entity Google can read without rendering is good architecture; with fake NAP data it poisons the entity and local-pack eligibility.
    Fix: real NAP + geo + priceRange + aggregateRating only when real.
    **Priority: P1 (rolls into #6; the mechanism itself is correct).**

12. **Conversion paths: booking flow is real; contact form is a mailto; no tracking anywhere.**
    Evidence: Booking submits via `store.addBookingLead` → `POST /api/bookings` (`Booking.tsx:186-190`, `services/api.ts:68`, `server/src/app.ts:64`) → Neon DB; success screen then nudges to WhatsApp (`Booking.tsx:337`). Contact form has **no backend**: `Contact.tsx:56-64` builds a `mailto:` and sets a success state. Primary CTA sitewide is `wa.me` (`WhatsAppButton.tsx:18`, floating button in `Layout.tsx:14`).
    SEO impact: conversion path works for bookings, but the contact form silently depends on the visitor having a mail client (mobile Safari/Chrome often don't) and its "success" state is cosmetic; zero measurement of either funnel.
    Fix: wire Contact to a real endpoint (or remove it in favor of WhatsApp-only), add tracking.
    **Priority: P2.**

13. **Images: heavy JPEGs, no responsive variants, decorative-alt pattern.**
    Evidence: `app/dist/*.jpg` — 35 JPEGs, e.g. `hero-bg.jpg` 560K, `location-nusa-dua.jpg` 312K, hero slides 212–268K each, testimonials 140–180K; only `areas/*.webp` (6 files, used by `Pricing.tsx:84-89`) is a modern format. No `srcset`/`sizes` anywhere (Grep). `loading="lazy"` present on Locations cards (`Locations.tsx:214,262`) and Inspiration gallery (`Inspiration.tsx:208`) but absent on hero/page-hero images; hero slide 1 is preloaded (`index.html:25`, 228K). Alt text: good on location cards (`Locations.tsx:212`) and inspiration items (`Inspiration.tsx:206`); empty `alt=""` on all hero/page-hero backgrounds (`HeroSlideshow.tsx:79`, `FAQ.tsx:230`, `Inspiration.tsx:99`), logo images also `alt=""` (`Navbar.tsx:96`, `Footer.tsx:50`).
    SEO impact: LCP payload ~228–560K JPEG on 4G hurts Core Web Vitals (a Google ranking input); no image-SEO upside from heroes; alt-empty decorative pattern is acceptable a11y-wise but a missed relevance opportunity.
    Fix: compress/convert to WebP/AVIF, add srcset, keep lazy-loading off the LCP image only, give meaningful alts to content images.
    **Priority: P2.**

14. **vercel.json: correct SPA rewrite, decent security headers, weak static-asset caching.**
    Evidence (quoted in full):
    ```json
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api" },
      { "source": "/((?!api/).*)", "destination": "/index.html" }
    ],
    "headers": [
      { "source": "/(.*)", "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" } ] },
      { "source": "/assets/(.*)", "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] }
    ]
    ```
    (`vercel.json:7-26`). Hashed `/assets/*` get immutable caching, but the 35 public JPEGs (unhashed names) fall under no rule — live header confirms `cache-control: public, max-age=0, must-revalidate` on HTML and images. No CSP header. No redirects section (host consolidation handled implicitly by Vercel domains — confirmed working: 308 to www).
    SEO impact: repeat-visit and crawl performance suboptimal; security headers adequate (HSTS comes from Vercel platform).
    Fix: add a cache rule for `*.jpg/*.webp/*.png` (with content-hash strategy or versioned filenames), consider CSP.
    **Priority: P2 (caching) / P3 (CSP).**

15. **Internal-linking gaps.**
    Evidence: Footer "Locations" column links Canggu/Seminyak/Uluwatu/Ubud **all to `/locations`** instead of the per-slug pages (`Footer.tsx:24-29`); navbar has no FAQ or Contact link (`Navbar.tsx:6-18`, FAQ only in footer); location pages cross-link via `related` slugs (`LocationPage.tsx:158-160`) — good.
    SEO impact: the 8 location pages (the strongest local-SEO assets) get only one templated footer link and in-content links; anchor-text diversity lost.
    Fix: point footer location links to `/locations/:slug`.
    **Priority: P3.**

16. **Indexability hygiene: booking funnel and utility routes unprotected.**
    Evidence: `/booking/:slug` (`App.tsx:71`) is reachable without auth, not in robots.txt, has no noindex; `/login` is disallowed in robots (so Google can never see a noindex there even if added — classic conflict); `/studio/apply` is in the sitemap (priority 0.6).
    SEO impact: thin/duplicate funnel pages can enter the index; wasted crawl.
    Fix: noindex booking/login/apply (or keep apply indexable deliberately and drop from sitemap discussion).
    **Priority: P3.**

17. **Dead CMS surface: `content_pages` table seeded but never read by the frontend.**
    Evidence: `seed.ts:209-221` inserts 6 content pages; `services/api.ts:93-94` defines `getContentPage(s)`; Grep shows **no page calls them** — all public copy is hardcoded in page components + `locationContent.ts`.
    SEO impact: none directly, but it means content edits require a deploy; future CMS-driven pages must not accidentally publish thin content.
    Fix: wire it up or remove it; document content-editing workflow.
    **Priority: P3.**

18. **HTML head basics: mostly fine.**
    Evidence: `lang="en"` (`index.html:2`) — appropriate, site is English-only (no hreflang needed); viewport correct (:5); `theme-color` (:8); favicon + apple-touch-icon referenced (:23-24) and live (200); **no `site.webmanifest`**; Google Fonts loaded via render-blocking stylesheet (:28) with preconnect (:26-27).
    SEO impact: minor P3 items only.
    **Priority: P3.**

**Positive observations (keep):** non-www → www 308 works; HSTS + nosniff + Referrer-Policy present; hashed assets immutably cached; code-split heavy routes (`App.tsx:22-33`); admin/API list endpoints correctly auth-gated (401 verified live); static OG tags in shell mean social link previews work even without rendering; per-location content in `locationContent.ts` is substantial, unique, non-doorway copy (`locationContent.ts:26-328`).

## Data tables

**Route map — public/indexability classification (source: `app/src/App.tsx:48-95`; live status verified by curl where noted):**

| Route | Component | useSEO metadata | In sitemap | robots | HTTP status (live) | Indexable intent |
|---|---|---|---|---|---|---|
| `/` | Home.tsx:750 | ✅ | ✅ (non-www) | allow | 200 | Yes |
| `/artists` | Artists.tsx:29 | ✅ | ✅ | allow | 200 | Yes |
| `/artists/:slug` (8 live) | ArtistProfile.tsx | ❌ none | ❌ missing | allow | 200 (shell) | Yes (but broken metadata) |
| `/studios` | Studios.tsx:15 | ✅ | ✅ | allow | 200 | Yes |
| `/studios/:id` (8 live) | StudioProfile.tsx | ❌ none | ❌ missing | allow | 200 (shell) | Yes (but broken metadata) |
| `/locations` | Locations.tsx:126 | ✅ | ✅ | allow | 200 | Yes |
| `/locations/:slug` (8 slugs) | LocationPage.tsx:136 | ✅ + JSON-LD | ✅ all 8 | allow | 200 | Yes |
| `/safety` | Safety.tsx:178 | ✅ | ✅ | allow | 200 | Yes |
| `/pricing` | Pricing.tsx:134 | ✅ | ✅ | allow | 200 | Yes |
| `/price-calculator` | → redirect to /pricing | n/a | ❌ | allow | 200 (shell; client redirect) | No (legacy alias — not 301!) |
| `/faq` | FAQ.tsx:207 | ✅ + FAQPage | ✅ | allow | 200 | Yes |
| `/how-it-works` | HowItWorks.tsx:185 | ✅ | ✅ | allow | 200 | Yes |
| `/contact` | Contact.tsx:42 | ✅ | ✅ | allow | 200 | Yes |
| `/inspiration` | Inspiration.tsx:27 | ✅ | ✅ | allow | 200 | Yes |
| `/privacy` | Privacy.tsx:5 | ✅ | ✅ (0.3) | allow | 200 | Yes |
| `/terms` | Terms.tsx:5 | ✅ | ✅ (0.3) | allow | 200 | Yes |
| `/studio/apply` | StudioApply.tsx | ❌ none | ✅ (0.6) | allow | 200 | Debatable (form page) |
| `/artist/apply` | → redirect to /studio/apply | n/a | ❌ | allow | 200 (shell) | No |
| `/booking/:slug` | Booking.tsx | ❌ none | ❌ | allow (not disallowed) | 200 (shell) | Should be noindex |
| `/login` | Login.tsx | ❌ none | ❌ | **Disallow** | 200 (shell) | No |
| `/artist/dashboard` | ArtistDashboard.tsx | ❌ | ❌ | **Disallow** | 200 (shell) | No |
| `/artist/profile` | ArtistProfileBuilder.tsx | ❌ | ❌ | allow (gap) | 200 (shell) | No |
| `/admin/*` (6 routes) | Admin*.tsx | ❌ | ❌ | **Disallow** `/admin` | 200 (shell) | No |
| `*` (catch-all) | NotFound.tsx | ❌ | ❌ | allow | **200 — soft 404** | No (but returns 200) |

Note: robots Disallow on `/login`, `/admin`, `/artist/dashboard` is belt-and-braces only — those routes are CSR-gated, not server-gated; the shell HTML for them is publicly served (200) and only the rendered app enforces auth UI.

**Structured data inventory:**

| Type | Where | Delivery | Render-independent? | Data quality |
|---|---|---|---|---|
| `TattooParlor` (LocalBusiness) | `index.html:31-62` | static raw HTML | ✅ readable by curl | Placeholder phone/legalName; no geo/priceRange |
| `BreadcrumbList` | `LocationPage.tsx:103-110` | JS-injected via useSEO | ❌ needs render (UNVERIFIED — Rich Results Test) | OK |
| `Service` | `LocationPage.tsx:111-123` | JS-injected | ❌ needs render | Uses placeholder `business.whatsappDisplay` as telephone |
| `FAQPage` | `LocationPage.tsx:124-132`, `FAQ.tsx:212-221` | JS-injected | ❌ needs render | OK content; near-zero rich-result eligibility (Google Aug-2023 FAQ change) |
| `Person` / `AggregateRating` / `Product` | — | — | — | **Absent** (artist pages have none) |

**Content data sources per page:**

| Page | Source | Live data status |
|---|---|---|
| Home | hardcoded JSX + `GET /api/stats` (`Home.tsx:67,93-94`) | stats = seed DB (8 artists, 3 bookings, 0 completed) |
| Artists / Studios / Inspiration | `GET /api/artists/active`, `/api/studios/active` (`store.ts:145-146,187-188`) | **demo seed data live in production** |
| Artist/Studio profiles | `GET /api/artists/:slug`, `/api/studios/:id` | demo seed data |
| Locations index + pages | `locationContent.ts` (hardcoded, unique copy) + `GET /api/locations` (fees/zones) | hybrid, healthy |
| Pricing | hardcoded body-part table (`Pricing.tsx:84-89`) + client pricing engine (`src/lib/pricing.ts`) | hardcoded |
| FAQ / Safety / HowItWorks / Contact / Privacy / Terms | hardcoded JSX | hardcoded |
| `content_pages` DB table | seeded (`seed.ts:209-221`) | **unused by frontend** |

## OWNER-VERIFY (facts/claims/access that only the business owner can confirm)

1. **Real WhatsApp concierge number** (currently placeholder `6281234567890` everywhere incl. JSON-LD).
2. **Registered legal entity name** (placeholder "InkedUp Bali" — PT name?) and **real email inbox** (placeholder `hello@inkedup.id`).
3. **Business hours** ("Every day 8–20 WITA" marked TODO-confirm).
4. **Instagram/TikTok handles** (`inkedup.bali` marked TODO — do these accounts exist?).
5. **Are the 8 artists, 8 studios, ratings, and review counts real?** They match `mockData.ts` exactly and look like demos (all ratings 4.7–4.9, review counts 65–154, studios named after the artists). If not real partners, they must not be presented as verified.
6. **Physical address / service-base** for LocalBusiness schema (currently only "Canggu, Bali").
7. **Google Search Console / GA4 accounts** — do they exist? Is any property verified for inkedup.id?
8. **Preferred canonical host**: www or non-www? (Vercel currently 308s to www; code/sitemap say non-www.)
9. Is `/studio/apply` intended to rank (it's in the sitemap)?
10. Seed admin credentials (`admin@inkedup.id` / fallback `admin123` in non-prod, `seed.ts:22-31`) — confirm production ADMIN_PASSWORD is set and unique.

## UNVERIFIED / limitations of this pass

- **JS-injected JSON-LD and per-route titles/descriptions could not be verified in a rendered DOM** (no browser tool used). Needs Rich Results Test / GSC URL Inspection on: `/`, `/locations/canggu`, `/faq`, `/artists/ayu-dewi`, `/studios/studio-2`.
- Whether Google has indexed the non-www host or any deep URLs — needs GSC access.
- Core Web Vitals field data — needs CrUX/PageSpeed run (lab estimate only: 228–560K hero JPEGs, ~1.1MB JS).
- `Booking.tsx` behavior for an unknown `/booking/:slug` (no slug validation path inspected in depth).
- Whether Vercel has a redirect from `/price-calculator` (it's a client-side `<Navigate>` only — verified code, not live-tested for status code; it serves 200 shell).
- `api/index.ts` bundle contents (nft tracing) not inspected; API auth middleware (`server/src/middleware/auth.ts`) not audited for security.
- robots.txt Sitemap redirect (non-www → www) is confirmed working via curl, but some crawlers' tolerance for redirected sitemap URLs varies by documentation — low risk, flagged for completeness.
