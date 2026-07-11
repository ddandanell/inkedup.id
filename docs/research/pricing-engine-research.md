# InkedUp Pricing Engine — Research & Architecture Document

## Executive Summary

This document provides detailed findings for building a **flexible, rule-based pricing engine** for the InkedUp tattoo quotation system. The engine must support admin-configurable pricing variables, versioning for quote immutability, backend-authoritative calculations, IDR currency handling, and price range displays.

**Key Decisions Up Front:**
- **Database:** PostgreSQL (already migrated to Neon) with a snapshot-based versioning model
- **Architecture:** Dedicated `PricingEngine` service/module using a **rule-chain pattern** (not pure strategy — too rigid for tattoo pricing complexities)
- **Precision:** Store all monetary values as `INTEGER` ( Indonesian Rupiah / 1 = IDR 1 ), never use floating-point for money
- **Versioning:** Each `pricing_rules_version` row is a complete snapshot; quotes store `pricing_version_id` to lock their calculation basis
- **Range Display:** Compute min/max by varying size ±1 category and detail ±1 level from the selected inputs

---

## 1. Database Schema Design

### 1.1 Core Principle: Snapshot Versioning

Old quotes must **never** change when pricing rules update. The only way to guarantee this is:
1. Every pricing rule change creates a **new version** (a new row in `pricing_rules_versions`).
2. Each version stores a **complete, self-contained snapshot** of all multipliers and base prices at that point in time.
3. Every quote stores `pricing_version_id` — the version used to calculate it.
4. Calculations always use the snapshot from the quote's version.

**Why not effective-dating?** Effective-dating (`valid_from`, `valid_to`) works for "what is the current price?" but creates edge cases for quote guarantees. A quote created on Monday with rules that change Tuesday — does it use Monday's rules or Tuesday's? Explicit snapshot versioning removes all ambiguity.

### 1.2 Schema: PostgreSQL

