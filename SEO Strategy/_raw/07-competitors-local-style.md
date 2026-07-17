# COMPETITORS-LOCAL-STYLE — Baseline Findings
Date: 2026-07-17 | Scope: SERP competitor analysis for 11 LOCAL + SERVICE + STYLE queries in the Bali tattoo market (Canggu, Seminyak, Ubud, Uluwatu, Sanur; mobile/villa; fine line, realism, Japanese) | Method: WebSearch (Moonshot search API) per query, FetchURL on 4 instructive competitor pages, curl on 1 JS-blocked competitor homepage, read-only repo check of app/src/data/business.ts for InkedUp positioning context. Time anchor: 2026-07-17T11:42+0800 (WITA).

## Evidence collected (commands/URLs/files inspected, with key outputs)

Searches run (all 2026-07-17, via WebSearch tool):
- `tattoo studio canggu` → Canggu Ink Club (surfaced via Trustindex review pages trustindex.io/reviews/cangguinkclub.com), finelinetattoobali.com (exact-match domain studio, "12+ years"), canggutattoostudio.com ("Est. 2016", Jl. Nelayan No. 5 address, fine line/realism), charlierosetattoobali.com ("since 2018"), Glints job ad (noise).
- `tattoo studio seminyak` → masonsink.com + masonsink.com/studio-locations/masons-ink-tattoo-studio-seminyak-bali/, primitivetattoobali.com (also has /mandala-tattoo-seminyak/ style page), tnttattoobali.com, westcoastinkbali.com (named artist bios), ink.inc/locations/bali-studio, second domain masonsinkbalitattoo.com.
- `tattoo studio ubud` → balibuddies.com listicle ("Bali's Best Tattoo Studios 2026", features Artful Ink Seminyak+Ubud), bobtattoobali.com (embedded Google reviews via Trustindex widget), ubudink.com (owner story since 2013, machine + bamboo tattoo niche), quietinkstudio.com/best-rated-tattoo-shop-ubud/ and /fine-line-tattoo-ubud/ (programmatic location + location×style pages), lillagreen.com blog mention of IBU Tattoo.
- `tattoo studio uluwatu` → sukaytattoo.com (FAQ: sterilisation, female artists, card tax), saecollectivestudiobali.com (tattoo+barber+piercing), uluwatutattoosbali.com (2 locations with full street addresses + opening hours — strongest local page seen), finnsbeachclub.com piercing guide, balidoneright.com listicle.
- `tattoo studio sanur` → quietinkstudio.com/best-tattoo-studio-sanur/ is the ONLY dedicated tattoo page; rest of SERP is ctrip/trip.com hotel pages, a nail-salon blog (cinchy.life), smergers business listings. Weakest SERP of the set.
- `mobile tattoo bali` → hendricshinigamitattoo.com/bali-villa-a-complete-home-service-tattoo-guide/ (blog guide), trishnandacarecentre.com (medical clinic hygiene/red-flags guide), 747ink.com (studio site "under development"), twogunstattoobali.com guide, tattoobali.com aftercare blog.
- `villa tattoo bali` → hendricshinigamitattoo.com guide again, cometoyoutattoo.com (snippet: "mobile Tattoo Studio that comes to your villa or hotel here in Bali. Minimum cost 2,500,000 IDR / 200 AUD approx."), tattooholidaybali.com (Lovina tattoo+villa holiday packages), slinkyvillas.com safety article, wanderlog.com listing.
- `"in-villa tattoo" bali` → same set as villa tattoo bali; no exact-match-optimized page found; Hendric guide is closest.
- `fine line tattoo bali` → finelinetattoobali.com (EMD), tropicalinkbali.com (fine-line specialist, Seminyak+Canggu studios, tropical aftercare guide), cangguinkclub.com/blog/fine-line-tattoo-cost-bali/ (price guide), finnsbeachclub.com "16 best tattoo artists" listicle.
- `realism tattoo bali` → bloodlinetattoobali.com (appointment-only realism/Japanese/portrait), bagustattoostudio.com, canggutattoostudio.com, cangguinkclub.com/tattoo/realism/ (dedicated style FAQ page), incredibleinkbali.com/realism/, twogunstattoobali.com.
- `japanese tattoo bali` → hustleinktattoo.com blog guide (names style-specialist artists), besttattooartistbali.com directory homepage + /areas/kuta, secretartstattoo.com blogs, tnttattoobali.com, masonsink.com (Japanese in style list), balidoneright.com (Two Guns "mastery of Japanese-style"), bloodlinetattoobali.com. No specialist Japanese page dominates.
- `site:inkedup.id` → search API returned HTTP 404 "No search results were found for the given query" (signal only, not proof — see UNVERIFIED).
- `"inkedup" bali tattoo` → zero results for inkedup.id; only unrelated hashtag noise and a UK studio (inkedupsouthampton.com).

