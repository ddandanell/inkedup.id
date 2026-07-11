import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  UserPlus,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Ban,
  Download,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import store from '@/data/store';
import type { BookingLead, Artist } from '@/data/types';

const PAGE_SIZE = 10;

const statusTabs = ['All', 'New', 'In Progress', 'Confirmed', 'Completed', 'Cancelled'];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-champagne-gold', bg: 'bg-champagne-gold/10' },
  reviewed: { label: 'In Progress', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
  matched: { label: 'In Progress', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
  deposit_paid: { label: 'Confirmed', color: 'text-bali-teal', bg: 'bg-bali-teal/10' },
  confirmed: { label: 'Confirmed', color: 'text-bali-teal', bg: 'bg-bali-teal/10' },
  completed: { label: 'Completed', color: 'text-midnight-navy', bg: 'bg-midnight-navy/20' },
  cancelled: { label: 'Cancelled', color: 'text-coral-rose', bg: 'bg-coral-rose/10' },
};

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.new;
  return (
    <span className={`px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<BookingLead | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [assignArtistId, setAssignArtistId] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [fetchedBookings, fetchedArtists] = await Promise.all([
          store.getBookingLeads(),
          store.getActiveArtists(),
        ]);
        if (!cancelled) {
          setBookings(fetchedBookings);
          setArtists(fetchedArtists);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bookings');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const newLeads = bookings.filter((b) => b.status === 'new').length;
    const inProgress = bookings.filter((b) => b.status === 'reviewed' || b.status === 'matched').length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'deposit_paid').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    return { newLeads, inProgress, confirmed, completed };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.artistName?.toLowerCase().includes(q) ||
          b.tattooStyle.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }
    if (statusTab !== 'All') {
      const tab = statusTab.toLowerCase();
      if (tab === 'in progress') {
        result = result.filter((b) => b.status === 'reviewed' || b.status === 'matched');
      } else {
        result = result.filter((b) => {
          if (tab === 'confirmed') return b.status === 'confirmed' || b.status === 'deposit_paid';
          return b.status === tab;
        });
      }
    }
    if (dateFilter !== 'All Time') {
      const now = new Date();
      result = result.filter((b) => {
        const d = new Date(b.createdAt);
        if (dateFilter === 'Today') return d.toDateString() === now.toDateString();
        if (dateFilter === 'This Week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return d >= weekAgo;
        }
        if (dateFilter === 'This Month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    return result;
  }, [bookings, search, statusTab, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const paginated = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refreshBookings = async (bookingId?: string) => {
    try {
      const [updatedBookings, updatedBooking] = await Promise.all([
        store.getBookingLeads(),
        bookingId ? store.getBookingById(bookingId) : Promise.resolve(undefined),
      ]);
      setBookings(updatedBookings);
      if (bookingId) {
        setSelectedBooking(updatedBooking || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh bookings');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;
    try {
      setError(null);
      await store.updateBookingStatus(selectedBooking.id, newStatus as BookingLead['status'], statusNote);
      await refreshBookings(selectedBooking.id);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleAssignArtist = async () => {
    if (!selectedBooking || !assignArtistId) return;
    const artist = artists.find((a) => a.id === assignArtistId);
    if (!artist) return;
    try {
      setError(null);
      await store.assignBookingArtist(selectedBooking.id, artist.id, artist.displayName);
      await store.updateBookingStatus(selectedBooking.id, 'matched', `Assigned to ${artist.displayName}`);
      await refreshBookings(selectedBooking.id);
      setAssignArtistId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign artist');
    }
  };

  const exportCSV = () => {
    const rows = filteredBookings.map((b) =>
      [b.id, b.customerName, b.artistName || 'Unassigned', b.tattooStyle, b.status, b.totalPrice || b.budget || 0, Math.round((b.totalPrice || b.budget || 0) * 0.1)].join(',')
    );
    const csv = ['ID,Client,Artist,Style,Status,Total,Commission', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
  };

  const timelineSteps = [
    { key: 'new', label: 'Submitted', icon: Check },
    { key: 'reviewed', label: 'Under Review', icon: Clock },
    { key: 'matched', label: 'Artist Assigned', icon: UserPlus },
    { key: 'deposit_paid', label: 'Deposit Paid (10%)', icon: CheckCircle2 },
    { key: 'confirmed', label: 'Client Confirmed', icon: CheckCircle2 },
    { key: 'completed', label: 'Session Completed', icon: CheckCircle2 },
  ];

  return (
    <AdminLayout>
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <h1 className="font-display text-[24px] font-medium text-pure-white">Booking Leads</h1>
        <p className="font-body text-[13px] text-slate-gray mt-1">All customer booking requests.</p>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 mt-6 mb-5 bg-white/[0.02] border border-white/[0.06] rounded-[10px] overflow-hidden">
        {[
          { label: 'New Leads', value: stats.newLeads },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Confirmed', value: stats.confirmed },
          { label: 'Completed (This Month)', value: stats.completed },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`px-5 py-4 ${i > 0 ? 'lg:border-l border-white/[0.06]' : ''} ${i % 2 === 1 ? 'border-l border-white/[0.06] lg:border-l' : ''}`}
          >
            <p className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.06em]">{stat.label}</p>
            <p className="font-mono text-[20px] text-pure-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-coral-rose/10 border border-coral-rose/20 rounded-md font-body text-[13px] text-coral-rose">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
          <input
            type="text"
            placeholder="Search by client, artist, or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 font-body text-[13px] text-pure-white placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold/50"
          />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
        >
          {['All Time', 'Today', 'This Week', 'This Month'].map((d) => (
            <option key={d} value={d} className="bg-[#0A1929]">{d}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white hover:bg-white/[0.04] transition-colors ml-auto"
        >
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded-md font-body text-[13px] whitespace-nowrap transition-colors ${
              statusTab === tab
                ? 'bg-white/[0.06] text-pure-white'
                : 'text-slate-gray hover:text-pure-white hover:bg-white/[0.02]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Booking Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[10px] overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid lg:grid-cols-[100px_120px_1fr_1fr_120px_100px_120px_80px_100px] gap-4 px-4 py-3 bg-white/[0.02] font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-gray">
          <span>ID</span>
          <span>Date</span>
          <span>Client</span>
          <span>Artist</span>
          <span>Style</span>
          <span>Location</span>
          <span>Status</span>
          <span className="text-right">10% Fee</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Table Rows */}
        {isLoading ? (
          <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
            Loading bookings...
          </div>
        ) : paginated.length === 0 ? (
          <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
            No bookings found for this period.
          </div>
        ) : (
          paginated.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="grid grid-cols-1 lg:grid-cols-[100px_120px_1fr_1fr_120px_100px_120px_80px_100px] gap-2 lg:gap-4 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <span className="font-mono text-[12px] text-slate-gray">#{b.id.slice(-4)}</span>
              <span className="font-body text-[13px] text-slate-gray">
                {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div>
                <p className="font-body text-[14px] font-medium text-pure-white">{b.customerName}</p>
                <p className="font-body text-[11px] text-slate-gray">{b.customerWhatsApp}</p>
              </div>
              <span className={`font-body text-[13px] ${b.artistName ? 'text-pure-white' : 'text-coral-rose'}`}>
                {b.artistName || '— Unassigned —'}
              </span>
              <span className="font-body text-[12px]">
                <span className="px-2 py-[2px] rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[10px] font-semibold uppercase">
                  {b.tattooStyle}
                </span>
              </span>
              <span className="font-body text-[13px] text-slate-gray">{b.customerLocation}</span>
              <div>{getStatusBadge(b.status)}</div>
              <span className="font-mono text-[13px] text-champagne-gold text-right">
                {store.formatIDR(Math.round((b.totalPrice || b.budget || 0) * 0.1))}
              </span>
              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => { setSelectedBooking(b); }}
                  className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors"
                >
                  <UserPlus size={14} />
                </button>
                <a
                  href={`https://wa.me/${b.customerWhatsApp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-slate-gray hover:text-bali-teal hover:bg-white/[0.06] transition-colors"
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="font-body text-[12px] text-slate-gray">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}
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

      {/* Booking Detail Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-midnight-navy/70 backdrop-blur-sm z-[200]"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-[#0D1F30] border-l border-white/[0.06] z-[300] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0D1F30] border-b border-white/[0.06] p-6 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[16px] text-champagne-gold">#{selectedBooking.id.slice(-4)}</span>
                      {getStatusBadge(selectedBooking.status)}
                    </div>
                    <p className="font-body text-[12px] text-slate-gray mt-1">
                      Submitted {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedBooking.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 text-slate-gray hover:text-pure-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Client Info */}
                <div>
                  <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">Client</h4>
                  <div className="space-y-2">
                    <p className="font-body text-[14px] font-medium text-pure-white">{selectedBooking.customerName}</p>
                    <p className="font-body text-[13px] text-slate-gray">{selectedBooking.customerEmail}</p>
                    <a
                      href={`https://wa.me/${selectedBooking.customerWhatsApp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-[13px] text-bali-teal hover:underline flex items-center gap-1"
                    >
                      <MessageCircle size={14} /> {selectedBooking.customerWhatsApp}
                    </a>
                    <p className="font-body text-[13px] text-slate-gray">{selectedBooking.customerLocation}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-body text-[11px] text-slate-gray">Style</p>
                      <p className="font-body text-[13px] text-pure-white">{selectedBooking.tattooStyle}</p>
                    </div>
                    <div>
                      <p className="font-body text-[11px] text-slate-gray">Size</p>
                      <p className="font-body text-[13px] text-pure-white capitalize">{selectedBooking.size}</p>
                    </div>
                    <div>
                      <p className="font-body text-[11px] text-slate-gray">Placement</p>
                      <p className="font-body text-[13px] text-pure-white">{selectedBooking.placement}</p>
                    </div>
                    <div>
                      <p className="font-body text-[11px] text-slate-gray">Preferred Date</p>
                      <p className="font-body text-[13px] text-pure-white">{new Date(selectedBooking.preferredDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {selectedBooking.description && (
                    <div className="mt-3">
                      <p className="font-body text-[11px] text-slate-gray">Description</p>
                      <p className="font-body text-[13px] text-white/70 mt-1">{selectedBooking.description}</p>
                    </div>
                  )}
                </div>

                {/* Artist Assignment */}
                <div>
                  <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">Assigned Artist</h4>
                  {selectedBooking.artistName ? (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-bali-teal/15 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-bali-teal" />
                      </div>
                      <div>
                        <p className="font-body text-[14px] font-medium text-pure-white">{selectedBooking.artistName}</p>
                        <p className="font-body text-[11px] text-bali-teal">Assigned</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-coral-rose/15 flex items-center justify-center">
                        <AlertCircle size={18} className="text-coral-rose" />
                      </div>
                      <div>
                        <p className="font-body text-[14px] font-medium text-coral-rose">Unassigned</p>
                        <p className="font-body text-[11px] text-slate-gray">No artist assigned yet</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <select
                      value={assignArtistId}
                      onChange={(e) => setAssignArtistId(e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
                    >
                      <option value="" className="bg-[#0A1929]">Select artist...</option>
                      {artists.map((a) => (
                        <option key={a.id} value={a.id} className="bg-[#0A1929]">{a.displayName} — {a.location}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignArtist}
                      disabled={!assignArtistId}
                      className="px-4 py-2 rounded-md font-body text-[13px] font-medium bg-champagne-gold text-midnight-navy hover:shadow-gold-glow disabled:opacity-40 transition-all"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div>
                  <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">Status Timeline</h4>
                  <div className="space-y-0">
                    {timelineSteps.map((step, i) => {
                      const isCompleted = timelineSteps.findIndex((s) => s.key === selectedBooking.status) >= i ||
                        (selectedBooking.status === 'deposit_paid' && step.key === 'deposit_paid') ||
                        (selectedBooking.status === 'confirmed' && timelineSteps.findIndex((s) => s.key === 'confirmed') >= i) ||
                        selectedBooking.status === 'completed';
                      const isCurrent = step.key === selectedBooking.status;
                      return (
                        <div key={step.key} className="flex items-start gap-3 relative">
                          {i < timelineSteps.length - 1 && (
                            <div className={`absolute left-[7px] top-5 w-[2px] h-[calc(100%-10px)] ${isCompleted ? 'bg-bali-teal' : 'bg-white/[0.06]'}`} />
                          )}
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCompleted ? 'bg-bali-teal' : 'border-2 border-slate-gray'}`}>
                            {isCompleted && <step.icon size={10} className="text-pure-white" />}
                          </div>
                          <div className="pb-4">
                            <p className={`font-body text-[13px] ${isCurrent ? 'text-pure-white font-medium' : isCompleted ? 'text-pure-white/70' : 'text-slate-gray'}`}>
                              {step.label}
                            </p>
                            {isCompleted && (
                              <p className="font-body text-[11px] text-slate-gray">
                                {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Commission */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-4">
                  <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-3">Commission</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-[13px] text-slate-gray">Estimated Total</span>
                    <span className="font-mono text-[14px] text-pure-white">{store.formatIDR(selectedBooking.totalPrice || selectedBooking.budget || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-[13px] text-slate-gray">10% Commission</span>
                    <span className="font-mono text-[14px] text-champagne-gold">{store.formatIDR(Math.round((selectedBooking.totalPrice || selectedBooking.budget || 0) * 0.1))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[13px] text-slate-gray">Payment Status</span>
                    <span className={`font-body text-[12px] font-semibold uppercase ${selectedBooking.status === 'deposit_paid' || selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed' ? 'text-bali-teal' : 'text-champagne-gold'}`}>
                      {selectedBooking.status === 'deposit_paid' || selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed' ? 'Collected' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">Notes</h4>
                    <p className="font-body text-[13px] text-white/70">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => { setNewStatus(''); setShowStatusModal(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-body text-[14px] font-semibold gold-shimmer text-midnight-navy hover:shadow-gold-glow transition-all"
                  >
                    Update Status →
                  </button>
                  <a
                    href={`https://wa.me/${selectedBooking.customerWhatsApp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-body text-[13px] font-medium border-[1.5px] border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-midnight-navy transition-all"
                  >
                    <MessageCircle size={16} /> Message Client on WhatsApp
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        setError(null);
                        await store.updateBookingStatus(selectedBooking.id, 'cancelled', 'Cancelled by admin');
                        await refreshBookings(selectedBooking.id);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to cancel booking');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-body text-[13px] text-coral-rose hover:bg-coral-rose/10 transition-colors"
                  >
                    <Ban size={16} /> Cancel Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-midnight-navy/70 backdrop-blur-sm z-[400]"
              onClick={() => { setShowStatusModal(false); setNewStatus(''); setStatusNote(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-[#0D1F30] border border-white/[0.06] rounded-[12px] p-6 z-[500]"
            >
              <h3 className="font-body text-[16px] font-semibold text-pure-white mb-4">
                Update Status
              </h3>
              <div className="mb-4">
                <label className="font-body text-[12px] font-medium text-slate-gray mb-1 block">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
                >
                  <option value="" className="bg-[#0A1929]">Select status...</option>
                  <option value="new" className="bg-[#0A1929]">New</option>
                  <option value="reviewed" className="bg-[#0A1929]">Reviewed</option>
                  <option value="matched" className="bg-[#0A1929]">Matched</option>
                  <option value="deposit_paid" className="bg-[#0A1929]">Deposit Paid</option>
                  <option value="confirmed" className="bg-[#0A1929]">Confirmed</option>
                  <option value="completed" className="bg-[#0A1929]">Completed</option>
                  <option value="cancelled" className="bg-[#0A1929]">Cancelled</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="font-body text-[12px] font-medium text-slate-gray mb-1 block">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add an internal note or client message..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold/50 min-h-[80px] resize-y"
                />
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setShowStatusModal(false); setNewStatus(''); setStatusNote(''); }}
                  className="px-4 py-2 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus}
                  className="px-4 py-2 rounded-md font-body text-[13px] font-medium bg-champagne-gold text-midnight-navy hover:shadow-gold-glow disabled:opacity-40 transition-all"
                >
                  Update Status
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  );
}
