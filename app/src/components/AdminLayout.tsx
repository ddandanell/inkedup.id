import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  BarChart3,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import store from '@/data/store';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Applications', href: '/admin/applications', badge: 'pendingApps' },
  { icon: Users, label: 'Artists', href: '/admin/artists' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings', badge: 'newBookings' },
  { icon: DollarSign, label: 'Commissions', href: '/admin/commissions' },
];

const analyticsNavItems = [
  { icon: BarChart3, label: 'Reports', href: '/admin/dashboard?tab=reports' },
  { icon: TrendingUp, label: 'Growth', href: '/admin/dashboard?tab=growth' },
];

const settingsNavItems = [
  { icon: Settings, label: 'Platform Settings', href: '/admin/dashboard?tab=settings' },
  { icon: Shield, label: 'Moderation', href: '/admin/dashboard?tab=moderation' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingApps, setPendingApps] = useState(0);
  const [newBookings, setNewBookings] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      const token = localStorage.getItem('inkedup_token');
      const authStr = localStorage.getItem('inkedup_auth');
      if (!token || !authStr) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('unauthorized');
        const me = await res.json();
        if (me.role !== 'admin') throw new Error('forbidden');
        if (!cancelled) setIsAdmin(true);
      } catch {
        localStorage.removeItem('inkedup_token');
        localStorage.removeItem('inkedup_auth');
        if (!cancelled) navigate('/login');
      }
    };
    verify();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    store.getStats()
      .then((stats) => {
        if (!cancelled) {
          setPendingApps(stats.pendingStudioApplications);
          setNewBookings(stats.pendingBookings);
        }
      })
      .catch(() => {
        // ignore stats errors in layout
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    store.logout();
    navigate('/');
  };

  if (!isAdmin) {
    return null;
  }

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return location.pathname === href.split('?')[0] && location.search === href.slice(href.indexOf('?'));
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-[100dvh] bg-[#0D1F30]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-[56px] bg-midnight-navy border-b border-white/[0.06] z-[100] flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-gray hover:text-pure-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center">
              <span className="font-display text-[16px] font-semibold tracking-[0.08em] text-pure-white">
                INKEDUP
              </span>
              <span className="ml-2 font-body text-[9px] font-semibold text-midnight-navy bg-champagne-gold px-2 py-[2px] rounded">
                ADMIN
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-[13px] text-slate-gray hover:text-pure-white transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-[56px] bottom-0 w-[240px] bg-[#0A1929] border-r border-white/[0.06] z-[50]">
        <nav className="py-4">
          {/* Main Section */}
          <div className="px-3 space-y-[2px]">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const badgeCount = item.badge === 'pendingApps' ? pendingApps :
                item.badge === 'newBookings' ? newBookings : 0;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                    active
                      ? 'bg-champagne-gold/10 text-pure-white'
                      : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-champagne-gold' : ''} />
                  <span className="font-body text-[13px] font-normal flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-coral-rose text-pure-white font-body text-[10px] font-semibold">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Analytics Section */}
          <div className="mt-6">
            <div className="px-5 py-2 font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
              Analytics
            </div>
            <div className="px-3 space-y-[2px]">
              {analyticsNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                    isActive(item.href)
                      ? 'bg-champagne-gold/10 text-pure-white'
                      : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon size={16} className={isActive(item.href) ? 'text-champagne-gold' : ''} />
                  <span className="font-body text-[13px] font-normal">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div className="mt-6">
            <div className="px-5 py-2 font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
              Settings
            </div>
            <div className="px-3 space-y-[2px]">
              {settingsNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                    isActive(item.href)
                      ? 'bg-champagne-gold/10 text-pure-white'
                      : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon size={16} className={isActive(item.href) ? 'text-champagne-gold' : ''} />
                  <span className="font-body text-[13px] font-normal">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom version */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 font-body text-[11px] text-white/20">
          v1.0.0
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-midnight-navy/70 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed left-0 top-[56px] bottom-0 w-[260px] bg-[#0A1929] border-r border-white/[0.06] z-[70] lg:hidden overflow-y-auto"
            >
              <nav className="py-4">
                <div className="px-3 space-y-[2px]">
                  {mainNavItems.map((item) => {
                    const active = isActive(item.href);
                    const badgeCount = item.badge === 'pendingApps' ? pendingApps :
                      item.badge === 'newBookings' ? newBookings : 0;

                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                          active
                            ? 'bg-champagne-gold/10 text-pure-white'
                            : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <item.icon size={16} className={active ? 'text-champagne-gold' : ''} />
                        <span className="font-body text-[13px] font-normal flex-1">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-coral-rose text-pure-white font-body text-[10px] font-semibold">
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <div className="px-5 py-2 font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
                    Analytics
                  </div>
                  <div className="px-3 space-y-[2px]">
                    {analyticsNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                          isActive(item.href)
                            ? 'bg-champagne-gold/10 text-pure-white'
                            : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <item.icon size={16} className={isActive(item.href) ? 'text-champagne-gold' : ''} />
                        <span className="font-body text-[13px] font-normal">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="px-5 py-2 font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em]">
                    Settings
                  </div>
                  <div className="px-3 space-y-[2px]">
                    {settingsNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center gap-[10px] px-5 py-[10px] rounded-md mx-3 transition-all duration-150 ${
                          isActive(item.href)
                            ? 'bg-champagne-gold/10 text-pure-white'
                            : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <item.icon size={16} className={isActive(item.href) ? 'text-champagne-gold' : ''} />
                        <span className="font-body text-[13px] font-normal">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6 px-5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-[10px] text-slate-gray hover:text-pure-white transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-body text-[13px]">Sign Out</span>
                  </button>
                </div>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 px-5 py-4 font-body text-[11px] text-white/20">
                v1.0.0
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:ml-[240px] mt-[56px] min-h-[calc(100dvh-56px)] p-6">
        {children}
      </main>
    </div>
  );
}
