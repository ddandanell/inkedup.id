import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  PenTool,
  Shield,
  Mountain,
  Droplets,
  Circle,
  Shapes,
  Eye,
  Flower2,
  Type,
  Minimize2,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  Lock,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import store from '@/data/store';
import type { Artist } from '@/data/types';
import { waLink } from '@/data/business';

/* ─── Types ─── */
interface BookingForm {
  styles: string[];
  size: 'small' | 'medium' | 'large' | '';
  placement: string;
  preferredDate: Date | undefined;
  alternateDate: Date | undefined;
  description: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  villaName: string;
  area: string;
  agreedToTerms: boolean;
}

/* ─── Style options with icons ─── */
const STYLE_OPTIONS = [
  { name: 'Fine Line', icon: Minimize2, desc: 'Delicate, precise single-needle work' },
  { name: 'Blackwork', icon: PenTool, desc: 'Bold, solid black designs' },
  { name: 'Traditional', icon: Shield, desc: 'Classic Americana styling' },
  { name: 'Japanese', icon: Mountain, desc: 'Irezumi-inspired large pieces' },
  { name: 'Watercolor', icon: Droplets, desc: 'Colorful, painterly effects' },
  { name: 'Minimalist', icon: Circle, desc: 'Simple, understated designs' },
  { name: 'Geometric', icon: Shapes, desc: 'Sacred geometry, patterns' },
  { name: 'Realism', icon: Eye, desc: 'Photorealistic detail' },
  { name: 'Floral', icon: Flower2, desc: 'Botanical and nature themes' },
  { name: 'Script', icon: Type, desc: 'Lettering and calligraphy' },
];

const SIZE_OPTIONS: { value: 'small' | 'medium' | 'large'; label: string; dim: string; price: string }[] = [
  { value: 'small', label: 'Small', dim: 'Up to 5cm', price: 'Rp 700.000' },
  { value: 'medium', label: 'Medium', dim: '5 \u2013 15cm', price: 'Rp 1.500.000' },
  { value: 'large', label: 'Large', dim: '15cm+', price: 'Rp 3.000.000' },
];

const AREA_OPTIONS = ['Canggu', 'Seminyak', 'Uluwatu', 'Ubud', 'Other'];

