import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/id.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Review } from '../types.js';

const router = Router();

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    booking_id: row.booking_id as string | undefined,
    artist_id: row.artist_id as string,
    customer_id: row.customer_id as string | undefined,
    artistry: row.artistry as number | undefined,
    professionalism: row.professionalism as number | undefined,
    cleanliness: row.cleanliness as number | undefined,
    communication: row.communication as number | undefined,
    value: row.value as number | undefined,
    comment: row.comment as string | undefined,
    photo_url: row.photo_url as string | undefined,
    is_published: (row.is_published as number) ?? 0,
    submitted_at: row.submitted_at as string,
  };
}

router.get('/', (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM reviews WHERE is_published = 1 ORDER BY submitted_at DESC').all() as Record<string, unknown>[];
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.get('/artist/:artistId', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM reviews WHERE artist_id = ? AND is_published = 1 ORDER BY submitted_at DESC').all(req.params.artistId) as Record<string, unknown>[];
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.get('/all', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM reviews ORDER BY submitted_at DESC').all() as Record<string, unknown>[];
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Review>;
    const customerId = req.user!.id;

    if (!body.artist_id) {
      res.status(400).json({ error: 'artist_id is required' });
      return;
    }

    // A review must be tied to a real, completed booking owned by this customer
    // for this artist. This stops anonymous / self-published 5.0 inflation.
    const booking = body.booking_id
      ? (db.prepare('SELECT * FROM bookings WHERE id = ?').get(body.booking_id) as Record<string, unknown> | undefined)
      : undefined;
    if (!booking) {
      res.status(400).json({ error: 'A valid booking is required to leave a review' });
      return;
    }
    if (booking.customer_id !== customerId) {
      res.status(403).json({ error: 'You can only review your own booking' });
      return;
    }
    if (booking.artist_id !== body.artist_id) {
      res.status(400).json({ error: 'Booking does not match this artist' });
      return;
    }
    if (booking.status !== 'completed') {
      res.status(400).json({ error: 'You can review after your session is completed' });
      return;
    }

    const id = generateId('review');
    db.prepare(
      'INSERT INTO reviews (id, booking_id, artist_id, customer_id, artistry, professionalism, cleanliness, communication, value, comment, photo_url, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      booking.id,
      body.artist_id,
      customerId,
      body.artistry || null,
      body.professionalism || null,
      body.cleanliness || null,
      body.communication || null,
      body.value || null,
      body.comment || null,
      body.photo_url || null,
      0 // always unpublished until an admin moderates via PATCH /:id/moderate
    );
    const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToReview(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/moderate', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const { is_published } = req.body as { is_published: boolean };
    db.prepare('UPDATE reviews SET is_published = ? WHERE id = ?').run(is_published ? 1 : 0, req.params.id);
    const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    updateArtistRating(row.artist_id as string);
    res.json(rowToReview(row));
  } catch (err) {
    next(err);
  }
});

function updateArtistRating(artistId: string): void {
  const result = db.prepare(
    'SELECT AVG((artistry + professionalism + cleanliness + communication + value) / 5.0) as avg, COUNT(*) as count FROM reviews WHERE artist_id = ? AND is_published = 1'
  ).get(artistId) as { avg: number | null; count: number } | undefined;
  if (!result) return;
  const rating = result.avg ? Math.round(result.avg * 10) / 10 : 0;
  db.prepare('UPDATE artists SET rating = ?, review_count = ? WHERE id = ?').run(rating, result.count, artistId);
}

export default router;
