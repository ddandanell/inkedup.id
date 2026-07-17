import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Star,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  Instagram,
} from 'lucide-react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import ArtistCard from '@/components/ArtistCard';
import store from '@/data/store';
import type { Artist } from '@/data/types';
import { useSEO } from '@/hooks/useSEO';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Portfolio gallery images ─── */
const PORTFOLIO_IMAGES = [
  { src: '/tattoo-work-1.jpg', alt: 'Fine-line floral tattoo', aspect: '3/4' },
  { src: '/tattoo-work-2.jpg', alt: 'Traditional Balinese tattoo', aspect: '1/1' },
  { src: '/tattoo-work-3.jpg', alt: 'Minimalist geometric tattoo', aspect: '4/5' },
  { src: '/tattoo-work-4.jpg', alt: 'Japanese sleeve in progress', aspect: '1/1' },
  { src: '/tattoo-work-5.jpg', alt: 'Delicate script lettering', aspect: '3/4' },
  { src: '/tattoo-work-6.jpg', alt: 'Watercolor style tattoo', aspect: '4/3' },
  { src: '/tattoo-work-1.jpg', alt: 'Botanical design detail', aspect: '4/5' },
  { src: '/tattoo-work-3.jpg', alt: 'Geometric wrist piece', aspect: '1/1' },
  { src: '/tattoo-work-5.jpg', alt: 'Tiny finger tattoo', aspect: '3/4' },
];

/* Reviews shown here come from completed, verified bookings (real rating + count above). */

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const trimmed = text.slice(0, max);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…';
}

function buildArtistDescription(artist: Artist): string {
  if (artist.bio) {
    return truncate(
      `${artist.displayName} is a tattoo artist in ${artist.location}. ${artist.bio}`,
      160
    );
  }
  return `${artist.displayName} is a verified tattoo artist in ${artist.location} specializing in ${artist.styles.join(', ')}.`;
}

