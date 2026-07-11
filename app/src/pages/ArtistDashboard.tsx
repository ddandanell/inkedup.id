import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, User, Image, DollarSign,
  Settings, Bell, Menu, X, CheckCircle, Star,
  MapPin, ArrowRight, ChevronUp, Circle,
  LogOut, MessageCircle
} from 'lucide-react';
import store from '@/data/store';
import type { BookingLead } from '@/data/types';

const sidebarNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', route: '/artist/dashboard' },
  { icon: Calendar, label: 'My Bookings', route: '/artist/dashboard?tab=bookings' },
  { icon: User, label: 'My Profile', route: '/artist/profile' },
  { icon: Image, label: 'Portfolio', route: '/artist/dashboard?tab=portfolio' },
  { icon: DollarSign, label: 'Earnings', route: '/artist/dashboard?tab=earnings' },
  { icon: Settings, label: 'Settings', route: '/artist/dashboard?tab=settings' },
];

const profileChecklist = [
  { label: 'Upload profile photo', done: true },
  { label: 'Add bio', done: true },
  { label: 'Select tattoo styles', done: true },
  { label: 'Upload portfolio images', done: true },
  { label: 'Set availability calendar', done: false },
  { label: 'Add pricing', done: false },
  { label: 'Verify WhatsApp number', done: false },
];

