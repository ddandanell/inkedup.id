import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateId, generateReference } from '../utils/id.js';
import { parseJson } from '../utils/dbHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { Booking } from '../types.js';

const router = Router();

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    reference: row.reference as string | undefined,
    artist_id: row.artist_id as string | undefined,
    artist_name: row.artist_name as string | undefined,
    customer_id: row.customer_id as string | undefined,
    customer_name: row.customer_name as string,
    customer_email: row.customer_email as string,
    customer_whatsapp: row.customer_whatsapp as string,
    customer_location: row.customer_location as string,
    service_type: row.service_type as string | undefined,
    tattoo_style: row.tattoo_style as string | undefined,
    size: row.size as Booking['size'],
    placement: row.placement as string | undefined,
    preferred_date: row.preferred_date as string | undefined,
    description: row.description as string | undefined,
    budget: row.budget == null ? undefined : Number(row.budget),
    reference_images: parseJson<string[]>(row.reference_images, []),
    status: row.status as Booking['status'],
    deposit_amount: row.deposit_amount == null ? undefined : Number(row.deposit_amount),
    total_price: row.total_price == null ? undefined : Number(row.total_price),
    notes: (row.notes as string) || '',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(rows.map(rowToBooking));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body as Partial<Booking>;
    const id = generateId('booking');
    const reference = generateReference();
    await query(
      `INSERT INTO bookings (
        id, reference, artist_id, artist_name, customer_id, customer_name, customer_email, customer_whatsapp,
        customer_location, service_type, tattoo_style, size, placement, preferred_date, description,
        budget, reference_images, status, deposit_amount, total_price, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        id,
        reference,
        body.artist_id || null,
        body.artist_name || null,
        body.customer_id || null,
        body.customer_name || '',
        body.customer_email || '',
        body.customer_whatsapp || '',
        body.customer_location || '',
        body.service_type || null,
        body.tattoo_style || null,
        body.size || null,
        body.placement || null,
        body.preferred_date || null,
        body.description || null,
        body.budget || null,
        JSON.stringify(body.reference_images || []),
        'new',
        body.deposit_amount || null,
        body.total_price || null,
        body.notes || '',
      ]
    );
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    res.status(201).json(rowToBooking(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { rows: existingRows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    const body = req.body as Partial<Booking>;
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      setClauses.push(`${key} = $${i++}`);
      values.push(key === 'reference_images' ? JSON.stringify(value) : value);
    }
    if (setClauses.length === 0) {
      res.json(rowToBooking(existing));
      return;
    }
    values.push(req.params.id);
    await query(
      `UPDATE bookings SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP::text WHERE id = $${i}`,
      values
    );
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    res.json(rowToBooking(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/assign-artist', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { artist_id, artist_name } = req.body;
    await query('UPDATE bookings SET artist_id = $1, artist_name = $2, status = $3 WHERE id = $4', [
      artist_id || null,
      artist_name || null,
      'matched',
      req.params.id,
    ]);
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    res.json(rowToBooking(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/status', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { status, notes } = req.body as { status: Booking['status']; notes?: string };
    const validStatuses = ['new', 'reviewed', 'matched', 'deposit_paid', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    await query(
      'UPDATE bookings SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP::text WHERE id = $3',
      [status, notes || null, req.params.id]
    );
    if (status === 'deposit_paid' || status === 'confirmed' || status === 'completed') {
      const { rows: bRows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      const booking = rowToBooking(bRows[0]);
      const total = booking.total_price || booking.budget || 0;
      const rate = 0.10;
      const commissionAmount = Math.round(total * rate);
      const { rows: existingCommission } = await query('SELECT id FROM commissions WHERE booking_id = $1', [
        booking.id,
      ]);
      if (existingCommission.length === 0 && commissionAmount > 0) {
        await query('INSERT INTO commissions (id, booking_id, amount, rate, status) VALUES ($1, $2, $3, $4, $5)', [
          generateId('commission'),
          booking.id,
          commissionAmount,
          rate,
          status === 'completed' ? 'paid' : 'pending',
        ]);
      }
    }
    const { rows } = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    res.json(rowToBooking(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    await query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
