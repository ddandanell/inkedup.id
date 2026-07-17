# 05 — Competitor Analysis: Bali Tattoo SERPs

**Date:** 2026-07-17 (WITA) · **Scope:** Synthesis of the two competitor evidence passes for inkedup.id
**Inputs (every factual claim below cites one):**
- `_raw/06-competitors-core.md` — 6 core commercial + safety queries; WebSearch SERP capture, FetchURL full-text of 7 competitor pages, curl raw-HTML (title/H1/canonical/ld+json) of 13 competitor URLs + inkedup.id
- `_raw/07-competitors-local-style.md` — 11 local + service-model + style queries; FetchURL of 4 pages + curl of 1 JS-blocked page; repo read of `business.ts`

**Method caveat inherited from evidence:** SERPs were captured via the Kimi/Moonshot search API, not live google.com/google.co.id from a Bali IP; map pack / local pack is **not observable** with that tooling and rankings are approximate (UNVERIFIED — `_raw/06` UNVERIFIED, `_raw/07` UNVERIFIED). Word counts are estimates from extracted text (`_raw/06` UNVERIFIED). Competitor review counts are competitor-published claims, not independently verified (`_raw/06`, `_raw/07` UNVERIFIED).

---

## A. Market landscape — who dominates the Bali tattoo SERPs

Four competitive forces own every observed commercial SERP; inkedup.id appears in **none** of them, including branded-adjacent queries (`_raw/05` finding 1; `_raw/06` finding 1; `_raw/07` finding 1).

**1. Single fixed-address studios (~25 sites) — the dominant force.**
Studio homepages and their location/style subpages fill the blue links for head terms (`tattoo bali`, `tattoo studio bali`), all local terms (Canggu/Seminyak/Ubud/Uluwatu), and style terms (`_raw/05` SERP mining; `_raw/06` Table 1; `_raw/07` per-query table). Strong examples: Bloodline (`5.0★ · 519+ Reviews on Google` + AggregateRating schema — `_raw/06` Table 2), Hustle Ink (2,900-word pillar guide — `_raw/06` finding 4), finelinetattoobali.com (exact-match domain + published flat-rate pricing — `_raw/06` finding 6), Mason's Ink, TNT, Secret Arts, Canggu Ink Club, Tropical Ink, Ubud Ink (`_raw/06`, `_raw/07` tables).

**2. Publisher listicles — the second force.**
Finns Beach Club ("16 Best Tattoo Studios & Artists in Bali", ~1,900 words + 8 FAQs, `Article` schema) appears for `tattoo bali`, `tattoo artist bali` **and** `tattoo shop bali` (`_raw/06` finding 8, Table 1). Bali Buddies runs "Bali's Best Tattoo Studios In 2026 — Where To Get Inked-Up In Bali!" (dated 2026-06-29 — `_raw/05`; `_raw/07` finding 6). Traveloka (7-studio listicle, monetization-led — `_raw/06` Table 2), Bali Done Right, iNi Vie and Wanderlog also surface (`_raw/07` finding 6). Notably, Bali Buddies' headline literally uses the phrase "Inked-Up" — a phrase collision with the brand, not a mention of it (`_raw/05` evidence, `inkedup bali tattoo` query).

**3. A dedicated comparison directory — besttattooartistbali.com.**
Programmatic "30 verified studios" directory with a Style × Area taxonomy (/areas/{kuta}, /styles/{japanese, cover-up, fine-line}), studio cards quoting Google review counts (Canggu Ink Club 5.0 (3,421); Celebrity Ink Kuta 4,530; ink.inc Seminyak 3,347), price/safety/aftercare FAQs (IDR 500K–1.5M minimums; IDR 800K–3M hourly; IDR 5M–15M full-day) and a WhatsApp referral funnel (`_raw/05` evidence + SERP competitor set; `_raw/07` finding 6, fetched page). It ranks for style and commercial-investigation queries and explicitly calls published pricing rare ("one of the few" — `_raw/07` finding 10).

**4. Adjacent marketplaces and aggregators.**
bookanartist.co/tattoo-artists-bali ranks for artist/jobs queries — a direct model competitor on the supply side (`_raw/05` partnership cluster). Trustindex review pages rank for studio-brand queries (Canggu Ink Club — `_raw/07` data table).

