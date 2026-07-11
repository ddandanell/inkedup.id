import business from '@/data/business';
import { useSEO } from '@/hooks/useSEO';

export default function Privacy() {
  useSEO({ title: 'Privacy Policy', description: 'How InkedUp collects and uses your information when you book a mobile tattoo in Bali.', path: '/privacy' });
  return (
    <div className="min-h-[100dvh] bg-pure-white">
      <div className="container-inkedup max-w-[760px] py-16 md:py-24">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold">Legal</span>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy mt-3 mb-8">Privacy Policy</h1>

        <div className="space-y-6 font-body text-[15px] text-charcoal leading-[1.75]">
          <p>
            {business.legalName} ("InkedUp", "we", "us") respects your privacy. This page explains what
            information we collect when you use our website and book a mobile tattoo session, and how we use it.
          </p>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">What we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Contact details you share with us (name, email, WhatsApp number).</li>
            <li>Booking details (tattoo idea, size, placement, preferred date and location).</li>
            <li>Messages you send us via the contact form or WhatsApp.</li>
          </ul>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">How we use it</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To confirm and manage your booking and connect you with a verified studio.</li>
            <li>To communicate with you about your session.</li>
            <li>To improve our service. We do not sell your personal data.</li>
          </ul>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">Your choices</h2>
          <p>
            You can ask us to update or delete your information at any time by contacting us on WhatsApp
            at {business.whatsappDisplay} or by email at {business.email}.
          </p>

          <p className="text-slate-gray text-sm pt-6">
            This is a summary policy provided for transparency. For questions, contact {business.email}.
          </p>
        </div>
      </div>
    </div>
  );
}
