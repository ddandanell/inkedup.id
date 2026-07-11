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

The frontend and API deploy **separately**, because the API uses `better-sqlite3` with a
writable local file — that needs a persistent disk, which Vercel's serverless platform does
not provide. So: **Vercel serves the frontend, Render/Railway runs the API.**

### 1) Backend API → Render (or Railway)

Render Web Service settings:

| Setting | Value |
|---|---|
| Root Directory | `app` |
| Build Command | `npm install` |
| Start Command | `npm run server:once` |
| Persistent Disk | 1 GB, mount path `/opt/render/project/src/app/server/data` |

Environment variables:

```
NODE_ENV=production
JWT_SECRET=<32+ char random string>
ADMIN_EMAIL=admin@inkedup.id
ADMIN_PASSWORD=<strong password>
CORS_ORIGIN=https://<your-vercel-app>.vercel.app
```

After first deploy, seed once from the Render shell: `npm run seed`.
Verify: `https://<api-host>/api/health` returns `{"status":"ok"}`.

> Railway works the same way — attach a volume at `app/server/data` and set the same env vars.

### 2) Frontend → Vercel

Import the repo and set **Root Directory = `app`**. `app/vercel.json` already configures the
Vite build, the SPA fallback rewrite to `index.html`, and security/cache headers.

Environment variable:

```
VITE_API_URL=https://<api-host>/api
```

Then deploy. The frontend calls the API at `VITE_API_URL` in production and uses the local
Vite proxy (`/api` → `:3001`) in development.

### 3) Tie them together

- Set backend `CORS_ORIGIN` to the final Vercel domain (add your custom domain too, comma-separated).
- Set frontend `VITE_API_URL` to the backend host + `/api`.
- Redeploy the backend after changing `CORS_ORIGIN`.

### Production secrets

Never commit real secrets. `JWT_SECRET` and `ADMIN_PASSWORD` throw on startup if unset in
production. Business contact details live in `app/src/data/business.ts` (edit once, used everywhere).
