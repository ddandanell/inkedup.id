import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Check,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useSEO } from '@/hooks/useSEO';
import HeroSlideshow from '@/components/HeroSlideshow';
import ArtistCard from '@/components/ArtistCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import store from '@/data/store';
import type { Artist, DashboardStats } from '@/data/types';

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="font-mono text-stat-number text-champagne-gold">
      {inView ? <CountUp key={end} end={end} duration={1.5} /> : 0}
      {suffix}
    </span>
  );
}

/* ─── Fade Up Motion ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Hero Section ─── */
function HeroSection() {
  return <HeroSlideshow />;
}

/* ─── Trust Bar ─── */
function TrustBar() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    store
      .getStats()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Trust bar shows only live, real aggregate numbers. If the request fails we
  // hide the bar entirely rather than fabricate figures (no fake "500+").
  const effective = stats;
  if (!loading && error) return null;

  const statsItems: Array<{ number?: number; suffix?: string; text?: string; label: string }> = [
    { number: effective?.totalArtists, suffix: '+', label: 'Verified Artists' },
    { number: effective?.completedBookings, suffix: '+', label: 'Sessions Completed' },
    { text: 'Bali-Wide', label: 'Canggu → Uluwatu' },
    { text: 'Sterile', label: 'Single-Use Setup' },
  ];

  return (
    <section className="bg-warm-ivory py-12 md:py-16">
      <div className="container-inkedup">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {statsItems.map((stat, i) => (
            <div key={stat.label} className="text-center relative">
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-light-gray" />
              )}
              {loading ? (
                <div className="h-[48px] w-16 bg-light-gray/40 rounded animate-pulse mx-auto" />
              ) : stat.number !== undefined ? (
                <AnimatedCounter end={stat.number} suffix={stat.suffix ?? ''} />
              ) : (
                <span className="font-display text-[clamp(26px,3.4vw,38px)] font-medium text-champagne-gold leading-none">{stat.text}</span>
              )}
              <p className="font-body text-sm text-slate-gray uppercase tracking-[0.06em] mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
const steps = [
  {
    num: '01',
    title: 'Browse & Choose',
    desc: 'Explore our curated roster of verified tattoo artists. Filter by style, location, and availability to find your perfect match.',
    image: '/process-step-1.jpg',
  },
  {
    num: '02',
    title: 'Submit Your Request',
    desc: 'Tell us your idea — style, size, placement. We handle everything from design consultation to scheduling. No upfront commitment.',
    image: '/process-step-2.jpg',
  },
  {
    num: '03',
    title: 'We Come to You',
    desc: 'Your artist arrives at your villa with a fully sterile mobile setup. Relax in your own space while we bring the studio to you.',
    image: '/process-step-3.jpg',
  },
  {
    num: '04',
    title: 'Leave Review',
    desc: 'Rate your experience and share your new ink. Your feedback helps us maintain the highest standards for every session.',
    image: '/process-step-4.jpg',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-pure-white section-padding">
      <div className="container-inkedup">
        <SectionHeader
          label="The Process"
          title="Four Steps to Your Perfect Tattoo"
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="relative"
            >
              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] border-t border-dashed border-light-gray" />
              )}

              <span className="font-mono text-5xl font-medium text-champagne-gold/30">
                {step.num}
              </span>

              <div className="mt-4 rounded-lg overflow-hidden aspect-[3/2]">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <h3 className="font-display text-[22px] font-medium text-midnight-navy mt-5">
                {step.title}
              </h3>
              <p className="font-body text-[15px] text-slate-gray leading-relaxed mt-2">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Featured Artists ─── */
function FeaturedArtistsSection() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    store
      .getActiveArtists()
      .then((data) => {
        if (!cancelled) {
          setArtists(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load artists');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured =
    artists.length >= 3
      ? [
          { ...artists[1], displayImage: '/artist-1.jpg' },
          { ...artists[0], displayImage: '/artist-2.jpg' },
          { ...artists[2], displayImage: '/artist-4.jpg' },
        ]
      : [];

  return (
    <section className="bg-warm-ivory section-padding">
      <div className="container-inkedup">
        <SectionHeader
          label="Meet the Artists"
          title="Handpicked Talent, Verified Excellence"
          subtitle="Every artist is personally vetted for skill, hygiene standards, and professionalism."
          centered
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] bg-warm-ivory/50 rounded-[10px] border border-light-gray animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-16">{error}</p>
        ) : featured.length === 0 ? (
          <p className="text-center text-slate-gray mt-16">No featured artists available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {featured.map((artist, i) => (
                <ArtistCard key={artist.id} artist={{ ...artist, photo: artist.displayImage }} index={i} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/artists"
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-champagne-gold border-[1.5px] border-champagne-gold px-8 py-3.5 rounded hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
              >
                View All Artists <ChevronRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Style Categories ─── */
const tattooStyles = [
  { name: 'Fine Line', image: '/tattoo-work-1.jpg' },
  { name: 'Blackwork', image: '/tattoo-work-2.jpg' },
  { name: 'Traditional', image: '/tattoo-work-4.jpg' },
  { name: 'Japanese', image: '/tattoo-work-2.jpg' },
  { name: 'Watercolor', image: '/tattoo-work-6.jpg' },
  { name: 'Minimalist', image: '/tattoo-work-5.jpg' },
  { name: 'Geometric', image: '/tattoo-work-3.jpg' },
  { name: 'Realism', image: '/tattoo-work-6.jpg' },
];

function StyleCategoriesSection() {
  return (
    <section className="bg-midnight-navy section-padding overflow-hidden">
      <div className="container-inkedup">
        <SectionHeader
          label="Explore Styles"
          title="Find Your Style"
          subtitle="From delicate fine-line to bold traditional — our artists specialize in every style."
          centered
          light
        />
      </div>

      <motion.div
        className="flex gap-5 mt-12 px-6 lg:px-10 overflow-x-auto pb-4 scrollbar-hide"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {tattooStyles.map((style, i) => (
          <motion.div
            key={style.name}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="relative w-[160px] h-[200px] md:w-[200px] md:h-[260px] rounded-[10px] overflow-hidden">
              <img
                src={style.image}
                alt={style.name}
                className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/80 via-midnight-navy/30 to-transparent group-hover:from-midnight-navy/60 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <span className="font-display text-lg text-pure-white group-hover:translate-y-[-4px] transition-transform duration-300 inline-block">
                  {style.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Locations Preview ─── */
const locations = [
  { name: 'Canggu', subtitle: 'The Creative Hub', image: '/location-canggu.jpg' },
  { name: 'Seminyak', subtitle: 'Beachfront Luxury', image: '/location-seminyak.jpg' },
  { name: 'Uluwatu', subtitle: 'Cliffside Retreats', image: '/location-uluwatu.jpg' },
  { name: 'Ubud', subtitle: 'Jungle Serenity', image: '/location-ubud.jpg' },
];

function LocationsPreviewSection() {
  return (
    <section className="bg-pure-white section-padding">
      <div className="container-inkedup">
        <SectionHeader
          label="Service Areas"
          title="We Come to You, Wherever You Are"
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy/70 to-transparent group-hover:from-midnight-navy/50 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 group-hover:translate-y-[-4px] transition-transform duration-300">
                  <h3 className="font-display text-2xl text-pure-white">
                    {loc.name}
                  </h3>
                  <p className="font-body text-[13px] text-white/80 mt-1">
                    {loc.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/locations"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-champagne-gold border-[1.5px] border-champagne-gold px-8 py-3.5 rounded hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
          >
            See All Locations <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote: "I was nervous about getting a tattoo abroad, but InkedUp made everything effortless. The artist came to our villa, the setup was cleaner than most studios back home, and my floral piece is absolutely perfect.",
    name: 'Sarah Mitchell',
    detail: 'Tourist from London',
    image: '/testimonial-1.jpg',
  },
  {
    quote: "As someone who works remotely in Bali, I've used InkedUp three times now. The quality is consistently exceptional, and having them come to your place saves so much time. Highly recommend Kadek for traditional Balinese work.",
    name: 'Marcus Chen',
    detail: 'Digital Nomad, San Francisco',
    image: '/testimonial-2.jpg',
  },
  {
    quote: "We booked matching couple tattoos for our anniversary. The whole experience felt so premium — from the WhatsApp coordination to the final result. A memory we'll carry forever, literally.",
    name: 'Emma & Jake',
    detail: 'Anniversary Trip, Sydney',
    image: '/testimonial-3.jpg',
  },
];

function TestimonialsSection() {
  return (
    <section className="bg-warm-ivory section-padding">
      <div className="container-inkedup">
        <SectionHeader
          label="Client Stories"
          title="What Our Clients Say"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="bg-pure-white rounded-[10px] p-8 shadow-card"
            >
              <span className="font-display text-[60px] font-normal text-champagne-gold/40 leading-none block -mt-4 mb-2">
                &ldquo;
              </span>
              <p className="font-display text-xl text-midnight-navy leading-relaxed italic">
                {t.quote}
              </p>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-light-gray">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-body text-[15px] font-semibold text-midnight-navy">
                    {t.name}
                  </p>
                  <p className="font-body text-[13px] text-slate-gray">
                    {t.detail}
                  </p>
                </div>
              </div>

              <div className="flex gap-0.5 mt-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" className="fill-champagne-gold text-champagne-gold">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Safety Assurance ─── */
const safetyItems = [
  'Single-use disposable needles only',
  'Autoclave-sterilized equipment',
  'Medical-grade disinfectants',
  'Protective barriers on all surfaces',
  'Aftercare kit provided',
];

function SafetySection() {
  return (
    <section className="bg-midnight-navy section-padding">
      <div className="container-inkedup">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4">
              Your Safety First
            </span>
            <h2 className="font-display text-section-title text-pure-white">
              Hospital-Grade Hygiene, Every Single Session
            </h2>
            <p className="font-body text-base text-white/75 leading-relaxed mt-4">
              We never compromise on safety. Every artist uses disposable needles, sterile single-use supplies, and hospital-grade sanitation. Your villa becomes a clinical-grade studio — without losing an ounce of comfort.
            </p>

            <motion.ul
              className="mt-8 space-y-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {safetyItems.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3"
                >
                  <Check size={18} className="text-bali-teal flex-shrink-0" />
                  <span className="font-body text-[15px] text-pure-white">{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-8">
              <Link
                to="/safety"
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-pure-white hover:text-champagne-gold transition-colors"
              >
                Learn About Our Safety Protocols <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/safety-setup.jpg"
              alt="Sterile mobile tattoo setup"
              className="rounded-[10px] shadow-xl w-full"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Preview ─── */
const pricingTiers = [
  {
    size: 'Small',
    price: 'From Rp 700.000',
    desc: 'Up to 5cm — perfect for first-timers',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile setup', 'Aftercare kit'],
    highlighted: false,
  },
  {
    size: 'Medium',
    price: 'From Rp 1.500.000',
    desc: '5–15cm — statement pieces',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile setup', 'Aftercare kit', 'Touch-up session'],
    highlighted: true,
  },
  {
    size: 'Large',
    price: 'From Rp 3.000.000',
    desc: '15cm+ — sleeves, back pieces',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile setup', 'Aftercare kit', 'Multiple sessions', 'Priority booking'],
    highlighted: false,
  },
];

function PricingPreviewSection() {
  return (
    <section className="bg-pure-white section-padding">
      <div className="container-inkedup">
        <SectionHeader
          label="Transparent Pricing"
          title="No Surprises, Just Great Ink"
          subtitle="All-inclusive pricing. The 10% booking fee covers your consultation, travel, setup, and aftercare support."
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto mt-16">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.size}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: tier.highlighted ? 0.1 : i * 0.12,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className={`relative bg-warm-ivory rounded-[10px] p-8 text-center border ${
                tier.highlighted
                  ? 'border-2 border-champagne-gold shadow-gold-subtle md:-mt-4 md:mb-[-16px]'
                  : 'border-light-gray'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] bg-champagne-gold text-midnight-navy px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <span className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-champagne-gold">
                {tier.size}
              </span>
              <p className="font-display text-card-title text-midnight-navy mt-2">
                {tier.price}
              </p>
              <p className="font-body text-sm text-slate-gray mt-1">
                {tier.desc}
              </p>

              <div className="border-t border-light-gray my-6" />

              <ul className="space-y-2 text-left">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-slate-gray">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-champagne-gold border-[1.5px] border-champagne-gold px-8 py-3.5 rounded hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
          >
            See Full Pricing Details <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─── */
function CTABannerSection() {
  return (
    <section className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 60%' }}
        />
        <div className="absolute inset-0 bg-midnight-navy/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-inkedup text-center py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-section-title text-pure-white"
        >
          Ready for Your Bali Ink?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-lg text-white/80 max-w-[500px] mx-auto mt-4"
        >
          Browse our artists and book your session today. Your story starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <Link
            to="/artists"
            className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-10 py-4 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Browse Artists
          </Link>
          <WhatsAppButton
            phoneNumber="+6281234567890"
            className="static"
          >
            <span className="font-body text-sm text-champagne-gold underline-offset-4 hover:underline">
              Or contact us on WhatsApp
            </span>
          </WhatsAppButton>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  useSEO({
    title: 'InkedUp — Premium Mobile Tattoo Concierge, Bali',
    description:
      "Bali's premier mobile tattoo concierge. Verified studio artists, sterile single-use setup, and we come to your villa. Pricing in IDR.",
    path: '/',
  });
  return (
    <div>
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <FeaturedArtistsSection />
      <StyleCategoriesSection />
      <LocationsPreviewSection />
      <TestimonialsSection />
      <SafetySection />
      <PricingPreviewSection />
      <CTABannerSection />
    </div>
  );
}
