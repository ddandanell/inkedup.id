import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import store from '@/data/store';
import type { Studio } from '@/data/types';
import { useSEO } from '@/hooks/useSEO';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Studios() {
  useSEO({
    title: 'Partner Studios',
    description:
      'InkedUp works only with vetted tattoo studios in Bali — one clean point of contact and consistent quality. Browse our partner studios.',
    path: '/studios',
  });
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    store.getActiveStudios()
      .then((data) => {
        if (!cancelled) {
          setStudios(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load studios');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return studios;
    const q = searchTerm.toLowerCase();
    return studios.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }, [studios, searchTerm]);

  return (
    <div className="min-h-[100dvh]">
      {/* Header */}
      <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
        <div className="absolute inset-0">
          <img
            src="/about-studio.jpg"
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
              OUR STUDIOS
            </motion.span>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(36px,5vw,64px)] font-medium text-pure-white leading-[1.1] tracking-[-0.01em]"
            >
              Verified Tattoo Studios
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 max-w-[560px] mx-auto mt-4"
            >
              Partner studios across Bali, vetted for hygiene, skill, and professionalism.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="max-w-[600px] mx-auto mt-10"
            >
              <div className="relative flex items-center h-[52px] rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-5 transition-all focus-within:border-[rgba(198,155,60,0.5)] focus-within:shadow-[0_0_0_3px_rgba(198,155,60,0.15)]">
                <Search size={20} className="text-white/50 flex-shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Search studios by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent font-body text-[15px] text-pure-white placeholder:text-white/50 outline-none"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Studio Grid */}
      <section className="bg-warm-ivory py-12 md:py-20">
        <div className="container-inkedup">
          {loading ? (
            <div className="text-center py-24">
              <Loader2 size={40} className="text-champagne-gold animate-spin mx-auto mb-4" />
              <p className="font-body text-slate-gray">Loading studios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="font-body text-coral-rose">{error}</p>
            </div>
          ) : (
            <>
              <p className="font-body text-sm text-slate-gray mb-8">
                Showing {filtered.length} studio{filtered.length !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((studio, i) => (
                  <motion.div
                    key={studio.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                  >
                    <Link to={`/studios/${studio.id}`} className="group block">
                      <div className="bg-pure-white rounded-lg overflow-hidden shadow-card transition-all duration-400 ease-out group-hover:shadow-card-hover group-hover:-translate-y-1.5">
                        <div className="relative aspect-[16/10] overflow-hidden bg-midnight-navy/5">
                          <img
                            src={studio.logoUrl || '/tattoo-work-4.jpg'}
                            alt={studio.name}
                            className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                          {studio.verifiedAt && (
                            <span className="absolute top-3 right-3 font-body text-[11px] font-semibold uppercase tracking-[0.08em] bg-pure-white/95 text-bali-teal px-2.5 py-1 rounded-full shadow-sm">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="font-display text-xl font-medium text-midnight-navy">
                            {studio.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-2 text-slate-gray">
                            <MapPin size={13} className="flex-shrink-0" />
                            <span className="font-body text-[13px]">{studio.location}</span>
                          </div>
                          {studio.address && (
                            <p className="font-body text-[13px] text-slate-gray mt-1 truncate">
                              {studio.address}
                            </p>
                          )}
                          <div className="mt-4 inline-flex items-center gap-1 font-body text-sm font-medium text-champagne-gold group-hover:underline">
                            View Studio <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <Search size={48} className="text-light-gray mx-auto mb-4" />
                  <p className="font-display text-xl text-slate-gray">No studios match your search.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-6 font-body text-sm font-semibold text-champagne-gold hover:underline"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