Pages fetched/inspected in depth:
- https://www.cometoyoutattoo.com/ — FetchURL failed (JS/extraction); curl with browser UA succeeded (retry 1 of 2). WordPress/Divi one-pager. `<title>Home - Come To You Tattoo</title>`; meta description: "Come To You Tattoo Studio is a mobile Tattoo Studio that comes to your villa or hotel here in Bali. All of our Artists are trained under the Australian Health…" (truncated). Canonical + OG present. No dedicated service/location/style URLs evident.
- https://hendricshinigamitattoo.com/bali-villa-a-complete-home-service-tattoo-guide/ — full text extracted. Frames hygiene as: single-use needles, sterilized equipment, medical-grade gloves, safe inks, surface protection, waste disposal. Process: consultation → booking/location → setup → session → aftercare. Coverage claimed: Canggu, Seminyak, Uluwatu, Kuta. "Free transport and home service in selected areas." WhatsApp + email + Instagram contact. It is a BLOG POST, not a service page; no prices, no FAQ schema visible, no legality/permit discussion.
- https://masonsink.com/studio-locations/masons-ink-tattoo-studio-seminyak-bali/ — full text extracted. Location page = generic marketing copy + style list + hygiene claim + a "Visiting Bali?" paragraph listing 11 area names (Canggu, Kuta, Legian, Sanur, Jimbaran, Uluwatu, Berawa, Petitenget, Denpasar, Ubud, Tabanan) + couples/friends/family sections. No address, no prices, no artist names, no area-specific proof on this page.
- https://www.quietinkstudio.com/best-tattoo-studio-sanur/ — full text extracted. Generic copy ("best tattoo studio in Sanur"), services list (basic/complex/cover-up/enhancement), no address, no prices, no named artists, no reviews embedded. Ranks in a SERP with no other dedicated page.
- https://cangguinkclub.com/tattoo/realism/ — extracted. Style page in FAQ format: definition, what-to-know, "why us", cost guidance ("message for a free quote… upfront, transparent price"), techniques. Moderate depth.
- https://besttattooartistbali.com/ — extracted. Programmatic directory: "30 verified studios", browse by Style (6 style categories) × Area, top-rated studio cards quoting Google review counts (e.g. "Canggu Ink Club 5.0 (3,421)… one of the few with published pricing (from IDR 1M)"), price FAQ (IDR 500K–1.5M minimums, IDR 800K–3M hourly, IDR 5M–15M full-day), safety FAQ, aftercare FAQ, guide hub (price guide, hygiene guide, fine line guide, Balinese tattoo culture, area guides). Monetizes via "Contact via WhatsApp" referral.
- /Users/openclaw/Downloads/tatooo2/app/src/data/business.ts (read-only) — InkedUp model context: concierge, `areaServed: ['Canggu','Seminyak','Kuta','Uluwatu','Ubud','Sanur']` (lines 20), hours line 18; ALL contact fields still TODO placeholders (lines 12–24: whatsapp 6281234567890, hello@inkedup.id, instagram/tiktok TODO).

## Findings (numbered; each: finding, evidence, SEO impact, recommended fix, priority P0–P3)

