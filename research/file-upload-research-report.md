# File Upload Architecture & Mobile UX Research Report
## InkedUp.id Tattoo Quotation Tool
**Research Date:** 2026-07-11 | **Project:** InkedUp Bali Mobile Tattoo Concierge

---

## Executive Summary

The current InkedUp booking flow stores `reference_images` as a JSON string array but has no actual upload mechanism — the UI tells customers to "Share reference images on WhatsApp." This research covers the complete architecture needed to implement secure, mobile-first image uploads for inspiration photos, body area photos, existing tattoos, and sketches.

**Top-Line Recommendation:** Use **Cloudinary** for image storage/processing with **react-dropzone** (already in your `package.json`) for the frontend. Cloudinary eliminates the need for server-side image processing (Sharp), handles WebP conversion, thumbnails, and resizing automatically, and offers a generous free tier (25GB storage, 25GB bandwidth/month). For the current Vercel+Render split deployment, direct-to-Cloudinary signed uploads bypass server bottlenecks entirely.

---

## 1. File Upload Architecture

### 1.1 Direct Upload vs Server-Side Upload

| Approach | How It Works | Pros | Cons | Best For |
|----------|-------------|------|------|----------|
| **Direct-to-Cloud (Signed Uploads)** | Backend generates a signed token/URL; client uploads directly to S3/Cloudinary/Supabase | Server never touches the file; scales infinitely; no Render bandwidth charges | Slightly more complex initial setup | **Production apps, mobile-first, your use case** |
| **Server-Side Proxy Upload** | Client → Express → Multer → disk/memory → Cloud storage | Full control over validation; can process before storing | Server becomes bottleneck; file size limited by memory; Vercel functions have payload limits (4.5MB) | Small apps, internal tools, when you need server-side scanning |
| **Server Local Storage Only** | Client → Express → disk (like your current `/uploads`) | Simplest | Files lost on redeploy; no CDN; disk fills up; doesn't work on serverless | **Not recommended for production** |

### 1.2 Presigned URL Pattern (Recommended)

The presigned URL pattern is the industry standard for secure direct uploads:

```
1. Client: "I want to upload a file"
2. Server: Generates signed URL/token (valid for ~15 min)
3. Client: POSTs file directly to Cloudinary/S3 (bypassing your server)
4. Cloud Storage: Returns file URL
5. Client: Sends URL to your API to store in database
```

**Why this matters for InkedUp:**
- Your frontend is on **Vercel** (serverless, 4.5MB function payload limit)
- Your backend runs on **Render** (traditional server, but bandwidth costs add up)
- Tattoo reference images from phones are often 3-8MB each
- Customers may upload **multiple images per quote**

With presigned uploads, a 5MB image goes directly from the customer's phone to Cloudinary — your Render server and Vercel functions never see the bytes.

### 1.3 For Your SQLite/Express + Neon Postgres Backend

Your stack is migrating from SQLite to Neon Postgres. Here's the recommended flow:

```
┌─────────────┐     signed upload params      ┌──────────────┐
│   React     │ ─────────────────────────────→│   Express    │
│  (Vercel)   │                               │  (Render)    │
└─────────────┘                               └──────────────┘
       │                                              │
       │  2. Upload image directly                    │  3. Store image URL
       │     to Cloudinary with signature             │     in Neon Postgres
       │                                              │
       ↓                                              ↓
┌─────────────┐                               ┌──────────────┐
│  Cloudinary │                               │  Neon DB     │
│  (CDN +     │                               │  (bookings   │
│   storage)  │                               │   table)     │
└─────────────┘                               └──────────────┘
```

### 1.4 Render Persistent Disk Considerations

> **Critical:** Render's default filesystem is **ephemeral** — files are lost on every deploy and restart.

Options for Render:

1. **Render Disk** ($0.25/GB/month): Add a persistent disk to your service. BUT: disks are tied to a single service instance, don't scale horizontally, and aren't backup-friendly.
2. **Cloud Storage** (Recommended): Store files on Cloudinary/S3/Supabase. Your Render server only stores URLs in the database. This is the only viable approach for a customer-facing production app.

