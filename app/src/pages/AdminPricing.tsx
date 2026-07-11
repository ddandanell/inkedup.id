import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Upload, Copy, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/services/api';
import type { PricingConfig, CalcInput, PriceResult } from '@/lib/pricing';
import { formatIDR, formatSessionTime } from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VersionStatus = 'draft' | 'published' | 'archived';

interface PricingVersionSummary {
  id: string;
  name: string;
  status: VersionStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface PricingVersionDetail extends PricingVersionSummary {
  config: PricingConfig;
}

type ConfigListKey =
  | 'bodyAreas'
  | 'sizeCategories'
  | 'styles'
  | 'detailLevels'
  | 'colourOptions'
  | 'conditions';

type ConfigRow = PricingConfig[ConfigListKey][number];

type BusyAction = 'create' | 'save' | 'publish' | 'delete' | 'duplicate' | 'test' | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// The shared api client exposes get/post/patch/delete, but draft updates use
// PUT — mirror its request logic (JWT attached automatically) here.
async function putJson<T>(path: string, body: unknown): Promise<T> {
  const token = localStorage.getItem('inkedup_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.statusText}`);
  }
  return data as T;
}

const uid = () => crypto.randomUUID();

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const summaryOf = (d: PricingVersionDetail): PricingVersionSummary => ({
  id: d.id,
  name: d.name,
  status: d.status,
  created_at: d.created_at,
  updated_at: d.updated_at,
  published_at: d.published_at,
});

const inputCls =
  'bg-white/[0.04] border-white/[0.08] text-pure-white text-[13px] placeholder:text-slate-gray/50 disabled:opacity-60';
const labelCls = 'font-body text-[11px] uppercase tracking-[0.06em] text-slate-gray';

const EMPTY_TEST_INPUT: CalcInput = {
  bodyAreaId: '',
  widthCm: 10,
  heightCm: 10,
  styleId: '',
  detailLevelId: '',
  colourOptionId: '',
  conditionId: '',
  transportFee: 0,
};

// ---------------------------------------------------------------------------
// Column definitions for the editable section tables
// ---------------------------------------------------------------------------

interface ColumnDef {
  key: string;
  label: string;
  number?: boolean;
  step?: string;
  min?: string;
  max?: string;
  nullable?: boolean;
  placeholder?: string;
  className?: string;
}

const BODY_AREA_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', className: 'min-w-[150px]' },
  { key: 'group', label: 'Group', className: 'min-w-[110px]' },
  { key: 'basePrice', label: 'Base Price (IDR)', number: true, step: '50000', min: '0', className: 'min-w-[130px]' },
  { key: 'difficulty', label: 'Difficulty ×', number: true, step: '0.05', min: '0', className: 'min-w-[100px]' },
  { key: 'minPrice', label: 'Min Price (IDR)', number: true, step: '50000', min: '0', className: 'min-w-[130px]' },
];

const SIZE_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', className: 'min-w-[150px]' },
  { key: 'maxCm2', label: 'Max cm² (empty = no limit)', number: true, min: '0', nullable: true, placeholder: 'No limit', className: 'min-w-[140px]' },
  { key: 'multiplier', label: 'Multiplier ×', number: true, step: '0.05', min: '0', className: 'min-w-[110px]' },
  { key: 'hint', label: 'Hint', className: 'min-w-[220px]' },
];

const STYLE_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', className: 'min-w-[180px]' },
  { key: 'multiplier', label: 'Multiplier ×', number: true, step: '0.05', min: '0', className: 'min-w-[110px]' },
];

const DETAIL_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', className: 'min-w-[180px]' },
  { key: 'multiplier', label: 'Multiplier ×', number: true, step: '0.05', min: '0', className: 'min-w-[110px]' },
  { key: 'hint', label: 'Hint', className: 'min-w-[240px]' },
];

const CONDITION_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Name', className: 'min-w-[180px]' },
  { key: 'multiplier', label: 'Multiplier ×', number: true, step: '0.05', min: '0', className: 'min-w-[110px]' },
  { key: 'minPrice', label: 'Min Price (IDR)', number: true, step: '50000', min: '0', className: 'min-w-[130px]' },
];

