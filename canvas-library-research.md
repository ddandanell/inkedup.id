# Canvas Library Research: Konva.js vs Fabric.js for Tattoo Placement Tool

> **Research Date:** 2026-07-11
> **Project:** InkedUp.id — Interactive Tattoo Placement Tool
> **Stack:** React 19 + TypeScript
> **Researcher:** Research Specialist

---

## Executive Summary

For an interactive tattoo placement tool requiring draggable/resizable/rotatable shapes, zoom/pan, mobile touch support, and React 19 + TypeScript integration, **Konva.js with react-konva is the clear recommendation**. It offers first-class React bindings, superior mobile performance via multi-layer architecture, and a declarative API that aligns naturally with React patterns. Fabric.js is powerful for design editors but lacks official React integration and has significantly larger bundle size with less mobile optimization.

---

## Detailed Comparison Table

| Criteria | **Konva.js + react-konva** | **Fabric.js** |
|----------|---------------------------|---------------|
| **npm install** | `npm install react-konva konva` | `npm install fabric` |
| **Latest stable version** | `konva@10.3.0` / `react-konva@19.2.5` | `fabric@7.4.0` |
| **React 19 compatibility** | ✅ **First-class** — `react-konva@19.x` built specifically for React 19 | ⚠️ **No official React bindings** — must use imperative `useRef` + `useEffect` pattern |
| **TypeScript support** | ✅ Excellent — built-in types, `KonvaEventObject<T>` typed events, full IntelliSense | ✅ Good in v6+ — bundled types, but requires module augmentation for custom properties on `FabricObject` |
| **Declarative API** | ✅ Full JSX components: `<Rect draggable />`, `<Transformer />`, `<Stage>` | ❌ Imperative only: `new fabric.Rect()`, `canvas.add(rect)` |
| **Draggable shapes** | ✅ `draggable={true}` prop on any shape | ✅ `selectable: true` by default on all objects |
| **Resizable / Rotatable** | ✅ Built-in `<Transformer />` component attaches resize/rotate handles | ✅ Built-in selection controls with resize/rotate handles |
| **Zoom & Pan** | ✅ Stage `scale` + `position` props; multi-touch pinch zoom via `touchmove` events | ✅ `canvas.setZoom()` + `canvas.setViewportTransform()` |
| **Touch / Mobile gestures** | ✅ Unified `mousedown touchstart` events; `Konva.hitOnDragEnabled = true`; native pinch-zoom support | ⚠️ Basic touch support; no built-in pinch-zoom; requires manual gesture handling |
| **Mobile performance** | ✅ **Excellent** — multi-layer architecture isolates static vs interactive content; maintains 60fps with 5,000+ objects | ⚠️ **Moderate** — single canvas redraws entirely on any change; performance degrades with many objects |
| **Bundle size (package)** | `konva`: 306 KB packed / 1.5 MB unpacked; `react-konva`: 15 KB packed / 78 KB unpacked | `fabric`: 5.0 MB packed / 22.2 MB unpacked |
| **Bundle size (minified/gzipped)** | `react-konva` ~126 KB minified / ~40 KB gzipped (incl. konva dep) | Much larger — not easily tree-shakeable; custom build required to reduce size |
| **Weekly npm downloads** | ~400,000 | ~500,000 |
| **GitHub activity** | Last updated June 2026; active releases (v19.2.5 in May 2026) | Last updated actively; v7.4.0 released 2026 |
| **Maintenance status** | ✅ Very active — dedicated maintainer (Anton Lavrevov), regular releases | ✅ Active — v6 was a major TypeScript/ESM rewrite; v7 continues evolution |
| **React 19 known issues** | ⚠️ StrictMode double-event attach fixed in v19.0.6; context bridging no longer needed since v18.2.2 | ⚠️ No reconciler integration — React StrictMode lifecycle mismatches possible with manual canvas disposal |

---

## Feature Deep Dive