**Notably absent from all top organic sets:** TripAdvisor, Yelp, Fresha, Tattoodo (`_raw/06` Table 1 note); and **any marketplace/concierge model** — every ranking competitor is a fixed-address single studio or chain (`_raw/06` finding 10, synthesis).

**Map-pack note:** Google Maps/Local Pack presence could not be observed with this pass's tools and remains UNVERIFIED — it needs a browser SERP from a Bali-located IP (`_raw/06` UNVERIFIED; `_raw/07` UNVERIFIED). This matters disproportionately: "near me" behavior is decided by Google Business Profile, not pages (`_raw/05` finding 12), and GBP is decisive for `tattoo studio <area>` queries (`_raw/07` OWNER-VERIFY 1). The brand-collision competitor (Inked Up Tattoo Parlour, Petitenget) already holds a confirmed GBP (`_raw/08`; cross-ref 08-trust-gap-analysis.md §C).

---

## B. Per-cluster competitor tables

Schema observed via curl raw-HTML extraction; JS-injected schema may be undercounted (`_raw/06` UNVERIFIED). "Depth" figures are estimates from extracted main text (`_raw/06` UNVERIFIED). inkedup.id was absent from **every** result set below (`_raw/06` Table 1; `_raw/07` data table).

### B1. Core commercial queries (`_raw/06` Table 1 + Table 2)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| tattoo bali | secretartstattoo.com price blog (studio blog — single studio); bloodlinetattoobali.com (homepage — appointment-only premium studio); tattoobali.com ×4 (home+blog — Kuta studio, AU-owned); traveloka.com (listicle — OTA); balistarinktattoo.com (studio); finnsbeachclub.com (listicle — venue publisher) | Bloodline homepage ~500 words (conversion-led); blog guides long-form | Bloodline: "5.0★ · 519+ Reviews on Google" top of page; tattoobali: address, hygiene claims | Bloodline: TattooParlor + AggregateRating + Organization + GeoCoordinates; tattoobali: TattooParlor + AggregateRating + OpeningHours + ContactPoint; Finns: Article | NO |
| best tattoo studio bali | masonsink.com (home + Seminyak location page — studio); tnttattoobali.com (homepage — studio); secretartstattoo.com first-time + prices guides (studio blog); celebrityink.com/locations/bali-kuta (chain location page) | Mason's medium, story-led; TNT 1.9 MB HTML (heavy); Secret Arts first-time guide ~700 words (thin) | Mason's: artist team, hygiene claims; Celebrity Ink: global brand, style list | Mason's: Organization + Breadcrumb + WebPage (no TattooParlor); TNT: LocalBusiness + custom "Tattoo Studio"; Celebrity Ink Kuta: WebPage + BreadcrumbList only — no LocalBusiness | NO |
| tattoo artist bali | finnsbeachclub.com (listicle); cangguinkclub.com blog (studio blog); secretartstattoo.com (home + prices blog); browslashesbali.com (cosmetic tattoo — adjacent); glints.com (job ad — noise); tattoobali.com | Finns ~1,900 words + 8 FAQs | Finns: venue brand authority, per-entry address+link | Finns: Article + WebPage + Person; cangguinkclub: BlogPosting + FAQPage + Person (fetch failed 2× — snippet + curl only) | NO |
| tattoo shop bali | finnsbeachclub.com (listicle); tententattoo.com (homepage — studio, "Bali Tattoo Near Me" title); secretartstattoo.com ×2; bloodlinetattoobali.com | TenTen medium | TenTen: free-quote form; few trust details | TenTen: TattooParlor + GeoCoordinates + OpeningHours | NO |

### B2. Price query (`_raw/06` Tables 1–2, findings 4 & 6; `_raw/05` price cluster)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| tattoo prices bali | hustleinktattoo.com 2026 prices guide (studio pillar guide); secretartstattoo.com prices guide (studio blog); finelinetattoobali.com prices page (studio pricing page); celebrityink.com Kuta (chain location page, **no prices**); quietinkstudio.com cost page; secretartstattoo.com older post; andrewbali.com (listicle) | Hustle ~2,900 words with IDR/AUD/USD price table; Fine Line ~1,100 words + visual per-band examples | Hustle: named artists per style, "130+ five-star Google reviews", hygiene checklist, 8-Q FAQ; Fine Line: flat tiers 1M IDR min / 2.4M IDR hr / 15M IDR day, design-fee policy | Hustle: LocalBusiness + Article + FAQPage + AggregateRating + Person + Breadcrumb; Fine Line: LocalBusiness + Offer + OfferCatalog + AggregateOffer + Service + Article | NO |

