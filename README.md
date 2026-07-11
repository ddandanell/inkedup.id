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
