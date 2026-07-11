import type { Artist, Studio, Location, BookingLead, StudioApplication, AdminUser, DashboardStats } from './types';
import * as api from '@/services/api';

function toArtist(apiArtist: api.ArtistApi): Artist {
  return {
    id: apiArtist.id,
    slug: apiArtist.slug,
    firstName: apiArtist.first_name,
    lastName: apiArtist.last_name,
    displayName: apiArtist.display_name,
    photo: apiArtist.photo || '/artist-1.jpg',
    bio: apiArtist.bio || '',
    specialties: apiArtist.specialties,
    styles: apiArtist.styles,
    location: apiArtist.location,
    rating: apiArtist.rating,
    reviewCount: apiArtist.review_count,
    portfolioImages: apiArtist.portfolio_images,
    availability: apiArtist.availability,
    pricing: apiArtist.pricing,
    status: apiArtist.status,
    yearsOfExperience: apiArtist.years_of_experience,
    languages: apiArtist.languages,
    instagram: apiArtist.instagram,
    studioId: apiArtist.studio_id,
  };
}

function toStudio(apiStudio: api.StudioApi): Studio {
  return {
    id: apiStudio.id,
    name: apiStudio.name,
    email: apiStudio.email,
    whatsappNumber: apiStudio.whatsapp_number,
    location: apiStudio.location,
    address: apiStudio.address,
    status: apiStudio.status,
    artistIds: apiStudio.artist_ids,
    instagram: apiStudio.instagram,
    bio: apiStudio.bio,
    logoUrl: apiStudio.logo_url,
    verifiedAt: apiStudio.verified_at,
  };
}

function toLocation(apiLocation: api.LocationApi): Location {
  return {
    id: apiLocation.id,
    name: apiLocation.name,
    slug: apiLocation.slug,
    zone: apiLocation.zone,
    callOutFee: apiLocation.call_out_fee,
    latitude: apiLocation.latitude,
    longitude: apiLocation.longitude,
    description: apiLocation.description,
    priority: apiLocation.priority,
    published: apiLocation.published === 1,
  };
}

function toBooking(apiBooking: api.BookingApi): BookingLead {
  return {
    id: apiBooking.id,
    artistId: apiBooking.artist_id,
    artistName: apiBooking.artist_name,
    customerName: apiBooking.customer_name,
    customerEmail: apiBooking.customer_email,
    customerWhatsApp: apiBooking.customer_whatsapp,
    customerLocation: apiBooking.customer_location,
    serviceType: apiBooking.service_type || 'tattoo',
    tattooStyle: apiBooking.tattoo_style || '',
    size: apiBooking.size || 'small',
    placement: apiBooking.placement || '',
    preferredDate: apiBooking.preferred_date || '',
    description: apiBooking.description || '',
    budget: apiBooking.budget,
    referenceImages: apiBooking.reference_images,
    status: apiBooking.status,
    depositAmount: apiBooking.deposit_amount,
    totalPrice: apiBooking.total_price,
    notes: apiBooking.notes,
    createdAt: apiBooking.created_at,
    updatedAt: apiBooking.updated_at,
  };
}

function toApplication(apiApp: api.ApplicationApi): StudioApplication {
  return {
    id: apiApp.id,
    studioName: apiApp.studio_name,
    artistName: apiApp.artist_name,
    ownerName: apiApp.owner_name,
    numberOfArtists: apiApp.number_of_artists,
    email: apiApp.email,
    whatsappNumber: apiApp.whatsapp_number,
    portfolioUrl: apiApp.portfolio_url,
    bio: apiApp.bio || '',
    specialties: apiApp.specialties,
    styles: apiApp.styles,
    location: apiApp.location,
    yearsOfExperience: apiApp.years_of_experience,
    languages: apiApp.languages,
    instagram: apiApp.instagram,
    status: apiApp.status,
    submittedAt: apiApp.submitted_at,
    reviewedAt: apiApp.reviewed_at,
    reviewNotes: apiApp.review_notes,
  };
}

