import { Router } from 'express';
import { db } from '../db.js';
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
    budget: row.budget as number | undefined,
    reference_images: parseJson<string[]>(row.reference_images, []),
    status: row.status as Booking['status'],
    deposit_amount: row.deposit_amount as number | undefined,
    total_price: row.total_price as number | undefined,
    notes: (row.notes as string) || '',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

router.get('/', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all() as Record<string, unknown>[];
    res.json(rows.map(rowToBooking));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, requireRole('admin'), (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const body = req.body as Partial<Booking>;
    const id = generateId('booking');
    const reference = generateReference();
    db.prepare(
      `INSERT INTO bookings (
        id, reference, artist_id, artist_name, customer_id, customer_name, customer_email, customer_whatsapp,
        customer_location, service_type, tattoo_style, size, placement, preferred_date, description,
        budget, reference_images, status, deposit_amount, total_price, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
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
      body.notes || ''
    );
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown>;
    res.status(201).json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    const body = req.body as Partial<Booking>;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      if (key === 'reference_images') {
        fields.push('reference_images = ?');
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) {
      res.json(rowToBooking(existing));
      return;
    }
    values.push(req.params.id);
    db.prepare(`UPDATE bookings SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/assign-artist', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const { artist_id, artist_name } = req.body;
    db.prepare('UPDATE bookings SET artist_id = ?, artist_name = ?, status = ? WHERE id = ?').run(
      artist_id || null,
      artist_name || null,
      'matched',
      req.params.id
    );
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/status', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    const { status, notes } = req.body as { status: Booking['status']; notes?: string };
    const validStatuses = ['new', 'reviewed', 'matched', 'deposit_paid', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    db.prepare('UPDATE bookings SET status = ?, notes = coalesce(?, notes), updated_at = datetime(\'now\') WHERE id = ?').run(
      status,
      notes || null,
      req.params.id
    );
    if (status === 'deposit_paid' || status === 'confirmed' || status === 'completed') {
      const booking = rowToBooking(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>);
      const total = booking.total_price || booking.budget || 0;
      const rate = 0.10;
      const commissionAmount = Math.round(total * rate);
      const existingCommission = db.prepare('SELECT id FROM commissions WHERE booking_id = ?').get(booking.id);
      if (!existingCommission && commissionAmount > 0) {
        db.prepare('INSERT INTO commissions (id, booking_id, amount, rate, status) VALUES (?, ?, ?, ?, ?)').run(
          generateId('commission'),
          booking.id,
          commissionAmount,
          rate,
          status === 'completed' ? 'paid' : 'pending'
        );
      }
    }
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as Record<string, unknown>;
    res.json(rowToBooking(row));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res, next) => {
  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
