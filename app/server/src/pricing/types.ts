// Pricing engine types — the single contract shared by the public calculator,
// the admin pricing editor, and the calculation engine.
//
// Money rules: every price is an INTEGER in IDR (1 = Rp 1). Multipliers are
// plain numbers applied with per-step rounding (see currency.ts).

export interface BodyArea {
  id: string; // 'forearm'
  name: string; // 'Forearm'
  group: string; // 'Arms' — used to group chips in the UI
  basePrice: number; // IDR base for a small reference piece on this area
  difficulty: number; // placement difficulty multiplier (1.0 = standard)
  minPrice: number; // IDR floor specific to this area (0 = none)
}

export interface SizeCategory {
  id: string; // 'medium'
  name: string; // 'Medium'
  maxCm2: number | null; // inclusive upper bound; null = no limit
  multiplier: number;
  hint: string; // short human description for the UI
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
  minPrice: number; // IDR floor (e.g. cover-ups never below Rp 3.000.000)
}

export interface PricingConfig {
  currency: 'IDR';
  roundingStep: number; // round final price to this step, e.g. 50000
  minimumPrice: number; // global floor, e.g. 2000000 (villa service minimum)
  rangeVariance: number; // ± range shown to customers, e.g. 0.15
  depositPercent: number; // suggested deposit, e.g. 10
  bodyAreas: BodyArea[];
  sizeCategories: SizeCategory[];
  styles: StyleOption[];
  detailLevels: MultiplierOption[];
  colourOptions: MultiplierOption[];
  conditions: ConditionOption[];
}

export interface CalcInput {
  bodyAreaId: string;
  widthCm: number;
  heightCm: number;
  styleId: string;
  detailLevelId: string;
  colourOptionId: string;
  conditionId: string;
  transportFee: number; // resolved IDR fee for the customer's zone (0 if none)
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
  appliedFloor: number; // the floor that was enforced (0 if none)
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

export interface PricingVersionRow {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  config: string; // JSON-encoded PricingConfig
  created_at: string;
  updated_at: string;
  published_at: string | null;
}
