# BRAND-ENTITY — Baseline Findings
Date: 2026-07-17 | Scope: Brand identity, entity-confusion risk, branded-SERP ownership, and off-site profile footprint for InkedUp (inkedup.id), Bali tattoo booking/concierge | Method: WebSearch (5 branded queries), curl against live site/Instagram/TikTok/Facebook/YouTube/Google Maps/Bing/DuckDuckGo/GitHub, Read+Grep of repo (`app/index.html`, `app/src/data/business.ts`, `app/src/**`, `app/vercel.json`)

## Evidence collected (commands/URLs/files inspected, with key outputs)

**Repo (read-only inspection)**
- `app/src/data/business.ts` (lines 7–25): single source of truth for NAP — name `InkedUp`, legalName `InkedUp Bali` (comment: `// TODO: registered entity name`), WhatsApp `6281234567890` (`// TODO: real concierge WhatsApp number`), email `hello@inkedup.id` (`// TODO`), hours `Every day, 8:00 AM – 8:00 PM (WITA)` (`// TODO: confirm`), area `Canggu, Bali, Indonesia`, instagram `https://instagram.com/inkedup.bali` (`// TODO`), tiktok `https://tiktok.com/@inkedup.bali` (`// TODO`).
- `app/index.html` (lines 31–62): ships a `TattooParlor` JSON-LD with `"telephone": "+62-812-3456-7890"` (the placeholder number), `"legalName": "InkedUp Bali"`, `"sameAs": ["https://instagram.com/inkedup.bali", "https://tiktok.com/@inkedup.bali"]`. Canonical + og:url = `https://inkedup.id/` (non-www); `og:site_name` = `InkedUp`.
- Live check `curl -sL https://www.inkedup.id/` (200, 3,511 bytes) returns byte-equivalent head including the same JSON-LD — production is serving the placeholder data.
- `curl -sI https://inkedup.id/` → `308 -> https://www.inkedup.id/` (apex redirects to www, while canonical/og/schema URL/robots-Sitemap all say non-www).
- `Grep "InkedUp|Inked Up|INKEDUP" app/src`: brand string used consistently as `InkedUp` (Navbar/AdminLayout render caps `INKEDUP`, stylistic). 152 matches; no conflicting spellings.
- `app/src/data/mockData.ts` lines 183–190, 298: mock studios/admins with `@inkedup.id` emails and sequential fake phone numbers.

**Branded SERPs (WebSearch = Kimi web search; Bing via curl; DuckDuckGo Lite via curl)**
- Query `"InkedUp"` → page 1–2: #inkedup hashtag pages (#inkedup = **8,853,060 Instagram posts** per best-hashtags.com), `inkedupsouthampton.com` ("Inked Up Tattoo Studio", Southampton UK, 447 Millbrook Road West), `inkedupchester.co.uk` ("Inked Up Chester"), Dribbble designer "InkedUp" (Bangladesh), `inkedupsocial.com` (AI social-media SaaS). **inkedup.id absent.**
- Query `InkedUp Bali tattoo` / `"Inked Up" tattoo Bali parlour Badung Instagram` → "Inked Up Tattoo Parlour" (Badung, Bali) via tattooswizard.com, tattoo.guide, balibuddies.com ("Bali's Best Tattoo Studios In 2026", dated 2026-06-29), balidoneright.com, sanctuarybali.com. **inkedup.id absent.**
- Query `"inkedup.id"` → WebSearch: no result for the domain. DuckDuckGo Lite `q=inkedup.id`: **only** results are `GitHub - ddandanell/inkedup.id`, its Releases and README pages.
- Query `"InkedUp" OR "inkedup.id" Bali tattoo concierge Canggu booking` → competitors cangguinkclub.com, finelinetattoobali.com; **inkedup.id absent.**
- Query `"inkedup.id" OR "InkedUp Bali" Instagram Facebook LinkedIn` → no InkedUp Bali profile on any platform; only unrelated entities.
- Bing (`curl "https://www.bing.com/search?q=%22InkedUp%22+Bali+tattoo"`, 72,979-byte result page): **zero occurrences of `inkedup.id`** outside the echoed query string.
- DuckDuckGo Lite `q=Inked+Up+tattoo+Bali` — decoded destination URLs, top 10 ALL belong to the collision entity: instagram.com/inkeduptattoobali (x2), facebook.com/InkedUpTattooParlour (x2), balibuddies.com, balidoneright.com, tattoo.guide, tattooswizard.com, youtube.com/@inkeduptattooparlourbali, sanctuarybali.com. **inkedup.id absent.** DDG `q="inkedup.bali"` and `q=InkedUp+Canggu+google+maps` → zero results. DDG `q=site:inkedup.id` → no results captured.

