# InkedUp Tattoo Inspiration Library — Workflow & Roadmap

A structured, legally safe system for building a 1,000+ image tattoo inspiration gallery.

## ✅ Done

1. **Architecture & data model**
   - `inspiration_images` table with tags, styles, placement, license, attribution, source URL.
   - Unique index on `(source, source_id)` for deduplication.
   - Check constraint on `source` allowing `wikimedia`, `openverse`, `flickr`, `pexels`, `pixabay`, `unsplash`, `artist_upload`, `ai_generated`.

2. **Wikimedia Commons scraper**
   - File: `app/server/src/services/inspiration/wikimedia.ts`
   - Filters to commercial-friendly licenses: CC0, PDM, CC BY, CC BY-SA.
   - Auto-infers tattoo styles and body placements.
   - Saves creator name, creator URL, license, license URL, source URL.
   - 30+ search queries covering styles + placements.

3. **Ingestion pipeline**
   - Script: `app/server/src/scripts/scrape-inspiration.ts`
   - `--target=N` and `--source=wikimedia` CLI args.
   - Deduplicates before insert, skips already-stored images.
   - Auto-approves scraped images so they appear immediately.

4. **API & frontend**
   - `GET /api/inspiration` — list approved images with style/search filters.
   - `GET /api/inspiration/styles` — distinct styles with counts.
   - `Inspiration.tsx` fetches from API, shows attribution + license on hover.

5. **Pushed & deployed**
   - Committed to `main` and pushed to GitHub.
   - Vercel production deployment ready.

## ✅ Scrape Result

- **Wikimedia Commons first large scrape**: **1,142 approved images** across 14 inferred styles.
  - Source: `wikimedia` only.
  - All images use commercial-friendly licenses (CC0, PDM, CC BY, CC BY-SA).
  - Live gallery: `https://www.inkedup.id/inspiration`

## 📋 Remaining / Next Steps

1. **Quality & moderation**
   - Add admin review UI for `pending` images.
   - Allow flagging / removing images on artist request.
   - Filter out non-tattoo results (some Wikimedia results are signs/flash only).

2. **Image hosting / performance**
   - Currently hotlinks to Wikimedia image URLs.
   - For production scale, mirror images to Vercel Blob / S3 / Cloudflare R2.
   - Add WebP conversion + responsive sizes.

3. **Additional sources (optional)**
   - Pexels adapter is already built (`app/server/src/services/inspiration/pexels.ts`).
   - To enable, add `PEXELS_API_KEY` to `.env` and run:
     ```bash
     npx tsx server/src/scripts/scrape-inspiration.ts --target=500 --source=all
     ```
   - Other options if you want more volume:
     - **Flickr API** — `FLICKR_API_KEY=...`
     - **Pixabay API** — `PIXABAY_API_KEY=...`
     - **Unsplash API** — `UNSPLASH_ACCESS_KEY=...`

3. **Image hosting / performance**
   - Currently hotlinks to Wikimedia image URLs.
   - For production scale, mirror images to Vercel Blob / S3 / Cloudflare R2.
   - Add WebP conversion + responsive sizes.

4. **Quality & moderation**
   - Add admin review UI for `pending` images.
   - Allow flagging / removing images on artist request.
   - Filter out non-tattoo results (some Wikimedia results are signs/flash only).

5. **Artist-uploaded content (highest priority long-term)**
   - Let studios/artists upload their own portfolio.
   - Confirm rights via checkbox + terms.
   - Use these as the primary trusted library.

6. **AI-generated inspiration (optional)**
   - Generate original concept art per style.
   - Label clearly: "AI-generated concept — final artwork by your artist."

7. **Pinterest compliance**
   - Do **not** scrape Pinterest images.
   - Allow users to paste Pinterest URLs as references in booking enquiries.
   - Link to curated Pinterest searches if useful.

## 🚀 How to run the scraper

```bash
cd app
npx tsx server/src/scripts/scrape-inspiration.ts --target=1000 --source=wikimedia
```

Dry run:

```bash
npx tsx server/src/scripts/scrape-inspiration.ts --dry-run --target=50 --source=wikimedia
```

## 📁 Key files

- `app/server/src/schema.ts` — database schema.
- `app/server/src/services/inspiration/wikimedia.ts` — Wikimedia adapter.
- `app/server/src/services/inspiration/openverse.ts` — Openverse adapter (currently blocked by Cloudflare).
- `app/server/src/scripts/scrape-inspiration.ts` — scraper orchestrator.
- `app/server/src/routes/inspiration.ts` — API routes.
- `app/src/pages/Inspiration.tsx` — gallery UI.