Market price benchmarks observed across the cluster (`_raw/05` findings/rows): small tattoos IDR 500K–1.5M; studio minimums IDR 300K–600K; hourly IDR 800K–3M (finelinetattoobali 2.4M/hr); full-day IDR 5M–15M; mobile minimum 2.5M IDR (Come To You); cover-up +20–50% (Hustle Ink).

### B3. Safety query (`_raw/06` Tables 1–2, finding 4; `_raw/05` safety cluster)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| is it safe to get a tattoo in bali | hustleinktattoo.com getting-tattoo guide (studio pillar); socialinkhousebali.com safety guide (studio, owner voice); cangguinkclub.com blog; celebrityink.com Kuta; finelinetattoobali.com safety blog | Hustle ~2,900 words; Social Ink ~1,800 words | Social Ink: "7 years, 2,000+ clients", named ink brands (Eternal/Intenze), autoclave specifics, named hospitals (Siloam, BIMC), written aftercare card; Hustle: hygiene checklist | Hustle: LocalBusiness + Article + FAQPage + AggregateRating | NO |

Wider cluster: Slinky Villas safety article and Trishnanda Care Centre (a **medical clinic** ranking for tattoo hygiene queries — E-E-A-T reward signal) plus dedicated studio hygiene pages (W Ink, Bloodline OSHA/Australian WHS, Platinum) (`_raw/05` safety cluster; `_raw/07` finding 7).

### B4. Local queries (`_raw/07` per-query data table + findings 3, 8, 9)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| tattoo studio canggu | Canggu Ink Club (via Trustindex review pages); finelinetattoobali.com (EMD studio, "12+ years"); canggutattoostudio.com (studio, "Est. 2016"); charlierosetattoobali.com ("since 2018"); Glints job ad (noise) | Studio homepages, medium | canggutattoostudio: street address (Jl. Nelayan No. 5), est. dates, hygiene claims; Canggu Ink Club: review embeds, ~3.4K reviews per directory | Not fully extracted this pass | Absent |
| tattoo studio seminyak | masonsink.com + location page; primitivetattoobali.com (incl. /mandala-tattoo-seminyak/ style page); tnttattoobali.com; westcoastinkbali.com; ink.inc/locations/bali-studio | Mason's location page: medium, **generic** (11-area name list, no address/prices/artists — fetched) | Westcoast: named artist bios; style lists; no prices | Mason's: Organization + Breadcrumb + WebPage (from `_raw/06` Table 2) | Absent |
| tattoo studio ubud | balibuddies.com (listicle); bobtattoobali.com (studio); ubudink.com (studio, owner story since 2013, machine + bamboo niche); quietinkstudio.com ×2 (programmatic location + location×style pages) | Ubud Ink: story-driven homepage | Bob Tattoo: embedded Google reviews via Trustindex; Ubud Ink: owner story, bamboo niche | Not fully extracted this pass | Absent |
| tattoo studio uluwatu | sukaytattoo.com (studio, FAQ: sterilisation/female artists/card tax); saecollectivestudiobali.com (tattoo+barber+piercing); uluwatutattoosbali.com (2 locations — **strongest local page seen**); finnsbeachclub.com piercing guide; balidoneright.com | uluwatutattoosbali: full street addresses + opening hours | Sukay FAQ hygiene/payment specifics; real addresses + hours | Not fully extracted this pass | Absent |
| tattoo studio sanur | quietinkstudio.com/best-tattoo-studio-sanur/ — the ONLY dedicated tattoo page; rest = ctrip/trip.com hotels, nail-salon blog, business listings | Quiet Ink: thin/generic (fetched: no address, prices, artists, reviews) | Almost none | — | Absent |