function MiniCalendar() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const availableDates = new Set([5, 8, 9, 12, 15, 16, 19, 22, 23, 26, 29, 30]);
  const unavailableDates = new Set([1, 2, 3, 6, 7, 10, 13, 17, 20, 24, 27, 31]);

  return (
    <div className="w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-sm font-semibold text-midnight-navy">
          {today.toLocaleString('default', { month: 'long' })} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center font-body text-[11px] font-semibold text-slate-gray uppercase py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isAvailable = availableDates.has(day);
          const isUnavailable = unavailableDates.has(day);
          return (
            <div
              key={day}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-body text-sm font-medium mx-auto ${
                isAvailable
                  ? 'bg-bali-teal text-pure-white'
                  : isUnavailable
                  ? 'text-light-gray line-through'
                  : 'text-charcoal'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ArtistProfile() {
  const { slug } = useParams<{ slug: string }>();

  const [artist, setArtist] = useState<Artist | undefined>(undefined);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [artistData, activeArtists] = await Promise.all([
          slug ? store.getArtistBySlug(slug) : Promise.resolve(undefined),
          store.getActiveArtists(),
        ]);
        if (!cancelled) {
          setArtist(artistData);
          setAllArtists(activeArtists);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load artist');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [slug]);

  const relatedArtists = useMemo(() => {
    if (!artist) return [];
    return allArtists
      .filter((a) => a.id !== artist.id && a.styles.some((s) => artist.styles.includes(s)))
      .slice(0, 3);
  }, [artist, allArtists]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % PORTFOLIO_IMAGES.length);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + PORTFOLIO_IMAGES.length) % PORTFOLIO_IMAGES.length);
  }, []);

  /* Keyboard navigation */
  useState(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const artistPath = `/artists/${slug ?? ''}`;
  const artistTitle = artist
    ? `${artist.displayName} — Tattoo Artist in ${artist.location}`
    : 'Artist Profile';
  const artistDescription = artist
    ? buildArtistDescription(artist)
    : 'View verified tattoo artist profiles on InkedUp.';

  // NOTE: keep this hook call before any early returns to satisfy React hooks rules.

  useSEO({
    title: artistTitle,
    description: artistDescription,
    path: artistPath,
    canonical: artistPath,
    image: artist?.photo,
    jsonLd: artist
      ? {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: artist.displayName,
          description: artist.bio || `Tattoo artist in ${artist.location}`,
          jobTitle: 'Tattoo Artist',
          knowsAbout: artist.styles,
          url: artistPath,
          image: artist.photo,
        }
      : undefined,
  });

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory">
        <div className="font-body text-slate-gray">Loading artist...</div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl text-midnight-navy">Something went wrong</h1>
          <p className="font-body text-slate-gray mt-2">{error}</p>
          <Link
            to="/artists"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-champagne-gold hover:underline"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Artists
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!artist) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl text-midnight-navy">Artist not found</h1>
          <p className="font-body text-slate-gray mt-2">
            The artist you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            to="/artists"
            className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-champagne-gold hover:underline"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Artists
          </Link>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: 'Rating', value: artist.rating.toFixed(1), icon: Star },
    { label: 'Reviews', value: String(artist.reviewCount) },
    { label: 'Sessions', value: `${artist.reviewCount * 2}+` },
    { label: 'Experience', value: `${artist.yearsOfExperience} years` },
  ];

  return (
    <div className="min-h-[100dvh]">
      {/* ── Section 2: Cover + Profile Header ── */}
      <section className="relative">
        {/* Cover Image */}
        <div className="relative w-full h-[200px] md:h-[320px] overflow-hidden">
          <img
            src="/tattoo-work-4.jpg"
            alt="Cover"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(11,31,63,0.8)]" />
        </div>

        {/* Profile Card */}
        <div className="container-inkedup relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="relative -mt-[60px] md:-mt-[80px] mx-auto max-w-[800px] w-[90%] bg-pure-white rounded-xl shadow-[0_8px_40px_rgba(11,31,63,0.12)] p-6 md:p-8"
          >
            {/* Row 1: Avatar + Name + CTA */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              {/* Avatar */}
              <div className="-mt-16 md:-mt-20 flex-shrink-0">
                <img
                  src={artist.photo}
                  alt={artist.displayName}
                  className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] rounded-full object-cover border-4 border-pure-white shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
                />
              </div>

              {/* Name block */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-[clamp(28px,3vw,36px)] font-medium text-midnight-navy leading-tight">
                  {artist.displayName}
                </h1>
                <div className="flex items-center gap-1.5 mt-1 text-slate-gray">
                  <MapPin size={14} />
                  <span className="font-body text-sm">{artist.location}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(26,107,94,0.1)]">
                  <CheckCircle2 size={14} className="text-bali-teal" />
                  <span className="font-body text-xs font-semibold text-bali-teal">Verified Artist</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/booking/${artist.slug}`}
                className="mt-4 md:mt-0 inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex-shrink-0"
              >
                Book a Session
              </Link>
            </div>

            {/* Row 2: Stats */}
            <div className="grid grid-cols-4 mt-6 pt-6 border-t border-light-gray">
              {stats.map((s, i) => (
                <div key={s.label} className={`min-w-0 px-1 text-center ${i > 0 ? 'border-l border-light-gray' : ''}`}>
                  <div className="font-mono text-[15px] md:text-xl font-medium text-midnight-navy whitespace-nowrap">
                    {s.value}
                  </div>
                  <div className="font-body text-[10px] md:text-xs text-slate-gray uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 3: Bio & Details ── */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <div className="container-inkedup">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: Bio */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3">
                ABOUT
              </span>
              <h2 className="font-display text-[28px] font-medium text-midnight-navy mb-5">
                The Artist
              </h2>
              <div className="space-y-4">
                {artist.bio.split('. ').reduce<string[][]>((acc, sentence, i, arr) => {
                  // Group sentences into paragraphs of ~2-3 sentences
                  if (i % 2 === 0) {
                    const next = arr[i + 1];
                    const text = next ? `${sentence}. ${next}.` : `${sentence}.`;
                    acc.push([text]);
                  }
                  return acc;
                }, []).flat().map((paragraph, i) => (
                  <p key={i} className="font-body text-base text-charcoal leading-[1.7]">
                    {paragraph}
                  </p>
                )) || <p className="font-body text-base text-charcoal leading-[1.7]">{artist.bio}</p>}
              </div>
            </motion.div>

            {/* Right: Details */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {/* Styles */}
              <div>
                <h4 className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                  STYLES
                </h4>
                <div className="flex flex-wrap gap-2">
                  {artist.styles.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[11px] font-semibold uppercase tracking-[0.12em]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">
                  LANGUAGES
                </h4>
                <p className="font-body text-sm text-charcoal">{artist.languages.join(', ')}</p>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                  SPECIALTIES
                </h4>
                <div className="space-y-2">
                  {artist.specialties.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-bali-teal flex-shrink-0" />
                      <span className="font-body text-sm text-charcoal">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h4 className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">
                  EQUIPMENT
                </h4>
                <p className="font-body text-sm text-charcoal">Rotary machine, Single-needle sets, Vegan inks</p>
              </div>

              {/* Social */}
              {artist.instagram && (
                <div>
                  <h4 className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">
                    SOCIAL
                  </h4>
                  <a
                    href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-body text-sm text-champagne-gold hover:underline"
                  >
                    <Instagram size={16} />
                    {artist.instagram}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Portfolio Gallery ── */}
      <section className="bg-warm-ivory py-16 md:py-24">
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3"
            >
              PORTFOLIO
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(28px,3vw,40px)] font-medium text-midnight-navy mb-10"
            >
              Selected Works
            </motion.h2>
          </motion.div>

          <LightGallery
            plugins={[lgZoom, lgThumbnail]}
            speed={500}
            selector=".portfolio-item"
            licenseKey="0000-0000-000-0000"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PORTFOLIO_IMAGES.map((img, i) => (
                <motion.a
                  key={i}
                  href={img.src}
                  data-src={img.src}
                  className="portfolio-item group relative overflow-hidden rounded-lg cursor-pointer"
                  style={{ aspectRatio: img.aspect }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    openLightbox(i);
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[rgba(11,31,63,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn size={24} className="text-pure-white" />
                  </div>
                </motion.a>
              ))}
            </div>
          </LightGallery>
        </div>
      </section>

      {/* ── Section 5: Reviews ── */}
      <section className="py-16 md:py-24">
        <div className="container-inkedup max-w-[700px] lg:max-w-[900px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="flex items-start justify-between mb-10"
          >
            <div>
              <motion.span
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3"
              >
                REVIEWS
              </motion.span>
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="font-display text-[28px] font-medium text-midnight-navy"
              >
                What Clients Say
              </motion.h2>
            </div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="text-right"
            >
              <div className="font-display text-4xl font-medium text-midnight-navy">
                {artist.rating.toFixed(1)}
              </div>
              <div className="font-body text-sm text-slate-gray">{artist.reviewCount} reviews</div>
            </motion.div>
          </motion.div>

          <div className="bg-pure-white border border-light-gray rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  size={20}
                  className={si < Math.round(artist.rating) ? 'fill-champagne-gold text-champagne-gold' : 'text-light-gray'}
                />
              ))}
            </div>
            <p className="font-display text-[28px] font-medium text-midnight-navy">
              {artist.rating.toFixed(1)}<span className="text-slate-gray text-lg">/5</span>
            </p>
            <p className="font-body text-[15px] text-slate-gray mt-2">
              Based on {artist.reviewCount} client {artist.reviewCount === 1 ? 'review' : 'reviews'}
            </p>
            <p className="font-body text-[13px] text-slate-gray mt-3 max-w-md mx-auto">
              Detailed written reviews from completed sessions are being collected here.
            </p>
            <p className="inline-flex items-center gap-1.5 font-body text-[12px] text-bali-teal mt-3">
              <CheckCircle2 size={13} /> Only verified bookings can leave a review
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 6: Availability & Booking CTA ── */}
      <section className="bg-midnight-navy py-16 md:py-24">
        <div className="container-inkedup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3">
                AVAILABILITY
              </span>
              <h2 className="font-display text-[clamp(28px,3vw,40px)] font-medium text-pure-white mb-3">
                Book Your Session
              </h2>
              <p className="font-body text-base text-white/75 mb-8 max-w-md">
                Check available dates and book directly. We&apos;ll handle the rest.
              </p>
              <div className="bg-pure-white rounded-xl p-6 inline-block">
                <MiniCalendar />
              </div>
              <p className="mt-4">
                <Link
                  to={`/booking/${artist.slug}`}
                  className="inline-flex items-center gap-2 font-body text-sm text-champagne-gold hover:underline"
                >
                  View Full Calendar <ArrowRight size={14} />
                </Link>
              </p>
            </motion.div>

            {/* Right: Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-pure-white rounded-xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
            >
              <h3 className="font-display text-[22px] font-medium text-midnight-navy mb-2">
                Start Your Booking
              </h3>
              <div className="font-mono text-[28px] font-medium text-champagne-gold mb-6">
                From {store.formatIDR(artist.pricing.small)}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                    Preferred Style
                  </label>
                  <select className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all cursor-pointer">
                    {artist.styles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                    Tattoo Size
                  </label>
                  <select className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all cursor-pointer">
                    <option>Small (up to 5cm)</option>
                    <option>Medium (5-15cm)</option>
                    <option>Large (15cm+)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <CalendarIcon
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-gray pointer-events-none"
                    />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all"
                    />
                  </div>
                </div>
              </div>

              <Link
                to={`/booking/${artist.slug}`}
                className="block text-center mt-6 font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Continue Booking &rarr;
              </Link>
              <p className="font-body text-xs text-slate-gray text-center mt-3">
                No payment required yet. We&apos;ll confirm availability first.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Related Artists ── */}
      {relatedArtists.length > 0 && (
        <section className="py-16 md:py-24 bg-pure-white">
          <div className="container-inkedup">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.span
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3"
              >
                DISCOVER MORE
              </motion.span>
              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="font-display text-[28px] font-medium text-midnight-navy mb-10"
              >
                You Might Also Like
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArtists.map((a, i) => (
                <ArtistCard key={a.id} artist={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-[rgba(11,31,63,0.95)] backdrop-blur-lg flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center text-pure-white hover:text-champagne-gold transition-colors"
            >
              <X size={28} />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-pure-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              src={PORTFOLIO_IMAGES[lightboxIndex].src}
              alt={PORTFOLIO_IMAGES[lightboxIndex].alt}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center text-pure-white hover:bg-white/30 transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/70">
              {lightboxIndex + 1} / {PORTFOLIO_IMAGES.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
