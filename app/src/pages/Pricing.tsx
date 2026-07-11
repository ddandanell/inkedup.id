import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Check, Info, ArrowRight, Calculator, MessageCircle } from 'lucide-react';
import PageHero from '@/components/PageHero';
import store from '@/data/store';
import { waLink } from '@/data/business';
import { useSEO } from '@/hooks/useSEO';

/* ---------- data ---------- */

// We focus on larger, villa-worthy pieces — not tiny walk-in tattoos.
const packages = [
  {
    label: 'HALF ARM',
    price: 'From Rp 2.500.000',
    area: 'Forearm or upper arm',
    image: '/areas/half-arm.webp',
    description:
      'A focused half-sleeve — forearm or upper arm. Our most popular first big piece, done in one or two sittings at your villa.',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile mobile setup', 'Premium aftercare kit'],
  },
  {
    label: 'FULL ARM',
    price: 'From Rp 6.000.000',
    area: 'Shoulder to wrist · one arm',
    image: '/areas/full-arm.webp',
    description:
      'A complete sleeve, designed as one cohesive piece and built over several sessions. The signature InkedUp piece.',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile mobile setup', 'Premium aftercare kit', 'Multi-session planning', 'Priority scheduling'],
    popular: true,
  },
  {
    label: 'LARGE PIECE',
    price: 'From Rp 8.000.000',
    area: 'Full leg · back · chest',
    image: '/areas/full-leg.webp',
    description:
      'Full leg, back piece, or full chest. By consultation — we plan the full vision, sessions and timeline with your studio.',
    includes: ['Design consultation', 'Travel to your villa', 'Sterile mobile setup', 'Premium aftercare kit', 'Multi-session planning', 'Dedicated lead artist'],
  },
];

const includedItems = [
  {
    title: 'Free Design Consultation',
    desc: 'Discuss your idea with your artist before committing. No charge, no pressure.',
  },
  {
    title: 'Travel to Your Villa',
    desc: 'Your artist comes to you anywhere in our service areas. No travel fees for Canggu, Seminyak, Uluwatu, or Ubud.',
  },
  {
    title: 'Full Sterile Setup',
    desc: 'Hospital-grade hygiene, single-use needles, premium vegan inks. Everything brought to your door.',
  },
  {
    title: 'Premium Aftercare Kit',
    desc: 'Healing salve, protective wrap, gentle cleanser, and detailed care instructions included with every session.',
  },
  {
    title: 'WhatsApp Coordination',
    desc: 'Our team handles all scheduling and communication via WhatsApp — the easiest way to stay connected in Bali.',
  },
  {
    title: 'Touch-Up Session',
    desc: 'Larger pieces include a free touch-up session within 3 months to ensure perfect healing.',
  },
];

/* ---------- price estimator ---------- */

interface BodyArea {
  id: string;
  name: string;
  sub: string;
  image: string;
  low: number; // base range low (IDR) at Simple detail
  high: number; // base range high (IDR) at Simple detail
  sessions: string;
}

const bodyAreas: BodyArea[] = [
  { id: 'half-arm', name: 'Half Arm', sub: 'Forearm or upper arm', image: '/areas/half-arm.webp', low: 2500000, high: 4500000, sessions: '1–2 sessions' },
  { id: 'full-arm', name: 'Full Arm', sub: 'One arm · shoulder to wrist', image: '/areas/full-arm.webp', low: 6000000, high: 12000000, sessions: '3–6 sessions' },
  { id: 'half-leg', name: 'Half Leg', sub: 'Calf or thigh', image: '/areas/half-leg.webp', low: 3000000, high: 5000000, sessions: '1–2 sessions' },
  { id: 'full-leg', name: 'Full Leg', sub: 'Thigh to ankle', image: '/areas/full-leg.webp', low: 8000000, high: 15000000, sessions: '4–8 sessions' },
  { id: 'chest', name: 'Chest & Sternum', sub: 'Upper chest / sternum', image: '/areas/chest.webp', low: 3000000, high: 6000000, sessions: '1–3 sessions' },
  { id: 'back', name: 'Back Piece', sub: 'Upper or full back', image: '/areas/back.webp', low: 8000000, high: 18000000, sessions: '4–10 sessions' },
];

