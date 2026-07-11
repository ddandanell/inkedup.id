import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Loader2, Calendar, Shield, Home, TrendingUp,
  Globe, MessageCircle, Upload, X, ChevronRight, ArrowRight,
  Clock, CheckCircle, Building2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import store from '@/data/store';

const tattooStyles = [
  'Fine Line', 'Blackwork', 'Traditional', 'Japanese',
  'Watercolor', 'Minimalist', 'Geometric', 'Realism',
  'Floral', 'Script', 'Tribal', 'Dotwork',
];

const baliLocations = ['Canggu', 'Seminyak', 'Uluwatu', 'Ubud', 'Other'];
const studioSizeOptions = ['1 artist', '2-3 artists', '4-6 artists', '7+ artists'];
const timeOptions = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
];

const benefits = [
  { icon: Calendar, title: 'Steady Bookings', description: 'We market, sell, and schedule. Your studio shows up and creates. No more chasing clients or managing DMs.' },
  { icon: Shield, title: 'Verified Partner', description: 'Our partner badge signals quality to clients. Stand out as a vetted studio and command premium rates.' },
  { icon: Home, title: 'Studio or Mobile', description: 'Host clients at your studio or send artists to villas. We work with your operating model.' },
  { icon: TrendingUp, title: 'Grow Together', description: 'Transparent pricing, fair commission, and a steady stream of high-value bookings. Focus on art, not admin.' },
  { icon: Globe, title: 'International Clients', description: 'Connect with tourists, digital nomads, and luxury travelers from around the world.' },
  { icon: MessageCircle, title: 'One Point of Contact', description: 'We coordinate with your studio from first inquiry to final confirmation. One clean communication channel.' },
];

const steps = [
  { num: '01', title: 'Apply as a Studio', description: 'Submit your studio details, portfolio, and credentials. Our team reviews every partner application personally.' },
  { num: '02', title: 'Get Verified', description: 'Once approved, set up your studio profile and add your artists, styles, availability, and pricing.' },
  { num: '03', title: 'Start Getting Booked', description: 'We match clients to your studio, coordinate sessions, and handle all communication. You focus on quality.' },
];

const reviewSteps = [
  { icon: Clock, label: 'Application review (24-48h)' },
  { icon: CheckCircle, label: 'Studio & portfolio verification' },
  { icon: MessageCircle, label: 'Approval notification via WhatsApp' },
  { icon: Building2, label: 'Studio onboarding & artist setup' },
];

