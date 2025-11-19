# Image Optimization Guide for Berry Events

## Current Image Issues

Your application has several large, unoptimized images that are significantly impacting load times:

### Largest Images (Need Immediate Attention)
1. **pensive-housewife-laundry.jpg** - 19MB
2. **waiter-waitress-holding-serving-tray.jpg** - 13MB
3. **delivery-service-personnel.jpg** - 13MB
4. **garden-seasonal-maintenance.jpg** - 6.7MB
5. **mother-daughter-coloring.jpg** - 6.3MB

## Recommended Actions

### 1. Image Compression & Format Conversion

**Tools to Use:**
- **Online**: [Squoosh.app](https://squoosh.app) - Free, easy-to-use
- **Batch Processing**: [ImageOptim](https://imageoptim.com) (Mac) or [FileOptimizer](https://nikkhokkho.sourceforge.io/static.php?page=FileOptimizer) (Windows)
- **CLI**: `cwebp` for WebP conversion, `sharp` for Node.js

**Process:**
```bash
# Convert to WebP (60-80% size reduction)
# Example command if you install cwebp:
cwebp -q 85 input.jpg -o output.webp

# Or use online tool: https://squoosh.app
# Settings: WebP, Quality 85%, Resize to actual display size
```

### 2. Target Sizes Per Image Type

| Image Type | Max Dimensions | Target Size | Format |
|------------|---------------|-------------|---------|
| Hero images | 1920x1080px | <200KB | WebP |
| Service cards | 800x600px | <100KB | WebP |
| Provider photos | 400x400px | <50KB | WebP |
| Icons/logos | 200x200px | <20KB | WebP or SVG |

### 3. Responsive Images Strategy

Use the `<picture>` element with multiple sources:

```jsx
<picture>
  <source 
    srcSet="/images/hero-small.webp 800w, /images/hero-large.webp 1920w"
    type="image/webp" 
  />
  <source 
    srcSet="/images/hero-small.jpg 800w, /images/hero-large.jpg 1920w"
    type="image/jpeg" 
  />
  <img 
    src="/images/hero-large.jpg" 
    alt="Hero image"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### 4. Lazy Loading

Already implemented in `OptimizedImage` component, but ensure all images use it:

```jsx
<img 
  src={imagePath} 
  alt="Description"
  loading="lazy"  // Native lazy loading
  decoding="async"  // Async decode to prevent blocking
/>
```

### 5. Priority Loading for Critical Images

For above-the-fold images (logo, hero):

```jsx
<img 
  src={logoPath} 
  alt="Logo"
  loading="eager"  // Load immediately
  fetchpriority="high"  // High priority
/>
```

## Implementation Checklist

- [ ] **Compress all images >1MB** to target sizes using Squoosh or ImageOptim
- [ ] **Convert JPEGs to WebP** format (keep JPG as fallback)
- [ ] **Resize hero images** to 1920px width max
- [ ] **Resize service cards** to 800px width max
- [ ] **Add `loading="lazy"`** to all below-the-fold images
- [ ] **Use `fetchpriority="high"`** for logo and hero images
- [ ] **Create responsive versions** (small, medium, large) for hero and main images
- [ ] **Remove unused image variants** (you have 4 homepage-hero versions)

## Expected Results After Optimization

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total image size | ~50MB | ~5MB | 90% reduction |
| Hero image load | 3-5s | <500ms | 85% faster |
| Largest Contentful Paint (LCP) | 4-6s | <1.5s | 75% improvement |
| Total page load | 6-8s | <2s | 70% improvement |

## Tools & Resources

1. **Squoosh** (https://squoosh.app) - Best for manual compression
2. **TinyPNG** (https://tinypng.com) - Batch compression, free tier
3. **ImageOptim** - Mac app for batch optimization
4. **Sharp** - Node.js library for automated optimization

## Automated Build-Time Optimization (Optional)

If you want to automate this in the future, you could add a build step:

```json
// package.json
{
  "scripts": {
    "optimize-images": "sharp-cli --input attached_assets --output attached_assets/optimized --format webp --quality 85"
  }
}
```

---

**Note**: These optimizations must be done outside the Replit environment using image editing tools, then re-upload the optimized images to replace the originals.