```sql
-- ============================================================
-- PRICING ENGINE SCHEMA
-- Add these tables to the existing InkedUp PostgreSQL schema
-- ============================================================

-- -----------------------------------------------------------
-- 1. PRICING RULES VERSIONS (the snapshot container)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_rules_versions (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,                    -- e.g. "Summer 2025 Pricing"
  description     TEXT,
  status          TEXT NOT NULL
                  CHECK (status IN ('draft', 'published', 'archived'))
                  DEFAULT 'draft',
  created_by      TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,

  -- === SNAPSHOT FIELDS: all pricing data frozen at version creation ===
  -- Body area base prices (JSON: {"forearm": 2500000, "upper_arm": 3000000, ...})
  body_area_prices          JSONB NOT NULL DEFAULT '{}',

  -- Size multipliers (JSON: {"small": 1.0, "medium": 1.5, "large": 2.5, "xl": 4.0})
  size_multipliers          JSONB NOT NULL DEFAULT '{}',

  -- Detail level multipliers (JSON: {"simple": 1.0, "moderate": 1.3, "complex": 1.8, "hyperrealistic": 2.5})
  detail_multipliers        JSONB NOT NULL DEFAULT '{}',

  -- Style multipliers (JSON: {"blackwork": 1.0, "watercolor": 1.4, "japanese": 1.3, ...})
  style_multipliers         JSONB NOT NULL DEFAULT '{}',

  -- Colour multipliers (JSON: {"black_grey": 1.0, "colour": 1.2, "full_colour": 1.4})
  colour_multipliers        JSONB NOT NULL DEFAULT '{}',

  -- Placement difficulty multipliers (JSON: {"easy": 1.0, "medium": 1.15, "hard": 1.35, "very_hard": 1.6})
  placement_multipliers     JSONB NOT NULL DEFAULT '{}',

  -- Project condition multipliers (JSON: {"new": 1.0, "coverup": 1.3, "touchup": 0.7, "scar_cover": 1.5})
  project_condition_multipliers JSONB NOT NULL DEFAULT '{}',

  -- Override rules for complex scenarios (JSON array of rule objects)
  override_rules            JSONB NOT NULL DEFAULT '[]',

  -- Discount rules (JSON array: multi-area discounts, project category discounts)
  discount_rules            JSONB NOT NULL DEFAULT '[]',

  -- Fixed additional costs (JSON: {"consultation_fee": 0, "design_fee": 500000, "call_out_fee": 200000})
  fixed_costs               JSONB NOT NULL DEFAULT '{}',

  -- Currency & rounding config
  currency_code             TEXT NOT NULL DEFAULT 'IDR',
  rounding_step             INTEGER NOT NULL DEFAULT 50000,  -- round to nearest 50k IDR
  minimum_price             INTEGER NOT NULL DEFAULT 1000000, -- minimum quote amount

  -- Range calculation config
  range_size_variance       NUMERIC(3,2) NOT NULL DEFAULT 0.20,  -- ±20% for size
  range_detail_variance     NUMERIC(3,2) NOT NULL DEFAULT 0.15,  -- ±15% for detail

  -- Metadata
  is_default                BOOLEAN NOT NULL DEFAULT FALSE
);

-- Ensure only one published version is default at a time
CREATE UNIQUE INDEX idx_one_default_version
  ON pricing_rules_versions (is_default)
  WHERE is_default = TRUE;

-- Ensure only one published version (optional constraint — some businesses allow multiple published)
-- CREATE UNIQUE INDEX idx_one_published_version
--   ON pricing_rules_versions (status) WHERE status = 'published';

-- -----------------------------------------------------------
-- 2. REFERENCE TABLES (for UI dropdowns, validation, documentation)
-- These are NOT used in calculations — the snapshot JSONB is.
-- They provide the "vocabulary" of valid keys.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_areas (
  id          TEXT PRIMARY KEY,       -- "forearm", "full_sleeve"
  name        TEXT NOT NULL,          -- "Forearm", "Full Sleeve"
  slug        TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS size_categories (
  id          TEXT PRIMARY KEY,       -- "small", "medium", "large"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,                   -- e.g. "Up to 10cm"
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detail_levels (
  id          TEXT PRIMARY KEY,       -- "simple", "moderate", "complex"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colour_options (
  id          TEXT PRIMARY KEY,       -- "black_grey", "colour", "full_colour"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS placement_difficulties (
  id          TEXT PRIMARY KEY,       -- "easy", "medium", "hard", "very_hard"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_conditions (
  id          TEXT PRIMARY KEY,       -- "new", "coverup", "touchup", "scar_cover"
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 3. QUOTES TABLE (extends existing bookings concept)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id                    TEXT PRIMARY KEY,
  reference             TEXT UNIQUE,              -- "QTE-20250711-001"

  -- Customer info
  customer_name         TEXT NOT NULL,
  customer_email        TEXT NOT NULL,
  customer_whatsapp     TEXT NOT NULL,
  customer_location     TEXT NOT NULL,

  -- Tattoo specification
  body_area_id          TEXT NOT NULL REFERENCES body_areas(id),
  size_category_id      TEXT NOT NULL REFERENCES size_categories(id),
  style_id              TEXT NOT NULL REFERENCES styles(id),
  detail_level_id       TEXT NOT NULL REFERENCES detail_levels(id),
  colour_option_id      TEXT NOT NULL REFERENCES colour_options(id),
  placement_difficulty_id TEXT NOT NULL REFERENCES placement_difficulties(id),
  project_condition_id  TEXT NOT NULL REFERENCES project_conditions(id),

  -- Multiple areas (for complex projects)
  additional_areas      JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"body_area_id": "upper_arm", "size_category_id": "medium", ...}]

  -- Project description
  description           TEXT,
  reference_images      JSONB NOT NULL DEFAULT '[]',

  -- Pricing snapshot (IMMUTABLE — never changes after creation)
  pricing_version_id    INTEGER NOT NULL REFERENCES pricing_rules_versions(id),
  base_price            INTEGER NOT NULL,           -- body area base price used
  size_multiplier       NUMERIC(5,3) NOT NULL,
  detail_multiplier     NUMERIC(5,3) NOT NULL,
  style_multiplier      NUMERIC(5,3) NOT NULL,
  colour_multiplier     NUMERIC(5,3) NOT NULL,
  placement_multiplier  NUMERIC(5,3) NOT NULL,
  condition_multiplier  NUMERIC(5,3) NOT NULL,
  override_applied      JSONB,                      -- if an override rule fired
  discount_applied      JSONB,                      -- if a discount rule fired
  fixed_costs_total     INTEGER NOT NULL DEFAULT 0,

  -- Final calculated amounts
  estimated_price       INTEGER NOT NULL,           -- single point estimate
  price_min             INTEGER NOT NULL,           -- range low
  price_max             INTEGER NOT NULL,           -- range high

  -- Artist assignment
  artist_id             TEXT REFERENCES artists(id),
  artist_quote          INTEGER,                    -- artist's actual quote (may differ from estimate)

  -- Status lifecycle
  status                TEXT NOT NULL
                        CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'))
                        DEFAULT 'draft',
  expires_at            TIMESTAMPTZ,

  -- Audit
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by            TEXT REFERENCES users(id)
);

CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_customer ON quotes(customer_email);
CREATE INDEX idx_quotes_version ON quotes(pricing_version_id);
CREATE INDEX idx_quotes_artist ON quotes(artist_id);

-- -----------------------------------------------------------
-- 4. PRICING CHANGE LOG (audit trail for admin actions)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_change_logs (
  id              SERIAL PRIMARY KEY,
  version_id      INTEGER REFERENCES pricing_rules_versions(id),
  action          TEXT NOT NULL
                  CHECK (action IN ('created', 'published', 'archived', 'updated_field')),
  field_name      TEXT,
  old_value       JSONB,
  new_value       JSONB,
  performed_by    TEXT NOT NULL REFERENCES users(id),
  performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 5. TRIGGERS for updated_at
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Why JSONB for Snapshot Data?

| Approach | Pros | Cons |
|----------|------|------|
| **JSONB snapshot** (chosen) | Single row = complete version; easy to clone; fast to read; schema-flexible | Less type safety; need app-level validation |
| Normalized tables (`pricing_rules_body_areas`, etc.) | Full referential integrity; easy SQL queries | Many joins to reconstruct a version; harder to clone; schema changes require migrations |
| Hybrid (normalized + snapshot) | Best of both | More complex; overkill for this stage |

**Recommendation:** JSONB snapshot is correct for InkedUp's stage. The admin UI will validate keys against reference tables, and the pricing engine will validate at calculation time. If the business grows to need complex SQL analytics on pricing history, migrate to hybrid later.

### 1.4 Quote Versioning Guarantee

```sql
-- A quote's pricing fields are IMMUTABLE after creation.
-- The backend enforces this: recalculation is only allowed on DRAFT quotes.
-- Once SENT, the price fields are locked.
```

This means:
- Customer receives quote "QTE-20250711-001" for IDR 4,500,000
- Admin changes pricing rules the next day
- Quote "QTE-20250711-001" still shows IDR 4,500,000 forever
- New quotes use the new rules

---

## 2. Pricing Engine Architecture

### 2.1 Pattern Choice: Rule-Chain with Overrides

| Pattern | Fit for Tattoo Pricing? | Verdict |
|---------|------------------------|---------|
| **Strategy Pattern** | Too rigid; each "strategy" is a whole class. Hard to mix-and-match body area + size + style + ... | ❌ Overkill |
| **Simple Formula** | Works for 80% of cases, but "full sleeve overrides individual areas" and "cover-ups cost 30% more" need conditional logic | ❌ Too simple |
| **Rule Engine (Drools, etc.)** | Powerful, but heavy dependency. Not justified for this complexity level | ❌ Over-engineered |
| **Rule-Chain with Overrides** (chosen) | Sequential multiplier application + pre/post override rules. Clean, testable, extensible | ✅ Best fit |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PricingEngine Module                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Version     │  │  Calculator  │  │  RangeEstimator  │  │
│  │  Resolver    │→ │  (rule-chain)│→ │  (±variance)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         ↑                                                   │
│  ┌──────────────┐                                           │
│  │  Override    │  ← applies special rules before/after     │
│  │  Engine      │    base calculation                       │
│  └──────────────┘                                           │
│         ↑                                                   │
│  ┌──────────────┐                                           │
│  │  Discount    │  ← applies multi-area discounts           │
│  │  Engine      │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Module Structure (TypeScript)

```
server/src/pricing/
├── index.ts              # Public API: calculateQuote(), getCurrentRules()
├── types.ts              # PricingInput, QuoteBreakdown, PricingVersion
├── versionResolver.ts    # Find published version, load snapshot
├── calculator.ts         # Core rule-chain calculation
├── overrideEngine.ts     # Complex rule evaluation (full sleeve, etc.)
├── discountEngine.ts     # Multi-area discounts
├── rangeEstimator.ts     # Min/max computation
├── currency.ts           # IDR rounding, formatting
├── validators.ts         # Input validation against reference tables
└── __tests__/
    ├── calculator.test.ts
    └── overrides.test.ts