### 1. React 19 / TypeScript Compatibility

#### Konva.js

`react-konva` v19.x is **explicitly built for React 19**. The version numbers match React's major version, making it easy to track compatibility:

```bash
npm install react-konva@19.2.5 konva@10.3.0
```

- Full JSX declarative API — every Konva shape is a React component
- TypeScript types ship with both packages (no `@types/` needed)
- Event handlers are fully typed: `onDragEnd` receives `KonvaEventObject<DragEvent>`
- React Context works inside `<Stage>` since v18.2.2 (no bridging needed)

**Known React 19 issue (RESOLVED):**
- v19.0.6 fixed a StrictMode bug where events could be attached twice
- v19.2.1 fixed reconciler issues with React 19.2
- v19.2.4 fixed MobX race conditions via async scheduling

#### Fabric.js

Fabric.js has **no official React wrapper**. Integration is entirely imperative:

```bash
npm install fabric@7.4.0
```

```tsx
import * as fabric from 'fabric';
import { useEffect, useRef } from 'react';

export const FabricCanvas = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasEl.current!, {
      width: 800,
      height: 600,
    });
    canvasRef.current = canvas;

    const rect = new fabric.Rect({
      left: 100, top: 100, width: 200, height: 150,
      fill: '#3b82f6',
    });
    canvas.add(rect);

    return () => {
      canvas.dispose();
    };
  }, []);

  return <canvas ref={canvasEl} />;
};
```

- v6+ ships with first-class TypeScript definitions (major improvement from community `@types/fabric`)
- Adding custom properties requires module augmentation of `FabricObjectProps`
- `toJSON()` serialization returns plain objects that lose class info — type assertions needed on restore
- Manual disposal required to prevent memory leaks

---

### 2. Draggable, Resizable, Rotatable Shapes

#### Konva.js — Declarative Approach

```tsx
import { Stage, Layer, Rect, Transformer, Circle } from 'react-konva';
import { useState, useRef } from 'react';

const TattooShape = ({ shape, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill}
        draggable
        rotation={shape.rotation}
        onClick={onSelect}
        onTap={onSelect}  // Touch support
        onDragEnd={(e) => {
          onChange({ ...shape, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          onChange({
            ...shape,
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};
```

Key advantages:
- **`<Transformer />`** is a built-in component that automatically renders resize/rotate handles
- `boundBoxFunc` allows constraining transformations (e.g., min size, aspect ratio)
- Touch events unified: `onClick` and `onTap` both work
- Shape state naturally flows through React props

#### Fabric.js — Imperative Approach

```tsx
import * as fabric from 'fabric';

useEffect(() => {
  const canvas = new fabric.Canvas(canvasEl.current!, {
    width: 800,
    height: 600,
    backgroundColor: '#f0f0f0',
  });

  // All fabric objects are interactive by default:
  // → Click to select, handles appear automatically
  // → Drag to move
  // → Corner handles to resize
  // → Rotation handle to rotate
  const rect = new fabric.Rect({
    left: 100, top: 100,
    width: 200, height: 150,
    fill: '#3b82f6',
    stroke: '#60a5fa',
    strokeWidth: 2,
    rx: 10, ry: 10,  // Border radius
  });

  const circle = new fabric.Circle({
    left: 400, top: 200,
    radius: 80,
    fill: '#10b981',
    opacity: 0.8,
  });

  // Polygon for custom tattoo shapes
  const polygon = new fabric.Polygon([
    { x: 200, y: 0 },
    { x: 250, y: 50 },
    { x: 250, y: 100 },
    { x: 150, y: 100 },
    { x: 150, y: 50 },
  ], {
    left: 300, top: 300,
    fill: '#f59e0b',
  });

  canvas.add(rect, circle, polygon);

  // Listen for object modifications
  canvas.on('object:modified', (e) => {
    console.log('Shape modified:', e.target?.toJSON());
  });

  return () => canvas.dispose();
}, []);
```