const detailLevels = [
  { id: 'simple', label: 'Simple', desc: 'Line work, minimalist', multiplier: 1 },
  { id: 'moderate', label: 'Moderate', desc: 'Some shading or colour', multiplier: 1.25 },
  { id: 'detailed', label: 'Detailed', desc: 'Fine detail, realism', multiplier: 1.55 },
  { id: 'intricate', label: 'Intricate', desc: 'Micro-realism, heavy detail', multiplier: 1.9 },
] as const;

const transportZones = [
  { id: 'primary', label: 'Primary area', sub: 'Canggu · Seminyak · Kuta · Uluwatu · Ubud', addLow: 0, addHigh: 0 },
  { id: 'outer', label: 'Outside primary', sub: 'e.g. Amed · Lovina · Sidemen', addLow: 150000, addHigh: 350000 },
] as const;

const ROUND_TO = 50000;

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function computeRange(area: BodyArea, multiplier: number, zone: (typeof transportZones)[number]) {
  const low = roundTo(area.low * multiplier + zone.addLow, ROUND_TO);
  const high = roundTo(area.high * multiplier + zone.addHigh, ROUND_TO);
  const estimate = roundTo((low + high) / 2, ROUND_TO);
  return { low, high, estimate };
}

const feeData = [
  { fee: 'Booking Deposit', amount: '10% of total', when: 'Collected upon confirmation' },
  { fee: 'Balance', amount: '90% of total', when: 'Paid directly to your studio after the session' },
  { fee: 'Cancellation (48h+)', amount: 'Free', when: 'Reschedule or cancel at no charge' },
  { fee: 'Cancellation (<48h)', amount: 'Deposit forfeited', when: 'Short-notice cancellation' },
  { fee: 'Touch-up', amount: 'Free', when: 'Within 3 months on larger pieces' },
  { fee: 'Extra travel', amount: 'Rp 150.000–350.000', when: 'Outside primary service areas' },
];

