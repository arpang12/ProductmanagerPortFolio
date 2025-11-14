# Data Persistence & Frontend Display Checklist

## Quick Test Command
```bash
node scripts/test-all-sections.js
```

## Manual Testing Checklist

### ✅ 1. Carousel Images
**Admin Panel:**
- [ ] Go to Admin → Carousel Management
- [ ] Upload a new image
- [ ] Add title and description
- [ ] Click "Save"
- [ ] Refresh page - image should still be there

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "Magical Journeys" section
- [ ] Verify carousel displays your images
- [ ] Verify images auto-rotate
- [ ] Verify title and description show

**Database Check:**
```sql
SELECT * FROM carousel_slides WHERE is_active = true;
```

---

### ✅ 2. My Story Section
**Admin Panel:**
- [ ] Go to Admin → My Story Management
- [ ] Edit title and subtitle
- [ ] Edit paragraphs
- [ ] Upload profile image
- [ ] Click "Save Changes"
- [ ] Refresh page - changes should persist

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "My Story" section
- [ ] Verify title matches what you entered
- [ ] Verify all paragraphs display
- [ ] Verify profile image shows

**Database Check:**
```sql
SELECT * FROM story_sections;
SELECT * FROM story_paragraphs;
```

---

### ✅ 3. Magic Toolbox
**Admin Panel:**
- [ ] Go to Admin → Magic Toolbox Management
- [ ] Click "📦 Load Presets" to add sample data
- [ ] OR manually add a category
- [ ] Add skills with different proficiency levels
- [ ] Add tools
- [ ] Upload custom icons (optional)
- [ ] Click "Save Changes"
- [ ] Refresh page - all data should persist

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "Magic Toolbox" section
- [ ] Verify categories display with correct icons
- [ ] Verify skills show with colored progress bars
- [ ] Verify progress bar colors match category colors
- [ ] Verify progress bar widths match skill levels
- [ ] Verify tools display at bottom
- [ ] Verify custom uploaded images show (if uploaded)

**Database Check:**
```sql
SELECT * FROM skill_categories;
SELECT * FROM skills;
SELECT * FROM tools;
```

**Visual Check:**
- Progress bars should be COLORED (not gray)
- Each category should have its own color
- Progress bars should fill to the correct percentage

---

### ✅ 4. Journey Timeline
**Admin Panel:**
- [ ] Go to Admin → Journey Management
- [ ] Edit title and subtitle
- [ ] Add/edit milestones
- [ ] Mark one as "Current Position"
- [ ] Click "Save Changes"
- [ ] Refresh page - changes should persist

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "My Journey" section
- [ ] Verify timeline displays vertically
- [ ] Verify current position has trophy icon (🏆)
- [ ] Verify past positions have pin icon (📍)
- [ ] Verify all details show correctly

**Database Check:**
```sql
SELECT * FROM journey_timelines;
SELECT * FROM journey_milestones;
```

---

### ✅ 5. Contact Section
**Admin Panel:**
- [ ] Go to Admin → Contact Management
- [ ] Edit title, subtitle, description
- [ ] Edit email and location
- [ ] Add social links
- [ ] Upload resume file
- [ ] Click "Save Changes"
- [ ] Refresh page - changes should persist

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "Contact" section
- [ ] Verify contact card displays
- [ ] Verify email and location show
- [ ] Verify social links are clickable
- [ ] Verify resume download button works

**Database Check:**
```sql
SELECT * FROM contact_sections;
SELECT * FROM social_links;
```

---

### ✅ 6. CV Section
**Admin Panel:**
- [ ] Go to Admin → CV Management
- [ ] Edit title, subtitle, description
- [ ] Add CV versions (Indian, Europass, Global)
- [ ] Upload CV files OR add Google Drive links
- [ ] Mark versions as active/inactive
- [ ] Click "Save Changes"
- [ ] Refresh page - changes should persist

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "CV" section
- [ ] Verify only active CV versions display
- [ ] Verify download buttons work
- [ ] Verify Google Drive links open correctly

**Database Check:**
```sql
SELECT * FROM cv_sections;
SELECT * FROM cv_versions;
```

---

### ✅ 7. Case Studies / Projects
**Admin Panel:**
- [ ] Go to Admin → Case Studies
- [ ] Create a new case study
- [ ] Add content to sections
- [ ] Publish the case study
- [ ] Click "Save"

**Homepage:**
- [ ] Go to homepage
- [ ] Scroll to "Magical Projects" section
- [ ] Verify published case studies show as project cards
- [ ] Click a project card
- [ ] Verify case study page loads

**Database Check:**
```sql
SELECT * FROM case_studies WHERE status = 'published';
```

---

### ✅ 8. AI Settings
**Admin Panel:**
- [ ] Go to Admin → AI Settings
- [ ] Enter Gemini API key
- [ ] Select a model
- [ ] Click "Save Configuration"
- [ ] Refresh page - settings should persist