const NEW_ROW: Record<ConfigListKey, () => ConfigRow> = {
  bodyAreas: () => ({ id: uid(), name: 'New area', group: 'Other', basePrice: 1000000, difficulty: 1, minPrice: 0 }),
  sizeCategories: () => ({ id: uid(), name: 'New size', maxCm2: null, multiplier: 1, hint: '' }),
  styles: () => ({ id: uid(), name: 'New style', multiplier: 1 }),
  detailLevels: () => ({ id: uid(), name: 'New detail level', multiplier: 1, hint: '' }),
  colourOptions: () => ({ id: uid(), name: 'New colour option', multiplier: 1 }),
  conditions: () => ({ id: uid(), name: 'New condition', multiplier: 1, minPrice: 0 }),
};

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: VersionStatus }) {
  const styles: Record<VersionStatus, string> = {
    draft: 'bg-champagne-gold/15 text-champagne-gold',
    published: 'bg-bali-teal/15 text-bali-teal',
    archived: 'bg-white/[0.06] text-slate-gray',
  };
  return (
    <Badge
      variant="outline"
      className={`border-transparent uppercase text-[10px] font-semibold tracking-[0.06em] ${styles[status]}`}
    >
      {status}
    </Badge>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className={labelCls}>{label}</Label>
      {children}
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-gray">{label}</span>
      <span className="text-pure-white text-right">{value}</span>
    </div>
  );
}

/** One editable table for a config list (body areas, styles, …). Edits flow
 * back through onPatch so the parent keeps a single source of truth. */
function ConfigTable({
  columns,
  rows,
  disabled,
  addLabel,
  onPatch,
  onAdd,
  onRemove,
}: {
  columns: ColumnDef[];
  rows: ConfigRow[];
  disabled: boolean;
  addLabel: string;
  onPatch: (index: number, key: string, value: string | number | null) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            {columns.map((c) => (
              <TableHead
                key={c.key}
                className="font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-gray"
              >
                {c.label}
              </TableHead>
            ))}
            <TableHead className="w-[44px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id} className="border-white/[0.04] hover:bg-white/[0.02]">
              {columns.map((col) => {
                const raw = (row as unknown as Record<string, string | number | null>)[col.key];
                return (
                  <TableCell key={col.key} className="p-1.5">
                    <Input
                      type={col.number ? 'number' : 'text'}
                      step={col.step}
                      min={col.min}
                      max={col.max}
                      placeholder={col.placeholder}
                      disabled={disabled}
                      value={raw ?? ''}
                      onChange={(e) => {
                        if (!col.number) {
                          onPatch(index, col.key, e.target.value);
                          return;
                        }
                        if (e.target.value === '') {
                          onPatch(index, col.key, col.nullable ? null : 0);
                          return;
                        }
                        const n = Number(e.target.value);
                        if (Number.isFinite(n)) onPatch(index, col.key, n);
                      }}
                      className={`h-8 ${inputCls} ${col.className ?? ''}`}
                    />
                  </TableCell>
                );
              })}
              <TableCell className="p-1.5">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  aria-label="Delete row"
                  className="p-1.5 rounded text-slate-gray hover:text-coral-rose hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-gray transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        disabled={disabled}
        className="border-white/[0.1] bg-transparent text-slate-gray hover:text-pure-white hover:bg-white/[0.04]"
      >
        <Plus size={14} /> {addLabel}
      </Button>
    </div>
  );
}

