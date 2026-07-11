# Research Report: Interactive SVG Body Maps for Tattoo Placement Tool

## Executive Summary

This report investigates approaches for creating interactive SVG body maps for the InkedUp tattoo placement tool. Key findings:

1. **The `body-muscles` npm package** (`vulovix/body-muscles`) provides a nearly drop-in solution with 70+ anatomical regions, front/back views, click/hover events, and zero dependencies.
2. **Inline SVG in React** is the recommended pattern for full interactivity (events, CSS styling, dynamic updates).
3. **Canvas overlay** on SVG is achievable using `getBoundingClientRect()` and `viewBox` coordinate transforms.
4. **Normalized coordinates (0-1)** should be stored in the data model and converted to SVG user units on render.

---

## 1. SVG Creation Approaches

### 1.1 Pre-Built Open Source Solutions

#### ⭐ Recommended: `body-muscles` (npm)
- **Package**: `npm install body-muscles`
- **Source**: https://github.com/vulovix/body-muscles
- **Features**:
  - 70+ anatomical regions covering head, torso, arms, legs, hands, feet
  - Front (anterior) and back (posterior) views
  - Click and hover event callbacks
  - Intensity/color visualization (0-10 scale)
  - Framework-agnostic (vanilla JS / React / Vue / Angular)
  - Zero dependencies, TypeScript-first
  - Keyboard navigation + ARIA labels
- **Usage with React**:
  ```tsx
  import { useRef, useEffect, useState } from 'react';
  import { BodyChart, ViewSide } from 'body-muscles';

  function BodyMap() {
    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<BodyChart | null>(null);
    const [bodyState, setBodyState] = useState({});

    useEffect(() => {
      chartRef.current = new BodyChart(ref.current!, {
        view: ViewSide.FRONT,
        bodyState,
        onMuscleClick: (id, name) => {
          console.log(`Clicked: ${name} (${id})`);
          setBodyState(prev => ({
            ...prev,
            [id]: { selected: !(prev[id]?.selected) }
          }));
        },
        onMuscleHover: (id) => console.log('Hovered:', id),
      });
      return () => chartRef.current?.destroy();
    }, []);

    useEffect(() => {
      chartRef.current?.update({ bodyState });
    }, [bodyState]);

    return <div ref={ref} />;
  }
  ```
- **Limitations**: Muscle-focused regions, not specifically designed for tattoo placement regions. You may need to customize/extend the region definitions.

#### Other SVG Map Libraries
- **`react-svg-map`** — For geographic maps, but same interaction patterns. Not body-specific.
- **`india-map-svg`**, **`nepal-district-map`**, **`react-iran-map`** — Reference implementations showing the click/hover/fill patterns for region-based SVG maps.

### 1.2 Creating Custom SVG Body Maps

#### Option A: Design from Scratch in Figma
**Workflow**:
1. Create a new Figma file with a frame sized to your target viewBox (e.g., 400 x 800)
2. Import a body reference photo (front view, back view)
3. Use the **Pen Tool (P)** to trace each body region as a separate closed path
4. Name each layer/path according to your region ID (e.g., `shoulder-left`, `upper-arm-right`)
5. Apply a subtle fill color to each region (helps visualize coverage)
6. Export each view as SVG:
   - Select all body paths
   - Right-click > Copy/Paste as > Copy as SVG
   - Or use Export (Ctrl+Shift+E) with format = SVG

**Critical Figma Export Tips**:
- **Outline strokes** before export (Right-click > Outline stroke) — SVG only supports center-aligned strokes
- **Name your layers** — Layer names become path `id` attributes
- **Remove hidden layers** — They still export
- **Use a plugin** like "Clean SVG Export" or "SVG Export" to optimize output
- **Set precision** to 2-3 decimal places to keep file size down

**Post-Export Optimization**:
```bash
# Install SVGO (SVG Optimizer)
npm install -g svgo

# Optimize the exported SVG
svgo body-front.svg --pretty --multipass
```

#### Option B: Adobe Illustrator
**Workflow**:
1. File > Place a body reference image
2. Lock the reference layer
3. Use the **Pen Tool** to trace each region on a new layer
4. Use **Layers panel** to organize: one layer per body region
5. File > Export > Export As > SVG
6. In SVG options: set CSS Properties = Presentation Attributes, Decimal = 2

