import business from '@/data/business';
import { useSEO } from '@/hooks/useSEO';

export default function Terms() {
  useSEO({ title: 'Terms of Service', description: 'Booking, payment, rescheduling and safety terms for InkedUp mobile tattoo sessions in Bali.', path: '/terms' });
  return (
    <div className="min-h-[100dvh] bg-pure-white">
      <div className="container-inkedup max-w-[760px] py-16 md:py-24">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold">Legal</span>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] font-medium text-midnight-navy mt-3 mb-8">Terms of Service</h1>

        <div className="space-y-6 font-body text-[15px] text-charcoal leading-[1.75]">
          <p>
            By booking through {business.legalName} ("InkedUp") you agree to these terms. Please read them
            before confirming a session.
          </p>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">Bookings & payment</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>A 10% booking deposit in IDR confirms your slot. The remaining 90% is paid directly to your studio after the session.</li>
            <li>Final pricing is confirmed by your studio during consultation and depends on size, placement and detail.</li>
            <li>Call-out fees may apply for areas outside our primary service zones and are confirmed in advance.</li>
          </ul>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">Rescheduling & cancellation</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Rescheduling is free with at least 48 hours' notice via WhatsApp.</li>
            <li>Late cancellations or no-shows may forfeit the booking deposit.</li>
          </ul>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">Health & safety</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be 18 or older to get tattooed.</li>
            <li>Follow the aftercare instructions provided. We are not liable for issues caused by improper aftercare.</li>
            <li>Studios use single-use needles and sterile mobile setups for every session.</li>
          </ul>

          <h2 className="font-display text-xl font-medium text-midnight-navy pt-4">Studios</h2>
          <p>
            InkedUp partners with verified studios only, never individual freelance artists. Each studio is
            responsible for the quality and hygiene of its work.
          </p>

          <p className="text-slate-gray text-sm pt-6">
            Questions about these terms? Contact {business.email} or WhatsApp {business.whatsappDisplay}.
          </p>
        </div>
      </div>
    </div>
  );
}