Key characteristics:
- All objects are **automatically selectable, draggable, resizable, rotatable** by default
- No additional "transformer" component needed
- Controls can be customized per-object via `setControlsVisibility()`
- But: state must be synced manually between Fabric's internal model and React state

---

### 3. Zoom & Pan Implementation

#### Konva.js

```tsx
import { Stage, Layer } from 'react-konva';
import { useState, useCallback } from 'react';

const ZoomableCanvas = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

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

  // Pinch-to-zoom for mobile
  const handleTouchMove = useCallback((e) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      const dist = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      // Calculate zoom from distance change...
    }
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      draggable  // Pan by dragging
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
    >
      <Layer>{/* shapes */}</Layer>
    </Stage>
  );
};
```

Konva's zoom approach:
- Scale the entire `Stage` via `scaleX`/`scaleY` props
- Pan by setting `x`/`y` position or using `draggable={true}` on the Stage
- Pointer position calculations account for current zoom level

#### Fabric.js

```tsx
useEffect(() => {
  const canvas = new fabric.Canvas(canvasEl.current!);

  // Zoom centered on pointer
  canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Pan mode
  canvas.on('mouse:down', (opt) => {
    const evt = opt.e;
    if (evt.altKey === true) {
      canvas.isDragging = true;
      canvas.lastPosX = evt.clientX;
      canvas.lastPosY = evt.clientY;
    }
  });

  canvas.on('mouse:move', (opt) => {
    if (canvas.isDragging) {
      const evt = opt.e;
      const vpt = canvas.viewportTransform;
      vpt[4] += evt.clientX - canvas.lastPosX;
      vpt[5] += evt.clientY - canvas.lastPosY;
      canvas.requestRenderAll();
      canvas.lastPosX = evt.clientX;
      canvas.lastPosY = evt.clientY;
    }
  });

  canvas.on('mouse:up', () => {
    canvas.isDragging = false;
  });
}, []);
```

Fabric's zoom approach:
- `zoomToPoint()` zooms centered on a specific point
- Viewport transform is a 6-element matrix `[a, b, c, d, e, f]`
- Pan requires manual manipulation of the viewport transform
- More flexible but more complex

---

### 4. Mobile Touch & Gesture Support

| Aspect | Konva.js | Fabric.js |
|--------|----------|-----------|
| **Touch events** | Unified API: `onClick`/`onTap`, `onTouchStart`/`onMouseDown` auto-bound | Separate handling; `mouse:` and `touch:` event namespaces |
| **Pinch zoom** | Native multi-touch support via `touchmove` with 2 touch points | No built-in pinch zoom — requires external library (Hammer.js) or manual implementation |
| **Hit detection** | Pixel-perfect for all shapes; `Konva.Util.haveIntersection()` for selection boxes | Bounding-box based by default; pixel-perfect available with `perPixelTargetFind` |
| **Drag on mobile** | `Konva.hitOnDragEnabled = true` enables drag-start on any touch | `canvas.selection = false` needed to enable touch dragging without selection |
| **Performance** | 60fps on mobile via layer batching and caching | Redraws entire canvas on change — can drop frames on complex scenes |

**Konva mobile configuration:**
```tsx
import Konva from 'konva';

// Essential for mobile drag support
Konva.hitOnDragEnabled = true;
Konva.captureTouchEventsEnabled = true;
```