function TestSelect({
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { id: string; name: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange} disabled={disabled || options.length === 0}>
        <SelectTrigger className={`h-9 w-full ${inputCls}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#12283D] border-white/[0.08]">
          {options.map((o) => (
            <SelectItem
              key={o.id}
              value={o.id}
              className="text-pure-white text-[13px] focus:bg-white/[0.06] focus:text-pure-white"
            >
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPricing() {
  const [versions, setVersions] = useState<PricingVersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PricingVersionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Editable local copies of the selected version (draft or read-only view).
  const [editName, setEditName] = useState('');
  const [editConfig, setEditConfig] = useState<PricingConfig | null>(null);

  const [busy, setBusy] = useState<BusyAction>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [testInput, setTestInput] = useState<CalcInput>(EMPTY_TEST_INPUT);
  const [testResult, setTestResult] = useState<PriceResult | null>(null);

  const isDraft = selected?.status === 'draft';

  // Initial version list load — auto-select the published version if present.
  useEffect(() => {
    let cancelled = false;
    api
      .get<PricingVersionSummary[]>('/admin/pricing/versions')
      .then((list) => {
        if (cancelled) return;
        setVersions(list);
        setLoading(false);
        const live = list.find((v) => v.status === 'published');
        const first = live ?? list[0];
        if (first) setSelectedId(first.id);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pricing versions');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch full config whenever the selection changes.
  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setEditConfig(null);
      setTestResult(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setTestResult(null);
    api
      .get<PricingVersionDetail>(`/admin/pricing/versions/${selectedId}`)
      .then((detail) => {
        if (!cancelled) applyDetail(detail);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load version');
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const applyDetail = (detail: PricingVersionDetail) => {
    setSelected(detail);
    setEditName(detail.name);
    setEditConfig(structuredClone(detail.config));
    setVersions((prev) => prev.map((v) => (v.id === detail.id ? summaryOf(detail) : v)));
  };

  const refreshVersions = async () => {
    const list = await api.get<PricingVersionSummary[]>('/admin/pricing/versions');
    setVersions(list);
  };

  // --- Config editing ------------------------------------------------------

  const patchScalar = (
    key: 'minimumPrice' | 'roundingStep' | 'rangeVariance' | 'depositPercent',
    value: number
  ) => {
    setEditConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const patchRow = (listKey: ConfigListKey, index: number, key: string, value: string | number | null) => {
    setEditConfig((prev) => {
      if (!prev) return prev;
      const list = (prev[listKey] as ConfigRow[]).map((row, i) =>
        i === index ? ({ ...row, [key]: value } as ConfigRow) : row
      );
      return { ...prev, [listKey]: list } as PricingConfig;
    });
  };

  const addRow = (listKey: ConfigListKey) => {
    setEditConfig((prev) => {
      if (!prev) return prev;
      const list: ConfigRow[] = [...(prev[listKey] as ConfigRow[]), NEW_ROW[listKey]()];
      return { ...prev, [listKey]: list } as PricingConfig;
    });
  };

  const removeRow = (listKey: ConfigListKey, index: number) => {
    setEditConfig((prev) => {
      if (!prev) return prev;
      const list = (prev[listKey] as ConfigRow[]).filter((_, i) => i !== index);
      return { ...prev, [listKey]: list } as PricingConfig;
    });
  };

  // --- Version actions -----------------------------------------------------

  const handleCreate = async () => {
    setBusy('create');
    try {
      const created = await api.post<PricingVersionDetail>('/admin/pricing/versions', {
        name: 'Untitled draft',
      });
      setVersions((prev) => [summaryOf(created), ...prev]);
      setSelectedId(created.id);
      applyDetail(created);
      toast.success('Draft created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create draft');
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async () => {
    if (!selected || !editConfig) return;
    setBusy('save');
    try {
      const updated = await putJson<PricingVersionDetail>(`/admin/pricing/versions/${selected.id}`, {
        name: editName,
        config: editConfig,
      });
      applyDetail(updated);
      toast.success('Draft saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setBusy(null);
    }
  };

  const handlePublish = async () => {
    if (!selected) return;
    setBusy('publish');
    try {
      const updated = await api.post<PricingVersionDetail>(
        `/admin/pricing/versions/${selected.id}/publish`,
        {}
      );
      applyDetail(updated);
      await refreshVersions();
      setPublishOpen(false);
      toast.success('Published — now live on the public calculator');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish version');
    } finally {
      setBusy(null);
    }
  };

  const handleDuplicate = async () => {
    if (!selected) return;
    setBusy('duplicate');
    try {
      const created = await api.post<PricingVersionDetail>('/admin/pricing/versions', {
        name: `${selected.name} (copy)`,
        fromVersionId: selected.id,
      });
      setVersions((prev) => [summaryOf(created), ...prev]);
      setSelectedId(created.id);
      applyDetail(created);
      toast.success('Duplicated as new draft');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate version');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setBusy('delete');
    try {
      await api.delete<{ success: boolean }>(`/admin/pricing/versions/${selected.id}`);
      setVersions((prev) => prev.filter((v) => v.id !== selected.id));
      setSelectedId(null);
      setDeleteOpen(false);
      toast.success('Draft deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete draft');
    } finally {
      setBusy(null);
    }
  };

  // --- Test calculator -----------------------------------------------------

  const setTestField = <K extends keyof CalcInput>(key: K, value: CalcInput[K]) => {
    setTestInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    if (!editConfig) return;
    if (
      !testInput.bodyAreaId ||
      !testInput.styleId ||
      !testInput.detailLevelId ||
      !testInput.colourOptionId ||
      !testInput.conditionId
    ) {
      toast.error('Select all options to test a price.');
      return;
    }
    if (testInput.widthCm <= 0 || testInput.heightCm <= 0) {
      toast.error('Enter width and height in cm.');
      return;
    }
    setBusy('test');
    try {
      const result = await api.post<PriceResult>('/admin/pricing/calculate', {
        config: editConfig,
        input: testInput,
      });
      setTestResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Test calculation failed');
    } finally {
      setBusy(null);
    }
  };

  const b = testResult?.breakdown;

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h1 className="font-display text-[24px] font-medium text-pure-white">Pricing</h1>
          <p className="font-body text-[13px] text-slate-gray mt-1">
            Draft, test and publish calculator pricing versions. All prices are in Indonesian Rupiah.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 mt-6 items-start">
          {/* ---------------------------------------------------------------- */}
          {/* Left: version list                                                */}
          {/* ---------------------------------------------------------------- */}
          <Card className="bg-white/[0.02] border-white/[0.06] text-pure-white shadow-none lg:sticky lg:top-[72px]">
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="font-body text-[14px] font-semibold">Versions</CardTitle>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={busy !== null}
                className="bg-champagne-gold text-midnight-navy hover:bg-champagne-gold/90 h-8"
              >
                {busy === 'create' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                New draft
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <p className="px-1 py-6 text-center font-body text-[13px] text-slate-gray">
                  Loading versions...
                </p>
              ) : error ? (
                <p className="px-1 py-6 text-center font-body text-[13px] text-coral-rose">{error}</p>
              ) : versions.length === 0 ? (
                <p className="px-1 py-6 text-center font-body text-[13px] text-slate-gray">
                  No versions yet. Create a draft to start.
                </p>
              ) : (
                versions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className={`w-full text-left px-3 py-3 rounded-md border transition-colors ${
                      v.id === selectedId
                        ? 'border-champagne-gold/40 bg-champagne-gold/[0.08]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-body text-[13px] text-pure-white truncate">{v.name}</p>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="font-body text-[11px] text-slate-gray mt-1">
                      Published {fmtDate(v.published_at)}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Center: editor                                                    */}
          {/* ---------------------------------------------------------------- */}
          <Card className="bg-white/[0.02] border-white/[0.06] text-pure-white shadow-none min-w-0">
            {detailLoading ? (
              <CardContent className="py-16 flex items-center justify-center gap-2 text-slate-gray font-body text-[13px]">
                <Loader2 size={16} className="animate-spin" /> Loading version...
              </CardContent>
            ) : !selected || !editConfig ? (
              <CardContent className="py-16 text-center font-body text-[13px] text-slate-gray">
                Select a version from the list, or create a new draft.
              </CardContent>
            ) : (
              <>
                <CardHeader className="flex-row items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="font-body text-[16px] font-semibold truncate">
                        {selected.name}
                      </CardTitle>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="font-body text-[11px] text-slate-gray mt-1">
                      Updated {fmtDate(selected.updated_at)} · Published {fmtDate(selected.published_at)}
                    </p>
                  </div>
                  {isDraft ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={busy !== null}
                        className="bg-champagne-gold text-midnight-navy hover:bg-champagne-gold/90"
                      >
                        {busy === 'save' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Save draft
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPublishOpen(true)}
                        disabled={busy !== null}
                        className="border-bali-teal/40 text-bali-teal hover:bg-bali-teal/10 hover:text-bali-teal bg-transparent"
                      >
                        <Upload size={14} /> Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteOpen(true)}
                        disabled={busy !== null}
                        className="text-slate-gray hover:text-coral-rose hover:bg-coral-rose/10"
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-body text-[12px] text-slate-gray">
                        This version is read-only.
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDuplicate}
                        disabled={busy !== null}
                        className="border-white/[0.1] bg-transparent text-slate-gray hover:text-pure-white hover:bg-white/[0.04]"
                      >
                        {busy === 'duplicate' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Copy size={14} />
                        )}
                        Duplicate as new draft
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="flex flex-wrap h-auto gap-1 bg-white/[0.04] border border-white/[0.06]">
                      {[
                        ['general', 'General'],
                        ['areas', 'Body Areas'],
                        ['sizes', 'Size Categories'],
                        ['styles', 'Styles'],
                        ['detail', 'Detail Levels'],
                        ['colour', 'Colour Options'],
                        ['conditions', 'Conditions'],
                      ].map(([value, label]) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className="text-[12px] text-slate-gray data-[state=active]:bg-champagne-gold/15 data-[state=active]:text-champagne-gold"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* General */}
                    <TabsContent value="general" className="mt-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px]">
                        <div className="sm:col-span-2">
                          <Field label="Version name">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              disabled={!isDraft}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                        <Field label="Minimum price (IDR)">
                          <Input
                            type="number"
                            step="50000"
                            min="0"
                            value={editConfig.minimumPrice}
                            onChange={(e) => patchScalar('minimumPrice', num(e.target.value))}
                            disabled={!isDraft}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Rounding step (IDR)">
                          <Input
                            type="number"
                            step="10000"
                            min="0"
                            value={editConfig.roundingStep}
                            onChange={(e) => patchScalar('roundingStep', num(e.target.value))}
                            disabled={!isDraft}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Range variance (0–1)">
                          <Input
                            type="number"
                            step="0.05"
                            min="0"
                            max="1"
                            value={editConfig.rangeVariance}
                            onChange={(e) =>
                              patchScalar(
                                'rangeVariance',
                                Math.min(1, Math.max(0, num(e.target.value)))
                              )
                            }
                            disabled={!isDraft}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Deposit (%)">
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={editConfig.depositPercent}
                            onChange={(e) =>
                              patchScalar(
                                'depositPercent',
                                Math.min(100, Math.max(0, num(e.target.value)))
                              )
                            }
                            disabled={!isDraft}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </TabsContent>

                    {/* Body Areas */}
                    <TabsContent value="areas" className="mt-5">
                      <ConfigTable
                        columns={BODY_AREA_COLUMNS}
                        rows={editConfig.bodyAreas}
                        disabled={!isDraft}
                        addLabel="Add body area"
                        onPatch={(i, k, v) => patchRow('bodyAreas', i, k, v)}
                        onAdd={() => addRow('bodyAreas')}
                        onRemove={(i) => removeRow('bodyAreas', i)}
                      />
                    </TabsContent>

                    {/* Size Categories */}
                    <TabsContent value="sizes" className="mt-5">
                      <ConfigTable
                        columns={SIZE_COLUMNS}
                        rows={editConfig.sizeCategories}
                        disabled={!isDraft}
                        addLabel="Add size category"
                        onPatch={(i, k, v) => patchRow('sizeCategories', i, k, v)}
                        onAdd={() => addRow('sizeCategories')}
                        onRemove={(i) => removeRow('sizeCategories', i)}
                      />
                    </TabsContent>

                    {/* Styles */}
                    <TabsContent value="styles" className="mt-5">
                      <ConfigTable
                        columns={STYLE_COLUMNS}
                        rows={editConfig.styles}
                        disabled={!isDraft}
                        addLabel="Add style"
                        onPatch={(i, k, v) => patchRow('styles', i, k, v)}
                        onAdd={() => addRow('styles')}
                        onRemove={(i) => removeRow('styles', i)}
                      />
                    </TabsContent>

                    {/* Detail Levels */}
                    <TabsContent value="detail" className="mt-5">
                      <ConfigTable
                        columns={DETAIL_COLUMNS}
                        rows={editConfig.detailLevels}
                        disabled={!isDraft}
                        addLabel="Add detail level"
                        onPatch={(i, k, v) => patchRow('detailLevels', i, k, v)}
                        onAdd={() => addRow('detailLevels')}
                        onRemove={(i) => removeRow('detailLevels', i)}
                      />
                    </TabsContent>

                    {/* Colour Options */}
                    <TabsContent value="colour" className="mt-5">
                      <ConfigTable
                        columns={STYLE_COLUMNS}
                        rows={editConfig.colourOptions}
                        disabled={!isDraft}
                        addLabel="Add colour option"
                        onPatch={(i, k, v) => patchRow('colourOptions', i, k, v)}
                        onAdd={() => addRow('colourOptions')}
                        onRemove={(i) => removeRow('colourOptions', i)}
                      />
                    </TabsContent>

                    {/* Project Conditions */}
                    <TabsContent value="conditions" className="mt-5">
                      <ConfigTable
                        columns={CONDITION_COLUMNS}
                        rows={editConfig.conditions}
                        disabled={!isDraft}
                        addLabel="Add condition"
                        onPatch={(i, k, v) => patchRow('conditions', i, k, v)}
                        onAdd={() => addRow('conditions')}
                        onRemove={(i) => removeRow('conditions', i)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            )}
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Right: test calculator                                            */}
          {/* ---------------------------------------------------------------- */}
          <Card className="bg-white/[0.02] border-white/[0.06] text-pure-white shadow-none lg:sticky lg:top-[72px]">
            <CardHeader>
              <CardTitle className="font-body text-[14px] font-semibold flex items-center gap-2">
                <Calculator size={15} className="text-champagne-gold" /> Test calculator
              </CardTitle>
              <p className="font-body text-[11px] text-slate-gray">
                Runs the current editor state — including unsaved changes — against the real
                pricing engine.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <TestSelect
                label="Body area"
                value={testInput.bodyAreaId}
                placeholder="Select area"
                options={editConfig?.bodyAreas ?? []}
                disabled={!editConfig}
                onChange={(v) => setTestField('bodyAreaId', v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Width (cm)">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={testInput.widthCm}
                    onChange={(e) => setTestField('widthCm', num(e.target.value))}
                    disabled={!editConfig}
                    className={inputCls}
                  />
                </Field>
                <Field label="Height (cm)">
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={testInput.heightCm}
                    onChange={(e) => setTestField('heightCm', num(e.target.value))}
                    disabled={!editConfig}
                    className={inputCls}
                  />
                </Field>
              </div>
              <TestSelect
                label="Style"
                value={testInput.styleId}
                placeholder="Select style"
                options={editConfig?.styles ?? []}
                disabled={!editConfig}
                onChange={(v) => setTestField('styleId', v)}
              />
              <TestSelect
                label="Detail level"
                value={testInput.detailLevelId}
                placeholder="Select detail"
                options={editConfig?.detailLevels ?? []}
                disabled={!editConfig}
                onChange={(v) => setTestField('detailLevelId', v)}
              />
              <TestSelect
                label="Colour"
                value={testInput.colourOptionId}
                placeholder="Select colour"
                options={editConfig?.colourOptions ?? []}
                disabled={!editConfig}
                onChange={(v) => setTestField('colourOptionId', v)}
              />
              <TestSelect
                label="Condition"
                value={testInput.conditionId}
                placeholder="Select condition"
                options={editConfig?.conditions ?? []}
                disabled={!editConfig}
                onChange={(v) => setTestField('conditionId', v)}
              />
              <Field label="Transport fee (IDR)">
                <Input
                  type="number"
                  min="0"
                  step="50000"
                  value={testInput.transportFee}
                  onChange={(e) => setTestField('transportFee', num(e.target.value))}
                  disabled={!editConfig}
                  className={inputCls}
                />
              </Field>

              <Button
                onClick={handleTest}
                disabled={!editConfig || busy !== null}
                className="w-full bg-champagne-gold text-midnight-navy hover:bg-champagne-gold/90"
              >
                {busy === 'test' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Calculator size={14} />
                )}
                Test price
              </Button>

              {testResult && b && (
                <div className="rounded-md border border-champagne-gold/25 bg-champagne-gold/[0.05] p-4">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-gray">
                    Estimated price
                  </p>
                  <p className="font-display text-[26px] font-medium text-champagne-gold leading-tight mt-1">
                    {formatIDR(testResult.estimatedPrice)}
                  </p>
                  <p className="font-body text-[12px] text-slate-gray mt-0.5">
                    Range {formatIDR(testResult.priceMin)} – {formatIDR(testResult.priceMax)}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 font-body text-[12px]">
                    <div>
                      <p className="text-slate-gray">Deposit</p>
                      <p className="text-pure-white">{formatIDR(testResult.deposit)}</p>
                    </div>
                    <div>
                      <p className="text-slate-gray">Session time</p>
                      <p className="text-pure-white">
                        {formatSessionTime(testResult.sessionMinutes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-gray">Area</p>
                      <p className="text-pure-white">{testResult.areaCm2} cm²</p>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] mt-3 pt-3 space-y-1.5 font-body text-[12px]">
                    <BreakdownRow label={`${b.bodyArea} (base)`} value={formatIDR(b.basePrice)} />
                    <BreakdownRow label={`Size: ${b.sizeCategory}`} value={`×${b.sizeMultiplier}`} />
                    <BreakdownRow label="Detail ×" value={`×${b.detailMultiplier}`} />
                    <BreakdownRow label="Style ×" value={`×${b.styleMultiplier}`} />
                    <BreakdownRow label="Colour ×" value={`×${b.colourMultiplier}`} />
                    <BreakdownRow label="Area difficulty ×" value={`×${b.difficultyMultiplier}`} />
                    <BreakdownRow label="Condition ×" value={`×${b.conditionMultiplier}`} />
                    <BreakdownRow
                      label="Subtotal"
                      value={formatIDR(b.subtotalBeforeFloor)}
                    />
                    {b.appliedFloor > 0 && (
                      <BreakdownRow
                        label="Minimum floor applied"
                        value={formatIDR(b.appliedFloor)}
                      />
                    )}
                    {b.transportFee > 0 && (
                      <BreakdownRow label="Transport fee" value={formatIDR(b.transportFee)} />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Publish confirmation */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent className="bg-[#0D1F30] border-white/[0.08] text-pure-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pure-white">
              Publish this pricing version?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-gray">
              This makes the changes live on the public price calculator for all visitors.
              Already-shared prices are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/[0.1] text-slate-gray hover:bg-white/[0.04] hover:text-pure-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublish}
              disabled={busy !== null}
              className="bg-champagne-gold text-midnight-navy hover:bg-champagne-gold/90"
            >
              {busy === 'publish' ? <Loader2 size={14} className="animate-spin" /> : null}
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#0D1F30] border-white/[0.08] text-pure-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-pure-white">Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-gray">
              This permanently deletes the draft pricing version. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/[0.1] text-slate-gray hover:bg-white/[0.04] hover:text-pure-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy !== null}
              className="bg-coral-rose text-pure-white hover:bg-coral-rose/90"
            >
              {busy === 'delete' ? <Loader2 size={14} className="animate-spin" /> : null}
              Delete draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
