# InkedUp Price Calculator — Build Plan

**Date:** 2026-07-11
**Scope:** Price side only. Nothing else on the site changes.
**Status:** Research complete, ready to build on approval.

---

## 1. What you asked for, in one sentence

Replace today's hardcoded price page with an adjustable pricing engine: you control every price, multiplier, minimum, and zone fee from the admin panel, and customers get a live, professional quote calculator — without touching any other part of the site.

---

## 2. What your research spec got right — and what needs correcting

Your pasted spec (`InkedUp Interactive Tattoo Placement & Pricing Tool`) is ~90% usable. The market logic, the formula, the override rules, and the admin-versioning idea are all sound and are adopted as-is. Four things in it are stale or oversized for the goal "a lot more control, looks 100x better":

| # | Spec says | Reality today | Correction |
|---|-----------|---------------|------------|
| 1 | SQLite database, migrate later | Already migrated to **Neon Postgres** via `@neondatabase/serverless`, running in production | Build straight on Postgres. Schema adapts cleanly (JSON-as-TEXT stays) |
| 2 | Frontend on Vercel + backend on Render | **Everything is one Vercel project** — Express runs as a single Vercel Function behind `/api/*` | No Render, no second deploy. New routes ship in the same function |
| 3 | Konva canvas body map from day one | The engine only ever consumes `placement_region`, `width_cm`, `height_cm` — all capturable with a dropdown + two number fields | **Defer Konva.** Ship the full engine + admin control + calculator first (Phase 1). Add the clickable SVG body map later (Phase 2) as a pure UI upgrade writing to the same columns — zero rework |
| 4 | Minimum price Rp 500k–1M | You are a **villa concierge**. The only mobile competitor in Bali charges a Rp 2.5M minimum; studio smalls start at Rp 500k | Set the floor at **Rp 2,000,000** — premium, still undercuts the competitor, and stops the calculator from quoting studio-grade prices for a private villa visit |

Everything else in the spec (rule-chain engine, snapshot versions, override rules, Cloudinary signed uploads, ±15% range display) is validated and kept.

---

## 3. Market research summary (why the numbers are what they are)

- **Competitor calculator analysed** (tattoostudiopro.com): instant recalculation with no "calculate" button, style chips, colour ×1.4, output as a ±15% range, floored at a shop minimum. Its gaps — no placement input, no travel cost — are exactly our differentiation: **placement + villa transport are our two extra inputs.**
- **Bali price benchmarks:** studio smalls Rp 500k–1.5M · Canggu/Ubud mediums Rp 3–5M · larges Rp 6M+ · full sleeves Rp 25–36M · hourly Rp 1–1.7M · the single mobile/villa competitor: **Rp 2.5M minimum**.
- **Conclusion:** a base-per-area × multipliers model with a Rp 2M floor produces quotes that land inside the Bali premium band at every size, e.g. a detailed half-forearm piece ≈ Rp 5–7M, a full sleeve project ≈ Rp 20–25M — premium but credible next to Canggu studio rates, justified by the villa service.

---

## 4. Final price model (the numbers the engine ships with)

All values are starting defaults — every one of them is editable in the admin panel.

**Base price per body area** (price of a small reference piece, ~10–30 cm²):

| Difficulty | Areas | Base |
|---|---|---|
| Standard | forearm, upper arm, shoulder, calf, thigh, hip, wrist, ankle | Rp 800k–1.2M |
| Moderate | chest, stomach, hand, foot, knee, upper/lower back | Rp 1.2M–1.5M |
| Hard | ribs, neck, buttocks, full back | Rp 1.5M–3M |
| Expert | head | Rp 2M–3M |

**Multipliers:**

