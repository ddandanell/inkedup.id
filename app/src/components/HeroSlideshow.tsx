import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Slide {
  image: string;
  label: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    image: '/hero-slide-1.jpg',
    label: "Bali's Premier Mobile Tattoo Concierge",
    title: 'Your Story, Inked in Paradise',
    subtitle: 'Verified Indonesian artists. Sterile mobile setup. We come to your villa.',
  },
  {
    image: '/hero-slide-4.jpg',
    label: 'The Studio Comes to You',
    title: 'Luxury Ink, Villa to Villa',
    subtitle: 'World-class tattooing in the comfort of your private Bali villa.',
  },
  {
    image: '/hero-slide-2.jpg',
    label: 'Local Masters, Global Standards',
    title: "Ink by Bali's Finest Hands",
    subtitle: 'Hand-picked Indonesian artists, hospital-grade hygiene, breathtaking settings.',
  },
  {
    image: '/hero-slide-3.jpg',
    label: 'Private. Personal. Unforgettable.',
    title: 'A Session Beyond the Studio',
    subtitle: 'From Canggu to Uluwatu — premium ink, wherever you stay in Bali.',
  },
];

const INTERVAL_MS = 10000;

const textVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;
    const id = window.setInterval(() => {
      if (!paused.current) {
        setIndex((i) => (i + 1) % SLIDES.length);
      }
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const goTo = (i: number) => setIndex(i);
  const slide = SLIDES[index];

  return (
    <section
      className="relative min-h-[100dvh] flex items-center overflow-hidden -mt-[72px] pt-[72px]"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Background slides — stacked, crossfading, with a gentle drift */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            aria-hidden="true"
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'}
            className={`absolute inset-0 w-full h-full object-cover hero-drift transition-opacity duration-1000 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Scrims so the white text stays legible over every photograph */}
        <div className="absolute inset-0 bg-midnight-navy/35" />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-inkedup py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-pure-white mb-6 bg-midnight-navy/55 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
            >
              {slide.label}
            </span>

            <h1
              className="font-display text-hero-display text-pure-white max-w-[760px] mb-6"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              {slide.title}
            </h1>

            <p
              className="font-body text-lg text-white/90 max-w-[500px] leading-relaxed mb-10"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.45)' }}
            >
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Constant CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/artists"
            className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Browse Artists
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-pure-white hover:text-champagne-gold transition-colors"
          >
            How It Works <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.image}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-champagne-gold' : 'w-2 bg-white/45 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
