# User Profile Fix

## Problem
The admin sections (Journey, CV, Contact, etc.) were failing with a 406 error because the user profile was missing from the database.

## What Was Fixed

### 1. Added Error Handling in API Service
- Created a `getUserOrgId()` helper function that safely retrieves the user's organization ID
- Updated all API functions to handle missing user profiles gracefully
- Functions now return default/mock data instead of crashing when profile is missing

### 2. Functions Updated
- `getMyJourney()` - Journey management
- `getCVSection()` - CV downloads
- `getMyStory()` - Story section
- `getAISettings()` - AI configuration
- `getMagicToolbox()` - Skills and tools
- `getContactSection()` - Contact information

## How to Fix Your User Profile

### Option 1: Run the Setup Script (Recommended)
```bash
node scripts/setup-user-profile-simple.js
```

This script will:
1. Check if you're logged in
2. Create an organization if needed
3. Create your user profile with admin role

### Option 2: Manual Database Setup
If you have access to Supabase dashboard:

1. Go to your Supabase project
2. Open the SQL Editor
3. Run this query (replace USER_ID with your actual user ID):

```sql
-- Create organization if it doesn't exist
INSERT INTO organizations (org_id, name, slug)
VALUES (gen_ulid(), 'My Portfolio', 'my-portfolio')
ON CONFLICT DO NOTHING;

-- Create user profile
INSERT INTO user_profiles (profile_id, user_id, org_id, name, role)
SELECT 
  gen_ulid(),
  'YOUR_USER_ID_HERE',
  (SELECT org_id FROM organizations LIMIT 1),
  'Your Name',
  'admin';
```

## Testing the Fix

1. Refresh your admin page
2. Try opening different sections (Journey, CV, Contact, etc.)
3. You should now see default data instead of errors
4. You can start adding your own content

## What Happens Now

- If your user profile exists: Everything works normally
- If your user profile is missing: You'll see default/demo data
- No more 406 errors or crashes
- All sections load gracefully

## Next Steps

1. Run the setup script to create your profile
2. Refresh the admin page
3. Start customizing your portfolio content