function FileUploadZone({ onFiles, previews, onRemove }: {
  onFiles: (files: File[]) => void;
  previews: string[];
  onRemove: (i: number) => void;
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFiles(acceptedFiles);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-champagne-gold bg-champagne-gold/5'
            : 'border-light-gray hover:border-champagne-gold/50 hover:bg-warm-ivory/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={28} className="mx-auto text-slate-gray mb-2" />
        <p className="font-body text-sm text-champagne-gold font-medium">Upload 5-10 photos of your studio&apos;s best work</p>
        <p className="font-body text-xs text-slate-gray mt-1">JPG, PNG up to 10MB each</p>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden group">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-coral-rose text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudioApply() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [form, setForm] = useState({
    studioName: '', ownerName: '', email: '', phone: '', instagram: '',
    location: '', numberOfArtists: '',
    bio: '', styles: [] as string[],
    workingDays: [] as string[], workFrom: '', workTo: '',
    hasStudio: '', hasEquipment: '',
    agreeTerms: false, confirmOriginal: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleStyle = (style: string) => {
    setForm(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style],
    }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleFiles = (files: File[]) => {
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setUploadedFiles(prev => [...prev, ...newPreviews].slice(0, 10));
  };

  const removeFile = (i: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await store.addStudioApplication({
        studioName: form.studioName,
        ownerName: form.ownerName,
        artistName: form.ownerName,
        numberOfArtists: parseInt(form.numberOfArtists) || undefined,
        email: form.email,
        whatsappNumber: form.phone,
        bio: form.bio,
        specialties: form.styles,
        styles: form.styles,
        location: form.location,
        yearsOfExperience: 0,
        languages: ['English', 'Indonesian'],
        instagram: form.instagram,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsConfig = [
    { label: 'Studio Info' },
    { label: 'Portfolio' },
    { label: 'Bio & Styles' },
    { label: 'Operations' },
    { label: 'Terms' },
  ];

  if (submitted) {
    return (
      <div className="min-h-[100dvh] bg-warm-ivory flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center max-w-lg bg-pure-white rounded-xl p-10 shadow-lg"
        >
          <div className="w-16 h-16 bg-bali-teal/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-bali-teal" />
          </div>
          <h1 className="font-display text-[28px] font-medium text-midnight-navy">Studio Application Submitted!</h1>
          <p className="font-body text-charcoal mt-3 max-w-[480px] mx-auto">
            Thank you for applying to partner with InkedUp. Our team will review your studio and get back to you within 48 hours via WhatsApp.
          </p>

          <div className="mt-8 space-y-3 text-left max-w-[360px] mx-auto">
            {reviewSteps.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <s.icon size={16} className="text-champagne-gold flex-shrink-0" />
                <span className="font-body text-sm text-charcoal">{s.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => { setSubmitted(false); }}
              className="font-body text-sm font-medium py-3.5 px-6 rounded border border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all"
            >
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-warm-ivory">
      {/* Simplified Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-pure-white border-b border-light-gray flex items-center">
        <div className="container-inkedup w-full flex items-center justify-between">
          <Link to="/" className="font-display text-[20px] font-semibold tracking-[0.08em] text-midnight-navy">
            INKEDUP
          </Link>
          <Link to="/login" className="font-body text-sm font-medium text-champagne-gold hover:underline">
            Already a partner? Log In <ArrowRight size={14} className="inline" />
          </Link>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-midnight-navy pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C69B3C' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0h-2v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container-inkedup text-center relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-xs font-semibold text-champagne-gold uppercase tracking-[0.16em]"
          >
            For Tattoo Studios
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display text-pure-white mt-4 mx-auto max-w-[700px]"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 500, lineHeight: 1.1 }}
          >
            Become a Partner Studio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-body text-lg text-white/75 mt-5 max-w-[560px] mx-auto"
          >
            We partner with vetted studios — one clean channel for clients, quality control, and communication. Bring your studio, we bring the bookings.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            onClick={scrollToForm}
            className="mt-8 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all"
          >
            Apply Now ↓
          </motion.button>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mt-12 flex items-center justify-center gap-12 flex-wrap"
          >
            {[
              { num: '8+', label: 'Partner Studios' },
              { num: '500+', label: 'Bookings Completed' },
              { num: '10%', label: 'Platform Fee Only' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-mono-stat text-champagne-gold" style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 500 }}>
                  {s.num}
                </p>
                <p className="font-body text-[13px] text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-warm-ivory">
        <div className="container-inkedup">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs font-semibold text-champagne-gold uppercase tracking-[0.16em]">Why Partner With Us</p>
            <h2 className="font-display text-section-title text-midnight-navy mt-3">We Handle Everything Else</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="bg-warm-ivory border border-light-gray rounded-lg p-8 hover:border-champagne-gold transition-all duration-300"
                style={{ boxShadow: '0 0 20px rgba(198,155,60,0)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(198,155,60,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(198,155,60,0)';
                }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(198,155,60,0.1)' }}>
                  <b.icon size={24} className="text-champagne-gold" />
                </div>
                <h3 className="font-display text-xl font-medium text-midnight-navy mt-5">{b.title}</h3>
                <p className="font-body text-[15px] text-slate-gray leading-relaxed mt-2">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-pure-white">
        <div className="container-inkedup">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs font-semibold text-champagne-gold uppercase tracking-[0.16em]">The Process</p>
            <h2 className="font-display text-section-title text-midnight-navy mt-3">Three Steps to Partnership</h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-4 max-w-[900px] mx-auto">
            {steps.map((s, i) => (
              <div key={s.num} className="flex-1 flex md:flex-col items-start md:items-center gap-4 md:text-center relative">
                <span className="font-mono-stat text-[64px] font-medium text-champagne-gold/20 leading-none">
                  {s.num}
                </span>
                <div>
                  <h3 className="font-display text-[22px] font-medium text-midnight-navy">{s.title}</h3>
                  <p className="font-body text-[15px] text-slate-gray leading-relaxed mt-2">{s.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-8 text-light-gray">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section ref={formRef} className="section-padding bg-warm-ivory">
        <div className="max-w-[800px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-pure-white rounded-xl p-8 md:p-10"
            style={{ boxShadow: '0 4px 24px rgba(11,31,63,0.06)' }}
          >
            <h2 className="font-display text-[28px] font-medium text-midnight-navy">Studio Partner Application</h2>
            <p className="font-body text-[15px] text-slate-gray mt-2">
              Tell us about your studio. We only partner with studios, never individual artists — one studio, one point of contact, consistent quality.
            </p>
            <div className="h-px bg-light-gray my-6" />

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {stepsConfig.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-medium transition-all ${
                    i === currentStep
                      ? 'bg-champagne-gold/10 text-champagne-gold'
                      : i < currentStep
                        ? 'bg-bali-teal/10 text-bali-teal'
                        : 'bg-light-gray/50 text-slate-gray'
                  }`}
                >
                  {i < currentStep ? <Check size={14} /> : <span>{i + 1}</span>}
                  {s.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Studio & Contact Info */}
                {currentStep === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-4">Studio Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Studio Name *</label>
                        <input name="studioName" required value={form.studioName} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="Your studio name" />
                      </div>
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Owner / Main Contact *</label>
                        <input name="ownerName" required value={form.ownerName} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="Studio owner or manager" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Studio Email *</label>
                        <input name="email" type="email" required value={form.email} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="studio@email.com" />
                      </div>
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Studio WhatsApp *</label>
                        <input name="phone" required value={form.phone} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="+62 812-XXXX-XXXX" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Studio Instagram</label>
                        <input name="instagram" value={form.instagram} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="@yourstudio" />
                      </div>
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">Location in Bali *</label>
                        <select name="location" required value={form.location} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all bg-white">
                          <option value="">Select location</option>
                          {baliLocations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">How many artists work in your studio? *</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {studioSizeOptions.map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="numberOfArtists" value={opt.split(' ')[0].replace('+', '')}
                              checked={form.numberOfArtists === opt.split(' ')[0].replace('+', '')}
                              onChange={handleChange}
                              className="w-4 h-4 text-champagne-gold focus:ring-champagne-gold" />
                            <span className="font-body text-sm text-charcoal">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="button" onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-3 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all">
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Portfolio */}
                {currentStep === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-4">Studio Portfolio</p>
                    <FileUploadZone onFiles={handleFiles} previews={uploadedFiles} onRemove={removeFile} />

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setCurrentStep(0)}
                        className="font-body text-sm text-slate-gray hover:text-midnight-navy transition-colors">
                        ← Back
                      </button>
                      <button type="button" onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-3 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all">
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Bio & Styles */}
                {currentStep === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">About Your Studio *</label>
                      <textarea name="bio" required rows={4} value={form.bio} onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all resize-y"
                        placeholder="Tell us about your studio, your team, and what makes your work unique..." />
                    </div>

                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Styles Your Studio Offers *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {tattooStyles.map(style => (
                          <label key={style} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.styles.includes(style)}
                              onChange={() => toggleStyle(style)}
                              className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                            />
                            <span className="font-body text-sm text-charcoal">{style}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setCurrentStep(1)}
                        className="font-body text-sm text-slate-gray hover:text-midnight-navy transition-colors">
                        ← Back
                      </button>
                      <button type="button" onClick={() => setCurrentStep(3)}
                        className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-3 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all">
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Operations */}
                {currentStep === 3 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Typical Operating Days</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.workingDays.includes(day)}
                              onChange={() => toggleDay(day)}
                              className="w-4 h-4 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                            />
                            <span className="font-body text-sm text-charcoal">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">From</label>
                        <select name="workFrom" value={form.workFrom} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all bg-white">
                          <option value="">Select</option>
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">To</label>
                        <select name="workTo" value={form.workTo} onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray font-body text-[15px] focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all bg-white">
                          <option value="">Select</option>
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Do you have a physical studio?</label>
                      <div className="flex flex-wrap gap-4">
                        {['Yes', 'Mobile only', 'Both'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="hasStudio" value={opt}
                              checked={form.hasStudio === opt}
                              onChange={handleChange}
                              className="w-4 h-4 text-champagne-gold focus:ring-champagne-gold" />
                            <span className="font-body text-sm text-charcoal">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em] mb-3">Do you use sterile/disposable equipment?</label>
                      <div className="flex flex-wrap gap-4">
                        {['Yes', 'No, but willing to upgrade'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="hasEquipment" value={opt}
                              checked={form.hasEquipment === opt}
                              onChange={handleChange}
                              className="w-4 h-4 text-champagne-gold focus:ring-champagne-gold" />
                            <span className="font-body text-sm text-charcoal">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setCurrentStep(2)}
                        className="font-body text-sm text-slate-gray hover:text-midnight-navy transition-colors">
                        ← Back
                      </button>
                      <button type="button" onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-6 py-3 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all">
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Terms */}
                {currentStep === 4 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => setForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                        required
                        className="w-4 h-4 mt-0.5 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-sm text-charcoal">
                        I agree to the InkedUp Studio Partner Terms of Service and understand that a 10% commission will be deducted from each booking. *
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.confirmOriginal}
                        onChange={(e) => setForm(prev => ({ ...prev, confirmOriginal: e.target.checked }))}
                        required
                        className="w-4 h-4 mt-0.5 rounded border-light-gray text-champagne-gold focus:ring-champagne-gold"
                      />
                      <span className="font-body text-sm text-charcoal">
                        I confirm that all information and portfolio images provided belong to my studio and represent our own original work. *
                      </span>
                    </label>

                    {submitError && (
                      <p className="font-body text-sm text-coral-rose text-center">{submitError}</p>
                    )}

                    <div className="flex justify-between items-center pt-4">
                      <button type="button" onClick={() => setCurrentStep(3)}
                        className="font-body text-sm text-slate-gray hover:text-midnight-navy transition-colors">
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !form.agreeTerms || !form.confirmOriginal}
                        className="flex items-center justify-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>

                    <p className="font-body text-[13px] text-slate-gray text-center">
                      We&apos;ll review your studio application and get back to you within 48 hours via WhatsApp.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-midnight-navy py-8 px-6">
        <div className="container-inkedup flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-[0.08em] text-pure-white">
            INKEDUP
          </Link>
          <p className="font-body text-xs text-slate-gray">
            Bali&apos;s Premium Mobile Tattoo Concierge
          </p>
        </div>
      </footer>
    </div>
  );
}
