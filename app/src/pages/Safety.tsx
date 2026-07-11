import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import {
  CheckCircle,
  Plus,
  ShieldCheck,
  Syringe,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import PageHero from '@/components/PageHero';

/* ---------- data ---------- */

const setupChecklist = [
  'Hospital-grade surface barriers on all work areas',
  'Single-use, pre-sterilized needle cartridges',
  'Autoclave-sterilized reusable tools',
  'Medical-grade disinfectants and cleaning agents',
  'Disposable gloves changed throughout the session',
  'Sterile drape sheets and protective covers',
];

interface Protocol {
  title: string;
  content: string;
}

const protocols: Protocol[] = [
  {
    title: 'Needle Safety',
    content:
      'Every needle is single-use and pre-sterilized in individual packaging. Needles are opened in front of you and disposed of immediately after the session in a medical sharps container. We never reuse, re-sterilize, or share needles under any circumstances.',
  },
  {
    title: 'Ink Quality',
    content:
      'We use only premium, vegan-friendly tattoo inks from certified manufacturers. All inks are sealed, fresh, and stored according to manufacturer guidelines. We maintain a strict inventory to ensure no expired products are ever used.',
  },
  {
    title: 'Surface Sanitization',
    content:
      'Before every session, all work surfaces are covered with medical-grade protective barriers. After the session, all surfaces are thoroughly disinfected with hospital-grade cleaning agents. The artist leaves your space exactly as they found it — or cleaner.',
  },
  {
    title: 'Artist Health Screening',
    content:
      "All our artists undergo regular health check-ups. They are trained in bloodborne pathogen safety and follow strict personal hygiene protocols. Artists never work when unwell — if your artist is sick, we'll reschedule at no cost with a replacement if needed.",
  },
  {
    title: 'Client Health Check',
    content:
      "Before your session, we'll ask about any medical conditions, allergies, or medications that could affect your tattoo. We don't tattoo if you have certain conditions (e.g., active skin infections, blood disorders) — your safety comes first, always.",
  },
  {
    title: 'Emergency Preparedness',
    content:
      'Every artist carries a first-aid kit and is trained in basic first aid. In the unlikely event of an adverse reaction, we have protocols in place and partnerships with local medical facilities in all our service areas.',
  },
];

const vettingSteps = [
  {
    num: '01',
    title: 'Portfolio Review',
    desc: "We examine 10+ pieces of the artist's recent work for technical skill, consistency, and style quality.",
  },
  {
    num: '02',
    title: 'Skill Assessment',
    desc: 'A live test session where the artist demonstrates their technique, hygiene practices, and equipment quality.',
  },
  {
    num: '03',
    title: 'Background Check',
    desc: 'We verify identity, work history, and ensure no history of unsafe practices or client complaints.',
  },
  {
    num: '04',
    title: 'Ongoing Monitoring',
    desc: 'Regular quality checks, client feedback reviews, and mandatory refresher training on safety protocols.',
  },
];

const aftercareKit = [
  { item: 'Aftercare Salve', desc: 'Premium healing balm, vegan-friendly' },
  { item: 'Protective Wrap', desc: 'Second-skin bandage for first 48 hours' },
  { item: 'Gentle Cleanser', desc: 'Mild, unscented soap for cleaning' },
  { item: 'Care Instructions', desc: 'Printed + digital guide with QR code' },
];

const aftercareSteps = [
  'Leave the wrap on for 2-6 hours',
  'Wash gently with unscented soap',
  'Pat dry, apply a thin layer of salve',
  'Keep out of sun and water for 2 weeks',
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Verified Artists Only' },
  { icon: Syringe, label: 'Single-Use Needles' },
  { icon: FlaskConical, label: 'Premium Vegan Inks' },
  { icon: HeartPulse, label: 'Health & Safety First' },
  { icon: MessageCircle, label: '24/7 WhatsApp Support' },
];

/* ---------- components ---------- */

function ProtocolAccordion({ items }: { items: Protocol[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-[800px] mx-auto">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={item.title} className="border-b border-light-gray">
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span
                className={`font-display text-xl font-medium transition-colors duration-200 ${
                  isOpen ? 'text-champagne-gold' : 'text-midnight-navy group-hover:text-champagne-gold'
                }`}
              >
                {item.title}
              </span>
              <Plus
                size={20}
                className={`text-champagne-gold flex-shrink-0 ml-4 transition-transform duration-300 ${
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
                  <p className="font-body text-[15px] text-slate-gray leading-[1.7] pb-5 max-w-[90%]">
                    {item.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export default function Safety() {
  useSEO({
    title: 'Safety & Hygiene',
    description:
      'Single-use needles, hospital-grade barriers and premium vegan inks. How InkedUp keeps every mobile tattoo session in Bali sterile and safe.',
    path: '/safety',
  });
  return (
    <div className="min-h-[100dvh]">
      <PageHero
        image="/safety-setup.jpg"
        label="YOUR SAFETY FIRST"
        title="Hospital-Grade Hygiene, Every Single Time"
        subtitle="We never compromise on safety. Every session follows the same rigorous protocols you'd expect from a world-class studio — just in the comfort of your own space."
      />

      {/* Section 3: Sterile Setup Showcase */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              variants={slideLeft}
            >
              <div className="rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(11,31,63,0.08)]">
                <img
                  src="/safety-setup.jpg"
                  alt="Sterile mobile tattoo setup"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Right — Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              variants={slideRight}
            >
              <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold">
                THE MOBILE STUDIO
              </span>
              <h2 className="font-display text-[28px] font-medium text-midnight-navy mt-3 leading-tight">
                A Clinical-Grade Setup, Anywhere
              </h2>
              <p className="font-body text-base text-charcoal leading-[1.7] mt-3">
                Our artists arrive with a complete, fully sterile mobile workstation. Every surface is protected, every tool is single-use or autoclave-sterilized, and every session meets the hygiene standards of the world's best tattoo studios.
              </p>

              {/* Checklist */}
              <div className="mt-6 space-y-3">
                {setupChecklist.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                    <span className="font-body text-[15px] text-charcoal">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Safety Protocols */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              PROTOCOLS
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy"
            >
              Our Safety Standards
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <ProtocolAccordion items={protocols} />
          </motion.div>
        </div>
      </section>

      {/* Section 5: Artist Vetting Process */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              VERIFICATION
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy"
            >
              Not Just Any Artist Makes the Cut
            </motion.h2>
          </motion.div>

          {/* Steps — horizontal on desktop, vertical on mobile */}
          <div className="relative max-w-[900px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vettingSteps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="text-center relative"
                >
                  {/* Connecting line (desktop only) */}
                  {i < vettingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px bg-light-gray">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-champagne-gold" />
                    </div>
                  )}

                  <span className="font-mono-stat text-[48px] font-medium text-champagne-gold opacity-30 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-display text-xl font-medium text-midnight-navy mt-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-slate-gray leading-[1.6] mt-1.5">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Aftercare Support */}
      <section className="bg-midnight-navy" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.1 }}
              variants={slideLeft}
            >
              <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold">
                AFTERCARE
              </span>
              <h2 className="font-display text-[28px] font-medium text-pure-white mt-3 leading-tight">
                We Don't Disappear After the Last Needle
              </h2>
              <p className="font-body text-base text-white/75 leading-[1.7] mt-3">
                Every client receives a comprehensive aftercare kit and detailed instructions. But we go further — our team follows up via WhatsApp to check on your healing, answer questions, and schedule touch-ups if needed.
              </p>

              {/* Kit contents */}
              <div className="mt-6 space-y-2">
                {aftercareKit.map((k, i) => (
                  <motion.div
                    key={k.item}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <CheckCircle size={16} className="text-bali-teal flex-shrink-0" />
                    <div>
                      <span className="font-body text-[15px] font-medium text-pure-white">{k.item}</span>
                      <span className="font-body text-[13px] text-white/60 ml-2">{k.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Aftercare Guide Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              variants={slideRight}
              className="flex justify-center"
            >
              <div className="bg-pure-white rounded-[10px] p-6 max-w-[360px] w-full">
                <h3 className="font-display text-lg font-medium text-midnight-navy mb-4">
                  Aftercare Guide
                </h3>
                <ol className="space-y-3">
                  {aftercareSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono-stat text-sm font-medium text-champagne-gold flex-shrink-0 w-5">
                        {i + 1}.
                      </span>
                      <span className="font-body text-sm text-charcoal">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 pt-4 border-t border-light-gray">
                  <p className="font-body text-xs text-champagne-gold">
                    Questions? WhatsApp us anytime
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 7: Trust Badges */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(48px, 6vw, 64px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.08 }}
            className="flex flex-wrap items-start justify-center gap-12"
          >
            {trustBadges.map((badge) => (
              <motion.div
                key={badge.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="flex flex-col items-center text-center w-[120px]"
              >
                <badge.icon size={32} className="text-champagne-gold" />
                <span className="font-body text-[13px] font-medium text-midnight-navy mt-3">
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 8: FAQ Teaser + CTA */}
      <section className="bg-pure-white" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
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
              Visit our FAQ page or reach out directly — we're here to help.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link
                to="/faq"
                className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
              >
                Read FAQ
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-midnight-navy hover:text-champagne-gold transition-colors duration-250"
              >
                Contact Us
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