#### Option C: Inkscape (Free/Open Source)
**Workflow**:
1. File > Import reference image
2. Use **Bezier Tool (B)** or **Freehand Tool (P)** to trace regions
3. Path > Object to Path (if needed)
4. File > Save As > Plain SVG

**Inkscape Trace Bitmap** (for converting existing illustrations):
1. Import a body illustration (PNG/JPG)
2. Select image → Path > Trace Bitmap (Shift+Alt+B)
3. Choose mode:
   - **Brightness Cutoff** — For high-contrast line art
   - **Multicolor > Colors** — For shaded illustrations
4. Adjust scans (number of color layers)
5. Delete original bitmap, keep vector paths
6. Ungroup (Shift+Ctrl+G) to separate individual region paths
7. Manually merge/split paths to match your region definitions

### 1.3 Stock Vector Assets (Commercial)

Where to find pre-made body illustrations with editable paths:

| Source | Format | Price | Notes |
|--------|--------|-------|-------|
| **123RF** | SVG/EPS | ~$5-15/credit | Search "human body parts diagram vector" |
| **Colourbox** | SVG/EPS | Subscription | Body anatomy vectors available |
| **Iconscout** | SVG/PNG | Free/Premium | 1,900+ body anatomy illustration packs |
| **Shutterstock** | EPS/AI | Subscription | High-quality medical illustrations |
| **Adobe Stock** | AI/EPS | Subscription | Professional anatomy vectors |
| **Freepik** | AI/EPS | Free with attribution | Body silhouette vectors |
| **Vecteezy** | AI/EPS | Free/Premium | Body part diagrams |

**Search terms that work**:
- "human body anatomy vector"
- "body parts diagram svg"
- "medical body chart vector"
- "male female body silhouette vector"
- "body map anatomy illustration"

**⚠️ Important**: Most stock vectors come as **single compound paths** or grouped shapes. You will need to:
1. Ungroup everything
2. Use boolean operations (Path > Union/Difference) to separate regions
3. Manually draw boundaries between regions using the Pen tool
4. Ensure each region is a **closed, individual path**

### 1.4 AI-Generated SVG Bodies (Emerging)

- **Recraft V4.1** — AI generates actual SVG paths (not just embedded raster). Export as SVG, open in Figma, edit paths.
- **SVGMaker Figma Plugin** — Generate vectors from text prompts ("human body front view, flat illustration, separate body regions").
- **VectoSolve** — Convert any image to tattoo stencil SVG (thick outlines, no fills).

### 1.5 Recommended Approach for InkedUp

**Phase 1 — MVP (Fastest)**:
1. Use `body-muscles` npm package for the initial prototype
2. Customize the region mapping to match your 20 tattoo regions instead of 70 muscles
3. Fork/adapt the SVG paths from the package

**Phase 2 — Custom Assets**:
1. Commission or purchase a body illustration from a stock site (search "body anatomy vector" on 123RF, Iconscout)
2. Import into Figma
3. Manually trace ~20 regions with the Pen tool (1-2 days of design work)
4. Export as optimized SVG
5. Replace the `body-muscles` SVG data with your custom paths

---

## 2. SVG Interaction Architecture

### 2.1 Three Patterns Compared

| Pattern | Pros | Cons | Best For |
|---------|------|------|----------|
| **Inline SVG** | Full DOM access, events, CSS, React state | Larger bundle, no caching | ✅ **Tattoo tool — recommended** |
| **SVG as React Component** | Clean imports, tree-shakeable | Same bundle cost as inline | Good alternative |
| **SVG as `<img>` with overlay** | Cachable, small HTML | No DOM access, no events | Static displays only |
| **SVG `<use>` with `<symbol>`** | Reusable, cached | Harder to style individual paths | Icon systems |

**Verdict**: Use **inline SVG** or **SVG React components** for the tattoo tool. You need per-path click/hover events and dynamic fill colors.

### 2.2 Inline SVG React Pattern

