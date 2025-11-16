# Schema Status & Fix Guide

## Issue Identified

The diagnostic script revealed that the database schema might not be properly initialized. The application code is correctly using the schema defined in the migrations, but the database tables may not exist yet.

## Current Schema (Correct)

The application uses these table names (from `supabase/migrations/001_initial_schema.sql`):

### Core Tables
- `organizations` - Multi-tenant organization management
- `user_profiles` - User profile data (extends auth.users)
- `assets` - Centralized asset management (Cloudinary)
- `case_studies` - Portfolio projects
- `case_study_sections` - Modular content blocks for case studies
- `section_assets` - Images/documents in sections
- `embed_widgets` - Figma, YouTube, Miro embeds

### Content Sections
- `story_sections` - "My Story" section
- `story_paragraphs` - Paragraphs for story section
- `carousels` - Carousel configuration
- `carousel_slides` - Individual carousel images
- `skill_categories` - Magic Toolbox skill categories
- `skills` - Individual skills within categories
- `tools` - Tools in Magic Toolbox
- `journey_timelines` - Journey timeline configuration
- `journey_milestones` - Individual journey items
- `contact_sections` - Contact section configuration
- `social_links` - Social media links
- `cv_sections` - CV section configuration
- `cv_versions` - Different CV versions (Indian, Europass, Global)
- `ai_configurations` - AI settings (Gemini API key)

### Supporting Tables
- `upload_sessions` - Temporary upload tracking
- `audit_logs` - System audit trail

## How to Fix

### Option 1: Apply Migrations via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_add_icon_url_to_toolbox.sql`
   - `004_add_cv_version_metadata.sql`
   - `005_add_published_field.sql`

### Option 2: Use Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push
```

### Option 3: Run Complete Schema (Fresh Start)

If you want to start fresh, run the `complete-schema.sql` file in the Supabase SQL Editor. This contains all tables and policies in one file.

## Verification

After applying the migrations, run this script to verify:

```bash
node scripts/check-for-issues.js
```

You should see:
```
🎉 All systems operational! No issues found.
```

## Common Issues

### "Table does not exist" errors
- **Cause**: Migrations not applied
- **Fix**: Apply migrations using one of the options above

### "Column does not exist" errors  
- **Cause**: Missing a specific migration (e.g., `published` field)
- **Fix**: Apply migration `005_add_published_field.sql`

### "Could not find the table in the schema cache"
- **Cause**: Supabase needs to refresh its schema cache
- **Fix**: 
  1. Apply migrations
  2. Wait 30 seconds
  3. Try again

## Migration Order (Important!)

Always apply migrations in this order:
1. `001_initial_schema.sql` - Creates all tables
2. `002_rls_policies.sql` - Sets up Row Level Security
3. `003_add_icon_url_to_toolbox.sql` - Adds icon_url column
4. `004_add_cv_version_metadata.sql` - Adds CV metadata
5. `005_add_published_field.sql` - Adds published field to case studies

## Next Steps

Once the schema is applied:
1. Create your user profile (see `SETUP_YOUR_PROFILE.md`)
2. Start adding content through the Admin page
3. All sections should save and load correctly

## Status

✅ Application code is correct
✅ Migration files are correct
⚠️  Database needs migrations applied

The application is ready to use once the database schema is properly initialized!
