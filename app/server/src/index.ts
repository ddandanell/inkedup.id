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
import bookingsRoutes from './routes/bookings.js';
import applicationsRoutes from './routes/applications.js';
import reviewsRoutes from './routes/reviews.js';
import locationsRoutes from './routes/locations.js';
import contentRoutes from './routes/content.js';
import dashboardRoutes from './routes/dashboard.js';
import statsRoutes from './routes/stats.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initSchema();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://192.168.86.36:5173')
  .split(',')
  .map((o) => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / server-to-server (no Origin header) and configured web origins.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`InkedUp API server running at http://localhost:${PORT}`);
});
