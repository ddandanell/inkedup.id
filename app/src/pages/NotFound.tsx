import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-warm-ivory px-4">
      <div className="text-center max-w-md">
        <span className="font-display text-[clamp(80px,15vw,140px)] font-medium text-champagne-gold/40 leading-none">404</span>
        <h1 className="font-display text-[clamp(28px,4vw,40px)] font-medium text-midnight-navy mt-2">
          Page not found
        </h1>
        <p className="font-body text-[15px] text-slate-gray mt-3">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 font-body text-sm font-semibold uppercase tracking-[0.04em] px-8 py-3.5 rounded gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all"
        >
          Back to Home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