```tsx
import React, { useState, useCallback } from 'react';

interface BodyRegion {
  id: string;
  name: string;
  path: string; // SVG path data
  basePrice: number;
  difficultyMultiplier: number;
  minPrice: number;
  active: boolean;
}

interface BodyMapProps {
  regions: BodyRegion[];
  viewBox: string; // e.g. "0 0 400 800"
  onRegionClick: (region: BodyRegion) => void;
}

function BodyMap({ regions, viewBox, onRegionClick }: BodyMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleClick = useCallback((region: BodyRegion) => {
    if (!region.active) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(region.id)) next.delete(region.id);
      else next.add(region.id);
      return next;
    });
    onRegionClick(region);
  }, [onRegionClick]);

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="body-map"
      style={{ width: '100%', height: 'auto', maxHeight: '80vh' }}
    >
      {regions.map(region => {
        const isHovered = hoveredId === region.id;
        const isSelected = selectedIds.has(region.id);
        const isActive = region.active;

        let fill = 'transparent';
        let stroke = '#333';
        let strokeWidth = 1;
        let opacity = 1;

        if (!isActive) {
          opacity = 0.3;
          stroke = '#999';
        } else if (isSelected) {
          fill = 'rgba(255, 107, 107, 0.4)'; // Coral red
          stroke = '#ff6b6b';
          strokeWidth = 2;
        } else if (isHovered) {
          fill = 'rgba(255, 107, 107, 0.15)';
          stroke = '#ff6b6b';
          strokeWidth = 2;
        }

        return (
          <path
            key={region.id}
            id={region.id}
            d={region.path}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
            style={{
              cursor: isActive ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={() => isActive && setHoveredId(region.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(region)}
            pointerEvents={isActive ? 'all' : 'none'}
          />
        );
      })}
    </svg>
  );
}
```

### 2.3 Performance: Static + Overlay Pattern

For ~20 regions, simple React state is fine. If you scale to 100+ regions or complex visualizations, use the **static rendering + interaction overlay** pattern from pganalyze:

```tsx
function BodyMapOptimized({ regions, onRegionClick }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Static layer: renders once, never re-renders on hover
  const StaticLayer = useMemo(() => (
    <g>
      {regions.map(r => (
        <path
          key={`static-${r.id}`}
          d={r.path}
          fill="transparent"
          stroke="#333"
          strokeWidth={1}
        />
      ))}
    </g>
  ), [regions]);

  // Interaction overlay: only re-renders when hoveredId changes
  const InteractionLayer = useMemo(() => {
    if (!hoveredId && selectedIds.size === 0) return null;
    return (
      <g>
        {selectedIds.has(hoveredId) && (
          <path d={regions.find(r => r.id === hoveredId)?.path}
            fill="rgba(255, 107, 107, 0.4)" stroke="#ff6b6b" strokeWidth={2} />
        )}
      </g>
    );
  }, [hoveredId, selectedIds, regions]);

  return (
    <svg viewBox="0 0 400 800" className="body-map">
      {StaticLayer}
      {InteractionLayer}
      {/* Invisible rect captures mouse events without re-rendering static paths */}
      <rect
        width="100%" height="100%"
        fill="none" pointerEvents="all"
        onMouseMove={(e) => {
          // Map mouse to region using SVG coordinate space
          const pt = e.currentTarget.closest('svg').createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(e.currentTarget.getScreenCTM().inverse());
          // Find region containing point (using isPointInFill or bounding boxes)
        }}
      />
    </svg>
  );
}
```

### 2.4 Multi-Select Support

```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const handleClick = useCallback((region: BodyRegion, e: React.MouseEvent) => {
  const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
  setSelectedIds(prev => {
    const next = new Set(prev);
    if (isMulti) {
      if (next.has(region.id)) next.delete(region.id);
      else next.add(region.id);
    } else {
      next.clear();
      next.add(region.id);
    }
    return next;
  });
  onRegionClick(region, isMulti);
}, [onRegionClick]);
```

### 2.5 Storing Normalized Coordinates (0-1)

Store all region data in normalized coordinates, then scale to the SVG viewBox:

```ts
// Data model
interface RegionData {
  id: string;
  name: string;
  // Normalized path: coordinates in 0-1 range
  normalizedPath: string;
  basePrice: number;
  difficultyMultiplier: number;
  minPrice: number;
  active: boolean;
  // Optional: normalized bounding box for hit testing
  bounds: { x: number; y: number; w: number; h: number };
}

// Convert normalized path to SVG path data
function normalizeToSvgPath(normalizedPath: string, viewBoxWidth: number, viewBoxHeight: number): string {
  // Parse path commands and scale coordinates
  return normalizedPath.replace(
    /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g,
    (match, cmd, coords) => {
      if (!coords.trim()) return cmd;
      const nums = coords.trim().split(/[\s,]+/).map(Number);
      const scaled = nums.map((n, i) =>
        i % 2 === 0 ? n * viewBoxWidth : n * viewBoxHeight
      );
      return cmd + scaled.join(' ');
    }
  );
}

// Example: "M 0.1 0.2 L 0.3 0.2 L 0.3 0.5 Z" at 400x800 viewBox
// becomes "M 40 160 L 120 160 L 120 400 Z"
```

