// Default published pricing configuration — seeded once into Neon.
//
// Market context (Bali, 2026): studio smalls start ~Rp 500k–1,5M, Canggu/Ubud
// mediums Rp 3–5M, larges Rp 6M+, sleeves Rp 25–36M, hourly Rp 1–1,7M. The only
// mobile/villa competitor has a Rp 2,5M minimum. InkedUp is a premium villa
// concierge, so the floor is Rp 2.000.000 — premium, still undercuts the
// competitor, and signals "we do serious pieces, not walk-in smalls".
//
// Every value below is editable in /admin/pricing. This file is only the seed.

import type { PricingConfig } from './types.js';

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  currency: 'IDR',
  roundingStep: 50000,
  minimumPrice: 2000000,
  rangeVariance: 0.15,
  depositPercent: 10,

  bodyAreas: [
    // Arms
    { id: 'shoulder', name: 'Shoulder', group: 'Arms', basePrice: 1000000, difficulty: 1.0, minPrice: 0 },
    { id: 'upper-arm', name: 'Upper Arm', group: 'Arms', basePrice: 1000000, difficulty: 1.0, minPrice: 0 },
    { id: 'forearm', name: 'Forearm', group: 'Arms', basePrice: 1000000, difficulty: 1.0, minPrice: 0 },
    { id: 'wrist', name: 'Wrist', group: 'Arms', basePrice: 800000, difficulty: 1.0, minPrice: 0 },
    { id: 'hand', name: 'Hand', group: 'Arms', basePrice: 1200000, difficulty: 1.2, minPrice: 0 },
    // Torso
    { id: 'chest', name: 'Chest', group: 'Torso', basePrice: 1500000, difficulty: 1.1, minPrice: 0 },
    { id: 'stomach', name: 'Stomach', group: 'Torso', basePrice: 1200000, difficulty: 1.2, minPrice: 0 },
    { id: 'ribs', name: 'Ribs', group: 'Torso', basePrice: 1500000, difficulty: 1.4, minPrice: 0 },
    { id: 'upper-back', name: 'Upper Back', group: 'Torso', basePrice: 1500000, difficulty: 1.1, minPrice: 0 },
    { id: 'lower-back', name: 'Lower Back', group: 'Torso', basePrice: 1200000, difficulty: 1.1, minPrice: 0 },
    { id: 'full-back', name: 'Full Back', group: 'Torso', basePrice: 3000000, difficulty: 1.2, minPrice: 0 },
    // Legs
    { id: 'thigh', name: 'Thigh', group: 'Legs', basePrice: 1200000, difficulty: 1.0, minPrice: 0 },
    { id: 'knee', name: 'Knee', group: 'Legs', basePrice: 1000000, difficulty: 1.3, minPrice: 0 },
    { id: 'calf', name: 'Calf', group: 'Legs', basePrice: 1000000, difficulty: 1.0, minPrice: 0 },
    { id: 'ankle', name: 'Ankle', group: 'Legs', basePrice: 800000, difficulty: 1.0, minPrice: 0 },
    { id: 'foot', name: 'Foot', group: 'Legs', basePrice: 1000000, difficulty: 1.2, minPrice: 0 },
    // Head & neck
    { id: 'neck', name: 'Neck', group: 'Head & Neck', basePrice: 1500000, difficulty: 1.3, minPrice: 0 },
    { id: 'head', name: 'Head', group: 'Head & Neck', basePrice: 2000000, difficulty: 1.5, minPrice: 0 },
    // Other
    { id: 'hip', name: 'Hip', group: 'Other', basePrice: 1000000, difficulty: 1.0, minPrice: 0 },
    { id: 'buttocks', name: 'Buttocks', group: 'Other', basePrice: 1500000, difficulty: 1.3, minPrice: 0 },
  ],

  sizeCategories: [
    { id: 'extra-small', name: 'Extra Small', maxCm2: 10, multiplier: 1.0, hint: 'Coin-sized — tiny symbol, fine script' },
    { id: 'small', name: 'Small', maxCm2: 30, multiplier: 1.3, hint: 'Credit-card sized — small motif' },
    { id: 'medium', name: 'Medium', maxCm2: 80, multiplier: 1.8, hint: 'Palm-sized — forearm band, statement piece' },
    { id: 'large', name: 'Large', maxCm2: 180, multiplier: 2.5, hint: 'Half-sleeve territory' },
    { id: 'extra-large', name: 'Extra Large', maxCm2: 350, multiplier: 3.5, hint: 'Full sleeve, large thigh piece' },
    { id: 'major-project', name: 'Major Project', maxCm2: null, multiplier: 5.0, hint: 'Back piece, bodysuit section' },
  ],

  styles: [
    { id: 'fine-line', name: 'Fine Line', multiplier: 1.0 },
    { id: 'minimalist', name: 'Minimalist', multiplier: 1.0 },
    { id: 'lettering', name: 'Lettering', multiplier: 1.0 },
    { id: 'traditional', name: 'Traditional', multiplier: 1.1 },
    { id: 'blackwork', name: 'Blackwork', multiplier: 1.1 },
    { id: 'tribal', name: 'Tribal', multiplier: 1.1 },
    { id: 'neo-traditional', name: 'Neo-Traditional', multiplier: 1.2 },
    { id: 'geometric', name: 'Geometric', multiplier: 1.2 },
    { id: 'dotwork', name: 'Dotwork', multiplier: 1.2 },
    { id: 'japanese', name: 'Japanese', multiplier: 1.3 },
    { id: 'watercolour', name: 'Watercolour', multiplier: 1.3 },
    { id: 'ornamental', name: 'Ornamental', multiplier: 1.3 },
    { id: 'realism', name: 'Realism', multiplier: 1.5 },
    { id: 'portrait', name: 'Portrait', multiplier: 1.6 },
  ],

  detailLevels: [
    { id: 'simple', name: 'Simple', multiplier: 1.0, hint: 'Clean lines, minimal shading' },
    { id: 'medium', name: 'Medium', multiplier: 1.3, hint: 'Some shading and texture' },
    { id: 'detailed', name: 'Detailed', multiplier: 1.6, hint: 'Rich shading, layered elements' },
    { id: 'highly-detailed', name: 'Highly Detailed', multiplier: 2.0, hint: 'Micro-detail, portraits, full realism' },
  ],

  colourOptions: [
    { id: 'black-grey', name: 'Black & Grey', multiplier: 1.0 },
    { id: 'limited-colour', name: 'Limited Colour', multiplier: 1.1 },
    { id: 'full-colour', name: 'Full Colour', multiplier: 1.25 },
  ],

  conditions: [
    { id: 'new', name: 'New Tattoo', multiplier: 1.0, minPrice: 0 },
    { id: 'extension', name: 'Extension of Existing', multiplier: 1.1, minPrice: 0 },
    { id: 'correction', name: 'Correction / Rework', multiplier: 1.3, minPrice: 1000000 },
    { id: 'cover-up', name: 'Cover-Up', multiplier: 1.4, minPrice: 3000000 },
    { id: 'scar-coverage', name: 'Scar Coverage', multiplier: 1.5, minPrice: 3000000 },
  ],
};

export const DEFAULT_VERSION_NAME = 'Default 2026 Pricing';