**Database Check:**
```sql
SELECT * FROM ai_configurations;
```

---

## Common Issues & Solutions

### Issue: Data saves but doesn't show on homepage

**Possible Causes:**
1. **Not logged in** - You must be logged in for data to save
2. **Development mode** - Check if `isDevelopmentMode` is true in api.ts
3. **Cache issue** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Database not updated** - Run migrations

**Solutions:**
```bash
# Check if logged in
node scripts/verify-profile-setup.js

# Run migrations
npm run db:push

# Test data
node scripts/test-all-sections.js

# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Issue: Progress bars are gray (not colored)

**Cause:** Dynamic Tailwind classes don't work

**Solution:** Already fixed! Using inline styles now.

**Verify:**
- Open browser DevTools (F12)
- Inspect a progress bar
- Should see `style="background-color: #3B82F6; width: 70%"`

### Issue: Custom images not showing

**Possible Causes:**
1. Image too large (>5MB)
2. Invalid image format
3. Browser blocking base64 images

**Solutions:**
- Use images under 5MB
- Use JPEG, PNG, GIF, WebP, or SVG
- Check browser console for errors

### Issue: "User profile not found"

**Solution:**
```bash
node scripts/verify-profile-setup.js
```

---

## Database Migration Checklist

### Required Migrations:
- [ ] `001_initial_schema.sql` - Base tables
- [ ] `002_rls_policies.sql` - Security policies
- [ ] `003_add_icon_url_to_toolbox.sql` - Custom icon support

### Apply Migrations:
```bash
npm run db:push
```

### Verify Migrations:
```sql
-- Check if icon_url columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'skill_categories' 
  AND column_name = 'icon_url';

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tools' 
  AND column_name = 'icon_url';
```

---

## API Implementation Status

| Section | GET | UPDATE | CREATE | Status |
|---------|-----|--------|--------|--------|
| Carousel | ✅ | ✅ | ✅ | Complete |
| My Story | ✅ | ✅ | ✅ | Complete |
| Magic Toolbox | ✅ | ✅ | N/A | Complete |
| Journey | ✅ | ✅ | ✅ | Complete |
| Contact | ✅ | ✅ | ✅ | Complete |
| CV Section | ✅ | ✅ | ✅ | Complete |
| Case Studies | ✅ | ✅ | ✅ | Complete |
| AI Settings | ✅ | ✅ | N/A | Complete |

---

## Frontend Display Status

| Section | Fetches Data | Displays Data | Handles Empty | Status |
|---------|--------------|---------------|---------------|--------|
| Carousel | ✅ | ✅ | ✅ | Complete |
| My Story | ✅ | ✅ | ✅ | Complete |
| Magic Toolbox | ✅ | ✅ | ✅ | Complete |
| Journey | ✅ | ✅ | ✅ | Complete |
| Contact | ✅ | ✅ | ✅ | Complete |
| CV Section | ✅ | ✅ | ✅ | Complete |
| Projects | ✅ | ✅ | ✅ | Complete |

---

## Performance Checklist

- [ ] All API calls use Promise.all() for parallel fetching
- [ ] Images are optimized (resized to appropriate dimensions)
- [ ] Loading states show while fetching data
- [ ] Error states handle failures gracefully
- [ ] No unnecessary re-renders

---

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Users can only access their own org's data
- [ ] API keys are encrypted in database
- [ ] File uploads are validated
- [ ] SQL injection prevented (using parameterized queries)

---

## Browser Console Checks

Open DevTools (F12) and check for:

### Should NOT see:
- ❌ Red errors
- ❌ "Failed to fetch"
- ❌ "Unauthorized"
- ❌ "Column does not exist"

### Should see:
- ✅ "Magic Toolbox data: {categories: [...], tools: [...]}"
- ✅ "Story data: {title: '...', paragraphs: [...]}"
- ✅ Network requests returning 200 OK

---

## Final Verification

Run all tests:
```bash
# Test all sections
node scripts/test-all-sections.js

# Test Magic Toolbox specifically
node scripts/test-magic-toolbox.js

# Verify profile
node scripts/verify-profile-setup.js
```

Visit homepage:
```
http://localhost:3000
```

Check each section:
1. Scroll through entire page
2. Verify all sections display
3. Verify colors are correct
4. Verify images load
5. Verify links work
6. Verify animations work

---

## Success Criteria

✅ All sections save to database
✅ All sections persist after page reload
✅ All sections display on homepage
✅ Progress bars show colors
✅ Custom images display
✅ No console errors
✅ Smooth user experience
✅ Data updates in real-time

---

## Support

If all tests pass but issues persist:
1. Clear browser cache completely
2. Try incognito/private browsing mode
3. Check Supabase dashboard for data
4. Verify RLS policies allow access
5. Check network tab for failed requests