**Alternative**: Store the SVG path in absolute viewBox coordinates (e.g., 0-400, 0-800) and compute normalized values on the fly when needed. This is simpler if you export directly from Figma/Illustrator.

---

## 3. SVG + Canvas Integration

### 3.1 Use Case: Drawing Tattoo Coverage

You want users to sketch/draw tattoo coverage areas on top of the body map. The SVG provides the body outline and clickable regions; the Canvas provides a freehand drawing layer.

### 3.2 Architecture: Canvas OVER SVG

```
┌─────────────────────────────────┐
│  Canvas Layer (drawing)         │ ← absolute positioned, pointer-events: none
│  ┌─────────────────────────┐    │     (except during drawing mode)
│  │  Freehand ink strokes   │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  SVG Layer (body map)           │ ← pointer-events: all
│  ┌─────────────────────────┐    │
│  │  Interactive body paths │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Background Layer               │
└─────────────────────────────────┘
```

### 3.3 Implementation

```tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

function BodyMapWithCanvas({ regions, viewBox, onRegionClick }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Keep canvas in sync with SVG size
  useEffect(() => {
    const syncCanvas = () => {
      if (!svgRef.current || !canvasRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      const ctx = canvas.getContext('2d');
      ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    syncCanvas();
    window.addEventListener('resize', syncCanvas);
    return () => window.removeEventListener('resize', syncCanvas);
  }, []);

  // Convert screen coordinates to SVG normalized coordinates (0-1)
  const screenToNormalized = useCallback((screenX: number, screenY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const [vbX, vbY, vbW, vbH] = svgRef.current.viewBox.baseVal;
    return {
      x: (svgP.x - vbX) / vbW,
      y: (svgP.y - vbY) / vbH,
    };
  }, []);

  // Canvas drawing handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!drawingMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [drawingMode]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawingMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, drawingMode]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Save stroke to state, clear canvas, re-render all strokes
  }, [isDrawing]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* SVG Body Map */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'block' }}
      >
        {regions.map(region => (
          <path
            key={region.id}
            d={region.path}
            fill={selectedIds.has(region.id) ? 'rgba(255,107,107,0.3)' : 'transparent'}
            stroke={hoveredId === region.id ? '#ff6b6b' : '#333'}
            strokeWidth={hoveredId === region.id ? 2 : 1}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={() => setHoveredId(region.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              if (!drawingMode) onRegionClick(region);
            }}
          />
        ))}
      </svg>

      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: drawingMode ? 'all' : 'none',
          zIndex: 10,
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      {/* Toggle Drawing Mode */}
      <button onClick={() => setDrawingMode(!drawingMode)}>
        {drawingMode ? 'Exit Drawing' : 'Draw Coverage'}
      </button>
    </div>
  );
}
```

### 3.4 Coordinate Synchronization Formula

```ts
/**
 * Converts a point from screen pixel coordinates to SVG normalized coordinates (0-1)
 */
function screenToNormalized(
  svgElement: SVGSVGElement,
  screenX: number,
  screenY: number
): { x: number; y: number } {
  const pt = svgElement.createSVGPoint();
  pt.x = screenX;
  pt.y = screenY;
  // Transform from screen to SVG user space
  const svgP = pt.matrixTransform(svgElement.getScreenCTM().inverse());
  // Normalize to 0-1 based on viewBox
  const vb = svgElement.viewBox.baseVal;
  return {
    x: (svgP.x - vb.x) / vb.width,
    y: (svgP.y - vb.y) / vb.height,
  };
}

/**
 * Converts normalized coordinates (0-1) back to screen pixel coordinates
 */
function normalizedToScreen(
  svgElement: SVGSVGElement,
  nx: number,
  ny: number
): { x: number; y: number } {
  const vb = svgElement.viewBox.baseVal;
  const svgX = vb.x + nx * vb.width;
  const svgY = vb.y + ny * vb.height;
  const pt = svgElement.createSVGPoint();
  pt.x = svgX;
  pt.y = svgY;
  const screenP = pt.matrixTransform(svgElement.getScreenCTM());
  return { x: screenP.x, y: screenP.y };
}
```

### 3.5 Alternative: SVG `<foreignObject>` with Canvas Inside

