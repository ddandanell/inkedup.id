import bcrypt from 'bcryptjs';
import { query, resetDatabase, initSchema } from './db.js';
import { generateId } from './utils/id.js';
import { mockArtists, mockStudios, mockBookings, mockApplications } from '../../src/data/mockData.js';
import type { Artist, Studio, BookingLead, StudioApplication } from '../../src/data/types.js';

async function main(): Promise<void> {
  await initSchema();

  // Safety: never silently wipe a populated database. First run on an empty DB
  // proceeds; re-runs require ALLOW_RESET=1.
  const { rows: existingUsers } = await query<{ c: number | string }>('SELECT COUNT(*)::int AS c FROM users');
  const userCount = Number(existingUsers[0]?.c) || 0;
  if (userCount > 0 && process.env.ALLOW_RESET !== '1') {
    console.log(`Database already contains ${userCount} user(s). Set ALLOW_RESET=1 to wipe and reseed. Aborting.`);
    return;
  }

  await resetDatabase();

  // Admin user — password/email come from env in production; dev falls back to admin123.
  const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin123');
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set when seeding in production');
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@inkedup.id';
  const adminId = generateId('user');
  await query(
    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
    [adminId, 'InkedUp Admin', adminEmail, '+6281234567890', bcrypt.hashSync(adminPassword, 10), 'admin']
  );

  // Demo customer
  const customerId = generateId('user');
  await query(
    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
    [customerId, 'Demo Customer', 'customer@example.com', '+6281234567899', bcrypt.hashSync('customer123', 10), 'customer']
  );

  // Locations
  const locations = [
    { id: 'loc-canggu', name: 'Canggu', slug: 'canggu', zone: 1, call_out_fee: 0, priority: 10, description: 'Surf town with boutique studios and villa-friendly mobile service.' },
    { id: 'loc-seminyak', name: 'Seminyak', slug: 'seminyak', zone: 1, call_out_fee: 0, priority: 9, description: 'Upscale beach area with high-end studios and luxury villas.' },
    { id: 'loc-uluwatu', name: 'Uluwatu', slug: 'uluwatu', zone: 2, call_out_fee: 150000, priority: 8, description: 'Cliffside villas and surf retreats in the Bukit Peninsula.' },
    { id: 'loc-ubud', name: 'Ubud', slug: 'ubud', zone: 2, call_out_fee: 150000, priority: 8, description: 'Jungle and rice-field villas, wellness retreat hub.' },
    { id: 'loc-sanur', name: 'Sanur', slug: 'sanur', zone: 2, call_out_fee: 100000, priority: 5, description: 'Quiet beach town with family villas and relaxed pace.' },
    { id: 'loc-kuta', name: 'Kuta', slug: 'kuta', zone: 1, call_out_fee: 0, priority: 4, description: 'Busy tourist center with walk-in studios and budget hotels.' },
    { id: 'loc-nusa-dua', name: 'Nusa Dua', slug: 'nusa-dua', zone: 3, call_out_fee: 250000, priority: 4, description: 'Resort enclave with luxury beachfront hotels.' },
    { id: 'loc-jimbaran', name: 'Jimbaran', slug: 'jimbaran', zone: 2, call_out_fee: 125000, priority: 5, description: 'Beachfront seafood town with villa clusters.' },
  ];
  for (const loc of locations) {
    await query('INSERT INTO locations (id, name, slug, zone, call_out_fee, priority, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
      loc.id, loc.name, loc.slug, loc.zone, loc.call_out_fee, loc.priority, loc.description,
    ]);
  }

  // Styles
  const styles = [
    { id: 'style-fine-line', name: 'Fine Line', slug: 'fine-line', display_order: 1 },
    { id: 'style-blackwork', name: 'Blackwork', slug: 'blackwork', display_order: 2 },
    { id: 'style-japanese', name: 'Japanese', slug: 'japanese', display_order: 3 },
    { id: 'style-traditional', name: 'Traditional', slug: 'traditional', display_order: 4 },
    { id: 'style-realism', name: 'Realism', slug: 'realism', display_order: 5 },
    { id: 'style-minimalist', name: 'Minimalist', slug: 'minimalist', display_order: 6 },
    { id: 'style-geometric', name: 'Geometric', slug: 'geometric', display_order: 7 },
    { id: 'style-watercolor', name: 'Watercolor', slug: 'watercolor', display_order: 8 },
    { id: 'style-floral', name: 'Floral', slug: 'floral', display_order: 9 },
    { id: 'style-tribal', name: 'Tribal', slug: 'tribal', display_order: 10 },
    { id: 'style-dotwork', name: 'Dotwork', slug: 'dotwork', display_order: 11 },
    { id: 'style-script', name: 'Script', slug: 'script', display_order: 12 },
  ];
  for (const style of styles) {
    await query('INSERT INTO styles (id, name, slug, display_order) VALUES ($1, $2, $3, $4)', [
      style.id, style.name, style.slug, style.display_order,
    ]);
  }

  // Studios
  for (const studio of mockStudios as Studio[]) {
    await query(
      'INSERT INTO studios (id, name, email, whatsapp_number, location, address, status, artist_ids, instagram, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        studio.id,
        studio.name,
        studio.email,
        studio.whatsappNumber,
        studio.location,
        studio.address || null,
        studio.status,
        JSON.stringify(studio.artistIds || []),
        studio.instagram || null,
        `Verified InkedUp studio partner in ${studio.location}.`,
      ]
    );
  }

  // Artists
  for (const artist of mockArtists as Artist[]) {
    await query(
      `INSERT INTO artists (
        id, slug, first_name, last_name, display_name, photo, bio, specialties, styles, location,
        rating, review_count, portfolio_images, availability, pricing, status, years_of_experience,
        languages, instagram, studio_id, tier, commission_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        artist.id,
        artist.slug,
        artist.firstName,
        artist.lastName,
        artist.displayName,
        artist.photo,
        artist.bio,
        JSON.stringify(artist.specialties),
        JSON.stringify(artist.styles),
        artist.location,
        artist.rating,
        artist.reviewCount,
        JSON.stringify(artist.portfolioImages),
        JSON.stringify(artist.availability),
        JSON.stringify(artist.pricing),
        artist.status,
        artist.yearsOfExperience,
        JSON.stringify(artist.languages),
        artist.instagram || null,
        artist.studioId || null,
        artist.yearsOfExperience >= 10 && artist.rating >= 4.8 ? 'top' : 'verified',
        0.10,
      ]
    );
  }

  // Bookings
  for (const booking of mockBookings as BookingLead[]) {
    await query(
      `INSERT INTO bookings (
        id, reference, artist_id, artist_name, customer_name, customer_email, customer_whatsapp,
        customer_location, service_type, tattoo_style, size, placement, preferred_date, description,
        budget, reference_images, status, deposit_amount, total_price, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        booking.id,
        `INK-${booking.id.split('-')[1].toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        booking.artistId || null,
        booking.artistName || null,
        booking.customerName,
        booking.customerEmail,
        booking.customerWhatsApp,
        booking.customerLocation,
        booking.serviceType || null,
        booking.tattooStyle || null,
        booking.size || null,
        booking.placement || null,
        booking.preferredDate || null,
        booking.description || null,
        booking.budget || null,
        JSON.stringify(booking.referenceImages || []),
        booking.status,
        booking.depositAmount || null,
        booking.totalPrice || null,
        booking.notes || '',
      ]
    );

    if (['deposit_paid', 'confirmed', 'completed'].includes(booking.status)) {
      const total = booking.totalPrice || booking.budget || 0;
      const amount = Math.round(total * 0.10);
      if (amount > 0) {
        await query('INSERT INTO commissions (id, booking_id, amount, rate, status) VALUES ($1, $2, $3, $4, $5)', [
          generateId('commission'),
          booking.id,
          amount,
          0.10,
          booking.status === 'completed' ? 'paid' : 'pending',
        ]);
      }
    }
  }

  // Applications
  for (const application of mockApplications as StudioApplication[]) {
    await query(
      `INSERT INTO applications (
        id, studio_name, artist_name, email, whatsapp_number, portfolio_url, bio, specialties, styles,
        location, years_of_experience, languages, instagram, status, submitted_at, reviewed_at, review_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        application.id,
        application.studioName,
        application.artistName,
        application.email,
        application.whatsappNumber,
        application.portfolioUrl || null,
        application.bio,
        JSON.stringify(application.specialties),
        JSON.stringify(application.styles),
        application.location,
        application.yearsOfExperience,
        JSON.stringify(application.languages),
        application.instagram || null,
        application.status,
        application.submittedAt,
        application.reviewedAt || null,
        application.reviewNotes || null,
      ]
    );
  }

  // Content pages
  const contentPages = [
    { slug: 'home', title: 'Home', page_type: 'general', body: JSON.stringify({ headline: "Bali's Premier Mobile Tattoo Concierge", subheadline: 'Verified artists. Villa-to-studio service. 10% off studio prices.' }) },
    { slug: 'safety', title: 'Safety', page_type: 'support', body: 'InkedUp follows voluntary Australian/UK-level hygiene protocols including single-use needles, autoclave sterilization, and personal protective equipment.' },
    { slug: 'pricing', title: 'Pricing', page_type: 'support', body: 'Customers save 10% off studio prices. Call-out fees depend on zone: Zone 1 free, Zone 2 Rp 100.000–150.000, Zone 3 Rp 200.000–300.000.' },
    { slug: 'faq', title: 'FAQ', page_type: 'support', body: 'Frequently asked questions about booking, deposits, rescheduling, and aftercare.' },
    { slug: 'how-it-works', title: 'How It Works', page_type: 'support', body: '1. Browse artists and styles. 2. Request a quote. 3. We match you with a verified artist. 4. Pay a 10% booking fee to confirm. 5. Get tattooed at your villa or studio.' },
    { slug: 'inspiration', title: 'Inspiration Gallery', page_type: 'general', body: 'Curated portfolio gallery of fine line, blackwork, Japanese, realism, and minimalist tattoos by InkedUp artists.' },
  ];
  for (const page of contentPages) {
    await query('INSERT INTO content_pages (id, slug, title, page_type, body) VALUES ($1, $2, $3, $4, $5)', [
      generateId('page'), page.slug, page.title, page.page_type, page.body,
    ]);
  }

  // Reviews
  const reviewComments = [
    { artistId: '1', comment: 'Kadek was incredibly professional and the Balinese design is stunning.', rating: 5 },
    { artistId: '2', comment: 'Ayu made the whole process so relaxing. My fine-line floral piece is perfect.', rating: 5 },
    { artistId: '3', comment: 'Beautiful watercolor work. Highly recommend for delicate styles.', rating: 5 },
    { artistId: '4', comment: 'Marcus nailed the geometric mandala. Very precise and clean.', rating: 4 },
    { artistId: '5', comment: 'Leina’s Polynesian work is powerful and meaningful. A true artist.', rating: 5 },
  ];
  for (const r of reviewComments) {
    await query(
      'INSERT INTO reviews (id, artist_id, artistry, professionalism, cleanliness, communication, value, comment, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [generateId('review'), r.artistId, r.rating, r.rating, r.rating, r.rating, r.rating, r.comment, 1]
    );
  }

  // Keep the seeded rating/review_count for demo consistency — the handful of
  // sample reviews must not clobber the brand's stated counts (e.g. 127 -> 1).
  for (const artist of mockArtists as Artist[]) {
    await query('UPDATE artists SET rating = $1, review_count = $2 WHERE id = $3', [artist.rating, artist.reviewCount, artist.id]);
  }

  console.log('Database seeded successfully.');
  console.log(`Admin login: ${adminEmail} (password from ADMIN_PASSWORD env)`);
  console.log('Customer login: customer@example.com / customer123');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