**Collision business — profile verification (live fetches 2026-07-17)**
- Instagram `curl https://www.instagram.com/inkeduptattoobali/` → og:title `INKED UP TATTOO PARLOUR BALI 🇮🇩🇦🇺 (@inkeduptattoobali)`, og:description: **"66K Followers, 1,690 Following, 3,050 Posts"**.
- Facebook `curl https://www.facebook.com/InkedUpTattooParlour/` → og:title "Inked Up Tattoo Parlour | Denpasar" (public page; FB handle is literally **InkedUpTattooParlour**). FB post found marketing "BALI'S FIRST PAIN-FREE TATTOO experience".
- YouTube `curl https://www.youtube.com/@inkeduptattooparlourbali` → title "Inked Up Tattoo Parlour - YouTube" (channel exists).
- Google Business Profile: Bali Buddies links `https://maps.app.goo.gl/DkC3oQQQGWY4w7su7` → 302 resolves to `google.com/maps/place/Inked+Up+Tattoo+Parlour/@-8.677219,115.1515847,17z/...!16s%2Fg%2F11gvzkqbbf` — **GBP exists** (Petitenget, Kerobokan Kelod, Kuta Utara, Badung).
- Address (balibuddies.com + tattoo.guide): Jl. Petitenget, Kerobokan Kelod, Kec. Kuta Utara, Badung, Bali.
- Domain `inkeduptattooparlour.com` → 200 but 1,100-byte parked-domain shell (generic title, `tr_uuid` tracking param). Their "Official Website" per Bali Buddies = their Instagram. They are an Instagram/GBP-first business.
- tattooswizard.com profile (2020-03-05): "international standard tattoo studio… black & gray and realism… over 55k followers… free airport pick-up".

**Client (InkedUp) profile footprint**
- Instagram `curl https://www.instagram.com/inkedup.bali/` → 200 but generic `<title>Instagram</title>`, **no og:title/og:description profile metadata** (contrast: collision profile returned rich metadata in the identical request). DDG `"inkedup.bali"` → zero results. Handle appears nonexistent/unclaimed/empty (see UNVERIFIED note).
- TikTok `curl https://www.tiktok.com/@inkedup.bali` → 200 but 1,462-byte SlardarWAF challenge page — content UNVERIFIED.
- Facebook / LinkedIn / TripAdvisor: no findable presence via WebSearch or DDG.
- GBP for "InkedUp": Maps search HTML is JS-rendered (165KB shell, zero place names server-side) → UNVERIFIED; no evidence of a listing via any search engine.
- GitHub `curl https://github.com/ddandanell/inkedup.id` → **200, public repository**, title "GitHub - ddandanell/inkedup.id"; it is the top DuckDuckGo result for the query `inkedup.id`.

## Findings (numbered; each: finding, evidence, SEO impact, recommended fix, priority P0–P3)

1. **inkedup.id owns 0% of its own branded SERP on every engine checked.** Evidence: WebSearch queries `"InkedUp"`, `InkedUp Bali tattoo`, `"inkedup.id"`, `"InkedUp" OR "inkedup.id" Bali tattoo concierge Canggu booking`; Bing result page with zero `inkedup.id` occurrences; DDG top-10 for `Inked Up tattoo Bali`. SEO impact: all branded demand — the highest-converting traffic a local service business has — currently flows to a same-name competitor or unrelated entities; Google has no entity signal connecting the string "InkedUp" to inkedup.id. Recommended fix: execute the entity-consolidation plan in §Recommendations (GBP + claimed social profiles + consistent "InkedUp Bali" naming + listicle/press citations); re-test branded SERP monthly. **P0**