| Factor | Values |
|---|---|
| Size (from width × height cm²) | XS ≤10cm² ×1.0 · S ≤30 ×1.3 · M ≤80 ×1.8 · L ≤180 ×2.5 · XL ≤350 ×3.5 · Major 350+ ×5.0 |
| Style | minimalist/fine-line/lettering ×1.0 · traditional/blackwork/tribal ×1.1 · neo-trad/geometric/dotwork ×1.2 · japanese/watercolour/ornamental ×1.3 · realism ×1.5 · portrait ×1.6 |
| Detail | simple ×1.0 · medium ×1.3 · detailed ×1.6 · highly detailed ×2.0 |
| Colour | black & grey ×1.0 · limited ×1.1 · full ×1.25 |
| Condition | new ×1.0 · extension ×1.1 · correction ×1.3 · cover-up ×1.4 (min Rp 3M) · scar ×1.5 (min Rp 3M) |
| Transport zone | Zone A (Seminyak/Canggu/Kuta/Umalas) +0 · Zone B (Ubud/Sanur/Uluwatu/Nusa Dua…) +Rp 100–150k · Zone C (Sidemen/Amed/Lovina/Munduk) +Rp 250k — **reuses the existing `locations.zone` + `call_out_fee` data, no duplication** |

**Output rules:** minimum floor Rp 2,000,000 · round to nearest Rp 50,000 · display ±15% range · suggested 10% deposit shown (matches the site's existing deposit policy) · estimated session time shown (~8 min per square inch + setup).

**Worked example:** forearm (base 1.0M) × medium size 1.8 × detailed 1.6 × realism 1.5 × black/grey 1.0 = Rp 4,320,000 → rounded 4,350,000 → displayed **Rp 3,700,000 – 5,000,000** + zone fee.

---

## 5. Architecture — isolation-first, add-only

```
NEW server/src/pricing/         currency.ts · calculator.ts · types.ts · versionResolver.ts
NEW server/src/routes/pricing.ts   GET /api/pricing/config · POST /api/pricing/calculate (public)
NEW server/src/routes/quotes.ts    POST /api/quotes (public) · admin quote list/detail/status
NEW server/src/routes/admin-pricing.ts  version CRUD + publish (admin JWT)
NEW server/src/seed-pricing.ts     idempotent seed: tables + default published version + regions
NEW app/src/pages/Quote.tsx        customer calculator (/quote)
NEW app/src/pages/AdminPricing.tsx version editor + live test calculator + publish (/admin/pricing)
NEW app/src/pages/AdminQuotes.tsx  quote inbox + detail (/admin/quotes)

TOUCHED (3 small edits, nothing else):
  app/server/src/app.ts     mount 3 new routers
  app/server/src/schema.ts  append new CREATE TABLE IF NOT EXISTS blocks
  app/src/App.tsx           lazy-import 3 pages + nav link "Price Calculator"

NOT TOUCHED: Pricing.tsx (current /pricing page stays live until you say otherwise),
  bookings, artists, locations, auth, hero, everything else.
```

### Database (new tables only, idempotent DDL, JSON-as-TEXT per project convention)

- **`pricing_versions`** — one row = one complete pricing snapshot (all bases, multipliers, minimums, rounding, overrides as JSON). Status `draft` → `published` → `archived`. Only one `published` at a time. Publishing never changes already-sent quotes — they carry their own frozen copy.
- **`body_regions`** — id, name, view, base_price, difficulty_multiplier, min_price, plus an empty `svg_path` column so Phase 2's clickable map is a data fill-in, not a migration.
- **`quotes`** — customer contact, `placement_region`, `width_cm`, `height_cm`, `area_cm2` as **first-class columns** (so the Phase 2 map writes the same fields), style/detail/colour/condition, zone, frozen price breakdown, status workflow (submitted → reviewed → accepted/rejected).

### Engine (`server/src/pricing/calculator.ts`)

Rule-chain exactly per your spec: base × size × detail × style × colour × placement × condition → pre/post overrides (flat-rate projects, cover-up floors) → + transport → floor → round → range. **Integer-only IDR math**, round once at the end, server is the single authority; the browser shows an instant preview using a client mirror of the same formula fed by the published config.

### Frontend

- **`/quote`** — stepper: ① area (chips, grouped by body zone) ② size (slider + width/height cm) ③ style ④ detail ⑤ colour ⑥ condition ⑦ location zone → live price card with range, deposit, session time → "Request this quote on WhatsApp" CTA (uses existing `waLink`) + optional email-quote form.
- **`/admin/pricing`** — version list, full editor (every base/multiplier/minimum/zone), **live test calculator** (try any combination before publishing), publish with confirmation ("affects new quotes only").
- **`/admin/quotes`** — filterable table + detail view with full price breakdown.

---

## 6. Phasing & effort

| Phase | Content | Effort | You get |
|---|---|---|---|
| **1** | Tables + seed, engine, public+admin APIs, `/quote` calculator (region dropdown), `/admin/pricing` + `/admin/quotes`, deploy | ~1 week | **Full control. Every number adjustable. Calculator live.** Nothing else on the site touched |
| **2** | Clickable SVG body map (front/back, ~30 regions) replacing the dropdown; optional Konva coverage-drawing (lazy-loaded, +94 KB only on `/quote`) | ~1 week | The visual "wow" — same data, same engine |
| **3** | Cloudinary signed uploads for reference images on the quote form | ~2 days | Real image uploads (needs a free Cloudinary account — prerequisite) |

**Recommendation: approve Phase 1 now.** It alone delivers the goal — "adjustable, 100x better, full control" — and Phases 2–3 bolt on later with zero rework because the data model already reserves their columns.

---

## 7. Known gotchas (engineered around, listed for the record)

- **Money is INTEGER (int4) IDR everywhere.** Neon's driver returns BIGINT as strings → concatenation bugs; int4 avoids it.
- **Float artifacts:** `750000 × 1.1 = 825000.0000000001` — engine multiplies then rounds per step, rounds to Rp 50,000 exactly once at the end.
- **`Intl.NumberFormat('id-ID')` output contains a non-breaking space** (U+00A0) — sanitized before building WhatsApp messages; formatted strings are never parsed back into numbers.
- **Mobile scroll:** when Phase 2 adds the canvas, the map container needs `touch-action: none` so dragging a shape doesn't scroll the page.
- **Deploy:** seed runs once against the pooled Neon URL (same pattern as the original seed, `ALLOW_RESET` guard kept off); then one `git push` → Vercel builds frontend + function together.

---

## 8. Prerequisites

- Phase 1: none — builds entirely on the live Neon + Vercel setup.
- Phase 3: a free Cloudinary account (cloud name + API key/secret into Vercel env vars).

---

*Approval needed: (a) Phase 1 go-ahead, (b) confirm `/quote` as a new page alongside the existing `/pricing` (recommended) vs. replacing it, (c) confirm the Rp 2,000,000 floor.*

---

## Phase 1 — As Built (2026-07-11)

Scope was narrowed on approval: **this is a read-only price calculator, not a quote system** — so no quotes table, no submission flow, no admin inbox. What shipped:

- **DB:** single new table `pricing_versions` (additive, idempotent DDL in `schema.ts`). Default version "Default 2026 Pricing" seeded as `published` into production Neon via `npm run seed:pricing` (idempotent).
- **Engine:** `server/src/pricing/` (types, currency, calculator, defaults, versionResolver) — integer-IDR rule-chain exactly as specced, minus the quotes/override-rule extras.
- **API:** `GET /api/pricing` (config + transport zones from the existing `locations` table), `POST /api/pricing/calculate`, and admin-only `/api/admin/pricing/*` (versions CRUD, publish, draft-test calculate).
- **Frontend:** `/price-calculator` (public, sticky live estimate via the client mirror `src/lib/pricing.ts`, WhatsApp CTA, project presets), `/admin/pricing` (version editor + live test calculator + publish workflow), `<Toaster/>` mounted in `main.tsx`, nav links in `Navbar` + `AdminLayout`.
- **Verified:** `tsc -b` + `vite build` green; all 16 routes 200; engine spot-checks (Rp 2M floor, Rp 3M cover-up floor, +Rp 250k zone-3 fee, 50k rounding); headless-Chrome render + click-through of both pages with zero console errors.

Deferred unchanged: Phase 2 (clickable SVG body map / Konva) and Phase 3 (Cloudinary uploads). The data model reserves nothing for them now — they bolt on as pure UI additions later.
