import { Router } from 'express';
import { db } from '../db.js';
import type { DashboardStats } from '../types.js';

const router = Router();

/**
 * Public, unauthenticated aggregate stats used by the marketing site's trust
 * bars (Home, How It Works). Returns only safe aggregate counts — admin-only
 * figures (commissions, pending applications) are intentionally zeroed so they
 * are not exposed publicly.
 */
router.get('/', (_req, res, next) => {
  try {
    const totalArtists = (db.prepare("SELECT COUNT(*) as c FROM artists WHERE status = 'active'").get() as { c: number }).c;
    const totalBookings = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as { c: number }).c;
    const pendingBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('new', 'reviewed', 'matched')").get() as { c: number }).c;
    const confirmedBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('confirmed', 'deposit_paid')").get() as { c: number }).c;
    const completedBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'").get() as { c: number }).c;

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