/* ---------- components ---------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Pricing() {
  useSEO({
    title: 'Tattoo Pricing & Calculator',
    description:
      'Transparent tattoo pricing in IDR for Bali. Choose your piece — half arm, full arm, leg, chest or back — add detail and transport for an instant IDR range. Final quote confirmed on WhatsApp.',
    path: '/pricing',
  });

  const [areaId, setAreaId] = useState<string>('half-arm');
  const [detailId, setDetailId] = useState<(typeof detailLevels)[number]['id']>('moderate');
  const [zoneId, setZoneId] = useState<(typeof transportZones)[number]['id']>('primary');

  const area = bodyAreas.find((a) => a.id === areaId) ?? bodyAreas[0];
  const detail = detailLevels.find((d) => d.id === detailId) ?? detailLevels[1];
  const zone = transportZones.find((z) => z.id === zoneId) ?? transportZones[0];
  const { low, high, estimate } = useMemo(
    () => computeRange(area, detail.multiplier, zone),
    [area, detail, zone]
  );

  const quoteMessage = `Hi InkedUp, I'm interested in a ${area.name} piece (${detail.label.toLowerCase()}) in the ${zone.label.toLowerCase()} zone. The calculator showed ~${store.formatIDR(low)}–${store.formatIDR(high)}. Can you confirm a quote?`;

  return (
    <div className="min-h-[100dvh]">
      <PageHero
        image="/tattoo-work-4.jpg"
        label="TRANSPARENT PRICING"
        title="Bigger Pieces, Honest Prices"
        subtitle="We specialise in half-arm, full-arm and large pieces done at your villa. Pick your area below for an instant IDR range — your studio confirms the exact quote. A 10% deposit secures your booking."
      />

      {/* Section 3: Packages */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <div className="text-center mb-12">
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4">
              STARTING PACKAGES
            </span>
            <h2 className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy">
              What We Come to Your Villa For
            </h2>
            <p className="font-body text-[15px] text-slate-gray mt-3 max-w-[560px] mx-auto">
              Because our artists travel to you, we focus on larger, meaningful pieces — not tiny walk-in tattoos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
            {packages.map((tier, i) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: i * 0.12 + (tier.popular ? 0.1 : 0),
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className={`relative bg-warm-ivory rounded-xl overflow-hidden text-center border ${
                  tier.popular
                    ? 'border-2 border-champagne-gold shadow-[0_8px_32px_rgba(198,155,60,0.12)]'
                    : 'border-light-gray'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 font-body text-[11px] font-semibold uppercase tracking-[0.1em] bg-champagne-gold text-midnight-navy px-4 py-1 rounded-b-lg">
                    Most Popular
                  </span>
                )}

                <div className="aspect-square overflow-hidden bg-pure-white">
                  <img
                    src={tier.image}
                    alt={`${tier.label} tattoo example`}
                    width={512}
                    height={512}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-8">
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-champagne-gold">
                    {tier.label}
                  </span>
                  <p className="font-display text-[clamp(34px,3vw,46px)] font-medium text-midnight-navy mt-3 leading-none">
                    {tier.price}
                  </p>
                  <p className="font-body text-sm font-medium text-midnight-navy mt-1">{tier.area}</p>
                  <p className="font-body text-[15px] text-slate-gray leading-[1.6] mt-4">
                    {tier.description}
                  </p>

                  <div className="border-t border-light-gray my-6" />

                  <ul className="space-y-2.5 text-left">
                    {tier.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-2.5">
                        <Check size={16} className="text-bali-teal flex-shrink-0 mt-0.5" />
                        <span className="font-body text-sm text-charcoal">{inc}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/artists"
                    className={`block text-center mt-8 font-body text-sm font-semibold uppercase tracking-[0.04em] py-3.5 rounded transition-all duration-300 ${
                      tier.popular
                        ? 'gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98]'
                        : 'border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center mt-10"
          >
            <p className="font-body text-sm text-slate-gray flex items-center justify-center gap-1.5">
              <Info size={14} />
              + 10% booking deposit collected upon confirmation
            </p>
            <p className="font-body text-[13px] text-slate-gray mt-1">
              This secures your slot and covers our concierge services — the balance goes to your studio.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 4: What's Included */}
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
              WHAT YOU GET
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy"
            >
              Every Booking Includes
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 max-w-[800px] mx-auto">
            {includedItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="flex items-start gap-4 py-4"
              >
                <Check size={20} className="text-bali-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-[15px] font-semibold text-midnight-navy">{item.title}</p>
                  <p className="font-body text-sm text-slate-gray mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Body-area calculator */}
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
              PRICE ESTIMATOR
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-[28px] font-medium text-midnight-navy"
            >
              Choose Your Piece
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-[15px] text-slate-gray mt-3 max-w-[560px] mx-auto"
            >
              Pick the body area, detail level and your location for an instant IDR range. No measuring, no guesswork.
            </motion.p>
          </motion.div>

          {/* Body area cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-[1080px] mx-auto">
            {bodyAreas.map((a, i) => {
              const active = areaId === a.id;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  onClick={() => setAreaId(a.id)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  aria-pressed={active}
                  className={`text-left rounded-xl overflow-hidden border bg-warm-ivory transition-all ${
                    active
                      ? 'border-champagne-gold ring-2 ring-champagne-gold ring-offset-2 ring-offset-pure-white'
                      : 'border-light-gray hover:border-champagne-gold/60'
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-pure-white">
                    <img
                      src={a.image}
                      alt={`${a.name} tattoo placement`}
                      width={512}
                      height={512}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className={`font-body text-sm font-semibold ${active ? 'text-champagne-gold' : 'text-midnight-navy'}`}>
                      {a.name}
                    </p>
                    <p className="font-body text-[11px] text-slate-gray mt-0.5 leading-snug">{a.sub}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Controls + estimate */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-warm-ivory rounded-xl border border-light-gray p-6 md:p-8 max-w-[1080px] mx-auto mt-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">Detail level</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {detailLevels.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDetailId(d.id)}
                      aria-pressed={detailId === d.id}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        detailId === d.id
                          ? 'border-champagne-gold bg-champagne-gold/10'
                          : 'border-light-gray bg-pure-white hover:border-champagne-gold/60'
                      }`}
                    >
                      <span className="block font-body text-[13px] font-semibold text-midnight-navy">{d.label}</span>
                      <span className="block font-body text-[11px] text-slate-gray mt-0.5">{d.desc}</span>
                    </button>
                  ))}
                </div>

                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mt-6 mb-3">Your location (transport)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {transportZones.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setZoneId(z.id)}
                      aria-pressed={zoneId === z.id}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        zoneId === z.id
                          ? 'border-champagne-gold bg-champagne-gold/10'
                          : 'border-light-gray bg-pure-white hover:border-champagne-gold/60'
                      }`}
                    >
                      <span className="block font-body text-[13px] font-semibold text-midnight-navy">{z.label}</span>
                      <span className="block font-body text-[11px] text-slate-gray mt-0.5">{z.sub}</span>
                      <span className="block font-body text-[11px] text-bali-teal mt-1">
                        {z.addHigh === 0 ? 'No travel fee' : '+Rp 150.000–350.000'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate panel */}
              <div className="bg-pure-white rounded-lg border border-light-gray p-6 text-center flex flex-col">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border border-light-gray">
                  <img
                    src={area.image}
                    alt=""
                    width={512}
                    height={512}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-body text-sm font-semibold text-midnight-navy">{area.name}</p>
                <p className="font-body text-[12px] text-slate-gray">{area.sessions}</p>

                <Calculator size={22} className="text-champagne-gold mx-auto mt-4 mb-1" />
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray">Estimated range</p>
                <p className="font-display text-[clamp(26px,3.5vw,38px)] font-medium text-midnight-navy mt-1 leading-tight">
                  {store.formatIDR(low)} – {store.formatIDR(high)}
                </p>
                <p className="font-body text-[13px] text-slate-gray mt-1">
                  Typical ~ {store.formatIDR(estimate)}
                </p>
                <p className="font-body text-[12px] text-slate-gray mt-3">
                  {area.name} · {detail.label} · {zone.label}
                </p>

                <div className="mt-5 space-y-2">
                  <a
                    href={waLink(quoteMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full font-body text-sm font-semibold text-pure-white bg-champagne-gold rounded-full px-5 py-2.5 hover:bg-champagne-gold/90 transition-colors"
                  >
                    <MessageCircle size={16} /> Confirm quote on WhatsApp
                  </a>
                  <Link
                    to="/artists"
                    className="inline-flex items-center justify-center gap-2 w-full font-body text-sm font-medium text-champagne-gold hover:underline"
                  >
                    Browse artists <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="font-body text-[13px] text-slate-gray text-center italic mt-10 max-w-lg mx-auto"
          >
            Estimates are a guide only. Final pricing depends on exact size, placement, detail and time — your studio confirms a precise quote during consultation. Larger pieces are planned across multiple sessions.
          </motion.p>
        </div>
      </section>

      {/* Section 6: Additional Fees */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(48px, 6vw, 64px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="text-center mb-8"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              ADDITIONAL INFO
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display text-2xl font-medium text-midnight-navy"
            >
              The Fine Print
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-[700px] mx-auto bg-pure-white rounded-[10px] p-6 overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-gray">
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-[0.1em] text-slate-gray pb-3 pr-4">
                    Fee
                  </th>
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-[0.1em] text-slate-gray pb-3 pr-4">
                    Amount
                  </th>
                  <th className="text-left font-body text-xs font-semibold uppercase tracking-[0.1em] text-slate-gray pb-3">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {feeData.map((row, i) => (
                  <motion.tr
                    key={row.fee}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="border-b border-light-gray last:border-b-0"
                  >
                    <td className="font-mono-stat text-sm text-midnight-navy py-3.5 pr-4">
                      {row.fee}
                    </td>
                    <td className="font-body text-sm font-medium text-charcoal py-3.5 pr-4">
                      {row.amount}
                    </td>
                    <td className="font-body text-[13px] text-slate-gray py-3.5">
                      {row.when}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Section 7: CTA Banner */}
      <section className="bg-midnight-navy" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
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
              className="font-display text-[32px] font-medium text-pure-white"
            >
              Ready to Plan Your Piece?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-body text-base text-white/75 mt-3"
            >
              Browse our artists and find the perfect match for your next piece.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mt-8"
            >
              <Link
                to="/artists"
                className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-[14px] rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Browse Artists
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
