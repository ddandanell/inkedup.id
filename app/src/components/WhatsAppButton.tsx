import { MessageCircle } from 'lucide-react';
import business from '@/data/business';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppButton({
  phoneNumber = business.whatsapp,
  message = 'Hi! I\'m interested in booking a tattoo session through InkedUp.',
  className = '',
  children,
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  if (children) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 ${className}`}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={28} className="text-white fill-white" />
    </a>
  );
}
