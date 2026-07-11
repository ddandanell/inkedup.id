import { Shield, Users, Star, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrustBadgeProps {
  icon: 'shield' | 'users' | 'star' | 'map-pin';
  label: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  star: Star,
  'map-pin': MapPin,
};

export default function TrustBadge({ icon, label, className = '' }: TrustBadgeProps) {
  const Icon = iconMap[icon] || Shield;

  return (
    <div className={`flex items-center gap-2 text-pure-white/80 ${className}`}>
      <Icon size={16} className="text-champagne-gold flex-shrink-0" />
      <span className="font-body text-sm font-medium">{label}</span>
    </div>
  );
}