```

### 2.4 Handling Complex Rules

**Example: "Full Sleeve overrides individual area pricing"**

```typescript
// Stored in pricing_rules_versions.override_rules as JSONB:
const overrideRules = [
  {
    id: "override-full-sleeve",
    name: "Full Sleeve Flat Rate",
    condition: {
      body_area_id: "full_sleeve"
    },
    action: {
      type: "replace_base_price",
      base_price: 15000000,      // IDR 15M flat
      ignore_size_multiplier: true,  // size doesn't matter for full sleeve
      description: "Full sleeve projects are quoted at a flat rate"
    },
    priority: 100  // higher = evaluated first
  },
  {
    id: "override-coverup-minimum",
    name: "Cover-up Minimum Price",
    condition: {
      project_condition_id: "coverup"
    },
    action: {
      type: "minimum_floor",
      min_price: 3000000,
      description: "Cover-ups have a minimum price of IDR 3M"
    },
    priority: 90
  }
];
```

**Example: Multi-area discount**

```typescript
// Stored in pricing_rules_versions.discount_rules:
const discountRules = [
  {
    id: "discount-multi-area",
    name: "Multiple Areas Discount",
    condition: {
      min_areas: 2
    },
    action: {
      type: "percentage_discount",
      discount_percent: 10,
      apply_to: "subtotal",  // discount on pre-fixed-costs amount
      description: "10% off when tattooing 2+ areas in one session"
    }
  },
  {
    id: "discount-session-combo",
    name: "Full Day Session Combo",
    condition: {
      total_estimated_hours: { gte: 6 }
    },
    action: {
      type: "flat_discount",
      discount_amount: 500000,
      description: "IDR 500k off for full-day sessions (6h+)"
    }
  }
];
```

**Rule Evaluation Order:**
1. Load version snapshot
2. Validate all input keys exist in snapshot
3. **Pre-calculation overrides** (replace base price, lock multipliers)
4. Apply standard formula: base × size × detail × style × colour × placement × condition
5. **Post-calculation overrides** (minimum floors, maximum caps)
6. Apply discounts (percentage or flat)
7. Add fixed costs
8. Apply rounding
9. Compute range (min/max)

---

## 3. Admin Dashboard Patterns

### 3.1 Recommended UI Structure

```
Admin Pricing Dashboard (/admin/pricing)
│
├── Versions List
│   ├── Current Published: "Summer 2025" (active)
│   ├── Draft: "Fall 2025 Proposal"
│   └── Archived: "Spring 2025" (read-only)
│
├── Editor (per version)
│   ├── Tab: Body Areas        [grid of inputs]
│   ├── Tab: Size Multipliers  [slider + number input]
│   ├── Tab: Detail Levels     [same]
│   ├── Tab: Styles            [same]
│   ├── Tab: Colours           [same]
│   ├── Tab: Placement         [same]
│   ├── Tab: Conditions        [same]
│   ├── Tab: Overrides         [rule builder UI]
│   ├── Tab: Discounts         [rule builder UI]
│   └── Tab: Fixed Costs       [key-value pairs]
│
├── Preview Panel (side-by-side)
│   ├── Live calculator: test any combination
│   └── Shows: old price → new price → delta
│
└── Actions
    ├── Save Draft
    ├── Duplicate from Published
    ├── Publish (with confirmation modal)
    └── Archive
