import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calculator,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { waLink } from '@/data/business';
import { useSEO } from '@/hooks/useSEO';
import {
  calculatePrice,
  formatIDR,
  formatIDRPlain,
  formatSessionTime,
} from '@/lib/pricing';
import type { BodyArea, PricingConfig, PricingConfigResponse } from '@/lib/pricing';

/* ---------- presets ---------- */

// One-tap project sizes that pre-fill body area + dimensions.
const projectPresets = [
  { id: 'half-sleeve', label: 'Half Sleeve', areaId: 'upper-arm', width: 25, height: 10 },
  { id: 'full-sleeve', label: 'Full Sleeve', areaId: 'upper-arm', width: 35, height: 12 },
  { id: 'full-leg', label: 'Full Leg', areaId: 'thigh', width: 45, height: 14 },
  { id: 'back-piece', label: 'Back Piece', areaId: 'full-back', width: 35, height: 45 },
  { id: 'chest-piece', label: 'Chest Piece', areaId: 'chest', width: 25, height: 20 },
] as const;

/* ---------- helpers ---------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Display-only mirror of the engine's size-category lookup, so the cm² readout
// can show a category name even before every selection is complete.
function sizeCategoryName(config: PricingConfig, areaCm2: number): string | null {
  const sorted = [...config.sizeCategories].sort(
    (a, b) => (a.maxCm2 ?? Number.MAX_SAFE_INTEGER) - (b.maxCm2 ?? Number.MAX_SAFE_INTEGER)
  );
  const found =
    sorted.find((c) => areaCm2 <= (c.maxCm2 ?? Number.MAX_SAFE_INTEGER)) ??
    sorted[sorted.length - 1];
  return found?.name ?? null;
}

const chipClass = (active: boolean) =>
  `rounded-lg border px-3.5 py-2 font-body text-[13px] transition-colors cursor-pointer ${
    active
      ? 'border-champagne-gold bg-champagne-gold/15 text-champagne-gold'
      : 'border-white/[0.12] bg-white/[0.03] text-white/75 hover:border-champagne-gold/50 hover:text-pure-white'
  }`;

function BreakdownRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`font-body text-[12px] ${accent ? 'text-champagne-gold' : 'text-white/55'}`}>
        {label}
      </span>
      <span
        className={`font-body text-[12px] font-medium ${
          accent ? 'text-champagne-gold' : 'text-white/85'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- page ---------- */

