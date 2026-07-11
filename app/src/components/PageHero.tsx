import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeroProps {
  image: string;
  label: string;
  title: string;
  subtitle?: string;
  /** CSS object-position for the background image (e.g. 'center', 'top'). */
  imagePosition?: string;
  /** Optional extra content rendered below the subtitle (e.g. a search bar or stats). */
  children?: ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * Reusable page hero: a full-bleed background photograph with a gentle drift,
 * a navy scrim that keeps the white heading legible, and the page's label /
 * title / subtitle. Used at the top of every public page so the imagery adds
 * atmosphere without stealing focus from the content.
 */
export default function PageHero({
  image,
  label,
  title,
  subtitle,
  imagePosition = 'center',
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-midnight-navy pt-[clamp(80px,10vw,120px)] pb-[clamp(56px,7vw,96px)]">
      {/* Background image + scrim */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover hero-drift"
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0 bg-midnight-navy/45" />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
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
            transition={{ duration: 0.5, ease }}
            className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
          >
            {label}
          </motion.span>
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, ease }}
            className="font-display text-[clamp(36px,5vw,64px)] font-medium text-pure-white leading-[1.1] tracking-[-0.01em]"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.15, ease }}
              className="font-body text-base text-white/80 max-w-[600px] mx-auto mt-4"
            >
              {subtitle}
            </motion.p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