```

### 3.2 Key UI Patterns

| Pattern | Implementation | Why |
|---------|---------------|-----|
**Inline editable grid** | React Table / TanStack Table with editable cells | Fast bulk updates; admin sees everything at once |
**Change highlighting** | Cells turn yellow when modified, green when saved | Immediate visual feedback |
**Live preview calculator** | Sidebar with dropdowns for all factors; shows instant price | Admin validates changes before publishing |
**Before/After diff** | When previewing, show "was 1.3 → now 1.5 (+15%)" | Context for impact |
**Publish confirmation** | Modal lists all changed fields with counts | Prevents accidental publishes |
**Version timeline** | Visual timeline of all versions with publish dates | Business history visibility |

### 3.3 Publish Workflow

```
[Admin edits pricing] → [Saves as Draft]
                           ↓
              [Tests using Live Preview Calculator]
                           ↓
              [Clicks "Publish"]
                           ↓
              [Confirmation Modal: "This will affect all NEW quotes.
                3 existing drafts will be recalculated.
                47 sent quotes will NOT change."]
                           ↓
              [Publishes] → [Status: draft → published]
                           ↓
              [Previous published → archived automatically]
                           ↓
              [Audit log entry created]
```

**Important:** When a version is published, any `quotes` still in `draft` status that used the old published version should be **recalculated** (or flagged for admin review). Sent/accepted quotes are locked.

### 3.4 Bulk Updates

For bulk updates (e.g. "increase all style multipliers by 10%"):

```typescript
// Admin UI provides a "Bulk Operation" mode:
// 1. Select category: "Style Multipliers"
// 2. Operation: "multiply by" | "add" | "set to"
// 3. Value: 1.10
// 4. Preview: shows all values before/after
// 5. Apply to draft
```

---

## 4. Formula Implementation

### 4.1 Core TypeScript Code

```typescript
// ============================================================
// server/src/pricing/types.ts
// ============================================================

export interface PricingInput {
  body_area_id: string;
  size_category_id: string;
  style_id: string;
  detail_level_id: string;
  colour_option_id: string;
  placement_difficulty_id: string;
  project_condition_id: string;
  additional_areas?: AdditionalAreaInput[];
  session_hours_estimate?: number;  // for time-based discounts
}

export interface AdditionalAreaInput {
  body_area_id: string;
  size_category_id: string;
  detail_level_id: string;
  style_id: string;
  colour_option_id: string;
  placement_difficulty_id: string;
}

export interface QuoteBreakdown {
  version_id: number;
  base_price: number;
  size_multiplier: number;
  detail_multiplier: number;
  style_multiplier: number;
  colour_multiplier: number;
  placement_multiplier: number;
  condition_multiplier: number;
  subtotal_before_overrides: number;
  override_applied?: OverrideResult;
  discount_applied?: DiscountResult;
  fixed_costs_total: number;
  estimated_price: number;
  price_min: number;
  price_max: number;
  currency: string;
  calculation_log: CalculationStep[];
}

export interface CalculationStep {
  step: string;
  value: number;
  description: string;
}

export interface OverrideResult {
  rule_id: string;
  rule_name: string;
  action: string;
  description: string;
}

export interface DiscountResult {
  rule_id: string;
  rule_name: string;
  discount_amount: number;
  description: string;
}

export interface PricingVersionSnapshot {
  id: number;
  body_area_prices: Record<string, number>;
  size_multipliers: Record<string, number>;
  detail_multipliers: Record<string, number>;
  style_multipliers: Record<string, number>;
  colour_multipliers: Record<string, number>;
  placement_multipliers: Record<string, number>;
  project_condition_multipliers: Record<string, number>;
  override_rules: OverrideRule[];
  discount_rules: DiscountRule[];
  fixed_costs: Record<string, number>;
  currency_code: string;
  rounding_step: number;
  minimum_price: number;
  range_size_variance: number;
  range_detail_variance: number;
}

export interface OverrideRule {
  id: string;
  name: string;
  condition: Record<string, unknown>;
  action: {
    type: 'replace_base_price' | 'minimum_floor' | 'maximum_cap' | 'lock_multiplier' | 'add_fixed_cost';
    [key: string]: unknown;
  };
  priority: number;
}

export interface DiscountRule {
  id: string;
  name: string;
  condition: Record<string, unknown>;
  action: {
    type: 'percentage_discount' | 'flat_discount';
    discount_percent?: number;
    discount_amount?: number;
    apply_to: 'subtotal' | 'total';
    [key: string]: unknown;
  };
}
```

```typescript
// ============================================================
// server/src/pricing/currency.ts
// ============================================================

/**
 * NEVER use floating-point arithmetic for currency.
 * All prices are stored as INTEGER (Indonesian Rupiah / 1).
 * Multipliers use NUMERIC(5,3) in DB but are handled carefully in JS.
 */

/**
 * Round a price to the nearest step (e.g. 50,000 IDR).
 * Uses integer math to avoid floating-point errors.
 */
export function roundToStep(price: number, step: number): number {
  if (step <= 0) return Math.round(price);
  return Math.round(price / step) * step;
}

/**
 * Format IDR for display.
 */
export function formatIDR(amount: number): string {
  return `IDR ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format IDR range for display.
 */
export function formatIDRRange(min: number, max: number): string {
  return `${formatIDR(min)} to ${formatIDR(max)}`;
}

/**
 * Safe multiplication: multiply an integer by a decimal multiplier.
 * Returns an integer. Uses scaling to minimize floating-point error.
 */
export function applyMultiplier(base: number, multiplier: number): number {
  // Scale up, multiply, round, scale down
  // multiplier has at most 3 decimal places
  const scaled = Math.round(multiplier * 1000);
  return Math.round((base * scaled) / 1000);
}

/**
 * Apply percentage discount, returning integer result.
 */
export function applyPercentageDiscount(amount: number, percent: number): number {
  const discount = Math.round(amount * percent);  // percent as decimal, e.g. 0.10
  return amount - discount;
}
```

```typescript
// ============================================================
// server/src/pricing/calculator.ts
// ============================================================

import {
  PricingInput,
  QuoteBreakdown,
  PricingVersionSnapshot,
  CalculationStep,
  OverrideResult,
  DiscountResult,
} from './types.js';
import { roundToStep, applyMultiplier, applyPercentageDiscount } from './currency.js';
import { evaluateOverrides } from './overrideEngine.js';
import { evaluateDiscounts } from './discountEngine.js';

export function calculateQuote(
  input: PricingInput,
  version: PricingVersionSnapshot
): QuoteBreakdown {
  const log: CalculationStep[] = [];

  // ─── Step 1: Validate inputs exist in version snapshot ───
  const basePrice = version.body_area_prices[input.body_area_id];
  if (basePrice === undefined) {
    throw new Error(`Unknown body_area_id: ${input.body_area_id}`);
  }

  const sizeMult = version.size_multipliers[input.size_category_id];
  const detailMult = version.detail_multipliers[input.detail_level_id];
  const styleMult = version.style_multipliers[input.style_id];
  const colourMult = version.colour_multipliers[input.colour_option_id];
  const placementMult = version.placement_multipliers[input.placement_difficulty_id];
  const conditionMult = version.project_condition_multipliers[input.project_condition_id];

  for (const [key, val] of Object.entries({
    sizeMult, detailMult, styleMult, colourMult, placementMult, conditionMult,
  })) {
    if (val === undefined) {
      throw new Error(`Missing multiplier for: ${key}`);
    }
  }

  // ─── Step 2: Evaluate pre-calculation overrides ───
  let workingBasePrice = basePrice;
  let lockedMultipliers: Record<string, number | undefined> = {};
  let overrideResult: OverrideResult | undefined;

  const preOverrides = evaluateOverrides(input, version.override_rules, 'pre');
  for (const override of preOverrides) {
    if (override.action.type === 'replace_base_price') {
      workingBasePrice = override.action.base_price as number;
      log.push({ step: 'override_base', value: workingBasePrice, description: override.name });
    }
    if (override.action.type === 'lock_multiplier') {
      lockedMultipliers[override.action.multiplier_key as string] = override.action.value as number;
    }
    overrideResult = {
      rule_id: override.id,
      rule_name: override.name,
      action: override.action.type,
      description: override.name,
    };
  }

  // ─── Step 3: Apply standard formula ───
  const effectiveSizeMult = lockedMultipliers.size ?? sizeMult;
  const effectiveDetailMult = lockedMultipliers.detail ?? detailMult;
  const effectiveStyleMult = lockedMultipliers.style ?? styleMult;
  const effectiveColourMult = lockedMultipliers.colour ?? colourMult;
  const effectivePlacementMult = lockedMultipliers.placement ?? placementMult;
  const effectiveConditionMult = lockedMultipliers.condition ?? conditionMult;

  let subtotal = workingBasePrice;
  log.push({ step: 'base_price', value: subtotal, description: 'Body area base price' });

  subtotal = applyMultiplier(subtotal, effectiveSizeMult);
  log.push({ step: 'after_size', value: subtotal, description: `× ${effectiveSizeMult}` });

  subtotal = applyMultiplier(subtotal, effectiveDetailMult);
  log.push({ step: 'after_detail', value: subtotal, description: `× ${effectiveDetailMult}` });

  subtotal = applyMultiplier(subtotal, effectiveStyleMult);
  log.push({ step: 'after_style', value: subtotal, description: `× ${effectiveStyleMult}` });

  subtotal = applyMultiplier(subtotal, effectiveColourMult);
  log.push({ step: 'after_colour', value: subtotal, description: `× ${effectiveColourMult}` });

  subtotal = applyMultiplier(subtotal, effectivePlacementMult);
  log.push({ step: 'after_placement', value: subtotal, description: `× ${effectivePlacementMult}` });

  subtotal = applyMultiplier(subtotal, effectiveConditionMult);
  log.push({ step: 'after_condition', value: subtotal, description: `× ${effectiveConditionMult}` });

  const subtotalBeforeOverrides = subtotal;

  // ─── Step 4: Post-calculation overrides (floors, caps) ───
  const postOverrides = evaluateOverrides(input, version.override_rules, 'post');
  for (const override of postOverrides) {
    if (override.action.type === 'minimum_floor' && subtotal < (override.action.min_price as number)) {
      subtotal = override.action.min_price as number;
      log.push({ step: 'override_floor', value: subtotal, description: override.name });
      overrideResult = {
        rule_id: override.id,
        rule_name: override.name,
        action: override.action.type,
        description: `${override.name}: floor at ${override.action.min_price}`,
      };
    }
    if (override.action.type === 'maximum_cap' && subtotal > (override.action.max_price as number)) {
      subtotal = override.action.max_price as number;
      log.push({ step: 'override_cap', value: subtotal, description: override.name });
    }
  }

  // ─── Step 5: Additional areas ───
  if (input.additional_areas && input.additional_areas.length > 0) {
    for (const area of input.additional_areas) {
      const areaBase = version.body_area_prices[area.body_area_id];
      if (areaBase === undefined) continue;

      const aSize = version.size_multipliers[area.size_category_id] ?? 1;
      const aDetail = version.detail_multipliers[area.detail_level_id] ?? 1;
      const aStyle = version.style_multipliers[area.style_id] ?? 1;
      const aColour = version.colour_multipliers[area.colour_option_id] ?? 1;
      const aPlacement = version.placement_multipliers[area.placement_difficulty_id] ?? 1;

      let areaSubtotal = areaBase;
      areaSubtotal = applyMultiplier(areaSubtotal, aSize);
      areaSubtotal = applyMultiplier(areaSubtotal, aDetail);
      areaSubtotal = applyMultiplier(areaSubtotal, aStyle);
      areaSubtotal = applyMultiplier(areaSubtotal, aColour);
      areaSubtotal = applyMultiplier(areaSubtotal, aPlacement);

      subtotal += areaSubtotal;
      log.push({ step: 'additional_area', value: areaSubtotal, description: `Area: ${area.body_area_id}` });
    }
  }

  // ─── Step 6: Discounts ───
  let discountResult: DiscountResult | undefined;
  const applicableDiscounts = evaluateDiscounts(input, version.discount_rules, subtotal);
  for (const discount of applicableDiscounts) {
    const beforeDiscount = subtotal;
    if (discount.action.type === 'percentage_discount' && discount.action.discount_percent) {
      const discountAmount = Math.round(subtotal * discount.action.discount_percent);
      subtotal -= discountAmount;
      log.push({ step: 'discount', value: subtotal, description: `${discount.name}: -${discountAmount}` });
      discountResult = {
        rule_id: discount.id,
        rule_name: discount.name,
        discount_amount: discountAmount,
        description: discount.name,
      };
    }
    if (discount.action.type === 'flat_discount' && discount.action.discount_amount) {
      subtotal -= discount.action.discount_amount;
      log.push({ step: 'discount', value: subtotal, description: `${discount.name}: -${discount.action.discount_amount}` });
      discountResult = {
        rule_id: discount.id,
        rule_name: discount.name,
        discount_amount: discount.action.discount_amount as number,
        description: discount.name,
      };
    }
  }

  // ─── Step 7: Fixed costs ───
  let fixedCostsTotal = 0;
  for (const [name, amount] of Object.entries(version.fixed_costs)) {
    fixedCostsTotal += amount;
    log.push({ step: 'fixed_cost', value: amount, description: name });
  }
  subtotal += fixedCostsTotal;

  // ─── Step 8: Minimum price floor ───
  if (subtotal < version.minimum_price) {
    subtotal = version.minimum_price;
    log.push({ step: 'minimum_floor', value: subtotal, description: `Minimum: ${version.minimum_price}` });
  }

  // ─── Step 9: Round to step ───
  const estimatedPrice = roundToStep(subtotal, version.rounding_step);
  log.push({ step: 'rounded', value: estimatedPrice, description: `Rounded to ${version.rounding_step}` });

  // ─── Step 10: Calculate range ───
  const { min, max } = calculateRange(input, version, estimatedPrice);

  return {
    version_id: version.id,
    base_price: workingBasePrice,
    size_multiplier: effectiveSizeMult,
    detail_multiplier: effectiveDetailMult,
    style_multiplier: effectiveStyleMult,
    colour_multiplier: effectiveColourMult,
    placement_multiplier: effectivePlacementMult,
    condition_multiplier: effectiveConditionMult,
    subtotal_before_overrides: subtotalBeforeOverrides,
    override_applied: overrideResult,
    discount_applied: discountResult,
    fixed_costs_total: fixedCostsTotal,
    estimated_price: estimatedPrice,
    price_min: min,
    price_max: max,
    currency: version.currency_code,
    calculation_log: log,
  };
}
```

```typescript
// ============================================================
// server/src/pricing/rangeEstimator.ts
// ============================================================

import { PricingInput, PricingVersionSnapshot } from './types.js';
import { calculateQuote } from './calculator.js';

/**
 * Calculate min/max price range by varying key inputs.
 * Strategy: vary size and detail by ±1 level to create a natural range.
 */
export function calculateRange(
  input: PricingInput,
  version: PricingVersionSnapshot,
  baseEstimate: number
): { min: number; max: number } {
  // Get ordered keys from the version snapshot
  const sizeKeys = Object.keys(version.size_multipliers);
  const detailKeys = Object.keys(version.detail_multipliers);

  const currentSizeIndex = sizeKeys.indexOf(input.size_category_id);
  const currentDetailIndex = detailKeys.indexOf(input.detail_level_id);

  // Build variant inputs
  const variants: PricingInput[] = [];

  // Variant: smaller size (if possible)
  if (currentSizeIndex > 0) {
    variants.push({ ...input, size_category_id: sizeKeys[currentSizeIndex - 1] });
  }
  // Variant: larger size (if possible)
  if (currentSizeIndex < sizeKeys.length - 1) {
    variants.push({ ...input, size_category_id: sizeKeys[currentSizeIndex + 1] });
  }
  // Variant: simpler detail (if possible)
  if (currentDetailIndex > 0) {
    variants.push({ ...input, detail_level_id: detailKeys[currentDetailIndex - 1] });
  }
  // Variant: more complex detail (if possible)
  if (currentDetailIndex < detailKeys.length - 1) {
    variants.push({ ...input, detail_level_id: detailKeys[currentDetailIndex + 1] });
  }

  // Also compute with percentage variance from config
  const varianceMin = Math.round(baseEstimate * (1 - version.range_size_variance));
  const varianceMax = Math.round(baseEstimate * (1 + version.range_detail_variance));

  // Run each variant through the calculator
  const variantPrices = variants.map((v) => {
    try {
      return calculateQuote(v, version).estimated_price;
    } catch {
      return baseEstimate;
    }
  });

  const allPrices = [...variantPrices, varianceMin, varianceMax, baseEstimate];
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);

  // Round both to the version's rounding step
  const { roundToStep } = await import('./currency.js');
  return {
    min: roundToStep(min, version.rounding_step),
    max: roundToStep(max, version.rounding_step),
  };
}
```

```typescript
// ============================================================
// server/src/pricing/overrideEngine.ts
// ============================================================

import { OverrideRule, PricingInput } from './types.js';

export function evaluateOverrides(
  input: PricingInput,
  rules: OverrideRule[],
  phase: 'pre' | 'post'
): OverrideRule[] {
  const applicable: OverrideRule[] = [];

  for (const rule of rules) {
    if (matchesCondition(input, rule.condition)) {
      // Pre-phase rules: replace_base_price, lock_multiplier
      // Post-phase rules: minimum_floor, maximum_cap
      const isPreRule = ['replace_base_price', 'lock_multiplier', 'add_fixed_cost'].includes(rule.action.type);
      const isPostRule = ['minimum_floor', 'maximum_cap'].includes(rule.action.type);

      if (phase === 'pre' && isPreRule) applicable.push(rule);
      if (phase === 'post' && isPostRule) applicable.push(rule);
    }
  }

  // Sort by priority (highest first)
  return applicable.sort((a, b) => b.priority - a.priority);
}

function matchesCondition(input: PricingInput, condition: Record<string, unknown>): boolean {
  for (const [key, expected] of Object.entries(condition)) {
    const actual = (input as Record<string, unknown>)[key];
    if (actual !== expected) return false;
  }
  return true;
}
```

```typescript
// ============================================================
// server/src/pricing/discountEngine.ts
// ============================================================

import { DiscountRule, PricingInput } from './types.js';

export function evaluateDiscounts(
  input: PricingInput,
  rules: DiscountRule[],
  currentSubtotal: number
): DiscountRule[] {
  const applicable: DiscountRule[] = [];

  for (const rule of rules) {
    if (matchesDiscountCondition(input, rule.condition, currentSubtotal)) {
      applicable.push(rule);
    }
  }

  return applicable;
}

function matchesDiscountCondition(
  input: PricingInput,
  condition: Record<string, unknown>,
  _subtotal: number
): boolean {
  // Check multi-area conditions
  if (condition.min_areas !== undefined) {
    const areaCount = 1 + (input.additional_areas?.length ?? 0);
    if (areaCount < (condition.min_areas as number)) return false;
  }

  // Check total_estimated_hours conditions
  if (condition.total_estimated_hours !== undefined) {
    const hrs = condition.total_estimated_hours as Record<string, number>;
    const estimate = input.session_hours_estimate ?? 0;
    if (hrs.gte !== undefined && estimate < hrs.gte) return false;
    if (hrs.lte !== undefined && estimate > hrs.lte) return false;
  }

  // Simple equality conditions
  for (const [key, expected] of Object.entries(condition)) {
    if (key === 'min_areas' || key === 'total_estimated_hours') continue;
    const actual = (input as Record<string, unknown>)[key];
    if (actual !== expected) return false;
  }

  return true;
}
```

### 4.2 Floating-Point Safety

```typescript
// Critical rule: NEVER store or calculate currency as float.
//
// ✅ CORRECT: All DB columns for money are INTEGER (IDR cents / 1 IDR unit)
// ❌ WRONG:  DOUBLE PRECISION for price columns
//
// The applyMultiplier function scales multipliers by 1000, multiplies as integers,
// then divides and rounds. This keeps error within 0.5 IDR (negligible).
//
// For even stricter safety, use a library like dinero.js or currency.js:
//   import { dinero, multiply, toSnapshot } from 'dinero.js';
//   import { IDR } from '@dinero.js/currencies';
// But for InkedUp's current scale, the integer-scaling approach above is sufficient.
```

---

## 5. API Design

### 5.1 Endpoints

#### POST /api/pricing/calculate
Calculate a price estimate (public or authenticated).

**Request:**
```json
{
  "body_area_id": "forearm",
  "size_category_id": "medium",
  "style_id": "blackwork",
  "detail_level_id": "moderate",
  "colour_option_id": "black_grey",
  "placement_difficulty_id": "medium",
  "project_condition_id": "new",
  "additional_areas": [
    {
      "body_area_id": "wrist",
      "size_category_id": "small",
      "style_id": "blackwork",
      "detail_level_id": "simple",
      "colour_option_id": "black_grey",
      "placement_difficulty_id": "easy"
    }
  ],
  "session_hours_estimate": 4
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "estimate": {
      "price": 5200000,
      "price_min": 4200000,
      "price_max": 6400000,
      "currency": "IDR",
      "formatted": "IDR 5,200,000",
      "formatted_range": "IDR 4,200,000 to IDR 6,400,000"
    },
    "breakdown": {
      "version_id": 3,
      "base_price": 2500000,
      "size_multiplier": 1.5,
      "detail_multiplier": 1.3,
      "style_multiplier": 1.0,
      "colour_multiplier": 1.0,
      "placement_multiplier": 1.15,
      "condition_multiplier": 1.0,
      "subtotal_before_overrides": 5630625,
      "override_applied": null,
      "discount_applied": {
        "rule_id": "discount-multi-area",
        "rule_name": "Multiple Areas Discount",
        "discount_amount": 563063,
        "description": "10% off when tattooing 2+ areas in one session"
      },
      "fixed_costs_total": 0,
      "estimated_price": 5200000,
      "price_min": 4200000,
      "price_max": 6400000
    },
    "calculation_log": [
      { "step": "base_price", "value": 2500000, "description": "Body area base price" },
      { "step": "after_size", "value": 3750000, "description": "× 1.5" },
      { "step": "after_detail", "value": 4875000, "description": "× 1.3" },
      { "step": "after_placement", "value": 5606250, "description": "× 1.15" },
      { "step": "additional_area", "value": 1250000, "description": "Area: wrist" },
      { "step": "discount", "value": 5067563, "description": "Multiple Areas Discount: -563063" },
      { "step": "rounded", "value": 5200000, "description": "Rounded to 50000" }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PRICING_INPUT",
    "message": "Unknown body_area_id: 'lower_leg'",
    "field": "body_area_id"
  }
}
```

---

#### GET /api/pricing/rules
Fetch current published pricing rules (for frontend dropdown population).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "version": {
      "id": 3,
      "name": "Summer 2025 Pricing",
      "published_at": "2025-06-01T00:00:00Z"
    },
    "body_areas": [
      { "id": "forearm", "name": "Forearm", "base_price": 2500000 },
      { "id": "upper_arm", "name": "Upper Arm", "base_price": 3000000 },
      { "id": "full_sleeve", "name": "Full Sleeve", "base_price": 15000000 },
      { "id": "chest", "name": "Chest", "base_price": 3500000 },
      { "id": "back", "name": "Back", "base_price": 4000000 }
    ],
    "size_categories": [
      { "id": "small", "name": "Small (up to 10cm)", "multiplier": 1.0 },
      { "id": "medium", "name": "Medium (10–20cm)", "multiplier": 1.5 },
      { "id": "large", "name": "Large (20–30cm)", "multiplier": 2.5 },
      { "id": "xl", "name": "Extra Large (30cm+)", "multiplier": 4.0 }
    ],
    "detail_levels": [
      { "id": "simple", "name": "Simple", "multiplier": 1.0 },
      { "id": "moderate", "name": "Moderate", "multiplier": 1.3 },
      { "id": "complex", "name": "Complex", "multiplier": 1.8 },
      { "id": "hyperrealistic", "name": "Hyperrealistic", "multiplier": 2.5 }
    ],
    "styles": [
      { "id": "blackwork", "name": "Blackwork", "multiplier": 1.0 },
      { "id": "japanese", "name": "Japanese", "multiplier": 1.3 },
      { "id": "watercolor", "name": "Watercolor", "multiplier": 1.4 },
      { "id": "realism", "name": "Realism", "multiplier": 1.5 }
    ],
    "colour_options": [
      { "id": "black_grey", "name": "Black & Grey", "multiplier": 1.0 },
      { "id": "colour", "name": "Colour", "multiplier": 1.2 },
      { "id": "full_colour", "name": "Full Colour", "multiplier": 1.4 }
    ],
    "placement_difficulties": [
      { "id": "easy", "name": "Easy", "multiplier": 1.0 },
      { "id": "medium", "name": "Medium", "multiplier": 1.15 },
      { "id": "hard", "name": "Hard", "multiplier": 1.35 },
      { "id": "very_hard", "name": "Very Hard", "multiplier": 1.6 }
    ],
    "project_conditions": [
      { "id": "new", "name": "New Tattoo", "multiplier": 1.0 },
      { "id": "coverup", "name": "Cover-up", "multiplier": 1.3 },
      { "id": "touchup", "name": "Touch-up", "multiplier": 0.7 },
      { "id": "scar_cover", "name": "Scar Cover", "multiplier": 1.5 }
    ],
    "fixed_costs": {
      "consultation_fee": 0,
      "design_fee": 500000
    },
    "currency": "IDR",
    "rounding_step": 50000,
    "minimum_price": 1000000
  }
}
```

---

#### POST /api/quotes (extends existing bookings flow)
Create a new quote (customer-facing or admin).

**Request:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_whatsapp": "+6281234567890",
  "customer_location": "Canggu",
  "body_area_id": "forearm",
  "size_category_id": "medium",
  "style_id": "blackwork",
  "detail_level_id": "moderate",
  "colour_option_id": "black_grey",
  "placement_difficulty_id": "medium",
  "project_condition_id": "new",
  "description": "Geometric mandala design",
  "reference_images": ["https://..."]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "quote": {
      "id": "qte_abc123",
      "reference": "QTE-20250711-001",
      "customer_name": "John Doe",
      "status": "draft",
      "pricing": {
        "estimated_price": 5200000,
        "price_min": 4200000,
        "price_max": 6400000,
        "currency": "IDR"
      },
      "created_at": "2025-07-11T10:30:00Z",
      "expires_at": "2025-07-18T10:30:00Z"
    }
  }
}
```

