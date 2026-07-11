import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { DashboardStats } from '../types.js';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), (_req, res, next) => {
  try {
    const totalArtists = (db.prepare("SELECT COUNT(*) as c FROM artists WHERE status = 'active'").get() as { c: number }).c;
    const totalBookings = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as { c: number }).c;
    const pendingBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('new', 'reviewed', 'matched')").get() as { c: number }).c;
    const confirmedBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('confirmed', 'deposit_paid')").get() as { c: number }).c;
    const completedBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'").get() as { c: number }).c;
    const pendingStudioApplications = (db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'pending'").get() as { c: number }).c;
    const totalCommissions = (db.prepare('SELECT COALESCE(SUM(amount), 0) as s FROM commissions').get() as { s: number }).s;

    const stats: DashboardStats = {
      totalArtists,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalCommissions,
      pendingStudioApplications,
    };

    const recentBookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5').all();
    const recentApplications = db.prepare('SELECT * FROM applications ORDER BY submitted_at DESC LIMIT 5').all();

    res.json({ stats, recentBookings, recentApplications });
  } catch (err) {
    next(err);
  }
});

export default router;
