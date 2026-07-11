import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Users, ArrowRight, Loader2, MapPin } from 'lucide-react';
import PageHero from '@/components/PageHero';
import store from '@/data/store';
import { waLink } from '@/data/business';
import type { Location, Artist } from '@/data/types';

interface LocationDisplay extends Location {
  tag: string;
  image: string;
  artistCount: number;
  sessionCount: string;
  artists: string[];
  moreArtists: number;
}

const LOCATION_META: Record<
  string,
  {
    tag: string;
    image: string;
    description: string;
    sessionCount: string;
    artists: string[];
  }
> = {
  canggu: {
    tag: 'THE CREATIVE HUB',
    image: '/location-canggu.jpg',
    description:
      "Bali's beating heart of creativity. From Batu Bolong to Echo Beach, Canggu draws artists, surfers, and free spirits from around the world. Our most popular location with the largest roster of artists. Perfect for sunset sessions after a morning surf.",
    sessionCount: '200+',
    artists: ['/artist-1.jpg', '/artist-2.jpg', '/artist-3.jpg'],
  },
  seminyak: {
    tag: 'BEACHFRONT LUXURY',
    image: '/location-seminyak.jpg',
    description:
      "Sophisticated, stylish, and effortlessly chic. Seminyak's luxury villas and beachfront resorts attract travelers who expect the best. Our artists here specialize in refined, elegant pieces that match the upscale vibe of the area.",
    sessionCount: '150+',
    artists: ['/artist-3.jpg', '/artist-4.jpg', '/artist-5.jpg'],
  },
  uluwatu: {
    tag: 'CLIFFSIDE RETREATS',
    image: '/location-uluwatu.jpg',
    description:
      "Dramatic cliffs, world-class waves, and some of Bali's most stunning villas. Uluwatu offers a more secluded, exclusive experience. Our artists travel to the Bukit's finest properties for private sessions with breathtaking ocean views.",
    sessionCount: '80+',
    artists: ['/artist-2.jpg', '/artist-5.jpg', '/artist-6.jpg'],
  },
  ubud: {
    tag: 'JUNGLE SERENITY',
    image: '/location-ubud.jpg',
    description:
      "The spiritual and cultural heart of Bali. Surrounded by rice terraces and tropical jungle, Ubud attracts wellness seekers, yoga practitioners, and those looking for meaningful, spiritual tattoo experiences. A perfect setting for mindful ink.",
    sessionCount: '120+',
    artists: ['/artist-1.jpg', '/artist-4.jpg', '/artist-6.jpg'],
  },
  sanur: {
    tag: 'SUNRISE COAST',
    image: '/location-sanur.jpg',
    description:
      "Sanur offers a relaxed, family-friendly atmosphere with calm waters and a beautiful sunrise-facing beach. Ideal for early-morning sessions and travelers seeking a quieter side of Bali without sacrificing convenience.",
    sessionCount: '60+',
    artists: ['/artist-2.jpg', '/artist-3.jpg'],
  },
  kuta: {
    tag: 'SURF & ENERGY',
    image: '/location-kuta.jpg',
    description:
      "Kuta is Bali's legendary surf and nightlife hub. With its energetic beach breaks and walk-in studios, it's perfect for spontaneous travelers who want classic Balinese beach culture and bold, expressive ink.",
    sessionCount: '100+',
    artists: ['/artist-1.jpg', '/artist-5.jpg'],
  },
  'nusa-dua': {
    tag: 'RESORT LUXURY',
    image: '/location-nusa-dua.jpg',
    description:
      "Nusa Dua is home to Bali's most polished resorts and manicured beaches. A refined destination for guests who want a premium, private experience in a secure and serene enclave.",
    sessionCount: '50+',
    artists: ['/artist-4.jpg', '/artist-6.jpg'],
  },
  jimbaran: {
    tag: 'SUNSET BAY',
    image: '/location-jimbaran.jpg',
    description:
      "Jimbaran blends a traditional fishing village with upscale villa living. Famous for beachfront seafood dinners and golden sunsets, it's a romantic setting for meaningful tattoos and relaxed evenings.",
    sessionCount: '70+',
    artists: ['/artist-3.jpg', '/artist-5.jpg'],
  },
};