---

#### GET /api/admin/pricing/versions (admin only)
List all pricing versions.

**Response:**
```json
{
  "success": true,
  "data": {
    "versions": [
      { "id": 3, "name": "Summer 2025 Pricing", "status": "published", "is_default": true, "published_at": "2025-06-01T00:00:00Z" },
      { "id": 4, "name": "Fall 2025 Proposal", "status": "draft", "is_default": false, "created_at": "2025-07-10T00:00:00Z" },
      { "id": 2, "name": "Spring 2025", "status": "archived", "is_default": false, "archived_at": "2025-06-01T00:00:00Z" }
    ]
  }
}
```

---

#### POST /api/admin/pricing/versions (admin only)
Create a new pricing version (as draft).

**Request:**
```json
{
  "name": "Fall 2025 Pricing",
  "description": "Updated rates for peak season",
  "copy_from_version_id": 3,  // optional: clone existing version
  "body_area_prices": { "forearm": 2750000, "upper_arm": 3250000, ... },
  "size_multipliers": { "small": 1.0, "medium": 1.5, ... },
  ... // all snapshot fields
}
```

---

#### POST /api/admin/pricing/versions/:id/publish (admin only)
Publish a draft version.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Version 4 published successfully.",
    "affected_draft_quotes": 3,
    "previous_published": 3
  }
}
```

---

### 5.2 Quote Submission Flow Integration

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Customer   │────→│  Frontend Form   │────→│  POST        │
│   Fills Form │     │  (React + RHF)   │     │  /pricing/   │
└──────────────┘     │                  │     │  calculate   │
                     │ Live preview     │←────│  (optional)  │
                     │ calls API        │     └──────────────┘
                     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Customer clicks │
                     │  "Get Quote"     │
                     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  POST /quotes    │
                     │  Backend:        │
                     │  1. Load current │
                     │     published    │
                     │     version      │
                     │  2. Calculate    │
                     │  3. Save quote   │
                     │     with version │
                     │     snapshot     │
                     │  4. Return quote │
                     └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Customer sees   │
                     │  quote with      │
                     │  price range     │
                     │  (locked)        │
                     └──────────────────┘
```

