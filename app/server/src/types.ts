export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'artist' | 'admin' | 'partner';
  created_at: string;
  updated_at: string;
}

export interface SafeUser extends Omit<User, 'password_hash'> {
  password_hash?: never;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  zone: number;
  call_out_fee: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  priority: number;
  published: number;
}

export interface Style {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface Studio {
  id: string;
  name: string;
  email: string;
  whatsapp_number: string;
  location: string;
  address?: string;
  status: 'pending' | 'active' | 'rejected';
  artist_ids: string[];
  instagram?: string;
  bio?: string;
  logo_url?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  display_name: string;
  photo?: string;
  bio?: string;
  specialties: string[];
  styles: string[];
  location: string;
  rating: number;
  review_count: number;
  portfolio_images: string[];
  availability: string[];
  pricing: { small: number; medium: number; large: number };
  status: 'pending' | 'active' | 'rejected';
  years_of_experience: number;
  languages: string[];
  instagram?: string;
  studio_id?: string;
  tier: 'basic' | 'verified' | 'top' | 'ambassador';
  commission_rate: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  artist_id: string;
  image_url: string;
  type: 'fresh' | 'healed' | 'setup';
  style_id?: string;
  is_featured: number;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id?: string;
  artist_id: string;
  customer_id?: string;
  artistry?: number;
  professionalism?: number;
  cleanliness?: number;
  communication?: number;
  value?: number;
  comment?: string;
  photo_url?: string;
  is_published: number;
  submitted_at: string;
}

export interface Booking {
  id: string;
  reference?: string;
  artist_id?: string;
  artist_name?: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  customer_location: string;
  service_type?: string;
  tattoo_style?: string;
  size?: 'small' | 'medium' | 'large';
  placement?: string;
  preferred_date?: string;
  description?: string;
  budget?: number;
  reference_images: string[];
  status: 'new' | 'reviewed' | 'matched' | 'deposit_paid' | 'confirmed' | 'completed' | 'cancelled';
  deposit_amount?: number;
  total_price?: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  studio_name: string;
  artist_name?: string;
  owner_name?: string;
  number_of_artists?: number;
  email: string;
  whatsapp_number: string;
  portfolio_url?: string;
  bio?: string;
  specialties: string[];
  styles: string[];
  location: string;
  years_of_experience: number;
  languages: string[];
  instagram?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  decided_at?: string;
}

export interface Commission {
  id: string;
  booking_id: string;
  amount: number;
  rate: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  body?: string;
  page_type: 'location' | 'service' | 'style' | 'blog' | 'support' | 'general';
  schema_json?: string;
  published: number;
  updated_at: string;
}

export interface InspirationImage {
  id: string;
  source: 'wikimedia' | 'openverse' | 'flickr' | 'pexels' | 'pixabay' | 'unsplash' | 'artist_upload' | 'ai_generated';
  source_id?: string;
  source_url: string;
  image_url: string;
  thumbnail_url?: string;
  title?: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_url?: string;
  tags: string[];
  styles: string[];
  placement?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: number;
  attribution_required: number;
  scraped_at?: string;
  created_at?: string;
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
