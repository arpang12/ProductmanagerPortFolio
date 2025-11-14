# ✅ Hero Image Upload - Now Visible!

## 🔧 What Was Fixed

The Hero Image upload field wasn't showing because the default hero section didn't include the `imageUrl` field.

### Fix Applied
**File:** `services/api.ts`
**Function:** `getDefaultSectionContent()`

**Before:**
```typescript
hero: {
  headline: 'New Case Study',
  subheading: 'An amazing new project',
  text: 'This is the introduction to the project.'
  // ❌ Missing imageUrl field
}
```

**After:**
```typescript
hero: {
  headline: 'New Case Study',
  subheading: 'An amazing new project',
  text: 'This is the introduction to the project.',
  imageUrl: ''  // ✅ Added!
}
```

## 🎯 How to See It Now

### For NEW Case Studies
1. **Refresh your browser** (Ctrl+R or F5)
2. Go to Admin Panel
3. Click "Create New Case Study"
4. Enter title
5. Hero section will be enabled by default
6. **✅ You'll now see "Hero Image" upload field!**

### For EXISTING Case Studies
Your existing case study won't have the `imageUrl` field yet. You have 2 options:

#### Option 1: Create a New Case Study (Recommended)
- Just create a new one
- The Hero Image field will appear automatically

#### Option 2: Manually Add imageUrl to Existing Case Study
Run this SQL in Supabase Dashboard:

```sql
-- Update existing case study to add imageUrl field
UPDATE case_study_sections
SET content = jsonb_set(
  content::jsonb,
  '{imageUrl}',
  '""'::jsonb
)
WHERE section_type = 'hero'
AND NOT content::jsonb ? 'imageUrl';
```

Then refresh your browser and edit the case study.

## 📍 Where You'll See It

After the fix, the Hero section will show:

```
☑ Hero
├── Headline
│   [New Case Study____________]
├── Subheading
│   [An amazing new project____]
├── Text
│   [This is the introduction...]
└── Hero Image  ← NEW! You'll see this now!
    [📁 Browse files]
    [or drag and drop]
```

## 🚀 Quick Test

1. **Refresh browser** (F5)
2. **Create new case study**
3. **Look at Hero section**
4. **✅ Hero Image field appears!**
5. **Click "Browse files"**
6. **Upload image**
7. **Save changes**
8. **Go to homepage**
9. **✅ Image displays!**

## 💡 Why This Happened

The code for the Hero Image upload was added to the editor component, but the default data structure for new case studies didn't include the `imageUrl` field. So when the editor tried to render fields from the hero section, it only found:
- headline
- subheading
- text

Now it will also find:
- imageUrl ← And render the upload field!

## 🎉 Result

**After refreshing and creating a new case study, you'll see the Hero Image upload field!**

The field will appear right after the "Text" textarea in the Hero section.

**Refresh your browser now and try it!** 🚀
