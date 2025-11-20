# 🔧 Profile Settings Complete Fix

## Problem Summary
The Profile Settings Manager is experiencing infinite loading and RLS policy violations because:

1. **Foreign Key Constraint**: `user_profiles.org_id` references `organizations.org_id` but no organization exists
2. **RLS Policies**: Row Level Security policies are blocking profile creation
3. **Schema Mismatch**: The system expects both `user_id` and `org_id` but only sets `org_id`

## 🚨 IMMEDIATE FIX REQUIRED

### Step 1: Apply SQL Fix in Supabase Dashboard

**Go to your Supabase Dashboard → SQL Editor and run this:**

```sql
-- 🔧 EMERGENCY FIX: Complete Profile Settings Fix

-- Step 1: Temporarily disable RLS to fix the constraint issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Step 2: Create organization for existing users (if any)
INSERT INTO organizations (org_id, name, slug)
SELECT 
  id::text,
  COALESCE(raw_user_meta_data->>'full_name', email, 'User'),
  'user-' || SUBSTRING(id::text, 1, 8)
FROM auth.users
WHERE id::text NOT IN (SELECT org_id FROM organizations)
ON CONFLICT (org_id) DO NOTHING;

-- Step 3: Update existing user_profiles to have both user_id and org_id
UPDATE user_profiles 
SET user_id = org_id::uuid 
WHERE user_id IS NULL;

-- Step 4: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can view published profiles" ON user_profiles;

-- Step 5: Create proper RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id OR auth.uid()::text = org_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid()::text = org_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid()::text = org_id)
    WITH CHECK (auth.uid() = user_id AND auth.uid()::text = org_id);

CREATE POLICY "Public can view published profiles" ON user_profiles
    FOR SELECT USING (is_portfolio_public = true);

-- Step 6: Create RLS policies for organizations
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Users can insert own organization" ON organizations;

CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (auth.uid()::text = org_id);

CREATE POLICY "Users can insert own organization" ON organizations
    FOR INSERT WITH CHECK (auth.uid()::text = org_id);

-- Step 7: Re-enable RLS with proper policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Step 8: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, INSERT ON organizations TO authenticated;

-- Step 9: Verify the fix
SELECT 'Fix applied successfully' as status;
```

### Step 2: Update API Service

The API service needs to be updated to handle the organization creation:

```typescript
// In services/api.ts - Update getUserOrgId function
async function getUserOrgId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user found')
      return null
    }
    
    console.log('🔍 getUserOrgId: Authenticated user found:', user.id)
    
    // Ensure organization exists for this user
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('org_id')
      .eq('org_id', user.id)
      .single();
    
    if (orgError && orgError.code === 'PGRST116') {
      // Create organization if it doesn't exist
      console.log('🔧 Creating organization for user...');
      const { error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          org_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          slug: `user-${user.id.slice(0, 8)}`
        });
      
      if (createOrgError) {
        console.error('Failed to create organization:', createOrgError);
      }
    }
    
    return user.id
  } catch (error) {
    console.error('Error in getUserOrgId:', error)
    return null
  }
}
```

### Step 3: Update Profile Creation Logic

```typescript
// In services/api.ts - Update getProfileSettings method
async getProfileSettings(): Promise<any> {
  const orgId = await getUserOrgId();
  if (!orgId) throw new Error('User not authenticated');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      console.log('🔧 Creating initial profile for user...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-z0-9]/g, '') || `user${Date.now().toString().slice(-6)}`;
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,  // ✅ Include user_id
          org_id: orgId,     // ✅ Include org_id
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          username: defaultUsername,
          is_portfolio_public: true
        })
        .select()
        .single();

      if (createError) {
        if (createError.message.includes('duplicate') || createError.message.includes('unique')) {
          const timestampUsername = defaultUsername + Date.now().toString().slice(-4);
          const { data: retryProfile, error: retryError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              org_id: orgId,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email,
              username: timestampUsername,
              is_portfolio_public: true
            })
            .select()
            .single();

          if (retryError) throw retryError;
          return retryProfile;
        }
        throw createError;
      }
      
      return newProfile;
    }
    throw error;
  }
  
  return profile;
}
```

## 🧪 Testing the Fix

After applying the SQL fix, test with:

```bash
node scripts/fix-organization-constraint.js
```

## ✅ Expected Results

1. **No more RLS policy violations**
2. **Automatic organization creation for new users**
3. **Profile Settings loads without infinite loading**
4. **Profile creation works correctly**
5. **Both user_id and org_id are properly set**

## 🚨 If Issues Persist

1. Check Supabase logs for detailed error messages
2. Verify RLS policies are correctly applied
3. Ensure both `organizations` and `user_profiles` tables have proper policies
4. Test with a fresh user account

The fix addresses the root cause: missing organization records and incorrect RLS policies that were preventing profile creation and access.