**Konva pinch-zoom demo (from official docs):**
```tsx
let lastCenter = null;
let lastDist = 0;

stage.on('touchmove', (e) => {
  e.evt.preventDefault();
  const touch1 = e.evt.touches[0];
  const touch2 = e.evt.touches[1];

  if (touch1 && touch2) {
    if (stage.isDragging()) {
      stage.stopDrag();
    }

    const p1 = { x: touch1.clientX, y: touch1.clientY };
    const p2 = { x: touch2.clientX, y: touch2.clientY };

    if (!lastCenter) {
      lastCenter = getCenter(p1, p2);
      return;
    }
    const newCenter = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!lastDist) lastDist = dist;

    const pointTo = {
      x: (newCenter.x - stage.x()) / stage.scaleX(),
      y: (newCenter.y - stage.y()) / stage.scaleY(),
    };

    const newScale = stage.scaleX() * (dist / lastDist);
    stage.scale({ x: newScale, y: newScale });

    const dx = newCenter.x - lastCenter.x;
    const dy = newCenter.y - lastCenter.y;
    stage.position({
      x: newCenter.x - pointTo.x * newScale + dx,
      y: newCenter.y - pointTo.y * newScale + dy,
    });

    lastDist = dist;
    lastCenter = newCenter;
  }
});

stage.on('touchend', () => {
  lastDist = 0;
  lastCenter = null;
});
```

---

### 5. Performance on Mobile

**Konva.js advantages:**
- **Multi-layer architecture**: Each `Layer` is a separate `<canvas>` element. Static content (body silhouette background) renders once, while interactive shapes redraw on a top layer.
- **Batch drawing**: Operations within a layer are batched into a single draw call.
- **Caching**: `node.cache()` rasterizes complex shapes to bitmaps for faster rendering.
- **Handles 5,000+ objects at 60fps** on mobile with proper layering.

**Fabric.js limitations:**
- **Single canvas**: All objects live on one canvas. Every modification triggers a full canvas redraw.
- **No built-in layering**: Workarounds using multiple `Canvas` instances are possible but complex.
- **Moderate object counts**: Performance is fine for dozens of objects but degrades with hundreds on mobile.
- **25.8 MB unpacked** — the library itself is heavy, though browser bundles are smaller.

---

### 6. Bundle Size Impact

| Package | npm Pack Size | Unpacked Size | Files | Minified | Gzipped |
|---------|--------------|---------------|-------|----------|---------|
| `konva@10.3.0` | 306 KB | 1.5 MB | 129 | — | — |
| `react-konva@19.2.5` | 15 KB | 78 KB | — | 126 KB | **~40 KB** |
| `fabric@7.4.0` | **5.0 MB** | **22.2 MB** | 2,410 | Much larger | Much larger |

**Notes:**
- `react-konva`'s gzipped size (~40 KB) includes its `konva` dependency
- Fabric.js is **16x larger** packed than Konva. The full bundle is heavy.
- Fabric.js historically does not tree-shake well. A custom build is needed for size reduction.
- Konva supports minimal imports: `import Konva from 'konva/lib/Core'` + only needed shapes

---

### 7. Community Activity & Maintenance

| Metric | Konva.js | Fabric.js |
|--------|----------|-----------|
| **Weekly downloads** | ~400,000 | ~500,000 |
| **GitHub last update** | June 2026 | Active (v7 released early 2026) |
| **Release cadence** | Frequent patch releases (v19.2.5 in May 2026) | Steady (v7.4.0 in 2026) |
| **Maintainer** | Anton Lavrevov (single dedicated maintainer) | Team/community (v6 was major community rewrite) |
| **React ecosystem** | Official `react-konva`, `vue-konva`, `svelte-konva`, `ng2-konva` | No official framework bindings |
| **Documentation** | Excellent — konvajs.org with interactive demos | Good — fabricjs.com with demos |

---

### 8. Known Issues with React 19

#### Konva.js
- **RESOLVED in v19.0.6**: StrictMode could double-attach event listeners
- **RESOLVED in v19.2.1**: Reconciler compatibility issues with React 19.2
- **RESOLVED in v19.2.4**: MobX race condition via async `scheduleMicrotask`
- **Context bridging**: No longer needed since react-konva@18.2.2. Contexts work inside `<Stage>` automatically.
- **SSR**: Renders empty `div` on server — expected behavior, not a bug. Use `"use client"` in Next.js.

