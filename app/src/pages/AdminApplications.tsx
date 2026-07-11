import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Instagram,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import store from '@/data/store';
import type { StudioApplication } from '@/data/types';

const statusTabs = ['All', 'Pending', 'Approved', 'Rejected'];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-champagne-gold', bg: 'bg-champagne-gold/10' },
  approved: { label: 'Approved', color: 'text-bali-teal', bg: 'bg-bali-teal/10' },
  rejected: { label: 'Rejected', color: 'text-coral-rose', bg: 'bg-coral-rose/10' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<StudioApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('All');
  const [selected, setSelected] = useState<StudioApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await store.getStudioApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const filtered = useMemo(() => {
    if (statusTab === 'All') return applications;
    return applications.filter((a) => a.status === statusTab.toLowerCase());
  }, [applications, statusTab]);

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await store.approveStudio(selected.id);
      if (updated) {
        setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelected(null);
      } else {
        setError('Failed to approve application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await store.rejectStudio(selected.id, rejectNote);
      if (updated) {
        setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelected(null);
        setShowRejectModal(false);
        setRejectNote('');
      } else {
        setError('Failed to reject application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application');
    } finally {
      setActionLoading(false);
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
        >
          <h1 className="font-display text-[24px] font-medium text-pure-white">Studio Applications</h1>
          <p className="font-body text-[13px] text-slate-gray mt-1">Review and approve partner studio applications.</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total', value: stats.total, icon: Building2 },
            { label: 'Pending', value: stats.pending, icon: Clock },
            { label: 'Approved', value: stats.approved, icon: Check },
            { label: 'Rejected', value: stats.rejected, icon: X },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-5"
            >
              <div className="flex items-center gap-2">
                <card.icon size={16} className="text-slate-gray" />
                <span className="font-body text-[11px] font-semibold text-slate-gray uppercase tracking-[0.08em]">{card.label}</span>
              </div>
              <p className="font-mono text-[clamp(24px,2vw,30px)] text-pure-white mt-2">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
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

        {error && (
          <p className="font-body text-[13px] text-coral-rose mt-4">{error}</p>
        )}

        {/* Table */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[10px] overflow-hidden mt-4">
          <div className="hidden lg:grid lg:grid-cols-[1.4fr_1fr_1fr_100px_140px_120px] gap-4 px-4 py-3 bg-white/[0.02] font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-gray">
            <span>Studio</span>
            <span>Owner / Contact</span>
            <span>Location</span>
            <span>Artists</span>
            <span>Submitted</span>
            <span className="text-right">Status</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">No applications found.</div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a)}
                className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_100px_140px_120px] gap-2 lg:gap-4 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-champagne-gold/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-champagne-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[14px] font-medium text-pure-white truncate">{a.studioName}</p>
                    <p className="font-body text-[11px] text-slate-gray truncate">{a.email}</p>
                  </div>
                </div>
                <span className="font-body text-[13px] text-pure-white truncate">{a.ownerName || a.artistName || '—'}</span>
                <span className="font-body text-[13px] text-slate-gray">{a.location}</span>
                <span className="font-mono text-[13px] text-slate-gray">{a.numberOfArtists ?? '—'}</span>
                <span className="font-body text-[12px] text-slate-gray">
                  {new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex justify-end">
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelected(null)}
                className="fixed inset-0 bg-black/60 z-[90]"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-[#0A1929] border-l border-white/[0.06] z-[95] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-display text-[22px] font-medium text-pure-white">{selected.studioName}</h2>
                      <p className="font-body text-[13px] text-slate-gray mt-1">Studio Partner Application</p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <StatusBadge status={selected.status} />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">Contact</h4>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 font-body text-[13px] text-pure-white">
                          <Users size={14} className="text-slate-gray" /> {selected.ownerName || selected.artistName || '—'}
                        </p>
                        <p className="flex items-center gap-2 font-body text-[13px] text-pure-white">
                          <Mail size={14} className="text-slate-gray" /> {selected.email}
                        </p>
                        <p className="flex items-center gap-2 font-body text-[13px] text-pure-white">
                          <Phone size={14} className="text-slate-gray" /> {selected.whatsappNumber}
                        </p>
                        {selected.instagram && (
                          <p className="flex items-center gap-2 font-body text-[13px] text-pure-white">
                            <Instagram size={14} className="text-slate-gray" /> {selected.instagram}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">Details</h4>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 font-body text-[13px] text-pure-white">
                          <MapPin size={14} className="text-slate-gray" /> {selected.location}
                        </p>
                        <p className="font-body text-[13px] text-slate-gray">
                          Number of artists: <span className="text-pure-white">{selected.numberOfArtists ?? '—'}</span>
                        </p>
                      </div>
                    </div>

                    {selected.styles.length > 0 && (
                      <div>
                        <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">Styles</h4>
                        <div className="flex flex-wrap gap-1">
                          {selected.styles.map((s) => (
                            <span key={s} className="px-3 py-1 rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[11px] font-semibold uppercase">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.bio && (
                      <div>
                        <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">About</h4>
                        <p className="font-body text-[13px] text-white/70 leading-relaxed">{selected.bio}</p>
                      </div>
                    )}

                    {selected.portfolioUrl && (
                      <div>
                        <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-2">Portfolio</h4>
                        <a
                          href={selected.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-body text-[13px] text-champagne-gold hover:underline"
                        >
                          View Portfolio <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>

                  {selected.status === 'pending' && (
                    <div className="mt-8 space-y-3 pt-6 border-t border-white/[0.06]">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-body text-[14px] font-semibold bg-bali-teal text-pure-white hover:bg-bali-teal/90 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Approve Studio
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-body text-[14px] font-medium border-[1.5px] border-coral-rose text-coral-rose hover:bg-coral-rose hover:text-pure-white transition-colors disabled:opacity-50"
                      >
                        <X size={16} /> Reject Application
                      </button>
                    </div>
                  )}

                  {selected.status === 'rejected' && selected.reviewNotes && (
                    <div className="mt-6 p-4 bg-coral-rose/10 border border-coral-rose/20 rounded-md">
                      <p className="font-body text-[12px] text-coral-rose font-semibold mb-1">Rejection Note</p>
                      <p className="font-body text-[13px] text-white/70">{selected.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && selected && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRejectModal(false)}
                className="fixed inset-0 bg-black/60 z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] bg-[#0A1929] border border-white/[0.1] rounded-xl p-6 z-[110]"
              >
                <h3 className="font-display text-[20px] font-medium text-pure-white mb-2">Reject Application</h3>
                <p className="font-body text-[13px] text-slate-gray mb-4">Optionally add a note explaining why this studio was not approved.</p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                  placeholder="Reason for rejection (optional)"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.04] border border-white/[0.1] font-body text-[14px] text-pure-white placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold resize-y"
                />
                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2.5 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md font-body text-[13px] font-semibold bg-coral-rose text-pure-white hover:bg-coral-rose/90 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Confirm Reject
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
