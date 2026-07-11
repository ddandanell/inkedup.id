import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Eye,
  Pencil,
  MoreHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import store from '@/data/store';
import type { Artist, Studio } from '@/data/types';

const PAGE_SIZE = 8;

export default function AdminArtists() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [artistPage, setArtistPage] = useState(1);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([store.getArtists(), store.getStudios()])
      .then(([fetchedArtists, fetchedStudios]) => {
        if (!cancelled) {
          setArtists(fetchedArtists);
          setStudios(fetchedStudios);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load artists');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const locations = useMemo(() => {
    const locs = new Set(artists.map((a) => a.location));
    return ['All', ...Array.from(locs)];
  }, [artists]);

  const getStudioForArtist = (artist: Artist) => {
    return studios.find((s) => s.artistIds.includes(artist.id));
  };

  const filteredArtists = useMemo(() => {
    let result = artists;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          a.styles.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (locationFilter !== 'All') {
      result = result.filter((a) => a.location === locationFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter((a) => a.status === statusFilter.toLowerCase());
    }
    return result;
  }, [artists, search, locationFilter, statusFilter]);

  const artistTotalPages = Math.max(1, Math.ceil(filteredArtists.length / PAGE_SIZE));
  const paginatedArtists = filteredArtists.slice((artistPage - 1) * PAGE_SIZE, artistPage * PAGE_SIZE);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-bali-teal/15 text-bali-teal',
      pending: 'bg-champagne-gold/15 text-champagne-gold',
      rejected: 'bg-coral-rose/15 text-coral-rose',
    };
    return (
      <span className={`px-3 py-1 rounded-full font-body text-[11px] font-semibold uppercase ${styles[status] || styles.active}`}>
        {status}
      </span>
    );
  };

  const exportCSV = () => {
    const rows = filteredArtists.map((a) =>
      [a.displayName, a.location, a.styles.join(';'), a.rating, a.status].join(',')
    );
    const csv = ['Name,Location,Styles,Rating,Status', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artists.csv';
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
        <h1 className="font-display text-[24px] font-medium text-pure-white">Artists</h1>
        <p className="font-body text-[13px] text-slate-gray mt-1">Manage artists and their studios.</p>
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mt-6 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
          <input
            type="text"
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md pl-9 pr-3 py-2 font-body text-[13px] text-pure-white placeholder:text-slate-gray focus:outline-none focus:border-champagne-gold/50"
          />
        </div>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
        >
          {locations.map((l) => (
            <option key={l} value={l} className="bg-[#0A1929]">{l}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 font-body text-[13px] text-pure-white focus:outline-none focus:border-champagne-gold/50"
        >
          {['All', 'Active', 'Pending', 'Rejected'].map((s) => (
            <option key={s} value={s} className="bg-[#0A1929]">{s}</option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 rounded-md font-body text-[13px] text-slate-gray hover:text-pure-white hover:bg-white/[0.04] transition-colors ml-auto"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Artist Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-[10px] overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_80px_80px_100px_100px] gap-4 px-4 py-3 bg-white/[0.02] font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-gray">
          <span>Artist</span>
          <span>Studio</span>
          <span>Styles</span>
          <span>Rating</span>
          <span>Bookings</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
            Loading artists...
          </div>
        ) : error ? (
          <div className="px-4 py-10 text-center font-body text-[13px] text-coral-rose">
            {error}
          </div>
        ) : paginatedArtists.length === 0 ? (
          <div className="px-4 py-10 text-center font-body text-[13px] text-slate-gray">
            No artists found.
          </div>
        ) : (
          paginatedArtists.map((a) => {
            const studio = getStudioForArtist(a);
            return (
              <div
                key={a.id}
                className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_80px_80px_100px_100px] gap-2 md:gap-4 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={a.photo} alt={a.displayName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-body text-[14px] font-medium text-pure-white">{a.displayName}</p>
                    <p className="font-body text-[12px] text-slate-gray">{studio?.name || 'No studio'}</p>
                  </div>
                </div>
                <span className="font-body text-[13px] text-slate-gray flex items-center gap-1">
                  <MapPin size={12} /> {a.location}
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {a.styles.slice(0, 2).map((s) => (
                    <span key={s} className="px-2 py-[2px] rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[10px] font-semibold uppercase">
                      {s}
                    </span>
                  ))}
                  {a.styles.length > 2 && (
                    <span className="font-body text-[11px] text-slate-gray">+{a.styles.length - 2}</span>
                  )}
                </div>
                <span className="font-body text-[13px] text-champagne-gold flex items-center gap-1">
                  <Star size={12} className="fill-champagne-gold" /> {a.rating}
                </span>
                <span className="font-body text-[13px] text-pure-white">{a.reviewCount}</span>
                <div>{statusBadge(a.status)}</div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setSelectedArtist(a)}
                    className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button className="p-1.5 rounded text-slate-gray hover:text-pure-white hover:bg-white/[0.06] transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && artistTotalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="font-body text-[12px] text-slate-gray">
            Showing {(artistPage - 1) * PAGE_SIZE + 1}-{Math.min(artistPage * PAGE_SIZE, filteredArtists.length)} of {filteredArtists.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setArtistPage((p) => Math.max(1, p - 1))}
              disabled={artistPage === 1}
              className="p-1.5 rounded text-slate-gray hover:text-pure-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-body text-[12px] text-slate-gray">{artistPage} / {artistTotalPages}</span>
            <button
              onClick={() => setArtistPage((p) => Math.min(artistTotalPages, p + 1))}
              disabled={artistPage === artistTotalPages}
              className="p-1.5 rounded text-slate-gray hover:text-pure-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Artist Detail Drawer */}
      <AnimatePresence>
        {selectedArtist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-midnight-navy/70 backdrop-blur-sm z-[200]"
              onClick={() => setSelectedArtist(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-[#0D1F30] border-l border-white/[0.06] z-[300] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={selectedArtist.photo} alt={selectedArtist.displayName} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h2 className="font-body text-[18px] font-semibold text-pure-white">{selectedArtist.displayName}</h2>
                      <div className="mt-1">{statusBadge(selectedArtist.status)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArtist(null)}
                    className="p-2 text-slate-gray hover:text-pure-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Bio</h4>
                    <p className="font-body text-[13px] text-white/70 leading-relaxed">{selectedArtist.bio}</p>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Location</h4>
                    <p className="font-body text-[13px] text-pure-white flex items-center gap-1"><MapPin size={14} /> {selectedArtist.location}</p>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Styles</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedArtist.styles.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-champagne-gold/10 text-champagne-gold font-body text-[11px] font-semibold uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Pricing</h4>
                    <div className="flex gap-4">
                      <span className="font-body text-[13px] text-pure-white">Small: {store.formatIDR(selectedArtist.pricing.small)}</span>
                      <span className="font-body text-[13px] text-pure-white">Medium: {store.formatIDR(selectedArtist.pricing.medium)}</span>
                      <span className="font-body text-[13px] text-pure-white">Large: {store.formatIDR(selectedArtist.pricing.large)}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Rating</h4>
                    <span className="font-body text-[13px] text-champagne-gold flex items-center gap-1">
                      <Star size={14} className="fill-champagne-gold" /> {selectedArtist.rating} ({selectedArtist.reviewCount} reviews)
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Experience</h4>
                    <p className="font-body text-[13px] text-pure-white">{selectedArtist.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Languages</h4>
                    <p className="font-body text-[13px] text-pure-white">{selectedArtist.languages.join(', ')}</p>
                  </div>
                  {selectedArtist.instagram && (
                    <div>
                      <h4 className="font-body text-[10px] font-semibold text-slate-gray uppercase tracking-[0.1em] mb-1">Social</h4>
                      <p className="font-body text-[13px] text-champagne-gold">{selectedArtist.instagram}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  );
}