**Important:** The frontend can call `/api/pricing/calculate` for live preview while the customer is filling the form. But when they submit, the backend recalculates using the **current published version** and stores the result. The frontend preview is advisory; the backend calculation is authoritative.

---

## 6. Migration Path (From Current Schema)

### 6.1 Step-by-Step

1. **Create pricing tables** (run the SQL above)
2. **Seed reference tables** with initial vocabulary:
   ```sql
   INSERT INTO body_areas (id, name, slug, display_order) VALUES
   ('forearm', 'Forearm', 'forearm', 1),
   ('upper_arm', 'Upper Arm', 'upper-arm', 2),
   ('full_sleeve', 'Full Sleeve', 'full-sleeve', 3),
   ('chest', 'Chest', 'chest', 4),
   ('back', 'Back', 'back', 5),
   ('thigh', 'Thigh', 'thigh', 6),
   ('calf', 'Calf', 'calf', 7),
   ('wrist', 'Wrist', 'wrist', 8),
   ('ankle', 'Ankle', 'ankle', 9);
   ```
3. **Create first pricing version** from current `artists.pricing` data:
   - Extract average base prices from artist pricing
   - Set multipliers to `1.0` initially
   - Publish as version 1
4. **Update bookings table** to link to quotes (or create quotes table)
5. **Build admin UI** for pricing management
6. **Replace existing pricing display** in frontend with new API

