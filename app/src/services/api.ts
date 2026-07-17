const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = localStorage.getItem('inkedup_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed: ${response.statusText}`) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth
export const login = (email: string, password: string) =>
  api.post<{ token: string; user: { id: string; name: string; email: string; role: string; phone?: string } }>('/auth/login', { email, password });

export const register = (payload: { name: string; email: string; password: string; phone?: string; role?: string }) =>
  api.post<{ token: string; user: { id: string; name: string; email: string; role: string; phone?: string } }>('/auth/register', payload);

export const getMe = () => api.get<{ id: string; name: string; email: string; role: string; phone?: string }>('/auth/me');

// Artists
export const getArtists = () => api.get<ArtistApi[]>('/artists');
export const getActiveArtists = () => api.get<ArtistApi[]>('/artists/active');
export const getArtistBySlug = (slug: string) => api.get<ArtistApi>(`/artists/${slug}`);
export const createArtist = (artist: Partial<ArtistApi>) => api.post<ArtistApi>('/artists', artist);
export const updateArtist = (id: string, artist: Partial<ArtistApi>) => api.patch<ArtistApi>(`/artists/${id}`, artist);
export const deleteArtist = (id: string) => api.delete<{ success: boolean }>(`/artists/${id}`);

// Studios
export const getStudios = () => api.get<StudioApi[]>('/studios');
export const getActiveStudios = () => api.get<StudioApi[]>('/studios/active');
export const getStudio = (id: string) => api.get<StudioApi>(`/studios/${id}`);
export const getStudioArtists = (id: string) => api.get<ArtistApi[]>(`/studios/${id}/artists`);
export const createStudio = (studio: Partial<StudioApi>) => api.post<StudioApi>('/studios', studio);
export const updateStudio = (id: string, studio: Partial<StudioApi>) => api.patch<StudioApi>(`/studios/${id}`, studio);
export const deleteStudio = (id: string) => api.delete<{ success: boolean }>(`/studios/${id}`);

// Bookings
export const getBookings = () => api.get<BookingApi[]>('/bookings');
export const getBooking = (id: string) => api.get<BookingApi>(`/bookings/${id}`);
export const createBooking = (booking: Partial<BookingApi>) => api.post<BookingApi>('/bookings', booking);
export const updateBooking = (id: string, booking: Partial<BookingApi>) => api.patch<BookingApi>(`/bookings/${id}`, booking);
export const assignArtist = (id: string, payload: { artist_id?: string; artist_name?: string }) =>
  api.post<BookingApi>(`/bookings/${id}/assign-artist`, payload);
export const updateBookingStatus = (id: string, status: BookingApi['status'], notes?: string) =>
  api.post<BookingApi>(`/bookings/${id}/status`, { status, notes });
export const deleteBooking = (id: string) => api.delete<{ success: boolean }>(`/bookings/${id}`);

// Applications
export const getApplications = () => api.get<ApplicationApi[]>('/applications');
export const getApplication = (id: string) => api.get<ApplicationApi>(`/applications/${id}`);
export const createApplication = (application: Partial<ApplicationApi>) => api.post<ApplicationApi>('/applications', application);
export const approveApplication = (id: string) => api.post<{ application: ApplicationApi; studioId: string; artistId: string }>(`/applications/${id}/approve`, {});
export const rejectApplication = (id: string, review_notes?: string) => api.post<ApplicationApi>(`/applications/${id}/reject`, { review_notes });

// Reviews
export const getReviews = () => api.get<ReviewApi[]>('/reviews');
export const getArtistReviews = (artistId: string) => api.get<ReviewApi[]>(`/reviews/artist/${artistId}`);
export const createReview = (review: Partial<ReviewApi>) => api.post<ReviewApi>('/reviews', review);

// Locations
export const getLocations = () => api.get<LocationApi[]>('/locations');
export const getLocationBySlug = (slug: string) => api.get<LocationApi>(`/locations/${slug}`);

// Content
export const getContentPages = () => api.get<ContentPageApi[]>('/content');
export const getContentPage = (slug: string) => api.get<ContentPageApi>(`/content/${slug}`);

// Dashboard
export const getDashboard = () =>
  api.get<{ stats: DashboardStatsApi; recentBookings: BookingApi[]; recentApplications: ApplicationApi[] }>('/dashboard');

// Public stats for marketing trust bars (no auth)
export const getPublicStats = () => api.get<DashboardStatsApi>('/stats');

// Inspiration gallery (CC-licensed / public-domain images)
export const getInspirationImages = (params?: { style?: string; q?: string; limit?: number; offset?: number }) =>
  api.get<{ data: InspirationImageApi[]; total: number; limit: number; offset: number }>(
    '/inspiration' + (params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : '')
  );
export const getInspirationStyles = () => api.get<{ style: string; count: number }[]>('/inspiration/styles');

// Types mirrored from backend (snake_case)
export interface ArtistApi {
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

export interface StudioApi {
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

export interface BookingApi {
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

export interface ApplicationApi {
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

export interface ReviewApi {
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

export interface LocationApi {
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

export interface ContentPageApi {
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

export interface DashboardStatsApi {
  totalArtists: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalCommissions: number;
  pendingStudioApplications: number;
}

export interface InspirationImageApi {
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