**Verdict:** Do NOT rely on Render's local disk for customer uploads. Use Cloudinary (or Supabase Storage if you're already using Supabase auth).

---

## 2. Image Processing

### 2.1 Should Images Be Resized/Compressed?

**Yes — absolutely.** Raw phone camera images are typically:
- 3024×4032 pixels (12MP)
- 3-8MB JPEG files
- Way larger than needed for web display

For a tattoo quotation tool, you need:
| Variant | Dimensions | Purpose |
|---------|-----------|---------|
| Thumbnail | 150×150px | Admin list view, quick preview |
| Medium | 800×800px | Booking detail view |
| Full | 1600×1600px | Artist review, zooming |

### 2.2 Node.js Image Processing Libraries

| Library | Speed | Features | Install Size | Best For |
|---------|-------|----------|-------------|----------|
| **Sharp** | Fastest (libvips) | Resize, compress, WebP/AVIF, blur, composite | ~17MB | Server-side batch processing |
| **Jimp** | Slow (pure JS) | Basic resize, crop, filter | Small | When you can't install native deps |
| **ImageMagick** | Medium | Everything (Swiss Army knife) | Huge | Complex transformations |
| **Cloudinary** | N/A (managed) | All of the above + more | N/A | **When you don't want to own image processing** |

**Sharp Example** (if you choose server-side processing):
```bash
npm install sharp
```

```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<{
  original: string;
  thumbnail: string;
  medium: string;
}> {
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  // Save original (compressed)
  await sharp(buffer)
    .jpeg({ quality: 85, progressive: true })
    .toFile(`./uploads/${baseName}.jpg`);
  
  // Generate thumbnail
  await sharp(buffer)
    .resize(150, 150, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toFile(`./uploads/${baseName}-thumb.jpg`);
  
  // Generate medium
  await sharp(buffer)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(`./uploads/${baseName}-medium.jpg`);
    
  return {
    original: `/uploads/${baseName}.jpg`,
    thumbnail: `/uploads/${baseName}-thumb.jpg`,
    medium: `/uploads/${baseName}-medium.jpg`,
  };
}
```

### 2.3 Thumbnail Generation Approach

**Option A: Server-side with Sharp** — Generate thumbnails on upload. Pro: Full control. Con: CPU load on your Render server, extra code to maintain.

**Option B: Cloudinary on-the-fly** — Store one high-res image, request transformed versions via URL:
```
Original:  https://res.cloudinary.com/inkedup/image/upload/v123/quote_abc.jpg
Thumbnail: https://res.cloudinary.com/inkedup/image/upload/w_150,h_150,c_fill,q_70/v123/quote_abc.jpg
Medium:    https://res.cloudinary.com/inkedup/image/upload/w_800,q_80/v123/quote_abc.jpg
WebP:      https://res.cloudinary.com/inkedup/image/upload/w_800,q_80,f_webp/v123/quote_abc.jpg
```

**Recommendation:** Option B (Cloudinary). Zero server CPU, automatic format optimization, and you can change transformation parameters anytime without re-processing.

### 2.4 WebP Conversion

WebP images are typically 25-35% smaller than JPEG at equivalent quality.

| Approach | Implementation |
|----------|---------------|
| Sharp server-side | `.webp({ quality: 80 })` |
| Cloudinary | Add `f_webp` to URL, or set automatic format (`f_auto`) |
| Client-side | Use `<picture>` element with WebP fallback |

Cloudinary's `f_auto` automatically serves WebP to browsers that support it, JPEG to others:
```
https://res.cloudinary.com/inkedup/image/upload/f_auto,q_auto/w_800/quote_abc.jpg
```

---

## 3. Mobile File Upload UX

### 3.1 React Component Libraries Comparison

