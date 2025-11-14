# 🗄️ Manual Database Setup

Since we need your database password for automated deployment, here's how to set up your database manually:

## **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `djbdwbkhnrdnjreigtfz`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**

## **Step 2: Run Initial Schema**

Copy and paste the following SQL into the editor and click **"Run"**:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (multi-tenant support)
CREATE TABLE organizations (
  org_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(org_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Central asset management
CREATE TABLE assets (
  asset_id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES organizations(org_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cloudinary_public_id TEXT UNIQUE NOT NULL,
  cloudinary_url TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'document', 'video')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Studies (main portfolio projects)
CREATE TABLE case_studies (
  case_study_id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES organizations(org_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  template TEXT DEFAULT 'default' CHECK (template IN ('default', 'ghibli', 'modern')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  hero_image_asset_id TEXT REFERENCES assets(asset_id) ON DELETE SET NULL,
  content_html TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Case Study Sections (modular content blocks)
CREATE TABLE case_study_sections (
  section_id TEXT PRIMARY KEY,
  case_study_id TEXT REFERENCES case_studies(case_study_id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'overview', 'problem', 'process', 'showcase', 'reflection', 'gallery', 'document', 'video', 'figma', 'miro', 'links')),
  title TEXT,
  content TEXT,
  enabled BOOLEAN DEFAULT true,
  order_key TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue with remaining tables...
-- (Copy the rest from supabase/migrations/001_initial_schema.sql)
```

## **Step 3: Quick Setup Alternative**

If you prefer, I can create a simplified setup script. Would you like me to:

1. **Create a simple setup script** that you can run with your database password
2. **Provide the complete SQL** in smaller chunks
3. **Help you get your database password** from Supabase settings

## **Step 4: Test Connection**

After running the schema, test the connection:

```bash
node scripts/setup-supabase.js
```

---

**Which approach would you prefer?** Let me know and I'll help you get the database set up quickly!