### 6.2 Backward Compatibility

During transition:
- Keep `artists.pricing` JSON column as fallback
- New quotes use pricing engine
- Old quotes continue to display `total_price` as stored

---

## 7. Testing Strategy

```typescript
// Example test cases for the pricing engine

describe('PricingEngine', () => {
  const baseVersion: PricingVersionSnapshot = {
    id: 1,
    body_area_prices: { forearm: 2500000, wrist: 1000000 },
    size_multipliers: { small: 1.0, medium: 1.5, large: 2.5 },
    detail_multipliers: { simple: 1.0, moderate: 1.3, complex: 1.8 },
    style_multipliers: { blackwork: 1.0, japanese: 1.3 },
    colour_multipliers: { black_grey: 1.0, colour: 1.2 },
    placement_multipliers: { easy: 1.0, medium: 1.15, hard: 1.35 },
    project_condition_multipliers: { new: 1.0, coverup: 1.3 },
    override_rules: [],
    discount_rules: [],
    fixed_costs: { design_fee: 500000 },
    currency_code: 'IDR',
    rounding_step: 50000,
    minimum_price: 1000000,
    range_size_variance: 0.20,
    range_detail_variance: 0.15,
  };

  test('basic calculation', () => {
    const input: PricingInput = {
      body_area_id: 'forearm',
      size_category_id: 'medium',
      style_id: 'blackwork',
      detail_level_id: 'moderate',
      colour_option_id: 'black_grey',
      placement_difficulty_id: 'medium',
      project_condition_id: 'new',
    };

    const result = calculateQuote(input, baseVersion);

    // 2,500,000 × 1.5 = 3,750,000
    // × 1.3 = 4,875,000
    // × 1.15 = 5,606,250
    // + 500,000 = 6,106,250
    // round to 50,000 = 6,100,000
    expect(result.estimated_price).toBe(6100000);
    expect(result.currency).toBe('IDR');
  });

  test('unknown body_area throws', () => {
    const input = { ...baseInput, body_area_id: 'nose' };
    expect(() => calculateQuote(input, baseVersion)).toThrow('Unknown body_area_id');
  });

  test('full sleeve override replaces base', () => {
    const versionWithOverride = {
      ...baseVersion,
      override_rules: [{
        id: 'full-sleeve',
        name: 'Full Sleeve Flat',
        condition: { body_area_id: 'full_sleeve' },
        action: { type: 'replace_base_price', base_price: 15000000 },
        priority: 100,
      }],
    };

    const input = { ...baseInput, body_area_id: 'full_sleeve' };
    const result = calculateQuote(input, versionWithOverride);
    expect(result.base_price).toBe(15000000);
  });
});
```

---

## 8. Summary of Recommendations

| Area | Recommendation |
|------|---------------|
| **Versioning** | Snapshot-based (`pricing_rules_versions` with JSONB). Each quote stores `pricing_version_id`. Old quotes are immutable. |
| **Currency** | `INTEGER` columns (IDR / 1). No decimals. No floating-point money. |
| **Rounding** | Round to nearest 50,000 IDR using integer math. |
| **Architecture** | Dedicated `PricingEngine` module with rule-chain pattern. |
| **Overrides** | JSONB array in version snapshot; evaluated pre- and post-calculation. |
| **Range Display** | Vary size/detail ±1 level + percentage variance from config. |
| **Admin UI** | Inline-editable grids with live preview calculator. Draft → Publish workflow. |
| **API Auth** | `/api/pricing/*` public (for quotes). `/api/admin/pricing/*` admin-only. |
| **Backend Authority** | Frontend preview calls `/api/pricing/calculate`. Quote creation calls `/api/quotes` which recalculates server-side. |

---

*Document generated for InkedUp pricing engine architecture.*
