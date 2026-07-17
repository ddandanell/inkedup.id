# Owner Verification Requests — InkedUp SEO Baseline

**Date:** 2026-07-17 (WITA) · **Purpose:** consolidated list of facts, access, and decisions only the business owner can supply. Every item below currently blocks real work (marked ⛔) or is required before specific claims may be published. Nothing here may be guessed or written by the agent — per the operating rules, unverified claims stay unpublished.

**How to answer:** reply in this document (under each item) or in chat referencing the ID. Partial answers are fine — the backlog unblocks incrementally.

---

## 1. Money-path facts ⛔ (block P0-1, the dead conversion funnel)

| ID | Question | Why it's needed | Currently |
|---|---|---|---|
| O-1.1 | What is the real WhatsApp business number? | Every CTA, wa.me link, and the LocalBusiness JSON-LD telephone uses placeholder `6281234567890`; the entire booking funnel is dead | `app/src/data/business.ts` TODO |
| O-1.2 | What is the real enquiry email / inbox? | Contact form is a cosmetic `mailto:` to a placeholder address | `_raw/04` |
| O-1.3 | Should the contact form submit to a real backend (booking DB) instead of mailto? | Form success state currently does nothing | `_raw/01`, `_raw/04` |

## 2. Business identity ⛔ (blocks JSON-LD, GBP, About, footer, positioning statement)

| ID | Question | Why it's needed |
|---|---|---|
| O-2.1 | Legal business name + entity type (PT/CV/etc.) + registration number | `legalName` in schema is a TODO; no legal entity named anywhere on the site |
| O-2.2 | Public brand name to standardize on — confirm **"InkedUp Bali"** for titles/schema/GBP to disambiguate from Inked Up Tattoo Parlour | Brand collision: `_raw/08` |
| O-2.3 | Business address (if any) — or confirm service-area-only business (no public address) | LocalBusiness/TattooParlor schema, GBP eligibility; do NOT invent a location |
| O-2.4 | Real phone (voice), opening hours, support hours | Site says both "24/7 WhatsApp Support" and 8:00–20:00 — contradictory (`_raw/04`) |
| O-2.5 | Founders/team names + roles approved for the About page | E-E-A-T: no people anywhere on the site |
| O-2.6 | Real social profiles (Instagram/TikTok/Facebook handles) — do `@inkedup.bali` or similar belong to you? | Footer + schema `sameAs` currently point to apparently dead/nonexistent profiles (`_raw/08`) |
| O-2.7 | One approved positioning statement (marketplace vs concierge vs agency; who employs/contracts the artists; where the 90% goes — artist or studio) | FAQ, Terms, and HowItWorks currently contradict each other (`_raw/04`) |

## 3. Decisions (one-word answers unblock code work)

| ID | Question | Recommendation / context |
|---|---|---|
| O-3.1 | Canonical host: **www** or non-www? | Recommend **www** — Vercel already 308-redirects everything there; sitemap/robots/JSON-LD must then be aligned (P0-2) |
| O-3.2 | May we make repo `ddandanell/inkedup.id` private (is it yours)? | It is a top DuckDuckGo result for the exact-domain query and exposes source (`_raw/08`) |
| O-3.3 | OK to remove or honestly re-label all demo metrics now (ratings, review counts, "500+ bookings", testimonials) rather than waiting for real replacements? | Needed before requesting indexing (P1-3) |
| O-3.4 | Preferred analytics setup: GA4 direct gtag vs GTM? | GTM recommended for event flexibility; spec in `09-analytics-baseline.md` |

## 4. Access ⛔ (blocks measurement baseline)

