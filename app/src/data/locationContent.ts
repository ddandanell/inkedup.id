// Per-city SEO content for the /locations/:slug pages.
// Unique, genuinely useful copy per area — not doorway/spam text.
// Pricing/call-out fees come from the API (Location.callOutFee / zone) at render time.

export interface LocationFAQ {
  q: string;
  a: string;
}

export interface LocationContent {
  slug: string;
  name: string;
  tag: string;
  image: string;
  imageAlt: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  popularStyles: string[];
  whyMobile: string[];
  faqs: LocationFAQ[];
  related: string[];
}

export const LOCATION_CONTENT: Record<string, LocationContent> = {
  canggu: {
    slug: 'canggu',
    name: 'Canggu',
    tag: 'The Creative Hub',
    image: '/location-canggu.jpg',
    imageAlt: 'Echo Beach and Batu Bolong coastline in Canggu, Bali at golden hour',
    metaTitle: 'Mobile Tattoo in Canggu, Bali — Artist to Your Villa | InkedUp',
    metaDescription:
      'Book a verified tattoo artist to your Canggu villa. Fine line, blackwork and Japanese styles, sterile mobile setup, free call-out. Half-arm, full-arm and large pieces in IDR.',
    h1: 'Mobile Tattoo Artist in Canggu',
    intro: [
      'Canggu is where most of our guests stay — and for good reason. Between Batu Bolong, Berawa and Echo Beach, the area mixes surf, boutique villas and a creative crowd that takes its ink seriously. It is our busiest service area and home to the widest range of styles on the platform.',
      'Because the streets are busy and parking is limited, having the artist come to your villa is genuinely easier than crossing town to a studio. We bring a full sterile setup, work in your private space, and leave nothing behind but the tattoo and an aftercare kit.',
    ],
    popularStyles: ['Fine line', 'Blackwork', 'Japanese', 'Realism'],
    whyMobile: [
      'Skip Canggu traffic and one-way streets — we come to you.',
      'Most villas here have a shaded terrace or pool pavilion that works perfectly as a private studio.',
      'Free call-out: Canggu is in our primary zone with no travel fee.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Canggu?',
        a: 'No. Canggu is in our primary service zone, so travel to your villa is free. The only upfront cost is the 10% booking deposit that confirms your slot.',
      },
      {
        q: 'How far ahead should I book in Canggu?',
        a: 'Canggu is our most requested area, especially June to September. We suggest booking 5–7 days ahead for a specific artist, though we can sometimes fit you in sooner — message us on WhatsApp to check.',
      },
      {
        q: 'Can you tattoo a group at our Canggu villa?',
        a: 'Yes. Canggu villa groups are some of our most common bookings. Tell us your group size and we will coordinate one or more artists so everyone is looked after in a single visit.',
      },
    ],
    related: ['seminyak', 'kuta', 'ubud'],
  },

  seminyak: {
    slug: 'seminyak',
    name: 'Seminyak',
    tag: 'Beachfront Luxury',
    image: '/location-seminyak.jpg',
    imageAlt: 'Seminyak beach and upscale resort coastline in Bali',
    metaTitle: 'Mobile Tattoo in Seminyak, Bali — Private Villa Sessions | InkedUp',
    metaDescription:
      'Premium mobile tattoo service to your Seminyak villa or resort. Refined fine-line and realism work, sterile setup, free call-out. Discreet, professional, in IDR.',
    h1: 'Mobile Tattoo Artist in Seminyak',
    intro: [
      'Seminyak is the polished end of Bali — beachfront resorts, design-led villas and guests who expect things done properly. Our sessions here lean toward refined, elegant pieces: fine line, soft realism and clean ornamental work that suits the setting.',
      'A mobile setup fits Seminyak perfectly. Your artist arrives discreetly, works in the privacy of your villa, and you spend the rest of the day by the pool instead of in a waiting room. Everything is sterile, single-use and taken away afterwards.',
    ],
    popularStyles: ['Fine line', 'Realism', 'Ornamental', 'Minimalist'],
    whyMobile: [
      'Discreet, private sessions that match the pace of a luxury villa stay.',
      'Free call-out — Seminyak is in our primary zone.',
      'Ideal for couples wanting matching or complementary pieces in one relaxed visit.',
    ],
    faqs: [
      {
        q: 'Do you come to resorts and private villas in Seminyak?',
        a: 'Yes. We work in both private villas and resort rooms across Seminyak and Petitenget. For resorts, we simply ask that you confirm any visitor policy with the front desk first.',
      },
      {
        q: 'Is Seminyak in the free call-out zone?',
        a: 'Yes. There is no travel fee for Seminyak. You only pay the 10% deposit to confirm, then the balance to your studio after the session.',
      },
      {
        q: 'What styles suit a Seminyak booking?',
        a: 'Most guests here choose fine line, soft realism or ornamental pieces — refined work that heals cleanly and photographs beautifully. Your artist will refine the idea during the free consultation.',
      },
    ],
    related: ['canggu', 'kuta', 'nusa-dua'],
  },

  kuta: {
    slug: 'kuta',
    name: 'Kuta',
    tag: 'Surf & Energy',
    image: '/location-kuta.jpg',
    imageAlt: 'Kuta Beach surf and the busy beachfront in Bali',
    metaTitle: 'Mobile Tattoo in Kuta, Bali — Artist to Your Hotel or Villa | InkedUp',
    metaDescription:
      'Get tattooed at your Kuta hotel or villa by a verified artist. Bold traditional, Japanese and blackwork styles, sterile mobile setup, free call-out, prices in IDR.',
    h1: 'Mobile Tattoo Artist in Kuta',
    intro: [
      'Kuta is Bali at its most energetic — surf breaks, busy streets and travelers who decide things on the spot. It is also crowded and hard to park in, which is exactly why a mobile artist makes sense here.',
      'Rather than hunting for a walk-in studio on Legian Street, have a vetted artist come to your hotel or villa with a sterile setup. You get the same bold, expressive work — traditional, Japanese, blackwork — without the guesswork of picking a shop off the street.',
    ],
    popularStyles: ['Traditional', 'Japanese', 'Blackwork', 'Tribal'],
    whyMobile: [
      'Avoid the crowded studio strip and uncertain quality — we bring vetted artists to you.',
      'Free call-out — Kuta is in our primary zone.',
      'Great for travelers on a short stay who want a planned, safe session.',
    ],
    faqs: [
      {
        q: 'Can you come to a hotel in Kuta or Legian?',
        a: 'Yes. We regularly work in Kuta and Legian hotels and villas. We bring everything needed and leave the space exactly as we found it.',
      },
      {
        q: 'Is there a travel fee for Kuta?',
        a: 'No travel fee — Kuta is in our primary zone. A 10% deposit confirms your booking.',
      },
      {
        q: 'I am only in Kuta for a few days. Can I still book?',
        a: 'Usually yes. Message us on WhatsApp with your dates and we will match you with an artist who is free. Smaller pieces are easiest on a tight schedule; larger sleeves need more lead time.',
      },
    ],
    related: ['seminyak', 'canggu', 'jimbaran'],
  },

  uluwatu: {
    slug: 'uluwatu',
    name: 'Uluwatu',
    tag: 'Cliffside Retreats',
    image: '/location-uluwatu.jpg',
    imageAlt: 'Cliffside coastline and surf at Uluwatu on the Bukit Peninsula, Bali',
    metaTitle: 'Mobile Tattoo in Uluwatu, Bali — Bukit Villa Sessions | InkedUp',
    metaDescription:
      'Private tattoo sessions at your Uluwatu cliffside villa. Verified artists, sterile setup, ocean-view settings. Call-out fee applies for the Bukit. Prices in IDR.',
    h1: 'Mobile Tattoo Artist in Uluwatu',
    intro: [
      'Uluwatu and the wider Bukit are Bali at their most dramatic — limestone cliffs, world-class surf and some of the island\'s most private villas. It is a more secluded experience, and a tattoo session with an ocean view is hard to beat.',
      'The Bukit is spread out and the roads are winding, so having the artist travel to you saves a long drive each way. We set up on your terrace or in a quiet room and let you keep the view. A small call-out fee applies for the area, confirmed before you book.',
    ],
    popularStyles: ['Fine line', 'Japanese', 'Ornamental', 'Blackwork'],
    whyMobile: [
      'The Bukit is spread out — we save you a winding drive to a studio.',
      'Cliffside villas give you a private, unforgettable setting for the session.',
      'Transparent call-out fee confirmed upfront, never a surprise.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Uluwatu?',
        a: 'Yes, a small travel fee applies for the Bukit Peninsula. The exact amount is confirmed on WhatsApp before you book, so there are no surprises.',
      },
      {
        q: 'Can you work on a cliffside terrace?',
        a: 'Absolutely, as long as there is shade, a flat surface for the setup and access to power. Most Uluwatu villas are ideal. We will confirm the spot when we plan your session.',
      },
      {
        q: 'Do you cover Bingin, Padang Padang and Pecatu?',
        a: 'Yes — we cover the whole Bukit, including Bingin, Padang Padang, Pecatu, Ungasan and Dreamland.',
      },
    ],
    related: ['jimbaran', 'nusa-dua', 'canggu'],
  },

  ubud: {
    slug: 'ubud',
    name: 'Ubud',
    tag: 'Jungle Serenity',
    image: '/location-ubud.jpg',
    imageAlt: 'Rice terraces and jungle around Ubud, Bali',
    metaTitle: 'Mobile Tattoo in Ubud, Bali — Mindful Villa Sessions | InkedUp',
    metaDescription:
      'Book a verified tattoo artist to your Ubud jungle villa. Mandala, fine line and spiritual designs, sterile setup, relaxed retreat pace. Call-out fee applies. IDR pricing.',
    h1: 'Mobile Tattoo Artist in Ubud',
    intro: [
      'Ubud is the cultural and spiritual heart of Bali — rice terraces, jungle, yoga shalas and people looking for meaning in the things they do. Tattoos here tend to be personal: mandalas, symbols, fine-line pieces tied to a journey or a retreat.',
      'The drive into central Ubud and the rice-field villas beyond it can be slow, so a mobile session lets you stay in the calm of your villa. We set up quietly, work at an unhurried pace, and leave you to the sounds of the jungle. A small call-out fee applies for the area.',
    ],
    popularStyles: ['Fine line', 'Mandala / ornamental', 'Dotwork', 'Script'],
    whyMobile: [
      'Stay in the peace of your jungle or rice-field villa — no drive into town.',
      'Unhurried, private sessions that suit a retreat mindset.',
      'Transparent call-out fee confirmed before booking.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Ubud?',
        a: 'Yes, a small travel fee applies for Ubud and the surrounding villages. We confirm the amount on WhatsApp before you commit.',
      },
      {
        q: 'Do you cover areas outside central Ubud?',
        a: 'Yes. We cover Tegallalang, Penestanan, Sayan, Mas and the wider Gianyar area. Very remote villas may carry a slightly higher fee, which we confirm in advance.',
      },
      {
        q: 'Can you do symbolic or spiritual designs?',
        a: 'Yes. Several of our artists specialise in mandala, ornamental and fine-line symbolic work. Share your idea and we will match you with the right artist for a thoughtful design.',
      },
    ],
    related: ['canggu', 'sanur', 'seminyak'],
  },

  sanur: {
    slug: 'sanur',
    name: 'Sanur',
    tag: 'Sunrise Coast',
    image: '/location-sanur.jpg',
    imageAlt: 'Calm sunrise beach and promenade in Sanur, Bali',
    metaTitle: 'Mobile Tattoo in Sanur, Bali — Relaxed Villa & Hotel Sessions | InkedUp',
    metaDescription:
      'Calm, family-friendly mobile tattoo service in Sanur. Verified artists, sterile setup, early-morning sessions available. Small call-out fee. Prices in IDR.',
    h1: 'Mobile Tattoo Artist in Sanur',
    intro: [
      'Sanur is the quiet side of Bali — a sunrise-facing beach, a gentle promenade and a relaxed, family-friendly pace. It suits guests who want a calm, unhurried tattoo session without the bustle of the west coast.',
      'A mobile session fits Sanur perfectly: we can set up early so you are healed enough to enjoy the rest of the day, and you never have to leave your villa or hotel. A small call-out fee applies for the area.',
    ],
    popularStyles: ['Fine line', 'Script', 'Minimalist', 'Floral'],
    whyMobile: [
      'Early-morning sessions suit Sanur\'s sunrise rhythm.',
      'Quiet, private setting — ideal for first-timers and families.',
      'Transparent call-out fee, confirmed before booking.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Sanur?',
        a: 'Yes, a small travel fee applies for Sanur. We confirm it on WhatsApp before you book.',
      },
      {
        q: 'Can I book an early session?',
        a: 'Yes. Sanur is a great spot for a morning start. Tell us your preferred time and we will do our best to match it.',
      },
      {
        q: 'Do you cover the whole Sanur area?',
        a: 'Yes — including Mertasari, Sindhu and the bypass toward Denpasar. If you are unsure whether your villa is covered, just ask.',
      },
    ],
    related: ['ubud', 'nusa-dua', 'kuta'],
  },

  'nusa-dua': {
    slug: 'nusa-dua',
    name: 'Nusa Dua',
    tag: 'Resort Luxury',
    image: '/location-nusa-dua.jpg',
    imageAlt: 'Manicured beachfront and luxury resorts in Nusa Dua, Bali',
    metaTitle: 'Mobile Tattoo in Nusa Dua, Bali — Private Resort Sessions | InkedUp',
    metaDescription:
      'Discreet mobile tattoo service to Nusa Dua resorts and villas. Premium, private and sterile. Call-out fee applies for the enclave. Prices in IDR.',
    h1: 'Mobile Tattoo Artist in Nusa Dua',
    intro: [
      'Nusa Dua is Bali\'s most polished enclave — manicured beaches, gated resorts and guests who value privacy and quality. A tattoo here should feel the same: calm, professional and discreet.',
      'Because Nusa Dua sits at the southern tip, having the artist come to your resort or villa saves a long round trip and keeps the whole experience private. We confirm the call-out fee in advance and handle everything quietly.',
    ],
    popularStyles: ['Fine line', 'Realism', 'Ornamental', 'Minimalist'],
    whyMobile: [
      'Fully private sessions in your resort or villa — no public studio visit.',
      'Saves a long drive off the peninsula.',
      'Call-out fee confirmed upfront, no surprises.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Nusa Dua?',
        a: 'Yes. Nusa Dua is in our outer zone, so a travel fee applies. We confirm the exact amount before you book.',
      },
      {
        q: 'Can you work inside a resort?',
        a: 'Yes, as long as the resort allows an external visitor. We recommend checking with your concierge first; we are happy to coordinate details with them.',
      },
      {
        q: 'Do you cover Tanjung Benoa and Sawangan?',
        a: 'Yes — we cover the whole Nusa Dua peninsula including Tanjung Benoa and Sawangan.',
      },
    ],
    related: ['uluwatu', 'jimbaran', 'sanur'],
  },

  jimbaran: {
    slug: 'jimbaran',
    name: 'Jimbaran',
    tag: 'Sunset Bay',
    image: '/location-jimbaran.jpg',
    imageAlt: 'Jimbaran Bay beach at sunset with seafood cafes in Bali',
    metaTitle: 'Mobile Tattoo in Jimbaran, Bali — Sunset Villa Sessions | InkedUp',
    metaDescription:
      'Book a verified tattoo artist to your Jimbaran villa. Relaxed sunset sessions, sterile mobile setup, near the airport. Small call-out fee. Prices in IDR.',
    h1: 'Mobile Tattoo Artist in Jimbaran',
    intro: [
      'Jimbaran blends a working fishing village with quiet, upscale villa living — and some of Bali\'s best sunsets. It is a romantic, relaxed setting and conveniently close to the airport, which makes it a popular first or last stop on a Bali trip.',
      'A mobile session here means you can get tattooed and still make it to a seafood dinner on the beach that evening. We come to your villa with a full sterile setup. A small call-out fee applies for the area.',
    ],
    popularStyles: ['Fine line', 'Floral', 'Ornamental', 'Script'],
    whyMobile: [
      'Close to the airport — easy to fit in at the start or end of a trip.',
      'Relaxed, private villa sessions with sunset timing.',
      'Transparent call-out fee confirmed before booking.',
    ],
    faqs: [
      {
        q: 'Is there a call-out fee for Jimbaran?',
        a: 'Yes, a small travel fee applies. We confirm it on WhatsApp before you book.',
      },
      {
        q: 'How close is Jimbaran to the airport?',
        a: 'Very close — usually 15 to 20 minutes. It is one of the easiest areas to schedule around a flight, as long as you allow healing time before swimming or long travel.',
      },
      {
        q: 'Do you cover Kedonganan and the Four Seasons area?',
        a: 'Yes — we cover all of Jimbaran Bay, including Kedonganan and the resort strip.',
      },
    ],
    related: ['uluwatu', 'kuta', 'nusa-dua'],
  },
};

export function getLocationContent(slug: string): LocationContent | undefined {
  return LOCATION_CONTENT[slug];
}

export const ALL_LOCATION_SLUGS = Object.keys(LOCATION_CONTENT);
