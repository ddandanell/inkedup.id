// Pricing engine — pure, deterministic, integer-IDR.
//
// Formula (rule-chain, one multiplier applied after another):
//   base area price
//   × size × detail × style × colour × placement difficulty × condition
//   → floor (global minimum / area / condition minimums)
//   → + transport
//   → round to price step
//   → customer range ±variance
//
// The engine is deliberately independent from any visual body-map UI: it only
// consumes structured inputs, so the owner can change every number in the
// admin panel without touching the calculator.

import { mul, roundToStep } from './currency.js';
import type { CalcInput, PriceResult, PricingConfig } from './types.js';

const MAX_DIMENSION_CM = 300;
const MAX_AREA_CM2 = 4000;
const SETUP_MINUTES = 45;
const MINUTES_PER_CM2 = 1.2; // ≈ 8 minutes per square inch
const MAX_SESSION_MINUTES = 480; // beyond this it becomes a multi-session project

function findById<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown ${label}: ${id}`);
  return item;
}

function findSizeCategory(config: PricingConfig, areaCm2: number) {
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

export function calculatePrice(input: CalcInput, config: PricingConfig): PriceResult {
  const width = Number(input.widthCm);
  const height = Number(input.heightCm);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive numbers (cm).');
  }
  if (width > MAX_DIMENSION_CM || height > MAX_DIMENSION_CM) {
    throw new Error(`Dimensions above ${MAX_DIMENSION_CM}cm are not realistic — please check.`);
  }

  const areaCm2 = Math.round(width * height);
  if (areaCm2 > MAX_AREA_CM2) {
    throw new Error('That coverage is larger than a full bodysuit — please split it into projects.');
  }

  const area = findById(config.bodyAreas, input.bodyAreaId, 'body area');
  const style = findById(config.styles, input.styleId, 'style');
  const detail = findById(config.detailLevels, input.detailLevelId, 'detail level');
  const colour = findById(config.colourOptions, input.colourOptionId, 'colour option');
  const condition = findById(config.conditions, input.conditionId, 'project condition');
  const size = findSizeCategory(config, areaCm2);
  if (!size) throw new Error('No size categories configured.');

  // Rule-chain: per-step rounding keeps everything integer IDR.
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
