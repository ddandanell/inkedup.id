# 09 — ANALYTICS & MEASUREMENT BASELINE — InkedUp (https://www.inkedup.id/)

**Date:** 2026-07-17 (WITA) · **Role:** DOC-WRITER-B (baseline compilation)
**Scope:** Current measurement state, baseline metrics, exact setup instructions for GSC/GA4/Bing WMT/consent, conversion event specification, weekly dashboard specification.
**Method:** Compilation of existing audit evidence only. **No metrics are invented — every baseline value that cannot be evidenced is marked UNVERIFIED with the exact tool needed.**

**Evidence legend:**

| Code | Evidence file |
|---|---|
| R1 | `SEO Strategy/_raw/01-repo-architecture.md` |
| R2 | `SEO Strategy/_raw/02-live-crawl.md` |
| R3 | `SEO Strategy/_raw/03-tech-performance.md` |
| R8 | `SEO Strategy/_raw/08-brand-entity.md` |

---

## A. Current state — nothing is installed or verified

**Evidence (zero-findings, all lanes concur):**

| Capability | State | Evidence |
|---|---|---|
| Google Search Console verification | **NOT FOUND** — no `google-site-verification` meta tag in `app/index.html`, no verification file in `app/public/`, no DNS check performed | R2 F12: Grep for `google-site-verification` / GSC verification file across `app/` → no matches; homepage head has no verification meta. R1 OWNER-VERIFY #7 asks the owner whether any property exists |
| GA4 (Google Analytics 4) | **NOT FOUND** | R1 F7: Grep for `googletagmanager|gtag|G-XXXXXXXX|GTM-|google-analytics|site-verification|dataLayer|fbq|clarity` across `app/**/*.{ts,tsx,html,json}` → **zero hits**; `app/package.json` has no analytics dependencies. R3 F3: third-party domain inventory + targeted grep — no GA4/GTM anywhere in raw HTML, `dist/index.html`, or `src/` |
| Google Tag Manager | **NOT FOUND** | Same greps as above (R1 F7; R3 F3) |
| Bing Webmaster Tools | **NOT FOUND** — no `msvalidate.01` meta, no BingSiteAuth.xml | R1 F7 grep (no matches); R2 F12 (no verification found; Bing fetch probe returned irrelevant results — tool failure recorded, R2 probes table) |
| Other analytics (Meta Pixel, Hotjar, Clarity, Sentry, Posthog, Plausible) | **NOT FOUND** | R3 F3: domain inventory + targeted grep across `src` + `index.html` — none present |
| Conversion tracking of any kind | **NOT FOUND** | R1 F7: booking submit (`app/src/pages/Booking.tsx:186-190` → `store.addBookingLead` → `POST /api/bookings`, `app/src/services/api.ts:68`) and all WhatsApp CTAs (`app/src/components/WhatsAppButton.tsx:18`, `Layout.tsx:14`, hardcoded `wa.me/6281234567890` at `Artists.tsx:494`, `ArtistDashboard.tsx:216`, `ArtistProfileBuilder.tsx:417`) **fire no events** |
| Consent banner / consent mode | **NOT FOUND** — moot today (zero third-party tags), required before the first tag ships | R3 F3 (no third-party scripts at all) |
| Search-index presence | **ZERO results in every accessible third-party search tool** — actual Google/Bing coverage UNVERIFIED | R2 search-visibility probes: `site:inkedup.id` and `site:www.inkedup.id` (WebSearch) → "No search results were found"; `kimi_search_v2 site:inkedup.id` → HTTP 404 backend error; exact-title and `"inkedup.id"` queries → 0 inkedup.id results; Bing fetch → tool failure. R2 F12: "these backends are not Google" — needs GSC confirmation |

**Interpretation (evidence-based):** the site is either pre-launch/not-yet-indexed or has an indexing problem; R2 OWNER-VERIFY #7 asks the owner which. Everything else in this document is moot until GSC verification happens.

### Baseline metrics table (2026-07-17)

**No numbers exist to report. No metric is invented below.**

