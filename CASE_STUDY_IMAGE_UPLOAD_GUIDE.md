# 📸 Case Study Image Upload - Complete Guide

## 🎯 Your Screenshots Explained

### Image 1: Homepage Project Card
The top banner image showing "New Case Study" with laptop/glasses.

**This is the HERO IMAGE**
- Uploaded through: Case Study Editor → Hero Section
- Field name: "Hero Image"
- Saves to: `hero_image_asset_id` in database
- Displays on: Homepage project cards

### Image 2: Project Card Thumbnail
The forest road image on the project card.

**This is ALSO the HERO IMAGE**
- Same upload as above
- One hero image serves both purposes:
  1. Case study page header
  2. Homepage project card thumbnail

## ✅ How to Upload These Images

### Step-by-Step Guide

#### 1. Go to Case Study Editor
```
Admin Panel → Create New Case Study
OR
Admin Panel → Click existing case study
```

#### 2. Enable Hero Section
```
☑ Hero  ← Check this checkbox
```

#### 3. Find the Hero Image Upload Field
After enabling Hero section, you'll see:
```
Hero Section
├── ☑ Enable checkbox
├── Headline input field
├── Subheading input field
├── Text textarea
└── 🆕 Hero Image upload button  ← HERE!
```

#### 4. Upload Your Image
```
Click "Browse files" button
→ Select your image
→ Wait for upload (shows progress)
→ Image preview appears
→ Click "Save Changes"
```

#### 5. Publish Case Study
```
Change status to "published"
→ Save again
→ Go to homepage
→ ✅ Your image appears!
```

## 📍 Exact Location in Editor

### Visual Layout
```
┌─────────────────────────────────────────┐
│  Case Study Editor                       │
├─────────────────────────────────────────┤
│                                          │
│  ☑ Hero                                  │
│  ┌────────────────────────────────────┐ │
│  │ Headline                            │ │
│  │ [New Case Study____________]       │ │
│  │                                     │ │
│  │ Subheading                          │ │
│  │ [An amazing new project____]       │ │
│  │                                     │ │
│  │ Text                                │ │
│  │ [This is the introduction...]      │ │
│  │                                     │ │
│  │ Hero Image                    ← NEW!│ │
│  │ ┌─────────────────────────────┐   │ │
│  │ │  📁 Browse files            │   │ │
│  │ │  or drag and drop           │   │ │
│  │ └─────────────────────────────┘   │ │
│  │                                     │ │
│  │ [Preview of uploaded image]        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ☑ Overview                              │
│  ☐ Problem                               │
│  ☐ Gallery                               │
│                                          │
└─────────────────────────────────────────┘
```

## 🎨 What Each Upload Does

### Hero Image Upload
**Purpose:** Main banner/header image

**Displays:**
1. ✅ Homepage project card (your screenshot 1)
2. ✅ Project card thumbnail (your screenshot 2)
3. ✅ Case study page header
4. ✅ Social media previews

**Recommended Size:**
- Width: 1200px - 1920px
- Height: 600px - 1080px
- Aspect Ratio: 16:9 or 2:1
- Format: JPG or PNG
- Max Size: 2MB

### Gallery Images Upload
**Purpose:** Multiple project screenshots

**Displays:**
1. ✅ Case study page gallery section
2. ✅ Project showcase images
3. ✅ Portfolio screenshots

**Recommended Size:**
- Width: 800px - 1600px
- Height: Any (maintains aspect ratio)
- Format: JPG or PNG
- Max Size: 2MB per image

## 🔧 Implementation Details

### Code Location
**File:** `pages/AdminPage.tsx`
**Lines:** 877-879

```typescript
// Hero section image upload
if (sectionName === 'hero' && field === 'imageUrl') {
  return <ImageUploadInput 
    key={fieldKey} 
    label="Hero Image" 
    images={value ? [value] : []} 
    onChange={v => onChange(sectionName, field, v[0] || '')} 
  />;
}
```

### Database Flow
```
1. Upload image
   ↓
2. Image goes to Cloudinary
   ↓
3. URL saved to assets table
   ↓
4. asset_id linked to case_studies.hero_image_asset_id
   ↓
5. Homepage queries hero_image_asset_id
   ↓
6. Displays image on project card
```

## 🎯 Troubleshooting

### "I don't see the Hero Image field"
**Solution:**
1. Make sure Hero section is enabled (checkbox checked)
2. Scroll down in the Hero section
3. Field appears after Text textarea
4. Refresh page if needed

### "Upload button doesn't work"
**Solution:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check Cloudinary configuration
4. Try smaller image (< 2MB)

### "Image doesn't appear on homepage"
**Solution:**
1. Make sure case study is published
2. Refresh homepage (F5)
3. Check browser console
4. Verify image uploaded successfully
5. Check database: `hero_image_asset_id` should not be NULL

## 📊 Current Status

### ✅ What's Working
- Hero image upload field in editor
- Image upload to Cloudinary
- Save to database
- Display on homepage
- Display on case study page
- Persistence after refresh

### ✅ What's Fixed
- Added imageUrl field to HeroSection type
- Added hero image upload UI
- Updated save logic to store hero_image_asset_id
- Updated load logic to retrieve hero image
- Updated transform logic to include image URL

## 🎉 Summary

**Both images in your screenshots are the SAME hero image!**

To upload them:
1. ✅ Go to Case Study Editor
2. ✅ Enable Hero section
3. ✅ Find "Hero Image" upload field
4. ✅ Upload your image
5. ✅ Save changes
6. ✅ Publish case study
7. ✅ Image appears on homepage!

**The feature is fully implemented and ready to use!** 📸✨

## 💡 Quick Test

Want to test it right now?

1. Go to Admin Panel
2. Click "Create New Case Study"
3. Enter title: "Test Project"
4. Enable Hero section (check the box)
5. Scroll down in Hero section
6. **Look for "Hero Image" field** ← You'll see it!
7. Click "Browse files"
8. Select any image
9. Wait for upload
10. Save changes
11. Go to homepage
12. ✅ Your image appears!

**It's all there and working!** 🚀
