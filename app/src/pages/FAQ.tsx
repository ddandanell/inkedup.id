import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { waLink } from '@/data/business';

/* ---------- types ---------- */

type Category = 'All' | 'Booking' | 'Safety' | 'Pricing' | 'Artists' | 'Aftercare';

interface FAQItem {
  q: string;
  a: string;
  category: Category;
}

/* ---------- data ---------- */

const categories: Category[] = ['All', 'Booking', 'Safety', 'Pricing', 'Artists', 'Aftercare'];

const faqs: FAQItem[] = [
  // Booking
  {
    q: 'How do I book a tattoo session?',
    a: 'Browse our verified artists, choose one that matches your style, and click "Book a Session." You\'ll fill out a quick form with your tattoo details, preferred date, and contact info. Our team reviews your request and gets back to you within 24 hours via WhatsApp to confirm.',
    category: 'Booking',
  },
  {
    q: 'How far in advance should I book?',
    a: "We recommend booking at least 3-5 days in advance, especially during peak season (June–September). Some of our most popular artists may be booked 1-2 weeks out. Rush bookings within 48 hours are sometimes possible — contact us on WhatsApp to check.",
    category: 'Booking',
  },
  {
    q: 'Can I book for a group or event?',
    a: "Absolutely! Group bookings are some of our most popular requests — especially for bachelor/bachelorette parties and retreat groups. Contact us with your group size and we'll coordinate multiple artists and create a custom package.",
    category: 'Booking',
  },
  {
    q: 'What if I need to reschedule?',
    a: "No problem! Rescheduling is free if you give us at least 48 hours' notice. Just message us on WhatsApp and we'll find a new slot that works for you.",
    category: 'Booking',
  },
  // Safety
  {
    q: 'Is it safe to get a tattoo in Bali?',
    a: 'With InkedUp, yes. We maintain the same hygiene standards as top studios worldwide — single-use needles, premium vegan inks, hospital-grade surface barriers, and thorough sanitization. Every artist is personally vetted for safety compliance.',
    category: 'Safety',
  },
  {
    q: 'What hygiene measures do your artists follow?',
    a: 'Our artists use single-use, pre-sterilized needle cartridges, premium vegan inks, medical-grade surface barriers, and follow strict hand hygiene protocols. Learn more about our safety standards.',
    category: 'Safety',
  },
  {
    q: 'Do you use vegan inks?',
    a: 'Yes. All our artists use premium vegan-friendly tattoo inks from certified manufacturers.',
    category: 'Safety',
  },
  // Pricing
  {
    q: 'How much does a tattoo cost?',
    a: "Our pricing starts at Rp 700.000 for small tattoos (up to 5cm), Rp 1.500.000 for medium (5-15cm), and Rp 3.000.000 for large pieces (15cm+). The final price depends on complexity, detail, and time. Your artist will give you a precise quote during the free consultation.",
    category: 'Pricing',
  },
  {
    q: 'What is the 10% booking fee?',
    a: "The 10% fee is collected when your booking is confirmed. It covers your design consultation, the artist's travel to your villa, sterile setup, aftercare kit, and our coordination services. It's our platform fee — the remaining 90% goes directly to your artist.",
    category: 'Pricing',
  },
  {
    q: 'When do I pay?',
    a: 'The 10% booking fee is paid upon confirmation to secure your slot. The remaining balance is paid directly to your artist after your session is completed.',
    category: 'Pricing',
  },
  {
    q: 'What payment methods do you accept?',
    a: "We accept Indonesian bank transfer, QRIS, Wise, and cash. For the booking deposit, we prefer digital payment in IDR. The balance with your artist can be paid however you both agree — most artists accept cash (IDR) or bank transfer.",
    category: 'Pricing',
  },
  // Artists
  {
    q: 'How are your artists selected?',
    a: 'Every artist on our platform goes through a rigorous vetting process: portfolio review, live skill assessment, background check, and ongoing quality monitoring. Only artists who meet our standards in both technical skill and hygiene make the cut.',
    category: 'Artists',
  },
  {
    q: 'Can I request a specific artist?',
    a: "Of course! Browse our artist profiles and book directly with your chosen artist. If they're unavailable on your preferred date, we'll suggest alternatives with similar styles.",
    category: 'Artists',
  },
  {
    q: "I'm a tattoo studio. How do we become a partner?",
    a: "We only partner with studios — never individual artists — so there's always one clean point of contact and consistent quality. Apply as a studio on our partner page and we'll review your studio within 48 hours. Artists join the platform through their studio, not directly.",
    category: 'Artists',
  },
  // Aftercare
  {
    q: 'What aftercare do you provide?',
    a: 'Every client receives a premium aftercare kit including healing salve, protective wrap, gentle cleanser, and detailed care instructions. We also follow up via WhatsApp to check on your healing.',
    category: 'Aftercare',
  },
  {
    q: 'How long does a tattoo take to heal?',
    a: 'Most tattoos take 2-3 weeks for the surface to heal and 2-3 months for complete healing. We provide detailed aftercare instructions and are available on WhatsApp if you have any concerns during the healing process.',
    category: 'Aftercare',
  },
  {
    q: 'Do you offer touch-ups?',
    a: 'Yes! Medium and large tattoos include a free touch-up session within 3 months. Small tattoos can be touched up for a nominal fee. Just reach out on WhatsApp to schedule.',
    category: 'Aftercare',
  },
  {
    q: 'Can I swim or surf after getting a tattoo?',
    a: "You'll need to keep your tattoo out of the water (ocean, pool, and bath) for at least 2 weeks. We know it's hard in Bali — plan your session accordingly! Quick showers are fine after the first 48 hours.",
    category: 'Aftercare',
  },
];