| Library | Bundle Size | Drag-Drop | Camera | Multi-Select | Progress | Already Installed? |
|---------|-------------|-----------|--------|--------------|----------|-------------------|
| **react-dropzone** | ~8KB gzipped | Yes | Partial (via input) | Yes | Manual | **YES** |
| **react-uploady** | ~25KB | Yes | Partial | Yes | Yes | No |
| **Uppy** | ~70KB+ | Yes | Yes | Yes | Yes | No |
| **FilePond** | ~40KB | Yes | Partial | Yes | Yes | No |
| **Native input + custom** | 0KB | No | Yes | Yes | No | N/A |

**Recommendation for InkedUp:** Stick with **react-dropzone** (already in your `package.json`) and add custom progress UI. You don't need the complexity of Uppy for a booking form upload.

### 3.2 Camera Access for Direct Photo Capture

The HTML `capture` attribute on file inputs is the key:

```tsx
// Opens camera directly on mobile (no file picker)
<input type="file" accept="image/*" capture="environment" />

// "user" = front camera, "environment" = rear camera
// Shows picker with Camera as an option (recommended for tattoo app)
<input type="file" accept="image/*" multiple />
```

**For your tattoo use case:**
- **Inspiration images**: File picker (customer likely browsing gallery)
- **Body area photos**: `capture="environment"` to jump straight to camera
- **Existing tattoo photos**: File picker
- **Sketches**: File picker

**react-dropzone implementation with capture:**
```tsx
import { useDropzone } from 'react-dropzone';

function ImageUploader({ onUpload, captureMode = false }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      // Upload logic here
    },
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input 
        {...getInputProps()} 
        capture={captureMode ? "environment" : undefined}
      />
      {isDragActive ? (
        <p>Drop the images here...</p>
      ) : (
        <p>Drag & drop images, or tap to {captureMode ? 'take a photo' : 'select files'}</p>
      )}
    </div>
  );
}
```

### 3.3 Multiple File Selection on Mobile

- **iOS Safari**: Supports `multiple` attribute since iOS 15+. Shows photo picker with multi-select.
- **Android Chrome**: Full support. Shows "Select multiple" option in the picker.
- **Limitation**: When using `capture="camera"`, `multiple` is ignored — only one photo at a time.

**UX Pattern for multiple images:**
1. Show a grid of already-selected images with remove buttons
2. Allow adding more via a "+ Add More Photos" button
3. Each image gets its own upload progress

### 3.4 Progress Indicators

Since react-dropzone doesn't include progress, implement with `XMLHttpRequest`:

```tsx
import { useCallback, useState } from 'react';

function useImageUpload() {
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const uploadFile = useCallback(async (file: File, signature: string) => {
    const id = Math.random().toString(36).slice(2);
    
    setUploads(prev => [...prev, { id, file, progress: 0, status: 'uploading' }]);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploads(prev => prev.map(u => 
          u.id === id ? { ...u, progress } : u
        ));
      }
    };

    return new Promise<string>((resolve, reject) => {
      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        setUploads(prev => prev.map(u => 
          u.id === id ? { ...u, status: 'done', url: response.secure_url } : u
        ));
        resolve(response.secure_url);
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/YOUR_CLOUD/upload`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tattoo_quotes');
      formData.append('api_key', 'YOUR_KEY');
      formData.append('timestamp', signature);
      xhr.send(formData);
    });
  }, []);

  return { uploads, uploadFile };
}
```

### 3.5 Image Preview Before Submission

Use `URL.createObjectURL()` for instant client-side previews:

```tsx
function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative">
      <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded" />
      <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5">
        ×
      </button>
    </div>
  );
}
```

> **CSP Note:** If you have a strict Content Security Policy, `blob:` URLs for previews require `img-src 'self' blob:` directive.

---

## 4. Security

### 4.1 File Type Validation (WHITELIST — Never Blacklist)

**Your current setup** has no file type validation. Implement BOTH client-side (UX) and server-side (security) checks.

**Recommended whitelist for tattoo images:**
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/heic',     // iPhone photos
  'image/heif',
] as const;

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'] as const;

// Server-side multer fileFilter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  
  // Accept only if BOTH extension AND mimetype match
  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`));
  }
};
```

> **Why whitelist?** Blacklists (e.g., "reject .exe files") are trivially bypassed by using unknown extensions, double extensions, or MIME type spoofing.

### 4.2 File Size Limits

| Limit | Rationale |
|-------|-----------|
| **Per file: 10MB** | Phone camera JPEGs are 3-8MB; gives headroom for HEIC |
| **Per upload: 50MB** | Max ~5 images at once |
| **Per booking: 20 images** | Prevents abuse; enough for comprehensive quote |

```typescript
// Multer config
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,    // 10MB per file
    files: 5,                       // max 5 files per request
  },
  fileFilter,
});