const store = {
  formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  getWhatsAppUrl(phone: string, message?: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const base = `https://wa.me/${cleaned}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  },

  // Artists
  async getArtists(): Promise<Artist[]> {
    const artists = await api.getArtists();
    return artists.map(toArtist);
  },

  async getArtistBySlug(slug: string): Promise<Artist | undefined> {
    try {
      return toArtist(await api.getArtistBySlug(slug));
    } catch {
      return undefined;
    }
  },

  async getArtistById(id: string): Promise<Artist | undefined> {
    const artists = await this.getArtists();
    return artists.find(a => a.id === id);
  },

  async getActiveArtists(): Promise<Artist[]> {
    const artists = await api.getActiveArtists();
    return artists.map(toArtist);
  },

  async updateArtist(id: string, data: Partial<Artist>): Promise<Artist> {
    const apiData: Partial<api.ArtistApi> = {};
    if (data.firstName !== undefined) apiData.first_name = data.firstName;
    if (data.lastName !== undefined) apiData.last_name = data.lastName;
    if (data.displayName !== undefined) apiData.display_name = data.displayName;
    if (data.photo !== undefined) apiData.photo = data.photo;
    if (data.bio !== undefined) apiData.bio = data.bio;
    if (data.specialties !== undefined) apiData.specialties = data.specialties;
    if (data.styles !== undefined) apiData.styles = data.styles;
    if (data.location !== undefined) apiData.location = data.location;
    if (data.rating !== undefined) apiData.rating = data.rating;
    if (data.reviewCount !== undefined) apiData.review_count = data.reviewCount;
    if (data.portfolioImages !== undefined) apiData.portfolio_images = data.portfolioImages;
    if (data.availability !== undefined) apiData.availability = data.availability;
    if (data.pricing !== undefined) apiData.pricing = data.pricing;
    if (data.status !== undefined) apiData.status = data.status;
    if (data.yearsOfExperience !== undefined) apiData.years_of_experience = data.yearsOfExperience;
    if (data.languages !== undefined) apiData.languages = data.languages;
    if (data.instagram !== undefined) apiData.instagram = data.instagram;
    if (data.studioId !== undefined) apiData.studio_id = data.studioId;
    return toArtist(await api.updateArtist(id, apiData));
  },

  // Studios
  async getStudios(): Promise<Studio[]> {
    const studios = await api.getStudios();
    return studios.map(toStudio);
  },

  async getStudioById(id: string): Promise<Studio | undefined> {
    try {
      return toStudio(await api.getStudio(id));
    } catch {
      return undefined;
    }
  },

  async getActiveStudios(): Promise<Studio[]> {
    const studios = await api.getActiveStudios();
    return studios.map(toStudio);
  },

  async getLocations(): Promise<Location[]> {
    const locations = await api.getLocations();
    return locations.map(toLocation);
  },

  async updateStudio(id: string, data: Partial<Studio>): Promise<Studio> {
    const apiData: Partial<api.StudioApi> = {};
    if (data.name !== undefined) apiData.name = data.name;
    if (data.email !== undefined) apiData.email = data.email;
    if (data.whatsappNumber !== undefined) apiData.whatsapp_number = data.whatsappNumber;
    if (data.location !== undefined) apiData.location = data.location;
    if (data.address !== undefined) apiData.address = data.address;
    if (data.status !== undefined) apiData.status = data.status;
    if (data.artistIds !== undefined) apiData.artist_ids = data.artistIds;
    if (data.instagram !== undefined) apiData.instagram = data.instagram;
    return toStudio(await api.updateStudio(id, apiData));
  },

  // Booking Leads
  async getBookingLeads(): Promise<BookingLead[]> {
    const bookings = await api.getBookings();
    return bookings.map(toBooking);
  },

  async getBookingById(id: string): Promise<BookingLead | undefined> {
    try {
      return toBooking(await api.getBooking(id));
    } catch {
      return undefined;
    }
  },

  async addBookingLead(booking: Omit<BookingLead, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<BookingLead> {
    const apiBooking: Partial<api.BookingApi> = {
      artist_id: booking.artistId,
      artist_name: booking.artistName,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_whatsapp: booking.customerWhatsApp,
      customer_location: booking.customerLocation,
      service_type: booking.serviceType,
      tattoo_style: booking.tattooStyle,
      size: booking.size,
      placement: booking.placement,
      preferred_date: booking.preferredDate,
      description: booking.description,
      budget: booking.budget,
      reference_images: booking.referenceImages,
      deposit_amount: booking.depositAmount,
      total_price: booking.totalPrice,
      notes: booking.notes,
    };
    return toBooking(await api.createBooking(apiBooking));
  },

  async updateBookingStatus(id: string, status: BookingLead['status'], notes?: string): Promise<BookingLead | null> {
    try {
      return toBooking(await api.updateBookingStatus(id, status, notes));
    } catch {
      return null;
    }
  },

  async assignBookingArtist(id: string, artistId: string, artistName: string): Promise<BookingLead | null> {
    try {
      return toBooking(await api.assignArtist(id, { artist_id: artistId, artist_name: artistName }));
    } catch {
      return null;
    }
  },

  // Studio Applications
  async getStudioApplications(): Promise<StudioApplication[]> {
    const apps = await api.getApplications();
    return apps.map(toApplication);
  },

  async addStudioApplication(application: Omit<StudioApplication, 'id' | 'submittedAt' | 'status'>): Promise<StudioApplication> {
    const apiApp: Partial<api.ApplicationApi> = {
      studio_name: application.studioName,
      artist_name: application.artistName,
      owner_name: application.ownerName,
      number_of_artists: application.numberOfArtists,
      email: application.email,
      whatsapp_number: application.whatsappNumber,
      portfolio_url: application.portfolioUrl,
      bio: application.bio,
      specialties: application.specialties,
      styles: application.styles,
      location: application.location,
      years_of_experience: application.yearsOfExperience,
      languages: application.languages,
      instagram: application.instagram,
    };
    return toApplication(await api.createApplication(apiApp));
  },

  async approveStudio(id: string): Promise<StudioApplication | null> {
    try {
      const result = await api.approveApplication(id);
      return toApplication(result.application);
    } catch {
      return null;
    }
  },

  async rejectStudio(id: string, reviewNotes?: string): Promise<StudioApplication | null> {
    try {
      return toApplication(await api.rejectApplication(id, reviewNotes));
    } catch {
      return null;
    }
  },

  // Admin auth
  async loginAsAdmin(email: string, password: string): Promise<AdminUser> {
    const result = await api.login(email, password);
    if (result.user.role !== 'admin') {
      throw new Error('This account does not have admin access.');
    }
    localStorage.setItem('inkedup_token', result.token);
    localStorage.setItem('inkedup_auth', JSON.stringify({ isAuthenticated: true, role: result.user.role }));
    return { id: result.user.id, name: result.user.name, email: result.user.email, role: 'admin' };
  },

  async loginAsArtist(): Promise<void> {
    // Placeholder: in a real setup, artist would have own credentials
    localStorage.setItem('inkedup_auth', JSON.stringify({ isAuthenticated: true, role: 'artist' }));
  },

  logout(): void {
    localStorage.removeItem('inkedup_token');
    localStorage.removeItem('inkedup_auth');
  },

  isAuthenticated(): boolean {
    const auth = localStorage.getItem('inkedup_auth');
    if (!auth) return false;
    try {
      const parsed = JSON.parse(auth);
      return parsed.isAuthenticated === true;
    } catch {
      return false;
    }
  },

  getAuthRole(): string | null {
    const auth = localStorage.getItem('inkedup_auth');
    if (!auth) return null;
    try {
      return JSON.parse(auth).role || null;
    } catch {
      return null;
    }
  },

  // Commissions
  async getTotalCommissions(): Promise<number> {
    const dashboard = await api.getDashboard();
    return dashboard.stats.totalCommissions;
  },

  async getStats(): Promise<DashboardStats> {
    return api.getPublicStats();
  },
};

export default store;