**1. InkedUp has zero organic presence across all 11 tracked money queries; no third-party mention found. — P1**
Evidence: 11 WebSearch result sets above — no inkedup.id URL and no directory/listicle mention of "InkedUp" in any of them; `"inkedup" bali tattoo` returns only unrelated results; `site:inkedup.id` returned "no results" from the search API (signal, not proof).
SEO impact: 100% of tracked local/service/style demand is captured by competitors and aggregators; brand is invisible in its own market's SERPs.
Fix: ship the location + mobile/villa + style page set (below), create/verify Google Business Profile, get listed in the directories that rank (Finding 6), and verify indexation status in GSC (hand to indexation auditor).

**2. The mobile/villa intent — InkedUp's core service — is genuinely served by only TWO providers, both SEO-weak. Fastest high-value win. — P1**
Evidence: cometoyoutattoo.com = single-page WordPress site, title tag literally "Home - Come To You Tattoo", no service/location subpages, meta description does the positioning work ("mobile Tattoo Studio that comes to your villa or hotel", "trained under the Australian Health…", min 2,500,000 IDR/200 AUD per snippet). hendricshinigamitattoo.com ranks with a BLOG POST (fetched full text), not a service page; covers Canggu/Seminyak/Uluwatu/Kuta, "free transport in selected areas", no prices. Everything else in these SERPs is informational (Trishnanda clinic hygiene guide, Slinky Villas safety article, Two Guns/Downunder aftercare blogs) or adjacent (tattooholidaybali.com Lovina packages).
SEO impact: the exact SERPs matching InkedUp's business model have no strong dedicated service page; a well-built page can plausibly outrank both incumbents.
Fix: build a dedicated "In-Villa / Mobile Tattoo Bali" service page containing: explicit hygiene protocol (single-use needles opened in front of client, surface barrier setup, autoclave/sterile kit, waste disposal, medical-grade gloves — the Hendric list as baseline, exceeded), transparent pricing/minimum call-out fee + travel-fee table per area (Come To You publishes 2.5M IDR minimum; nobody else prices), coverage map/area list matching business.ts areaServed, process steps, FAQ (safety, villa/hotel permission, group bookings, aftercare in tropical climate), verifiable reviews, real WhatsApp CTA.
What a trustworthy page needs (answering the mission question): named artists with portfolios, license/insurance/permit framing (NOBODY in this SERP addresses legality of mobile tattooing in Bali — gap), hygiene specifics with photos of the mobile sterile setup, transparent pricing, real accommodation-area coverage, and third-party review proof.

**3. Location SERPs are won by studio homepages and thin, name-swapped location pages — beatable with genuine local content. — P2**
Evidence: Mason's Ink Seminyak location page (fetched) is generic copy + an 11-area name list with zero area-specific substance; Quiet Ink's Sanur/Ubud pages (fetched) are generic "best studio" text with no address/prices/artists; these still rank. Strongest location pages seen: uluwatutattoosbali.com (two real addresses + hours), canggutattoostudio.com (street address, est. date).
SEO impact: the incumbents' location pages are exactly the "pages created only to funnel users" pattern; a page with real local substance can outrank them and is safe under Google's doorway-page guidance.
Fix: per-area pages (Canggu, Seminyak, Ubud, Uluwatu, Sanur, Kuta) with unique logistics and proof — see Finding 8 for the minimum bar.

**4. Style-specific landing pages DO exist in this market and rank — style pages are table stakes, not a differentiator. — P2**
Evidence: finelinetattoobali.com (exact-match domain, ranks top for fine line), tropicalinkbali.com (fine-line specialist positioning), cangguinkclub.com/tattoo/realism/ (fetched: FAQ-style style page), incredibleinkbali.com/realism/, primitivetattoobali.com/mandala-tattoo-seminyak/ (location×style), bloodlinetattoobali.com (realism/Japanese appointment-only positioning).
SEO impact: for fine line and realism, InkedUp enters SERPs that already reward style pages; homepage-only targeting will not compete.
Fix: style pages (fine line, realism, Japanese minimum) each with: style definition/guide, 3+ named artists who actually do the style with portfolio, price guidance, style-specific aftercare, FAQ. Japanese is the softest style SERP (no dedicated specialist page dominates — a directory and blogs rank; see table).