2. **Confirmed name-collision with an established, same-niche, same-island business: "Inked Up Tattoo Parlour"** (Jl. Petitenget, Kerobokan Kelod, Kuta Utara, Badung, Bali). Evidence: IG @inkeduptattoobali 66K followers/3,050 posts (og:description, fetched 2026-07-17); FB page "Inked Up Tattoo Parlour | Denpasar" (vanity handle `InkedUpTattooParlour` — a zero-space exact match to the client's brand); YouTube @inkeduptattooparlourbali; GBP Maps listing (place id `0x2dd24752f2197ed7:0x7e803ee171e19cdd`); directory listings (tattoo.guide 2026-04-27, tattooswizard) and press (balibuddies 2026-06-29, balidoneright, sanctuarybali). Similarity assessment: name differs only by a space + generic suffix ("Tattoo Parlour"); same industry, same island, overlapping service areas (Petitenget/Seminyak is inside inkedup.id's areaServed). Google's entity systems currently have rich corroboration for the Parlour and none for InkedUp — disambiguation will fail in the Parlour's favor by default. SEO impact: brand SERP capture, knowledge-panel misattribution risk, review misattribution risk, user confusion at booking time. Recommended fix: differentiate via the "mobile tattoo concierge" category everywhere (schema description, GBP category/attributes, copy); always pair brand with geo/category qualifier "InkedUp Bali — mobile tattoo concierge"; build a distinct corroborated entity (see §Recommendations). **P0**

3. **Production structured data publishes a fake phone number and unverified identity.** Evidence: `app/index.html:31–62` and live homepage JSON-LD: `telephone: +62-812-3456-7890`, `legalName: "InkedUp Bali"` — both explicit TODO placeholders in `app/src/data/business.ts:9,12–16`. SEO impact: factually wrong LocalBusiness/TattooParlor data undermines Google's trust in the whole entity graph (NAP consistency is a core local/entity signal); a visibly fake number also fails real users. Recommended fix: replace all placeholders in `business.ts` with verified values before any further SEO work; if a value isn't confirmed yet, remove the field from schema rather than publish a placeholder. **P1** (missing/incorrect business identity)

4. **schema `sameAs` + site footer point to social profiles that appear not to exist.** Evidence: JSON-LD sameAs → `instagram.com/inkedup.bali`, `tiktok.com/@inkedup.bali` (also `app/src/components/Footer.tsx:126–157`); IG fetch returned no profile metadata; DDG `"inkedup.bali"` zero results; both marked `// TODO` in `business.ts:23–24`. SEO impact: `sameAs` is how Google corroborates an entity — pointing it at dead/nonexistent URLs corroborates nothing and can associate the entity with a squatted handle later; broken social links also leak users off-site to a login wall. Recommended fix: claim/create the handles first, then keep sameAs only for live, verified profiles; remove or correct links until then. **P1**

5. **No findable Google Business Profile for InkedUp; the collision business has a confirmed one.** Evidence: §Evidence (Maps search shell JS-rendered — no listing discoverable; zero search-engine evidence) vs collision GBP shortlink resolution. SEO impact: for a Bali local-services brand, GBP is the single strongest entity anchor (knowledge panel, Maps, reviews). Without it, Google has almost nothing to build an InkedUp entity from, while the Parlour's entity grows. Recommended fix: create/claim GBP as a **Service-Area Business** (mobile concierge → hide street address, set service areas Canggu/Seminyak/Kuta/Uluwatu/Ubud/Sanur to mirror `areaServed`), name it exactly "InkedUp Bali", category tattoo shop/artist, verify via the real WhatsApp; begin review acquisition. **P1** — UNVERIFIED whether an unclaimed/auto-generated GBP already exists (needs browser + owner).