// Cloudinary upload preset config
// Set "Max file size" to 10MB in Cloudinary dashboard
```

### 4.3 Malware Scanning Considerations

For a tattoo quotation tool with image-only uploads, the risk profile is relatively low (images are not executable). However, **image files can contain exploits** (e.g., polyglot files that are valid images AND PHP scripts).

**Defense layers:**
1. **File type whitelist** (above) — blocks 99% of attacks
2. **Re-process images with Sharp/Cloudinary** — stripping EXIF, re-encoding JPEG destroys embedded payloads
3. **Rate limiting** — prevents upload spam
4. **ClamAV** (optional, for paranoid setups) — requires server installation

**For InkedUp:** Given budget and use case, layers 1+2+3 are sufficient. ClamAV is overkill unless you're handling high-value targets.

### 4.4 Access Control

**Current state:** Your `/uploads` route uses `express.static` with NO authentication:
```typescript
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
```

**This is a security vulnerability** — anyone can browse all uploaded images by guessing URLs.

**Recommended approach with Cloudinary:**
- Use **Cloudinary's authenticated URLs** or **signed URLs** with expiry
- Store images in a non-public Cloudinary folder (e.g., `tattoo_quotes/private/`)
- Admin dashboard fetches images via your backend, which verifies JWT role

```typescript
// Admin-only image endpoint
router.get('/bookings/:id/images', authMiddleware, requireRole('admin'), async (req, res) => {
  const booking = await getBooking(req.params.id);
  // Return the image URLs from the booking record
  // These URLs can be time-limited signed URLs from Cloudinary
  res.json(booking.reference_images);
});
```

### 4.5 Content Security Policy

If you add a CSP (recommended), you'll need these directives for file uploads:

```
Content-Security-Policy: 
  default-src 'self';
  img-src 'self' https://res.cloudinary.com blob: data:;
  connect-src 'self' https://api.cloudinary.com;
  media-src 'self' https://res.cloudinary.com;
```

- `blob:` — Required for client-side image previews (URL.createObjectURL)
- `data:` — Required for base64-encoded inline previews
- `https://res.cloudinary.com` — Your image CDN domain

---

## 5. Specific Library Recommendations

### 5.1 Cloudinary vs AWS S3 vs Supabase Storage

| Feature | Cloudinary | AWS S3 | Supabase Storage |
|---------|-----------|--------|-----------------|
| **Free tier** | 25GB storage, 25GB bandwidth | 5GB storage, limited egress | 1GB storage |
| **Image processing** | Built-in (URL-based) | Need Lambda + Sharp | Basic transforms |
| **WebP/AVIF** | Automatic (`f_auto`) | Manual | Limited |
| **Signed uploads** | Easy | Complex IAM setup | Easy |
| **Thumbnail generation** | URL-based | Pre-generate or on-the-fly | Manual |
| **CDN** | Global | CloudFront extra cost | Via Supabase CDN |
| **Setup complexity** | Low | High | Low |
| **Cost at scale** | $$$ | $ | $$ |

**For InkedUp:** **Cloudinary wins** because:
1. You need image processing (thumbnails, WebP, resizing) — it's free with Cloudinary
2. Zero backend image processing code to maintain
3. Generous free tier covers a tattoo business's volume
4. Signed upload setup is 5 lines of code vs S3's IAM maze

