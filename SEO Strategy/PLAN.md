# InkedUp SEO Overhaul — Orchestrator Plan

Date: 2026-07-17 (WITA, UTC+8)
Site: https://www.inkedup.id/ — InkedUp, premium tattoo booking/concierge platform, Bali
Repo: /Users/openclaw/Downloads/tatooo2 (app = React 19 + Vite SPA + Express API on Vercel serverless, Neon Postgres)

## Governing rules (from owner brief)
- Evidence first: full baseline audit before ANY website modification.
- No invented facts, no placeholder-as-fact, no unverified trust/hygiene/credential claims → OWNER-VERIFY list.
- Google official Search documentation is the standard. No doorway pages, no keyword stuffing, no fake review markup.
- Everything written under /Users/openclaw/Downloads/tatooo2 (baseline docs in SEO Strategy/, raw evidence in SEO Strategy/_raw/).
- Changelog maintained at SEO Strategy/CHANGELOG.md.
- Skill loaded: `seo-audit` (priority order: crawlability → technical → on-page → content → authority; schema detection caveat: curl cannot see JS-injected JSON-LD).

## Stage 1 — Parallel baseline audit swarm (8 coder subagents, read-only + one findings file each)
1. REPO-ARCHITECTURE   → _raw/01-repo-architecture.md   (framework, routing, metadata, sitemap/robots, schema, analytics, business.ts, vercel.json)
2. LIVE-CRAWL          → _raw/02-live-crawl.md          (URL inventory, status/redirects/canonicals, robots vs sitemap domain, soft-404 check, site: index coverage)
3. TECH-PERFORMANCE    → _raw/03-tech-performance.md    (headers, TTFB, compression, bundles, fonts, images, favicon set, OG tags, third-party scripts)
4. CONTENT-TRUST       → _raw/04-content-trust.md       (visible content, thin/placeholder, unverified claims, policies, NAP, business-model clarity)
5. KEYWORD-RESEARCH    → _raw/05-keyword-research.md    (intent-clustered keyword universe, page-type map, priorities)
6. COMPETITORS-CORE    → _raw/06-competitors-core.md    (SERP analysis: core commercial + safety clusters)
7. COMPETITORS-LOCAL   → _raw/07-competitors-local-style.md (SERP analysis: location/style/mobile/villa clusters)
8. BRAND-ENTITY        → _raw/08-brand-entity.md        (branded SERP, name-collision/trademark risk, profile footprint, NAP)

## Stage 2 — Baseline documentation (delegated writers + orchestrator synthesis)
Writers produce from _raw files:
- 01-url-inventory.csv, 03-content-inventory.csv, 07-internal-link-map.csv
- 02-technical-audit.md, 06-structured-data-map.md, 09-analytics-baseline.md
- 04-keyword-map.csv, 05-competitor-analysis.md, 08-trust-gap-analysis.md
Orchestrator writes: 00-executive-summary.md, 10-implementation-backlog.md, CHANGELOG.md

## Stage 3 — Validation gate
Orchestrator reviews all baseline docs against evidence files; fail → refine/redelegate.

## Stage 4 — P0/P1 implementation (only after audit documented)
Smallest safe fixes with local build/render verification; live verification after deploy; changelog updated.
Anything touching legal/health/hygiene/credentials/prices/reviews/ownership claims → blocked until owner verification.

## Deliverables this session
- SEO Strategy/00 … 10 baseline files + CHANGELOG.md (+ _raw evidence)
- P0/P1 fix list with evidence; implementation of safe P0/P1 items if build passes
- OWNER-VERIFY information request list
- Next 5 highest-impact actions + 30-day backlog
