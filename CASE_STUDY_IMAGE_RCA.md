# 🔍 Case Study Image Upload - Root Cause Analysis

## 🐛 Problem

Case studies are showing mock images (picsum.photos) instead of real uploaded images on the homepage.

## 🔍 Root Cause Analysis

### 1. Database Schema ✅
```sql
CREATE TABLE case_studies (
  hero_image_asset_id TEXT REFERENCES assets(asset_id)
  ...
)
```
- ✅ Database has `hero_image_asset_id` field
- ✅ Properly references assets table

### 2. API Query ✅
```typescript
async getProjects(): Promise<Project[]> {
  const { data } = await supabase
    .from('case_studies')
    .select(`
      case_study_id,
      title,
      hero_image_asset_id,
      assets!case_studies_hero_image_asset_id_fkey (cloudinary_url),
      ...
    `)
  
  return data.map(item => ({
    imageUrl: (item.assets as any)?.cloudinary_url || 'https://picsum.photos/400/300',
    ...
  }))
}
```
- ✅ Query joins with assets table correctly
- ✅ Falls back to picsum if no image
- ⚠️  **Fallback is being used because no images are uploaded**

### 3. Case Study Editor UI ❌
```typescript
const SectionEditor: React.FC = ({ sectionName, sectionData, ... }) => {
  // ...
  {Object.keys(sectionData).filter(key => key !== 'enabled').map(field => {
    if (field === 'images') {
      return <ImageUploadInput ... />  // ✅ Gallery images
    }
    // ❌ NO hero image upload field!
    return <FormInput ... />
  })}
}
```

**PROBLEM FOUND:**
- ❌ Hero section only has text fields (headline, subheading, text)
- ❌ NO image upload field in hero section
- ❌ `hero_image_asset_id` is never set
- ❌ Projects always use fallback picsum images

### 4. Case Study Type Definition
```typescript
export interface HeroSection {
  enabled: boolean;
  headline: string;
  subheading: string;
  text: string;
  // ❌ NO imageUrl or imageAssetId field!
}
```

## 📊 Data Flow

### Current (Broken) Flow
```
1. User creates case study
2. Edits hero section (headline, subheading, text)
3. Saves case study
   ❌ hero_image_asset_id = NULL
4. Homepage loads projects
5. Query returns NULL for assets
6. Falls back to picsum.photos
7. ❌ Mock image displayed
```

### Expected (Fixed) Flow
```
1. User creates case study
2. Edits hero section
3. ✅ Uploads hero image
4. Saves case study
   ✅ hero_image_asset_id = uploaded asset ID
5. Homepage loads projects
6. Query returns real cloudinary_url
7. ✅ Real image displayed
```

## 🎯 What Needs to be Fixed

### 1. Update HeroSection Type
Add image fields to the type definition:
```typescript
export interface HeroSection {
  enabled: boolean;
  headline: string;
  subheading: string;
  text: string;
  imageUrl?: string;        // ← ADD THIS
  imageAssetId?: string;    // ← ADD THIS
}
```

### 2. Add Hero Image Upload UI
Add image upload field to hero section editor:
```typescript
// In SectionEditor component
if (sectionName === 'hero') {
  return (
    <>
      <FormInput label="headline" ... />
      <FormInput label="subheading" ... />
      <FormTextarea label="text" ... />
      <ImageUploadInput        // ← ADD THIS
        label="Hero Image"
        images={[sectionData.imageUrl || '']}
        onChange={(urls) => onChange(sectionName, 'imageUrl', urls[0])}
      />
    </>
  )
}
```

### 3. Update Save Logic
Save hero_image_asset_id when saving case study:
```typescript
async updateCaseStudy(caseStudy: CaseStudy) {
  // Find asset_id from imageUrl
  let heroImageAssetId = null;
  if (caseStudy.sections.hero.imageUrl) {
    const { data: asset } = await supabase
      .from('assets')
      .select('asset_id')
      .eq('cloudinary_url', caseStudy.sections.hero.imageUrl)
      .single();
    
    heroImageAssetId = asset?.asset_id || null;
  }
  
  // Save to database
  await supabase
    .from('case_studies')
    .update({
      hero_image_asset_id: heroImageAssetId,  // ← ADD THIS
      ...
    })
}
```

### 4. Update Load Logic
Load hero image when fetching case study:
```typescript
async getCaseStudy(id: string) {
  const { data } = await supabase
    .from('case_studies')
    .select(`
      *,
      assets!case_studies_hero_image_asset_id_fkey (cloudinary_url)
    `)
    .eq('case_study_id', id)
    .single();
  
  return {
    ...data,
    sections: {
      hero: {
        ...data.sections.hero,
        imageUrl: data.assets?.cloudinary_url || '',  // ← ADD THIS
      }
    }
  };
}
```

## 🎯 Summary

**Root Cause:** Hero image upload functionality is completely missing from the case study editor.

**Impact:**
- ❌ No way to upload hero images
- ❌ All projects show mock images
- ❌ Unprofessional appearance
- ❌ hero_image_asset_id always NULL

**Solution:** Add hero image upload field to case study editor and update save/load logic.

## 📝 Files to Modify

1. `types.ts` - Add imageUrl to HeroSection
2. `pages/AdminPage.tsx` - Add hero image upload UI
3. `services/api.ts` - Update save/load logic for hero images

## 🎉 Expected Result

After fix:
- ✅ Hero image upload field in editor
- ✅ Images upload to Cloudinary
- ✅ hero_image_asset_id saved to database
- ✅ Real images display on homepage
- ✅ No more mock images
- ✅ Professional portfolio appearance