| Metric | Baseline value | Why / source needed |
|---|---|---|
| Indexed URLs (Google) | **UNVERIFIED — requires GSC setup** | Third-party `site:` checks returned zero results (R2 probes table) but are not Google; confirm via GSC Pages report + `site:inkedup.id` in a real Google session (R2 OWNER-VERIFY #3) |
| Indexed URLs (Bing) | **UNVERIFIED — requires Bing WMT setup** | Bing fetch probe failed (R2); confirm via Bing Webmaster Tools after import |
| Organic clicks (7d / 28d / 90d) | **UNVERIFIED — requires GSC setup** | GSC Performance report (no property verified, R2 F12) |
| Organic impressions | **UNVERIFIED — requires GSC setup** | GSC Performance report |
| Average position | **UNVERIFIED — requires GSC setup** | GSC Performance report |
| Branded vs non-branded query split | **UNVERIFIED — requires GSC setup** | GSC query filter (`inkedup\|inked up`); **caution:** branded impressions may be contaminated by the name-collision entity "Inked Up Tattoo Parlour" (R8 F2) |
| WhatsApp conversions (clicks) | **UNVERIFIED — requires GA4 setup** | No tracking on any wa.me CTA (R1 F7); additionally the number itself is a placeholder and must be replaced before tracking is meaningful (R1 F6) |
| Booking form submissions | **UNVERIFIED — requires GA4 setup** | Backend exists (`POST /api/bookings`, R1 F12) but fires no analytics events (R1 F7); DB-side count currently = seed data (`GET /api/stats` → `totalBookings:3, completedBookings:0`, R1 F5) |
| Contact form submissions | **UNVERIFIED — requires GA4 setup** | Contact form is a `mailto:` hand-off with a cosmetic success state — no backend to count, no events (R1 F12: `Contact.tsx:56-64`) |
| Top pages (organic) | **UNVERIFIED — requires GSC setup** | GSC Performance → Pages |
| Top countries | **UNVERIFIED — requires GSC/GA4 setup** | GSC/GA4 geo reports |
| Device split | **UNVERIFIED — requires GSC/GA4 setup** | GSC Performance → Devices |
| LCP / INP / CLS (field data) | **UNVERIFIED — requires PSI/CrUX (+ GSC CWV report)** | No CrUX field data expected for a new site (R3 UNVERIFIED); lab proxies only: ~1.11 MB raw initial JS, ~4.28 MB homepage images (R3 Table C). Exact PSI URLs in `02-technical-audit.md` §B.6 |
| LCP / INP / CLS (lab) | **UNVERIFIED — requires browser run** | Run the three PSI URLs prescribed in R3 (homepage, `/locations/canggu`, `/booking`) |

---

## B. Exact setup instructions

Order matters: GSC first (it unblocks Bing import and confirms indexing), GA4/GTM second (events), then CWV field data accumulates automatically.

### B.1 Google Search Console — domain-property verification (recommended)

**Why domain property:** the site's host situation is unsettled (redirects force www; declared URLs say non-www — R1 F2; R2 F1; R8 F8). A **domain property `inkedup.id`** covers http/https × www/non-www in one property and survives the canonical-host decision. Given the SPA, **DNS TXT verification is recommended** — it is host-independent and cannot be lost in a front-end refactor.

Steps:
1. Go to `https://search.google.com/search-console` → **Add property** → **Domain** → enter `inkedup.id`.
2. Copy the provided `google-site-verification=…` **TXT record** and add it at the DNS provider for `inkedup.id`. Click **Verify**.
3. **Alternative (if DNS access is unavailable):** URL-prefix property `https://www.inkedup.id/` + HTML-tag verification — paste the `google-site-verification` meta into the **static head of `app/index.html`** (e.g., next to line 8). The static head is served pre-hydration, so the tag is visible to the crawler without JS — do NOT inject it via `useSEO.ts` (post-render injection may not be seen).
4. After the canonical-host fix (see `02-technical-audit.md` issue #2), **submit the sitemap**: `https://www.inkedup.id/sitemap.xml` (regenerated to the final host per `02-technical-audit.md` issue #8).
5. Use **URL Inspection → Request indexing** on: `/`, `/artists`, `/studios`, `/locations`, all 8 `/locations/:slug`, `/pricing`, `/how-it-works`, `/safety`, `/faq`, `/contact`, `/inspiration` (the 21 sitemap URLs, R2), plus one artist and one studio profile once their metadata ships (R1 F4).
6. Confirm with the owner first whether any property already exists (R1 OWNER-VERIFY #7; R2 OWNER-VERIFY #2).

### B.2 GA4 — gtag.js in the static head (or GTM)

**Minimal path (recommended now):** direct gtag.js — no tag manager exists and no analytics packages are installed (R1 F7).

1. Create a GA4 property at `https://analytics.google.com/` → copy the **G-XXXXXXXXX** Measurement ID. *(Do not hardcode a guessed ID anywhere — insert only the real ID from the GA4 UI.)*
2. Paste the standard `gtag.js` snippet into the **static head of `app/index.html`, before any other script** (the shell is served on every route, so one install covers the SPA):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXX');
   </script>
   ```
3. **SPA pageviews:** because routes change client-side (`BrowserRouter`, `app/src/main.tsx:7-12`), send a `page_view` event on every route change (hook into the router, or use `history_change` via GA4 enhanced measurement — verify it fires for react-router navigations; if not, dispatch manually per route).
4. **GTM alternative:** if marketing needs multiple vendors later, install a GTM container snippet in the same static head position instead, and deploy GA4 as a tag inside GTM. Choose one — do not install both gtag.js and GTM-deployed GA4 (double counting).

### B.3 Bing Webmaster Tools

1. After GSC is verified: `https://www.bing.com/webmasters` → sign in → **Import from Google Search Console** → select the `inkedup.id` property. This imports the site and sitemaps automatically.
2. Submit the corrected sitemap there as well; Bing indexing matters doubly here because the brand currently has zero presence in every non-Google index checked (R2 probes; R8 Table B).

### B.4 Consent mode basics

The site has **zero third-party tags today** (R3 F3), so no consent UI exists; one must ship with the first tag.

1. Implement **Google Consent Mode v2**: before the GA4 config line, set defaults —
   `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 })` — then update to `granted` on user accept via the consent banner.
2. Audience context: Bali tourists (EU/EEA + AU visitors) make a real consent banner the safe default rather than a nice-to-have.
3. Keep the CSP (recommended in `02-technical-audit.md` §B.8) compatible: allowlist `www.googletagmanager.com`, `www.google-analytics.com` (and `region1.google-analytics.com`) when adding analytics, plus fonts domains already in use (`index.html:26-28`).

### B.5 PageSpeed Insights / CrUX for Core Web Vitals field data

1. Run the exact PSI URLs prescribed in R3 (also in `02-technical-audit.md` §B.6):
   - `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2F`
   - `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Flocations%2Fcanggu`
   - `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.inkedup.id%2Fbooking`
2. **Field data:** the "Core Web Vitals" section of each PSI run shows CrUX data once the origin has sufficient traffic — **none is expected for a new site (UNVERIFIED, R3)**. Lab metrics (Lighthouse) are the interim source.
3. After GSC verification, the **Core Web Vitals report** in GSC becomes the ongoing field-data source; the GA4 property can later add RUM if needed (R3 UNVERIFIED — Bali-user TTFB needs RUM).

---

## C. Conversion event specification (to implement)

GA4 custom events. Fire from the React app via the global `gtag`/`dataLayer`. **None of these exist today** (R1 F7). Naming follows GA4 snake_case; where a GA4 recommended event fits, mark it.

| Event name | Trigger (code location) | Parameters | Notes / blockers |
|---|---|---|---|
| `whatsapp_click` | Click on any `wa.me` link: `WhatsAppButton.tsx:18` (floating button, mounted in `Layout.tsx:14`), `Booking.tsx:337` (post-booking nudge), hardcoded instances at `Artists.tsx:494`, `ArtistDashboard.tsx:216`, `ArtistProfileBuilder.tsx:417` (R1 F6/F12) | `page_path`, `link_location` (floating_button / booking_success / artist_card / dashboard / profile_builder), `artist_id` or `studio_id` when present, `location_slug` when present | **Implement only after the real number exists** — current `6281234567890` is a placeholder sitewide incl. JSON-LD (R1 F6); consolidate the 3 hardcoded instances through `business.ts:30-33` `waLink()` first |
| `phone_click` | Click on any `tel:` link (footer/contact once real NAP ships) | `page_path` | Blocked on real NAP (R1 F6; R8 Table C) |
| `form_start` | First focus/interaction on booking form or contact form | `form_id` (booking / contact), `page_path` | Contact form is currently a `mailto:` with cosmetic success (R1 F12) — wire a real endpoint or remove before tracking "submit" |
| `form_submit` | Successful submission of booking or contact form | `form_id`, `page_path`, plus `location_slug`, `body_part`, `price_estimate` for booking | For booking, fire only after `POST /api/bookings` resolves success (`Booking.tsx:186-190` → `services/api.ts:68`, R1 F12). Map to GA4 recommended `generate_lead` |
| `booking_start` | Booking page mount with a valid service selection (`/booking/:slug`, `App.tsx:71`) | `booking_slug`, `page_path` | Route currently has no metadata/noindex decision pending (R1 F16) |
| `booking_complete` | Booking success screen render (after API success, before the WhatsApp nudge at `Booking.tsx:337`) | `booking_slug`, `location_slug`, `body_part`, `price_estimate`, `value`, `currency` | Primary macro-conversion. Map to `generate_lead` (or `purchase` if deposits are taken later) |
| `artist_application_submit` | Successful submit of the artist application flow (`/artist/apply` → client redirect to `/studio/apply`, `App.tsx:79`) | `page_path`, `application_type: artist` | Verify whether artist and studio applications share one form before instrumenting (R1 route map) |
| `studio_application_submit` | Successful submit on `StudioApply.tsx` (`/studio/apply`) | `page_path`, `application_type: studio` | Page is currently in the sitemap (priority 0.6) — owner to confirm it should rank (R1 F9, OWNER-VERIFY #9) |
| `profile_view` | Mount of `ArtistProfile.tsx` or `StudioProfile.tsx` | `profile_type` (artist / studio), `profile_id` (slug or id), `page_path` | These pages also lack `useSEO` metadata (R1 F4) — implement both fixes together |
| `search_filter_use` | Interaction with filter/search controls on `Artists.tsx`, `Studios.tsx`, `Locations.tsx`, `Inspiration.tsx` | `filter_type` (style / location / price / query), `filter_value`, `page_path` | Powers content decisions (which styles/areas get demand) |

**Implementation notes:**
- Parameter discipline: always send `page_path` + `page_location` (final host URL) so reports survive the host cleanup; never send PII (names, phone numbers, message text) as parameters.
- Register `generate_lead` (and `booking_complete` if kept distinct) as **key events** in GA4 for reporting and (future) ads linking.
- All events must respect Consent Mode v2 state (§B.4).

---

## D. Weekly dashboard specification

Cadence: weekly, comparing the last 7 days vs the previous 7 days. Sources: GSC (search metrics), GA4 (behavior/conversions), GSC Pages (indexation), PSI/GSC CWV (technical). **Every section below is empty until §B is implemented.**

| # | Dashboard section | Metric(s) | Source | Notes (evidence-based) |
|---|---|---|---|---|
| 1 | Organic performance | Clicks, impressions, average position, CTR (7d vs prev 7d) | GSC Performance | Baseline currently UNVERIFIED (§A) |
| 2 | Indexation | Indexed vs excluded page counts; exclusion reasons — watch specifically for **"Soft 404"** (predicted by R2 F3), **"Indexed, though blocked by robots.txt"** (predicted by R2 F8), **"Duplicate without user-selected canonical"** (predicted by R2 F1/F2) | GSC Pages | First readout after verification doubles as confirmation of the technical audit's predictions |
| 3 | Branded vs non-branded | Clicks/impressions split by query class (regex `inkedup\|inked up`) | GSC Performance | Branded numbers may include collision noise from "Inked Up Tattoo Parlour" (R8 F2) — annotate until the entity consolidates |
| 4 | Landing-page groups | Clicks/impressions/position by group: homepage, `/locations/*`, `/artists/*` (incl. profiles), `/studios/*` (incl. profiles), style/content pages (`/inspiration`, `/pricing`, `/safety`, `/how-it-works`, `/faq`) | GSC Performance → Pages (regex groups) | Profile groups only meaningful after profiles get metadata (R1 F4) and enter the sitemap (R1 F9) |
| 5 | WhatsApp enquiries | `whatsapp_click` count, by landing-page group and link_location | GA4 (§C) | Starts only after real number + events exist (R1 F6/F7) |
| 6 | Qualified enquiries | Count of enquiries marked qualified | Manual/CRM process | **No CRM or lead-qualification mechanism exists** (R1 F12 — bookings go to Neon DB, contact is mailto); define the qualification step as a process task |
| 7 | Booking funnel | `booking_start`, `booking_complete`, completion rate (`booking_complete / booking_start`) | GA4 (§C) | Cross-check against DB `bookings` table (seed currently shows `totalBookings:3, completedBookings:0` — R1 F5) |
| 8 | Conversion rate | `booking_complete` / organic sessions; `whatsapp_click` / organic sessions | GA4 + GSC join | Report per landing-page group |
| 9 | Top gains & losses | Biggest WoW movers: queries and pages (clicks delta) | GSC Performance comparison | — |
| 10 | Technical errors | New GSC coverage errors; 5xx/4xx from Vercel logs; CWV status changes (LCP/INP/CLS) | GSC Pages + GSC CWV + Vercel dashboard | CWV field data UNVERIFIED until traffic exists (R3) — use PSI lab runs (§B.5) in the interim |
| 11 | Content published / updated | Pages shipped or materially edited this week | Changelog / deploy log | Content edits currently require a deploy — the `content_pages` CMS table is dead (R1 F17); track via git/deploy history until a CMS workflow exists |

---

*Compiled from `_raw/01`, `_raw/02`, `_raw/03` (2026-07-17) and `_raw/08` (identity evidence). No accounts, IDs, or metrics were invented; every gap is marked UNVERIFIED with the exact tool needed to close it.*