**5. The trust-signal bar in this market is concrete and verifiable: embedded third-party reviews, published prices, named artists, hygiene specifics, real addresses. InkedUp currently has placeholder business data. — P1**
Evidence: Trustindex/Google-review embeds on Canggu Ink Club and bobtattoobali.com; published pricing from Canggu Ink Club ("from IDR 1M" per directory), Come To You (min 2.5M IDR), directory price FAQ (IDR 500K–15M ranges); named artist bios on masonsink.com/artists/, westcoastinkbali.com, hustleinktattoo.com; hygiene claims (autoclave, disposable needles, "Australian health standards") on Sukay, Downunder, Come To You; full addresses/hours on uluwatutattoosbali.com. Meanwhile app/src/data/business.ts lines 12–24 still contain TODO placeholders for WhatsApp, email, Instagram, TikTok.
SEO impact: Google (and users) in this niche reward verifiable E-E-A-T signals; unsupported "premium/trusted" claims without them underperform — and for a no-physical-studio concierge brand they are the entire credibility layer.
Fix: replace all placeholder business data with real values; embed verifiable reviews (Trustindex/Google widget or marked-up genuine reviews); publish at least "from" pricing; name real artists with portfolios; document the mobile hygiene protocol with photos. (Cross-ref: business-identity auditor.)

**6. An aggregator/directory layer already ranks and monetizes this demand — both a threat and a citation opportunity. — P2**
Evidence: besttattooartistbali.com (fetched): 30-studio directory with Style×Area taxonomy, review-count cards, price/safety/aftercare FAQs, guide hub, WhatsApp referral funnel — ranks for japanese/realism queries. Listicles: finnsbeachclub.com ("16 best", updated 2026-07-09), balibuddies.com (2026-06-29), balidoneright.com, inivie.com, wanderlog.com; review platform trustindex.io pages rank for brand queries.
SEO impact: directories absorb clicks for commercial queries and define the comparison set InkedUp is absent from; listicle inclusion drives both referrals and local citations.
Fix: (a) outreach for inclusion in besttattooartistbali.com, Finns, Bali Buddies, Bali Done Right, iNi Vie (P3 task); (b) match/exceed the directory's informational bar (price data, safety guide) on InkedUp's own pages.

**7. Informational long-tail is owned by blogs (aftercare-in-tropics, prices, safety) that funnel to competitors — needed as supporting content, not first priority. — P3**
Evidence: tropicalinkbali.com tropical aftercare guide (2026-03-26), cangguinkclub.com price guides (2026-04), secretartstattoo.com price guide, trishnandacarecentre.com hygiene/red-flags guide (a medical clinic ranking for tattoo queries — shows E-E-A-T reward), slinkyvillas.com safety article.
Fix: 3–4 supporting guides (mobile-tattoo safety/hygiene, Bali tattoo price guide, tropical aftercare) internally linking to service/location pages.