#### Fabric.js
- **No reconciler integration**: Since Fabric manages its own object model outside React's VDOM, React's concurrent features and StrictMode can cause lifecycle mismatches. Manual disposal in `useEffect` cleanup is critical.
- **No React 19-specific issues** reported because Fabric doesn't integrate with React at all — it's entirely imperative.
- **TypeScript**: Adding custom properties to fabric objects requires module augmentation:
  ```ts
  declare module 'fabric' {
    interface FabricObjectProps {
      myCustomProp?: string;
    }
  }
  ```

---

## Tattoo Placement Tool / Body Map Canvas Examples

**No specific open-source "tattoo placement tool" was found** for either library. However, both are used in closely related domains:

### Konva.js Similar Projects
- **Room/floor plan editors** — users drag rooms, resize with transformers (closest analog to body part placement)
- **PUBG map drawing tool** — react-konva with undo/redo, shape manipulation
- **T-shirt customization** — Next.js + react-konva for product customization (very similar use case)
- **Image annotation tools** — medical imaging, drag-and-drop labels
- **Video editor** (Kapwing-like) — complex canvas manipulation with react-konva

### Fabric.js Similar Projects
- **Design editors** (Canva-like tools) — Fabric's built-in controls make it popular for design apps
- **Image cropping/manipulation** — built-in image filters and controls
- **Architecture diagrams** — grouping and nested transformations

**For a tattoo placement tool specifically**, the requirements map most naturally to Konva's:
- Body silhouette as a static background image (one layer)
- Tattoo shapes (ovals, rectangles, custom polygons) as draggable overlays (another layer)
- Zoom/pan to focus on specific body areas
- Touch-friendly on mobile devices

---

## Code Example: Tattoo Placement Tool with Konva.js

```tsx
'use client';
import { Stage, Layer, Rect, Circle, Transformer, Image } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import Konva from 'konva';

interface TattooShape {
  id: string;
  type: 'rect' | 'circle' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  rotation: number;
}

const INITIAL_SHAPES: TattooShape[] = [
  { id: '1', type: 'rect', x: 100, y: 100, width: 120, height: 80, fill: 'rgba(59,130,246,0.5)', rotation: 0 },
  { id: '2', type: 'circle', x: 300, y: 200, radius: 50, fill: 'rgba(16,185,129,0.5)', rotation: 0 },
];

export const TattooPlacementCanvas = () => {
  const [shapes, setShapes] = useState<TattooShape[]>(INITIAL_SHAPES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const shapeRefs = useRef<Map<string, any>>(new Map());
  const trRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  // Sync transformer with selected shape
  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = shapeRefs.current.get(selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const updateShape = (id: string, updates: Partial<TattooShape>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={scale}
      scaleY={scale}
      x={stagePos.x}
      y={stagePos.y}
      draggable
      onWheel={handleWheel}
      onClick={(e) => {
        if (e.target === e.target.getStage()) setSelectedId(null);
      }}
    >
      {/* Background layer — body silhouette image */}
      <Layer>
        {/* <Image image={bodyImage} width={400} height={600} /> */}
      </Layer>

      {/* Interactive layer — tattoo shapes */}
      <Layer>
        {shapes.map((shape) => (
          shape.type === 'rect' ? (
            <Rect
              key={shape.id}
              ref={(node) => { if (node) shapeRefs.current.set(shape.id, node); }}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              rotation={shape.rotation}
              draggable
              onClick={() => setSelectedId(shape.id)}
              onTap={() => setSelectedId(shape.id)}
              onDragEnd={(e) => updateShape(shape.id, { x: e.target.x(), y: e.target.y() })}
              onTransformEnd={() => {
                const node = shapeRefs.current.get(shape.id);
                updateShape(shape.id, {
                  x: node.x(),
                  y: node.y(),
                  width: node.width() * node.scaleX(),
                  height: node.height() * node.scaleY(),
                  rotation: node.rotation(),
                });
                node.scaleX(1);
                node.scaleY(1);
              }}
            />
          ) : (
            <Circle
              key={shape.id}
              ref={(node) => { if (node) shapeRefs.current.set(shape.id, node); }}
              x={shape.x}
              y={shape.y}
              radius={shape.radius}
              fill={shape.fill}
              draggable
              onClick={() => setSelectedId(shape.id)}
              onTap={() => setSelectedId(shape.id)}
              onDragEnd={(e) => updateShape(shape.id, { x: e.target.x(), y: e.target.y() })}
            />
          )
        ))}
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
};
```

