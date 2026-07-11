// Client-side mirror of the server pricing engine (server/src/pricing/*).
// Same formula, same integer-IDR rules, so the calculator preview matches the
// server-authoritative result exactly. Keep in sync if the engine changes.

export interface BodyArea {
  id: string;
  name: string;
  group: string;
  basePrice: number;
  difficulty: number;
  minPrice: number;
}

export interface SizeCategory {
  id: string;
  name: string;
  maxCm2: number | null;
  multiplier: number;
  hint: string;
}

export interface MultiplierOption {
  id: string;
  name: string;
  multiplier: number;
  hint?: string;
}

export interface StyleOption {
  id: string;
  name: string;
  multiplier: number;
}

export interface ConditionOption {
  id: string;
  name: string;
  multiplier: number;
  minPrice: number;
}

export interface PricingConfig {
  currency: 'IDR';
  roundingStep: number;
  minimumPrice: number;
  rangeVariance: number;
  depositPercent: number;
  bodyAreas: BodyArea[];
  sizeCategories: SizeCategory[];
  styles: StyleOption[];
  detailLevels: MultiplierOption[];
  colourOptions: MultiplierOption[];
  conditions: ConditionOption[];
}

export interface TransportLocation {
  id: string;
  name: string;
  slug: string;
  zone: number;
  fee: number;
}

export interface PricingConfigResponse {
  version: { id: string; name: string; publishedAt: string | null };
  config: PricingConfig;
  transport: TransportLocation[];
}

export interface CalcInput {
  bodyAreaId: string;
  widthCm: number;
  heightCm: number;
  styleId: string;
  detailLevelId: string;
  colourOptionId: string;
  conditionId: string;
  transportFee: number;
}

export interface PriceBreakdown {
  bodyArea: string;
  sizeCategory: string;
  basePrice: number;
  sizeMultiplier: number;
  detailMultiplier: number;
  styleMultiplier: number;
  colourMultiplier: number;
  difficultyMultiplier: number;
  conditionMultiplier: number;
  subtotalBeforeFloor: number;
  appliedFloor: number;
  transportFee: number;
}

export interface PriceResult {
  estimatedPrice: number;
  priceMin: number;
  priceMax: number;
  deposit: number;
  currency: 'IDR';
  areaCm2: number;
  sessionMinutes: number;
  breakdown: PriceBreakdown;
}

const SETUP_MINUTES = 45;
const MINUTES_PER_CM2 = 1.2;
const MAX_SESSION_MINUTES = 480;

function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}

function mul(value: number, multiplier: number): number {
  return Math.round(value * multiplier);
}

function findSizeCategory(config: PricingConfig, areaCm2: number): SizeCategory | undefined {
  const sorted = [...config.sizeCategories].sort((a, b) => {
    const aMax = a.maxCm2 ?? Number.MAX_SAFE_INTEGER;
    const bMax = b.maxCm2 ?? Number.MAX_SAFE_INTEGER;
    return aMax - bMax;
  });
  return (
    sorted.find((c) => areaCm2 <= (c.maxCm2 ?? Number.MAX_SAFE_INTEGER)) ??
    sorted[sorted.length - 1]
  );
}

/** Pure price calculation — identical result to the server engine. Returns
 * null when required selections are missing (UI shows a placeholder). */
export function calculatePrice(input: CalcInput, config: PricingConfig): PriceResult | null {
  const area = config.bodyAreas.find((a) => a.id === input.bodyAreaId);
  const style = config.styles.find((s) => s.id === input.styleId);
  const detail = config.detailLevels.find((d) => d.id === input.detailLevelId);
  const colour = config.colourOptions.find((c) => c.id === input.colourOptionId);
  const condition = config.conditions.find((c) => c.id === input.conditionId);
  if (!area || !style || !detail || !colour || !condition) return null;

  const width = Number(input.widthCm);
  const height = Number(input.heightCm);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const areaCm2 = Math.round(width * height);

  const size = findSizeCategory(config, areaCm2);
  if (!size) return null;

  let subtotal = area.basePrice;
  subtotal = mul(subtotal, size.multiplier);
  subtotal = mul(subtotal, detail.multiplier);
  subtotal = mul(subtotal, style.multiplier);
  subtotal = mul(subtotal, colour.multiplier);
  subtotal = mul(subtotal, area.difficulty);
  subtotal = mul(subtotal, condition.multiplier);
  const subtotalBeforeFloor = subtotal;

  const floor = Math.max(config.minimumPrice || 0, area.minPrice || 0, condition.minPrice || 0);
  const appliedFloor = subtotal < floor ? floor : 0;
  subtotal = Math.max(subtotal, floor);

  const transportFee = Math.max(0, Math.round(Number(input.transportFee) || 0));
  subtotal += transportFee;

  const step = config.roundingStep > 0 ? config.roundingStep : 50000;
  const estimatedPrice = roundToStep(subtotal, step);
  const variance = config.rangeVariance > 0 ? config.rangeVariance : 0.15;
  const priceMin = roundToStep(estimatedPrice * (1 - variance), step);
  const priceMax = roundToStep(estimatedPrice * (1 + variance), step);
  const deposit = roundToStep((estimatedPrice * (config.depositPercent || 10)) / 100, step);

  const sessionMinutes = Math.min(
    MAX_SESSION_MINUTES,
    Math.round(SETUP_MINUTES + areaCm2 * MINUTES_PER_CM2 * detail.multiplier)
  );

  return {
    estimatedPrice,
    priceMin,
    priceMax,
    deposit,
    currency: 'IDR',
    areaCm2,
    sessionMinutes,
    breakdown: {
      bodyArea: area.name,
      sizeCategory: size.name,
      basePrice: area.basePrice,
      sizeMultiplier: size.multiplier,
      detailMultiplier: detail.multiplier,
      styleMultiplier: style.multiplier,
      colourMultiplier: colour.multiplier,
      difficultyMultiplier: area.difficulty,
      conditionMultiplier: condition.multiplier,
      subtotalBeforeFloor,
      appliedFloor,
      transportFee,
    },
  };
}

/** "Rp 4.350.000" — no decimals, Indonesian grouping. */
export function formatIDR(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

/** WhatsApp-safe variant (strips non-breaking spaces). */
export function formatIDRPlain(amount: number): string {
  return formatIDR(amount).replace(/ /g, ' ');
}

/** Human-friendly session length: 391 → "≈ 6–7 hours". */
export function formatSessionTime(minutes: number): string {
  if (minutes < 60) return `≈ ${minutes} minutes`;
  const low = Math.floor(minutes / 60);
  const high = Math.ceil(minutes / 60);
  if (minutes >= MAX_SESSION_MINUTES) return 'Full-day session (large projects may be split)';
  return low === high ? `≈ ${low} hour${low > 1 ? 's' : ''}` : `≈ ${low}–${high} hours`;
}
