import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  LayoutDashboard, Calendar, User, Image, DollarSign,
  Settings, Bell, Menu, X, Check, CheckCircle, Eye,
  Upload, GripVertical, Trash2, Plus, ArrowRight,
  LogOut, MessageCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import store from '@/data/store';
import type { Artist } from '@/data/types';

const sidebarNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', route: '/artist/dashboard' },
  { icon: Calendar, label: 'My Bookings', route: '/artist/dashboard?tab=bookings' },
  { icon: User, label: 'My Profile', route: '/artist/profile' },
  { icon: Image, label: 'Portfolio', route: '/artist/dashboard?tab=portfolio' },
  { icon: DollarSign, label: 'Earnings', route: '/artist/dashboard?tab=earnings' },
  { icon: Settings, label: 'Settings', route: '/artist/dashboard?tab=settings' },
];

const tattooStyles = [
  'Fine Line', 'Blackwork', 'Traditional', 'Japanese',
  'Watercolor', 'Minimalist', 'Geometric', 'Realism',
  'Floral', 'Script', 'Tribal', 'Dotwork', 'Portrait', 'Abstract',
];

const languagesList = ['English', 'Indonesian', 'Balinese', 'Japanese', 'Russian', 'French', 'German', 'Mandarin'];

const timeOptions = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type TabKey = 'photos' | 'bio' | 'availability' | 'pricing';

