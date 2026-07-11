import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, MessageCircle, Eye, EyeOff,
  ArrowRight, ChevronLeft
} from 'lucide-react';
import store from '@/data/store';
import business, { waLink } from '@/data/business';

type Role = 'customer' | 'artist' | 'admin';

const roles: { key: Role; label: string }[] = [
  { key: 'customer', label: "I'm a Customer" },
  { key: 'artist', label: "I'm an Artist" },
  { key: 'admin', label: 'Admin' },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data is encrypted and protected',
  },
  {
    icon: Users,
    title: 'Verified Artists',
    description: 'Handpicked talent, quality guaranteed',
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: "We're here to help via WhatsApp",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Login() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem('inkedup_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.isAuthenticated && parsed.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (parsed.isAuthenticated && parsed.role === 'artist') {
          navigate('/artist/dashboard');
        }
      } catch { /* ignore */ }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      if (activeRole === 'admin') {
        await store.loginAsAdmin(email, password);
        navigate('/admin/dashboard');
      } else if (activeRole === 'artist') {
        await store.loginAsArtist();
        navigate('/artist/dashboard');
      } else {
        // Customer login — just set a flag and redirect home
        localStorage.setItem('inkedup_auth', JSON.stringify({ isAuthenticated: true, role: 'customer' }));
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* LEFT PANEL — Brand */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-midnight-navy flex-col justify-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(11,31,63,0.9) 0%, rgba(11,31,63,0.95) 100%)' }}
      >
        {/* Background image */}
        <img
          src="/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,31,63,0.9) 0%, rgba(11,31,63,0.95) 100%)' }} />

        <div className="relative z-10 px-[60px] max-w-[480px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <Link to="/" className="inline-block">
              <span className="font-display text-[28px] font-semibold tracking-[0.08em] text-pure-white">
                INKEDUP
              </span>
            </Link>
          </motion.div>

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display mt-8 text-pure-white"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, lineHeight: 1.1 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body text-base text-white/70 mt-3"
          >
            Sign in to access your account.
          </motion.p>

          {/* Feature list */}
          <div className="mt-12 space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i + 3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(198,155,60,0.1)' }}
                >
                  <f.icon size={18} className="text-champagne-gold" />
                </div>
                <div>
                  <p className="font-body text-[15px] font-semibold text-pure-white">{f.title}</p>
                  <p className="font-body text-[13px] text-white/60 mt-0.5">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom link - only for Artist tab */}
          <AnimatePresence>
            {activeRole === 'artist' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-12"
              >
                <p className="font-body text-sm text-white/60">
                  Want to partner with us?{' '}
                  <Link
                    to="/studio/apply"
                    className="font-semibold text-champagne-gold hover:underline transition-colors"
                  >
                    Apply as a Partner Studio <ArrowRight size={14} className="inline" />
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-pure-white overflow-y-auto"
        style={{ padding: 'clamp(40px, 8vh, 80px) clamp(24px, 5vw, 60px)' }}
      >
        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-[420px] mb-8 text-center">
          <Link to="/" className="inline-block">
            <span className="font-display text-[22px] font-semibold tracking-[0.08em] text-midnight-navy">
              INKEDUP
            </span>
          </Link>
          <p className="font-body text-sm text-slate-gray mt-2">Sign in to access your account.</p>
        </div>

        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait">
            {!showForgot ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Role Tabs */}
                <div className="flex mb-8 border-b border-light-gray">
                  {roles.map((role) => (
                    <button
                      key={role.key}
                      onClick={() => { setActiveRole(role.key); setError(''); }}
                      className={`flex-1 pb-3 font-body text-sm font-medium text-center transition-all duration-250 border-b-2 ${
                        activeRole === role.key
                          ? 'text-midnight-navy border-champagne-gold'
                          : 'text-slate-gray border-transparent hover:text-midnight-navy'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 rounded-md bg-coral-rose/10 border border-coral-rose/20"
                    >
                      <p className="font-body text-[13px] text-coral-rose">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all disabled:opacity-50"
                      placeholder="you@example.com"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3.5 pr-11 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all disabled:opacity-50"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-midnight-navy transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember me + Forgot password */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-[13px] text-slate-gray">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setError(''); }}
                      className="font-body text-[13px] text-champagne-gold hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </motion.div>

                  {/* Submit */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-[0_4px_24px_rgba(198,155,60,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-midnight-navy/30 border-t-midnight-navy rounded-full animate-spin" />
                      ) : null}
                      Sign In
                    </button>
                  </motion.div>

                  {/* Role-specific extras */}
                  <AnimatePresence mode="wait">
                    {activeRole === 'customer' && (
                      <motion.div
                        key="customer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                      >
                        <p className="font-body text-sm text-slate-gray text-center">
                          No account needed to book. Message us on{' '}
                          <a
                            href={waLink("Hi InkedUp, I'd like to book a tattoo.")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-champagne-gold hover:underline"
                          >
                            WhatsApp
                          </a>{' '}
                          and we&apos;ll handle everything.
                        </p>
                      </motion.div>
                    )}

                    {activeRole === 'artist' && (
                      <motion.div
                        key="artist"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 text-center"
                      >
                        <p className="font-body text-sm text-slate-gray">
                          New studio?{' '}
                          <Link
                            to="/studio/apply"
                            className="font-semibold text-champagne-gold hover:underline transition-colors"
                          >
                            Apply as a Partner Studio <ArrowRight size={14} className="inline" />
                          </Link>
                        </p>
                      </motion.div>
                    )}

                    {activeRole === 'admin' && (
                      <motion.div
                        key="admin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <p className="font-body text-xs text-slate-gray text-center">
                          Admin access is restricted to authorized personnel only.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Divider + Back link */}
                <div className="mt-8 pt-6 border-t border-light-gray text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 font-body text-sm text-slate-gray hover:text-champagne-gold transition-colors"
                  >
                    <ChevronLeft size={14} /> Back to website
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* RESET / HELP VIEW — no self-serve reset; hand off to support */
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <h2 className="font-display text-2xl font-medium text-midnight-navy">Need help signing in?</h2>
                <p className="font-body text-sm text-slate-gray mt-2">
                  We don&apos;t offer self-serve password resets. Contact us and we&apos;ll get you back in quickly.
                </p>
                <div className="mt-6 space-y-3">
                  <a
                    href={waLink("Hi InkedUp, I need help accessing my account.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-[0_4px_24px_rgba(198,155,60,0.35)] transition-all duration-300"
                  >
                    Message us on WhatsApp
                  </a>
                  <a
                    href={`mailto:${business.email}?subject=Account%20access%20help`}
                    className="w-full flex items-center justify-center font-body text-sm py-3 rounded border border-light-gray text-charcoal hover:bg-warm-ivory transition-all duration-200"
                  >
                    Email {business.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setError(''); }}
                    className="w-full font-body text-sm font-medium py-3 text-slate-gray hover:text-midnight-navy transition-colors"
                  >
                    <ChevronLeft size={14} className="inline mr-1" /> Back to login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
