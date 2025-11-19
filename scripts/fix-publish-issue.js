import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixPublishIssue() {
  console.log('🔧 Fixing Portfolio Publishing Issue...\n');

  try {
    // This script will help identify and fix common publishing issues
    console.log('📋 Common Publishing Issues and Solutions:\n');

    console.log('1. ❌ "Username required" Error:');
    console.log('   Solution: Go to Profile Settings and set a username');
    console.log('   Location: Admin Panel → Profile Settings → Username field\n');

    console.log('2. ❌ "User not authenticated" Error:');
    console.log('   Solution: Make sure you are logged in');
    console.log('   Location: Admin Panel → Login with your credentials\n');

    console.log('3. ❌ "Failed to load profile settings" Error:');
    console.log('   Solution: Profile will be created automatically');
    console.log('   Action: Refresh the page and try again\n');

    console.log('4. ❌ Publish button disabled/grayed out:');
    console.log('   Solution: Check if username is set');
    console.log('   Action: Set username in Profile Settings first\n');

    console.log('🔧 Automated Fix Attempt:\n');

    // Check if we can connect to database
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 Manual Steps to Fix:');
      console.log('1. Check your .env.local file has correct Supabase credentials');
      console.log('2. Verify Supabase project is running');
      console.log('3. Check RLS policies allow access to user_profiles table');
      return;
    }

    console.log('✅ Database connection successful');

    console.log('\n🎯 Next Steps to Publish Your Portfolio:');
    console.log('1. Open your app in browser');
    console.log('2. Login to admin panel');
    console.log('3. Go to Profile Settings');
    console.log('4. Set a username (e.g., "yourname" or "john-doe")');
    console.log('5. Save settings');
    console.log('6. Go back to admin dashboard');
    console.log('7. Click "Publish Portfolio" button');
    console.log('8. Your portfolio will be live at: https://yourapp.vercel.app/u/yourusername');

    console.log('\n📝 Publishing Requirements Checklist:');
    console.log('✅ User must be logged in');
    console.log('✅ User must have a profile in user_profiles table');
    console.log('✅ Profile must have a username set');
    console.log('✅ Username must be unique (3+ characters, lowercase, numbers, hyphens, underscores only)');
    console.log('✅ Portfolio content (case studies, story, contact) should exist');

    console.log('\n🚀 After Publishing:');
    console.log('- Portfolio status changes from "draft" to "published"');
    console.log('- Public URL becomes accessible without login');
    console.log('- Portfolio appears at /u/yourusername');
    console.log('- You can still edit content in admin panel');
    console.log('- You can unpublish anytime to make it private again');

  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
  }
}

// Run fix
fixPublishIssue().then(() => {
  console.log('\n🏁 Publishing fix guide complete');
  console.log('💡 Follow the steps above to publish your portfolio successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fix crashed:', error);
  process.exit(1);
});