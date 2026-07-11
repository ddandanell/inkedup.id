import { useEffect, useMemo, useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import {
  Plus,
  MessageSquare,
  Search,
  CalendarCheck,
  MapPin,
  Home,
  Clock,
  ShieldCheck,
  ArrowRight,
  Users,
  Sparkles,
} from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import store from '@/data/store';
import type { DashboardStats } from '@/data/types';

/* ---------- types ---------- */

interface Step {
  num: string;
  title: string;
  desc: string;
  image: string;
  icon: React.ElementType;
}

interface WhyCard {
  title: string;
  desc: string;
  icon: React.ElementType;
}

interface FAQItem {
  q: string;
  a: string;
}

/* ---------- data ---------- */

const steps: Step[] = [
  {
    num: '01',
    title: 'Share Your Idea',
    desc: "Tell us what you're dreaming of — style, size, placement, and when you're in Bali. Send photos, references, or just a rough description. There's no commitment and no charge to start the conversation.",
    image: '/process-step-1.jpg',
    icon: MessageSquare,
  },
  {
    num: '02',
    title: 'Get Matched',
    desc: "We review your request and match you with a verified artist whose style fits your vision. You'll see their portfolio, pricing, and availability before deciding.",
    image: '/process-step-2.jpg',
    icon: Search,
  },
  {
    num: '03',
    title: 'Get Tattooed',
    desc: "Your artist arrives at your villa or hotel with a sterile mobile setup. Relax in your own space, get your tattoo, and pay the balance when the session is done.",
    image: '/process-step-3.jpg',
    icon: CalendarCheck,
  },
];

const whyCards: WhyCard[] = [
  {
    title: 'No Travel Stress',
    desc: "Skip the Bali traffic. We come to your villa, hotel, or retreat so you don't waste a sunny afternoon in a car.",
    icon: MapPin,
  },
  {
    title: 'Total Privacy',
    desc: 'Get tattooed in a familiar, comfortable space. Bring a friend, play your music, and take breaks whenever you need.',
    icon: Home,
  },
  {
    title: 'Flexible Scheduling',
    desc: "Early morning before the beach? Late evening after dinner? We'll find a time that fits your holiday.",
    icon: Clock,
  },
  {
    title: 'Verified Artists',
    desc: 'Every artist is vetted for skill, hygiene, and professionalism. Single-use needles, premium inks, hospital-grade setup.',
    icon: ShieldCheck,
  },
];

const faqs: FAQItem[] = [
  {
    q: 'When should I get my tattoo during my Bali trip?',
    a: "Book your session in the first half of your trip. That leaves time for touch-ups if needed and avoids swimming/surfing restrictions in your final days. We recommend at least 48 hours between your session and flying home.",
  },
  {
    q: 'How far in advance should I book?',
    a: "We recommend booking at least 3-5 days ahead, especially during peak season (June–September). Popular artists can be booked 1-2 weeks out. Last-minute requests within 48 hours are sometimes possible — message us on WhatsApp to check.",
  },
  {
    q: 'Is it safe to get a tattoo at my villa?',
    a: 'Yes. Our artists bring a complete sterile mobile workstation: single-use needles, medical-grade barriers, premium vegan inks, and hospital-grade disinfectants. The setup meets the same hygiene standards as a top studio.',
  },
  {
    q: 'What do I need to prepare before my session?',
    a: "Have a clear idea (or reference images), eat a good meal, stay hydrated, and avoid alcohol for 24 hours. Make sure your space has good lighting, a clean surface, and access to a sink. We'll handle the rest.",
  },
  {
    q: 'How do payments work?',
    a: "We collect a 10% booking deposit in IDR to confirm your slot. The remaining 90% is paid directly to your studio after the session is completed. No hidden charges — your studio confirms the exact price during consultation.",
  },
  {
    q: 'Can I bring friends to watch?',
    a: "Of course. Mobile sessions are perfect for a small group. We also offer group bookings for bachelor/bachelorette parties, retreats, and events — just let us know your group size.",
  },
  {
    q: 'What if I need to reschedule?',
    a: "Rescheduling is free with at least 48 hours' notice. Just message us on WhatsApp and we'll find a new slot that works for you.",
  },
  {
    q: 'Do you travel outside Canggu, Seminyak, Ubud, and Uluwatu?',
    a: "Yes, we can often arrange sessions across Bali. Call-out fees of Rp 100.000–350.000 may apply for areas outside our primary service zones. Contact us and we'll confirm availability and pricing for your location.",
  },
];

/* ---------- components ---------- */

function FAQAccordionItem({
  q,
  a,
  isOpen,
  onClick,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-light-gray">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`font-display text-lg font-medium transition-colors duration-200 pr-4 text-left ${
            isOpen ? 'text-champagne-gold' : 'text-midnight-navy group-hover:text-champagne-gold'
          }`}
        >
          {q}
        </span>
        <Plus
          size={20}
          className={`text-champagne-gold flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p className="font-body text-[15px] text-slate-gray leading-[1.7] pb-5 max-w-[95%]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  useSEO({
    title: 'How It Works',
    description:
      'Book a mobile tattoo in Bali in four steps: choose a studio artist, tell us your idea, confirm with a 10% deposit, and we come to your villa.',
    path: '/how-it-works',
  });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await store.getStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const trustStats = useMemo(
    () => [
      {
        icon: Users,
        value: stats ? `${stats.totalArtists}+` : '—',
        label: 'Verified Artists',
      },
      {
        icon: Sparkles,
        value: stats ? `${stats.completedBookings}+` : '—',
        label: 'Completed Sessions',
      },
      {
        icon: ShieldCheck,
        value: 'Single-Use',
        label: 'Needles & Barriers',
      },
    ],
    [stats]
  );

  return (
    <div className="min-h-[100dvh]">
      {/* Section 2: Page Header */}
      <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
        <div className="absolute inset-0">
          <img
            src="/process-step-1.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover hero-drift"
          />
          <div className="absolute inset-0 bg-midnight-navy/45" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-inkedup relative z-10">
          <SectionHeader
            label="THE PROCESS"
            title="How InkedUp Works"
            subtitle="From your first message to fresh ink — we make booking a mobile tattoo in Bali simple, safe, and stress-free."
            centered
            light
          />

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-10"
          >
            {loading ? (
              <span className="font-body text-sm text-white/60">Loading stats...</span>
            ) : error ? (
              <span className="font-body text-sm text-white/60">Stats unavailable</span>
            ) : (
              trustStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <stat.icon size={22} className="text-champagne-gold" />
                  <div>
                    <p className="font-display text-xl font-medium text-pure-white">{stat.value}</p>
                    <p className="font-body text-[13px] text-white/60">{stat.label}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Section 3: Three-Step Process */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <SectionHeader
            label="THREE SIMPLE STEPS"
            title="Share. Match. Get Tattooed."
            subtitle="No studio visit required. We bring the entire tattoo experience to your door."
            centered
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 mt-16">
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
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-light-gray" />
                )}

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-midnight-navy flex items-center justify-center">
                    <step.icon size={24} className="text-champagne-gold" />
                  </div>
                  <span className="font-mono text-5xl font-medium text-champagne-gold/30">
                    {step.num}
                  </span>
                </div>

                <div className="mt-6 rounded-xl overflow-hidden aspect-[3/2] shadow-[0_8px_40px_rgba(11,31,63,0.08)]">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-display text-[22px] font-medium text-midnight-navy mt-6">
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

      {/* Section 4: Why Mobile Is Better */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <SectionHeader
            label="WHY GO MOBILE"
            title="The Studio Comes to You"
            subtitle="Forget traffic, waiting rooms, and rigid schedules. A mobile tattoo session is the easiest way to get inked in Bali."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 max-w-[900px] mx-auto">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="bg-pure-white rounded-xl p-6 border border-light-gray"
              >
                <card.icon size={24} className="text-champagne-gold" />
                <h3 className="font-display text-lg font-medium text-midnight-navy mt-4">
                  {card.title}
                </h3>
                <p className="font-body text-[15px] text-slate-gray leading-[1.7] mt-2">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: FAQ */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup max-w-[720px]">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              PEOPLE ALSO ASK
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy"
            >
              Common Questions
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {faqs.map((faq, i) => (
              <FAQAccordionItem
                key={faq.q}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 6: CTA */}
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
              Ready to Start Your Booking?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 max-w-[520px] mx-auto mt-4"
            >
              It's free to get matched. Tell us your idea and we'll reply within 24 hours — usually much sooner.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link
                to="/artists"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Browse Artists
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded border border-white/30 text-pure-white hover:bg-white/10 transition-all duration-300"
              >
                Ask a Question
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
