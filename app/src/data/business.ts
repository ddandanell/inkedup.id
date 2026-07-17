// Single source of truth for InkedUp business details.
// ------------------------------------------------------
// TODO: replace the placeholder values below with the REAL business details.
// Everything that shows contact info (Footer, Contact, WhatsApp button,
// Booking success, LocalBusiness SEO) reads from here — edit once.

export const business = {
  name: 'InkedUp',
  legalName: 'InkedUp Bali', // TODO: registered entity name (e.g. "PT InkedUp Bali")

  // WhatsApp: digits only, with country code, no "+" or spaces (used for wa.me links).
  whatsapp: '628112656869',
  // Pretty-printed version for display (unmasked — show the real number).
  whatsappDisplay: '+62 811-2656-869',

  email: 'hello@inkedup.id', // TODO: real inbox

  hours: 'Every day, 8:00 AM – 8:00 PM (WITA)', // TODO: confirm hours
  area: 'Canggu, Bali, Indonesia',
  areaServed: ['Canggu', 'Seminyak', 'Kuta', 'Uluwatu', 'Ubud', 'Sanur', 'Nusa Dua', 'Jimbaran'],

  // Canonical social handles (keep consistent everywhere).
  instagram: 'https://instagram.com/inkedup.bali', // TODO
  tiktok: 'https://tiktok.com/@inkedup.bali', // TODO
} as const;

export type Business = typeof business;

// wa.me deep link with an optional pre-filled message.
export function waLink(message?: string): string {
  const base = `https://wa.me/${business.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export default business;