6. **Public GitHub repo `ddandanell/inkedup.id` is the top branded result for the exact domain query and outranks the website.** Evidence: DDG `q=inkedup.id` results (GitHub repo, Releases, README only); `curl` repo page → 200 public. SEO impact: brand-SERP pollution on the purest branded query; repo exposes full source incl. mock data with internal email patterns (`kadek@inkedup.id`…, `admin@inkedup.id`) and TODO placeholders — reputationally and operationally sloppy; potential secret exposure not assessable read-only from outside. Recommended fix: make the repo private (or rename it away from the exact domain); audit history for secrets; afterwards request recrawl. OWNER-VERIFY: whether this GitHub account/repo belongs to the owner's team. **P1**

7. **"InkedUp" is a heavily diluted, low-distinctiveness string.** Evidence: #inkedup = 8.85M-post generic tattoo hashtag (best-hashtags.com); same-name studios Inked Up Southampton (`inkedupsouthampton.com`) and Inked Up Chester (`inkedupchester.co.uk`); SaaS `inkedupsocial.com`; Dribbble designer "InkedUp". SEO impact: the bare brand term can never be owned; Google will always need qualifiers to disambiguate. Recommended fix: standardize on the qualified form "InkedUp Bali" (site title, schema `name`, GBP, profiles, press), keep "InkedUp" as `alternateName`; never rely on the unqualified term in anchor text or citations. **P2**

8. **Canonical-host conflict splits the entity's web identity.** Evidence: canonical/og:url/schema `url`/robots Sitemap line = `https://inkedup.id/` (non-www), but `curl -sI https://inkedup.id/` → 308 to `https://www.inkedup.id/` and the site serves on www. SEO impact: Google must pick between two hostnames for the same entity; signals (links, citations) may split. Recommended fix: choose one canonical host and 301 the other, aligning canonical tags, og:url, schema url, robots Sitemap, GBP website field, and all profile links. (Overlaps the technical-crawl audit; flagged here because it fragments entity identity.) **P2**

9. **No Facebook Page, LinkedIn, TikTok (verified), or TripAdvisor presence for the brand.** Evidence: WebSearch `"inkedup.id" OR "InkedUp Bali" Instagram Facebook LinkedIn` → no profiles; collision competitor runs FB+IG+YouTube; other Bali studios appear on TripAdvisor/listicles. SEO impact: entity corroboration is one-dimensional (website only); competitors' multi-platform footprints are why they dominate the SERP. Recommended fix: claim FB Page, TikTok, YouTube, LinkedIn, Pinterest with a consistent handle scheme; cross-link all via sameAs once live. **P2**

10. **No press/listicle/review-platform citations for InkedUp; the Parlour has at least 4.** Evidence: balibuddies.com (2026-06-29), balidoneright.com, sanctuarybali.com, tattoo.guide, tattooswizard all cover the Parlour; none mention inkedup.id. SEO impact: third-party citations are the corroboration Google uses to believe an entity exists; zero citations = zero entity confidence. Recommended fix: pitch the same Bali listicles + local travel media with the differentiated angle (mobile/villa concierge, hygiene protocol); target tattoo.guide/tattooswizard listings. **P2**

11. **Positive: on-site brand naming is consistent and the schema scaffold is right.** Evidence: 152 grep matches, single spelling `InkedUp` (caps `INKEDUP` in Navbar is stylistic); `TattooParlor` @type is appropriate; `areaServed` list present; `og:site_name` set. Impact: once real data and real profiles are connected, the existing scaffold can carry the entity. **P3 (keep)**

## Data tables

**Table A — Entity inventory for the string "InkedUp / Inked Up" (observed 2026-07-17)**

