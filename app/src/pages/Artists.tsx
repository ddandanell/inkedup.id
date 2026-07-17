import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, Grid3X3, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ArtistCard from '@/components/ArtistCard';
import store from '@/data/store';
import type { Artist } from '@/data/types';
import { useSEO } from '@/hooks/useSEO';

const STYLE_FILTERS = [
  'All', 'Fine Line', 'Blackwork', 'Traditional', 'Japanese',
  'Watercolor', 'Minimalist', 'Geometric', 'Realism', 'Tribal', 'Floral', 'Script',
];

const LOCATION_FILTERS = ['All', 'Canggu', 'Seminyak', 'Uluwatu', 'Ubud'];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bookings', label: 'Most Bookings' },
  { value: 'newest', label: 'Newest' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Artists() {
  useSEO({
    title: 'Verified Tattoo Artists',
    description:
      'Browse verified tattoo artists in Bali from our partner studios — fine line, blackwork, Japanese, realism and more. Book via WhatsApp.',
    path: '/artists',
  });
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    store.getActiveArtists()
      .then(data => {
        if (!cancelled) {
          setArtists(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load artists');
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await store.getActiveArtists();
      setArtists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeStyles, setActiveStyles] = useState<string[]>(['All']);
  const [activeLocation, setActiveLocation] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounced search would be better but inline is fine for mock data
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const toggleStyle = useCallback((style: string) => {
    if (style === 'All') {
      setActiveStyles(['All']);
      return;
    }
    setActiveStyles(prev => {
      const filtered = prev.filter(s => s !== 'All');
      if (filtered.includes(style)) {
        const next = filtered.filter(s => s !== style);
        return next.length === 0 ? ['All'] : next;
      }
      return [...filtered, style];
    });
  }, []);

  const filtered = useMemo(() => {
    let result = artists;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        a =>
          a.displayName.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.styles.some(s => s.toLowerCase().includes(q))
      );
    }

    // Style filter (OR logic)
    if (!activeStyles.includes('All')) {
      result = result.filter(a =>
        activeStyles.some(s => a.styles.includes(s))
      );
    }

    // Location filter (single-select)
    if (activeLocation !== 'All') {
      result = result.filter(a => a.location.includes(activeLocation));
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'bookings':
        result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      default:
        break;
    }

    return result;
  }, [artists, searchTerm, activeStyles, activeLocation, sortBy]);

  const activeFilterCount =
    (activeStyles.includes('All') ? 0 : activeStyles.length) +
    (activeLocation !== 'All' ? 1 : 0);

  return (
    <div className="min-h-[100dvh]">
      {/* Section 2: Page Header */}
      <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
        <div className="absolute inset-0">
          <img
            src="/tattoo-work-1.jpg"
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              OUR ARTISTS
            </motion.span>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(36px,5vw,64px)] font-medium text-pure-white leading-[1.1] tracking-[-0.01em]"
            >
              Meet the Talent Behind the Ink
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 max-w-[560px] mx-auto mt-4"
            >
              Every artist is hand-selected, background-checked, and personally verified. Only the best make it onto our platform.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="max-w-[600px] mx-auto mt-10"
            >
              <div className="relative flex items-center h-[52px] rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-5 transition-all focus-within:border-[rgba(198,155,60,0.5)] focus-within:shadow-[0_0_0_3px_rgba(198,155,60,0.15)]">
                <Search size={20} className="text-white/50 flex-shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Search by name, style, or location..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent font-body text-[15px] text-pure-white placeholder:text-white/50 outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-white/50 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Filter Bar */}
      <section className="sticky top-[72px] z-50 bg-pure-white border-b border-light-gray">
        <div className="container-inkedup py-4">
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center justify-between gap-6">
            <div className="flex items-center gap-8 flex-1 overflow-hidden">
              {/* Style Pills */}
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
                  STYLE
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {STYLE_FILTERS.map((style) => (
                    <motion.button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-4 py-2 rounded-full border font-body text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                        activeStyles.includes(style)
                          ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                          : 'bg-pure-white border-light-gray text-charcoal hover:border-champagne-gold hover:text-champagne-gold'
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {style}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="w-px h-10 bg-light-gray flex-shrink-0" />

              {/* Location Pills */}
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
                  LOCATION
                </span>
                <div className="flex gap-2">
                  {LOCATION_FILTERS.map((loc) => (
                    <motion.button
                      key={loc}
                      onClick={() => setActiveLocation(loc)}
                      className={`px-4 py-2 rounded-full border font-body text-[13px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                        activeLocation === loc
                          ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                          : 'bg-pure-white border-light-gray text-charcoal hover:border-champagne-gold hover:text-champagne-gold'
                      }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {loc}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-md border border-light-gray bg-pure-white font-body text-[13px] font-medium text-charcoal focus:outline-none focus:border-champagne-gold cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center text-slate-gray">
                <Grid3X3 size={20} className="text-midnight-navy" />
              </div>
            </div>
          </div>

          {/* Mobile Filter Bar */}
          <div className="flex lg:hidden items-center justify-between gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-light-gray font-body text-[13px] font-medium text-charcoal"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-champagne-gold text-midnight-navy text-[11px] font-semibold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-md border border-light-gray bg-pure-white font-body text-[13px] text-charcoal focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Filters Expand */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div>
                    <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2 block">
                      STYLE
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_FILTERS.map((style) => (
                        <button
                          key={style}
                          onClick={() => toggleStyle(style)}
                          className={`px-3 py-1.5 rounded-full border font-body text-xs font-medium transition-all duration-200 ${
                            activeStyles.includes(style)
                              ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                              : 'bg-pure-white border-light-gray text-charcoal'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2 block">
                      LOCATION
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {LOCATION_FILTERS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => setActiveLocation(loc)}
                          className={`px-3 py-1.5 rounded-full border font-body text-xs font-medium transition-all duration-200 ${
                            activeLocation === loc
                              ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                              : 'bg-pure-white border-light-gray text-charcoal'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Section 4: Artist Grid */}
      <section className="bg-warm-ivory py-12 md:py-20">
        <div className="container-inkedup">
          {!isLoading && !error && (
            <p className="font-body text-sm text-slate-gray mb-8">
              Showing {filtered.length} artist{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <Loader2 size={48} className="text-champagne-gold mx-auto mb-4 animate-spin" />
              <p className="font-display text-xl text-slate-gray">Loading artists...</p>
            </motion.div>
          )}

          {!isLoading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <p className="font-display text-xl text-slate-gray">Something went wrong.</p>
              <p className="font-body text-sm text-slate-gray mt-1">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-6 font-body text-sm font-semibold text-champagne-gold hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}

          {!isLoading && !error && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStyles.join(',') + activeLocation + sortBy + searchTerm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filtered.map((artist, i) => (
                    <ArtistCard key={artist.id} artist={artist} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <Search size={48} className="text-light-gray mx-auto mb-4" />
                  <p className="font-display text-xl text-slate-gray">
                    No artists match your search.
                  </p>
                  <p className="font-body text-sm text-slate-gray mt-1">
                    Try different keywords or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveStyles(['All']);
                      setActiveLocation('All');
                    }}
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

      {/* Section 6: CTA Banner */}
      <section className="bg-midnight-navy py-20 md:py-24">
        <div className="container-inkedup text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(28px,3vw,40px)] text-pure-white"
            >
              Can&apos;t Decide? Let Us Help.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 mt-4 max-w-md mx-auto"
            >
              Tell us your idea and we&apos;ll match you with the perfect artist.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="/contact"
                className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Get a Free Consultation
              </a>
              <a
                href="https://wa.me/628112656869"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-champagne-gold hover:underline"
              >
                Or WhatsApp us
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
