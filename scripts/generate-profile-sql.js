import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const USER_ID = '1f1a3c1a-e0ff-42a6-910c-930724e7ea5d';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function generateSQL() {
  console.log('🔍 Generating SQL for user profile setup...\n');

  // Try to get user email from auth
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email || 'your-email@example.com';

  console.log('📋 Copy and paste this SQL into your Supabase SQL Editor:\n');
  console.log('=' .repeat(70));
  console.log('');
  console.log('-- Create organization if needed');
  console.log(`INSERT INTO organizations (org_id, name, slug)`);
  console.log(`VALUES ('default-org', 'My Portfolio', 'my-portfolio')`);
  console.log(`ON CONFLICT (org_id) DO NOTHING;`);
  console.log('');
  console.log('-- Create user profile');
  console.log(`INSERT INTO user_profiles (user_id, org_id, email, name, role)`);
  console.log(`VALUES (`);
  console.log(`  '${USER_ID}',`);
  console.log(`  'default-org',`);
  console.log(`  '${email}',`);
  console.log(`  'Portfolio Owner',`);
  console.log(`  'admin'`);
  console.log(`)`);
  console.log(`ON CONFLICT (user_id) DO UPDATE SET`);
  console.log(`  org_id = EXCLUDED.org_id,`);
  console.log(`  name = EXCLUDED.name,`);
  console.log(`  role = EXCLUDED.role,`);
  console.log(`  updated_at = NOW();`);
  console.log('');
  console.log('-- Verify the profile was created');
  console.log(`SELECT * FROM user_profiles WHERE user_id = '${USER_ID}';`);
  console.log('');
  console.log('=' .repeat(70));
  console.log('');
  console.log('📍 Steps:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Click "SQL Editor" in the left sidebar');
  console.log('   4. Click "New Query"');
  console.log('   5. Paste the SQL above');
  console.log('   6. Click "Run" or press Ctrl+Enter');
  console.log('   7. Refresh your admin page');
  console.log('');
  console.log('✅ After running this, all features will be enabled!');
}

generateSQL().catch(console.error);
