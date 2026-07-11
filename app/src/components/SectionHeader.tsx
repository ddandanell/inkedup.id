import { motion } from 'framer-motion';

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function SectionHeader({
  label,
  title,
  subtitle,
  centered = true,
  light = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <motion.div
      className={`${centered ? 'text-center' : ''} ${className}`}
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
        {label}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={`font-display text-section-title ${light ? 'text-pure-white' : 'text-midnight-navy'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className={`font-body text-base mt-4 max-w-xl ${centered ? 'mx-auto' : ''} ${light ? 'text-white/70' : 'text-slate-gray'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
