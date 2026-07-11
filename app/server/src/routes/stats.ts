import { Router } from 'express';
import { query } from '../db.js';
import type { DashboardStats } from '../types.js';

const router = Router();

async function count(sql: string): Promise<number> {
  const { rows } = await query<{ c: number | string }>(sql);
  return Number(rows[0]?.c) || 0;
}

/**
 * Public, unauthenticated aggregate stats used by the marketing site's trust
 * bars (Home, How It Works). Returns only safe aggregate counts — admin-only
 * figures (commissions, pending applications) are intentionally zeroed so they
 * are not exposed publicly.
 */
router.get('/', async (_req, res, next) => {
  try {
    const [totalArtists, totalBookings, pendingBookings, confirmedBookings, completedBookings] = await Promise.all([
      count("SELECT COUNT(*)::int AS c FROM artists WHERE status = 'active'"),
      count('SELECT COUNT(*)::int AS c FROM bookings'),
      count("SELECT COUNT(*)::int AS c FROM bookings WHERE status IN ('new', 'reviewed', 'matched')"),
      count("SELECT COUNT(*)::int AS c FROM bookings WHERE status IN ('confirmed', 'deposit_paid')"),
      count("SELECT COUNT(*)::int AS c FROM bookings WHERE status = 'completed'"),
    ]);

    const stats: DashboardStats = {
      totalArtists,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalCommissions: 0,
      pendingStudioApplications: 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
