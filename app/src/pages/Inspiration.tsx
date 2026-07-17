import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import store from '@/data/store';
import type { InspirationImage } from '@/data/types';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

export default function Inspiration() {
  useSEO({
    title: 'Tattoo Inspiration',
    description:
      'Curated, licensed tattoo inspiration from openly licensed image archives. Browse by style, placement, and artist.',
    path: '/inspiration',
  });
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [total, setTotal] = useState(0);
  const [styleOptions, setStyleOptions] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStyle, setActiveStyle] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      store.getInspirationImages({
        style: activeStyle === 'All' ? undefined : activeStyle,
        q: searchTerm.trim() || undefined,
        limit: 120,
      }),
      store.getInspirationStyles(),
    ])
      .then(([result, styles]) => {
        if (!cancelled) {
          setImages(result.data);
          setTotal(result.total);
          setStyleOptions(['All', ...styles.map((s) => s.style)]);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load inspiration');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activeStyle, searchTerm]);

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
        <div className="absolute inset-0">
          <img
            src="/tattoo-work-3.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover hero-drift"
          />
          <div className="absolute inset-0 bg-midnight-navy/45" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-inkedup relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4">
              GALLERY
            </span>
            <h1 className="font-display text-[clamp(36px,5vw,64px)] font-medium text-pure-white leading-[1.1] tracking-[-0.01em]">
              Tattoo Inspiration
            </h1>
            <p className="font-body text-base text-white/75 max-w-[560px] mx-auto mt-4">
              Browse real work from our verified artists across Bali. Find the style that speaks to you.
            </p>

            <div className="max-w-[600px] mx-auto mt-10">
              <div className="relative flex items-center h-[52px] rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-5 transition-all focus-within:border-[rgba(198,155,60,0.5)] focus-within:shadow-[0_0_0_3px_rgba(198,155,60,0.15)]">
                <Search size={20} className="text-white/50 flex-shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Search by artist or style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent font-body text-[15px] text-pure-white placeholder:text-white/50 outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-white/50 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Gallery */}
      <section className="bg-pure-white section-padding">
        <div className="container-inkedup">
          {loading ? (
            <div className="text-center py-24">
              <Loader2 size={40} className="text-champagne-gold animate-spin mx-auto mb-4" />
              <p className="font-body text-slate-gray">Loading gallery...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="font-body text-coral-rose">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`px-4 py-2 rounded-full border font-body text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      activeStyle === style
                        ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                        : 'bg-pure-white border-light-gray text-charcoal hover:border-champagne-gold hover:text-champagne-gold'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStyle + searchTerm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LightGallery
                    plugins={[lgZoom, lgThumbnail]}
                    speed={500}
                    selector=".inspiration-item"
                    licenseKey="0000-0000-000-0000"
                  >
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                      {images.map((img, i) => (
                        <motion.a
                          key={`${img.id}-${i}`}
                          href={img.imageUrl}
                          data-src={img.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inspiration-item group relative block overflow-hidden rounded-lg cursor-pointer break-inside-avoid"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{
                            duration: 0.5,
                            delay: (i % 6) * 0.05,
                            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                          }}
                        >
                          <img
                            src={img.thumbnailUrl || img.imageUrl}
                            alt={img.title || `${img.styles[0] || 'Tattoo'} inspiration`}
                            className="w-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/90 via-midnight-navy/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                            <p className="font-body text-sm font-semibold text-pure-white">
                              {img.title || `${img.styles[0] || 'Tattoo'} inspiration`}
                            </p>
                            <p className="font-body text-xs text-champagne-gold">
                              {img.styles.slice(0, 3).join(', ')}
                            </p>
                            {img.creator && (
                              <p className="font-body text-[11px] text-white/70 mt-1">
                                by {img.creator}
                              </p>
                            )}
                            {img.license && (
                              <p className="font-body text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">
                                {img.license}
                              </p>
                            )}
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </LightGallery>
                </motion.div>
              </AnimatePresence>

              <p className="text-center font-body text-sm text-slate-gray mb-8">
                Showing {images.length} of {total} images
              </p>

              {images.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <Search size={48} className="text-light-gray mx-auto mb-4" />
                  <p className="font-display text-xl text-slate-gray">No inspiration matches your filters.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setActiveStyle('All'); }}
                    className="mt-6 font-body text-sm font-semibold text-champagne-gold hover:underline"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-midnight-navy py-20 md:py-24">
        <div className="container-inkedup text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <h2 className="font-display text-[clamp(28px,3vw,40px)] text-pure-white">
              Ready to Bring Your Idea to Life?
            </h2>
            <p className="font-body text-base text-white/75 mt-4 max-w-md mx-auto">
              Browse our artists and book your session today.
            </p>
            <Link
              to="/artists"
              className="inline-block mt-8 font-body text-sm font-semibold uppercase tracking-[0.04em] px-10 py-4 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Browse Artists
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
