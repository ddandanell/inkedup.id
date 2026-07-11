# InkedUp Interactive Tattoo Placement & Pricing Tool
## Complete Technical Specification & Build Guide

**Project:** InkedUp — Premium Mobile Tattoo Booking Concierge  
**Domain:** find-tattoo-artists.id  
**Location:** Bali, Indonesia  
**Currency:** Indonesian Rupiah (IDR)  
**Date:** 2026-07-11  
**Status:** Research Complete — Ready for Development  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Setup Understanding](#2-current-setup-understanding)
3. [Architecture Overview](#3-architecture-overview)
4. [Technology Decisions](#4-technology-decisions)
5. [Database Schema](#5-database-schema)
6. [Pricing Engine](#6-pricing-engine)
7. [Interactive Body Map](#7-interactive-body-map)
8. [File Upload & Image Handling](#8-file-upload--image-handling)
9. [API Design](#9-api-design)
10. [Frontend Component Architecture](#10-frontend-component-architecture)
11. [Admin Dashboard](#11-admin-dashboard)
12. [Development Phases](#12-development-phases)
13. [Implementation Checklist](#13-implementation-checklist)
14. [Appendix: Code Examples](#14-appendix-code-examples)

---

## 1. Executive Summary

### What We Are Building

An interactive 2D body map tool that allows customers to:
- Select body type (Male / Female / Neutral)
- Switch views (Front / Back / Left / Right)
- Click body regions to select tattoo placement areas
- Draw, resize, move, and rotate tattoo coverage shapes on a canvas overlay
- Zoom and pan like Google Maps
- Enter tattoo details (style, colour, detail level, project condition)
- See live price estimates that update instantly
- Upload reference images
- Submit a complete quote for artist review

### Key Design Principle

**The pricing engine is completely independent from the body graphic.** The visual tool collects dimensions and placement. The pricing engine converts those inputs into an estimate. This allows the owner to change all prices, multipliers, minimums, and categories through the admin panel without rebuilding the interactive body system.

### Technology Stack (Final Decision)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | React 19, Vite 6 |
| **UI Components** | Tailwind CSS + shadcn/ui | Already in project |
| **Body Map** | Inline SVG (React) | Native SVG + React state |
| **Interactive Canvas** | Konva.js + react-konva | konva@10.3.0, react-konva@19.2.5 |
| **Backend** | Node.js + Express + TypeScript | Already in project |
| **Database** | SQLite (current) → PostgreSQL/Neon (migration) | — |
| **Image Storage** | Cloudinary (signed uploads) | Free tier |
| **File Upload** | react-dropzone (already installed) | — |
| **Animations** | Framer Motion (already installed) | — |

---

## 2. Current Setup Understanding

### What Already Exists

Your project at `/Users/openclaw/Downloads/tatooo2` has a solid foundation:

```
app/
├── src/                    # React 19 + TypeScript + Vite frontend
│   ├── components/         # shadcn/ui components
│   ├── pages/              # 17+ pages implemented
│   ├── data/               # Business data, stores
│   └── lib/                # Utility functions
├── server/                 # Express + SQLite backend
│   ├── src/
│   │   ├── db.ts           # SQLite connection
│   │   ├── schema.sql      # Database schema
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry
│   └── data/               # SQLite database file
├── public/                 # Static assets
└── package.json            # Dependencies
```

### Existing Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
- **Backend:** Node.js, Express, better-sqlite3
- **Database:** SQLite (`app/server/data/inkedup.db`)
- **Auth:** JWT-based admin authentication
- **Deploy:** Vercel (frontend) + Render (backend)

### What's Missing for the Tattoo Tool

1. **Interactive body map component** — SVG regions + Konva canvas overlay
2. **Pricing engine** — Rule-based calculation system
3. **Quote system** — Customer quote submission and admin review
4. **Image upload** — Cloudinary integration for reference photos
5. **Admin pricing dashboard** — CRUD for all pricing variables
6. **Database migrations** — New tables for body areas, pricing rules, quotes

---

## 3. Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMER BROWSER                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     REACT FRONTEND (Vercel)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │  │
│  │  │  Body Map    │  │   Konva      │  │     Quote Form               │ │  │
│  │  │  (SVG)       │  │   Canvas     │  │     (shadcn/ui)              │ │  │
│  │  │              │  │   Overlay    │  │                              │ │  │
│  │  │  • Clickable │  │              │  │  • Style selector            │ │  │
│  │  │    regions   │  │  • Drag      │  │  • Colour selector           │ │  │
│  │  │  • Hover     │  │  • Resize    │  │  • Detail level              │ │  │
│  │  │    effects   │  │  • Rotate    │  │  • Project condition         │ │  │
│  │  │  • Selection │  │  • Zoom/Pan  │  │  • Live price display        │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │  │
│  │                              ↑                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Pricing Engine (Frontend Preview)                   │  │  │
│  │  │  Calls /api/pricing/calculate for live estimates                │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                      │
│                            REST API (JSON)                                  │
│                                      ↓                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     EXPRESS BACKEND (Render)                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │  │
│  │  │  Auth        │  │  Pricing     │  │  Quote                       │ │  │
│  │  │  Routes      │  │  Engine      │  │  Routes                      │ │  │
│  │  │              │  │              │  │                              │ │  │
│  │  │  • /login    │  │  • Snapshot  │  │  • Create quote             │ │  │
│  │  │  • /verify   │  │    versioning│  │  • Get quote                │ │  │
│  │  │              │  │  • Rule-chain│  │  • List quotes              │ │  │
│  │  │              │  │  • Overrides │  │  • Update status            │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │  │
│  │  │  Upload      │  │  Admin       │  │  Body Area                   │ │  │
│  │  │  Routes      │  │  Routes      │  │  Routes                      │ │  │
│  │  │              │  │              │  │                              │ │  │
│  │  │  • Signature │  │  • Pricing   │  │  • CRUD regions             │ │  │
│  │  │    generation│  │    CRUD      │  │  • Get active regions       │ │  │
│  │  │              │  │  • Version   │  │                              │ │  │
│  │  │              │  │    mgmt      │  │                              │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────────┐ │
│  │   SQLite DB      │    │   Cloudinary     │    │   WhatsApp (future)    │ │
│  │   (local/dev)    │    │   (image CDN)    │    │   notifications        │ │
│  └──────────────────┘    └──────────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
Customer Journey:
1. Visit /quote → Loads body map + pricing rules from API
2. Select body type (Male/Female/Neutral) → SVG switches view
3. Select body view (Front/Back/Left/Right) → SVG loads region paths
4. Click body region → Region highlights, info panel shows
5. Draw/resize coverage shape on Konva canvas → Dimensions update
6. Enter width/height in cm → Coverage shape resizes proportionally
7. Select style, colour, detail, condition → Price recalculates live
8. Upload reference images → Direct to Cloudinary
9. Submit quote → Backend validates + recalculates + saves
10. Admin receives notification → Reviews in dashboard
```

---

## 4. Technology Decisions

### 4.1 Canvas Library: Konva.js vs Fabric.js

**Decision: Konva.js + react-konva**

| Factor | Konva.js | Fabric.js | Winner |
|--------|----------|-----------|--------|
| React 19 integration | ✅ First-class JSX | ⚠️ Imperative only | **Konva** |
| TypeScript | ✅ Built-in types | ✅ Good (v6+) | Tie |
| Bundle size | ~40 KB gzipped | 5+ MB unpacked | **Konva** |
| Mobile touch | ✅ Native pinch-zoom | ⚠️ Requires Hammer.js | **Konva** |
| Performance | ✅ Multi-layer, 60fps | ⚠️ Full redraw | **Konva** |
| Draggable/resize/rotate | ✅ `<Transformer />` | ✅ Built-in controls | Tie |
| Community | ~400K weekly | ~500K weekly | Tie |

**Install:**
```bash
npm install react-konva@19.2.5 konva@10.3.0
```

### 4.2 SVG Body Map: Inline vs External

**Decision: Inline SVG in React components**

- Full DOM access for click/hover/selection events
- Dynamic fill/stroke via React state
- CSS transitions for smooth hover effects
- Coordinate sync with Konva canvas overlay

**Alternative considered:** `body-muscles` npm package — good for prototyping but muscle regions don't map well to tattoo placement regions. Custom SVG paths traced in Figma recommended for production.

### 4.3 Image Storage: Cloudinary vs S3 vs Local

**Decision: Cloudinary with signed uploads**

| Factor | Cloudinary | AWS S3 | Local Disk |
|--------|-----------|--------|-----------|
| Free tier | 25GB + 25GB | 5GB | N/A |
| Image processing | Built-in URL transforms | Lambda+Sharp | Manual |
| Signed uploads | Easy | Complex IAM | N/A |
| Mobile-friendly | ✅ | ✅ | ❌ |
| Setup | 5 minutes | 1+ hour | Already done |

**Critical:** Your current `/uploads` static route serves from Render's ephemeral filesystem — images are **lost on every deploy**. Cloudinary fixes this completely.

**Install:**
```bash
npm install cloudinary
```

### 4.4 Pricing Engine: Architecture Pattern

**Decision: Rule-Chain with Overrides**

- NOT pure Strategy (too rigid for multi-factor pricing)
- NOT simple formula (can't handle "full sleeve = flat rate" overrides)
- NOT Drools rule engine (overkill)
- Rule-chain: sequential multiplier application + pre/post override rules

### 4.5 Database: SQLite vs PostgreSQL

**Decision: Keep SQLite for MVP, plan migration to PostgreSQL/Neon**

Your current SQLite setup works fine for MVP. The pricing engine schema uses PostgreSQL syntax (JSONB, TIMESTAMPTZ). For SQLite adaptation:
- Replace `JSONB` with `TEXT` (store JSON as string)
- Replace `TIMESTAMPTZ` with `TEXT` (ISO 8601 strings)
- Replace `SERIAL` with `INTEGER PRIMARY KEY AUTOINCREMENT`
- Replace `NUMERIC` with `REAL`

**Migration path:** When ready, Neon PostgreSQL is a drop-in replacement with better JSONB support.

---

## 5. Database Schema

### 5.1 Complete Schema (SQLite-Compatible)

```sql
-- ============================================================
-- INKEDUP TATTOO TOOL — DATABASE SCHEMA
-- Compatible with SQLite (current) and PostgreSQL (future)
-- ============================================================

-- -----------------------------------------------------------
-- 1. BODY REGIONS (tattoo placement areas)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_regions (
  id            TEXT PRIMARY KEY,           -- "upper_arm_left"
  name          TEXT NOT NULL,              -- "Upper Arm (Left)"
  slug          TEXT NOT NULL UNIQUE,
  view          TEXT NOT NULL,              -- "front" | "back" | "left" | "right"
  gender        TEXT,                       -- "male" | "female" | "neutral"
  svg_path      TEXT NOT NULL,              -- SVG path data
  normalized_path TEXT,                     -- Normalized (0-1) path data
  base_price    INTEGER NOT NULL DEFAULT 0, -- IDR, e.g. 1000000
  difficulty_multiplier REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  min_session_hours INTEGER NOT NULL DEFAULT 1,
  active        INTEGER NOT NULL DEFAULT 1, -- SQLite boolean
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------
-- 2. PRICING RULES VERSIONS (snapshot-based)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_rules_versions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,            -- "Summer 2026 Pricing"
  description     TEXT,
  status          TEXT NOT NULL
                  CHECK (status IN ('draft', 'published', 'archived'))
                  DEFAULT 'draft',
  created_by      TEXT NOT NULL,            -- user ID
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  published_at    TEXT,
  archived_at     TEXT,

  -- Snapshot fields (JSON stored as TEXT in SQLite)
  body_area_prices          TEXT NOT NULL DEFAULT '{}',
  size_multipliers          TEXT NOT NULL DEFAULT '{}',
  detail_multipliers        TEXT NOT NULL DEFAULT '{}',
  style_multipliers         TEXT NOT NULL DEFAULT '{}',
  colour_multipliers        TEXT NOT NULL DEFAULT '{}',
  placement_multipliers     TEXT NOT NULL DEFAULT '{}',
  project_condition_multipliers TEXT NOT NULL DEFAULT '{}',
  override_rules            TEXT NOT NULL DEFAULT '[]',
  discount_rules            TEXT NOT NULL DEFAULT '[]',
  fixed_costs               TEXT NOT NULL DEFAULT '{}',

  -- Currency & rounding config
  currency_code             TEXT NOT NULL DEFAULT 'IDR',
  rounding_step             INTEGER NOT NULL DEFAULT 50000,
  minimum_price             INTEGER NOT NULL DEFAULT 1000000,
  range_size_variance       REAL NOT NULL DEFAULT 0.20,
  range_detail_variance     REAL NOT NULL DEFAULT 0.15,

  is_default                INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------
-- 3. REFERENCE TABLES (UI vocabulary)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS size_categories (
  id            TEXT PRIMARY KEY,           -- "small", "medium", "large"
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  min_cm2       INTEGER NOT NULL DEFAULT 0,
  max_cm2       INTEGER,                    -- NULL = no upper limit
  multiplier    REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tattoo_styles (
  id            TEXT PRIMARY KEY,           -- "fine_line", "traditional"
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  multiplier    REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  hours_per_cm2 REAL,                       -- Estimated hours per cm²
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS detail_levels (
  id            TEXT PRIMARY KEY,           -- "simple", "medium", "detailed"
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  multiplier    REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS colour_options (
  id            TEXT PRIMARY KEY,           -- "black_grey", "limited_colour", "full_colour"
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  multiplier    REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_conditions (
  id            TEXT PRIMARY KEY,           -- "new", "cover_up", "scar_coverage"
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  multiplier    REAL NOT NULL DEFAULT 1.0,
  min_price     INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------
-- 4. QUOTES (customer submissions)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id                    TEXT PRIMARY KEY,   -- UUID
  reference             TEXT UNIQUE,        -- "QTE-20260711-001"

  -- Customer info
  customer_name         TEXT NOT NULL,
  customer_email        TEXT NOT NULL,
  customer_whatsapp     TEXT NOT NULL,
  customer_location     TEXT,

  -- Body selection
  body_model            TEXT NOT NULL,      -- "male" | "female" | "neutral"
  body_view             TEXT NOT NULL,      -- "front" | "back" | "left" | "right"
  body_areas            TEXT NOT NULL DEFAULT '[]',  -- JSON array of region IDs

  -- Coverage data (normalized coordinates)
  coverage              TEXT,               -- JSON: {type, points, widthCm, heightCm}
  width_cm              REAL,
  height_cm             REAL,
  estimated_area_cm2    REAL,

  -- Tattoo details
  style_id              TEXT,
  detail_level_id       TEXT,
  colour_option_id      TEXT,
  project_condition_id  TEXT,
  description           TEXT,

  -- Reference images (Cloudinary URLs)
  reference_images      TEXT NOT NULL DEFAULT '[]',

  -- Pricing snapshot (IMMUTABLE)
  pricing_version_id    INTEGER NOT NULL,
  base_price            INTEGER NOT NULL DEFAULT 0,
  size_multiplier       REAL NOT NULL DEFAULT 1.0,
  detail_multiplier     REAL NOT NULL DEFAULT 1.0,
  style_multiplier      REAL NOT NULL DEFAULT 1.0,
  colour_multiplier     REAL NOT NULL DEFAULT 1.0,
  placement_multiplier  REAL NOT NULL DEFAULT 1.0,
  condition_multiplier  REAL NOT NULL DEFAULT 1.0,
  estimated_price       INTEGER NOT NULL DEFAULT 0,
  price_min             INTEGER NOT NULL DEFAULT 0,
  price_max             INTEGER NOT NULL DEFAULT 0,

  -- Status
  status                TEXT NOT NULL
                        CHECK (status IN ('draft', 'submitted', 'reviewed', 'accepted', 'rejected', 'expired'))
                        DEFAULT 'draft',

  -- Artist assignment
  artist_id             TEXT,
  artist_quote          INTEGER,
  admin_notes           TEXT,

  -- Audit
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at);

-- -----------------------------------------------------------
-- 5. PRICING CHANGE LOG
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_change_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id    INTEGER,
  action        TEXT NOT NULL
                  CHECK (action IN ('created', 'published', 'archived', 'updated_field')),
  field_name    TEXT,
  old_value     TEXT,
  new_value     TEXT,
  performed_by  TEXT NOT NULL,
  performed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5.2 Seed Data

```sql
-- Default body regions
INSERT INTO body_regions (id, name, slug, view, base_price, difficulty_multiplier, min_price, min_session_hours, sort_order) VALUES
('head', 'Head', 'head', 'front', 2000000, 1.5, 1500000, 2, 1),
('neck', 'Neck', 'neck', 'front', 1500000, 1.3, 1000000, 1, 2),
('shoulder_left', 'Shoulder (Left)', 'shoulder-left', 'front', 1000000, 1.0, 500000, 1, 3),
('shoulder_right', 'Shoulder (Right)', 'shoulder-right', 'front', 1000000, 1.0, 500000, 1, 4),
('upper_arm_left', 'Upper Arm (Left)', 'upper-arm-left', 'front', 1000000, 1.0, 500000, 1, 5),
('upper_arm_right', 'Upper Arm (Right)', 'upper-arm-right', 'front', 1000000, 1.0, 500000, 1, 6),
('forearm_left', 'Forearm (Left)', 'forearm-left', 'front', 1000000, 1.0, 500000, 1, 7),
('forearm_right', 'Forearm (Right)', 'forearm-right', 'front', 1000000, 1.0, 500000, 1, 8),
('wrist_left', 'Wrist (Left)', 'wrist-left', 'front', 800000, 1.0, 400000, 1, 9),
('wrist_right', 'Wrist (Right)', 'wrist-right', 'front', 800000, 1.0, 400000, 1, 10),
('hand_left', 'Hand (Left)', 'hand-left', 'front', 1200000, 1.2, 800000, 1, 11),
('hand_right', 'Hand (Right)', 'hand-right', 'front', 1200000, 1.2, 800000, 1, 12),
('chest', 'Chest', 'chest', 'front', 1500000, 1.1, 1000000, 2, 13),
('stomach', 'Stomach', 'stomach', 'front', 1200000, 1.2, 800000, 2, 14),
('ribs_left', 'Ribs (Left)', 'ribs-left', 'front', 1500000, 1.4, 1000000, 2, 15),
('ribs_right', 'Ribs (Right)', 'ribs-right', 'front', 1500000, 1.4, 1000000, 2, 16),
('hip_left', 'Hip (Left)', 'hip-left', 'front', 1000000, 1.0, 500000, 1, 17),
('hip_right', 'Hip (Right)', 'hip-right', 'front', 1000000, 1.0, 500000, 1, 18),
('thigh_left', 'Thigh (Left)', 'thigh-left', 'front', 1200000, 1.0, 600000, 2, 19),
('thigh_right', 'Thigh (Right)', 'thigh-right', 'front', 1200000, 1.0, 600000, 2, 20),
('knee_left', 'Knee (Left)', 'knee-left', 'front', 1000000, 1.3, 600000, 1, 21),
('knee_right', 'Knee (Right)', 'knee-right', 'front', 1000000, 1.3, 600000, 1, 22),
('calf_left', 'Calf (Left)', 'calf-left', 'front', 1000000, 1.0, 500000, 1, 23),
('calf_right', 'Calf (Right)', 'calf-right', 'front', 1000000, 1.0, 500000, 1, 24),
('ankle_left', 'Ankle (Left)', 'ankle-left', 'front', 800000, 1.0, 400000, 1, 25),
('ankle_right', 'Ankle (Right)', 'ankle-right', 'front', 800000, 1.0, 400000, 1, 26),
('foot_left', 'Foot (Left)', 'foot-left', 'front', 1000000, 1.2, 600000, 1, 27),
('foot_right', 'Foot (Right)', 'foot-right', 'front', 1000000, 1.2, 600000, 1, 28),
('upper_back', 'Upper Back', 'upper-back', 'back', 1500000, 1.1, 1000000, 2, 29),
('lower_back', 'Lower Back', 'lower-back', 'back', 1200000, 1.1, 800000, 2, 30),
('full_back', 'Full Back', 'full-back', 'back', 3000000, 1.2, 2000000, 4, 31),
('buttocks', 'Buttocks', 'buttocks', 'back', 1500000, 1.3, 1000000, 2, 32);

-- Default size categories
INSERT INTO size_categories (id, name, slug, min_cm2, max_cm2, multiplier, min_price, display_order) VALUES
('extra_small', 'Extra Small', 'extra-small', 0, 10, 1.0, 500000, 1),
('small', 'Small', 'small', 11, 30, 1.3, 800000, 2),
('medium', 'Medium', 'medium', 31, 80, 1.8, 1200000, 3),
('large', 'Large', 'large', 81, 180, 2.5, 2000000, 4),
('extra_large', 'Extra Large', 'extra-large', 181, 350, 3.5, 3500000, 5),
('major_project', 'Major Project', 'major-project', 351, NULL, 5.0, 5000000, 6);

-- Default tattoo styles
INSERT INTO tattoo_styles (id, name, slug, multiplier, min_price, display_order) VALUES
('fine_line', 'Fine Line', 'fine-line', 1.0, 500000, 1),
('minimalist', 'Minimalist', 'minimalist', 1.0, 500000, 2),
('traditional', 'Traditional', 'traditional', 1.1, 600000, 3),
('neo_traditional', 'Neo-Traditional', 'neo-traditional', 1.2, 700000, 4),
('realism', 'Realism', 'realism', 1.5, 1000000, 5),
('portrait', 'Portrait', 'portrait', 1.6, 1200000, 6),
('japanese', 'Japanese', 'japanese', 1.3, 800000, 7),
('blackwork', 'Blackwork', 'blackwork', 1.1, 600000, 8),
('geometric', 'Geometric', 'geometric', 1.2, 700000, 9),
('tribal', 'Tribal', 'tribal', 1.1, 600000, 10),
('lettering', 'Lettering', 'lettering', 1.0, 500000, 11),
('watercolour', 'Watercolour', 'watercolour', 1.3, 800000, 12),
('dotwork', 'Dotwork', 'dotwork', 1.2, 700000, 13),
('ornamental', 'Ornamental', 'ornamental', 1.3, 800000, 14),
('other', 'Other', 'other', 1.0, 500000, 15);

-- Default detail levels
INSERT INTO detail_levels (id, name, slug, multiplier, min_price, display_order) VALUES
('simple', 'Simple', 'simple', 1.0, 0, 1),
('medium', 'Medium', 'medium', 1.3, 0, 2),
('detailed', 'Detailed', 'detailed', 1.6, 0, 3),
('highly_detailed', 'Highly Detailed', 'highly-detailed', 2.0, 0, 4);

-- Default colour options
INSERT INTO colour_options (id, name, slug, multiplier, min_price, display_order) VALUES
('black_grey', 'Black and Grey', 'black-grey', 1.0, 0, 1),
('limited_colour', 'Limited Colour', 'limited-colour', 1.1, 0, 2),
('full_colour', 'Full Colour', 'full-colour', 1.25, 0, 3);

-- Default project conditions
INSERT INTO project_conditions (id, name, slug, multiplier, min_price, display_order) VALUES
('new', 'New Tattoo', 'new', 1.0, 0, 1),
('cover_up', 'Cover-up', 'cover-up', 1.4, 3000000, 2),
('scar_coverage', 'Scar Coverage', 'scar-coverage', 1.5, 3000000, 3),
('extension', 'Tattoo Extension', 'extension', 1.1, 500000, 4),
('correction', 'Tattoo Correction', 'correction', 1.3, 1000000, 5),
('sleeve_continuation', 'Sleeve Continuation', 'sleeve-continuation', 1.0, 0, 6);
```

---

## 6. Pricing Engine

### 6.1 Formula

```
Estimated Price =
  Base Body Area Price
  × Size Multiplier
  × Detail Multiplier
  × Style Multiplier
  × Colour Multiplier
  × Placement Difficulty Multiplier
  × Project Condition Multiplier
  + Fixed Additional Costs
```

### 6.2 Size Calculation

```
Area (cm²) = Width (cm) × Height (cm) × Coverage Factor

Coverage Factors:
- Rectangle-style tattoo: 0.85
- Oval tattoo: 0.70
- Thin lettering: 0.35
- Scattered design: 0.45
- Dense solid design: 0.90
```

### 6.3 Price Range Display

```
Range = [Estimated Price × (1 - variance), Estimated Price × (1 + variance)]

Default variances:
- Size: ±20%
- Detail: ±15%

Example:
Estimated: IDR 4,368,000
Range: IDR 4,000,000 to IDR 4,800,000
```

### 6.4 Currency Handling Rules

1. **NEVER use floating-point for money** in JavaScript
2. Store all prices as INTEGER (1 = IDR 1)
3. Multipliers use scaling: `Math.round(base × multiplier × 1000) / 1000`
4. Round to nearest step (default 50,000 IDR)
5. Format with Indonesian locale: `IDR 4,500,000`

### 6.5 Override Rules

The engine supports special rules that bypass the standard formula:

| Rule Type | Example | Action |
|-----------|---------|--------|
| Replace base price | Full sleeve = flat IDR 15M | Ignore standard calculation |
| Minimum floor | Cover-ups minimum IDR 3M | Set floor regardless of calculation |
| Maximum cap | Small tattoos max IDR 2M | Set ceiling |
| Lock multiplier | Full colour on blackwork | Override colour multiplier |
| Multi-area discount | 2+ areas in one session | 10% off subtotal |

### 6.6 Backend Calculation Flow

```
1. Load published pricing version snapshot
2. Validate all input IDs exist in snapshot
3. Evaluate PRE-calculation overrides
   → Replace base price? Lock multipliers?
4. Apply standard formula chain
   base × size × detail × style × colour × placement × condition
5. Evaluate POST-calculation overrides
   → Minimum floor? Maximum cap?
6. Calculate additional areas (if multi-area)
7. Apply discounts (if applicable)
8. Add fixed costs
9. Apply minimum price floor
10. Round to step
11. Calculate range (min/max)
12. Return complete breakdown
```

---

## 7. Interactive Body Map

### 7.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: UI Controls (React DOM)                            │
│  → Zoom buttons, view switcher, region info panel           │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Konva Canvas (react-konva)                        │
│  → Tattoo coverage shapes (draggable, resizable, rotatable) │
│  → Semi-transparent overlays                                │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Interactive SVG (React inline)                    │
│  → Body region paths (clickable, hoverable)                 │
│  → Selection highlights                                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Background (CSS)                                  │
│  → Body illustration (static SVG or image)                  │
│  → Grid/alignment guides                                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 SVG Body Map Implementation

```tsx
// Core component structure
<BodyMapContainer>
  <BodyMap
    view={currentView}        // "front" | "back" | "left" | "right"
    gender={currentGender}     // "male" | "female" | "neutral"
    selectedRegions={selected}
    onRegionClick={handleRegionClick}
  />
  <KonvaOverlay
    selectedRegions={selected}
    shapes={coverageShapes}
    onShapeChange={handleShapeChange}
    scale={zoomScale}
    position={panPosition}
  />
  <Controls
    onZoomIn={() => setScale(s => s * 1.1)}
    onZoomOut={() => setScale(s => s * 0.9)}
    onViewChange={setCurrentView}
    onGenderChange={setCurrentGender}
  />
</BodyMapContainer>
```

### 7.3 Coordinate System

**All positions stored as normalized values (0.0 to 1.0):**

```typescript
interface CoverageData {
  type: 'rectangle' | 'oval' | 'polygon';
  points: { x: number; y: number }[];  // Normalized 0-1
  widthCm: number;
  heightCm: number;
  rotation: number;  // Degrees
}

// Convert normalized to screen pixels
function normalizedToScreen(
  normalized: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
) {
  return {
    x: normalized.x * containerWidth,
    y: normalized.y * containerHeight,
  };
}

// Convert screen pixels to normalized
function screenToNormalized(
  screen: { x: number; y: number },
  containerWidth: number,
  containerHeight: number
) {
  return {
    x: screen.x / containerWidth,
    y: screen.y / containerHeight,
  };
}
```

### 7.4 Responsive Scaling

```tsx
<svg
  viewBox="0 0 400 800"
  preserveAspectRatio="xMidYMid meet"
  style={{ width: '100%', height: 'auto', maxHeight: '80vh' }}
>
  {/* Body paths */}
</svg>
```

**Container CSS:**
```css
.body-map-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  touch-action: none; /* Prevent browser zoom, handle in Konva */
}

@media (max-width: 640px) {
  .body-map-container {
    max-width: 100%;
    padding: 0 16px;
  }
}
```

### 7.5 SVG Path Data Strategy

**Phase 1 (MVP):** Use simplified body silhouette with ~20-25 regions per view

**Creating SVG Paths:**
1. Purchase/download body illustration vector (Iconscout, Freepik)
2. Import into Figma
3. Trace each region with Pen Tool as separate closed path
4. Name layers by region ID
5. Export as SVG, optimize with SVGO
6. Extract path data into JSON/TypeScript

**Phase 2 (Production):** Commission custom illustrations matching InkedUp brand

---

## 8. File Upload & Image Handling

### 8.1 Architecture: Signed Upload to Cloudinary

```
Customer selects images
        ↓
Frontend requests upload signature from /api/upload/signature
        ↓
Backend generates Cloudinary signature (valid 15 min)
        ↓
Frontend uploads images DIRECTLY to Cloudinary (bypasses your server)
        ↓
Cloudinary returns secure_url
        ↓
Frontend sends URL to backend with quote submission
        ↓
Backend stores Cloudinary URL in database
```

### 8.2 Environment Variables

```bash
# Add to .env (backend / Render)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Add to .env.local (frontend / Vercel)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 8.3 Security Rules

- **Allowed types:** JPEG, PNG, WebP, HEIC (iPhone)
- **Max file size:** 10MB per file
- **Max files per quote:** 5
- **Rate limit:** 20 uploads per 15 minutes per IP
- **Access control:** Images in non-public folder, served through admin API

### 8.4 Image Variants via URL

Store ONE original, request variants via URL parameters:

```
Original:   https://res.cloudinary.com/inkedup/image/upload/v123/tattoo_quotes/abc.jpg
Thumbnail:  https://res.cloudinary.com/inkedup/image/upload/w_150,h_150,c_fill,q_70/v123/tattoo_quotes/abc.jpg
Medium:     https://res.cloudinary.com/inkedup/image/upload/w_800,q_80/v123/tattoo_quotes/abc.jpg
WebP auto:  https://res.cloudinary.com/inkedup/image/upload/f_auto,q_auto/w_800/v123/tattoo_quotes/abc.jpg
```

---

## 9. API Design

### 9.1 Public APIs (No Auth Required)

```typescript
// GET /api/pricing/rules
// Returns current published pricing rules for the configurator
{
  "version_id": 1,
  "currency": "IDR",
  "body_areas": [...],
  "size_categories": [...],
  "styles": [...],
  "detail_levels": [...],
  "colour_options": [...],
  "project_conditions": [...]
}

// POST /api/pricing/calculate
// Live price preview (frontend advisory only)
{
  "body_area_id": "upper_arm_left",
  "size_category_id": "medium",
  "style_id": "traditional",
  "detail_level_id": "medium",
  "colour_option_id": "black_grey",
  "project_condition_id": "new",
  "width_cm": 12,
  "height_cm": 15
}
// Response:
{
  "estimated_price": 4368000,
  "price_min": 4000000,
  "price_max": 4800000,
  "currency": "IDR",
  "breakdown": { ... }
}

// POST /api/quotes
// Submit a quote (backend recalculates and validates)
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_whatsapp": "+628123456789",
  "body_model": "male",
  "body_view": "front",
  "body_areas": ["upper_arm_left"],
  "coverage": { ... },
  "width_cm": 12,
  "height_cm": 15,
  "style_id": "traditional",
  "detail_level_id": "medium",
  "colour_option_id": "black_grey",
  "project_condition_id": "new",
  "reference_images": ["https://cloudinary.com/..."],
  "description": "Tribal sleeve extension"
}
// Response:
{
  "id": "quote-uuid",
  "reference": "QTE-20260711-001",
  "estimated_price": 4368000,
  "price_min": 4000000,
  "price_max": 4800000,
  "status": "submitted"
}
```

### 9.2 Admin APIs (Auth Required)

```typescript
// GET /api/admin/quotes
// List all quotes with filters

// GET /api/admin/quotes/:id
// Get single quote details

// PATCH /api/admin/quotes/:id/status
// Update quote status

// GET /api/admin/pricing/versions
// List all pricing versions

// POST /api/admin/pricing/versions
// Create new draft version

// POST /api/admin/pricing/versions/:id/publish
// Publish a version

// GET /api/admin/body-regions
// List all body regions

// POST /api/admin/body-regions
// Create new body region

// PATCH /api/admin/body-regions/:id
// Update body region

// POST /api/upload/signature
// Get Cloudinary upload signature
```

### 9.3 API Authentication

Reuse existing JWT auth from InkedUp:
- Customer quote submission: No auth required
- Admin endpoints: Require valid JWT with `admin` role
- Upload signature: No auth (rate-limited instead)

---

## 10. Frontend Component Architecture

### 10.1 Page Structure

```
/quote                          → Main quote configurator page
  ├── BodyMapSection           → SVG + Konva canvas
  ├── TattooDetailsSection     → Style, colour, detail selectors
  ├── PriceDisplaySection      → Live price estimate
  ├── ImageUploadSection       → Reference image upload
  └── CustomerInfoSection      → Name, WhatsApp, email, submit

/admin/quotes                  → Admin quote management
/admin/pricing                 → Admin pricing dashboard
/admin/body-regions            → Admin body region editor
```

### 10.2 Key Components

```typescript
// Body Map Components
interface BodyMapProps {
  view: 'front' | 'back' | 'left' | 'right';
  gender: 'male' | 'female' | 'neutral';
  selectedRegions: string[];
  onRegionClick: (regionId: string) => void;
}

// Konva Overlay Components
interface CoverageShape {
  id: string;
  type: 'rectangle' | 'oval';
  x: number;      // Normalized 0-1
  y: number;
  width: number;  // Normalized
  height: number;
  rotation: number;
}

interface KonvaOverlayProps {
  shapes: CoverageShape[];
  selectedRegions: string[];
  scale: number;
  position: { x: number; y: number };
  onShapeChange: (shape: CoverageShape) => void;
  onShapeAdd: (shape: CoverageShape) => void;
  onShapeDelete: (shapeId: string) => void;
}

// Price Display
interface PriceDisplayProps {
  estimatedPrice: number;
  priceMin: number;
  priceMax: number;
  currency: string;
  breakdown: CalculationBreakdown;
}
```

### 10.3 State Management

Use React `useReducer` for the quote configurator state:

```typescript
interface QuoteState {
  // Body selection
  bodyModel: 'male' | 'female' | 'neutral';
  bodyView: 'front' | 'back' | 'left' | 'right';
  selectedRegions: string[];

  // Coverage
  coverageShapes: CoverageShape[];
  activeShapeId: string | null;
  widthCm: number;
  heightCm: number;

  // Tattoo details
  styleId: string;
  detailLevelId: string;
  colourOptionId: string;
  projectConditionId: string;

  // Images
  uploadedImages: string[];  // Cloudinary URLs

  // Customer info
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerLocation: string;
  description: string;

  // Price
  estimatedPrice: number;
  priceMin: number;
  priceMax: number;
  isCalculating: boolean;
}
```

---

## 11. Admin Dashboard

### 11.1 Pricing Management UI

```
/admin/pricing
├── Version Selector (dropdown: current published, drafts, archived)
├── Tab Navigation
│   ├── Body Areas        → Editable grid: name, base price, difficulty, min price, active
│   ├── Size Categories   → Editable grid: name, cm² range, multiplier
│   ├── Styles            → Editable grid: name, multiplier, min price
│   ├── Detail Levels     → Editable grid: name, multiplier
│   ├── Colours           → Editable grid: name, multiplier
│   ├── Conditions        → Editable grid: name, multiplier, min price
│   ├── Overrides         → Rule builder UI
│   ├── Discounts         → Rule builder UI
│   └── Fixed Costs       → Key-value pairs
├── Live Preview Panel (sidebar)
│   └── Test calculator: select options → see price instantly
└── Action Buttons
    ├── Save Draft
    ├── Duplicate from Published
    ├── Publish (with confirmation)
    └── Archive
```

### 11.2 Publish Workflow

1. Admin makes changes → Auto-saved as draft
2. Admin clicks "Test" → Live preview shows impact
3. Admin clicks "Publish" → Confirmation modal:
   - "This affects all NEW quotes. 3 drafts will be recalculated. 47 sent quotes will NOT change."
4. On confirm → Previous published → archived, new → published
5. Audit log entry created

### 11.3 Quote Management UI

```
/admin/quotes
├── Filter Bar (status, date range, artist)
├── Quote Table
│   ├── Reference | Customer | Body Areas | Price | Status | Date | Actions
│   └── Click row → Detail view
└── Quote Detail
    ├── Customer info
    ├── Body selection + coverage visualization
    ├── Tattoo details
    ├── Reference images (gallery)
    ├── Price breakdown
    ├── Admin notes
    └── Actions: Assign artist, Update status, Send notification
```

---

## 12. Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Database + API + basic body map

- [ ] Add all new database tables (body_regions, pricing_versions, quotes, etc.)
- [ ] Create seed data for body regions, styles, sizes, etc.
- [ ] Build pricing engine module (calculator, overrides, currency)
- [ ] Create API endpoints: /pricing/rules, /pricing/calculate, /quotes
- [ ] Build basic SVG body map component (static, clickable)
- [ ] Add region selection + info panel

**Deliverable:** Working body map with click-to-select and live price display

### Phase 2: Interactive Canvas (Week 3-4)
**Goal:** Konva overlay + zoom/pan + shape manipulation

- [ ] Install and configure react-konva
- [ ] Build Konva overlay layer on top of SVG
- [ ] Implement draggable, resizable, rotatable shapes
- [ ] Add zoom (mouse wheel) and pan (drag)
- [ ] Implement pinch-to-zoom on mobile
- [ ] Sync canvas coordinates with SVG coordinate system
- [ ] Connect shape dimensions to cm input fields

**Deliverable:** Full interactive body map with coverage drawing

### Phase 3: Quote Flow (Week 5-6)
**Goal:** Complete customer journey from config to submission

- [ ] Build tattoo details form (style, colour, detail, condition)
- [ ] Integrate live price calculation with all inputs
- [ ] Add image upload component (react-dropzone + Cloudinary)
- [ ] Build customer info form
- [ ] Create quote submission flow
- [ ] Build quote confirmation/summary page
- [ ] Add email/WhatsApp notification hooks

**Deliverable:** Complete quote configurator + submission system

### Phase 4: Admin Dashboard (Week 7-8)
**Goal:** Full admin control over pricing and quotes

- [ ] Build admin pricing dashboard with all tabs
- [ ] Implement version management (draft/publish/archive)
- [ ] Create quote management interface
- [ ] Add quote detail view with image gallery
- [ ] Build body region CRUD
- [ ] Add audit log viewer

**Deliverable:** Complete admin control panel

### Phase 5: Polish & Launch (Week 9-10)
**Goal:** Mobile optimization, testing, deployment

- [ ] Mobile-responsive body map
- [ ] Touch gesture optimization
- [ ] Performance testing
- [ ] End-to-end testing
- [ ] Deploy to Vercel + Render
- [ ] Set up Cloudinary production account

**Deliverable:** Production-ready tattoo tool

---

## 13. Implementation Checklist

### Database & Backend
- [ ] Add new tables to schema.sql
- [ ] Create seed script with default data
- [ ] Build pricing engine module (server/src/pricing/)
- [ ] Create pricing API routes
- [ ] Create quote API routes
- [ ] Create upload signature endpoint
- [ ] Add admin middleware for protected routes
- [ ] Add rate limiting to upload endpoint

### Frontend - Body Map
- [ ] Create SVG body map component
- [ ] Add region path data (JSON/TypeScript)
- [ ] Implement region click/hover/selection
- [ ] Add view switcher (front/back/left/right)
- [ ] Add gender switcher
- [ ] Create region info panel

### Frontend - Konva Canvas
- [ ] Install react-konva
- [ ] Create Konva overlay component
- [ ] Implement coverage shape (rectangle/oval)
- [ ] Add drag functionality
- [ ] Add resize handles (Transformer)
- [ ] Add rotation
- [ ] Implement zoom (wheel)
- [ ] Implement pan (drag stage)
- [ ] Implement pinch-to-zoom (mobile)
- [ ] Sync coordinates between SVG and Konva

### Frontend - Quote Form
- [ ] Create tattoo details selectors
- [ ] Build live price display component
- [ ] Add dimension input fields (width/height cm)
- [ ] Build image upload component
- [ ] Create customer info form
- [ ] Build quote submission flow
- [ ] Create quote summary/confirmation page

### Frontend - Admin
- [ ] Create admin pricing dashboard
- [ ] Build editable grids for each pricing category
- [ ] Add version management UI
- [ ] Create quote management table
- [ ] Build quote detail view
- [ ] Add body region CRUD

### DevOps
- [ ] Set up Cloudinary account
- [ ] Add Cloudinary env vars to Render
- [ ] Add Cloudinary env vars to Vercel
- [ ] Update CORS_ORIGIN if needed
- [ ] Test file upload in production
- [ ] Verify pricing calculation accuracy

---

## 14. Appendix: Code Examples

### 14.1 SVG Body Map Component

```tsx
// src/components/body-map/BodyMap.tsx
import React, { useState, useCallback } from 'react';
import { BODY_REGIONS } from '@/data/body-regions';

interface BodyMapProps {
  view: 'front' | 'back' | 'left' | 'right';
  selectedRegions: string[];
  onRegionClick: (regionId: string) => void;
}

export function BodyMap({ view, selectedRegions, onRegionClick }: BodyMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const regions = BODY_REGIONS.filter(r => r.view === view && r.active);

  const handleClick = useCallback((region: typeof BODY_REGIONS[0]) => {
    onRegionClick(region.id);
  }, [onRegionClick]);

  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto max-h-[80vh]"
    >
      {regions.map(region => {
        const isSelected = selectedRegions.includes(region.id);
        const isHovered = hoveredId === region.id;

        return (
          <path
            key={region.id}
            d={region.svgPath}
            fill={isSelected ? 'rgba(255,107,107,0.4)' : isHovered ? 'rgba(255,107,107,0.15)' : 'transparent'}
            stroke={isSelected || isHovered ? '#ff6b6b' : '#333'}
            strokeWidth={isSelected || isHovered ? 2 : 1}
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredId(region.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(region)}
          />
        );
      })}
    </svg>
  );
}
```

### 14.2 Konva Overlay Component

```tsx
// src/components/body-map/KonvaOverlay.tsx
'use client';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useState, useRef, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';

interface CoverageShape {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface KonvaOverlayProps {
  containerWidth: number;
  containerHeight: number;
  shapes: CoverageShape[];
  selectedShapeId: string | null;
  onShapeSelect: (id: string | null) => void;
  onShapeChange: (shape: CoverageShape) => void;
}

export function KonvaOverlay({
  containerWidth,
  containerHeight,
  shapes,
  selectedShapeId,
  onShapeSelect,
  onShapeChange,
}: KonvaOverlayProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shapeRefs = useRef<Map<string, any>>(new Map());
  const trRef = useRef<any>(null);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale, position]);

  return (
    <Stage
      width={containerWidth}
      height={containerHeight}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      draggable
      onWheel={handleWheel}
      onClick={(e) => {
        if (e.target === e.target.getStage()) {
          onShapeSelect(null);
        }
      }}
    >
      <Layer>
        {shapes.map((shape) => (
          <Rect
            key={shape.id}
            ref={(node) => { if (node) shapeRefs.current.set(shape.id, node); }}
            x={shape.x * containerWidth}
            y={shape.y * containerHeight}
            width={shape.width * containerWidth}
            height={shape.height * containerHeight}
            fill="rgba(59,130,246,0.4)"
            stroke="#3b82f6"
            strokeWidth={2}
            rotation={shape.rotation}
            draggable
            onClick={() => onShapeSelect(shape.id)}
            onTap={() => onShapeSelect(shape.id)}
            onDragEnd={(e) => {
              onShapeChange({
                ...shape,
                x: e.target.x() / containerWidth,
                y: e.target.y() / containerHeight,
              });
            }}
            onTransformEnd={() => {
              const node = shapeRefs.current.get(shape.id);
              if (!node) return;
              onShapeChange({
                ...shape,
                x: node.x() / containerWidth,
                y: node.y() / containerHeight,
                width: (node.width() * node.scaleX()) / containerWidth,
                height: (node.height() * node.scaleY()) / containerHeight,
                rotation: node.rotation(),
              });
              node.scaleX(1);
              node.scaleY(1);
            }}
          />
        ))}
        {selectedShapeId && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
          />
        )}
      </Layer>
    </Stage>
  );
}
```

### 14.3 Pricing Calculator

```typescript
// server/src/pricing/calculator.ts
import { roundToStep, applyMultiplier } from './currency';
import type { PricingInput, QuoteBreakdown, PricingVersion } from './types';

export function calculateQuote(
  input: PricingInput,
  version: PricingVersion
): QuoteBreakdown {
  // 1. Get base price
  const basePrice = version.body_area_prices[input.body_area_id] ?? 0;

  // 2. Get multipliers
  const sizeMult = version.size_multipliers[input.size_category_id] ?? 1;
  const detailMult = version.detail_multipliers[input.detail_level_id] ?? 1;
  const styleMult = version.style_multipliers[input.style_id] ?? 1;
  const colourMult = version.colour_multipliers[input.colour_option_id] ?? 1;
  const placementMult = version.placement_multipliers[input.body_area_id] ?? 1;
  const conditionMult = version.project_condition_multipliers[input.project_condition_id] ?? 1;

  // 3. Apply formula
  let subtotal = basePrice;
  subtotal = applyMultiplier(subtotal, sizeMult);
  subtotal = applyMultiplier(subtotal, detailMult);
  subtotal = applyMultiplier(subtotal, styleMult);
  subtotal = applyMultiplier(subtotal, colourMult);
  subtotal = applyMultiplier(subtotal, placementMult);
  subtotal = applyMultiplier(subtotal, conditionMult);

  // 4. Apply minimum price
  if (subtotal < version.minimum_price) {
    subtotal = version.minimum_price;
  }

  // 5. Round
  const estimatedPrice = roundToStep(subtotal, version.rounding_step);

  // 6. Calculate range
  const priceMin = roundToStep(
    estimatedPrice * (1 - version.range_size_variance),
    version.rounding_step
  );
  const priceMax = roundToStep(
    estimatedPrice * (1 + version.range_detail_variance),
    version.rounding_step
  );

  return {
    version_id: version.id,
    estimated_price: estimatedPrice,
    price_min: priceMin,
    price_max: priceMax,
    currency: version.currency_code,
    breakdown: {
      base_price: basePrice,
      size_multiplier: sizeMult,
      detail_multiplier: detailMult,
      style_multiplier: styleMult,
      colour_multiplier: colourMult,
      placement_multiplier: placementMult,
      condition_multiplier: conditionMult,
    },
  };
}
```

### 14.4 Cloudinary Upload Hook

```typescript
// src/hooks/useCloudinaryUpload.ts
import { useState, useCallback } from 'react';

interface UploadState {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  url?: string;
}

export function useCloudinaryUpload() {
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const id = Math.random().toString(36).slice(2);
    setUploads(prev => [...prev, { id, file, progress: 0, status: 'uploading' }]);

    try {
      // 1. Get signature from backend
      const sigRes = await fetch('/api/upload/signature', { method: 'POST' });
      const { timestamp, signature, api_key, folder, cloud_name } = await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', api_key);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!uploadRes.ok) throw new Error('Upload failed');
      const data = await uploadRes.json();

      setUploads(prev => prev.map(u =>
        u.id === id ? { ...u, status: 'done', url: data.secure_url, progress: 100 } : u
      ));

      return data.secure_url;
    } catch (err) {
      setUploads(prev => prev.map(u =>
        u.id === id ? { ...u, status: 'error' } : u
      ));
      throw err;
    }
  }, []);

  return { uploads, uploadFile };
}
```

### 14.5 API Route: Pricing Calculate

```typescript
// server/src/routes/pricing.ts
import { Router } from 'express';
import { calculateQuote } from '../pricing/calculator';
import { getPublishedVersion } from '../pricing/versionResolver';

const router = Router();

router.post('/calculate', async (req, res) => {
  try {
    const version = await getPublishedVersion();
    if (!version) {
      return res.status(500).json({ error: 'No published pricing version found' });
    }

    const result = calculateQuote(req.body, version);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/rules', async (req, res) => {
  try {
    const version = await getPublishedVersion();
    if (!version) {
      return res.status(500).json({ error: 'No published pricing version found' });
    }

    // Return reference tables for UI
    res.json({
      version_id: version.id,
      currency: version.currency_code,
      // Fetch from reference tables
      body_areas: await getActiveBodyAreas(),
      size_categories: await getActiveSizeCategories(),
      styles: await getActiveStyles(),
      detail_levels: await getActiveDetailLevels(),
      colour_options: await getActiveColourOptions(),
      project_conditions: await getActiveProjectConditions(),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
```

---

## Summary

This specification provides everything needed to build the InkedUp Interactive Tattoo Placement & Pricing Tool:

1. **Clear architecture** separating the visual body map from the pricing engine
2. **Technology decisions** with justifications (Konva.js, Cloudinary, inline SVG)
3. **Complete database schema** ready to implement
4. **Pricing engine** with formula, overrides, and currency handling
5. **Layered body map** architecture (SVG + Konva canvas)
6. **Secure file upload** via Cloudinary signed uploads
7. **Full API design** for both public and admin endpoints
8. **Component architecture** for the React frontend
9. **Admin dashboard** design for pricing management
10. **10-week development plan** broken into 5 phases
11. **Production code examples** for all major components

The most important principle: **keep pricing engine independent from body graphic**. The visual tool collects dimensions and placement. The pricing engine converts structured inputs into an estimate. This separation allows the owner to change all pricing through the admin panel without touching the interactive body system.

---

*Document compiled from parallel research on: Konva.js vs Fabric.js, SVG body map architecture, pricing engine patterns, file upload security, and mobile UX best practices.*
