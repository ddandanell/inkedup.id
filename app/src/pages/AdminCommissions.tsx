import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import store from '@/data/store';
import type { BookingLead, Artist } from '@/data/types';

const PAGE_SIZE = 10;

// Mock monthly commission data for the bar chart (IDR)
const monthlyCommissionData = [
  { month: 'Jan', commission: 3200000 },
  { month: 'Feb', commission: 4100000 },
  { month: 'Mar', commission: 3800000 },
  { month: 'Apr', commission: 5200000 },
  { month: 'May', commission: 6100000 },
  { month: 'Jun', commission: 5800000 },
  { month: 'Jul', commission: 7200000 },
  { month: 'Aug', commission: 8100000 },
  { month: 'Sep', commission: 6900000 },
  { month: 'Oct', commission: 8500000 },
  { month: 'Nov', commission: 9200000 },
  { month: 'Dec', commission: 24680000 },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  collected: { label: 'Collected', color: 'text-bali-teal', bg: 'bg-bali-teal/15' },
  pending: { label: 'Pending', color: 'text-champagne-gold', bg: 'bg-champagne-gold/15' },
  refunded: { label: 'Refunded', color: 'text-coral-rose', bg: 'bg-coral-rose/15' },
};

function getCommissionStatus(b: BookingLead): { status: string; commission: number } {
  const commission = Math.round((b.totalPrice || b.budget || 0) * 0.1);
  if (b.status === 'cancelled') return { status: 'refunded', commission };
  if (b.status === 'deposit_paid' || b.status === 'confirmed' || b.status === 'completed') return { status: 'collected', commission };
  return { status: 'pending', commission };
}