export default function PriceCalculator() {
  useSEO({
    title: 'Tattoo Price Calculator — Transparent Pricing | InkedUp Bali',
    description:
      'Instant tattoo price estimates in Indonesian Rupiah. Choose your body area, size, style and detail level for a transparent IDR range — before you message us on WhatsApp.',
    path: '/price-calculator',
  });

  const [data, setData] = useState<PricingConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bodyAreaId, setBodyAreaId] = useState<string | null>(null);
  const [widthCm, setWidthCm] = useState(15);
  const [heightCm, setHeightCm] = useState(10);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [detailLevelId, setDetailLevelId] = useState<string | null>(null);
  const [colourOptionId, setColourOptionId] = useState<string | null>(null);
  const [conditionId, setConditionId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<PricingConfigResponse>('/pricing');
      setData(res);
      // Sensible ×1.0 defaults so the estimate appears the moment an area is picked.
      setStyleId((v) => v ?? res.config.styles[0]?.id ?? null);
      setDetailLevelId((v) => v ?? res.config.detailLevels[0]?.id ?? null);
      setColourOptionId((v) => v ?? res.config.colourOptions[0]?.id ?? null);
      setConditionId((v) => v ?? res.config.conditions[0]?.id ?? null);
      setLocationId((v) => v ?? res.transport[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const config = data?.config;
  const transport = data?.transport ?? [];

  const groupedAreas = useMemo(() => {
    if (!config) return [] as [string, BodyArea[]][];
    const map = new Map<string, BodyArea[]>();
    for (const area of config.bodyAreas) {
      const list = map.get(area.group) ?? [];
      list.push(area);
      map.set(area.group, list);
    }
    return [...map.entries()];
  }, [config]);

  const areaCm2 = Math.round(widthCm * heightCm);

  const liveSizeName = useMemo(
    () => (config ? sizeCategoryName(config, areaCm2) : null),
    [config, areaCm2]
  );

  const selectedTransport = useMemo(
    () => transport.find((t) => t.id === locationId),
    [transport, locationId]
  );

  const result = useMemo(() => {
    if (!config) return null;
    return calculatePrice(
      {
        bodyAreaId: bodyAreaId ?? '',
        widthCm,
        heightCm,
        styleId: styleId ?? '',
        detailLevelId: detailLevelId ?? '',
        colourOptionId: colourOptionId ?? '',
        conditionId: conditionId ?? '',
        transportFee: selectedTransport?.fee ?? 0,
      },
      config
    );
  }, [
    config,
    bodyAreaId,
    widthCm,
    heightCm,
    styleId,
    detailLevelId,
    colourOptionId,
    conditionId,
    selectedTransport,
  ]);

  // Names for the WhatsApp summary — kept separate from `result` so the message
  // reads naturally even though the engine only needs ids.
  const names = useMemo(() => {
    if (!config) return null;
    return {
      area: config.bodyAreas.find((a) => a.id === bodyAreaId),
      style: config.styles.find((s) => s.id === styleId),
      detail: config.detailLevels.find((d) => d.id === detailLevelId),
      colour: config.colourOptions.find((c) => c.id === colourOptionId),
      condition: config.conditions.find((c) => c.id === conditionId),
    };
  }, [config, bodyAreaId, styleId, detailLevelId, colourOptionId, conditionId]);

  const quoteMessage = useMemo(() => {
    if (!result || !names?.area || !names.style || !names.detail || !names.colour || !names.condition) {
      return '';
    }
    const where = selectedTransport ? `villa in ${selectedTransport.name}` : 'villa in Bali';
    return `Hi InkedUp! I'd love a quote: ${names.style.name} on ${names.area.name}, ~${result.areaCm2} cm², ${names.detail.name}, ${names.colour.name}, ${names.condition.name.toLowerCase()}, ${where}. Calculator estimate: ${formatIDRPlain(result.priceMin)} – ${formatIDRPlain(result.priceMax)}.`;
  }, [result, names, selectedTransport]);

  const applyPreset = (preset: (typeof projectPresets)[number]) => {
    // Presets reference seed area ids — guard in case the admin renamed them.
    if (config?.bodyAreas.some((a) => a.id === preset.areaId)) {
      setBodyAreaId(preset.areaId);
    }
    setWidthCm(preset.width);
    setHeightCm(preset.height);
  };

  const placeholder = !bodyAreaId
    ? 'Select a body area to start…'
    : 'Complete your selections to see your estimate…';

  return (
    <div className="min-h-[100dvh] bg-midnight-navy">
      <PageHero
        image="/tattoo-work-2.jpg"
        label="PRICE CALCULATOR"
        title="Tattoo Price Calculator"
        subtitle="Transparent, instant estimates in Indonesian Rupiah — know what your piece costs before you message us. No sign-up, no hidden fees."
      />

      <section className="bg-midnight-navy" style={{ padding: 'clamp(64px, 8vw, 110px) 0' }}>
        <div className="container-inkedup">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
              className="inline-block font-body text-xs font-semibold uppercase tracking-[0.16em] text-champagne-gold mb-4"
            >
              LIVE ESTIMATOR
            </motion.span>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
              className="font-display text-[clamp(28px,3.5vw,42px)] font-medium text-pure-white"
            >
              Build Your Piece, See the Price
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
              className="font-body text-[15px] text-white/60 mt-3 max-w-[560px] mx-auto"
            >
              Every selection updates your estimate instantly — the same engine our concierge uses to confirm your quote.
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 max-w-[1080px] mx-auto">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8 space-y-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-28 bg-white/[0.08] mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-9 w-24 bg-white/[0.08]" />
                      <Skeleton className="h-9 w-28 bg-white/[0.08]" />
                      <Skeleton className="h-9 w-20 bg-white/[0.08]" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-[440px] rounded-xl bg-white/[0.06]" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="max-w-md mx-auto text-center rounded-xl border border-coral-rose/30 bg-coral-rose/10 p-10"
            >
              <AlertCircle size={32} className="text-coral-rose mx-auto mb-4" />
              <h3 className="font-display text-2xl font-medium text-pure-white">
                Couldn&apos;t load pricing
              </h3>
              <p className="font-body text-sm text-white/60 mt-2">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-6 inline-flex items-center gap-2 border border-champagne-gold text-champagne-gold px-6 py-2.5 rounded font-body text-sm font-medium hover:bg-champagne-gold hover:text-midnight-navy transition-colors"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </motion.div>
          ) : config ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 max-w-[1080px] mx-auto">
              {/* ---------- controls ---------- */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8"
              >
                {/* Presets */}
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                  Project presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {projectPresets.map((p) => {
                    const active =
                      bodyAreaId === p.areaId && widthCm === p.width && heightCm === p.height;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        aria-pressed={active}
                        className={chipClass(active)}
                      >
                        <span className="font-semibold">{p.label}</span>
                        <span className="block font-body text-[10px] opacity-70 mt-0.5">
                          {p.width}×{p.height} cm
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Body area */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-4">
                    Body area
                  </p>
                  <div className="space-y-4">
                    {groupedAreas.map(([group, areas]) => (
                      <div key={group}>
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-champagne-gold/70 mb-2">
                          {group}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {areas.map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => setBodyAreaId(area.id)}
                              aria-pressed={bodyAreaId === area.id}
                              className={chipClass(bodyAreaId === area.id)}
                            >
                              {area.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray">
                      Size
                    </p>
                    <p className="font-body text-[13px] text-champagne-gold">
                      ≈ {areaCm2} cm²{liveSizeName ? ` · ${liveSizeName}` : ''}
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-[13px] text-white/70">Width</span>
                        <span className="font-mono-stat text-[13px] text-pure-white">
                          {widthCm} cm
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={60}
                        step={1}
                        value={[widthCm]}
                        onValueChange={([v]) => setWidthCm(v)}
                        className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-champagne-gold [&_[data-slot=slider-thumb]]:border-champagne-gold"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-[13px] text-white/70">Height</span>
                        <span className="font-mono-stat text-[13px] text-pure-white">
                          {heightCm} cm
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={60}
                        step={1}
                        value={[heightCm]}
                        onValueChange={([v]) => setHeightCm(v)}
                        className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-champagne-gold [&_[data-slot=slider-thumb]]:border-champagne-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Style */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.styles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyleId(s.id)}
                        aria-pressed={styleId === s.id}
                        className={chipClass(styleId === s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail level */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                    Detail level
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {config.detailLevels.map((d) => {
                      const active = detailLevelId === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDetailLevelId(d.id)}
                          aria-pressed={active}
                          className={`text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                            active
                              ? 'border-champagne-gold bg-champagne-gold/15'
                              : 'border-white/[0.12] bg-white/[0.03] hover:border-champagne-gold/50'
                          }`}
                        >
                          <span
                            className={`block font-body text-[13px] font-semibold ${
                              active ? 'text-champagne-gold' : 'text-pure-white'
                            }`}
                          >
                            {d.name}
                          </span>
                          {d.hint && (
                            <span className="block font-body text-[11px] text-white/50 mt-0.5">
                              {d.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colour */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                    Colour
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.colourOptions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColourOptionId(c.id)}
                        aria-pressed={colourOptionId === c.id}
                        className={chipClass(colourOptionId === c.id)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div className="border-t border-white/[0.08] mt-7 pt-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                    Project condition
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.conditions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setConditionId(c.id)}
                        aria-pressed={conditionId === c.id}
                        className={chipClass(conditionId === c.id)}
                      >
                        {c.name}
                        {c.minPrice > 0 && (
                          <span className="block font-body text-[10px] opacity-70 mt-0.5">
                            min {formatIDR(c.minPrice)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Villa location */}
                {transport.length > 0 && (
                  <div className="border-t border-white/[0.08] mt-7 pt-7">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-slate-gray mb-3">
                      Your villa location
                    </p>
                    <Select value={locationId ?? ''} onValueChange={setLocationId}>
                      <SelectTrigger className="w-full bg-white/[0.04] border-white/[0.12] text-pure-white hover:bg-white/[0.07]">
                        <SelectValue placeholder="Select your area" />
                      </SelectTrigger>
                      <SelectContent className="bg-deep-ocean border-white/[0.12] text-pure-white">
                        {transport.map((t) => (
                          <SelectItem
                            key={t.id}
                            value={t.id}
                            className="focus:bg-white/[0.08] focus:text-pure-white"
                          >
                            {t.name} · {t.fee === 0 ? 'Free' : formatIDR(t.fee)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </motion.div>

              {/* ---------- result panel ---------- */}
              <div className="self-start lg:sticky lg:top-[96px]">
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease }}
                  className="rounded-xl border border-champagne-gold/25 bg-white/[0.05] p-6 md:p-7 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex items-center gap-2 text-champagne-gold">
                    <Calculator size={16} />
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.14em]">
                      Your estimate
                    </span>
                  </div>

                  {result ? (
                    <>
                      <p className="font-display text-[clamp(26px,2.6vw,33px)] font-medium text-pure-white mt-4 leading-tight">
                        {formatIDR(result.priceMin)} – {formatIDR(result.priceMax)}
                      </p>
                      <p className="font-body text-[13px] text-white/60 mt-1.5">
                        Typical ~ {formatIDR(result.estimatedPrice)}
                      </p>

                      <div className="border-t border-white/[0.08] my-5" />

                      <ul className="space-y-2.5">
                        <li className="flex items-center gap-2.5">
                          <Wallet size={14} className="text-champagne-gold flex-shrink-0" />
                          <span className="font-body text-[13px] text-white/80">
                            {formatIDR(result.deposit)} · {config.depositPercent}% deposit
                          </span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Clock size={14} className="text-champagne-gold flex-shrink-0" />
                          <span className="font-body text-[13px] text-white/80">
                            {formatSessionTime(result.sessionMinutes)}
                          </span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <MapPin size={14} className="text-champagne-gold flex-shrink-0" />
                          <span className="font-body text-[13px] text-white/80">
                            {selectedTransport?.name ?? 'Bali'} ·{' '}
                            {result.breakdown.transportFee === 0
                              ? 'Free transport'
                              : `${formatIDR(result.breakdown.transportFee)} transport`}
                          </span>
                        </li>
                      </ul>

                      <div className="border-t border-white/[0.08] my-5" />

                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-gray mb-3">
                        Breakdown
                      </p>
                      <div className="space-y-1.5">
                        <BreakdownRow
                          label={`Base · ${result.breakdown.bodyArea}`}
                          value={formatIDR(result.breakdown.basePrice)}
                        />
                        <BreakdownRow
                          label={`Size · ${result.breakdown.sizeCategory}`}
                          value={`×${result.breakdown.sizeMultiplier}`}
                        />
                        <BreakdownRow
                          label="Detail"
                          value={`×${result.breakdown.detailMultiplier}`}
                        />
                        <BreakdownRow
                          label="Style"
                          value={`×${result.breakdown.styleMultiplier}`}
                        />
                        <BreakdownRow
                          label="Colour"
                          value={`×${result.breakdown.colourMultiplier}`}
                        />
                        <BreakdownRow
                          label="Placement difficulty"
                          value={`×${result.breakdown.difficultyMultiplier}`}
                        />
                        <BreakdownRow
                          label="Condition"
                          value={`×${result.breakdown.conditionMultiplier}`}
                        />
                        {result.breakdown.appliedFloor > 0 && (
                          <BreakdownRow
                            label="Minimum applied"
                            value={formatIDR(result.breakdown.appliedFloor)}
                            accent
                          />
                        )}
                        {result.breakdown.transportFee > 0 && (
                          <BreakdownRow
                            label="Villa transport"
                            value={`+${formatIDR(result.breakdown.transportFee)}`}
                          />
                        )}
                      </div>

                      <a
                        href={waLink(quoteMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded gold-shimmer px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.04em] text-midnight-navy transition-all duration-300 hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MessageCircle size={16} /> Request this quote
                      </a>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator size={28} className="text-white/25 mx-auto mb-3" />
                      <p className="font-body text-sm text-white/60">{placeholder}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          ) : null}

          {config && !isLoading && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="font-body text-[13px] text-white/45 text-center italic mt-10 max-w-lg mx-auto flex items-start justify-center gap-1.5"
            >
              <Info size={13} className="flex-shrink-0 mt-0.5" />
              Indicative pricing only — your final price is confirmed after a free design
              consultation with your artist. Minimum project {formatIDR(config.minimumPrice)}.
            </motion.p>
          )}
        </div>
      </section>
    </div>
  );
}
