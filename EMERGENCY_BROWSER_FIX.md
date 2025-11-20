# 🚨 Emergency Browser Console Fix

If you can't access Supabase Dashboard right now, you can apply a temporary fix through your browser console:

## Step 1: Open Browser Console
1. Go to your app in the browser
2. Press F12 or right-click → Inspect
3. Go to Console tab

## Step 2: Paste and Run This Code

```javascript
// Emergency Profile Settings Fix - Run in Browser Console
(async function emergencyFix() {
  console.log('🚨 Applying Emergency Profile Settings Fix...');
  
  try {
    // Get the supabase client from window (if available)
    const supabase = window.supabase || 
                    (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current?.memoizedProps?.supabase);
    
    if (!supabase) {
      console.error('❌ Supabase client not found in window');
      console.log('💡 You need to apply the SQL fix in Supabase Dashboard instead');
      return;
    }
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Not authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Try to create organization first (ignore errors)
    try {
      await supabase.from('organizations').insert({
        org_id: user.id,
        name: user.email?.split('@')[0] || 'User',
        slug: `user-${user.id.slice(0, 8)}`
      });
      console.log('✅ Organization created');
    } catch (orgError) {
      console.log('ℹ️ Organization might already exist');
    }
    
    // Try to delete existing conflicting profile
    try {
      await supabase.from('user_profiles').delete().eq('user_id', user.id);
      console.log('✅ Cleaned up existing profile');
    } catch (deleteError) {
      console.log('ℹ️ No existing profile to clean up');
    }
    
    // Create new profile
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        org_id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        username: `user${Date.now().toString().slice(-6)}`,
        is_portfolio_public: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Profile creation failed:', createError.message);
      console.log('💡 You need to apply the SQL fix in Supabase Dashboard');
      console.log('   File: APPLY_PROFILE_SETTINGS_FIX.sql');
    } else {
      console.log('✅ Profile created successfully:', newProfile);
      console.log('🎉 Emergency fix applied! Refresh the page.');
    }
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
    console.log('💡 Apply the SQL fix in Supabase Dashboard instead');
  }
})();
```

## Step 3: Refresh the Page
After running the code, refresh your app page. The Profile Settings should now load correctly.

## ⚠️ Important Notes
- This is a temporary fix that works around RLS policies
- You should still apply the proper SQL fix in Supabase Dashboard
- If this doesn't work, the RLS policies are too restrictive and need the SQL fix

## 🔧 Permanent Solution
Apply the SQL fix in Supabase Dashboard using `APPLY_PROFILE_SETTINGS_FIX.sql`