/* ---------- components ---------- */

function FAQAccordionItem({
  id,
  q,
  a,
  isOpen,
  onClick,
}: {
  id: string;
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  const panelId = `faq-panel-${id}`;
  const buttonId = `faq-button-${id}`;
  return (
    <div className="border-b border-light-gray">
      <button
        id={buttonId}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`font-display text-lg font-medium transition-colors duration-200 pr-4 ${
            isOpen ? 'text-champagne-gold' : 'text-midnight-navy group-hover:text-champagne-gold'
          }`}
        >
          {q}
        </span>
        <Plus
          size={20}
          aria-hidden="true"
          className={`text-champagne-gold flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
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

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    let items = faqs;
    if (activeCategory !== 'All') {
      items = items.filter((f) => f.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery]);

  useSEO({
    title: 'FAQ',
    description:
      'Answers about booking a mobile tattoo in Bali, safety and hygiene, IDR pricing, partner studios, and aftercare.',
    path: '/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  });

  return (
    <div className="min-h-[100dvh]">
      {/* Section 2: Page Header */}
      <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
        <div className="absolute inset-0">
          <img
            src="/tattoo-work-2.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover hero-drift"
          />
          <div className="absolute inset-0 bg-midnight-navy/45" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container-inkedup relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
          >
            FAQ
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display text-[clamp(36px,5vw,64px)] font-medium text-pure-white"
          >
            Questions? We've Got Answers.
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="relative max-w-[500px] mx-auto mt-8"
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
            <input
              type="search"
              aria-label="Search frequently asked questions"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3.5 rounded-md bg-white/10 border border-white/20 font-body text-[15px] text-pure-white placeholder:text-white/50 focus:outline-none focus:border-champagne-gold focus:bg-white/15 transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* Section 3: Category Tabs */}
      <section className="bg-pure-white pt-12">
        <div className="container-inkedup">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`font-body text-sm font-medium px-5 py-2 rounded-full border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-midnight-navy text-pure-white border-midnight-navy'
                    : 'bg-pure-white text-charcoal border-light-gray hover:border-champagne-gold hover:text-champagne-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: FAQ Accordion */}
      <section className="bg-pure-white" style={{ padding: 'clamp(48px, 6vw, 64px) 0' }}>
        <div className="container-inkedup max-w-[720px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-body text-base text-slate-gray">
                    No questions match your search. Try different keywords or browse all categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                    className="font-body text-sm text-champagne-gold hover:underline mt-3 inline-block"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                  >
                    <FAQAccordionItem
                      id={String(i)}
                      q={faq.q}
                      a={faq.a}
                      isOpen={openIndex === i}
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Section 5: Still Have Questions CTA */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
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
              className="font-display text-[28px] font-medium text-midnight-navy"
            >
              Still Have Questions?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-slate-gray mt-3"
            >
              We're here to help. Reach out via WhatsApp and we'll get back to you quickly.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <a
                href={waLink('Hi InkedUp, I have a question.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Contact on WhatsApp
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-midnight-navy hover:text-champagne-gold transition-colors duration-250"
              >
                Send an Email
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