const activities = [
  { type: 'booking', icon: Calendar, color: 'text-bali-teal', action: 'New booking confirmed', detail: 'Sarah M. — Fine Line — Jan 20', time: '2h ago' },
  { type: 'review', icon: Star, color: 'text-champagne-gold', action: 'New 5★ review received', detail: "From Marcus C. — 'Absolutely amazing work'", time: '1d ago' },
  { type: 'payment', icon: DollarSign, color: 'text-midnight-navy', action: 'Payment processed', detail: 'Rp 1.800.000 — Sarah M. booking', time: '2d ago' },
  { type: 'profile', icon: User, color: 'text-slate-gray', action: 'Profile viewed 24 times', detail: 'This week', time: '3d ago' },
];

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem('inkedup_auth');
    if (!auth) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(auth);
      if (!parsed.isAuthenticated || parsed.role !== 'artist') {
        navigate('/login');
        return;
      }
      setIsArtist(true);
    } catch {
      navigate('/login');
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  // Fetch artist bookings
  useEffect(() => {
    let cancelled = false;
    store.getBookingLeads()
      .then(data => {
        if (cancelled) return;
        const artistBookings = data
          .filter(b => b.status === 'confirmed' || b.status === 'deposit_paid' || b.status === 'new')
          .slice(0, 5);
        setBookings(artistBookings);
        setLoadingBookings(false);
      })
      .catch(err => {
        if (cancelled) return;
        setBookingError(err instanceof Error ? err.message : 'Failed to load bookings');
        setLoadingBookings(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [window.location.pathname]);

  if (!authChecked || !isArtist) {
    return (
      <div className="min-h-[100dvh] bg-warm-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-light-gray border-t-champagne-gold rounded-full animate-spin" />
      </div>
    );
  }

  const profileCompletion = Math.round((profileChecklist.filter(c => c.done).length / profileChecklist.length) * 100);
  const remainingItems = profileChecklist.filter(c => !c.done).length;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-[100dvh] bg-warm-ivory">
      {/* Artist Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-midnight-navy flex items-center px-4 lg:px-6">
        <div className="w-full flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-pure-white/70 hover:text-pure-white transition-colors"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="flex items-center">
              <span className="font-display text-lg font-semibold tracking-[0.08em] text-pure-white">
                INKEDUP
              </span>
              <span className="font-body text-[10px] font-semibold text-champagne-gold uppercase tracking-[0.1em] ml-2">
                ARTIST PORTAL
              </span>
            </Link>
          </div>

          {/* Center: Title (desktop) */}
          <span className="hidden lg:block font-body text-sm text-white/60">
            Artist Dashboard
          </span>

          {/* Right: Notifications + Avatar */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-gray hover:text-pure-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-coral-rose" />
            </button>
            <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-deep-ocean flex items-center justify-center overflow-hidden cursor-pointer">
              <User size={16} className="text-pure-white" />
            </div>
            <button
              onClick={() => { store.logout(); navigate('/login'); }}
              className="hidden sm:flex items-center gap-1 font-body text-xs text-white/50 hover:text-champagne-gold transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-midnight-navy/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-[260px] bg-deep-ocean z-[95] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Artist Mini Profile */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-midnight-navy border border-white/10 flex items-center justify-center">
              <User size={20} className="text-pure-white" />
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-pure-white">Ayu Dewi</p>
              <p className="font-body text-[11px] text-bali-teal flex items-center gap-1">
                <CheckCircle size={10} /> Verified
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="py-4 flex-1">
          {sidebarNavItems.map((item) => {
            const isActive = item.route === '/artist/dashboard';
            return (
              <Link
                key={item.label}
                to={item.route}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 font-body text-sm transition-all duration-200 border-l-[3px] ${
                  isActive
                    ? 'text-pure-white border-champagne-gold bg-white/[0.06]'
                    : 'text-slate-gray border-transparent hover:text-pure-white hover:bg-white/[0.04]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Help */}
        <div className="p-6 border-t border-white/[0.06]">
          <p className="font-body text-xs font-semibold text-slate-gray">Need Help?</p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs text-champagne-gold hover:underline mt-1 flex items-center gap-1"
          >
            <MessageCircle size={12} /> Contact Support
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[260px] mt-16 min-h-[calc(100dvh-64px)] p-6 lg:p-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-2"
        >
          <div>
            <h1 className="font-display text-[28px] font-medium text-midnight-navy">Welcome back, Ayu</h1>
            <p className="font-body text-[15px] text-slate-gray mt-1">Here&apos;s what&apos;s happening with your bookings.</p>
          </div>
          <p className="font-body text-sm text-slate-gray">{today}</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Upcoming Sessions', value: '4', change: '+2 this week', icon: Calendar, changeColor: 'text-bali-teal' },
            { label: 'Completed', value: '127', change: '+8 this month', icon: CheckCircle, changeColor: 'text-bali-teal' },
            { label: 'Total Earnings', value: 'Rp 45.000.000', change: '+15% this month', icon: DollarSign, changeColor: 'text-bali-teal' },
            { label: 'Rating', value: '4.9', change: '—', icon: Star, changeColor: 'text-slate-gray' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-pure-white rounded-xl p-5 border-l-[3px] border-champagne-gold"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-medium uppercase tracking-[0.08em] text-slate-gray">{s.label}</span>
                <s.icon size={20} className="text-slate-gray" />
              </div>
              <p className="font-mono-stat text-midnight-navy" style={{ fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 500 }}>
                {s.value}
              </p>
              <p className={`font-body text-xs ${s.changeColor} mt-1 flex items-center gap-0.5`}>
                {s.change !== '—' && <ChevronUp size={12} />}
                {s.change}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Upcoming Bookings Table */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-pure-white rounded-xl overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
                <h2 className="font-display text-xl font-medium text-midnight-navy">Upcoming Bookings</h2>
                <Link to="/artist/dashboard?tab=bookings" className="font-body text-[13px] text-champagne-gold hover:underline flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {loadingBookings ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-light-gray border-t-champagne-gold rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-body text-sm text-slate-gray">Loading bookings...</p>
                </div>
              ) : bookingError ? (
                <div className="p-8 text-center">
                  <p className="font-body text-sm text-coral-rose">{bookingError}</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar size={32} className="mx-auto text-slate-gray/40 mb-2" />
                  <p className="font-body text-sm text-slate-gray">No upcoming bookings</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-warm-ivory">
                        <th className="text-left px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-slate-gray">Client</th>
                        <th className="text-left px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-slate-gray">Date</th>
                        <th className="text-left px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-slate-gray hidden md:table-cell">Location</th>
                        <th className="text-left px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-slate-gray hidden sm:table-cell">Style</th>
                        <th className="text-left px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.08em] text-slate-gray">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <motion.tr
                          key={b.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
                          className="border-b border-light-gray last:border-b-0 hover:bg-[rgba(198,155,60,0.02)] transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-deep-ocean/20 flex items-center justify-center flex-shrink-0">
                                <User size={14} className="text-deep-ocean" />
                              </div>
                              <span className="font-body text-sm font-medium text-midnight-navy">{b.customerName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-body text-sm text-charcoal">
                              {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="font-body text-[13px] text-slate-gray flex items-center gap-1">
                              <MapPin size={12} /> {b.customerLocation || 'TBD'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="inline-block px-3 py-0.5 rounded-full font-body text-[11px] font-semibold uppercase bg-champagne-gold/10 text-champagne-gold">
                              {b.tattooStyle}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase ${
                              b.status === 'confirmed' || b.status === 'deposit_paid'
                                ? 'bg-bali-teal/10 text-bali-teal'
                                : b.status === 'new' || b.status === 'reviewed'
                                  ? 'bg-champagne-gold/10 text-champagne-gold'
                                  : 'bg-coral-rose/10 text-coral-rose'
                            }`}>
                              {b.status === 'deposit_paid' ? 'Confirmed' : b.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Recent Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-pure-white rounded-xl p-5 mt-6"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <h2 className="font-display text-xl font-medium text-midnight-navy mb-4">Recent Activity</h2>
              <div>
                {activities.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.06, duration: 0.4 }}
                    className={`flex items-start gap-3 py-3.5 ${i > 0 ? 'border-t border-light-gray' : ''}`}
                  >
                    <a.icon size={16} className={`${a.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-charcoal">{a.action}</p>
                      <p className="font-body text-xs text-slate-gray mt-0.5">{a.detail}</p>
                    </div>
                    <span className="font-body text-xs text-slate-gray flex-shrink-0">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Profile Completion */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-pure-white rounded-xl p-5"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <h2 className="font-display text-xl font-medium text-midnight-navy mb-4">Profile Completion</h2>

              {/* Progress bar */}
              <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="h-full rounded-full gold-shimmer"
                />
              </div>
              <p className="font-body text-[13px] text-slate-gray mt-2">
                {profileCompletion}% complete — {remainingItems} items remaining
              </p>

              {/* Checklist */}
              <div className="mt-5 space-y-3">
                {profileChecklist.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-2.5"
                  >
                    {item.done ? (
                      <CheckCircle size={16} className="text-bali-teal flex-shrink-0" />
                    ) : (
                      <Circle size={16} className="text-light-gray flex-shrink-0" />
                    )}
                    <span className={`font-body text-sm ${item.done ? 'text-charcoal' : 'text-slate-gray'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/artist/profile"
                className="mt-5 inline-flex items-center gap-1 font-body text-sm font-semibold uppercase tracking-[0.04em] px-5 py-2.5 rounded border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all"
              >
                Complete Profile <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