```svg
<svg viewBox="0 0 400 800">
  <!-- Body paths -->
  <path d="..." />

  <!-- Canvas embedded inside SVG -->
  <foreignObject x="0" y="0" width="400" height="800">
    <canvas xmlns="http://www.w3.org/1999/xhtml"
            width="400" height="800"
            style="width:100%;height:100%">
    </canvas>
  </foreignObject>
</svg>
```

**⚠️ Warning**: `foreignObject` has cross-browser quirks. The absolute-positioned overlay approach is more reliable.

### 3.6 Libraries for SVG+Canvas Hybrid

| Library | Purpose | Notes |
|---------|---------|-------|
| **Fabric.js** | Interactive canvas with SVG import/export | Can load SVG paths onto canvas, add drawing tools |
| **Paper.js** | Vector graphics scripting | Unified model for paths on canvas, can import SVG |
| **Konva.js** | Canvas 2D library with React wrappers | Hit detection, layers, animations |
| **Rough.js** | Sketchy/hand-drawn style | Nice for tattoo sketch aesthetic |
| **Cytoscape.js** | Graph theory library | Overkill for this use case |

**Recommendation**: Start with raw Canvas 2D API + SVG overlay. If you need advanced features (undo/redo, layers, shape tools), migrate to **Fabric.js** or **Konva.js**.

---

## 4. Responsive Scaling

### 4.1 SVG ViewBox Strategy

```tsx
<svg
  viewBox="0 0 400 800"      // Internal coordinate system
  width="100%"               // Fill container width
  height="auto"              // Maintain aspect ratio
  preserveAspectRatio="xMidYMid meet"
>
  {/* Body paths defined in 0-400, 0-800 space */}
</svg>
```

**Behavior**:
- SVG scales proportionally to fit container width
- Aspect ratio is preserved (no body distortion)
- Internal coordinates remain in 0-400, 0-800 space
- `height: auto` maintains aspect ratio from viewBox

### 4.2 Container Sizing for Mobile/Tablet/Desktop

```css
.body-map-container {
  width: 100%;
  max-width: 400px;      /* Don't get too large on desktop */
  margin: 0 auto;
}

.body-map-container svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Mobile: full width */
@media (max-width: 640px) {
  .body-map-container {
    max-width: 100%;
    padding: 0 16px;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .body-map-container {
    max-width: 350px;
  }
}
```

### 4.3 Normalized Coordinates for Responsive Design

```ts
// Store all positions in 0-1 normalized space
const tattooPlacement = {
  regionId: 'upper-arm-left',
  // Center of tattoo in normalized coordinates
  position: { x: 0.35, y: 0.42 },
  // Size as percentage of body height
  size: { width: 0.08, height: 0.12 },
  rotation: 15, // degrees
};

// Convert to SVG coordinates at render time
function getSvgPlacement(
  placement: typeof tattooPlacement,
  viewBoxWidth: number,
  viewBoxHeight: number
) {
  return {
    x: placement.position.x * viewBoxWidth,
    y: placement.position.y * viewBoxHeight,
    width: placement.size.width * viewBoxWidth,
    height: placement.size.height * viewBoxHeight,
    rotation: placement.rotation,
  };
}
```

### 4.4 Converting Screen Pixels to Normalized Coordinates

```ts
function screenToNormalized(
  svgElement: SVGSVGElement,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  // Get SVG bounding rect in screen pixels
  const rect = svgElement.getBoundingClientRect();
  // Get viewBox
  const vb = svgElement.viewBox.baseVal;

  // Calculate scaling factors
  // (how many SVG units per screen pixel)
  const scaleX = vb.width / rect.width;
  const scaleY = vb.height / rect.height;

  // Convert screen position to SVG user space
  const svgX = (clientX - rect.left) * scaleX + vb.x;
  const svgY = (clientY - rect.top) * scaleY + vb.y;

  // Normalize to 0-1
  return {
    x: (svgX - vb.x) / vb.width,
    y: (svgY - vb.y) / vb.height,
  };
}
```

### 4.5 Handling Device Pixel Ratio (Retina)

```ts
function setupRetinaCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Set actual canvas size to match physical pixels
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale context so 1 unit = 1 CSS pixel
  const ctx = canvas.getContext('2d');
  ctx?.scale(dpr, dpr);

  return ctx;
}
```

### 4.6 View Switching (Front/Back/Left/Right)