export default function AdminCommissions() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [artistFilter, setArtistFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      store.getBookingLeads(),
      store.getActiveArtists(),
    ])
      .then(([loadedBookings, loadedArtists]) => {
        if (cancelled) return;
        setBookings(loadedBookings);
        setArtists(loadedArtists);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load commissions data');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const commissionData = useMemo(() => {
    return bookings.map((b) => ({
      ...b,
      commission: getCommissionStatus(b),
    }));
  }, [bookings]);

  const summary = useMemo(() => {
    const totalCommission = commissionData.reduce((sum, b) => sum + b.commission.commission, 0);
    const thisMonth = commissionData
      .filter((b) => {
        const d = new Date(b.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.commission.commission, 0);
    const pending = commissionData
      .filter((b) => b.commission.status === 'pending')
      .reduce((sum, b) => sum + b.commission.commission, 0);
    const fromBookings = commissionData.length;
    const pendingBookings = commissionData.filter((b) => b.commission.status === 'pending').length;
    return { totalCommission, thisMonth, pending, fromBookings, pendingBookings };
  }, [commissionData]);

  const filteredData = useMemo(() => {
    let result = [...commissionData];
    if (statusFilter !== 'All') {
      result = result.filter((b) => b.commission.status === statusFilter.toLowerCase());
    }
    if (artistFilter !== 'All') {
      result = result.filter((b) => b.artistId === artistFilter || b.artistName === artists.find((a) => a.id === artistFilter)?.displayName);
    }
    return result;
  }, [commissionData, statusFilter, artistFilter, artists]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginated = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = (type: 'month' | 'full' | 'payout') => {
    let rows: string[] = [];
    if (type === 'month') {
      const now = new Date();
      const monthData = bookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      rows = monthData.map((b) => {
        const comm = Math.round((b.totalPrice || b.budget || 0) * 0.1);
        return [b.id, b.customerName, b.artistName || 'N/A', b.totalPrice || b.budget || 0, comm, b.status].join(',');
      });
    } else if (type === 'full') {
      rows = bookings.map((b) => {
        const comm = Math.round((b.totalPrice || b.budget || 0) * 0.1);
        return [b.id, b.customerName, b.artistName || 'N/A', b.totalPrice || b.budget || 0, comm, b.status, b.createdAt].join(',');
      });
    } else {
      const artistMap = new Map<string, { name: string; total: number; commission: number }>();
      bookings.forEach((b) => {
        const name = b.artistName || 'Unassigned';
        const existing = artistMap.get(name) || { name, total: 0, commission: 0 };
        const comm = Math.round((b.totalPrice || b.budget || 0) * 0.1);
        artistMap.set(name, { name, total: existing.total + (b.totalPrice || b.budget || 0), commission: existing.commission + comm });
      });
      rows = Array.from(artistMap.values()).map((a) => [a.name, a.total, a.commission].join(','));
    }
    const headers = type === 'payout'
      ? 'Artist,Total Bookings,Commission'
      : 'Booking ID,Client,Artist,Total Value,Commission,Status,Date';
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${type}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <h1 className="font-display text-[24px] font-medium text-pure-white">Commissions</h1>
        <p className="font-body text-[13px] text-slate-gray mt-1">10% booking fee tracking and payouts.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          {
            label: 'Total Commission (All Time)',
            value: store.formatIDR(summary.totalCommission),
            sub: `From ${summary.fromBookings} bookings`,
          },
          {
            label: 'This Month',
            value: store.formatIDR(summary.thisMonth),
            sub: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          },
          {
            label: 'Pending Collection',
            value: store.formatIDR(summary.pending),
            sub: `From ${summary.pendingBookings} unconfirmed bookings`,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
          >
            <p className="font-body text-[12px] font-medium text-slate-gray">{card.label}</p>
            <p className="font-mono text-[clamp(24px,2vw,32px)] text-champagne-gold mt-2">{card.value}</p>
            <p className="font-body text-[11px] text-white/40 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Commission Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6"
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
          >
            {['All', 'Collected', 'Pending', 'Refunded'].map((s) => (
              <option key={s} value={s} className="bg-[#0A1929]">{s}</option>
            ))}
          </select>
          <select
            value={artistFilter}
            onChange={(e) => { setArtistFilter(e.target.value); setPage(1); }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
          >
            <option value="All" className="bg-[#0A1929]">All Artists</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#0A1929]">{a.displayName}</option>
            ))}
          </select>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
            Loading commission data…
          </div>
        )}
        {error && !loading && (
          <div className="px-4 py-10 text-center font-body text-[13px] text-coral-rose">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[10px] overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[120px_120px_1fr_1fr_100px_80px_100px_120px] gap-4 px-4 py-3 bg-white/[0.02] font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-gray">
            <span>Booking ID</span>
            <span>Date</span>
            <span>Client</span>
            <span>Artist</span>
            <span className="text-right">Total</span>
            <span className="text-right">10% Fee</span>
            <span className="text-center">Status</span>
            <span className="text-right">Collected Date</span>
          </div>

          {/* Table Rows */}
          {paginated.length === 0 ? (
            <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
              No commission data found.
            </div>
          ) : (
            paginated.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-1 lg:grid-cols-[120px_120px_1fr_1fr_100px_80px_100px_120px] gap-2 lg:gap-4 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-[12px] text-slate-gray">#{b.id.slice(-4)}</span>
                <span className="font-body text-[13px] text-slate-gray">
                  {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-body text-[14px] font-medium text-pure-white">{b.customerName}</span>
                <span className="font-body text-[13px] text-pure-white">{b.artistName || '—'}</span>
                <span className="font-mono text-[13px] text-pure-white text-right">{store.formatIDR(b.totalPrice || b.budget || 0)}</span>
                <span className={`font-mono text-[13px] text-right ${b.commission.status === 'collected' ? 'text-champagne-gold' : 'text-slate-gray'}`}>
                  {store.formatIDR(b.commission.commission)}
                </span>
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase ${statusConfig[b.commission.status].bg} ${statusConfig[b.commission.status].color}`}>
                    {statusConfig[b.commission.status].label}
                  </span>
                </div>
                <span className="font-body text-[12px] text-slate-gray text-right">
                  {b.commission.status === 'collected'
                    ? new Date(b.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            ))
          )}
        </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="font-body text-[12px] text-slate-gray">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-slate-gray hover:text-pure-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-body text-[12px] text-slate-gray">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded text-slate-gray hover:text-pure-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Monthly Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5 mt-6"
      >
        <h3 className="font-body text-[14px] font-medium text-pure-white mb-4">Monthly Commission Breakdown</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyCommissionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
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
              formatter={(value: number) => [store.formatIDR(value), 'Commission']}
            />
            <Bar
              dataKey="commission"
              fill="#C69B3C"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5 mt-6"
      >
        <h3 className="font-body text-[14px] font-medium text-pure-white mb-4">Export Reports</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportCSV('month')}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-[13px] font-medium border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all"
          >
            <Download size={14} />
            This Month's Commission
          </button>
          <button
            onClick={() => exportCSV('full')}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white hover:bg-white/[0.04] transition-colors"
          >
            <Download size={14} />
            Full Commission History
          </button>
          <button
            onClick={() => exportCSV('payout')}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white hover:bg-white/[0.04] transition-colors"
          >
            <Download size={14} />
            Artist Payout Summary
          </button>
        </div>
      </motion.div>
    </div>
    </AdminLayout>
  );
}
