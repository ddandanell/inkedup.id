import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import type { Artist } from '@/data/types';
import StarRating from './StarRating';

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

export default function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      <Link to={`/artists/${artist.slug}`} className="group block">
        <div className="bg-pure-white rounded-lg overflow-hidden shadow-card transition-all duration-400 ease-out group-hover:shadow-card-hover group-hover:-translate-y-1.5">
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={artist.photo}
              alt={artist.displayName}
              className="w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="p-6">
            <h3 className="font-display text-xl font-medium text-midnight-navy">
              {artist.displayName}
            </h3>

            <div className="flex items-center gap-1 mt-1.5 text-slate-gray">
              <MapPin size={13} className="flex-shrink-0" />
              <span className="font-body text-[13px]">{artist.location}</span>
            </div>

            {/* Style Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {artist.styles.slice(0, 3).map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[11px] font-semibold uppercase tracking-[0.12em]"
                >
                  {style}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={artist.rating} size={13} />
              <span className="font-body text-sm font-medium text-champagne-gold">
                {artist.rating.toFixed(1)}
              </span>
              <span className="font-body text-xs text-slate-gray">
                ({artist.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