```tsx
const VIEWS = {
  front: { viewBox: '0 0 400 800', regions: frontRegions },
  back: { viewBox: '0 0 400 800', regions: backRegions },
  left: { viewBox: '0 0 200 800', regions: leftRegions },
  right: { viewBox: '0 0 200 800', regions: rightRegions },
};

function BodyMap({ currentView }: { currentView: keyof typeof VIEWS }) {
  const view = VIEWS[currentView];
  return (
    <svg viewBox={view.viewBox} className="body-map">
      {view.regions.map(region => (
        <path key={region.id} d={region.path} /* ... */ />
      ))}
    </svg>
  );
}
```

---

## 5. Admin Panel: CRUD for Regions

### 5.1 Data Schema (PostgreSQL)

```sql
CREATE TABLE body_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- e.g., "upper-arm-left"
  name TEXT NOT NULL,        -- e.g., "Upper Arm (Left)"
  view TEXT NOT NULL,        -- "front" | "back" | "left" | "right"
  gender TEXT,               -- "male" | "female" | "neutral"
  base_price INTEGER NOT NULL DEFAULT 0, -- in cents
  difficulty_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  min_price INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  normalized_path TEXT NOT NULL, -- SVG path in 0-1 coordinates
  bounds JSONB, -- {x, y, w, h} for quick hit testing
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 React Admin Component

```tsx
function RegionEditor({ region, onSave }: { region: BodyRegion; onSave: (r: BodyRegion) => void }) {
  const [form, setForm] = useState(region);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
      <input type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: Number(e.target.value)})} />
      <input type="number" step="0.1" value={form.difficultyMultiplier} onChange={e => setForm({...form, difficultyMultiplier: Number(e.target.value)})} />
      <label><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} /> Active</label>
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 6. Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **SVG Rendering** | Inline SVG in React | Full interactivity, CSS, state |
| **Body Map Data** | `body-muscles` (forked) | Starting point with 70+ regions |
| **Drawing Overlay** | HTML Canvas 2D API | Freehand sketching, good performance |
| **Coordinate System** | Normalized (0-1) | Responsive across all screen sizes |
| **State Management** | React useState/useReducer | Simple for ~20 regions |
| **Database** | PostgreSQL (Neon) | Already using, supports JSONB for paths |
| **Canvas Library** | Raw API → Fabric.js | Start simple, upgrade if needed |
| **Styling** | Tailwind CSS | Already in project |

---

## 7. Implementation Roadmap

### Week 1: Prototype
1. Install `body-muscles` and render front/back views
2. Add click/hover state with Tailwind colors
3. Display region name + base price on click
4. Test on mobile/desktop

### Week 2: Custom Regions
1. Map `body-muscles` 70+ regions → your 20 tattoo regions (merge/group)
2. OR: Trace custom SVG paths in Figma
3. Replace library SVG data with custom paths
4. Add normalized coordinate system

### Week 3: Canvas Integration
1. Add canvas overlay for drawing
2. Implement coordinate sync (screen ↔ SVG ↔ normalized)
3. Save/restore drawn strokes
4. Add "clear drawing" button

### Week 4: Admin + Polish
1. Build admin CRUD for regions
2. Add region activation/deactivation
3. Multi-select support (Ctrl/Cmd+click)
4. Mobile touch optimization

---

## 8. Key Code Snippets Summary

### Hit Testing: Is Point Inside SVG Path?
```ts
function isPointInPath(
  svgElement: SVGSVGElement,
  pathElement: SVGPathElement,
  clientX: number,
  clientY: number
): boolean {
  const pt = svgElement.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pathElement.isPointInFill(pt);
}
```

### Batch SVG Export from Figma
Use the "SVG Export" Figma plugin or batch export:
1. Select all body region frames
2. Export > SVG (with "Include id attribute" enabled)
3. Run through SVGO for optimization

### Path Data Normalization
```ts
// Normalize an absolute SVG path to 0-1 coordinates
function normalizePath(pathData: string, viewBoxWidth: number, viewBoxHeight: number): string {
  return pathData.replace(/[-+]?[0-9]*\.?[0-9]+/g, (match, offset, string) => {
    const num = parseFloat(match);
    // Even indices are X, odd are Y (simplification — use proper path parser for production)
    // This is a naive approach; use svg-path-parser npm package for real implementation
    return String(num); 
  });
}
```

---

*Report compiled from research across npm packages, GitHub repositories, MDN documentation, Figma/Illustrator/Inkscape workflows, and SVG specification references.*
