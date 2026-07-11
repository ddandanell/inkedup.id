import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Loader2, Plus, Check, MessageCircle } from 'lucide-react';
import PageHero from '@/components/PageHero';
import store from '@/data/store';
import business, { waLink } from '@/data/business';
import { useSEO } from '@/hooks/useSEO';
import { getLocationContent } from '@/data/locationContent';
import type { Location, Artist } from '@/data/types';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function FAQItem({ id, q, a, isOpen, onClick }: { id: string; q: string; a: string; isOpen: boolean; onClick: () => void }) {
  const panelId = `loc-faq-${id}`;
  const btnId = `loc-faq-btn-${id}`;
  return (
    <div className="border-b border-light-gray">
      <button
        id={btnId}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`font-display text-lg font-medium pr-4 transition-colors ${isOpen ? 'text-champagne-gold' : 'text-midnight-navy group-hover:text-champagne-gold'}`}>
          {q}
        </span>
        <Plus size={20} aria-hidden="true" className={`text-champagne-gold flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="font-body text-[15px] text-slate-gray leading-[1.7] pb-5 max-w-[95%]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LocationPage() {
  const { slug = '' } = useParams();
  const content = getLocationContent(slug);

  const [location, setLocation] = useState<Location | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    Promise.all([store.getLocations(), store.getActiveArtists()])
      .then(([locs, arts]) => {
        if (cancelled) return;
        const loc = locs.find((l) => l.slug === slug && l.published);
        if (!loc) {
          setNotFound(true);
        } else {
          setLocation(loc);
          setArtists(arts);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const localArtists = useMemo(() => {
    if (!location) return [];
    return artists
      .filter((a) => a.location.toLowerCase().includes(location.name.toLowerCase()))
      .slice(0, 6);
  }, [artists, location]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://inkedup.id';

  const jsonLd = content
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: 'Locations', item: `${origin}/locations` },
            { '@type': 'ListItem', position: 3, name: content.name, item: `${origin}/locations/${content.slug}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `Mobile tattoo in ${content.name}`,
          serviceType: 'Mobile tattoo service',
          areaServed: { '@type': 'City', name: `${content.name}, Bali` },
          provider: {
            '@type': 'TattooParlor',
            name: business.name,
            telephone: business.whatsappDisplay,
            url: `${origin}/`,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
      ]
    : undefined;

  useSEO({
    title: content?.metaTitle ?? 'Location',
    description: content?.metaDescription ?? 'Mobile tattoo service area in Bali.',
    path: `/locations/${slug}`,
    image: content?.image,
    jsonLd,
  });

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-champagne-gold animate-spin mb-4" />
        <p className="font-body text-sm text-slate-gray">Loading…</p>
      </div>
    );
  }

  if (notFound || !content || !location) {
    return <Navigate to="/not-found" replace />;
  }

  const freeCallout = location.callOutFee === 0;
  const related = content.related
    .map((s) => getLocationContent(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="min-h-[100dvh]">
      <PageHero
        image={content.image}
        label={content.tag}
        title={content.h1}
        subtitle="Verified studio artists, sterile mobile setup, we come to your villa. Final quote confirmed on WhatsApp — pricing in IDR."
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-pure-white border-b border-light-gray">
        <div className="container-inkedup py-3">
          <ol className="flex items-center gap-2 font-body text-[13px] text-slate-gray">
            <li><Link to="/" className="hover:text-champagne-gold">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/locations" className="hover:text-champagne-gold">Locations</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-midnight-navy font-medium" aria-current="page">{content.name}</li>
          </ol>
        </div>
      </nav>

      {/* Intro */}
      <section className="bg-pure-white" style={{ padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container-inkedup max-w-[820px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ staggerChildren: 0.1 }}>
            {content.intro.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="font-body text-[16px] text-charcoal leading-[1.8] mb-5"
              >
                {p}
              </motion.p>
            ))}
          </motion.div>

          {/* Popular styles */}
          <div className="mt-8">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
              Popular styles in {content.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {content.popularStyles.map((s) => (
                <span key={s} className="font-body text-sm px-4 py-1.5 rounded-full border border-champagne-gold/40 bg-champagne-gold/5 text-midnight-navy">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why mobile + transport */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container-inkedup grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1040px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-pure-white rounded-xl border border-light-gray p-7"
          >
            <h2 className="font-display text-2xl font-medium text-midnight-navy mb-5">
              Why mobile works in {content.name}
            </h2>
            <ul className="space-y-3.5">
              {content.whyMobile.map((w) => (
                <li key={w} className="flex items-start gap-3">
                  <Check size={18} className="text-bali-teal flex-shrink-0 mt-0.5" />
                  <span className="font-body text-[15px] text-charcoal leading-[1.6]">{w}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-pure-white rounded-xl border border-light-gray p-7"
          >
            <h2 className="font-display text-2xl font-medium text-midnight-navy mb-5">
              Travel &amp; pricing
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin size={18} className="text-champagne-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-[15px] font-semibold text-midnight-navy">
                  {freeCallout ? 'Free call-out' : `${store.formatIDR(location.callOutFee)} travel fee`}
                </p>
                <p className="font-body text-[13px] text-slate-gray mt-0.5">
                  {freeCallout
                    ? `${content.name} is in our primary zone — no travel fee.`
                    : `Zone ${location.zone} area. The travel fee is confirmed before you book, so there are no surprises.`}
                </p>
              </div>
            </div>
            <div className="border-t border-light-gray my-4" />
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-charcoal">10% deposit to confirm, 90% to your studio after the session.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-charcoal">Final price set by your studio during the free consultation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-charcoal">Sterile, single-use setup brought to your villa.</span>
              </li>
            </ul>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 mt-5 font-body text-sm font-semibold text-champagne-gold hover:underline"
            >
              See full pricing &amp; calculator <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Artists serving this area */}
      {localArtists.length > 0 && (
        <section className="bg-pure-white" style={{ padding: 'clamp(64px, 8vw, 110px) 0' }}>
          <div className="container-inkedup max-w-[1040px]">
            <div className="text-center mb-10">
              <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3">
                VERIFIED ARTISTS
              </span>
              <h2 className="font-display text-[clamp(26px,3vw,40px)] font-medium text-midnight-navy">
                Artists serving {content.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {localArtists.map((a) => (
                <Link
                  key={a.id}
                  to={`/artists/${a.slug}`}
                  className="group text-center"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-warm-ivory mb-2">
                    <img
                      src={a.photo}
                      alt={`${a.displayName}, tattoo artist serving ${content.name}`}
                      width={300}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-body text-sm font-semibold text-midnight-navy group-hover:text-champagne-gold transition-colors">
                    {a.displayName}
                  </p>
                  <p className="font-body text-[11px] text-slate-gray">{a.styles.slice(0, 2).join(' · ')}</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/artists"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold text-midnight-navy hover:text-champagne-gold transition-colors"
              >
                Browse all artists <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container-inkedup max-w-[760px]">
          <div className="text-center mb-10">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-3">
              FAQ
            </span>
            <h2 className="font-display text-[clamp(26px,3vw,40px)] font-medium text-midnight-navy">
              Getting tattooed in {content.name}
            </h2>
          </div>
          <div>
            {content.faqs.map((f, i) => (
              <FAQItem
                key={f.q}
                id={String(i)}
                q={f.q}
                a={f.a}
                isOpen={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Related locations */}
      {related.length > 0 && (
        <section className="bg-pure-white" style={{ padding: 'clamp(48px, 6vw, 80px) 0' }}>
          <div className="container-inkedup max-w-[1040px]">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-4 text-center">
              Nearby service areas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/locations/${r.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-light-gray bg-warm-ivory p-4 hover:border-champagne-gold transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={r.image} alt="" width={128} height={128} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-midnight-navy group-hover:text-champagne-gold transition-colors">
                      {r.name}
                    </p>
                    <p className="font-body text-[12px] text-slate-gray">{r.tag}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-midnight-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-inkedup text-center">
          <h2 className="font-display text-[clamp(28px,3vw,40px)] font-medium text-pure-white">
            Ready to get tattooed in {content.name}?
          </h2>
          <p className="font-body text-base text-white/75 max-w-[480px] mx-auto mt-4">
            Tell us your idea and where you&apos;re staying. We&apos;ll match you with a verified artist and confirm the plan on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a
              href={waLink(`Hi InkedUp, I'd like to book a tattoo in ${content.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <MessageCircle size={16} /> Book in {content.name}
            </a>
            <Link
              to="/artists"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-champagne-gold hover:underline transition-colors"
            >
              Browse artists <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
