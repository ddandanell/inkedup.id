import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSchema } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import artistsRoutes from './routes/artists.js';
import studiosRoutes from './routes/studios.js';
import sitemapRoutes from './routes/sitemap.js';
import bookingsRoutes from './routes/bookings.js';
import applicationsRoutes from './routes/applications.js';
import reviewsRoutes from './routes/reviews.js';
import locationsRoutes from './routes/locations.js';
import contentRoutes from './routes/content.js';
import dashboardRoutes from './routes/dashboard.js';
import statsRoutes from './routes/stats.js';
import pricingRoutes from './routes/pricing.js';
import adminPricingRoutes from './routes/adminPricing.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);

// Local dev auto-creates the schema on boot. On Vercel the schema is provisioned
// by the migration/seed step, so functions stay DDL-free on the hot path.
if (!isVercel) {
  initSchema().catch((err) => console.error('Schema init failed:', err));
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://192.168.86.36:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server (no Origin header) and configured origins.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
if (!isVercel) app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sitemap.xml', sitemapRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/studios', studiosRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/admin/pricing', adminPricingRoutes);

app.use(errorHandler);

export default app;
