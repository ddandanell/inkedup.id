# InkedUp MVP Website — Complete Build Plan
## Domain: find-tattoo-artists.id

---

## Architecture Overview

### Frontend (React + TypeScript + Tailwind + shadcn/ui)
**Customer Site:**
- Homepage (hero, trust badges, how it works, featured artists, safety, locations, FAQ)
- Artists page (browse all verified artists with filters)
- Artist profile page (portfolio, bio, reviews, book button)
- Booking page (lead capture form — style, size, placement, location, date)
- Locations pages (Canggu, Seminyak, Uluwatu, Ubud, etc.)
- Safety page
- Pricing page
- FAQ page
- Contact page

**Artist Portal:**
- Artist login/register
- Profile builder (photos, bio, skills, styles, certifications)
- Availability calendar
- Booking requests (see leads assigned to them)
- Earnings dashboard

**Admin Dashboard:**
- Login
- Artist applications (approve/reject/pending)
- All booking leads (view, assign, status tracking)
- Artist management (edit profiles, deactivate)
- Commission tracking (10% booking fees)
- WhatsApp notification triggers
- Analytics (bookings, revenue, conversion)

### Backend (Simulated with React State + LocalStorage for MVP)
- Artist data store
- Booking leads store
- Admin authentication
- Commission tracking
- Status workflows

### Key Business Rules
1. Artist applies → Status: PENDING → Admin approves → Status: ACTIVE
2. Customer submits booking → Status: NEW LEAD → Admin reviews → Assigns artist → Status: MATCHED → Customer pays 10% → Status: CONFIRMED
3. Platform handles ALL communication — artists never see customer contacts until confirmed
4. 10% booking fee collected at confirmation
5. WhatsApp integration for notifications

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router (multi-page SPA)
- Framer Motion (animations)
- Lucide React (icons)
- LocalStorage persistence (MVP — no backend server needed)
