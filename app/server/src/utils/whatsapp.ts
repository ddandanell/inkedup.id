export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const base = `https://wa.me/${cleaned}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function bookingInquiryMessage(artistName: string, customerName: string, style?: string): string {
  return `Hi InkedUp, I'm ${customerName} and I'd like to book ${artistName || 'an artist'}${style ? ` for a ${style} tattoo` : ''}. Can you help me with the next steps?`;
}
