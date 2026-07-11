import { Link } from 'react-router';
import { Mail, Instagram } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import business from '@/data/business';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const exploreLinks = [
  { label: 'Artists', href: '/artists' },
  { label: 'Studios', href: '/studios' },
  { label: 'Inspiration', href: '/inspiration' },
  { label: 'Locations', href: '/locations' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Safety', href: '/safety' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Apply as Studio', href: '/studio/apply' },
];

const locationLinks = [
  { label: 'Canggu', href: '/locations' },
  { label: 'Seminyak', href: '/locations' },
  { label: 'Uluwatu', href: '/locations' },
  { label: 'Ubud', href: '/locations' },
];

const handleFromUrl = (url: string) => '@' + url.replace(/\/$/, '').split('/').pop();

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-midnight-navy pt-20 pb-8">
      <div className="container-inkedup">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Brand Column */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <Link to="/" aria-label="InkedUp home" className="inline-flex items-center gap-2">
              <img
                src="/logo-mark.png"
                alt=""
                aria-hidden="true"
                className="h-7 w-7 object-contain"
                width={28}
                height={28}
              />
              <span className="font-display text-xl font-semibold tracking-[0.08em] text-pure-white">
                INKEDUP
              </span>
            </Link>
            <p className="font-body text-sm text-white/60 mt-2">
              Bali's Premium Mobile Tattoo Concierge
            </p>
            <p className="font-body text-sm text-white/60 mt-4 max-w-[280px]">
              Verified studios. Sterile mobile setup. We bring the studio to your villa.
            </p>
          </motion.div>

          {/* Explore Column */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <h4 className="font-body text-xs font-semibold text-pure-white uppercase tracking-[0.1em] mb-5">
              Explore
            </h4>
            <ul className="space-y-1">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-white/65 hover:text-champagne-gold transition-colors leading-[2.2] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Locations Column */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <h4 className="font-body text-xs font-semibold text-pure-white uppercase tracking-[0.1em] mb-5">
              Locations
            </h4>
            <ul className="space-y-1">
              {locationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-white/65 hover:text-champagne-gold transition-colors leading-[2.2] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Column */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <h4 className="font-body text-xs font-semibold text-pure-white uppercase tracking-[0.1em] mb-5">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <WhatsAppButton className="static">
                <span className="flex items-center gap-2 font-body text-sm text-white/65 hover:text-champagne-gold transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {business.whatsappDisplay}
                </span>
              </WhatsAppButton>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 font-body text-sm text-white/65 hover:text-champagne-gold transition-colors"
              >
                <Mail size={16} />
                {business.email}
              </a>
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-body text-sm text-white/65 hover:text-champagne-gold transition-colors"
              >
                <Instagram size={16} />
                {handleFromUrl(business.instagram)}
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/65 hover:text-champagne-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <WhatsAppButton className="static">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white/65 hover:text-champagne-gold transition-colors">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </WhatsAppButton>
              <a
                href={business.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/65 hover:text-champagne-gold transition-colors"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="font-body text-[13px] text-white/60">
            &copy; {year} {business.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="font-body text-[13px] text-white/65 hover:text-champagne-gold transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/60">&middot;</span>
            <Link to="/terms" className="font-body text-[13px] text-white/65 hover:text-champagne-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
