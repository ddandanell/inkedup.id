import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { DashboardStats } from '../types.js';

const router = Router();

async function count(sql: string, params: unknown[] = []): Promise<number> {
  const { rows } = await query<{ c: number | string }>(sql, params);
  return Number(rows[0]?.c) || 0;
}

router.get('/', authMiddleware, requireRole('admin'), async (_req, res, next) => {
  try {
    const [totalArtists, totalBookings, pendingBookings, confirmedBookings, completedBookings, pendingStudioApplications, commissionsRow] =
      await Promise.all([
        count("SELECT COUNT(*)::int AS c FROM artists WHERE status = 'active'"),
        count('SELECT COUNT(*)::int AS c FROM bookings'),
        count("SELECT COUNT(*)::int AS c FROM bookings WHERE status IN ('new', 'reviewed', 'matched')"),
        count("SELECT COUNT(*)::int AS c FROM bookings WHERE status IN ('confirmed', 'deposit_paid')"),
        count("SELECT COUNT(*)::int AS c FROM bookings WHERE status = 'completed'"),
        count("SELECT COUNT(*)::int AS c FROM applications WHERE status = 'pending'"),
        query<{ s: number | string }>('SELECT COALESCE(SUM(amount), 0)::int AS s FROM commissions'),
      ]);

    const totalCommissions = Number(commissionsRow.rows[0]?.s) || 0;

    const stats: DashboardStats = {
      totalArtists,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalCommissions,
      pendingStudioApplications,
    };

    const [recentBookings, recentApplications] = await Promise.all([
      query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5'),
      query('SELECT * FROM applications ORDER BY submitted_at DESC LIMIT 5'),
    ]);

    res.json({ stats, recentBookings: recentBookings.rows, recentApplications: recentApplications.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
