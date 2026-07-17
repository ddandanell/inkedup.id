export interface Artist {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photo: string;
  bio: string;
  specialties: string[];
  styles: string[];
  location: string;
  rating: number;
  reviewCount: number;
  portfolioImages: string[];
  availability: string[];
  pricing: {
    small: number;
    medium: number;
    large: number;
  };
  status: 'pending' | 'active' | 'rejected';
  yearsOfExperience: number;
  languages: string[];
  instagram?: string;
  studioId?: string;
}

export interface Studio {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  location: string;
  address?: string;
  status: 'pending' | 'active' | 'rejected';
  artistIds: string[];
  instagram?: string;
  bio?: string;
  logoUrl?: string;
  verifiedAt?: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  zone: number;
  callOutFee: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  priority: number;
  published: boolean;
}

export interface BookingLead {
  id: string;
  artistId?: string;
  artistName?: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  customerLocation: string;
  serviceType: string;
  tattooStyle: string;
  size: 'small' | 'medium' | 'large';
  placement: string;
  preferredDate: string;
  description: string;
  budget?: number;
  referenceImages?: string[];
  status: 'new' | 'reviewed' | 'matched' | 'deposit_paid' | 'confirmed' | 'completed' | 'cancelled';
  depositAmount?: number;
  totalPrice?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioApplication {
  id: string;
  studioName: string;
  artistName?: string;
  ownerName?: string;
  numberOfArtists?: number;
  email: string;
  whatsappNumber: string;
  portfolioUrl?: string;
  bio: string;
  specialties: string[];
  styles: string[];
  location: string;
  yearsOfExperience: number;
  languages: string[];
  instagram?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface DashboardStats {
  totalArtists: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalCommissions: number;
  pendingStudioApplications: number;
}

export interface InspirationImage {
  id: string;
  source: 'wikimedia' | 'openverse' | 'flickr' | 'pexels' | 'pixabay' | 'unsplash' | 'artist_upload' | 'ai_generated';
  sourceId?: string;
  sourceUrl: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title?: string;
  creator?: string;
  creatorUrl?: string;
  license: string;
  licenseUrl?: string;
  tags: string[];
  styles: string[];
  placement?: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  attributionRequired: boolean;
  scrapedAt?: string;
  createdAt?: string;
}

export interface AppState {
  artists: Artist[];
  studios: Studio[];
  bookings: BookingLead[];
  applications: StudioApplication[];
  admin: AdminUser | null;
  isAuthenticated: boolean;
}