/* ─── Stepper Component ─── */
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = ['Style', 'Size', 'Details', 'Confirm'];
  return (
    <div className="flex items-center justify-center max-w-[500px] mx-auto mb-12">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-champagne-gold border-champagne-gold text-midnight-navy'
                    : isActive
                    ? 'border-champagne-gold text-champagne-gold'
                    : 'border-light-gray text-slate-gray'
                }`}
                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="font-body text-[13px] font-semibold">{stepNum}</span>
                )}
              </motion.div>
              <span
                className={`font-body text-[11px] md:text-xs font-medium mt-2 ${
                  isCompleted || isActive ? 'text-champagne-gold' : 'text-slate-gray'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 md:w-20 h-0.5 mx-1 md:mx-2 mt-[-14px] transition-colors duration-300 ${
                  isCompleted ? 'bg-champagne-gold' : 'bg-light-gray'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Booking Page ─── */
export default function Booking() {
  const { slug } = useParams<{ slug: string }>();

  const [artist, setArtist] = useState<Artist | undefined>(undefined);
  const [artistLoading, setArtistLoading] = useState(true);
  const [artistError, setArtistError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!slug) {
        setArtist(undefined);
        setArtistLoading(false);
        setArtistError(null);
        return;
      }

      setArtistLoading(true);
      setArtistError(null);
      const data = await store.getArtistBySlug(slug);
      setArtist(data);
      if (!data) {
        setArtistError('Artist not found');
      }
      setArtistLoading(false);
    };

    fetchArtist();
  }, [slug]);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<'primary' | 'alternate' | null>(null);

  const [form, setForm] = useState<BookingForm>({
    styles: [],
    size: '',
    placement: '',
    preferredDate: undefined,
    alternateDate: undefined,
    description: '',
    customerName: '',
    customerEmail: '',
    customerWhatsApp: '',
    villaName: '',
    area: '',
    agreedToTerms: false,
  });

  const update = useCallback(<K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleStyle = useCallback((style: string) => {
    setForm((prev) => {
      const has = prev.styles.includes(style);
      return {
        ...prev,
        styles: has ? prev.styles.filter((s) => s !== style) : [...prev.styles, style],
      };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      await store.addBookingLead({
        artistId: artist?.id,
        artistName: artist?.displayName,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerWhatsApp: form.customerWhatsApp,
        tattooStyle: form.styles.join(', '),
        size: form.size || 'small',
        placement: form.placement,
        preferredDate: form.preferredDate ? format(form.preferredDate, 'yyyy-MM-dd') : '',
        customerLocation: `${form.villaName} - ${form.area}`,
        serviceType: 'tattoo',
        description: form.description,
        notes: `Alternate date: ${form.alternateDate ? format(form.alternateDate, 'yyyy-MM-dd') : 'none'}`,
      });
      setSubmitting(false);
      setSubmitted(true);
    },
    [form, artist]
  );

  const canContinue = () => {
    switch (step) {
      case 1:
        return form.styles.length > 0;
      case 2:
        return form.size && form.placement.trim();
      case 3:
        return (
          form.preferredDate &&
          form.customerName.trim() &&
          form.customerEmail.trim() &&
          form.customerWhatsApp.trim() &&
          form.area
        );
      case 4:
        return form.agreedToTerms;
      default:
        return false;
    }
  };

  /* ─── Summary sidebar data ─── */
  const summaryItems = [
    form.styles.length > 0 && { label: 'Style', value: form.styles.join(', ') },
    form.size && {
      label: 'Size',
      value: `${SIZE_OPTIONS.find((s) => s.value === form.size)?.label} (${SIZE_OPTIONS.find((s) => s.value === form.size)?.dim})`,
    },
    form.placement && { label: 'Placement', value: form.placement },
    form.preferredDate && { label: 'Date', value: format(form.preferredDate, 'MMM d, yyyy') },
  ].filter(Boolean) as { label: string; value: string }[];

  const estimatedPrice = form.size
    ? SIZE_OPTIONS.find((s) => s.value === form.size)?.price
    : null;

  /* ─── Loading State ─── */
  if (artistLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory">
        <Loader2 className="animate-spin text-champagne-gold" size={32} />
      </div>
    );
  }

  /* ─── Error State ─── */
  if (artistError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory py-20 px-4">
        <div className="text-center max-w-md mx-auto bg-pure-white rounded-2xl p-10 shadow-[0_24px_80px_rgba(11,31,63,0.12)]">
          <h1 className="font-display text-2xl font-medium text-midnight-navy mb-3">
            Something went wrong
          </h1>
          <p className="font-body text-base text-charcoal mb-6">{artistError}</p>
          <Link
            to="/artists"
            className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
          >
            Browse Artists
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Success State ─── */
  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center max-w-lg mx-auto bg-pure-white rounded-2xl p-10 shadow-[0_24px_80px_rgba(11,31,63,0.12)]"
        >
          <div className="w-16 h-16 rounded-full bg-bali-teal flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-pure-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-[32px] font-medium text-midnight-navy">
            Request Submitted!
          </h1>
          <p className="font-body text-base text-charcoal mt-3 max-w-[480px] mx-auto">
            Thank you! We&apos;ve received your booking request for{' '}
            <span className="font-semibold">{artist?.displayName || 'the artist'}</span>. Our team will review
            it and get back to you within 24 hours via WhatsApp.
          </p>

          <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
            {[
              { icon: Clock, text: "We'll review your request" },
              { icon: CalendarIcon, text: 'Check artist availability' },
              { icon: MessageCircle, text: 'Confirm via WhatsApp' },
              { icon: Lock, text: '10% deposit to lock in your slot' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 font-body text-sm text-slate-gray"
              >
                <item.icon size={18} className="text-champagne-gold flex-shrink-0" />
                {item.text}
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/artists"
              className="inline-block font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
            >
              Browse More Artists
            </Link>
            <Link
              to="/"
              className="inline-block font-body text-sm font-medium text-slate-gray hover:text-champagne-gold transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-6 pt-6 border-t border-light-gray">
            <p className="font-body text-xs text-slate-gray mb-2">Have questions?</p>
            <a
              href={waLink("Hi InkedUp, I just submitted a booking request and have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-bali-teal hover:underline"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-warm-ivory">
      {/* ── Simplified header ── */}
      <div className="bg-pure-white border-b border-light-gray h-16 flex items-center sticky top-0 z-[100]">
        <div className="container-inkedup max-w-[1100px] w-full flex items-center justify-between px-4 md:px-6">
          <Link to="/" className="font-display text-xl font-semibold tracking-[0.08em] text-midnight-navy">
            INKEDUP
          </Link>
          <span className="font-body text-sm font-medium text-slate-gray hidden sm:block">
            Book a Session
          </span>
          <Link
            to={artist ? `/artists/${artist.slug}` : '/artists'}
            className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-champagne-gold hover:underline"
          >
            <ChevronLeft size={16} /> Back to Artist
          </Link>
        </div>
      </div>

      {/* ── Booking Container ── */}
      <div className="container-inkedup max-w-[1100px] py-10 md:py-16 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-12">
          {/* Left: Form */}
          <div>
            <Stepper currentStep={step} />

            <AnimatePresence mode="wait">
              {/* ── Step 1: Style ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <h2 className="font-display text-[28px] font-medium text-midnight-navy mb-2">
                    What style are you looking for?
                  </h2>
                  <p className="font-body text-[15px] text-slate-gray mb-8">
                    Select one or more styles that match your vision.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {STYLE_OPTIONS.map((style) => {
                      const Icon = style.icon;
                      const selected = form.styles.includes(style.name);
                      return (
                        <button
                          key={style.name}
                          onClick={() => toggleStyle(style.name)}
                          className={`text-left p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            selected
                              ? 'border-champagne-gold bg-[rgba(198,155,60,0.05)]'
                              : 'border-transparent bg-warm-ivory hover:border-light-gray hover:-translate-y-0.5'
                          }`}
                        >
                          <Icon
                            size={32}
                            className={`mb-3 ${selected ? 'text-champagne-gold' : 'text-midnight-navy'}`}
                          />
                          <div
                            className={`font-body text-[15px] font-semibold ${
                              selected ? 'text-champagne-gold' : 'text-midnight-navy'
                            }`}
                          >
                            {style.name}
                          </div>
                          <div className="font-body text-[13px] text-slate-gray mt-1">{style.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Size & Placement ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <h2 className="font-display text-[28px] font-medium text-midnight-navy mb-8">
                    Tell us about your tattoo
                  </h2>

                  {/* Size */}
                  <div className="mb-8">
                    <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-4">
                      TATTOO SIZE
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SIZE_OPTIONS.map((size) => {
                        const selected = form.size === size.value;
                        return (
                          <button
                            key={size.value}
                            onClick={() => update('size', size.value)}
                            className={`p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                              selected
                                ? 'border-champagne-gold bg-[rgba(198,155,60,0.05)]'
                                : 'border-light-gray hover:border-champagne-gold/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-display text-lg font-medium text-midnight-navy">
                                {size.label}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selected ? 'border-champagne-gold' : 'border-light-gray'
                                }`}
                              >
                                {selected && <div className="w-2.5 h-2.5 rounded-full bg-champagne-gold" />}
                              </div>
                            </div>
                            <p className="font-body text-[13px] text-slate-gray">{size.dim}</p>
                            <p className="font-mono text-xl font-medium text-champagne-gold mt-2">
                              {size.price}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Placement */}
                  <div className="mb-8">
                    <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                      PLACEMENT
                    </label>
                    <textarea
                      value={form.placement}
                      onChange={(e) => update('placement', e.target.value)}
                      placeholder="Where on your body? (e.g., inner forearm, upper back, ankle...)"
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all resize-y min-h-[80px]"
                    />
                  </div>

                  {/* Reference images — handed off on WhatsApp */}
                  <div>
                    <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                      REFERENCE IMAGES
                    </label>
                    <div className="border-2 border-dashed border-light-gray rounded-xl p-10 text-center bg-warm-ivory/40">
                      <Upload size={32} className="text-slate-gray mx-auto mb-3" />
                      <p className="font-body text-sm text-charcoal">
                        Share reference images on WhatsApp
                      </p>
                      <p className="font-body text-xs text-slate-gray mt-1">Send photos after you submit — we&apos;ll confirm your request by chat.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Details ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <h2 className="font-display text-[28px] font-medium text-midnight-navy mb-8">
                    A few more details
                  </h2>

                  <div className="space-y-6">
                    {/* Preferred Date */}
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                        PREFERRED DATE
                      </label>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setDatePickerOpen(datePickerOpen === 'primary' ? null : 'primary')
                          }
                          className="w-full text-left px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all flex items-center gap-3"
                        >
                          <CalendarIcon size={18} className="text-slate-gray" />
                          <span className={form.preferredDate ? 'text-charcoal' : 'text-slate-gray'}>
                            {form.preferredDate
                              ? format(form.preferredDate, 'MMM d, yyyy')
                              : 'Select a date'}
                          </span>
                        </button>
                        <AnimatePresence>
                          {datePickerOpen === 'primary' && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 z-20 mt-2 bg-pure-white border border-light-gray rounded-lg shadow-lg p-3"
                            >
                              <DayPicker
                                mode="single"
                                selected={form.preferredDate}
                                onSelect={(date) => {
                                  update('preferredDate', date);
                                  setDatePickerOpen(null);
                                }}
                                disabled={{ before: new Date() }}
                                classNames={{
                                  day_selected: 'bg-champagne-gold text-midnight-navy font-semibold',
                                  day_today: 'text-champagne-gold font-semibold',
                                  day: 'hover:bg-warm-ivory rounded-md',
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="font-body text-xs text-slate-gray mt-1">
                        We&apos;ll check availability and confirm
                      </p>
                    </div>

                    {/* Alternate Date */}
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                        ALTERNATE DATE (OPTIONAL)
                      </label>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setDatePickerOpen(datePickerOpen === 'alternate' ? null : 'alternate')
                          }
                          className="w-full text-left px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all flex items-center gap-3"
                        >
                          <CalendarIcon size={18} className="text-slate-gray" />
                          <span className={form.alternateDate ? 'text-charcoal' : 'text-slate-gray'}>
                            {form.alternateDate
                              ? format(form.alternateDate, 'MMM d, yyyy')
                              : 'Select alternate date'}
                          </span>
                        </button>
                        <AnimatePresence>
                          {datePickerOpen === 'alternate' && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 z-20 mt-2 bg-pure-white border border-light-gray rounded-lg shadow-lg p-3"
                            >
                              <DayPicker
                                mode="single"
                                selected={form.alternateDate}
                                onSelect={(date) => {
                                  update('alternateDate', date);
                                  setDatePickerOpen(null);
                                }}
                                disabled={{ before: new Date() }}
                                classNames={{
                                  day_selected: 'bg-champagne-gold text-midnight-navy font-semibold',
                                  day_today: 'text-champagne-gold font-semibold',
                                  day: 'hover:bg-warm-ivory rounded-md',
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                        TELL US YOUR IDEA
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder="Describe your tattoo idea, any specific elements, meaning behind it, or questions you have..."
                        rows={5}
                        className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all resize-y min-h-[120px]"
                      />
                    </div>

                    {/* Contact details */}
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">
                        YOUR INFORMATION
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={form.customerName}
                          onChange={(e) => update('customerName', e.target.value)}
                          placeholder="Full name"
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                        />
                        <input
                          type="email"
                          value={form.customerEmail}
                          onChange={(e) => update('customerEmail', e.target.value)}
                          placeholder="Email address"
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                        />
                        <input
                          type="tel"
                          value={form.customerWhatsApp}
                          onChange={(e) => update('customerWhatsApp', e.target.value)}
                          placeholder="WhatsApp (+62...)"
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                        />
                        <input
                          type="text"
                          value={form.villaName}
                          onChange={(e) => update('villaName', e.target.value)}
                          placeholder="Villa / Hotel name"
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                        />
                      </div>
                      <select
                        value={form.area}
                        onChange={(e) => update('area', e.target.value)}
                        className="w-full mt-4 px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] focus:outline-none focus:border-champagne-gold transition-all cursor-pointer"
                      >
                        <option value="">Area in Bali</option>
                        {AREA_OPTIONS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Confirm ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <h2 className="font-display text-[28px] font-medium text-midnight-navy mb-8">
                    Review your request
                  </h2>

                  <div className="bg-warm-ivory rounded-xl p-6 md:p-8 space-y-5">
                    {/* Artist */}
                    {artist && (
                      <div className="flex items-center gap-4">
                        <img
                          src={artist.photo}
                          alt={artist.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-body text-sm font-semibold text-midnight-navy">
                            {artist.displayName}
                          </div>
                          <div className="font-body text-xs text-slate-gray">{artist.location}</div>
                        </div>
                      </div>
                    )}

                    <div className="h-px bg-light-gray" />

                    {/* Summary rows */}
                    <ReviewRow
                      label="Style"
                      value={form.styles.join(', ')}
                      onEdit={() => setStep(1)}
                    />
                    <ReviewRow
                      label="Size"
                      value={`${SIZE_OPTIONS.find((s) => s.value === form.size)?.label} (${SIZE_OPTIONS.find((s) => s.value === form.size)?.dim})`}
                      onEdit={() => setStep(2)}
                    />
                    <ReviewRow label="Placement" value={form.placement} onEdit={() => setStep(2)} />
                    <ReviewRow
                      label="Date"
                      value={
                        form.preferredDate
                          ? format(form.preferredDate, 'MMM d, yyyy')
                          : '' +
                            (form.alternateDate
                              ? ` (alt: ${format(form.alternateDate, 'MMM d, yyyy')})`
                              : '')
                      }
                      onEdit={() => setStep(3)}
                    />
                    {form.description && (
                      <ReviewRow label="Description" value={form.description} onEdit={() => setStep(3)} />
                    )}
                    <ReviewRow
                      label="Contact"
                      value={`${form.customerName}, ${form.customerEmail}, ${form.customerWhatsApp}`}
                      onEdit={() => setStep(3)}
                    />
                    <ReviewRow
                      label="Location"
                      value={`${form.villaName}${form.villaName && form.area ? ', ' : ''}${form.area}`}
                      onEdit={() => setStep(3)}
                    />
                  </div>

                  {/* Terms */}
                  <div className="mt-6 flex items-start gap-3">
                    <button
                      onClick={() => update('agreedToTerms', !form.agreedToTerms)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        form.agreedToTerms
                          ? 'bg-champagne-gold border-champagne-gold'
                          : 'border-light-gray'
                      }`}
                    >
                      {form.agreedToTerms && <Check size={14} className="text-midnight-navy" strokeWidth={3} />}
                    </button>
                    <p className="font-body text-[13px] text-charcoal leading-[1.5]">
                      I agree to the{' '}
                      <Link to="/terms" className="text-champagne-gold hover:underline font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and understand that a 10% booking deposit is collected upon confirmation.
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-slate-gray" />
                      <span className="font-body text-xs text-slate-gray">Secure Request</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-bali-teal" />
                      <span className="font-body text-xs text-bali-teal">Verified Artist</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-gray" />
                      <span className="font-body text-xs text-slate-gray">Response in 24h</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 font-body text-sm font-medium text-midnight-navy px-6 py-3 rounded hover:bg-midnight-navy/5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={() => canContinue() && setStep(step + 1)}
                  disabled={!canContinue()}
                  className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canContinue() || submitting}
                  className="inline-flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-10 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>Submit Booking Request</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Sticky Summary */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="sticky top-[100px]"
            >
              <div className="bg-pure-white border border-light-gray rounded-xl p-6 shadow-[0_4px_20px_rgba(11,31,63,0.06)]">
                {/* Artist preview */}
                {artist && (
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={artist.photo}
                      alt={artist.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-body text-base font-semibold text-midnight-navy">
                        {artist.displayName}
                      </div>
                      <div className="font-body text-[13px] text-slate-gray">
                        {artist.location.split(',')[0]}
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-px bg-light-gray my-4" />

                {/* Dynamic summary */}
                <AnimatePresence mode="wait">
                  {summaryItems.length > 0 ? (
                    <motion.div
                      key={summaryItems.map((s) => s.label).join()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {summaryItems.map((item) => (
                        <div key={item.label} className="font-body text-sm text-charcoal">
                          <span className="text-slate-gray">{item.label}:</span>{' '}
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="font-body text-sm text-slate-gray italic">
                      Your selections will appear here
                    </p>
                  )}
                </AnimatePresence>

                <div className="h-px bg-light-gray my-4" />

                {/* Price */}
                <div>
                  <span className="font-body text-sm text-slate-gray">Estimated total</span>
                  <div className="font-mono text-2xl font-medium text-midnight-navy">
                    {estimatedPrice || 'From Rp 700.000'}
                  </div>
                  <p className="font-body text-xs text-slate-gray mt-1">
                    Final price confirmed after consultation. 10% booking fee due upon confirmation.
                  </p>
                </div>

                {/* Trust badge */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(26,107,94,0.08)]">
                  <CheckCircle2 size={14} className="text-bali-teal" />
                  <span className="font-body text-xs font-semibold text-bali-teal">
                    No payment required now
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile summary (bottom) */}
          <div className="lg:hidden mt-8">
            <div className="bg-pure-white border border-light-gray rounded-xl p-5 shadow-[0_4px_20px_rgba(11,31,63,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-sm text-slate-gray">Estimated total</span>
                  <div className="font-mono text-xl font-medium text-midnight-navy">
                    {estimatedPrice || 'From Rp 700.000'}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[rgba(26,107,94,0.08)]">
                  <CheckCircle2 size={14} className="text-bali-teal" />
                  <span className="font-body text-xs font-semibold text-bali-teal">
                    No payment now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Minimal Footer ── */}
      <footer className="bg-midnight-navy py-8 mt-12">
        <div className="container-inkedup text-center">
          <p className="font-body text-[13px] text-slate-gray">
            &copy; {new Date().getFullYear()} InkedUp Bali
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/privacy" className="font-body text-[13px] text-slate-gray hover:text-champagne-gold transition-colors">
              Privacy
            </Link>
            <span className="text-slate-gray/40">&middot;</span>
            <Link to="/terms" className="font-body text-[13px] text-slate-gray hover:text-champagne-gold transition-colors">
              Terms
            </Link>
            <span className="text-slate-gray/40">&middot;</span>
            <Link to="/contact" className="font-body text-[13px] text-slate-gray hover:text-champagne-gold transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Review Row Component ─── */
function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = value.length > 120;
  const display = shouldTruncate && !expanded ? `${value.slice(0, 120)}...` : value;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <span className="font-body text-[12px] font-semibold text-slate-gray uppercase tracking-[0.08em]">
          {label}
        </span>
        <p className="font-body text-[15px] text-charcoal mt-0.5">
          {display}
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 font-body text-xs text-champagne-gold hover:underline"
            >
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="font-body text-xs text-champagne-gold hover:underline flex-shrink-0 mt-4"
      >
        Edit
      </button>
    </div>
  );
}
