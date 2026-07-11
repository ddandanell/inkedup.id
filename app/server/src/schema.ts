// InkedUp Postgres schema.
// Statements are run individually (the Neon serverless HTTP driver does not
// support multi-statement queries). Everything is idempotent via IF NOT EXISTS.

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'artist', 'admin', 'partner')),
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
  )`,

  `CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    zone INTEGER NOT NULL DEFAULT 1,
    call_out_fee INTEGER NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    priority INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS styles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS studios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
    artist_ids TEXT NOT NULL DEFAULT '[]',
    instagram TEXT,
    bio TEXT,
    logo_url TEXT,
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
  )`,

  `CREATE TABLE IF NOT EXISTS artists (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    photo TEXT,
    bio TEXT,
    specialties TEXT NOT NULL DEFAULT '[]',
    styles TEXT NOT NULL DEFAULT '[]',
    location TEXT NOT NULL,
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    portfolio_images TEXT NOT NULL DEFAULT '[]',
    availability TEXT NOT NULL DEFAULT '[]',
    pricing TEXT NOT NULL DEFAULT '{"small":0,"medium":0,"large":0}',
    status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    languages TEXT NOT NULL DEFAULT '[]',
    instagram TEXT,
    studio_id TEXT,
    tier TEXT NOT NULL CHECK(tier IN ('basic', 'verified', 'top', 'ambassador')) DEFAULT 'basic',
    commission_rate DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS artist_styles (
    id SERIAL PRIMARY KEY,
    artist_id TEXT NOT NULL,
    style_id TEXT NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES styles(id) ON DELETE CASCADE,
    UNIQUE(artist_id, style_id)
  )`,

  `CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    artist_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('fresh', 'healed', 'setup')) DEFAULT 'fresh',
    style_id TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES styles(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    studio_name TEXT NOT NULL,
    artist_name TEXT,
    owner_name TEXT,
    number_of_artists INTEGER,
    email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    portfolio_url TEXT,
    bio TEXT,
    specialties TEXT NOT NULL DEFAULT '[]',
    styles TEXT NOT NULL DEFAULT '[]',
    location TEXT NOT NULL,
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    languages TEXT NOT NULL DEFAULT '[]',
    instagram TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    submitted_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    reviewed_at TEXT,
    review_notes TEXT,
    decided_at TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE,
    artist_id TEXT,
    artist_name TEXT,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_location TEXT NOT NULL,
    service_type TEXT,
    tattoo_style TEXT,
    size TEXT CHECK(size IN ('small', 'medium', 'large')),
    placement TEXT,
    preferred_date TEXT,
    description TEXT,
    budget INTEGER,
    reference_images TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL CHECK(status IN ('new', 'reviewed', 'matched', 'deposit_paid', 'confirmed', 'completed', 'cancelled')) DEFAULT 'new',
    deposit_amount INTEGER,
    total_price INTEGER,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    booking_id TEXT,
    artist_id TEXT NOT NULL,
    customer_id TEXT,
    artistry INTEGER,
    professionalism INTEGER,
    cleanliness INTEGER,
    communication INTEGER,
    value INTEGER,
    comment TEXT,
    photo_url TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    submitted_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS commissions (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    rate DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'paid')) DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text),
    paid_at TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS content_pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_description TEXT,
    body TEXT,
    page_type TEXT NOT NULL CHECK(page_type IN ('location', 'service', 'style', 'blog', 'support', 'general')),
    schema_json TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP::text)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status)`,
  `CREATE INDEX IF NOT EXISTS idx_artists_studio ON artists(studio_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_artist ON bookings(artist_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_artist ON reviews(artist_id)`,
  `CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`,
];

// Tables in dependency-reverse order so a reset can drop cleanly.
export const ALL_TABLES: string[] = [
  'commissions',
  'reviews',
  'content_pages',
  'bookings',
  'applications',
  'portfolios',
  'artist_styles',
  'artists',
  'studios',
  'styles',
  'locations',
  'users',
];
