# InkedUp V2 — Full Scan, Strategy & Execution Plan

## PHASE 1 SCAN RESULTS

### What Exists (and works well)
- React 19 + TypeScript + Tailwind + shadcn/ui base
- 17 pages implemented, ~10,825 lines of code
- LocalStorage data layer with artists, bookings, applications
- Admin dashboard with KPIs, artist management, bookings, commissions
- Artist portal with apply, dashboard, profile builder
- Brand design system (Midnight Navy, Champagne Gold, Warm Ivory)
- WhatsApp CTA, filterable artist gallery, multi-step booking form

### What's WRONG (Critical Gaps)
1. **No Studio model** — Artists are standalone. No concept of studio they belong to.
2. **Currency is USD** — Should be Indonesian Rupiah (IDR)
3. **No Inspiration Gallery** — Missing entirely
4. **No Studios page** — Can't browse studios
5. **No How It Works page** — Only anchor link on homepage
6. **Navigation incomplete** — Missing Studios, Inspiration, Apply as Studio
7. **No WhatsApp tracking** — Static links, no dynamic context
8. **No sharing features** — Can't share profiles
9. **No review system** — No customer reviews
10. **Footer is basic** — Missing required links
11. **No favicon/logo icon** — Just text "INKEDUP"
12. **No SEO metadata** — No meta tags, schema
13. **Artist names are full names** — Should be first name + studio
14. **No 10% discount messaging** — Still shows old fee model
15. **No mobile tattoo service explanation** — Core differentiator not clear

---

## PHASE 2: STRATEGY

### Recommended Business Model: Studio Partner + Mobile Concierge Hybrid

**What we sell:** A managed tattoo booking service for tourists/expats in Bali/Indonesia
**Who we sell to:** Tourists, villa guests, retreat groups, event organizers, digital nomads
**Why customers book through us:**
- 10% OFF studio price (not a fee — a discount)
- English-speaking support
- Verified studio-backed artists (not random freelancers)
- Mobile tattoo to villa/hotel when safe
- We handle communication, matching, booking, deposit, follow-up
- Safety verification — we inspect studios personally

**Why studios work with us:**
- Qualified leads (English-speaking, pre-qualified customers)
- Marketing exposure
- No upfront cost
- Simple lead handoff

**Anti-bypass strategy:**
- We control the WhatsApp support flow (not direct studio contact)
- 10% discount ONLY through platform (incentive to book through us)
- We handle deposit collection (studio gets paid after service)
- We add value through support, not just directory listing
- Artist profiles don't expose direct studio contact details

**MVP monetization:**
- 10% commission from confirmed bookings (built into the discount model)
- Customer pays through us at 10% less than studio price
- We keep the 10% as our fee
- Studio gets the rest
- Simple, clean, easy to explain

---

## PHASE 3: CHANGE PLAN (Grouped by Priority)

### Group A: Data Layer & Foundation (Critical)
- Add Studio model, types, store functions
- Restructure artists to belong to studios  
- Convert all pricing to IDR
- Add inspiration gallery data
- Add review data
- Add location page data
- Add WhatsApp message templates

### Group B: Customer-Facing Pages (Critical)
- NEW: Studios page (/studios)
- NEW: Studio profile page (/studios/:slug)
- NEW: Inspiration Gallery page (/inspiration)
- NEW: How It Works page (/how-it-works)
- UPDATE: Homepage (add studio messaging, 10% discount, mobile service, trust)
- UPDATE: Artist profile (first name only, show studio, WhatsApp dynamic)
- UPDATE: Navigation (add Studios, Inspiration, Apply as Studio)
- UPDATE: Footer (complete with all required links)
- UPDATE: Pricing page (IDR, 10% discount messaging)
- UPDATE: Safety page (studio verification messaging)
- UPDATE: Locations (more content per location)

### Group C: Admin & Backend (Critical)
- UPDATE: Admin dashboard (add studio management, reviews)
- UPDATE: Admin artists (studio association)
- NEW: Admin studio management
- NEW: Admin inspiration gallery management
- NEW: Admin review moderation
- UPDATE: Admin bookings (studio-aware)

### Group D: Shared Components & Polish
- UPDATE: Navbar (new nav items, logo icon)
- UPDATE: WhatsApp button (dynamic messages)
- UPDATE: SEO metadata (titles, descriptions, OG)
- UPDATE: Favicon and branding
- NEW: Share buttons component
- NEW: Review component

---

## PHASE 4: EXECUTION

### Agent Assignments:
1. **Data_Foundation_Agent** — Complete data layer overhaul (Group A)
2. **Customer_Pages_Agent** — All new and updated customer pages (Group B)
3. **Admin_Upgrade_Agent** — Admin panel upgrades (Group C)
4. **Shared_Components_Agent** — Navbar, footer, SEO, branding, WhatsApp (Group D)

All agents branch from master, work in parallel, then octopus merge.