const tabs: { key: TabKey; icon: typeof Image; label: string }[] = [
  { key: 'photos', icon: Image, label: 'Photos' },
  { key: 'bio', icon: User, label: 'Bio & Styles' },
  { key: 'availability', icon: Calendar, label: 'Availability' },
  { key: 'pricing', icon: DollarSign, label: 'Pricing' },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function FileDropzone({ onDropFiles, label }: { onDropFiles: (files: File[]) => void; label: string }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onDropFiles(acceptedFiles);
  }, [onDropFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive ? 'border-champagne-gold bg-champagne-gold/5' : 'border-light-gray hover:border-champagne-gold/50'
      }`}
    >
      <input {...getInputProps()} />
      <Upload size={22} className="mx-auto text-slate-gray mb-1.5" />
      <p className="font-body text-sm text-champagne-gold font-medium">{label}</p>
      <p className="font-body text-xs text-slate-gray mt-1">JPG, PNG up to 10MB</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function ArtistProfileBuilder() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('photos');
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Form state
  const [displayName, setDisplayName] = useState('Ayu Dewi');
  const [bio, setBio] = useState('Specializing in fine line and minimalist tattoos with 8+ years of experience. Inspired by Balinese culture and nature.');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Fine Line', 'Minimalist', 'Geometric']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Indonesian']);
  const [specialties, setSpecialties] = useState<string[]>(['Cover-ups', 'Custom Design', 'Small Scale', 'First-timer Friendly']);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [instagram, setInstagram] = useState('@ayudewi.tattoo');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('Canggu, Bali');

  // Availability state
  const [daySchedules, setDaySchedules] = useState<Record<string, { enabled: boolean; from: string; to: string }>>({
    Monday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Tuesday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Wednesday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Thursday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Friday: { enabled: true, from: '10:00 AM', to: '8:00 PM' },
    Saturday: { enabled: true, from: '9:00 AM', to: '8:00 PM' },
    Sunday: { enabled: false, from: '', to: '' },
  });

  // Pricing state
  const [pricing, setPricing] = useState({ small: 800000, medium: 1600000, large: 3200000 });
  const [priceOptions, setPriceOptions] = useState({
    touchUps: false,
    travelFee: false,
    consultation: false,
    rushBookings: false,
  });

  // Portfolio images
  const [portfolioImages, setPortfolioImages] = useState([
    '/tattoo-work-1.jpg', '/tattoo-work-2.jpg', '/tattoo-work-3.jpg',
    '/tattoo-work-4.jpg', '/tattoo-work-5.jpg', '/tattoo-work-6.jpg',
  ]);

  // Async profile loading
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultDaySchedules: Record<string, { enabled: boolean; from: string; to: string }> = {
    Monday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Tuesday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Wednesday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Thursday: { enabled: true, from: '10:00 AM', to: '6:00 PM' },
    Friday: { enabled: true, from: '10:00 AM', to: '8:00 PM' },
    Saturday: { enabled: true, from: '9:00 AM', to: '8:00 PM' },
    Sunday: { enabled: false, from: '', to: '' },
  };

  const availabilityToDaySchedules = useCallback((availability: string[] = []): Record<string, { enabled: boolean; from: string; to: string }> => {
    const result: Record<string, { enabled: boolean; from: string; to: string }> = {};
    daysOfWeek.forEach(day => {
      result[day] = { enabled: false, from: '', to: '' };
    });
    availability.forEach(slot => {
      const match = slot.match(/^(\w+):\s*([\d:]+\s*[AP]M)\s*-\s*([\d:]+\s*[AP]M)$/);
      if (match) {
        const [, day, from, to] = match;
        if (result[day]) {
          result[day] = { enabled: true, from, to };
        }
      }
    });
    return result;
  }, []);

  const daySchedulesToAvailability = useCallback((schedules: Record<string, { enabled: boolean; from: string; to: string }>): string[] => {
    return daysOfWeek
      .filter(day => schedules[day]?.enabled && schedules[day].from && schedules[day].to)
      .map(day => `${day}: ${schedules[day].from} - ${schedules[day].to}`);
  }, []);

  // Auth check + load artist profile
  useEffect(() => {
    let cancelled = false;

    const checkAuthAndLoad = async () => {
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

      try {
        setLoading(true);
        setError(null);
        const slug = 'ayu-dewi';
        const data = await store.getArtistBySlug(slug);
        if (cancelled) return;
        if (!data) {
          setError('Artist profile not found.');
          setArtist(null);
        } else {
          setArtist(data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuthAndLoad();
    return () => { cancelled = true; };
  }, [navigate]);

  // Sync form state from loaded artist
  useEffect(() => {
    if (!artist) return;
    setDisplayName(artist.displayName || 'Ayu Dewi');
    setBio(artist.bio || '');
    setSelectedStyles(artist.styles?.length ? artist.styles : ['Fine Line', 'Minimalist', 'Geometric']);
    setSelectedLanguages(artist.languages?.length ? artist.languages : ['English', 'Indonesian']);
    setSpecialties(artist.specialties?.length ? artist.specialties : ['Cover-ups', 'Custom Design', 'Small Scale', 'First-timer Friendly']);
    setInstagram(artist.instagram || '');
    setLocation(artist.location || 'Canggu, Bali');
    setPortfolioImages(artist.portfolioImages?.length ? artist.portfolioImages : portfolioImages);
    setPricing(artist.pricing || { small: 800000, medium: 1600000, large: 3200000 });
    setDaySchedules(artist.availability?.length ? availabilityToDaySchedules(artist.availability) : defaultDaySchedules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, availabilityToDaySchedules]);

  // Auto-save trigger
  const markChanged = () => {
    setHasChanges(true);
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 2000);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
    markChanged();
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
    markChanged();
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties(prev => [...prev, specialtyInput.trim()]);
      setSpecialtyInput('');
      markChanged();
    }
  };

  const removeSpecialty = (s: string) => {
    setSpecialties(prev => prev.filter(x => x !== s));
    markChanged();
  };

  const updateDay = (day: string, patch: Partial<{ enabled: boolean; from: string; to: string }>) => {
    setDaySchedules(prev => ({ ...prev, [day]: { ...prev[day], ...patch } }));
    markChanged();
  };

  const handlePortfolioDrop = (files: File[]) => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPortfolioImages(prev => [...prev, ...urls].slice(0, 15));
    markChanged();
  };

  const removePortfolioImage = (i: number) => {
    setPortfolioImages(prev => prev.filter((_, idx) => idx !== i));
    markChanged();
  };

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await store.updateArtist(artist.id, {
        displayName,
        bio,
        styles: selectedStyles,
        languages: selectedLanguages,
        specialties,
        location,
        instagram,
        portfolioImages,
        pricing,
        availability: daySchedulesToAvailability(daySchedules),
      });
      setArtist(updated);
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!isArtist || loading) {
    return (
      <div className="min-h-[100dvh] bg-warm-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-light-gray border-t-champagne-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-warm-ivory pb-20">
      {/* Artist Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-midnight-navy flex items-center px-4 lg:px-6">
        <div className="w-full flex items-center justify-between">
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

          <span className="hidden lg:block font-body text-sm text-white/60">
            Edit Profile
          </span>

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

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-[260px] bg-deep-ocean z-[95] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-midnight-navy border border-white/10 flex items-center justify-center">
              <User size={20} className="text-pure-white" />
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-pure-white">{artist?.displayName || 'Artist'}</p>
              <p className="font-body text-[11px] text-bali-teal flex items-center gap-1">
                <CheckCircle size={10} /> Verified
              </p>
            </div>
          </div>
        </div>

        <nav className="py-4">
          {sidebarNavItems.map((item) => {
            const isActive = item.route === '/artist/profile';
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="font-display text-[28px] font-medium text-midnight-navy">My Profile</h1>
            <p className="font-body text-[15px] text-slate-gray mt-1">
              Manage how customers see you on the platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 font-body text-sm font-medium px-4 py-2.5 rounded text-midnight-navy hover:bg-warm-ivory transition-colors">
              <Eye size={16} /> Preview Profile
            </button>
            <Link
              to={artist?.slug ? `/artists/${artist.slug}` : '/artists'}
              target="_blank"
              className="flex items-center gap-2 font-body text-sm font-semibold px-4 py-2.5 rounded border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all"
            >
              View Public Page <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-coral-rose/10 border border-coral-rose/20"
          >
            <p className="font-body text-[13px] text-coral-rose">{error}</p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="bg-pure-white rounded-lg p-1 flex flex-wrap gap-1 mb-6"
          style={{ boxShadow: '0 1px 4px rgba(11,31,63,0.04)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-body text-sm font-medium transition-all duration-200 ${
                activeTab === t.key
                  ? 'text-midnight-navy bg-warm-ivory'
                  : 'text-slate-gray hover:text-charcoal'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ====== PHOTOS TAB ====== */}
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-pure-white rounded-xl p-6 lg:p-8 space-y-8"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              {/* Profile Photo */}
              <div>
                <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Profile Photo</p>
                <div className="flex items-center gap-5">
                  <div className="w-[120px] h-[120px] rounded-full border-[3px] border-light-gray bg-deep-ocean/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <User size={40} className="text-slate-gray/40" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <button className="font-body text-sm font-semibold px-4 py-2 rounded border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all">
                        Upload New
                      </button>
                      <button className="font-body text-sm font-medium px-4 py-2 rounded text-coral-rose hover:bg-coral-rose/5 transition-colors">
                        Remove
                      </button>
                    </div>
                    <p className="font-body text-xs text-slate-gray">
                      This appears on your artist card and profile. Use a clear, professional photo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Cover Photo</p>
                <div className="space-y-2">
                  <div className="w-full aspect-[21/9] max-h-[200px] rounded-lg bg-midnight-navy/5 border border-light-gray overflow-hidden flex items-center justify-center">
                    <span className="font-body text-sm text-slate-gray">No cover photo set</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="font-body text-sm font-semibold px-4 py-2 rounded border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all">
                      Upload Cover
                    </button>
                    <button className="font-body text-sm font-medium px-4 py-2 rounded text-coral-rose hover:bg-coral-rose/5 transition-colors">
                      Remove
                    </button>
                  </div>
                  <p className="font-body text-xs text-slate-gray">
                    This banner appears at the top of your profile page.
                  </p>
                </div>
              </div>

              {/* Portfolio Gallery */}
              <div>
                <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-1">Portfolio Images</p>
                <p className="font-body text-[13px] text-slate-gray mb-4">
                  Upload 5-15 of your best works. Drag to reorder.
                </p>

                <Reorder.Group axis="y" values={portfolioImages} onReorder={setPortfolioImages} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {portfolioImages.map((img, i) => (
                    <Reorder.Item key={img} value={img} className="relative aspect-square rounded-lg overflow-hidden group cursor-move">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-2 right-2 font-body text-[10px] font-semibold text-champagne-gold bg-midnight-navy/70 px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-midnight-navy/0 group-hover:bg-midnight-navy/60 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button type="button" className="p-1.5 bg-white/20 rounded text-white hover:bg-white/40 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(i)}
                          className="p-1.5 bg-coral-rose/80 rounded text-white hover:bg-coral-rose transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <FileDropzone onDropFiles={handlePortfolioDrop} label="+ Add Photos" />
              </div>
            </motion.div>
          )}

          {/* ====== BIO & STYLES TAB ====== */}
          {activeTab === 'bio' && (
            <motion.div
              key="bio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-pure-white rounded-xl p-6 lg:p-8 space-y-6"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              {/* Display Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-2">Display Name</label>
                <input
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); markChanged(); }}
                  className="w-full px-4 py-3 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                />
                <p className="font-body text-xs text-slate-gray mt-1">This is how customers will see your name.</p>
              </motion.div>

              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); markChanged(); }}
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all resize-y"
                />
                <p className="font-body text-xs text-slate-gray mt-1 flex justify-between">
                  <span>Tell your story. What inspires you? What&apos;s your approach?</span>
                  <span className={bio.length > 450 ? 'text-coral-rose' : ''}>{bio.length} / 500</span>
                </p>
              </motion.div>

              {/* Tattoo Styles */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-1">Tattoo Styles</label>
                <p className="font-body text-[13px] text-slate-gray mb-3">Select all styles you specialize in.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tattooStyles.map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStyles.includes(style)}
                        onChange={() => toggleStyle(style)}
                        className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-sm text-charcoal">{style}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Languages */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-2">Languages Spoken</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languagesList.map(lang => (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                        className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-sm text-charcoal">{lang}</span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Specialties */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {specialties.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase bg-champagne-gold/10 text-champagne-gold"
                    >
                      {s}
                      <button onClick={() => removeSpecialty(s)} className="hover:text-coral-rose transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }}
                    placeholder="Type and press Enter..."
                    className="flex-1 px-3 py-2 border-b border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold transition-colors"
                  />
                  <button onClick={addSpecialty} className="p-2 text-champagne-gold hover:bg-champagne-gold/10 rounded transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="space-y-4"
              >
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-1">Social Media</label>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-slate-gray flex-shrink-0 w-20">Instagram</span>
                  <span className="text-slate-gray">@</span>
                  <input
                    value={instagram.replace('@', '')}
                    onChange={(e) => { setInstagram(`@${e.target.value}`); markChanged(); }}
                    className="flex-1 px-3 py-2 rounded-md border border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                    placeholder="yourhandle"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-slate-gray flex-shrink-0 w-20">TikTok</span>
                  <span className="text-slate-gray">@</span>
                  <input
                    value={tiktok}
                    onChange={(e) => { setTiktok(e.target.value); markChanged(); }}
                    className="flex-1 px-3 py-2 rounded-md border border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                    placeholder="yourhandle"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-slate-gray flex-shrink-0 w-20">Website</span>
                  <input
                    value={website}
                    onChange={(e) => { setWebsite(e.target.value); markChanged(); }}
                    className="flex-1 px-3 py-2 rounded-md border border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="font-body text-sm text-slate-gray flex-shrink-0 w-20">Location</span>
                  <input
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); markChanged(); }}
                    className="flex-1 px-3 py-2 rounded-md border border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ====== AVAILABILITY TAB ====== */}
          {activeTab === 'availability' && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-pure-white rounded-xl p-6 lg:p-8"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-1">Weekly Schedule</p>
              <p className="font-body text-[13px] text-slate-gray mb-5">
                Set your typical working hours. Customers can book within these times.
              </p>

              <div className="space-y-0">
                {daysOfWeek.map((day, i) => {
                  const sched = daySchedules[day];
                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 py-3.5 ${i > 0 ? 'border-t border-light-gray' : ''}`}
                    >
                      <label className="flex items-center gap-3 min-w-[140px] cursor-pointer">
                        <div
                          onClick={() => updateDay(day, { enabled: !sched.enabled })}
                          className={`relative w-10 h-[22px] rounded-full cursor-pointer transition-colors duration-200 ${
                            sched.enabled ? 'bg-champagne-gold' : 'bg-light-gray'
                          }`}
                        >
                          <div
                            className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-pure-white shadow transition-transform duration-200 ${
                              sched.enabled ? 'left-[20px]' : 'left-[2px]'
                            }`}
                          />
                        </div>
                        <span className="font-body text-sm font-medium text-midnight-navy w-[80px]">{day}</span>
                      </label>

                      {sched.enabled ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={sched.from}
                            onChange={(e) => updateDay(day, { from: e.target.value })}
                            className="px-3 py-2 rounded-md border border-light-gray font-body text-[13px] focus:outline-none focus:border-champagne-gold transition-all bg-white"
                          >
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="text-slate-gray">—</span>
                          <select
                            value={sched.to}
                            onChange={(e) => updateDay(day, { to: e.target.value })}
                            className="px-3 py-2 rounded-md border border-light-gray font-body text-[13px] focus:outline-none focus:border-champagne-gold transition-all bg-white"
                          >
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className="font-body text-[13px] text-slate-gray italic">Unavailable</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Advance Booking Notice */}
              <div className="mt-8 pt-6 border-t border-light-gray">
                <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-2">Advance Notice</label>
                <p className="font-body text-[13px] text-slate-gray mb-3">
                  How much notice do you need for a new booking?
                </p>
                <select
                  className="px-4 py-3 rounded-md border border-light-gray font-body text-sm focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all bg-white"
                  defaultValue="48 hours"
                >
                  <option>24 hours</option>
                  <option>48 hours</option>
                  <option>3 days</option>
                  <option>1 week</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* ====== PRICING TAB ====== */}
          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-pure-white rounded-xl p-6 lg:p-8 space-y-8"
              style={{ boxShadow: '0 2px 8px rgba(11,31,63,0.04)' }}
            >
              <div>
                <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-1">Base Rates</p>
                <p className="font-body text-[13px] text-slate-gray mb-5">
                  Set your starting prices. You can adjust per booking.
                </p>

                <div className="space-y-4">
                  {[
                    { key: 'small' as const, label: 'Small (up to 5cm)', note: 'Minimum charge' },
                    { key: 'medium' as const, label: 'Medium (5-15cm)', note: 'Most common' },
                    { key: 'large' as const, label: 'Large (15cm+)', note: 'By consultation' },
                  ].map((size, i) => (
                    <motion.div
                      key={size.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <span className="font-body text-sm font-medium text-midnight-navy sm:w-[160px]">{size.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-gray font-body text-base">Rp</span>
                        <input
                          type="number"
                          step="1000"
                          value={pricing[size.key]}
                          onChange={(e) => {
                            setPricing(prev => ({ ...prev, [size.key]: parseInt(e.target.value) || 0 }));
                            markChanged();
                          }}
                          className="w-[140px] px-3 py-2.5 rounded-md border border-light-gray font-body text-base text-midnight-navy focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                        />
                      </div>
                      <span className="font-body text-xs text-slate-gray">{size.note}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="pt-6 border-t border-light-gray">
                <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Additional Options</p>
                <div className="space-y-3">
                  {[
                    { key: 'touchUps' as const, label: 'Available for touch-ups' },
                    { key: 'travelFee' as const, label: 'Travel to remote areas (additional fee)' },
                    { key: 'consultation' as const, label: 'Custom design consultation (separate charge)' },
                    { key: 'rushBookings' as const, label: 'Rush bookings (within 48h, premium rate)' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={priceOptions[opt.key]}
                        onChange={(e) => {
                          setPriceOptions(prev => ({ ...prev, [opt.key]: e.target.checked }));
                          markChanged();
                        }}
                        className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-sm text-charcoal">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="font-body text-[13px] text-slate-gray">
                All prices in Indonesian Rupiah (IDR). You&apos;ll receive payment directly from the client after the session.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed bottom-0 left-0 right-0 lg:left-[260px] bg-pure-white border-t border-light-gray px-6 py-4 z-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-coral-rose" />
              <span className="font-body text-[13px] text-coral-rose font-medium">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHasChanges(false)}
                className="font-body text-sm font-medium px-4 py-2 rounded text-midnight-navy hover:bg-warm-ivory transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !artist}
                className="font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-2.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-midnight-navy/30 border-t-midnight-navy rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-bali-teal text-pure-white px-5 py-2.5 rounded-lg font-body text-sm flex items-center gap-2 z-[60]"
            style={{ boxShadow: '0 4px 20px rgba(26,107,94,0.3)' }}
          >
            <Check size={16} /> All changes saved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
