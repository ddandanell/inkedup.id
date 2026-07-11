import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Users,
  Percent,
  TrendingUp,
  TrendingDown,
  Building2,
  Download,
  Send,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import store from '@/data/store';
import type { BookingLead, DashboardStats, StudioApplication } from '@/data/types';

// Mock monthly revenue data (IDR)
const monthlyRevenueData = [
  { month: 'Jan', revenue: 32000000 },
  { month: 'Feb', revenue: 41000000 },
  { month: 'Mar', revenue: 38000000 },
  { month: 'Apr', revenue: 52000000 },
  { month: 'May', revenue: 61000000 },
  { month: 'Jun', revenue: 58000000 },
  { month: 'Jul', revenue: 72000000 },
  { month: 'Aug', revenue: 81000000 },
  { month: 'Sep', revenue: 69000000 },
  { month: 'Oct', revenue: 85000000 },
  { month: 'Nov', revenue: 92000000 },
  { month: 'Dec', revenue: 246800000 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const COLORS = {
  pending: '#C69B3C',
  confirmed: '#1A6B5E',
  completed: '#0B1F3F',
  cancelled: '#D4796B',
};

interface ActivityItem {
  id: string;
  type: 'booking' | 'application' | 'payment' | 'review';
  message: string;
  time: string;
}

function getStatusCounts(bookings: BookingLead[]) {
  const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  bookings.forEach((b) => {
    if (b.status === 'new' || b.status === 'reviewed' || b.status === 'matched') counts.pending++;
    else if (b.status === 'confirmed' || b.status === 'deposit_paid') counts.confirmed++;
    else if (b.status === 'completed') counts.completed++;
    else if (b.status === 'cancelled') counts.cancelled++;
  });
  return counts;
}

function generateActivities(bookings: BookingLead[]): ActivityItem[] {
  const activities: ActivityItem[] = [];
  bookings.slice(0, 6).forEach((b, i) => {
    const types: ActivityItem['type'][] = ['booking', 'application', 'payment', 'review'];
    const messages = [
      `New booking from ${b.customerName} — ${b.tattooStyle}`,
      `Booking ${b.status === 'confirmed' ? 'confirmed' : 'updated'}: ${b.customerName}`,
      `Payment received: ${store.formatIDR(b.totalPrice || b.budget || 0)} from ${b.customerName}`,
      `Review submitted for booking #${b.id.slice(-4)}`,
    ];
    const times = ['2 min ago', '15 min ago', '1 hour ago', '2 hours ago', '3 hours ago', '5 hours ago'];
    activities.push({
      id: `activity-${i}`,
      type: types[i % 4],
      message: messages[i % 4],
      time: times[i] || '1 day ago',
    });
  });
  return activities;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArtists: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalCommissions: 0,
    pendingStudioApplications: 0,
  });
  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [applications, setApplications] = useState<StudioApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    Promise.all([
      store.getStats(),
      store.getBookingLeads(),
      store.getStudioApplications(),
    ])
      .then(([statsData, bookingsData, applicationsData]) => {
        if (cancelled) return;
        setStats(statsData);
        setBookings(bookingsData);
        setApplications(applicationsData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => getStatusCounts(bookings), [bookings]);
  const donutData = useMemo(() => [
    { name: 'Pending', value: statusCounts.pending, color: COLORS.pending },
    { name: 'Confirmed', value: statusCounts.confirmed, color: COLORS.confirmed },
    { name: 'Completed', value: statusCounts.completed, color: COLORS.completed },
    { name: 'Cancelled', value: statusCounts.cancelled, color: COLORS.cancelled },
  ], [statusCounts]);

  const totalBookings = bookings.length;
  const activities = useMemo(() => generateActivities(bookings), [bookings]);
  const pendingApps = applications.filter((a: typeof applications[0]) => a.status === 'pending');

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: store.formatIDR(246800000),
      change: '+18%',
      up: true,
      icon: DollarSign,
    },
    {
      label: 'Total Bookings',
      value: String(stats.totalBookings),
      change: '+24%',
      up: true,
      icon: Calendar,
    },
    {
      label: 'Active Artists',
      value: String(stats.totalArtists),
      change: `+${stats.pendingStudioApplications} new`,
      up: true,
      icon: Users,
    },
    {
      label: 'Commission (10%)',
      value: store.formatIDR(stats.totalCommissions),
      change: '+18%',
      up: true,
      icon: Percent,
    },
  ];

  const activityTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'booking': return 'bg-bali-teal';
      case 'application': return 'bg-champagne-gold';
      case 'payment': return 'bg-[#3B82F6]';
      case 'review': return 'bg-[#8B5CF6]';
    }
  };

  return (
    <AdminLayout>
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display text-[24px] font-medium text-pure-white">Dashboard</h1>
          <p className="font-body text-[13px] text-slate-gray mt-1">
            {error ? `Error: ${error}` : isLoading ? 'Loading dashboard...' : 'Platform overview and key metrics.'}
          </p>
        </div>
        <div className="font-body text-[13px] text-slate-gray bg-white/[0.06] px-3 py-[6px] rounded-md inline-flex items-center gap-2">
          Last 30 days
          <TrendingDown size={14} className="rotate-0" />
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
          >
            <div className="flex items-center gap-2">
              <card.icon size={16} className="text-slate-gray" />
              <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em]">
                {card.label}
              </span>
            </div>
            <p className="font-mono text-[clamp(24px,2vw,30px)] text-pure-white mt-2">
              {card.value}
            </p>
            <div className={`flex items-center gap-1 mt-1 font-body text-[12px] ${card.up ? 'text-green-400/80' : 'text-coral-rose'}`}>
              {card.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {card.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
        >
          <h3 className="font-body text-[14px] font-medium text-pure-white">Revenue Over Time</h3>
          <p className="font-body text-[12px] text-slate-gray mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C69B3C" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#C69B3C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => store.formatIDR(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1F3F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontFamily: 'DM Sans',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [store.formatIDR(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C69B3C"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bookings by Status Donut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
        >
          <h3 className="font-body text-[14px] font-medium text-pure-white">Bookings by Status</h3>
          <p className="font-body text-[12px] text-slate-gray mb-4">Current distribution</p>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1F3F',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontFamily: 'DM Sans',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-[24px] text-pure-white">{totalBookings}</span>
              <span className="font-body text-[11px] text-slate-gray">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="font-body text-[12px] text-slate-gray">{d.name}</span>
                <span className="font-body text-[12px] text-pure-white">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
        >
          <h3 className="font-body text-[14px] font-medium text-pure-white mb-4">Recent Activity</h3>
          <div className="max-h-[320px] overflow-y-auto space-y-0">
            {activities.length === 0 ? (
              <p className="font-body text-[13px] text-slate-gray py-4 text-center">No recent activity</p>
            ) : (
              activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 py-[10px] border-b border-white/[0.04] last:border-0"
                >
                  <span className={`w-[10px] h-[10px] rounded-full mt-1 flex-shrink-0 ${activityTypeIcon(a.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[13px] text-pure-white/80 truncate">{a.message}</p>
                  </div>
                  <span className="font-body text-[11px] text-slate-gray flex-shrink-0">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
        >
          <h3 className="font-body text-[14px] font-medium text-pure-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/admin/applications"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-md font-body text-[13px] text-champagne-gold hover:bg-white/[0.04] transition-colors"
            >
              <Building2 size={16} />
              <span className="flex-1 text-left">Review Studio Applications ({pendingApps.length})</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-md font-body text-[13px] text-bali-teal hover:bg-white/[0.04] transition-colors"
            >
              <Calendar size={16} />
              <span className="flex-1 text-left">View New Bookings ({stats.pendingBookings})</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/admin/commissions"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-md font-body text-[13px] text-slate-gray hover:bg-white/[0.04] transition-colors"
            >
              <Download size={16} />
              <span className="flex-1 text-left">Export Commission Report</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => alert('Announcement feature coming soon')}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-md font-body text-[13px] text-slate-gray hover:bg-white/[0.04] transition-colors text-left"
            >
              <Send size={16} />
              <span className="flex-1">Send Announcement</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
    </AdminLayout>
  );
}