| Entity | Domain / handle | Location | Evidence of establishment | Relation |
|---|---|---|---|---|
| InkedUp (client) | inkedup.id (canonical non-www; serves on www) | Canggu, Bali (service-area) | Website live; placeholder NAP; no verified profiles/GBP | — |
| Inked Up Tattoo Parlour | IG @inkeduptattoobali (66K, 3,050 posts); FB /InkedUpTattooParlour; YT @inkeduptattooparlourbali; GBP maps.app.goo.gl/DkC3oQQQGWY4w7su7; inkeduptattooparlour.com parked | Jl. Petitenget, Badung, Bali | 4+ listicles, 2 directories, GBP, active socials since ≤2020 | **COLLISION — same niche+island** |
| Inked Up Tattoo Studio | inkedupsouthampton.com | Southampton, UK | Multi-page site, phone 07462725002 | Same name, other market |
| Inked Up Chester | inkedupchester.co.uk | Chester, UK | Active studio site | Same name, other market |
| Inked Up Social | inkedupsocial.com | n/a (SaaS) | Live product site | Same name, other vertical |
| "InkedUp" designer | Dribbble ID 9390631 | Bangladesh | Portfolio profile | Same string, individual |
| #inkedup hashtag | instagram.com/explore/tags/inkedup | global | 8,853,060 posts | Generic term dilution |

**Table B — Branded-query SERP ownership (2026-07-17)**

| Query | Engine | inkedup.id on p1–2? | Dominant entity |
|---|---|---|---|
| "InkedUp" | WebSearch | No | hashtag/UK studios/SaaS |
| InkedUp Bali tattoo | WebSearch | No | Inked Up Tattoo Parlour |
| "inkedup.id" | WebSearch | No | (nothing relevant) |
| inkedup.id | DuckDuckGo | No | GitHub repo ddandanell/inkedup.id |
| Inked Up tattoo Bali | DuckDuckGo | No | Parlour: 10/10 results |
| "InkedUp" Bali tattoo | Bing | No (0 domain mentions) | Parlour/others |
| "inkedup.bali" | DuckDuckGo | No results | — |

**Table C — NAP consistency (repo canonical vs published)**

| Field | business.ts (canonical) | Published in live JSON-LD | Status |
|---|---|---|---|
| name | InkedUp | InkedUp | OK |
| legalName | InkedUp Bali (TODO) | InkedUp Bali | UNVERIFIED legal entity |
| phone/WhatsApp | 6281234567890 (TODO, fake) | +62-812-3456-7890 | **FAKE — fix before anything else** |
| email | hello@inkedup.id (TODO) | not in schema | UNVERIFIED inbox |
| hours | 8:00–20:00 daily WITA (TODO) | 08:00–20:00 Mo–Su | UNVERIFIED |
| address | Canggu (area only) | addressLocality Canggu | Appropriate for SAB; GBP should hide address |
| IG | instagram.com/inkedup.bali (TODO) | sameAs + footer | Handle appears nonexistent |
| TikTok | tiktok.com/@inkedup.bali (TODO) | sameAs + footer | UNVERIFIED (WAF) |

## OWNER-VERIFY (facts/claims/access that only the business owner can confirm)

