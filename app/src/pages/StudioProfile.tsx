import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Instagram,
  Mail,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import ArtistCard from '@/components/ArtistCard';
import store from '@/data/store';
import type { Studio, Artist } from '@/data/types';
import { useSEO } from '@/hooks/useSEO';

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const trimmed = text.slice(0, max);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

function buildStudioDescription(studio: Studio): string {
  if (studio.bio) {
    return truncate(
      `${studio.name} is a tattoo studio in ${studio.location}. ${studio.bio}`,
      160
    );
  }
  return `${studio.name} is a verified tattoo studio in ${studio.location}.`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function StudioProfile() {
  const { id } = useParams<{ id: string }>();

  const [studio, setStudio] = useState<Studio | undefined>(undefined);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [studioData, activeArtists] = await Promise.all([
          id ? store.getStudioById(id) : Promise.resolve(undefined),
          store.getActiveArtists(),
        ]);
        if (!cancelled) {
          setStudio(studioData);
          setArtists(activeArtists);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load studio');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const studioArtists = useMemo(() => {
    if (!studio) return [];
    return artists.filter((a) => a.studioId === studio.id || studio.artistIds.includes(a.id));
  }, [studio, artists]);

  const studioPath = `/studios/${id ?? ''}`;
  const studioTitle = studio
    ? `${studio.name} — Tattoo Studio in ${studio.location}`
    : 'Studio Profile';
  const studioDescription = studio
    ? buildStudioDescription(studio)
    : 'View verified tattoo studios on InkedUp.';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.inkedup.id';

  // NOTE: keep this hook call before any early returns to satisfy React hooks rules.
  useSEO({
    title: studioTitle,
    description: studioDescription,
    path: studioPath,
    canonical: studioPath,
    image: studio?.logoUrl || '/tattoo-work-4.jpg',
    jsonLd: studio
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Studios', item: `${origin}/studios` },
              { '@type': 'ListItem', position: 3, name: studio.name, item: `${origin}${studioPath}` },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'TattooParlor',
            name: studio.name,
            description: studio.bio || `Tattoo studio in ${studio.location}`,
            url: `${origin}${studioPath}`,
            image: studio.logoUrl || '/tattoo-work-4.jpg',
            areaServed: {
              '@type': 'City',
              name: studio.location,
            },
          },
        ]
      : undefined,
  });

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory">
        <Loader2 size={40} className="text-champagne-gold animate-spin" />
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl text-midnight-navy">
            {error ? 'Something went wrong' : 'Studio not found'}
          </h1>
          <p className="font-body text-slate-gray mt-2">
            {error || "The studio you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/studios"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-champagne-gold hover:underline"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Studios
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Cover */}
      <section className="relative">
        <div className="relative w-full h-[220px] md:h-[360px] overflow-hidden">
          <img
            src={studio.logoUrl || '/tattoo-work-4.jpg'}
            alt={studio.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(11,31,63,0.8)]" />
        </div>

        <div className="container-inkedup relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative -mt-[60px] md:-mt-[80px] mx-auto max-w-[800px] w-[90%] bg-pure-white rounded-xl shadow-[0_8px_40px_rgba(11,31,63,0.12)] p-6 md:p-8"
          >
            <h1 className="font-display text-[clamp(28px,3vw,40px)] font-medium text-midnight-navy leading-tight">
              {studio.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-slate-gray">
              <MapPin size={14} />
              <span className="font-body text-sm">{studio.location}</span>
            </div>
            {studio.address && (
              <p className="font-body text-sm text-slate-gray mt-1">{studio.address}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-5">
              <a
                href={`mailto:${studio.email}`}
                className="inline-flex items-center gap-1.5 font-body text-sm text-champagne-gold hover:underline"
              >
                <Mail size={14} /> {studio.email}
              </a>
              {studio.instagram && (
                <a
                  href={`https://instagram.com/${studio.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-sm text-champagne-gold hover:underline"
                >
                  <Instagram size={14} /> {studio.instagram}
                </a>
              )}
              <a
                href={store.getWhatsAppUrl(studio.whatsappNumber, `Hi ${studio.name}, I'm interested in booking a session.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-sm text-bali-teal hover:underline"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-pure-white border-b border-light-gray">
        <div className="container-inkedup py-3">
          <ol className="flex items-center gap-2 font-body text-[13px] text-slate-gray">
            <li><Link to="/" className="hover:text-champagne-gold">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/studios" className="hover:text-champagne-gold">Studios</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-midnight-navy font-medium" aria-current="page">{studio.name}</li>
          </ol>
        </div>
      </nav>

      {/* Artists */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3"
            >
              ARTISTS AT THIS STUDIO
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(28px,3vw,40px)] font-medium text-midnight-navy"
            >
              Meet the Team
            </motion.h2>
          </motion.div>

          {studioArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studioArtists.map((artist, i) => (
                <ArtistCard key={artist.id} artist={artist} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-pure-white rounded-xl">
              <p className="font-body text-slate-gray">No artists listed for this studio yet.</p>
              <Link
                to="/artists"
                className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-champagne-gold hover:underline"
              >
                Browse All Artists <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
