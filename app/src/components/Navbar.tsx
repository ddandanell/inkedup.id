import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const discoverLinks = [
  { label: 'Artists', href: '/artists', description: 'Browse verified tattoo artists' },
  { label: 'Studios', href: '/studios', description: 'Explore partner studios' },
  { label: 'Inspiration', href: '/inspiration', description: 'Portfolio gallery & ideas' },
];

const navLinks = [
  { label: 'Locations', href: '/locations' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Safety', href: '/safety' },
  { label: 'Apply as Studio', href: '/studio/apply' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const location = useLocation();
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDiscoverOpen(false);
  }, [location.pathname]);

  // Close menus on Escape and, for the desktop dropdown, on outside click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setDiscoverOpen(false);
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, []);

  // When the mobile dialog opens, move focus into it for keyboard users.
  useEffect(() => {
    if (mobileOpen) {
      const first = mobilePanelRef.current?.querySelector<HTMLElement>('a, button');
      first?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <nav
        className={`sticky top-0 z-[100] w-full h-[72px] flex items-center transition-all duration-350 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-pure-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="container-inkedup w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo-mark.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-9 object-contain"
              width={36}
              height={36}
            />
            <span
              className={`font-display text-[22px] font-semibold tracking-[0.08em] transition-colors duration-350 ${
                isTransparent ? 'text-pure-white' : 'text-midnight-navy'
              }`}
            >
              INKEDUP
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Discover dropdown — click/keyboard disclosure (hover as enhancement) */}
            <div
              className="relative"
              ref={discoverRef}
              onMouseEnter={() => setDiscoverOpen(true)}
              onMouseLeave={() => setDiscoverOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDiscoverOpen((o) => !o)}
                className={`flex items-center gap-1 font-body text-sm font-medium transition-colors duration-250 ${
                  isTransparent
                    ? 'text-pure-white/90 hover:text-pure-white'
                    : 'text-midnight-navy hover:text-champagne-gold'
                }`}
                aria-haspopup="menu"
                aria-expanded={discoverOpen}
                aria-controls="discover-menu"
              >
                Discover
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${discoverOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                id="discover-menu"
                role="menu"
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                  discoverOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <div className="bg-pure-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-midnight-navy/8 p-2 min-w-[200px]">
                  {discoverLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      role="menuitem"
                      onClick={() => setDiscoverOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-warm-ivory/50 transition-colors"
                    >
                      <span className="block font-body text-sm font-semibold text-midnight-navy">
                        {link.label}
                      </span>
                      <span className="block font-body text-xs text-midnight-navy/60 mt-0.5">
                        {link.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative font-body text-sm font-medium transition-colors duration-250 group ${
                  isTransparent
                    ? 'text-pure-white/90 hover:text-pure-white'
                    : 'text-midnight-navy hover:text-champagne-gold'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-champagne-gold origin-left scale-x-0 transition-transform duration-250 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/artists"
              className="font-body text-[13px] font-semibold uppercase tracking-[0.04em] px-6 py-2.5 rounded bg-champagne-gold text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 transition-colors ${
              isTransparent ? 'text-pure-white' : 'text-midnight-navy'
            }`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            ref={mobilePanelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] bg-midnight-navy lg:hidden"
          >
            <div className="flex flex-col items-start justify-center h-full px-10 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="font-display text-3xl text-pure-white/40">Discover</span>
              </motion.div>
              {discoverLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 1) * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    className="font-display text-3xl text-pure-white hover:text-champagne-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (discoverLinks.length + i + 1) * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    className="font-display text-3xl text-pure-white hover:text-champagne-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (discoverLinks.length + navLinks.length + 1) * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4"
              >
                <Link
                  to="/artists"
                  className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded bg-champagne-gold text-midnight-navy"
                >
                  Book Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