Weakest SERPs = fastest wins, ranked (`_raw/07` finding 9): 1) mobile/villa cluster; 2) Sanur; 3) Uluwatu; 4) Japanese; 5) Ubud. Hardest: Canggu, Seminyak, fine line (entrenched: Canggu Ink Club ~3.4K reviews, EMD finelinetattoobali.com, Mason's ~3.1K reviews, Tropical Ink specialist — review counts per directory cards, unverified).

### B5. Service-model queries — mobile / villa / concierge (`_raw/07` findings 1–2 + data table; `_raw/05` findings 2–3; `_raw/06` finding 10)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| mobile tattoo bali | hendricshinigamitattoo.com villa guide (**blog post**, not a service page — fetched); trishnandacarecentre.com (clinic hygiene guide); 747ink.com ("under development"); twogunstattoobali.com guide; tattoobali.com aftercare blog | Hendric: medium; hygiene list, process, coverage (Canggu/Seminyak/Uluwatu/Kuta), "free transport in selected areas" — **no prices, no FAQ schema, no legality discussion** | Hendric: single-use needles, sterilized equipment, medical-grade gloves, surface protection, waste disposal | None visible on Hendric post | Absent |
| villa tattoo bali | Hendric guide again; cometoyoutattoo.com (dedicated mobile provider — one-pager); tattooholidaybali.com (tattoo+villa packages, Lovina — adjacent); slinkyvillas.com; wanderlog.com | Come To You: WordPress/Divi one-pager; title literally "Home - Come To You Tattoo" (curl; FetchURL failed — body not fully audited) | Come To You: min 2,500,000 IDR / 200 AUD; "trained under the Australian Health…" (truncated meta) | Not extractable (JS/curl-limited) | Absent |
| "in-villa tattoo" bali | Same set as villa tattoo bali — **no exact-match-optimized page exists** | — | — | — | Absent |
| "tattoo concierge" bali / private tattoo | Quoted search returned only generic villa/home-service results — **term unclaimed**; Secret Arts "private tattoo studio" homepage copy only | — | — | — | Absent |

Counter-narrative to handle: Two Guns' Bali guide explicitly calls hotel/villa tattoos a "biggest mistake" on hygiene grounds — the exact objection to InkedUp's model (`_raw/05` finding 3). Genuine mobile/villa providers found (complete this pass): cometoyoutattoo.com, hendricshinigamitattoo.com, tattooholidaybali.com (adjacent) — no others surfaced (`_raw/07` data table note).

### B6. Style queries (`_raw/07` finding 4 + data table; `_raw/05` style cluster)

| Query | Top results (site — page type — model) | Ranking-page depth | Trust signals observed | Schema observed | inkedup.id? |
|---|---|---|---|---|---|
| fine line tattoo bali | finelinetattoobali.com (EMD specialist); tropicalinkbali.com (fine-line specialist, Seminyak+Canggu); cangguinkclub.com fine-line cost blog; finnsbeachclub.com listicle | EMD specialist site with galleries/FAQ | "12+ years" claim, galleries, price FAQ; Tropical Ink tropical-aftercare guide | Not fully extracted this pass | Absent |
| realism tattoo bali | bloodlinetattoobali.com (appointment-only realism/Japanese/portrait); bagustattoostudio.com; canggutattoostudio.com; cangguinkclub.com/tattoo/realism/ (dedicated style FAQ page — fetched, medium depth); incredibleinkbali.com/realism/; twogunstattoobali.com | Style pages medium depth | Canggu Ink Club style page: technique guidance, "free quote… upfront, transparent price" | Not fully extracted this pass | Absent |
| japanese tattoo bali | hustleinktattoo.com blog guide (names style-specialist artists); besttattooartistbali.com (directory home + /areas/kuta); secretartstattoo.com blogs; tnttattoobali.com; masonsink.com; balidoneright.com | Directory homepage: high (taxonomy + FAQs) | Hustle: named specialist artists; directory: price data, review-count cards | Directory: programmatic taxonomy pages | Absent |

Style landing pages already exist and rank in this market (EMD fine-line site, /tattoo/realism/, /mandala-tattoo-seminyak/ location×style) — style pages are **table stakes, not a differentiator** (`_raw/07` finding 4). Japanese is the softest style SERP — no dedicated specialist page dominates (`_raw/07` findings 4, 9).

---

## C. The ranking bar — what a page must contain to compete

Synthesized from what Google currently rewards in these SERPs (`_raw/06` finding 4 + synthesis "minimum bar"; `_raw/07` findings 5 & 8):

1. **Server-rendered content with keyword-aligned title + H1.** Every competitor serves a server-rendered H1; inkedup.id's raw HTML is a 3.5 KB CSR shell with **0 `<h1>`** (`_raw/06` findings 7, synthesis; `_raw/04` evidence).
2. **Deep, first-person, experience-based copy: ~1,800–2,900 words per intent.** Hustle Ink's guide (~2,900 words: price table, named artists per style, hygiene checklist, timing/aftercare, 8-Q FAQ) ranks top for both the price and safety queries; Social Ink House's owner-voice guide (~1,800 words) ranks #2 for safety; thin ~700-word generic copy (Secret Arts) ranks but below them (`_raw/06` finding 4).
3. **IDR price tables with concrete numbers** (multi-currency IDR/AUD/USD), flat tiers or ranges, marked up with `Offer`/`OfferCatalog`/`AggregateOffer` (`_raw/06` finding 6). Hiding prices cedes the query entirely (Celebrity Ink ranks lower for the price query with "clear quote after consultation" — `_raw/06` finding 6).
4. **Embedded, verifiable third-party reviews + visible counts** (Trustindex/Google embeds on Canggu Ink Club, Bob Tattoo; Bloodline "519+ Reviews on Google") backed by `AggregateRating` schema — only when real (`_raw/06` finding 5; `_raw/07` finding 5).
5. **Named artists with portfolios**, healed work preferred (`_raw/06` synthesis; `_raw/07` finding 5).
6. **Explicit hygiene protocol**: autoclave/sterilization specifics, single-use needles, named ink brands, named clinics/hospitals (`_raw/06` finding 4; `_raw/07` finding 5).
7. **FAQ sections with `FAQPage` markup** on informational posts (`_raw/06` synthesis).
8. **`TattooParlor`/`LocalBusiness` schema with geo + opening hours** (`_raw/06` synthesis).
9. **WhatsApp as the default booking path** with the real number published in content (`_raw/06` finding 9).
10. **Fast mobile delivery** — counter-example: TNT's 1.9 MB homepage (`_raw/06` finding 11).
11. **For location pages specifically** — unique local logistics (travel fee, response time, coverage boundaries), unique local proof (area-tagged portfolio/testimonials/photos), named artists actually covering the area, area-specific FAQs, real CTA. Name-swapped generic copy (Mason's, Quiet Ink) is the doorway-page pattern to **exceed, not copy**; if an area can't support unique content, don't publish the page (`_raw/07` finding 8).

Anything thinner ranks only where intent is uncontested (`_raw/06` synthesis).

---

## D. Incumbent weaknesses — exploitable gaps

| # | Weakness | Evidence | How InkedUp exploits it |
|---|---|---|---|
| 1 | Secret Arts homepage served an **empty `<title>`** tag; first-time guide thin (~700 words, generic); raw-URL internal links | curl + FetchURL, `_raw/06` finding 11 + Table 2 | Basic technical hygiene + deeper first-person content beats their hub |
| 2 | tnttattoobali.com homepage HTML is **1.9 MB** — performance liability; generic copy | curl byte count, `_raw/06` finding 11 + Table 2 | Fast, light pages win on page experience |
| 3 | cometoyoutattoo.com — the #1 mobile-tattoo incumbent — is a one-pager whose title is literally **"Home - Come To You Tattoo"**; no service/location/style subpages; body not fully auditable (JS) | curl + FetchURL fail, `_raw/07` finding 2 | A dedicated, structured /mobile-tattoo-bali service page can plausibly outrank it |
| 4 | hendricshinigamitattoo.com ranks for mobile/villa intent with a **blog post**, not a service page; no prices, no FAQ schema, no legality/permit discussion | FetchURL full text, `_raw/07` finding 2 | Service page + price transparency + FAQ schema + permit framing |
| 5 | Celebrity Ink Kuta location page ships only WebPage/Breadcrumb schema — **no LocalBusiness/TattooParlor**; FAQ text duplicated; no prices | curl, `_raw/06` finding 11 + Table 2 | Proper location schema + unique FAQ + prices |
| 6 | Finns listicle entries are shallow (~60–90 words each), no prices, no vetting methodology; disclaimer admits no quality guarantee | FetchURL, `_raw/06` Table 2 + finding 8 | Deeper, first-hand vetting content; get listed as well |
| 7 | Traveloka listicle thin and monetization-led | `_raw/06` Table 2 | Same play as #6 |
| 8 | Mason's Ink Seminyak location page = generic copy + an 11-area name list; no address, prices, artist names, or area proof | FetchURL, `_raw/07` finding 3 | Genuine per-area content (logistics + proof) per §C.11 |
| 9 | Quiet Ink's Sanur/Ubud pages are generic "best studio" text with no address/prices/artists/reviews — and still rank | FetchURL, `_raw/07` finding 3 | Same play as #8; Sanur is the softest local SERP |
| 10 | **Sanur SERP**: no dedicated tattoo site ranks at all — hotel/nail-salon noise + one generic page | `_raw/07` finding 9 + data table | /locations/sanur with real content can take the SERP |
| 11 | **Japanese style SERP**: no specialist page dominates; a directory and blogs rank | `_raw/07` findings 4, 9 | /styles/japanese with real specialist portfolios |
| 12 | Most studios publish **no prices at all**; the market directory calls published pricing rare ("one of the few") | `_raw/06` findings 6, 11; `_raw/07` finding 10 | Platform-wide transparent pricing (see §E.3) |
| 13 | **Nobody addresses the legality/insurance/permits of mobile tattooing in Bali** — zero competitors in any observed SERP | `_raw/07` findings 2, 10 | Honest legality/insurance trust page = unique E-E-A-T |
| 14 | The Two Guns counter-narrative ("villa tattoos are the biggest mistake") stands publicly unrebutted by any provider | `_raw/05` finding 3 | Evidence-based hygiene dossier that answers the objection head-on |

---

## E. Differentiation opportunities for InkedUp (8–10)

Merged and deduplicated from `_raw/06` synthesis (8 items) and `_raw/07` finding 10 (5 items). All are **opportunities created by gaps**, not by imitating competitor content (see §F).

1. **Own the mobile / in-villa tattoo category with a real service page + hygiene dossier.** The exact SERPs matching InkedUp's model are contested by only two providers — a one-pager titled "Home" and a blog post (`_raw/07` finding 2); the concierge angle is unoccupied in all 6 core SERPs (`_raw/06` finding 10). Build /mobile-tattoo-bali with: explicit sterile protocol exceeding the Hendric baseline list, transparent pricing/minimum call-out + per-area travel fees, coverage matching `areaServed`, process steps, FAQ (safety, villa/hotel permission, groups, tropical aftercare), verifiable reviews, real WhatsApp CTA (`_raw/07` finding 2 fix).
2. **Claim the unclaimed term "tattoo concierge".** Quoted searches surfaced no exact-match competitor (2026-07-17) (`_raw/05` finding 2; `_raw/07` B5 table). Keep "Mobile Tattoo Concierge" in homepage title/H1, reinforce via schema `description` + consistent sitewide phrasing (`_raw/05` finding 2; `_raw/08` recommendation 5).
3. **Platform-wide pricing transparency.** Publish minimums, per-area travel fees, and "from" style prices with multi-currency tables + Offer markup — vs per-studio "quote after consultation" norms; the directory proves published pricing is rare enough to be a selling point (`_raw/06` finding 6; `_raw/07` finding 10.2). Requires owner-verified real pricing (`_raw/05` OWNER-VERIFY 2).
4. **Publish the vetting standard.** A concrete, checkable artist-verification rubric (sterilization audit, portfolio review, healed-work requirement) turns "verified artists" from a claim into evidence no single studio can match (`_raw/06` synthesis item 2). Currently the claim is unsupported — cross-ref 08-trust-gap-analysis.md §A (`_raw/04` findings 4, 8).
5. **Legality / permits / insurance framing.** Zero competitors address the legality or insurance of mobile tattooing in Bali; a clear, honest trust page (what permits/standards the concierge vets artists for) is unique E-E-A-T (`_raw/07` finding 10.3). Do NOT claim anything the owner cannot substantiate (`_raw/07` OWNER-VERIFY 6).
6. **Curated multi-artist roster as content (styles × areas).** Competitors are single studios listing their own artists; besttattooartistbali proves the comparison-directory format ranks, but InkedUp can fulfill the booking end-to-end with a vetted roster (`_raw/07` finding 10.4; `_raw/06` finding 8).
7. **Medical-grade safety content with named reviewers.** A clinic (Trishnanda) ranks for tattoo hygiene queries — proof Google rewards credentialed voices here (`_raw/07` findings 7, 10.5). Publish the definitive "is a villa tattoo safe?" guide with named medical/artist reviewers and a red-flag checklist, directly rebutting the Two Guns "biggest mistake" narrative (`_raw/05` finding 3).
8. **Mandatory healed-work galleries (4–8 weeks post-session) for every listed artist.** Only Bloodline/Hustle even mention healed work today (`_raw/06` synthesis item 4).
9. **Neutral, non-self-serving "how to choose" content.** "How to choose any studio in Bali, including competitors" is the E-E-A-T inverse of every studio's "we're the best" page; publisher listicles prove the format wins, and their entries are shallow (`_raw/06` synthesis item 5 + finding 8).
10. **Per-district coverage done properly + aftercare-as-a-service.** Six areaServed districts with villa/hotel coverage and travel-time detail (competitors each own one neighborhood; InkedUp can legitimately cover all — `_raw/06` synthesis item 8), plus scheduled day-2/day-7 WhatsApp aftercare check-ins — a service loop fixed studios don't offer and a content asset for tropical-healing queries (`_raw/06` synthesis item 7).

Supporting plays (lower priority): outreach for inclusion in besttattooartistbali.com, Finns, Bali Buddies, Bali Done Right, iNi Vie — referrals + local citations (`_raw/07` finding 6 fix, P3); 3–4 supporting guides (mobile-tattoo safety, price guide, tropical aftercare) internally linking to service/location pages (`_raw/07` finding 7, P3).

---

## F. Anti-copy rule (binding)

**Never copy competitor wording, structure, or page patterns.** The weaknesses in §D and the bar in §C describe *what Google rewards* (depth, specificity, verifiable proof) — not a template. Specifically:

- Do not imitate Hustle Ink's or Social Ink House's guide structure, headings, or phrasing; do not reuse their price points, review counts, or claims — those are their evidenced facts, not InkedUp's (`_raw/06` findings 4–6).
- Do not reproduce the Mason's/Quiet Ink name-swapped location-page pattern at higher volume — that pattern is precisely Google's doorway-page definition, and the fix is *genuinely unique* local substance or no page (`_raw/07` findings 3, 8).
- Do not clone besttattooartistbali.com's taxonomy or copy; InkedUp's equivalent pages must be built from InkedUp's own verified roster and pricing data (`_raw/07` finding 10.4).
- Use competitor pages **only as gap evidence**: what they fail to cover (prices, legality, mobile hygiene proof, healed work, area depth) defines InkedUp's content requirements. Every claim on an InkedUp page must be true of InkedUp and verifiable before publication (cross-ref 08-trust-gap-analysis.md §A and `_raw/04` OWNER-VERIFY).

---

## G. Limitations of this synthesis (inherited, UNVERIFIED)

- Search-API SERPs ≠ Google SERPs; no map pack/local pack observable; rankings approximate; no rank tracker (`_raw/06`, `_raw/07` UNVERIFIED).
- `site:inkedup.id` "no results" is an API signal only, not proof of deindexation — needs GSC + browser check (`_raw/05` UNVERIFIED; `_raw/06` finding 2; `_raw/07` UNVERIFIED).
- cangguinkclub.com blog fetch failed 2× (profile from snippet + raw HTML); cometoyoutattoo.com auditable only via curl head/meta (JS); JS-injected competitor schema may be undercounted (`_raw/06`, `_raw/07` UNVERIFIED).
- Competitor review counts (519+, 130+, 3,421, 4,530…) are competitor/directory-published claims, not verified against Google profiles (`_raw/06`, `_raw/07` UNVERIFIED).
- Indonesian-language SERPs ("tato canggu" etc.) not covered — possible additional competitor set (`_raw/07` UNVERIFIED).
- No keyword-volume data anywhere in the evidence; demand is inferred from SERP composition and competitor content investment (`_raw/05` UNVERIFIED).