---

## Recommendation

### 🏆 Choose **Konva.js + react-konva**

**Justification:**

1. **React 19 Native Integration**: `react-konva@19.x` is purpose-built for React 19. You write canvas graphics with JSX, props, state, and hooks — the same way you write React DOM. Fabric.js requires imperative canvas management with `useRef`/`useEffect`, which breaks React's declarative model and makes state synchronization error-prone.

2. **Mobile Performance**: Konva's multi-layer architecture (separate `<canvas>` elements per layer) is critical for your mobile-first tattoo concierge. The body silhouette background renders once on a static layer, while draggable tattoo shapes redraw on an interactive layer — maintaining 60fps even with many shapes.

3. **Touch & Gestures**: Konva has unified touch/mouse events and documented pinch-to-zoom implementations. Fabric.js lacks built-in pinch-zoom and has less refined mobile event handling.

4. **Bundle Size**: Konva + react-konva is ~40 KB gzipped. Fabric.js is significantly heavier and harder to tree-shake.

5. **Active Maintenance**: Both libraries are maintained, but react-konva has a dedicated maintainer releasing React-specific fixes (e.g., v19.2.1 fixed React 19.2 reconciler issues).

6. **TypeScript Experience**: Konva's event types (`KonvaEventObject<DragEvent>`) and prop types are more complete for React usage. Fabric's TypeScript support is good but requires module augmentation for custom properties.

### ⚠️ When Fabric.js might be better

- If you need **SVG import/export** (e.g., importing tattoo designs as SVG)
- If you need **inline text editing** on the canvas (tattoo text customization)
- If you need **rich image filters** (blur, pixelate, etc.)
- If your team is already deeply familiar with Fabric's imperative API

For the InkedUp.id tattoo placement tool, these Fabric-specific advantages are likely outweighed by Konva's React integration and mobile performance benefits.

---

## Sources

- [react-konva npm](https://www.npmjs.com/package/react-konva) — v19.2.5
- [konva npm](https://www.npmjs.com/package/konva) — v10.3.0
- [react-konva GitHub Releases](https://github.com/konvajs/react-konva/releases) — v19.2.4 changelog
- [konvajs.org — Select and Transform Demo](https://konvajs.org/docs/select_and_transform/Basic_demo.html)
- [konvajs.org — Multi-touch Scale Stage](https://konvajs.org/docs/sandbox/Multi-touch_Scale_Stage.html)
- [konvajs.org — Gestures](https://konvajs.org/docs/sandbox/Gestures.html)
- [konvajs.org — FAQ](https://konvajs.org/docs/faq.html)
- [npmx.dev — fabric v7.2.0](https://npmx.dev/package/fabric/v/7.2.0)
- [pkgpulse.com — Fabric.js vs Konva vs PixiJS 2026](https://www.pkgpulse.com/guides/fabricjs-vs-konva-vs-pixijs-canvas-2d-graphics-2026)
- [velt.dev — Best Canvas Libraries Jan 2026](https://velt.dev/blog/best-canvas-library-web-mobile-apps)
- [Bundlephobia — react-konva](https://bundlephobia.com/package/react-konva) — 126.3 KB minified / 39.7 KB gzipped
- [LogRocket — Canvas Manipulation with React Konva](https://blog.logrocket.com/canvas-manipulation-react-konva/)
