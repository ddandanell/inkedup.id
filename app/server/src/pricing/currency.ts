// Integer-safe IDR helpers.
//
// JavaScript floats bite in two places here:
//   750000 * 1.1 === 825000.0000000001
//   Intl 'id-ID' output contains a non-breaking space (U+00A0)
// So: multiply then round at every step, round to the price step exactly once
// at the end, and never parse a formatted string back into a number.

/** Round to the nearest price step (e.g. 4.320.000 → 4.300.000 at step 50.000). */
export function roundToStep(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  if (step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}

/** Apply a multiplier with per-step integer rounding to avoid float dust. */
export function mul(value: number, multiplier: number): number {
  return Math.round(value * multiplier);
}

/** Format an integer IDR amount for display: "Rp 4.350.000" (no decimals). */
export function formatIDR(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

/** Like formatIDR but strips non-breaking spaces — safe for WhatsApp/plain text. */
export function formatIDRPlain(amount: number): string {
  return formatIDR(amount).replace(/ /g, ' ');
}
