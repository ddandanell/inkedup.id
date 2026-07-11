import { Router } from 'express';
import { query } from '../db.js';
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
    artistry: row.artistry == null ? undefined : Number(row.artistry),
    professionalism: row.professionalism == null ? undefined : Number(row.professionalism),
    cleanliness: row.cleanliness == null ? undefined : Number(row.cleanliness),
    communication: row.communication == null ? undefined : Number(row.communication),
    value: row.value == null ? undefined : Number(row.value),
    comment: row.comment as string | undefined,
    photo_url: row.photo_url as string | undefined,
    is_published: Number(row.is_published) || 0,
    submitted_at: row.submitted_at as string,
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM reviews WHERE is_published = 1 ORDER BY submitted_at DESC');
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.get('/artist/:artistId', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT * FROM reviews WHERE artist_id = $1 AND is_published = 1 ORDER BY submitted_at DESC',
      [req.params.artistId]
    );
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.get('/all', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM reviews ORDER BY submitted_at DESC');
    res.json(rows.map(rowToReview));
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const body = req.body as Partial<Review>;
    const customerId = req.user!.id;

    if (!body.artist_id) {
      res.status(400).json({ error: 'artist_id is required' });
      return;
    }

    // A review must be tied to a real, completed booking owned by this customer
    // for this artist. This stops anonymous / self-published 5.0 inflation.
    let booking: Record<string, unknown> | undefined;
    if (body.booking_id) {
      const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [body.booking_id]);
      booking = rows[0];
    }
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
    await query(
      'INSERT INTO reviews (id, booking_id, artist_id, customer_id, artistry, professionalism, cleanliness, communication, value, comment, photo_url, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [
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
        0, // always unpublished until an admin moderates via PATCH /:id/moderate
      ]
    );
    const { rows } = await query('SELECT * FROM reviews WHERE id = $1', [id]);
    res.status(201).json(rowToReview(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/moderate', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { is_published } = req.body as { is_published: boolean };
    await query('UPDATE reviews SET is_published = $1 WHERE id = $2', [is_published ? 1 : 0, req.params.id]);
    const { rows } = await query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    await updateArtistRating(rows[0].artist_id as string);
    res.json(rowToReview(rows[0]));
  } catch (err) {
    next(err);
  }
});

async function updateArtistRating(artistId: string): Promise<void> {
  const { rows } = await query<{ avg: string | number | null; count: string | number }>(
    'SELECT AVG((artistry + professionalism + cleanliness + communication + value) / 5.0) AS avg, COUNT(*)::int AS count FROM reviews WHERE artist_id = $1 AND is_published = 1',
    [artistId]
  );
  const result = rows[0];
  if (!result) return;
  const avg = result.avg == null ? 0 : Number(result.avg);
  const count = Number(result.count) || 0;
  const rating = avg ? Math.round(avg * 10) / 10 : 0;
  await query('UPDATE artists SET rating = $1, review_count = $2 WHERE id = $3', [rating, count, artistId]);
}

export default router;