| ID | Question | Why |
|---|---|---|
| O-4.1 | Does a Google Search Console property exist for inkedup.id? If yes, add the agent/owner; if no, confirm we may create + verify (DNS TXT at registrar) | Confirm true indexation status (third-party checks show zero — P0-3) |
| O-4.2 | GA4 — existing property or create new? Who owns the account? | No analytics found anywhere (`_raw/01`) |
| O-4.3 | Google Business Profile — does one exist for InkedUp? If not, confirm we may create a Service-Area Business named "InkedUp Bali" | Competitor's GBP confirmed; none findable for InkedUp (`_raw/08`) |
| O-4.4 | Vercel deployment path: is production auto-deploy from `main` active, and who can merge/trigger? | All fixes ship via deploy; verification requires it |
| O-4.5 | Site launch date + any prior SEO/marketing history (previous domains, migrations, penalty notices) | Explains zero-index: new site vs indexing failure |

## 5. Operational truth ⛔ (blocks "verified" claims, profiles, pricing, mobile/villa pages)

| ID | Question | Why |
|---|---|---|
| O-5.1 | Are the 8 artists and 8 studios in the live database real partners? If yes: names/consent to publish; if no: confirm removal of demo data from production | They are presented as "Verified" with fabricated ratings/reviews while `verified_at: null` (`_raw/04`) |
| O-5.2 | Describe the actual artist/studio verification process (steps, documents, hygiene checks) — or confirm none exists yet | "Verified Artist" badges and any "verified" copy are unsupported until this is documented |
| O-5.3 | Hygiene/sterilization standards for mobile/in-villa work; any insurance, permits, or licenses held | Required before publishing hygiene claims or the mobile/villa hub; competitors publicly attack villa tattoos as unsafe (`_raw/05`) |
| O-5.4 | Real pricing: minimums, call-out/travel fees per area (Uluwatu/Ubud Rp 150.000?), deposits, cancellation/refund policy | Site contradicts itself (free call-out vs API fee; "From Rp 700.000" vs "not tiny walk-ins") (`_raw/04`) |
| O-5.5 | Age & consent policy (legal age for tattooing in Indonesia — no authoritative source found; agent will not guess) | Required for FAQ/age-policy page (`_raw/05`) |
| O-5.6 | Actual service coverage per area; real travel limitations; languages supported | Location pages claim coverage that must be true |
| O-5.7 | Foreign guest artists: work-permit legality position | Flagged as risk in `_raw/05` |

## 6. Content rights & proof

| ID | Question | Why |
|---|---|---|
| O-6.1 | Portfolio photos: whose work, do we have written usage permission, and can each image be attributed to the correct artist? | The same 6 stock photos are currently credited to multiple artists (`_raw/04`) |
| O-6.2 | Testimonials (Sarah Mitchell, Marcus Chen, Emma & Jake): real clients with consent, or invented? | They match mock seed personas — must be removed if not real |
| O-6.3 | Any real reviews anywhere (Google, Fresha, DMs) we may cite, and the process for collecting verifiable reviews going forward | Review proof is table stakes in every competitor SERP; fake markup is never allowed |
| O-6.4 | Healed-work examples and original photography available? | Profile quality threshold + portfolio authenticity |
| O-6.5 | Certifications/training/awards for any artist — with documents | May only be published with evidence |

## 7. Legal / brand risk

| ID | Question | Why |
|---|---|---|
| O-7.1 | Any history, agreement, or dispute with "Inked Up Tattoo Parlour" (Petitenget)? | They have ≤2020 common-law use + 66K IG + GBP (`_raw/08`) |
| O-7.2 | Has "InkedUp"/"Inked Up" been trademark-checked in PDKI/DGIP (class 44)? Should we refer an HKI/IP consultant? | Brand-collision risk assessment; agent gives no legal advice |
| O-7.3 | Any medical/health professional available to review safety & aftercare content before publication? | Health content must be conservative, sourced, and reviewed |

---

**Fastest unblock (answer these 5 first):** O-1.1 (WhatsApp), O-3.1 (canonical host), O-4.1 (GSC), O-4.3 (GBP), O-5.1 (are the artists real). With those five, Week-2 technical repair and honest re-launch can begin immediately.
