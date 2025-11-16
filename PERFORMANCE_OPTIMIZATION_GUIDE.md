# 🚀 Performance Optimization Guide

## 🎯 Issue: Slow Loading on Case Study Page

The case study page shows "Loading YouTube video player..." and other embeds take time to load.

## 🔍 Root Causes

### 1. External Embed Loading
- **YouTube embeds** - Load external iframe from youtube.com
- **Figma embeds** - Load external iframe from figma.com  
- **Miro embeds** - Load external iframe from miro.com
- Each embed makes external network requests
- Embeds load their own JavaScript and assets

### 2. Multiple Embeds on One Page
If a case study has Video + Figma + Miro, that's **3 external iframes** loading simultaneously.

### 3. No Loading Optimization
- All embeds try to load at once
- No lazy loading
- No loading placeholders
- No error handling for failed loads

## ✅ Optimizations Already Applied

### 1. Lightweight List Query
**Before:**
```typescript
// Fetched ALL sections with ALL nested data
case_study_sections!inner (
  *,
  section_assets (*,assets (*)),
  embed_widgets (*)
)
```

**After:**
```typescript
// Only fetch essential fields
case_study_sections!inner (
  section_id,
  section_type,
  enabled,
  content
)
```

**Impact:** Faster loading of case study list in admin panel

### 2. Optimized Projects Query
`getProjects()` only fetches:
- Hero section content
- Published case studies only
- No unnecessary nested data

**Impact:** Fast loading of project cards on homepage

## 🚀 Additional Optimizations Needed

### 1. Lazy Loading for Embeds
Load embeds only when they come into viewport:

```typescript
// Use Intersection Observer
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    { threshold: 0.1 }
  );
  
  if (ref.current) {
    observer.observe(ref.current);
  }
  
  return () => observer.disconnect();
}, []);

// Only render iframe when visible
{isVisible && <iframe src={embedUrl} />}
```

### 2. Loading Placeholders
Show skeleton loaders while embeds load:

```typescript
<div className="aspect-w-16 aspect-h-9 bg-gray-200 animate-pulse">
  {isLoaded ? (
    <iframe src={embedUrl} onLoad={() => setIsLoaded(true)} />
  ) : (
    <div className="flex items-center justify-center">
      <Spinner />
      <span>Loading {embedType}...</span>
    </div>
  )}
</div>
```

### 3. Error Handling
Handle failed embed loads gracefully:

```typescript
<iframe 
  src={embedUrl}
  onError={() => setHasError(true)}
/>

{hasError && (
  <div className="bg-red-50 p-4 rounded">
    <p>Failed to load {embedType}</p>
    <a href={originalUrl} target="_blank">
      Open in new tab →
    </a>
  </div>
)}
```

### 4. Thumbnail Preview for Videos
Instead of loading full YouTube player immediately, show thumbnail:

```typescript
// Extract video ID
const videoId = extractYouTubeId(url);

// Show thumbnail first
<img 
  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
  onClick={() => setShowPlayer(true)}
/>

// Load player on click
{showPlayer && <iframe src={embedUrl} />}
```

### 5. Progressive Loading
Load sections in order of importance:

```typescript
// Load immediately
1. Hero
2. Overview
3. Problem

// Load after 500ms
4. Process
5. Showcase

// Load when scrolled into view
6. Gallery
7. Video
8. Figma
9. Miro
10. Document
11. Links
12. Reflection
```

## 📊 Performance Metrics

### Current Performance:
- **Homepage (Projects):** ✅ Fast (optimized query)
- **Admin List:** ✅ Fast (optimized query)
- **Case Study Page:** ⚠️ Slow (multiple embeds)

### Target Performance:
- **Initial Load:** < 1 second
- **Embeds Load:** Progressive (as user scrolls)
- **Perceived Performance:** Instant (with placeholders)

## 🎯 Quick Wins

### 1. Add Loading States
Show "Loading..." text while embeds load:
```typescript
{sections.video.enabled && sections.video.url && (
  <div>
    <h2>Demo Video</h2>
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <span>Loading YouTube video player...</span>
      </div>
      <iframe src={embedUrl} />
    </div>
  </div>
)}
```

### 2. Use `loading="lazy"` Attribute
```typescript
<iframe 
  src={embedUrl}
  loading="lazy"  // ← Browser-native lazy loading
  allowFullScreen
/>
```

### 3. Reduce Embed Size
Smaller embeds load faster:
```typescript
// Instead of full-width
<iframe style="width: 100%; height: 600px" />

// Use responsive but smaller
<iframe style="width: 100%; height: 400px" />
```

## 🔍 Debugging Slow Loads

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload case study page
4. Look for:
   - Slow requests (red/orange bars)
   - Failed requests (red text)
   - Large file sizes

### Check Console:
Look for:
- `🔍 getCaseStudyById called`
- `✅ Case study fetched`
- Any error messages

### Check Performance Tab:
1. Open DevTools → Performance
2. Click Record
3. Load case study page
4. Stop recording
5. Look for:
   - Long tasks (yellow blocks)
   - Network requests (blue blocks)
   - Rendering time

## 💡 Why Embeds Are Slow

### YouTube Embed:
- Loads YouTube player JavaScript (~500KB)
- Loads video metadata
- Loads thumbnail
- Initializes player controls
- **Total:** 1-3 seconds

### Figma Embed:
- Loads Figma embed viewer
- Loads design file data
- Renders design preview
- **Total:** 2-5 seconds

### Miro Embed:
- Loads Miro board viewer
- Loads board data
- Renders board content
- **Total:** 2-5 seconds

**If all 3 load at once:** 5-10 seconds total!

## ✅ Recommended Solution

### Implement Lazy Loading:

1. **Install intersection-observer polyfill** (if needed)
2. **Create LazyEmbed component:**

```typescript
const LazyEmbed = ({ src, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref} className="aspect-w-16 aspect-h-9">
      {!isVisible ? (
        <div className="bg-gray-100 flex items-center justify-center">
          <span>Scroll to load {type}...</span>
        </div>
      ) : !isLoaded ? (
        <div className="bg-gray-100 flex items-center justify-center">
          <Spinner />
          <span>Loading {type}...</span>
        </div>
      ) : null}
      
      {isVisible && (
        <iframe 
          src={src}
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? 'opacity-100' : 'opacity-0'}
        />
      )}
    </div>
  );
};
```

3. **Use in CaseStudyPage:**

```typescript
{sections.video.enabled && sections.video.url && (
  <LazyEmbed src={videoEmbedUrl} type="YouTube Video" />
)}

{sections.figma.enabled && sections.figma.url && (
  <LazyEmbed src={figmaEmbedUrl} type="Figma Prototype" />
)}

{sections.miro.enabled && sections.miro.url && (
  <LazyEmbed src={miroEmbedUrl} type="Miro Board" />
)}
```

## 🎉 Expected Results

### Before:
- Page loads
- All embeds try to load at once
- User sees "Loading..." for 5-10 seconds
- Page feels slow

### After:
- Page loads instantly
- Hero/Overview show immediately
- Embeds load as user scrolls
- User sees content right away
- Page feels fast

## 📝 Summary

**The slow loading is normal for external embeds!** YouTube, Figma, and Miro all take time to load their players.

**Solutions:**
1. ✅ Optimized database queries (done)
2. 🔄 Add lazy loading for embeds (recommended)
3. 🔄 Add loading placeholders (recommended)
4. 🔄 Add error handling (recommended)

**Quick fix:** The embeds will load, just give them time. The "Loading YouTube video player..." message is normal and expected.

**Best fix:** Implement lazy loading so embeds only load when user scrolls to them.