1. Real concierge WhatsApp number, real inbox, confirmed opening hours, and the registered legal entity name (e.g., PT …) to replace every TODO in `app/src/data/business.ts`.
2. Do `instagram.com/inkedup.bali` and `tiktok.com/@inkedup.bali` belong to you? If not registered yet, claim them (and consistent variants: @inkedupbali, @inkedup.id) before someone else does.
3. Is there any existing/unclaimed Google Business Profile for "InkedUp"/"InkedUp Bali"? (Check via Google Maps app + business.google.com while logged in.) If none, create a Service-Area Business listing.
4. GitHub: is the account `ddandanell` and the public repo `ddandanell/inkedup.id` yours/your developer's? Should it be private? Any secrets ever committed?
5. Trademark (verify — not legal advice; consult an Indonesian IP/HKI consultant): (a) search the DGIP trademark database (https://pdki-indonesia.dgip.go.id) for "InkedUp", "Inked Up", and "Inked Up Tattoo Parlour" in class 44 (tattooing services) and class 35; (b) determine whether the Parlour (operating since ≤2020) holds or has applied for a registration — their earlier common-law use in Indonesia could constrain your use of the mark locally even absent registration; (c) evaluate registering "InkedUp Bali" word + logo yourself; (d) document your own first-use dates (domain registration, invoices, posts) as common-law evidence.
6. Any existing relationship/history with Inked Up Tattoo Parlour (name dispute, prior contact, copied-asset concerns)?
7. Confirm the intended permanent hostname (www vs non-www) so canonical, schema, GBP, and profiles can be aligned.

## UNVERIFIED / limitations of this pass

- TikTok profile existence (@inkedup.bali): blocked by TikTok WAF (SlardarWAF challenge, HTTP 200 shell). UNVERIFIED — needs a real browser.
- Instagram `inkedup.bali`: logged-out fetch returned no profile metadata while the collision profile returned full metadata via the identical method; Instagram's logged-out behavior can vary, so "handle nonexistent/unclaimed" is probable, not certain — needs a logged-in browser check.
- GBP existence for InkedUp: Google Maps search HTML is JS-rendered server-side; absence of evidence ≠ absence. UNVERIFIED — needs browser/Maps app.
- WebSearch/Bing/DDG results are snapshots and may differ from google.com SERPs and by location (queries were engine-default, not Bali-geo-set). Follow-up with GSC data + Rich Results Test render recommended.
- Follower counts are as shown by platform og metadata on 2026-07-17.
- DGIP/PDKI trademark database not queried (no public API; requires manual search) — listed under OWNER-VERIFY.
- No JS rendering performed; per the audit brief, JSON-LD was checked in raw HTML (it IS present server-side in index.html — no render gap for the homepage schema).

## Recommendations — entity consolidation & brand-SERP plan (priority order)

1. **(P1, do first) Fix identity data**: real NAP in `business.ts`; remove fake phone from schema; keep `TattooParlor` type, add `alternateName: "Inked Up Bali"` only after deciding on spaced-variant strategy (it could aid recall but also feeds the collision — safer default: `name: "InkedUp Bali"`, `alternateName: "InkedUp"`).
2. **(P1) Claim the profile layer**: IG, TikTok, FB Page, YouTube, LinkedIn, Pinterest under one handle scheme; only then wire them into `sameAs`. Profiles must carry identical name ("InkedUp Bali"), same bio boilerplate ("Bali's mobile tattoo concierge — verified artists, sterile mobile setup, we come to your villa"), and link back to the canonical hostname.
3. **(P1) GBP as Service-Area Business** named exactly "InkedUp Bali", service areas mirroring schema `areaServed`, website = canonical URL, primary category tattoo shop; seed first 10 reviews from real customers. This creates the knowledge-panel entity that currently only the Parlour has.
4. **(P1) De-pollute the domain query**: make GitHub repo private/rename; afterwards the exact-domain SERP should resolve to the site itself.
5. **(P2) Differentiate from the Parlour in messaging, not by naming them**: consistently use the category descriptor "mobile tattoo concierge / we come to your villa" in title tags, H1, schema `description`, GBP description, and bios — a semantic axis (mobile concierge vs walk-in Petitenget studio) that lets both users and Google's entity resolution separate the two brands. Avoid "tattoo parlour/studio" as a self-descriptor.
6. **(P2) Citation building**: pitch balibuddies, balidoneright, sanctuarybali, thesmartlocal Bali, plus tattoo.guide/tattooswizard listings; each citation should use "InkedUp Bali" + canonical URL + (once live) consistent social links.
7. **(P2) Resolve the www/non-www conflict** and align canonical, og:url, schema url, robots Sitemap line, GBP website field, and all profile links on one hostname.
8. **(P3) Monitor**: monthly branded-SERP check ("InkedUp", "InkedUp Bali", "inkedup.id") + Google Alerts for "InkedUp Bali" and "Inked Up Bali"; track knowledge-panel emergence in GSC/Rich Results Test.
