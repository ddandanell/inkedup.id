# InkedUp — Local Tattoo Booking Platform

A premium mobile tattoo booking concierge for Bali. This is a fully local, self-contained setup with a React frontend, Node/Express API server, and SQLite database.

## Project Structure

```
.
├── app/                 # React frontend + Express backend
│   ├── src/             # React source code
│   ├── server/          # Express + SQLite backend
│   │   ├── src/
│   │   │   ├── db.ts          # SQLite connection
│   │   │   ├── schema.sql     # Database schema
│   │   │   ├── seed.ts        # Seed script
│   │   │   ├── routes/        # API routes
│   │   │   └── index.ts       # Server entry
│   │   └── data/        # SQLite database file
│   ├── public/          # Static assets
│   └── package.json
├── docs/
│   ├── bluebook/        # InkedUp Blue Book chapters and outlines
│   ├── research/        # Market research and verification notes
│   └── assets/          # Source Word documents
├── plan.md              # Original Blue Book execution plan
├── website-plan.md      # MVP website plan
└── execution-plan.md    # V2 scan, strategy, and change plan
```

## Quick Start

```bash
cd app
npm install
npm run seed       # create and seed the local SQLite database
npm run dev        # start frontend (http://localhost:5173 or http://<your-ip>:5173) + API (http://localhost:3001)
```

## Default Logins

- **Admin:** `admin@inkedup.id` / `admin123`
- **Customer demo:** `customer@example.com` / `customer123`

## Useful Scripts

| Command           | Description                                    |
|-------------------|------------------------------------------------|
| `npm run dev`     | Run Vite dev server (http://localhost:5173) + Express API concurrently |
| `npm run server`  | Run Express API with hot reload (http://localhost:3001) |
| `npm run seed`    | Seed the SQLite database                       |
| `npm run db:reset`| Delete and re-seed the database                |
| `npm run build`   | Build the frontend for production              |

## API

The REST API is available at `http://localhost:3001/api`.

Key endpoints:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/artists`
- `GET /api/studios`
- `GET /api/bookings`
- `GET /api/applications`
- `GET /api/reviews`
- `GET /api/locations`
- `GET /api/content/:slug`
- `GET /api/dashboard`

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, Express, better-sqlite3
- **Database:** SQLite (`app/server/data/inkedup.db`)

## Notes

- All data persists in the local SQLite file.
- WhatsApp CTAs use `wa.me` links; no external WhatsApp API integration is required.
- Images are served as static assets from `app/public/`.

## Deploy

Everything deploys to **one Vercel project**: the Vite frontend is served as static files and
the Express API is wrapped as a single Vercel Function at `app/api/[...path].ts` (catch-all),
mounted under `/api/*`. Data lives in **Neon Postgres** and is queried over the
`@neondatabase/serverless` HTTP driver (no native module, no persistent disk needed), so the
whole app runs on Vercel serverless. The old `better-sqlite3`/Render split is retired.

Project settings (already configured on the Vercel project):

| Setting | Value |
|---|---|
| Root Directory | `app` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `dist` |

`app/vercel.json` configures the Vite build, the SPA fallback rewrite to `index.html`
(`/` and every non-`/api` route), and security/cache headers.

### Environment variables (set on Vercel, never committed)

`DATABASE_URL` is provided automatically by the **Neon↔Vercel integration** (the project is
already linked to the Neon database). The remaining variables are set with the CLI:

```
JWT_SECRET=<32+ char random string>      # production; app throws if unset/weak
ADMIN_EMAIL=admin@inkedup.id
ADMIN_PASSWORD=<strong password>         # required to seed in production
CORS_ORIGIN=https://<your-vercel-domain> # comma-separated list; add your custom domain
```

`VITE_API_URL` is **not** needed: the API is same-origin at `/api`, which the frontend uses
by default (`app/src/services/api.ts`). In local development the Vite proxy forwards `/api`
to the API on `:3001`.

### Seed once (against Neon)

Run from your machine with the Neon connection string (use the **pooled** `DATABASE_URL` from
the integration) and the same admin credentials you set on Vercel:

```
cd app
DATABASE_URL="<pooled Neon URL>" \
NODE_ENV=production \
ADMIN_EMAIL=admin@inkedup.id \
ADMIN_PASSWORD="<strong password>" \
npm run seed
```

The seed creates the schema (idempotent) and inserts demo data. It aborts if the database
already has users; set `ALLOW_RESET=1` to wipe and reseed.

### Verify

- `https://<your-vercel-domain>/api/health` → `{"status":"ok"}`
- `https://<your-vercel-domain>/api/stats` → aggregate counts
- `https://<your-vercel-domain>/api/locations` → 8 Bali locations
- `https://<your-vercel-domain>/` and any deep link (e.g. `/locations`) → the SPA

### Deploy

Push to `main` — the GitHub integration builds from `app/` and promotes to production
automatically. Manual deploy: `cd app && vercel --prod`.

> Note: Vercel Deployment Protection (SSO) may be enabled on this team. If a URL returns a
> 302 login redirect, open it from the Vercel dashboard or generate a share link.

### Production secrets

Never commit real secrets. `JWT_SECRET` and `ADMIN_PASSWORD` throw on startup if unset in
production. Business contact details live in `app/src/data/business.ts` (edit once, used everywhere).