function toLocationDisplay(loc: Location, artists: Artist[]): LocationDisplay {
  const meta = LOCATION_META[loc.slug];
  const localArtists = artists.filter((a) =>
    a.location.toLowerCase().includes(loc.name.toLowerCase())
  );
  const artistCount = localArtists.length;
  const featuredArtists =
    artistCount > 0
      ? localArtists.slice(0, 3).map((a) => a.photo)
      : meta?.artists || [];
  const moreArtists = Math.max(0, artistCount - 3);

  return {
    ...loc,
    tag: meta?.tag || 'SERVICE AREA',
    image: meta?.image || '/hero-bg.jpg',
    description: loc.description || meta?.description || '',
    artistCount,
    sessionCount: meta?.sessionCount || `${Math.max(artistCount * 25, 25)}+`,
    artists: featuredArtists,
    moreArtists,
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Locations() {
  useSEO({
    title: 'Bali Service Areas',
    description:
      'We come to your villa across Bali — Canggu, Seminyak, Kuta, Uluwatu, Ubud and Sanur. See our mobile tattoo service areas.',
    path: '/locations',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([store.getLocations(), store.getActiveArtists()])
      .then(([locationData, artistData]) => {
        if (!cancelled) {
          setLocations(locationData.filter((l) => l.published));
          setArtists(artistData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load locations');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayLocations = locations
    .sort((a, b) => b.priority - a.priority)
    .map((loc) => toLocationDisplay(loc, artists));

  return (
    <div className="min-h-[100dvh]">
      <PageHero
        image="/location-canggu.jpg"
        label="SERVICE AREAS"
        title="We Come to You, Wherever You Are in Bali"
        subtitle="From the surf breaks of Canggu to the jungles of Ubud — our verified artists travel across Bali to bring the studio to your villa."
      />

      {/* Section 3: Locations Grid */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={40} className="text-champagne-gold animate-spin mb-4" />
              <p className="font-body text-sm text-slate-gray">Loading locations...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <p className="font-display text-xl text-coral-rose">Something went wrong.</p>
              <p className="font-body text-sm text-slate-gray mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 font-body text-sm font-semibold text-champagne-gold hover:underline"
              >
                Try again
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayLocations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  variants={fadeUp}
                  className="group"
                >
                  {/* Image */}
                  <Link to={`/locations/${loc.slug}`} className="relative block aspect-[16/10] rounded-xl overflow-hidden">
                    <motion.img
                      src={loc.image}
                      alt={`${loc.name}, Bali — mobile tattoo service area`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/30 to-transparent" />
                  </Link>

                  {/* Info */}
                  <div className="pt-5">
                    {/* Area tag */}
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                      {loc.tag}
                    </span>

                    {/* Name */}
                    <h3 className="font-display text-[clamp(24px,2.5vw,32px)] font-medium text-midnight-navy mt-1 leading-tight">
                      <Link to={`/locations/${loc.slug}`} className="hover:text-champagne-gold transition-colors">
                        {loc.name}
                      </Link>
                    </h3>

                    {/* Description */}
                    <p className="font-body text-[15px] text-slate-gray leading-[1.7] mt-2">
                      {loc.description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-gray" />
                        <span className="font-body text-[13px] text-slate-gray">{loc.artistCount} Artists</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-gray" />
                        <span className="font-body text-[13px] text-slate-gray">Zone {loc.zone}</span>
                      </div>
                    </div>

                    {/* Featured artists */}
                    {loc.artists.length > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <div className="flex -space-x-2">
                          {loc.artists.map((a, j) => (
                            <img
                              key={j}
                              src={a}
                              alt=""
                              className="w-7 h-7 rounded-full border-2 border-pure-white object-cover"
                              loading="lazy"
                            />
                          ))}
                        </div>
                        {loc.moreArtists > 0 && (
                          <span className="font-body text-[12px] text-champagne-gold ml-1">
                            +{loc.moreArtists} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <Link
                      to={`/locations/${loc.slug}`}
                      className="inline-flex items-center gap-2 mt-4 font-body text-sm font-medium text-midnight-navy hover:text-champagne-gold transition-colors duration-250 group/link"
                    >
                      Explore {loc.name}
                      <ArrowRight size={14} className="transition-transform duration-250 group-hover/link:translate-x-1" />
                    </Link>

                    {/* Go to location — opens the real place in Google Maps */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name}, Bali, Indonesia`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded border border-midnight-navy/15 font-body text-sm font-semibold text-midnight-navy hover:border-champagne-gold hover:text-champagne-gold hover:bg-warm-ivory/40 transition-all duration-250"
                    >
                      <MapPin size={15} />
                      Click to go to the location
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 5: "We Travel to You" CTA */}
      <section
        className="bg-midnight-navy text-center"
        style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}
      >
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(28px,3vw,40px)] font-medium text-pure-white"
            >
              Not in Our Service Area?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 max-w-[480px] mx-auto mt-4"
            >
              We can often arrange sessions in other parts of Bali. Get in touch and we'll see what we can do.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link
                to="/contact"
                className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Contact Us
              </Link>
              <a
                href={waLink("Hi InkedUp, I'm not sure if my area is covered.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-champagne-gold hover:underline transition-colors"
              >
                WhatsApp &rarr;
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