**8. (a) MINIMUM CONTENT BAR for an InkedUp location page to NOT be a doorway page (per Google's doorway guidance: pages must have standalone value, not exist only to funnel). — P1 (risk-avoidance)**
Observed market baseline (Mason's/Quiet Ink) is name-swapped generic copy — that is the pattern to EXCEED, not copy. Minimum bar per location page:
- Unique local logistics: travel fee and response-time for that area, coverage boundaries, how the in-villa setup works in that area's accommodation types (villas in Uluwatu cliffs vs. Sanur hotels).
- Unique local proof: portfolio pieces done for clients in that area (with context), testimonials naming the area/villa, photos of real setups there.
- Named artists actually available for that area + their styles.
- Area-specific FAQs (hotel/villa permission, group sessions, parking/access, peak-season booking lead time).
- Area-relevant internal links (style pages, price guide, aftercare) and a real CTA with the real WhatsApp number.
- If an area cannot get genuinely unique content, do NOT publish the page yet — a thin copy is the doorway pattern.

**9. (b) Weakest competition = fastest wins, ranked: — P2**
1. `mobile tattoo bali` / `villa tattoo bali` / `in-villa tattoo bali` — two weak incumbents, no dedicated quality service page (Finding 2). Core-model match.
2. `tattoo studio sanur` — no dedicated tattoo site ranks at all; SERP is hotel/nail-salon noise + one generic page.
3. `tattoo studio uluwatu` — only ~3 real studio sites; best page is solid but beatable.
4. `japanese tattoo bali` — no specialist page; directory + blogs rank.
5. `tattoo studio ubud` — mix of small studios + listicles; no dominant brand page.
Hardest (deprioritize): `tattoo studio canggu`, `tattoo studio seminyak`, `fine line tattoo bali` (entrenched: Canggu Ink Club 30+ artists/~3.4K reviews per directory, EMD finelinetattoobali.com, Mason's Ink ~3.1K reviews, Tropical Ink specialist).

**10. (c) Five concrete differentiation opportunities. — P2**
1. **Own the in-villa category with a real service page + hygiene dossier**: nobody has a dedicated, price-transparent, protocol-documented mobile/villa tattoo page; the two incumbents are a one-pager titled "Home" and a blog post.
2. **Pricing transparency**: publish minimums, travel fees per area, and "from" style prices — the market directory explicitly calls out published pricing as rare ("one of the few").
3. **Legality/permits/insurance framing**: zero competitors address the legality or insurance of mobile tattooing in Bali; a clear, honest trust page (what permits/standards the concierge vets artists for) is unique E-E-A-T.
4. **Curation model as content**: competitors are single studios listing their own artists; InkedUp can publish a vetted multi-artist roster (styles × areas) with verified portfolios — the directory model (besttattooartistbali) proves the format ranks, but InkedUp can fulfill the booking end-to-end.
5. **Medical-grade safety content partnership**: a clinic (Trishnanda) ranks for tattoo hygiene queries; InkedUp can publish the definitive "is a villa tattoo safe?" guide with named medical/artist reviewers, red-flag checklist, and tropical aftercare — capturing informational demand competitors ignore.

## Data tables

Per-query SERP summary (WebSearch, 2026-07-17; positions approximate — see UNVERIFIED):

| Query | Who ranks (top ~6) | Result types | Directory/listicle in SERP | Best-ranking page: type & depth | Local-specific content observed | inkedup.id |
|---|---|---|---|---|---|---|
| tattoo studio canggu | Canggu Ink Club, finelinetattoobali.com, canggutattoostudio.com, charlierosetattoobali.com | Studio homepages, review platform | Trustindex | Studio homepage, medium depth | Address (Jl. Nelayan No.5), est. dates, hygiene claims, review embeds | Absent |
| tattoo studio seminyak | Mason's Ink (+location page), Primitive, TNT, Westcoast Ink, ink.inc | Studio homepages + location pages | — | masonsink.com location page: medium, generic | Style lists, artist bios (separate page), hygiene claims; no prices | Absent |
| tattoo studio ubud | Bali Buddies listicle, Bob Tattoo, Ubud Ink, Quiet Ink (2 pages) | Listicle + small studio sites + programmatic location pages | Bali Buddies, lillagreen blog | Ubud Ink: story-driven homepage | Owner story since 2013, bamboo-tattoo niche, Trustindex reviews | Absent |
| tattoo studio uluwatu | Sukay, Sae Collective, Uluwatu Tattoos Bali, piercing guides | Studio homepages | Finns, Bali Done Right | uluwatutattoosbali.com: 2 locations, addresses+hours | Full street addresses, hours, FAQ w/ hygiene+payment specifics | Absent |
| tattoo studio sanur | Quiet Ink (generic page) + hotel/nail-salon noise | Mostly irrelevant listings | ctrip/trip.com, cinchy.life | quietinkstudio.com Sanur page: thin/generic | Almost none — no address/prices/artists | Absent |
| mobile tattoo bali | Hendric Shinigami (blog), Trishnanda clinic, 747 Ink, Two Guns, Downunder | 1 genuine provider + informational blogs | — | Hendric villa guide: blog post, medium depth | Coverage areas, process, hygiene list; no prices | Absent |
| villa tattoo bali | Hendric guide, cometoyoutattoo.com, tattooholidaybali.com, Slinky Villas | 2 genuine providers + packages + info articles | Wanderlog | cometoyoutattoo.com: one-pager, weak title | Min price IDR 2.5M, "Australian Health" training claim | Absent |
| in-villa tattoo bali | Same set as villa tattoo bali | — | — | No exact-match page exists | — | Absent |
| fine line tattoo bali | finelinetattoobali.com (EMD), Tropical Ink, Canggu Ink Club blog, Finns listicle | EMD studio + specialist + price blog + listicle | Finns | finelinetattoobali.com: specialist site, galleries/FAQ | 12+ yrs claim, galleries, price FAQ | Absent |
| realism tattoo bali | Bloodline, Bagus, Canggu Tattoo Studio, Canggu Ink Club /tattoo/realism/, Incredible Ink /realism/ | Studio sites + style pages | — | cangguinkclub.com/tattoo/realism/: FAQ style page, medium | Style guidance, technique, "free quote" pricing | Absent |
| japanese tattoo bali | Hustle Ink blog, besttattooartistbali.com, Secret Arts, TNT, Mason's Ink, Bali Done Right | Blogs + directory + studio homepages | besttattooartistbali.com, balidoneright.com | Directory homepage: high (taxonomy+FAQs) | Named specialist artists (Hustle Ink), price data (directory) | Absent |

Genuine mobile/villa providers found (complete as of this pass): cometoyoutattoo.com (dedicated mobile studio), hendricshinigamitattoo.com ("Come To You Tattoo Studio" mobile service), tattooholidaybali.com (villa+tattoo holiday packages, Lovina — adjacent). No others surfaced.

## OWNER-VERIFY (facts/claims/access that only the business owner can confirm)
1. Google Business Profile existence/status for InkedUp (map-pack presence cannot be observed with this pass's tools; GBP is decisive for "tattoo studio <area>" queries).
2. Real WhatsApp number, hours, social handles, legal entity name — business.ts lines 12–24 are placeholders; competitors all show real contact data.
3. Actual service coverage and travel-fee structure per area (needed for location pages; business.ts lists 6 areas).
4. Artist roster: names, styles, portfolio usage rights — needed to beat the "named artists" trust bar.
5. Pricing structure InkedUp can publish (minimums, call-out fee, style "from" prices).
6. Legality framing: what permits/insurance/hygiene standards InkedUp vets partner artists for (for the unique trust page — do NOT claim anything the owner cannot substantiate).
7. Review assets: any existing Google/Tripadvisor reviews that can be embedded; if none, plan to generate first-party reviews post-launch.
8. Confirm in Google Search Console whether inkedup.id pages are indexed (site: signal returned nothing — treat as unverified until GSC).

## UNVERIFIED / limitations of this pass
- Results come from the Moonshot/Kimi search API, not live google.co.id/google.com with a Bali IP; no map pack/local pack is observable. Rankings and "who ranks" are approximations; a manual browser check (and Rich Results/GBP check) is needed for confirmation.
- `site:inkedup.id` "no results" is a search-API signal only — NOT proof of deindexation. Needs GSC.
- cometoyoutattoo.com: FetchURL failed (JS); evidence limited to curl-fetched head/meta + search snippet; body content, internal URLs, and schema not fully audited.
- Review counts quoted (e.g. "3,421 reviews") come from besttattooartistbali.com's own cards; not independently verified against Google Maps.
- Position ordering within SERPs was recorded qualitatively; no rank tracker used.
- Indonesian-language SERPs (e.g. "tato canggu", "tato bali") not covered — possible additional competitor set; recommend a follow-up pass.