### 5.2 Cloudinary Signed Upload Implementation

**Backend (Express) — Generate signature:**
```typescript
// server/src/routes/upload.ts
import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Endpoint to get signed upload params
router.post('/signature', async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'tattoo_quotes';
  
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  
  res.json({
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder,
  });
});

export default router;
```

**Frontend (React) — Upload with progress:**
```typescript
// Client-side upload hook
async function uploadToCloudinary(
  file: File, 
  signatureData: { timestamp: number; signature: string; api_key: string; folder: string }
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.api_key);
  formData.append('timestamp', String(signatureData.timestamp));
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.secure_url; // Store this in your database
}
```

### 5.3 Database Schema Update

Your `bookings` table already has `reference_images TEXT NOT NULL DEFAULT '[]'`. Update it to store Cloudinary URLs:

```sql
-- Already exists in your schema:
-- reference_images TEXT NOT NULL DEFAULT '[]'

-- Example stored value after upload:
-- [
--   "https://res.cloudinary.com/inkedup/image/upload/v123/tattoo_quotes/abc123.jpg",
--   "https://res.cloudinary.com/inkedup/image/upload/v123/tattoo_quotes/def456.jpg"
-- ]
```

No schema change needed — just start populating the array with Cloudinary URLs instead of local paths.

### 5.4 Complete Upload Handler Code

```typescript
// server/src/routes/upload.ts — Complete implementation
import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import rateLimit from 'express-rate-limit';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 upload requests per IP
  message: { error: 'Too many uploads. Please try again later.' },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate signed upload parameters
router.post('/signature', uploadLimiter, async (req, res, next) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'tattoo_quotes';
    
    const signature = cloudinary.utils.api_sign_request(
      { 
        timestamp, 
        folder,
        // Optional: restrict transformations
        // allowed_formats: 'jpg,png,webp',
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    
    res.json({
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
```

---

## Implementation Roadmap

### Phase 1: Cloudinary Setup (1-2 hours)
1. Sign up for Cloudinary free tier
2. Create an unsigned upload preset (for dev) or implement signed uploads (for prod)
3. Add environment variables to Render + Vercel

### Phase 2: Backend API (2-3 hours)
1. Create `/api/upload/signature` endpoint
2. Add rate limiting
3. Update booking creation to accept `reference_images` array

### Phase 3: Frontend Upload Component (4-6 hours)
1. Build `ImageUploader` component with react-dropzone
2. Add client-side image compression (`browser-image-compression` or `compressorjs`)
3. Implement upload progress indicators
4. Add image preview grid with remove functionality
5. Integrate into Booking step 2 (replacing the WhatsApp placeholder)

### Phase 4: Admin View (2-3 hours)
1. Update `AdminBookings` to display image thumbnails
2. Add lightbox/gallery view for full-size images
3. Ensure admin-only access to images

### Phase 5: Security Hardening (1-2 hours)
1. Remove/secure the `/uploads` static route
2. Add CSP headers
3. Implement per-booking image limits
4. Add file size validation on both client and server

---

## References

- [Cloudinary Signed Uploads Guide](https://levelup.gitconnected.com/signed-uploads-the-cloudinary-equivalent-of-s3-presigned-urls-conceptually-5a6f102447ff)
- [Sharp npm Package](https://www.npmjs.com/package/sharp)
- [React Dropzone Documentation](https://react-dropzone.js.org/)
- [Best React File Upload Libraries 2026](https://www.simplefileupload.com/blog/best-react-file-upload)
- [Secure Image Upload API with Node.js, Express, and Multer](https://transloadit.com/devtips/secure-image-upload-api-with-node-js-express-and-multer/)
- [Render Ephemeral Filesystem Warning](https://forum.djangoproject.com/t/django-not-serving-media-files-when-hosted-on-render/26450/2)
- [HTML Capture Attribute for Camera Access](https://austingil.com/html-capture-attribute/)
