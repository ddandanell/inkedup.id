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

## 🔄 In Progress

- **First large scrape**: 1,000+ images from Wikimedia Commons (running in background).
  - Current observed collection rate: ~800+ unique images across 30 queries.
  - Re-run with additional queries if the first pass falls short of 1,000.

## 📋 Remaining / Next Steps

1. **Verify scrape result**
   - Count rows in `inspiration_images`.
   - Check `status='approved'` count.
   - Inspect sample images for quality and correct attribution.

2. **Reach 1,000+ if needed**
   - Add more Wikimedia queries (body parts, national styles, artist names).
   - Or enable fallback adapters:
     - **Flickr API** — needs API key; search CC-licensed photos.
     - **Pexels API** — needs API key; tattoo/lifestyle photos.
     - **Pixabay API** — needs API key; illustration/photo mix.
     - **Unsplash API** — needs API key; high-quality lifestyle shots.
   - Add API keys to `.env`:
     ```
     FLICKR_API_KEY=...
     PEXELS_API_KEY=...
     PIXABAY_API_KEY=...
     UNSPLASH_ACCESS_KEY=...
     ```

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
