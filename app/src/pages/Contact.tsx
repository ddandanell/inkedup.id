import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Send,
  Check,
  Clock,
  MapPin,
  Globe,
  ArrowRight,
  Instagram,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import business, { waLink } from '@/data/business';

/* ---------- data ---------- */

const subjectOptions = [
  'General Inquiry',
  'Booking Question',
  'Group/Event Booking',
  'Studio Partnership',
  'Feedback',
  'Other',
];

/* ---------- components ---------- */

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export default function Contact() {
  useSEO({
    title: 'Contact',
    description:
      'Reach InkedUp on WhatsApp or by email to plan your mobile tattoo in Bali. We reply every day, 8:00–20:00 WITA.',
    path: '/contact',
  });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: subjectOptions[0],
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No email backend is configured, so hand off to the visitor's email client
    // with everything pre-filled. Only show the success state once we've done that.
    const subject = `[${form.subject}] from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  const quickInfo = [
    { icon: Clock, label: 'Hours', value: business.hours },
    { icon: MapPin, label: 'Based In', value: business.area },
    { icon: Globe, label: 'Time Zone', value: 'Bali Time (WITA, UTC+8)' },
  ];

  return (
    <div className="min-h-[100dvh]">
      <PageHero
        image="/location-seminyak.jpg"
        label="GET IN TOUCH"
        title="Let's Talk"
        subtitle="Whether you have a question, a special request, or just want to chat about your tattoo idea — we're here."
      />

      {/* Section 3: Contact Options */}
      <section className="bg-pure-white" style={{ padding: 'clamp(80px, 10vw, 140px) 0' }}>
        <div className="container-inkedup">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[960px] mx-auto">
            {/* Left — WhatsApp (Primary) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              variants={slideLeft}
            >
              <div
                className="rounded-xl p-8 text-center h-full flex flex-col"
                style={{
                  backgroundColor: 'rgba(37, 211, 101, 0.08)',
                  border: '1px solid rgba(37, 211, 101, 0.2)',
                }}
              >
                {/* WhatsApp icon */}
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(37, 211, 101, 0.15)' }}>
                  <MessageCircle size={32} style={{ color: '#25D365' }} />
                </div>

                <h3 className="font-display text-2xl font-medium text-midnight-navy">
                  Chat on WhatsApp
                </h3>
                <p className="font-body text-[15px] text-slate-gray mt-2">
                  The fastest way to reach us. We typically respond within minutes during business hours.
                </p>

                <p className="font-mono-stat text-lg font-medium text-midnight-navy mt-4">
                  {business.whatsappDisplay}
                </p>

                <a
                  href={waLink("Hi! I'm interested in booking a tattoo session through InkedUp.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] py-[14px] rounded-lg text-pure-white hover:-translate-y-px transition-all duration-200"
                  style={{ backgroundColor: '#25D365' }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#1DA851';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#25D365';
                  }}
                >
                  Start Chat <ArrowRight size={14} />
                </a>

                <p className="font-body text-xs text-slate-gray mt-3">
                  {business.hours}
                </p>

                {/* Social links below */}
                {business.instagram && (
                  <div className="mt-auto pt-6 flex items-center justify-center gap-4">
                    <span className="font-body text-xs text-slate-gray uppercase tracking-wider">Follow us</span>
                    <a
                      href={business.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-9 h-9 rounded-full bg-pure-white flex items-center justify-center hover:shadow-md transition-shadow"
                    >
                      <Instagram size={16} className="text-midnight-navy" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right — Email Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              variants={slideRight}
            >
              <div className="bg-warm-ivory border border-light-gray rounded-xl p-8">
                {submitted ? (
                  <div className="text-center h-full flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-bali-teal/10 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-bali-teal" />
                    </div>
                    <h3 className="font-display text-2xl font-medium text-midnight-navy">
                      Opening your email app…
                    </h3>
                    <p className="font-body text-sm text-slate-gray mt-2 max-w-[320px]">
                      Your message is ready to send to {business.email}. If nothing opened,
                      email us directly and we'll reply within 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <Mail size={20} className="text-champagne-gold" />
                      <h3 className="font-display text-2xl font-medium text-midnight-navy">
                        Send a Message
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-gray mt-1">
                      For non-urgent inquiries, special requests, or detailed questions.{' '}
                      <a href={`mailto:${business.email}`} className="text-champagne-gold hover:underline">
                        {business.email}
                      </a>
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="contact-name" className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                          Name *
                        </label>
                        <input
                          id="contact-name"
                          required
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] text-midnight-navy placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="Your name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="contact-email" className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                          Email *
                        </label>
                        <input
                          id="contact-email"
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] text-midnight-navy placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all"
                          placeholder="your@email.com"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="contact-subject" className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                          Subject *
                        </label>
                        <select
                          id="contact-subject"
                          required
                          value={form.subject}
                          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] text-midnight-navy focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C69B3C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                          }}
                        >
                          {subjectOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="contact-message" className="block font-body text-[13px] font-medium text-midnight-navy mb-1.5">
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-md border border-light-gray bg-pure-white font-body text-[15px] text-midnight-navy placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(198,155,60,0.15)] transition-all resize-y"
                          placeholder="Tell us what's on your mind..."
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.04em] py-4 rounded border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all duration-300"
                      >
                        <Send size={16} /> Send Message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Quick Info Row */}
      <section className="bg-warm-ivory" style={{ padding: 'clamp(48px, 6vw, 64px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.1 }}
            className="flex flex-wrap items-start justify-center gap-8"
          >
            {quickInfo.map((info) => (
              <motion.div
                key={info.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="flex flex-col items-center text-center w-[220px]"
              >
                <info.icon size={28} className="text-champagne-gold" />
                <p className="font-body text-[13px] font-medium text-midnight-navy mt-3">
                  {info.label}
                </p>
                <p className="font-body text-sm text-slate-gray mt-1">{info.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
